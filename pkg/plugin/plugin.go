package plugin

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"strings"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/grafana-plugin-sdk-go/data"
)

func NewDataSetDatasource(settings backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
	var unsecure struct {
		ScalyrUrl string `json:"scalyrUrl"`
	}
	if err := json.Unmarshal(settings.JSONData, &unsecure); err != nil {
		return nil, err
	}
	url := unsecure.ScalyrUrl
	if strings.HasSuffix(url, "/") {
		url = url[:len(url)-1]
	}

	apiKey, ok := settings.DecryptedSecureJSONData["apiKey"]
	if !ok {
		return nil, errors.New("apiKey not found")
	}

	return &DataSetDatasource{
		dataSetClient: NewDataSetClient(url, apiKey),
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

type queryModel struct {
	Expression          string  `json:"expression"`
	QueryType           string  `json:"queryType"`
	Format              string  `json:"format"`
	BreakDownFacetValue *string `json:"breakDownFacetValue"`
}

func (d *DataSetDatasource) query(_ context.Context, pCtx backend.PluginContext, query backend.DataQuery) backend.DataResponse {
	response := backend.DataResponse{}

	// Unmarshal the JSON into our queryModel.
	var qm queryModel

	response.Error = json.Unmarshal(query.JSON, &qm)
	if response.Error != nil {
		return response
	}

	buckets := int64(query.TimeRange.Duration().Seconds() / query.Interval.Seconds())
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
		if len(qm.Expression) > 0 {
			request = LRQRequest{
				QueryType: PLOT,
				StartTime: query.TimeRange.From.Unix(),
				EndTime:   query.TimeRange.To.Unix(),
				Plot: &PlotOptions{
					Expression:     qm.Expression,
					Slices:         buckets,
					Frequency:      HIGH,
					AutoAlign:      true,
					BreakdownFacet: qm.BreakDownFacetValue,
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
	}

	var result *LRQResult
	result, response.Error = d.dataSetClient.DoLRQRequest(request)
	if response.Error != nil {
		return response
	}

	if qm.QueryType == "Power Query" {
		return displayPQData(result, response)
	} else {
		return displayPlotData(result, response)
	}
}

func displayPlotData(result *LRQResult, response backend.DataResponse) backend.DataResponse {
	resultData := PlotResultData{}

	response.Error = json.Unmarshal(result.Data, &resultData)
	if response.Error != nil {
		log.DefaultLogger.Error("error unmarshaling response from DataSet", "err", response.Error)
		return response
	}
	if len(resultData.Plots) < 1 {
		return response
	}

	frame := data.NewFrame("response")

	for i, plot := range resultData.Plots {
		if i == 0 {
			frame.Fields = append(frame.Fields,
				data.NewField("time", nil, make([]time.Time, len(resultData.XAxis))),
			)
		}
		frame.Fields = append(frame.Fields,
			data.NewField("", map[string]string{"app": plot.Label}, make([]float64, len(resultData.XAxis))),
		)
		for pIdx, point := range plot.Samples {
			if i == 0 {
				sec := resultData.XAxis[pIdx] / 1000
				nsec := (resultData.XAxis[pIdx] % 1000) * 1000000
				frame.Set(i, pIdx, time.Unix(sec, nsec))
			}
			frame.Set(i+1, pIdx, point)
		}
	}

	response.Frames = append(response.Frames, frame)
	return response
}

func displayPQData(result *LRQResult, response backend.DataResponse) backend.DataResponse {
	resultData := TableResultData{}

	response.Error = json.Unmarshal(result.Data, &resultData)
	if response.Error != nil {
		return response
	}
	if len(resultData.Values) < 1 {
		return response
	}

	frame := data.NewFrame("response")

	// Iterate over the data to modify the result into dataframe acceptable format
	for idx, col := range resultData.Columns {
		if cellType := col.Type; cellType == TIMESTAMP {
			res := make([]time.Time, len(resultData.Values))
			for i, val := range resultData.Values {
				if w, ok := val[idx].(float64); ok {
					sec := int64(w / 1000000000)
					nsec := int64(math.Mod(w, 1000000000))
					res[i] = time.Unix(sec, nsec)
				}
			}
			frame.Fields = append(frame.Fields,
				data.NewField(col.Name, nil, res),
			)
		} else if cellType == PERCENTAGE {
			res := make([]string, len(resultData.Values))
			for i, val := range resultData.Values {
				if w, ok := val[idx].(int); ok {
					res[i] = fmt.Sprintf("%d%%", w)
				}
			}
			frame.Fields = append(frame.Fields,
				data.NewField(col.Name, nil, res),
			)
		} else if cellType == NUMBER && col.DecimalPlaces > 0 {
			res := make([]float64, len(resultData.Values))
			for i, val := range resultData.Values {
				switch val[idx].(type) {
				case float32:
					res[i] = float64(val[idx].(float32))
				case float64:
					res[i] = val[idx].(float64)
				case string:
					if val[idx] == "Infinity" {
						res[i] = math.Inf(1)
					} else if val[idx] == "-Infinity" {
						res[i] = math.Inf(-1)
					} else if val[idx] == "NaN" {
						res[i] = math.NaN()
					}
				}
			}
			frame.Fields = append(frame.Fields,
				data.NewField(col.Name, nil, res),
			)
		} else if cellType == NUMBER && col.DecimalPlaces <= 0 {
			res := make([]int64, len(resultData.Values))
			for i, val := range resultData.Values {
				switch val[idx].(type) {
				case int:
					res[i] = int64(val[idx].(int))
				case int16:
					res[i] = int64(val[idx].(int16))
				case int32:
					res[i] = int64(val[idx].(int32))
				case int64:
					res[i] = val[idx].(int64)
				case float32:
					res[i] = int64(val[idx].(float32))
				case float64:
					res[i] = int64(val[idx].(float64))
				}
			}
			frame.Fields = append(frame.Fields,
				data.NewField(col.Name, nil, res),
			)
		} else {
			res := make([]string, len(resultData.Values))
			for i, val := range resultData.Values {
				res[i] = fmt.Sprintf("%v", val[idx])
			}
			frame.Fields = append(frame.Fields,
				data.NewField(col.Name, nil, res),
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
	statusCode, err := d.dataSetClient.DoFacetRequest(FacetRequest{
		QueryType: "facet",
		MaxCount:  1,
		Field:     "test",
	})
	if err != nil {
		return nil, err
	}

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
