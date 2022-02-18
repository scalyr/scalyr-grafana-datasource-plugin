package plugin

import (
	"time"
    "net/http"
    "io"
    "bytes"
    "encoding/json"

	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
)

const TIMESERIES = 0
const FACET = 1

type ClientRequest struct { //This approach better matches the LRQ API which I want to switch to, sorta...
    RequestType int
    FacetRequest FacetRequest
    TimeseriesRequest TimeseriesRequest
}

type FacetRequest struct {
    QueryType string `json:"queryType"`
    MaxCount int `json:"maxCount"`
    StartTime int64 `json:"startTime"`
    EndTime int64 `json:"endTime"`
    Field string `json:"field"`
}

type TimeseriesRequest struct {
    Queries []TimeseriesQuery `json:"queries"`
}

type TimeseriesQuery struct {
    Filter string `json:"filter"`
    Function string `json:"function"`
    StartTime int64 `json:"startTime"`
    EndTime int64 `json:"endTime"`
    Buckets int64 `json:"buckets"`
}

type ClientResult struct {
    ResultType int
    Timeseries TimeseriesResult
}

type TimeseriesResult struct {
    Values []float64 `json:"values"`
}

type DataSetClient struct {
    dataSetUrl string
    apiKey string
    netClient *http.Client
}

func NewDataSetClient(dataSetUrl string, apiKey string) (*DataSetClient) {
    var netClient = &http.Client{
        Timeout: time.Second * 10,
    }

    return &DataSetClient {
        dataSetUrl: dataSetUrl,
        apiKey: apiKey,
        netClient: netClient,
    }
}

func (d *DataSetClient) Do(path string, req ClientRequest) (ClientResult, int) {
    var body []byte
    switch req.RequestType {
    case TIMESERIES:
        body, _ = json.Marshal(req.TimeseriesRequest)
    case FACET:
        body, _ = json.Marshal(req.FacetRequest)
    }

    request, err := http.NewRequest("POST", d.dataSetUrl + path, bytes.NewBuffer(body))
    request.Header.Set("Authorization", "Bearer " + d.apiKey)
    request.Header.Set("Content-Type", "application/json")

    resp, err := d.netClient.Do(request)
    if err != nil {
        log.DefaultLogger.Warn("error sending request to DataSet", "err", err)
        return ClientResult{}, 0
    }
    defer resp.Body.Close()

    responseBytes, err := io.ReadAll(resp.Body)
    if err != nil {
        log.DefaultLogger.Warn("error reading response from DataSet", "err", err)
    }
    responseString := string(responseBytes)
    log.DefaultLogger.Info("Result of request to " + path, "body", responseString)

    type jsonData struct {
        Results []TimeseriesResult `json:"results"`
    }
    var jsonResult jsonData
    err = json.Unmarshal(responseBytes, &jsonResult)
    if err != nil {
        log.DefaultLogger.Warn("error marshalling", "err", err)
        return ClientResult{}, 0
    }

    //For now just work with Timeseries
    return ClientResult {
        ResultType: TIMESERIES,
        Timeseries: jsonResult.Results[0],
    }, resp.StatusCode
}
