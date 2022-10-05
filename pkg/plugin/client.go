package plugin

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"golang.org/x/time/rate"

	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
)

type FacetRequest struct {
	QueryType string `json:"queryType"`
	MaxCount  int    `json:"maxCount"`

	Field string `json:"field"`
}

type DataSetClient struct {
	dataSetUrl  string
	apiKey      string
	netClient   *http.Client
	rateLimiter *rate.Limiter
}

func NewDataSetClient(dataSetUrl string, apiKey string) *DataSetClient {
	// Consider using the backend.httpclient package provided by the Grafana SDK.
	// This would allow a per-instance configurable timeout, rather than the hardcoded value here.
	netClient := &http.Client{
		Timeout: time.Second * 10,
	}

	// TODO Are there alternate approaches to implementing rate limits via the Grafana SDK?
	//      Consult with Grafana support about this, potentially there's a simplier option.
	rateLimiter := rate.NewLimiter(100 * rate.Every(1 * time.Minute), 100) // 100 requests / minute

	return &DataSetClient{
		dataSetUrl:  dataSetUrl,
		apiKey:      apiKey,
		netClient:   netClient,
		rateLimiter: rateLimiter,
	}
}

func (d *DataSetClient) newRequest(method, url string, body io.Reader) (*http.Request, error) {
	const VERSION = "3.0.7"

	if err := d.rateLimiter.Wait(context.Background()); err != nil {
		log.DefaultLogger.Error("error applying rate limiter", "err", err)
		return nil, err
	}

	request, err := http.NewRequest(method, url, body)
	if err != nil {
		log.DefaultLogger.Error("error constructing request to DataSet", "err", err)
		return nil, err
	}

	// An alternative approach is to wrap http.Client.Transport
	// However RoundTrip should not modify the request (ref: go doc net/http.RoundTripper)
	request.Header.Set("Authorization", "Bearer " + d.apiKey)
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("User-Agent", "sentinelone-dataset-datasource/" + VERSION)

	return request, nil
}

func (d *DataSetClient) doPingRequest(req interface{}) (*LRQResult, error) {
	// Long-Running Query (LRQ) api usage:
	// - An initial POST request is made containing the standard/power query
	// - Its response may or may not contain the results
	//   - This is indicated by StepsCompleted == StepsTotal in the response
	// - If not complete, follow up with GET ping requests with the response Id
	//   - If the token is present in the initial POST request response, include it in subsequent pings
	// - When complete send a DELETE request to clean up resources
	//   - If the token is present in the initial POST request response, include it in this request as well

	const TOKEN_HEADER = "X-Dataset-Query-Forward-Tag"

	isSuccessful := func(r *http.Response) bool {
		return 200 <= r.StatusCode && r.StatusCode < 300
	}

	body, err := json.Marshal(req)
	if err != nil {
		log.DefaultLogger.Error("error marshalling request to DataSet", "err", err)
		return nil, err
	}

	request, err := d.newRequest("POST", d.dataSetUrl + "/v2/api/queries", bytes.NewBuffer(body))
	if err != nil {
		log.DefaultLogger.Error("error constructing request to DataSet", "err", err)
		return nil, err
	}

	var respBody LRQResult
	var token string

	delay := 1 * time.Second
	const maxDelay = 8 * time.Second

	stop := time.Now().Add(45 * time.Second)

	for i := 0; ; i++ {
		if time.Now().After(stop) {
			log.DefaultLogger.Error("DataSet session time exceeded")
			return nil, fmt.Errorf("DataSet session time exceeded")
		}

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

		if !isSuccessful(resp) {
			log.DefaultLogger.Error("unsuccessful status code from DataSet request", "code", resp.StatusCode)
			return nil, fmt.Errorf("unsuccessful (%d) status code from DataSet request", resp.StatusCode)
		}

		if err = json.Unmarshal(respBytes, &respBody); err != nil {
			log.DefaultLogger.Error("error unmarshaling response from DataSet", "err", err)
			return nil, err
		}

		if respBody.StepsCompleted >= respBody.StepsTotal {
			break
		}

		// Only check for the token from the initial POST launch request
		if i == 0 {
			token = resp.Header.Get(TOKEN_HEADER)
		}

		time.Sleep(delay)
		if delay < maxDelay {
			delay *= 2
		}

		u := fmt.Sprintf("%s/v2/api/queries/%s?lastStepSeen=%d", d.dataSetUrl, respBody.Id, respBody.StepsCompleted)
		request, err = d.newRequest("GET", u, nil)
		if err != nil {
			log.DefaultLogger.Error("error constructing request to DataSet", "err", err)
			return nil, err
		}
		if token != "" {
			request.Header.Set(TOKEN_HEADER, token)
		}
	}

	u := fmt.Sprintf("%s/v2/api/queries/%s", d.dataSetUrl, respBody.Id)
	request, err = d.newRequest("DELETE", u, nil)
	if err != nil {
		log.DefaultLogger.Warn("error constructing request to DataSet", "err", err)
	} else {
		if token != "" {
			request.Header.Set(TOKEN_HEADER, token)
		}
		if resp, err := d.netClient.Do(request); err != nil {
			if e, ok := err.(*url.Error); ok && e.Timeout() {
				log.DefaultLogger.Warn("request to DataSet timed out")
			} else {
				log.DefaultLogger.Warn("error sending request to DataSet", "err", err)
			}
		} else {
			// Read/close the body so the client's transport can re-use a persistent tcp connection
			io.ReadAll(resp.Body)
			resp.Body.Close()

			if !isSuccessful(resp) {
				log.DefaultLogger.Warn("unsuccessful status code from DataSet delete", "code", resp.StatusCode)
			}
		}
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

	request, err := d.newRequest("POST", d.dataSetUrl + "/api/facetQuery", bytes.NewBuffer(body))
	if err != nil {
		log.DefaultLogger.Error("error constructing request to DataSet", "err", err)
		return 0, err
	}

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
	log.DefaultLogger.Debug("Result of request to facet", "body", string(respBytes))

	return resp.StatusCode, nil
}
