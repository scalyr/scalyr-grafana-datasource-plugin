package plugin

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
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
	var netClient = &http.Client{
		Timeout: time.Second * 10,
	}

	return &DataSetClient{
		dataSetUrl: dataSetUrl,
		apiKey:     apiKey,
		netClient:  netClient,
	}
}

func (d *DataSetClient) DoLRQRequest(req LRQRequest) (LRQResult, error) {
	var body []byte
	body, _ = json.Marshal(req)

	request, err := http.NewRequest("POST", d.dataSetUrl+"/v2/api/queries", bytes.NewBuffer(body))
	if err != nil {
		log.DefaultLogger.Warn("error constructing request to DataSet", "err", err)
		return LRQResult{}, err
	}
	request.Header.Set("Authorization", "Bearer "+d.apiKey)
	request.Header.Set("Content-Type", "application/json")

	var responseBody LRQResult
	stepsComplete, stepsTotal := 0, 1
	// Repeat ping requests for our query until we get a result with all steps steps complete
	// TODO: A timeout or some other way of escaping besides an error
	for stepsComplete < stepsTotal {
		resp, err := d.netClient.Do(request)
		if err != nil {
			log.DefaultLogger.Warn("error sending request to DataSet", "err", err)
			return LRQResult{}, err
		}
		defer resp.Body.Close()
		responseBytes, err := io.ReadAll(resp.Body)
		if err != nil {
			log.DefaultLogger.Warn("error reading response from DataSet", "err", err)
			return LRQResult{}, err
		}

		responseBody = LRQResult{}
		err = json.Unmarshal(responseBytes, &responseBody)
		if err != nil {
			log.DefaultLogger.Warn(" error unmarshaling response from DataSet", "err", err)
			return LRQResult{}, err
		}

		stepsTotal = responseBody.StepsTotal
		stepsComplete = responseBody.StepsCompleted

		// Build next ping request (which we might not use)
		request, err = http.NewRequest("GET", fmt.Sprintf("%s/v2/api/queries/%s?lastStepSeen=%d", d.dataSetUrl, responseBody.Id, responseBody.StepsCompleted), nil)
		if err != nil {
			log.DefaultLogger.Warn("error constructing request to DataSet", "err", err)
			return LRQResult{}, err
		}
		request.Header.Set("Authorization", "Bearer "+d.apiKey)
		request.Header.Set("Content-Type", "application/json")
	}

	return responseBody, nil
}

func (d *DataSetClient) DoFacetRequest(req FacetRequest) int {
	var body []byte
	body, _ = json.Marshal(req)

	request, err := http.NewRequest("POST", d.dataSetUrl+"/api/facetQuery", bytes.NewBuffer(body))
	request.Header.Set("Authorization", "Bearer "+d.apiKey)
	request.Header.Set("Content-Type", "application/json")

	resp, err := d.netClient.Do(request)
	if err != nil {
		log.DefaultLogger.Warn("error sending request to DataSet", "err", err)
		return 0
	}
	defer resp.Body.Close()

	responseBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		log.DefaultLogger.Warn("error reading response from DataSet", "err", err)
	}
	responseString := string(responseBytes)
	log.DefaultLogger.Info("Result of request to facet", "body", responseString)

	return resp.StatusCode
}
