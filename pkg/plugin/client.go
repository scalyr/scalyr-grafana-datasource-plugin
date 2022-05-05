package plugin

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
)

type FacetRequest struct {
	QueryType string `json:"queryType"`
	MaxCount  int    `json:"maxCount"`

	Field string `json:"field"`
}

type DataSetClient struct {
	dataSetUrl string
	apiKey     string
	netClient  *http.Client
}

func NewDataSetClient(dataSetUrl string, apiKey string) *DataSetClient {
	// Consider using the backend.httpclient package provided by the Grafana SDK.
	// This would allow a per-instance configurable timeout, rather than the hardcoded value here.
	var netClient = &http.Client{
		Timeout: time.Second * 10,
	}

	return &DataSetClient{
		dataSetUrl: dataSetUrl,
		apiKey:     apiKey,
		netClient:  netClient,
	}
}

func (d *DataSetClient) doPingRequest(req interface{}) (*LRQResult, error) {
	body, err := json.Marshal(req)
	if err != nil {
		log.DefaultLogger.Error("error marshalling request to DataSet", "err", err)
		return nil, err
	}

	request, err := http.NewRequest("POST", d.dataSetUrl+"/v2/api/queries", bytes.NewBuffer(body))
	if err != nil {
		log.DefaultLogger.Error("error constructing request to DataSet", "err", err)
		return nil, err
	}
	request.Header.Set("Authorization", "Bearer "+d.apiKey)
	request.Header.Set("Content-Type", "application/json")

	var responseBody LRQResult
	stepsComplete, stepsTotal := 0, 1

	// Repeat ping requests for our query until we get a result with all steps steps complete
	for stepsComplete < stepsTotal {
		resp, err := d.netClient.Do(request)
		if err != nil {
			if e, ok := err.(*url.Error); ok && e.Timeout() {
				log.DefaultLogger.Error("request to DataSet timed out")
				return nil, e
			} else {
				return nil, err
			}
		}

		responseBytes, err := io.ReadAll(resp.Body)
		resp.Body.Close()
		if err != nil {
			log.DefaultLogger.Error("error reading response from DataSet", "err", err)
			return nil, err
		}

		if err = json.Unmarshal(responseBytes, &responseBody); err != nil {
			log.DefaultLogger.Error(" error unmarshaling response from DataSet", "err", err)
			return nil, err
		}

		stepsTotal = responseBody.StepsTotal
		stepsComplete = responseBody.StepsCompleted

		// Build next ping request (which we might not use)
		url := fmt.Sprintf("%s/v2/api/queries/%s?lastStepSeen=%d", d.dataSetUrl, responseBody.Id, responseBody.StepsCompleted)
		request, err = http.NewRequest("GET", url, nil)
		if err != nil {
			log.DefaultLogger.Error("error constructing request to DataSet", "err", err)
			return nil, err
		}
		request.Header.Set("Authorization", "Bearer "+d.apiKey)
		request.Header.Set("Content-Type", "application/json")
	}

	return &responseBody, nil
}

func (d *DataSetClient) DoLRQRequest(req LRQRequest) (*LRQResult, error) {
	return d.doPingRequest(req)
}

func (d *DataSetClient) DoFacetValuesRequest(req FacetQuery) (*LRQResult, error) {
	return d.doPingRequest(req)
}

func (d *DataSetClient) DoTopFacetRequest(req TopFacetRequest) (*LRQResult, error) {
	return d.doPingRequest(req)
}

func (d *DataSetClient) DoFacetRequest(req FacetRequest) (int, error) {
	body, err := json.Marshal(req)
	if err != nil {
		log.DefaultLogger.Error("error marshalling request to DataSet", "err", err)
		return 0, err
	}

	request, err := http.NewRequest("POST", d.dataSetUrl+"/api/facetQuery", bytes.NewBuffer(body))
	if err != nil {
		log.DefaultLogger.Error("error constructing request to DataSet", "err", err)
		return 0, err
	}
	request.Header.Set("Authorization", "Bearer "+d.apiKey)
	request.Header.Set("Content-Type", "application/json")

	resp, err := d.netClient.Do(request)
	if err != nil {
		log.DefaultLogger.Error("error sending request to DataSet", "err", err)
		return 0, err
	}
	defer resp.Body.Close()

	responseBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		log.DefaultLogger.Error("error reading response from DataSet", "err", err)
		return 0, err
	}
	log.DefaultLogger.Info("Result of request to facet", "body", string(responseBytes))

	return resp.StatusCode, nil
}
