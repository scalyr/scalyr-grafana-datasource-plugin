package plugin

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"sort"
	"strconv"
	"sync"
	"testing"
	"time"
	
	"golang.org/x/time/rate"
)

func TestClientRateLimiter(t *testing.T) {
	mockedServerState := struct {
		requestTimesByMethod map[string][]time.Time
		nextSessionId        int
		mutex                sync.Mutex
	}{
		requestTimesByMethod: make(map[string][]time.Time),
	}
	
	mockedServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		const totalSteps = 2
		
		mockedServerState.mutex.Lock()
		defer mockedServerState.mutex.Unlock()
		
		mockedServerState.requestTimesByMethod[r.Method] = append(mockedServerState.requestTimesByMethod[r.Method], time.Now())
		t.Logf("request %s %s %s", time.Now().Format("15:04:05"), r.Method, r.URL.String())
		
		if r.Method == http.MethodPost {
			sessionId := mockedServerState.nextSessionId
			mockedServerState.nextSessionId++
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(fmt.Sprintf("{\"id\":\"%d\",\"stepsCompleted\":0,\"totalSteps\":%d}", sessionId, totalSteps)))
		} else if r.Method == http.MethodGet {
			sessionId := r.URL.Path
			lastStepSeen, err := strconv.Atoi(r.URL.Query().Get("lastStepSeen"))
			if err != nil {
				t.Fatalf("failed to parse path %s: %v", r.URL.String(), err)
			}
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(fmt.Sprintf("{\"id\":\"%s\",\"stepsCompleted\":%d,\"totalSteps\":%d}", sessionId, lastStepSeen+1, totalSteps)))
		} else if r.Method == http.MethodDelete {
			w.WriteHeader(http.StatusOK)
		}
	}))
	defer mockedServer.Close()
	
	datasetClient := &dataSetClient{
		dataSetUrl:  mockedServer.URL,
		apiKey:      "<api-key>",
		netClient:   &http.Client{},
		rateLimiter: rate.NewLimiter(1*rate.Every(1*time.Second), 1),
	}
	
	request := LRQRequest{
		QueryType: PQ,
		StartTime: time.Now().Add(-4 * time.Hour).Unix(),
		EndTime:   time.Now().Unix(),
		Pq: &PQOptions{
			Query:      "message contains 'error'\n| columns timestamp,severity,message",
			ResultType: TABLE,
		},
	}
	
	var waitGroup sync.WaitGroup
	for i := 0; i < 3; i++ {
		waitGroup.Add(1)
		go func() {
			defer waitGroup.Done()
			datasetClient.DoLRQRequest(context.Background(), request)
		}()
	}
	waitGroup.Wait()

	// Find the minimum time difference between consecutive elements.
	// The elements are expected to be already sorted ascendingly.
	minTimeDiff := func(times []time.Time) time.Duration {
		rv := times[1].Sub(times[0])
		for i := 2; i < len(times); i++ {
			if diff := times[i].Sub(times[i-1]); diff < rv {
				rv = diff
			}
		}
		return rv
	}
	
	// The rate limiter is set to only allow one session (POST request) per second.
	// Verify that the minimum amount of time between consecutive POST requests is at least one second.
	if diff := minTimeDiff(mockedServerState.requestTimesByMethod[http.MethodPost]); diff.Round(time.Second) < time.Second {
		t.Errorf("expected >= 1s, actual = %v", diff)
	}
	
	// There are no restrictions on GET or DELETE requests.
	// Verify that the minimum amount of time between non-POST requests is less than 500 milliseconds.
	var requestTimes []time.Time
	requestTimes = append(requestTimes, mockedServerState.requestTimesByMethod[http.MethodGet]...)
	requestTimes = append(requestTimes, mockedServerState.requestTimesByMethod[http.MethodDelete]...)
	sort.Slice(requestTimes, func(i, j int) bool { return requestTimes[i].Before(requestTimes[j]) })
	if diff := minTimeDiff(requestTimes); diff.Round(time.Millisecond) > 500 * time.Millisecond {
		t.Errorf("expected < 500ms, actual = %v", diff)
	}
}
