package plugin

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/grafana-plugin-sdk-go/data"
)

// Make sure the datasource implements required interfaces. This is important to do
// since otherwise we will only get a not implemented error response from plugin in
// runtime. We implement backend.QueryDataHandler,
// backend.CheckHealthHandler interfaces. Plugin should not
// implement all these interfaces - only those which are required for a particular task.
// For example if plugin does not need streaming functionality then you are free to remove
// methods that implement backend.StreamHandler. Implementing instancemgmt.InstanceDisposer
// is useful to clean up resources used by previous datasource instance when a new datasource
// instance created upon datasource settings changed.
var (
	_ backend.QueryDataHandler      = (*DataSetDatasource)(nil)
	_ backend.CheckHealthHandler    = (*DataSetDatasource)(nil)
	_ backend.CallResourceHandler   = (*DataSetDatasource)(nil)
	_ instancemgmt.InstanceDisposer = (*DataSetDatasource)(nil)
)

func NewDataSetDatasource(settings backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
	type jsonData struct {
		ScalyrUrl string `json:"scalyrUrl"`
	}
	var unsecure jsonData
	err := json.Unmarshal(settings.JSONData, &unsecure)
	if err != nil {
		log.DefaultLogger.Warn("error marshalling", "err", err)
		return nil, err
	}
	url := unsecure.ScalyrUrl
	if strings.HasSuffix(url, "/") {
		url = url[:len(url)-1]
	}

	secure := settings.DecryptedSecureJSONData

	return &DataSetDatasource{
		dataSetClient: NewDataSetClient(url, secure["apiKey"]),
	}, nil
}

type DataSetDatasource struct {
	dataSetClient *DataSetClient
}

// Dispose here tells plugin SDK that plugin wants to clean up resources when a new instance
// created. As soon as datasource settings change detected by SDK old datasource instance will
// be disposed and a new one will be created using NewDataSetDatasource factory function.
func (d *DataSetDatasource) Dispose() {
	// Clean up datasource instance resources.
}

// QueryData handles multiple queries and returns multiple responses.
// req contains the queries []DataQuery (where each query contains RefID as a unique identifier).
// The QueryDataResponse contains a map of RefID to the response for each query, and each response
// contains Frames ([]*Frame).
func (d *DataSetDatasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {

	// create response struct
	response := backend.NewQueryDataResponse()

	// loop over queries and execute them individually.
	for _, q := range req.Queries {
		res := d.query(ctx, req.PluginContext, q)

		// save the response in a hashmap
		// based on with RefID as identifier
		response.Responses[q.RefID] = res
	}

	return response, nil
}

type filterModal struct {
	QueryVariable string `json:"queryVariable"`
}

func (d *DataSetDatasource) CallResource(ctx context.Context, req *backend.CallResourceRequest, sender backend.CallResourceResponseSender) error {
	var fm filterModal
	err := json.Unmarshal(req.Body, &fm)
	if err != nil {
		return sender.Send(&backend.CallResourceResponse{
			Status: http.StatusBadRequest,
		})
	}
	switch req.Path {
	case "facet-query":
		request := FacetQuery{
			QueryType: "FACET_VALUES",
			FacetValues: &FacetOptions{
				Name:      fm.QueryVariable,
				MaxValues: "100",
			},
		}
		result, _ := d.dataSetClient.DoFacetValuesRequest(request)
		facetResultData := FacetList{}
		err := json.Unmarshal(result.Data, &facetResultData)
		if err != nil {
			log.DefaultLogger.Warn("error unmarshaling response from DataSet", "err", err)
			return sender.Send(&backend.CallResourceResponse{
				Status: http.StatusNotFound,
			})
		}
		finalResponse := make([]string, len(facetResultData.Facet.Values))
		for i, val := range facetResultData.Facet.Values {
			log.DefaultLogger.Warn("facetResultData", val.Value, val.Value)
			finalResponse[i] = val.Value
		}
		pb := &FacetResponse{Value: finalResponse}
		jsonStr, err := json.Marshal(pb)
		if err != nil {
			log.DefaultLogger.Warn("could not marshal JSON: %s", err)
		}
		return sender.Send(&backend.CallResourceResponse{
			Status: http.StatusOK,
			Body:   jsonStr,
		})
	default:
		return sender.Send(&backend.CallResourceResponse{
			Status: http.StatusNotFound,
		})
	}
}

type queryModel struct {
	Expression string `json:"expression"`
	QueryType  string `json:"queryType"`
	Format     string `json:"format"`
}

func (d *DataSetDatasource) query(_ context.Context, pCtx backend.PluginContext, query backend.DataQuery) backend.DataResponse {
	// Unmarshal the JSON into our queryModel.
	var qm queryModel
	response := backend.DataResponse{}
	log.DefaultLogger.Warn("error unmarshaling response from DataSet", query.JSON)
	response.Error = json.Unmarshal(query.JSON, &qm)
	if response.Error != nil {
		return response
	}
	buckets := int64(float64(query.TimeRange.To.Unix()-query.TimeRange.From.Unix()) / (query.Interval.Seconds()))
	if buckets > 5000 {
		buckets = 5000
	}
	if buckets < 1 {
		buckets = 1
	}
	var request LRQRequest
	if qm.QueryType == "Power Query" {
		request = LRQRequest{
			QueryType: PQ,
			StartTime: query.TimeRange.From.Unix(),
			EndTime:   query.TimeRange.To.Unix(),
			Pq: &PQOptions{
				Query:      qm.Expression,
				ResultType: TABLE,
			},
		}
	} else {
		request = LRQRequest{
			QueryType: PLOT,
			StartTime: query.TimeRange.From.Unix(),
			EndTime:   query.TimeRange.To.Unix(),
			Plot: &PlotOptions{
				Expression: qm.Expression,
				Slices:     buckets,
				Frequency:  HIGH,
				AutoAlign:  true,
			},
		}
	}

	result, _ := d.dataSetClient.DoLRQRequest(request)
	if qm.QueryType == "Power Query" {
		return displayPQData(result, response)
	} else {
		return displayPlotData(result, response)
	}
	// return response
}

func displayPlotData(result LRQResult, response backend.DataResponse) backend.DataResponse {
	resultData := PlotResultData{}
	err := json.Unmarshal(result.Data, &resultData)
	if err != nil {
		log.DefaultLogger.Warn("error unmarshaling response from DataSet", "err", err)
		return response
	}
	if len(resultData.Plots) < 1 {
		// No usable data
		return response
	}
	// create data frame response.
	frame := data.NewFrame("response")

	times := make([]time.Time, len(resultData.XAxis))
	values := make([]float64, len(resultData.XAxis))
	for index, value := range resultData.XAxis {
		values[index] = resultData.Plots[0].Samples[index] // TODO: handle multiple PlotData objects for Breakdown graphs
		log.DefaultLogger.Warn("value:   ", "value", value)
		times[index] = time.Unix(value/1000, 0) // TODO: we lose the precision of milliseconds here, is this fine?
		log.DefaultLogger.Warn("times[index]:   ", "times[index]", times[index])
	}

	// add fields.
	log.DefaultLogger.Warn("values:  ", "values", values)
	frame.Fields = append(frame.Fields,
		data.NewField("time", nil, times),
		data.NewField("values", nil, values),
	)

	// add the frames to the response.
	response.Frames = append(response.Frames, frame)
	return response
}

func displayPQData(result LRQResult, response backend.DataResponse) backend.DataResponse {
	resultData := TableResultData{}

	err := json.Unmarshal(result.Data, &resultData)
	if err != nil {
		return response
	}
	if len(resultData.Columns) < 1 {
		return response
	}
	frame := data.NewFrame("response")

	for idx, col := range resultData.Columns {
		switch val := col.Type; {
		case val == "TIMESTAMP":
			tmp := make([]time.Time, len(resultData.Values))
			for j, b := range resultData.Values {
				timeInInt := int64(b[idx].(float64))
				tmp[j] = time.Unix(timeInInt/1000000000, 0)
			}
			frame.Fields = append(frame.Fields,
				data.NewField(col.Name, nil, tmp),
			)
			break
		case val == "PERCENTAGE":
			tmp := make([]string, len(resultData.Values))
			for j, b := range resultData.Values {
				tmp[j] = strconv.Itoa(b[idx].(int))
			}
			frame.Fields = append(frame.Fields,
				data.NewField(col.Name, nil, tmp),
			)
			break
		case val == "NUMBER" && col.DecimalPlaces > 0:
			tmp := make([]float64, len(resultData.Values))
			for j, b := range resultData.Values {
				switch b[idx].(type) {
				case float32:
					tmp[j] = float64(b[idx].(float32))
					break
				default:
					tmp[j] = b[idx].(float64)
				}
			}
			frame.Fields = append(frame.Fields,
				data.NewField(col.Name, nil, tmp),
			)
			break
		case val == "NUMBER" && col.DecimalPlaces <= 0:
			tmp := make([]int64, len(resultData.Values))
			for j, b := range resultData.Values {
				switch b[idx].(type) {
				case int:
					tmp[j] = int64(b[idx].(int))
					break
				case int16:
					tmp[j] = int64(b[idx].(int16))
					break
				case int32:
					tmp[j] = int64(b[idx].(int32))
					break
				case float32:
					tmp[j] = int64(b[idx].(float32))
					break
				case float64:
					tmp[j] = int64(b[idx].(float64))
					break
				default:
					tmp[j] = b[idx].(int64)
				}
			}
			frame.Fields = append(frame.Fields,
				data.NewField(col.Name, nil, tmp),
			)
			break
		default:
			tmp := make([]string, len(resultData.Values))
			for j, b := range resultData.Values {
				switch b[idx].(type) {
				case string:
					tmp[j] = b[idx].(string)
					break
				case bool:
					if w, ok := b[idx].(bool); ok {
						tmp[j] = strconv.FormatBool(w)
					}
					break
				default:

				}
			}
			frame.Fields = append(frame.Fields,
				data.NewField(col.Name, nil, tmp),
			)
		}
	}
	response.Frames = append(response.Frames, frame)
	return response
}

// CheckHealth handles health checks sent from Grafana to the plugin.
// The main use case for these health checks is the test button on the
// datasource configuration page which allows users to verify that
// a datasource is working as expected.
func (d *DataSetDatasource) CheckHealth(_ context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	// currentTime := time.Now().UnixNano()
	request := FacetRequest{
		QueryType: "facet",
		MaxCount:  1,
		Field:     "test",
	}
	statusCode := d.dataSetClient.DoFacetRequest(request)

	if statusCode != 200 {
		return &backend.CheckHealthResult{
			Status:  backend.HealthStatusError,
			Message: fmt.Sprintf("DataSet returned response code %d", statusCode),
		}, nil
	}

	return &backend.CheckHealthResult{
		Status:  backend.HealthStatusOk,
		Message: "Successfully connected to DataSet",
	}, nil
}

func (d *DataSetDatasource) CollectMetrics(_ context.Context, req *backend.CollectMetricsRequest) (*backend.CollectMetricsResult, error) {
	var prometheusMetrics []byte
	return &backend.CollectMetricsResult{
		PrometheusMetrics: prometheusMetrics,
	}, nil
}
