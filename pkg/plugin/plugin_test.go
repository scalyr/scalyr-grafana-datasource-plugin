package plugin

import (
	"context"
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

func TestNewDataSetDatasource(t *testing.T) {
	settings := backend.DataSourceInstanceSettings{
		JSONData: []byte(`{"scalyrUrl":"https://app.scalyr.com/"}`),
		DecryptedSecureJSONData: map[string]string{"apiKey": "key"},
	}
	if _, err := NewDataSetDatasource(settings); err != nil {
		t.Error(err)
	}
}

func TestQueryData(t *testing.T) {
	datasource := DataSetDatasource{}

	resp, err := datasource.QueryData(
		context.Background(),
		&backend.QueryDataRequest{
			Queries: []backend.DataQuery{
				{RefID: "A"},
			},
		},
	)
	if err != nil {
		t.Error(err)
	}

	if len(resp.Responses) != 1 {
		t.Fatal("QueryData must return a response")
	}
}

func liveDatasource() (*DataSetDatasource, string, error) {
	var scalyrUrl, apiKey string
	var ok bool

	if scalyrUrl, ok = os.LookupEnv("TEST_SCALYR_URL"); !ok {
		return nil, "TEST_SCALYR_URL not set", nil
	}
	if apiKey, ok = os.LookupEnv("TEST_APIKEY"); !ok {
		return nil, "TEST_APIKEY not set", nil
	}

	settings := backend.DataSourceInstanceSettings{
		JSONData: []byte(fmt.Sprintf(`{"scalyrUrl":"%s"}`, scalyrUrl)),
		DecryptedSecureJSONData: map[string]string{"apiKey": apiKey},
	}
	datasource, err := NewDataSetDatasource(settings)
	if err != nil {
		return nil, "", err
	}

	return datasource.(*DataSetDatasource), "", nil
}

func TestLiveQueryDataPQ(t *testing.T) {
	datasource, skip, err := liveDatasource()
	if err != nil {
		t.Error(err)
	}
	if skip != "" {
		t.Skipf(skip)
	}

	refId := "A"
	powerQuery := "| group count=count() by severity | columns severity, count"
	resp, err := datasource.QueryData(
		context.Background(),
		&backend.QueryDataRequest{
			Queries: []backend.DataQuery{
				{
					RefID: refId,
					TimeRange: backend.TimeRange{
						From: time.Now().Add(-4 * time.Hour),
						To: time.Now(),
					},
					JSON: []byte(fmt.Sprintf(`{"expression":"%s","queryType":"Power Query"}`, powerQuery)),
				},
			},
		},
	)
	if err != nil {
		t.Error(err)
	}

	if len(resp.Responses) != 1 {
		t.Fatal("QueryData must return a response")
	}

	dataResp := resp.Responses[refId]
	if dataResp.Error != nil {
		t.Error(err)
	}

	fields := dataResp.Frames[0].Fields
	if fields[0].Name != "severity" || fields[1].Name != "count" {
		t.Error("unexpected field names")
	}
}

func TestLiveQueryDataPlot(t *testing.T) {
	datasource, skip, err := liveDatasource()
	if err != nil {
		t.Error(err)
	}
	if skip != "" {
		t.Skipf(skip)
	}

	refId := "A"
	resp, err := datasource.QueryData(
		context.Background(),
		&backend.QueryDataRequest{
			Queries: []backend.DataQuery{
				{
					RefID: refId,
					TimeRange: backend.TimeRange{
						From: time.Now().Add(-4 * time.Hour),
						To: time.Now(),
					},
					MaxDataPoints: 1000,
					JSON: []byte(`{"expression":"count(severity != 3)","queryType":"Standard","breakDownFacetValue":"severity"}`),
				},
			},
		},
	)
	if err != nil {
		t.Error(err)
	}

	if len(resp.Responses) != 1 {
		t.Fatal("QueryData must return a response")
	}

	dataResp := resp.Responses[refId]
	if dataResp.Error != nil {
		t.Error(err)
	}

	fields := dataResp.Frames[0].Fields
	if fields[0].Name != "time" {
		t.Error("unexpected field name")
	}

	for _, field := range fields[1:] {
		if len(field.Labels) == 0 {
			t.Errorf("breakdown facet not used as label")
		}
	}
}
