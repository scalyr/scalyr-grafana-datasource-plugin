package plugin

import (
	"context"
	"encoding/json"
	"time"
    "strings"
    "fmt"

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
	log.DefaultLogger.Info("QueryData called", "request", req)

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
    Expression string `json:"expression"`
}

func (d *DataSetDatasource) query(_ context.Context, pCtx backend.PluginContext, query backend.DataQuery) backend.DataResponse {
    // Unmarshal the JSON into our queryModel.
	var qm queryModel
    response := backend.DataResponse{}

	response.Error = json.Unmarshal(query.JSON, &qm)
	if response.Error != nil {
		return response
	}
    buckets := int64(float64(query.TimeRange.To.Unix() - query.TimeRange.From.Unix()) / (query.Interval.Seconds()))
    if buckets > 5000 {
        buckets = 5000
    }
    if buckets < 1 {
        buckets = 1
    }

    request := LRQRequest {
        QueryType: PLOT,
        StartTime: query.TimeRange.From.Unix(),
        EndTime: query.TimeRange.To.Unix(),
        Plot: &PlotOptions {
            Expression: qm.Expression,
            Slices: buckets,
            Frequency: HIGH,
            AutoAlign: true,
        },
    }
    result, _ := d.dataSetClient.DoLRQRequest(request)
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
        times[index] = time.Unix(value / 1000, 0) // TODO: we lose the precision of milliseconds here, is this fine?
	}

	// add fields.
	frame.Fields = append(frame.Fields,
		data.NewField("time", nil, times),
		data.NewField("values", nil, values),
	)

	// add the frames to the response.
	response.Frames = append(response.Frames, frame)

	return response
}

// CheckHealth handles health checks sent from Grafana to the plugin.
// The main use case for these health checks is the test button on the
// datasource configuration page which allows users to verify that
// a datasource is working as expected.
func (d *DataSetDatasource) CheckHealth(_ context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
    currentTime := time.Now().UnixNano()
    request := FacetRequest {
        QueryType: "facet",
        MaxCount: 1,
        StartTime: currentTime,
        EndTime: currentTime,
        Field: "test",
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
