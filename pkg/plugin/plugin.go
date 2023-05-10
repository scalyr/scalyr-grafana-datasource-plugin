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
	url := strings.TrimSuffix(unsecure.ScalyrUrl, "/")

	apiKey, ok := settings.DecryptedSecureJSONData["apiKey"]
	if !ok {
		return nil, errors.New("apiKey not found")
	}

	return &DataSetDatasource{
		dataSetClient: NewDataSetClient(url, apiKey),
	}, nil
}

type DataSetDatasource struct {
	dataSetClient DataSetClient
}

// Dispose here tells plugin SDK that plugin wants to clean up resources when a new instance
// created. As soon as datasource settings change detected by SDK old datasource instance will
// be disposed and a new one will be created using NewDataSetDatasource factory function.
func (d *DataSetDatasource) Dispose() {
}

// QueryData handles multiple queries and returns multiple responses.
// req contains the queries []DataQuery (where each query contains RefID as a unique identifier).
// The QueryDataResponse contains a map of RefID to the response for each query, and each response
// contains Frames ([]*Frame).
func (d *DataSetDatasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	response := backend.NewQueryDataResponse()
	for _, q := range req.Queries {
		response.Responses[q.RefID] = d.query(ctx, q)
	}
	return response, nil
}

type queryModel struct {
	Expression          string   `json:"expression"`
	QueryType           string   `json:"queryType"`
	Format              string   `json:"format"`
	BreakDownFacetValue *string  `json:"breakDownFacetValue"`
	Label               *string  `json:"label"`
	AccountEmails       []string `json:"accountEmails"`
}

func (d *DataSetDatasource) query(ctx context.Context, query backend.DataQuery) backend.DataResponse {
	response := backend.DataResponse{}

	// Unmarshal the JSON into our queryModel.
	var qm queryModel

	response.Error = json.Unmarshal(query.JSON, &qm)
	if response.Error != nil {
		return response
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
		// The breakdown facet from the query may be null or the empty string.
		// Avoid having the DataSet LRQ api attempt to treat the empty string as facet.
		var breakdownFacet *string
		if qm.BreakDownFacetValue != nil && len(*qm.BreakDownFacetValue) > 0 {
			breakdownFacet = qm.BreakDownFacetValue
		}

		// Setting the LRQ api's autoAlign would override the data points requested by the user (via query options).
		// The query options support explicitly specifying data points (MaxDataPoints) or implicitly via time range and interval.
		slices := int64(query.TimeRange.Duration() / query.Interval)
		if slices > query.MaxDataPoints {
			slices = query.MaxDataPoints
		}
		if slices > 10000 {
			slices = 10000
		}

		request = LRQRequest{
			QueryType: PLOT,
			StartTime: query.TimeRange.From.Unix(),
			EndTime:   query.TimeRange.To.Unix(),
			Plot: &PlotOptions{
				Expression:     qm.Expression,
				Slices:         slices,
				Frequency:      HIGH,
				BreakdownFacet: breakdownFacet,
			},
		}
	}

	if qm.AccountEmails != nil && len(qm.AccountEmails) > 0 {
		request.AccountEmails = qm.AccountEmails
	}

	var result *LRQResult
	result, response.Error = d.dataSetClient.DoLRQRequest(ctx, request)
	if response.Error != nil {
		return response
	}

	if qm.QueryType == "Power Query" {
		return displayPQData(result, response)
	} else {
		return displayPlotData(qm.Label, result, response)
	}
}

func displayPlotData(label *string, result *LRQResult, response backend.DataResponse) backend.DataResponse {
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

		var panelLabel string
		if plot.Label != "" { // Breakdown facet
			panelLabel = plot.Label
		} else if label != nil && *label != "" { // User-specified label
			panelLabel = *label
		}

		frame.Fields = append(frame.Fields,
			data.NewField("", map[string]string{"app": panelLabel}, make([]float64, len(resultData.XAxis))),
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
func (d *DataSetDatasource) CheckHealth(ctx context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	statusCode, err := d.dataSetClient.DoFacetRequest(ctx, FacetRequest{
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
			Message: "Failed to connect to DataSet, please inspect the Grafana server log for details",
		}, nil
	}

	return &backend.CheckHealthResult{
		Status:  backend.HealthStatusOk,
		Message: "Successfully connected to DataSet",
	}, nil
}
