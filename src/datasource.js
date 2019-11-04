import _ from "lodash";

export class GenericDatasource {

  /**
   * Constructor
   * @param {*} instanceSettings 
   * @param {*} $q 
   * @param {*} backendSrv 
   * @param {*} templateSrv 
   */
  constructor(instanceSettings, $q, backendSrv, templateSrv) {
    this.type = instanceSettings.type;
    this.url = instanceSettings.url;
    this.name = instanceSettings.name;
    this.apiKey = instanceSettings.jsonData.scalyrApiKey;
    this.backendSrv = backendSrv;
    this.q = $q;
    this.templateSrv = templateSrv;
    this.headers = {'Content-Type': 'application/json'};
  }
  
  /**
   * Grafana uses this function to initiate all queries
   * @param {*} options - query settings/options https://grafana.com/docs/plugins/developing/datasources/#query
   */
  query(options) {
    return this.performTimeseriesQuery(options);
  }

  /**
   * Grafana uses this function to test data source settings. 
   * This verifies API key using the facet query API. 
   * The endpoint returns 401 if the token is invalid.
   */
  testDatasource() {
    let defered = this.q.defer();
    this.backendSrv.datasourceRequest({
      url: this.url + '/facetQuery', 
      data: JSON.stringify({
        token: this.apiKey,
        queryType: 'facet',
        filter: '',
        startTime: new Date().getTime(),
        endTime: new Date().getTime(),
        field: 'XYZ'
      }),
      method: 'POST'
    }).then((response) => {
      if (response && response.status && response.status === 200) {
        defered.resolve({
          status: "success",
          message: "Data source is working."
        })
      } else {
        defered.reject({
          status: "error",
          message: "Incorrect configuration."
        })
      }
    });
    return defered.promise;
  }
  
  /**
   * Grafana uses this function to load metric values. 
   * @param {*} query - query options
   */
  metricFindQuery(query) {
    let d = new Date();

    d.setHours(d.getHours() - 6);
    return this.backendSrv.datasourceRequest({
      url: this.url + '/facetQuery',
      data: JSON.stringify({
        token: this.apiKey,
        queryType: 'facet',
        filter: '',
        startTime: d.getTime(),
        endTime: new Date().getTime(),
        field: query
      }),
      method: 'POST'
    }).then((response) => {
      let values = _.get(response, 'data.values', [])
      return values.map(value => 
        {
          return {
            text: value.value,
            value: value.value
          }
        }
      )
    })
  }

  /**
   * Create a request to the scalyr time series endpoint.
   * @param {*} options 
   */
  createTimeSeriesQuery(options) {
    let queries = [];
    let variableFilter = this.getFilterFromVariables();
    options.targets.forEach((target) => {
      let facetFunction = '';
      if (target.facet) {
        facetFunction = `${target.function || 'count'}(${target.facet})`;
      }
      const query = {
        startTime: options.range.from.valueOf(),
        endTime: options.range.to.valueOf(),
        buckets: this.getNumberOfBuckets(options),
        filter: target.queryText + variableFilter,
        function: facetFunction
      }
      queries.push(query);
    });
    return {
      url: this.url + '/timeSeriesApi',
      method: 'POST',
      headers: this.headers,
      data: JSON.stringify({
        token: this.apiKey,
        queries: queries
      })
    }
  }

  /**
   * Convert the selected variables into filter accepted by scalyr query language
   */
  getFilterFromVariables() {
    let variableFilter = '';
    if (this.templateSrv.variables && this.templateSrv.variables.length > 0) {
      this.templateSrv.variables.forEach((variable) => {
        const value = _.get(variable, 'current.value')
        if (variable.multi) {
          const variableQuery = value.map(v => ` ${variable.query} == '${v}'`).join(' or ');
          variableFilter += variableQuery; 
        } else {
          variableFilter = ` ${variableFilter + variable.query} == '${value}' `;
        }
      })
    }
    return variableFilter;
  }

  /**
   * Get how many buckets to return based on the query time range
   * @param {*} options 
   */
  getNumberOfBuckets(options) {
    return Math.floor((options.range.to.valueOf() - options.range.from.valueOf()) / options.intervalMs);
  }

  /**
   * Perform the timeseries query using the grafana proxy.
   * @param {*} options 
   */
  performTimeseriesQuery(options) {
    const query = this.createTimeSeriesQuery(options);
    return this.backendSrv.datasourceRequest(query)
      .then( (response) => {
        const data = response.data
        const graphs = {
          data: []
        };
        data.results.forEach((result, index) => {
          let timeStamp = options.range.from.valueOf();
          const dataValues = result.values;
          const currentTarget = options.targets[index];
          const responseObject = {
            target: currentTarget.label || currentTarget.queryText,
            datapoints: []
          }
          for (let i = 0; i < dataValues.length; i++) {
            responseObject.datapoints.push([dataValues[i], timeStamp]);
            timeStamp += options.intervalMs
          }
          graphs.data.push(responseObject);
        })
        return graphs;
      }
    );
  }
}
