package plugin

import (
	"encoding/json"
)

// Possible values for the request "type"
const LOG = "LOG"
const TOP_FACETS = "TOP_FACETS"
const FACET_VALUES = "FACET_VALUES"
const BREAKDOWN = "BREAKDOWN"
const PQ = "PQ"
const TABLE = "TABLE"
const DISTRIBUTION = "DISTRIBUTION"

// Possible values for the "resultType" of a Power Query
const COLUMN = "COLUMN"

// PLOT is a value for both a request "type" and a PQ "resultType"
const PLOT = "PLOT"

// Possible values for "frequency" of PLOT requests
const LOW = "LOW"
const HIGH = "HIGH"

// Possible values for the "outcome" of LRQData
const OK = "OK"
const TIMEOUT = "TIMEOUT"
const ERROR = "ERROR"

type LogOptions struct {
	Filter    string `json:"filter"`
	Ascending bool   `json:"ascending"`
	Limit     int    `json:"limit"`
	Cursor    string `json:"cursor"`
}

type FacetOptions struct {
	Filter    string `json:"filter"`
	Name      string `json:"name"`
	MaxValues string `json:"maxValues"`
}

type PQOptions struct {
	Query      string `json:"query"`
	ResultType string `json:"resultType"`
}

type PlotOptions struct {
	Filter         string  `json:"filter"`
	Slices         int64   `json:"slices"`
	SliceWidth     *string `json:"sliceWidth"`
	AutoAlign      bool    `json:"autoAlign"`
	Expression     string  `json:"expression"`
	BreakdownFacet *string `json:"breakdownFacet"`
	Frequency      string  `json:"frequency"`
}

type DistributionOptions struct {
	Filter string `json:"filter"`
	Facet  string `json:"facet"`
}

type LRQRequest struct {
	QueryType     string               `json:"queryType"`
	StartTime     int64                `json:"startTime"`
	EndTime       int64                `json:"endTime"`
	AccountEmails []string             `json:"accountEmails"`
	Log           *LogOptions          `json:"log"`
	Facet         *FacetOptions        `json:"facetValues"`
	TopFacet      *FacetOptions        `json:"topFacets"`
	Pq            *PQOptions           `json:"pq"`
	Plot          *PlotOptions         `json:"plot"`
	Distribution  *DistributionOptions `json:"distribution"`
}

type ResolvedTimeRange struct {
	Min int `json:"min"`
	Max int `json:"max"`
}

type PlotData struct {
	Label   string    `json:"label"`
	Samples []float64 `json:"samples"`
}

type PlotResultData struct {
	XAxis []int64    `json:"xAxis"`
	Plots []PlotData `json:"plots"`
}

type TableResultData struct {
	Columns []Column        `json:"columns"`
	Values  [][]interface{} `json:"values"`
}

type Column struct {
	Name string `json:"name"`
	Type string `json:"cellType"`
}

type Values struct {
	Name string `json:"name"`
	Type string `json:"cellType"`
}

type LRQError struct {
	Message string `json:"message"`
	// Not handling "details" due to no fixed schema
}

type LRQResult struct {
	Id             string          `json:"id"`
	StepsCompleted int             `json:"stepsCompleted"`
	StepsTotal     int             `json:"totalSteps"`
	Data           json.RawMessage `json:"data"` // Depending on expected response, need to unmarshal to different structs
	Error          *LRQError       `json:"error"`
}
