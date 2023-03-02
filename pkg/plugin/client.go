package plugin

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"math"
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
		Timeout: time.Second * 30,
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
	const VERSION = "3.0.9a"

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

func (d *DataSetClient) doPingRequest(ctx context.Context, req interface{}) (*LRQResult, error) {
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

	var latencyInfo struct {
		RequestBody                   string    `json:"request_body"`
		RequestSetupLatency           float64   `json:"request_setup_latency_ms"`
		LoopIterations                int       `json:"loop_iterations"`
		RequestTransportLatency       []float64 `json:"request_transport_latency_ms"`
		ResponseBodyReadLatency       []float64 `json:"response_body_read_latency_ms"`
		ResponseBodyUnmarshalLatency  []float64 `json:"response_body_unmarshal_latency_ms"`
		ResponseBodyStepsCompleted    []int     `json:"response_body_steps_completed"`
		ExplicitDelays                []float64 `json:"explicit_delays_ms"`
		NextRequestSetupLatency       []float64 `json:"next_request_setup_latency_ms"`
		DeleteRequestSetupLatency     float64   `json:"delete_request_setup_latency_ms"`
		DeleteRequestTransportLatency float64   `json:"delete_request_transport_latency_ms"`
		DeleteResponseBodyReadLatency float64   `json:"delete_response_body_read_latency_ms"`
		RequestTimedOut               bool      `json:"request_timed_out"`
		DeleteRequestTimedOut         bool      `json:"delete_request_timed_out"`

		TotalRequestTransportLatency      float64 `json:"total_request_transport_latency_ms"`
		TotalResponseBodyReadLatency      float64 `json:"total_response_body_read_latency_ms"`
		TotalResponseBodyUnmarshalLatency float64 `json:"total_response_body_unmarshal_latency_ms"`
		TotalExplicitDelays               float64 `json:"total_explicit_delays_ms"`
		TotalNextRequestSetupLatency      float64 `json:"total_next_request_setup_latency_ms"`
	}
	defer func() {
		if marshalled, err := json.Marshal(latencyInfo); err != nil {
			log.DefaultLogger.Error("error marshalling latency info", "err", err)
		} else {
			log.DefaultLogger.Debug("latency info", "info", string(marshalled))
		}
	}()

	start := time.Now()

	body, err := json.Marshal(req)
	if err != nil {
		log.DefaultLogger.Error("error marshalling request to DataSet", "err", err)
		return nil, err
	}
	latencyInfo.RequestBody = string(body)

	request, err := d.newRequest("POST", d.dataSetUrl + "/v2/api/queries", bytes.NewBuffer(body))
	if err != nil {
		log.DefaultLogger.Error("error constructing request to DataSet", "err", err)
		return nil, err
	}

	latencyInfo.RequestSetupLatency = float64(time.Since(start) / time.Millisecond)

	var respBody LRQResult
	var token string

	delay := 1 * time.Second
	const maxDelay = 2 * time.Second
	const delayFactor = 1.2

	loop: for i := 0; ; i++ {
		latencyInfo.LoopIterations = i

		start = time.Now()
		resp, err := d.netClient.Do(request)
		if err != nil {
			if e, ok := err.(*url.Error); ok && e.Timeout() {
				latencyInfo.RequestTimedOut = true
				log.DefaultLogger.Error("request to DataSet timed out")
				return nil, e
			} else {
				return nil, err
			}
		}
		elapsed := float64(time.Since(start) / time.Millisecond)
		latencyInfo.RequestTransportLatency = append(latencyInfo.RequestTransportLatency, elapsed)
		latencyInfo.TotalRequestTransportLatency += elapsed

		start = time.Now()
		respBytes, err := io.ReadAll(resp.Body)
		resp.Body.Close()
		if err != nil {
			log.DefaultLogger.Error("error reading response from DataSet", "err", err)
			return nil, err
		}
		elapsed = float64(time.Since(start) / time.Millisecond)
		latencyInfo.ResponseBodyReadLatency = append(latencyInfo.ResponseBodyReadLatency, elapsed)
		latencyInfo.TotalResponseBodyReadLatency += elapsed

		if !isSuccessful(resp) {
			log.DefaultLogger.Error("unsuccessful status code from DataSet request", "code", resp.StatusCode)
			return nil, fmt.Errorf("unsuccessful (%d) status code from DataSet request", resp.StatusCode)
		}

		start = time.Now()
		if err = json.Unmarshal(respBytes, &respBody); err != nil {
			log.DefaultLogger.Error("error unmarshaling response from DataSet", "err", err)
			return nil, err
		}
		elapsed = float64(time.Since(start) / time.Millisecond)
		latencyInfo.ResponseBodyUnmarshalLatency = append(latencyInfo.ResponseBodyUnmarshalLatency, elapsed)
		latencyInfo.TotalResponseBodyUnmarshalLatency += elapsed

		// Only check for the token from the initial launch request
		if i == 0 {
			token = resp.Header.Get(TOKEN_HEADER)
		}

		latencyInfo.ResponseBodyStepsCompleted = append(latencyInfo.ResponseBodyStepsCompleted, respBody.StepsCompleted)
		if respBody.StepsCompleted >= respBody.StepsTotal {
			break
		}

		// Sleep but cancel if signaled by the Grafana server context.
		// Cancels occur when the user navigates aways from the page (via embedded Javascript), Grafana shutdown, etc.
		select {
		case <- ctx.Done():
			err := ctx.Err()
			log.DefaultLogger.Warn("DataSet request canceled by Grafana", "err", err)
			// This is commonplace occurrence and should still send the delete to cleanup
			break loop
		case <- time.After(delay):
			// No-op
		}
		elapsed = float64(delay / time.Millisecond)
		latencyInfo.ExplicitDelays = append(latencyInfo.ExplicitDelays, elapsed)
		latencyInfo.TotalExplicitDelays += elapsed

		if delay < maxDelay {
			delay = time.Duration(math.Round(float64(delay) * delayFactor))
			if delay > maxDelay {
				delay = maxDelay
			}
		}

		start = time.Now()
		u := fmt.Sprintf("%s/v2/api/queries/%s?lastStepSeen=%d", d.dataSetUrl, respBody.Id, respBody.StepsCompleted)
		request, err = d.newRequest("GET", u, nil)
		if err != nil {
			log.DefaultLogger.Error("error constructing request to DataSet", "err", err)
			return nil, err
		}
		if token != "" {
			request.Header.Set(TOKEN_HEADER, token)
		}
		elapsed = float64(time.Since(start) / time.Millisecond)
		latencyInfo.NextRequestSetupLatency = append(latencyInfo.NextRequestSetupLatency, elapsed)
		latencyInfo.TotalNextRequestSetupLatency += elapsed
	}

	start = time.Now()
	u := fmt.Sprintf("%s/v2/api/queries/%s", d.dataSetUrl, respBody.Id)
	request, err = d.newRequest("DELETE", u, nil)
	if err != nil {
		log.DefaultLogger.Warn("error constructing request to DataSet", "err", err)
	} else {
		if token != "" {
			request.Header.Set(TOKEN_HEADER, token)
		}
		latencyInfo.DeleteRequestSetupLatency = float64(time.Since(start) / time.Millisecond)

		start = time.Now()
		if resp, err := d.netClient.Do(request); err != nil {
			if e, ok := err.(*url.Error); ok && e.Timeout() {
				latencyInfo.DeleteRequestTimedOut = true
				log.DefaultLogger.Warn("request to DataSet timed out")
			} else {
				log.DefaultLogger.Warn("error sending request to DataSet", "err", err)
			}
		} else {
			latencyInfo.DeleteRequestTransportLatency = float64(time.Since(start) / time.Millisecond)

			// Read/close the body so the client's transport can re-use a persistent tcp connection
			start = time.Now()
			io.ReadAll(resp.Body)
			resp.Body.Close()
			latencyInfo.DeleteResponseBodyReadLatency = float64(time.Since(start) / time.Millisecond)

			if !isSuccessful(resp) {
				log.DefaultLogger.Warn("unsuccessful status code from DataSet delete", "code", resp.StatusCode)
			}
		}
	}

	return &respBody, nil
}

func (d *DataSetClient) DoLRQRequest(ctx context.Context, req LRQRequest) (*LRQResult, error) {
	return d.doPingRequest(ctx, req)
}

func (d *DataSetClient) DoFacetValuesRequest(ctx context.Context, req FacetQuery) (*LRQResult, error) {
	return d.doPingRequest(ctx, req)
}

func (d *DataSetClient) DoTopFacetRequest(ctx context.Context, req TopFacetRequest) (*LRQResult, error) {
	return d.doPingRequest(ctx, req)
}

func (d *DataSetClient) DoFacetRequest(ctx context.Context, req FacetRequest) (int, error) {
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
