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

	// Repeat ping requests until all steps are complete
	var respBody LRQResult
	for {
		resp, err := d.netClient.Do(request)
		if err != nil {
			if e, ok := err.(*url.Error); ok && e.Timeout() {
				log.DefaultLogger.Error("request to DataSet timed out")
				return nil, e
			} else {
				return nil, err
			}
		}

		respBytes, err := io.ReadAll(resp.Body)
		resp.Body.Close()
		if err != nil {
			log.DefaultLogger.Error("error reading response from DataSet", "err", err)
			return nil, err
		}

		if err = json.Unmarshal(respBytes, &respBody); err != nil {
			log.DefaultLogger.Error("error unmarshaling response from DataSet", "err", err)
			return nil, err
		}

		if respBody.StepsCompleted >= respBody.StepsTotal {
			break
		}

		time.Sleep(100 * time.Millisecond)

		// Build next ping request
		url := fmt.Sprintf("%s/v2/api/queries/%s?lastStepSeen=%d", d.dataSetUrl, respBody.Id, respBody.StepsCompleted)
		request, err = http.NewRequest("GET", url, nil)
		if err != nil {
			log.DefaultLogger.Error("error constructing request to DataSet", "err", err)
			return nil, err
		}
		request.Header.Set("Authorization", "Bearer "+d.apiKey)
		request.Header.Set("Content-Type", "application/json")
	}

	return &respBody, nil
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

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		log.DefaultLogger.Error("error reading response from DataSet", "err", err)
		return 0, err
	}
	log.DefaultLogger.Info("Result of request to facet", "body", string(respBytes))

	return resp.StatusCode, nil
}
