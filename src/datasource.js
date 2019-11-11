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
    this.queryTypes = {
      POWER_QUERY: 'Power Query',
      STANDARD_QUERY: 'Standard Query'
    }
  }
  
  /**
   * Grafana uses this function to initiate all queries
   * @param {*} options - query settings/options https://grafana.com/docs/plugins/developing/datasources/#query
   */
  query(options) {
    const queryType = options.targets[0].queryType;
    if (!options.targets.every(x => x.queryType === queryType)) {
      return Promise.reject({
        status: "error",
        message: "All queries should have the same query type."
      });
    }
    if (queryType === this.queryTypes.POWER_QUERY) {
      if (options.targets.length === 1) {
        return this.performPowerQuery(options);
      } else {
        return Promise.reject({
          status: "error",
          message: "You can only have one power query per panel."
        });
      }
    }
    return this.performTimeseriesQuery(options, this.templateSrv.variables);
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
      let values = _.get(response, 'data.values', []);
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
  createTimeSeriesQuery(options, variables) {
    let queries = [];
    let variableFilter = this.getFilterFromVariables(variables);
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
      };
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
  getFilterFromVariables(variables) {
    let variableFilter = '';
    if (variables && variables.length > 0) {
      variables.forEach((variable) => {
        const value = _.get(variable, 'current.value');
        if (variable.multi) {
          const variableQuery = value.map(v => `${variable.query} == '${v}'`).join(' or ');
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
   * Perform the timeseries query using the Grafana proxy.
   * @param {*} options 
   */
  performTimeseriesQuery(options, variables) {
    const query = this.createTimeSeriesQuery(options, variables);
    return this.backendSrv.datasourceRequest(query)
      .then( (response) => {
        const data = response.data;
        return this.transformTimeSeriesResults(data.results, options);
      }
    );
  }

  /**
   * Transform data returned by time series query into Grafana timeseries format.
   * https://grafana.com/docs/plugins/developing/datasources/#query
   * @param results
   * @param conversionFactor conversion factor to be applied to each data point. This can be used to for example convert bytes to MB.
   * @returns {{data: Array}}
   */
  transformTimeSeriesResults(results, options) {
    const graphs = {
      data: []
    };
    results.forEach((result, index) => {
      let timeStamp = options.range.from.valueOf();
      const dataValues = result.values;
      const currentTarget = options.targets[index];
      const responseObject = {
        target: currentTarget.label || currentTarget.queryText,
        datapoints: []
      };
      const conversionFactor = this.getValidConversionFactor(currentTarget.conversionFactor);
      for (let i = 0; i < dataValues.length; i++) {
        let dataValue = dataValues[i] * conversionFactor;
        responseObject.datapoints.push([dataValue, timeStamp]);
        timeStamp += options.intervalMs
      }
      graphs.data.push(responseObject);
    });
    return graphs;
  }

  /**
   * Evaluate the user enter conversion factor to a number.
   * @param conversionFactor conversion factor.
   * @returns {*|number}
   */
  getValidConversionFactor(conversionFactor) {
    let evaluatedConversionFactor;
    try {
      evaluatedConversionFactor = eval(conversionFactor);
    } catch (e) {}
    return evaluatedConversionFactor || 1;
  }

  /**
   * Create powerquery query to pass to Grafana proxy.
   * @param queryText text of the query
   * @param startTime start time
   * @param endTime end time
   * @returns {{url: string, method: string, headers: {"Content-Type": string}, data: string}}
   */
  createPowerQuery(queryText, startTime, endTime) {
    const query = {
      token: this.apiKey,
      query: queryText,
      startTime: startTime,
      endTime: endTime
    };
    return {
      url: this.url + '/powerQuery',
      method: 'POST',
      headers: this.headers,
      data: JSON.stringify(query)
    }
  }

  /**
   * Perform the powerquery using Grafana proxy.
   * @param options
   * @returns {Promise<{data: *[]}> | *}
   */
  performPowerQuery(options) {
    const target = options.targets[0];
    const query = this.createPowerQuery(target.queryText, options.range.from.valueOf(), options.range.to.valueOf());
    return this.backendSrv.datasourceRequest(query).then( (response) => {
      const data = response && response.data;
      return this.transformPowerQueryData(data);
    })
  }

  /**
   * Pure function to transform Power Query Data in table format that Grafana needs.
   * https://grafana.com/docs/plugins/developing/datasources/#query
   * @param data
   * @returns {{data: *[]}}
   */
  transformPowerQueryData(data) {
    const cloneData = _.clone(data);
    cloneData.columns.map(col => col.text = col.name);
    return {
      data : [{
        type: "table",
        columns: cloneData.columns,
        rows: cloneData.values
      }]
    }
  }
}
