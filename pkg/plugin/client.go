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

type DataSetClient interface {
	DoLRQRequest(ctx context.Context, req LRQRequest) (*LRQResult, error)
	DoFacetValuesRequest(ctx context.Context, req FacetQuery) (*LRQResult, error)
	DoTopFacetRequest(ctx context.Context, req TopFacetRequest) (*LRQResult, error)
	DoFacetRequest(ctx context.Context, req FacetRequest) (int, error)
}

type dataSetClient struct {
	dataSetUrl  string
	apiKey      string
	netClient   *http.Client
	rateLimiter *rate.Limiter
}

func NewDataSetClient(dataSetUrl string, apiKey string) DataSetClient {
	// Consider using the backend.httpclient package provided by the Grafana SDK.
	// This would allow a per-instance configurable timeout, rather than the hardcoded value here.
	netClient := &http.Client{
		Timeout: time.Second * 30,
	}

	// TODO Are there alternate approaches to implementing rate limits via the Grafana SDK?
	//      Consult with Grafana support about this, potentially there's a simplier option.
	rateLimiter := rate.NewLimiter(100*rate.Every(1*time.Minute), 100) // 100 "requests" / minute

	return &dataSetClient{
		dataSetUrl:  dataSetUrl,
		apiKey:      apiKey,
		netClient:   netClient,
		rateLimiter: rateLimiter,
	}
}

func (d *dataSetClient) newRequest(method, url string, body io.Reader) (*http.Request, error) {
	const VERSION = "3.1.6"

	// Apply the rate limiter to the initial POST request of the LRQ api session.
	// This ensures that later LRQ api "pings" (ie GET requests) are not rate-limited;
	// timely pings are necessary to prevent the LRQ session from being terminated.
	if method == http.MethodPost {
		if err := d.rateLimiter.Wait(context.Background()); err != nil {
			log.DefaultLogger.Error("error applying rate limiter", "err", err)
			return nil, err
		}
	}

	request, err := http.NewRequest(method, url, body)
	if err != nil {
		log.DefaultLogger.Error("error constructing request to DataSet", "err", err)
		return nil, err
	}

	// An alternative approach is to wrap http.Client.Transport
	// However RoundTrip should not modify the request (ref: go doc net/http.RoundTripper)
	request.Header.Set("Authorization", "Bearer "+d.apiKey)
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("User-Agent", "sentinelone-dataset-datasource/"+VERSION)

	return request, nil
}

func (d *dataSetClient) doPingRequest(ctx context.Context, req interface{}) (*LRQResult, error) {
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

	request, err := d.newRequest("POST", d.dataSetUrl+"/v2/api/queries", bytes.NewBuffer(body))
	if err != nil {
		log.DefaultLogger.Error("error constructing request to DataSet", "err", err)
		return nil, err
	}

	var respBody LRQResult
	var token string

	delay := 1 * time.Second
	const maxDelay = 2 * time.Second
	const delayFactor = 1.2

loop:
	for i := 0; ; i++ {
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
		resp.Body.Close() // nolint
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

		// Only check for the token from the initial launch request
		if i == 0 {
			token = resp.Header.Get(TOKEN_HEADER)
		}

		if respBody.StepsCompleted >= respBody.StepsTotal {
			break
		}

		// Sleep but cancel if signaled by the Grafana server context.
		// Cancels occur when the user navigates aways from the page (via embedded Javascript), Grafana shutdown, etc.
		select {
		case <-ctx.Done():
			err := ctx.Err()
			log.DefaultLogger.Warn("DataSet request canceled by Grafana", "err", err)
			// This is commonplace occurrence and should still send the delete to cleanup
			break loop
		case <-time.After(delay):
			// No-op
		}

		if delay < maxDelay {
			delay = time.Duration(math.Round(float64(delay) * delayFactor))
			if delay > maxDelay {
				delay = maxDelay
			}
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
			_, err := io.ReadAll(resp.Body)
			resp.Body.Close() // nolint
			if err != nil {
				log.DefaultLogger.Warn("error reading delete response from DataSet", "err", err)
			}

			if !isSuccessful(resp) {
				log.DefaultLogger.Warn("unsuccessful status code from DataSet delete", "code", resp.StatusCode)
			}
		}
	}

	return &respBody, nil
}

func (d *dataSetClient) DoLRQRequest(ctx context.Context, req LRQRequest) (*LRQResult, error) {
	return d.doPingRequest(ctx, req)
}

func (d *dataSetClient) DoFacetValuesRequest(ctx context.Context, req FacetQuery) (*LRQResult, error) {
	return d.doPingRequest(ctx, req)
}

func (d *dataSetClient) DoTopFacetRequest(ctx context.Context, req TopFacetRequest) (*LRQResult, error) {
	return d.doPingRequest(ctx, req)
}

func (d *dataSetClient) DoFacetRequest(ctx context.Context, req FacetRequest) (int, error) {
	body, err := json.Marshal(req)
	if err != nil {
		log.DefaultLogger.Error("error marshalling request to DataSet", "err", err)
		return 0, err
	}

	request, err := d.newRequest("POST", d.dataSetUrl+"/api/facetQuery", bytes.NewBuffer(body))
	if err != nil {
		log.DefaultLogger.Error("error constructing request to DataSet", "err", err)
		return 0, err
	}

	resp, err := d.netClient.Do(request)
	if err != nil {
		log.DefaultLogger.Error("error sending request to DataSet", "err", err)
		return 0, err
	}
	defer resp.Body.Close() // nolint

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		log.DefaultLogger.Error("error reading response from DataSet", "err", err)
		return 0, err
	}
	log.DefaultLogger.Debug("Result of request to facet", "body", string(respBytes))

	return resp.StatusCode, nil
}
