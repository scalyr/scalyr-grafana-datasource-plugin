package plugin

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
)

type filterModal struct {
	QueryVariable string `json:"queryVariable"`
}

func (d *DataSetDatasource) CallResource(ctx context.Context, req *backend.CallResourceRequest, sender backend.CallResourceResponseSender) error {
	switch req.Path {
	case "facet-query":
		var fm filterModal
		err1 := json.Unmarshal(req.Body, &fm)
		if err1 != nil {
			return sender.Send(&backend.CallResourceResponse{
				Status: http.StatusBadRequest,
			})
		}
		request := FacetQuery{
			QueryType: "FACET_VALUES",
			FacetValues: &FacetOptions{
				Name:      fm.QueryVariable,
				MaxValues: "100",
			},
		}
		result, _ := d.dataSetClient.DoFacetValuesRequest(request)
		facetResultData := FacetList{}
		err := json.Unmarshal(result.Data, &facetResultData)
		if err != nil {
			log.DefaultLogger.Warn("error unmarshaling response from FACETS LIST query", "err", err)
			return sender.Send(&backend.CallResourceResponse{
				Status: http.StatusNotFound,
			})
		}
		finalResponse := make([]string, len(facetResultData.Facet.Values))
		for i, val := range facetResultData.Facet.Values {
			finalResponse[i] = val.Value
		}
		pb := &FacetResponse{Value: finalResponse}
		jsonStr, err := json.Marshal(pb)
		if err != nil {
			log.DefaultLogger.Warn("could not marshal facets JSON: %s", err)
		}
		return sender.Send(&backend.CallResourceResponse{
			Status: http.StatusOK,
			Body:   jsonStr,
		})
	case "top-facets":
		request := TopFacetRequest{
			QueryType: "TOP_FACETS",
			TopFacet: &TopFacetOptions{
				NumFacetsToReturn: 100,
				DetermineNumeric:  true,
				Filter:            "tag",
			},
		}
		result, _ := d.dataSetClient.DoTopFacetRequest(request)
		topFacets := TopFacets{}
		err := json.Unmarshal(result.Data, &topFacets)
		if err != nil {
			log.DefaultLogger.Warn("error unmarshaling response from TOP FACETS query", "err", err)
			return sender.Send(&backend.CallResourceResponse{
				Status: http.StatusNotFound,
			})
		}
		jsonStr, err := json.Marshal(topFacets)
		if err != nil {
			log.DefaultLogger.Warn("could not marshal JSON: %s", err)
		}
		return sender.Send(&backend.CallResourceResponse{
			Status: http.StatusOK,
			Body:   jsonStr,
		})
	default:
		return sender.Send(&backend.CallResourceResponse{
			Status: http.StatusNotFound,
		})
	}
}
