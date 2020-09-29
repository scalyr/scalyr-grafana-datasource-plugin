import _ from "lodash";

import { getValidConversionFactor } from './util';

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
    this.scalyrUrl = instanceSettings.jsonData.scalyrUrl;
    this.backendSrv = backendSrv;
    this.q = $q;
    this.templateSrv = templateSrv;
    this.headers = {'Content-Type': 'application/json'};
    this.queryTypes = {
      POWER_QUERY: 'Power Query',
      STANDARD_QUERY: 'Standard Query'
    };

    this.visualizationType = {
      GRAPH: 'graph',
      TABLE: 'table'
    };
  }
  
  /**
   * Grafana uses this function to initiate all queries
   * @param {*} options - query settings/options https://grafana.com/docs/plugins/developing/datasources/#query
   */
  query(options) {
    const queryType = options.targets[0].queryType;
    if (!options.targets.every(x => x.queryType === queryType)) {
      return {
        status: "error",
        message: "All queries should have the same query type."
      };
    }

    if (queryType === this.queryTypes.POWER_QUERY) {
      if (options.targets.length === 1) {
        const panelType = options.targets[0].panelType;
        return this.performPowerQuery(options, panelType);
      } 
      return {
        status: "error",
        message: "You can only have one power query per panel."
      };      
    }

    return this.performTimeseriesQuery(options);
  }

  annotationQuery(options) {
    const query = this.createLogsQueryForAnnotation(options);
    return this.backendSrv.datasourceRequest(query)
      .then( (response) => {
        const data = response.data;
        const timeField = options.annotation.timeField || "timestamp"
        const timeEndField = options.annotation.timeEndField || null
        const textField = options.annotation.textField || "message"
        return GenericDatasource.transformAnnotationResults(data.matches, timeField, timeEndField, textField);
      }
    );
  }

  /**
   * Grafana uses this function to test data source settings. 
   * This verifies API key using the facet query API. 
   * The endpoint returns 401 if the token is invalid.
   */
  testDatasource() {
    return this.backendSrv.datasourceRequest({
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
        return {
          status: "success",
          message: "Successfully connected to Scalyr!",
        };
      }   
      
      // We will never hit this but eslint complains about lack of return
      return {
        status: "error",
        message: `Scalyr returned HTTP code ${response.status}`
      };
    }).catch((err) => {
      let message = "Cannot connect to Scalyr!";
      if (err && err.data && err.data.message) {
        message = `${message} Scalyr repsponse - ${err.data.message}`;
      }
      return {
        status: "error",
        message
      };
    });
  }
  
  /**
   * Grafana uses this function to load metric values. 
   * @param {*} query - query options
   */
  metricFindQuery(query) {
    const d = new Date();

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
      const values = _.get(response, 'data.values', []);
      return values.map(value => 
        {
          return {
            text: value.value,
            value: value.value
          };
        }
      );
    });
  }

  /**
   * Default interpolator for Grafana variables for this datasource
   *
   * @param value The value of this variable
   * @param variable The Grafana variable information
   * @returns {string}
   */
  static interpolateVariable(value, variable) {
    if (typeof value === 'string') {
      if (variable.multi || variable.includeAll) {
        return "'" + value.replace(/'/g, `''`) + "'";
      }
      return value;
    }

    if (typeof value === 'number') {
      return value;
    }

    const quotedValues = _.map(value, val => {
      if (typeof value === 'number') {
        return value;
      }

      return "'" + val.replace(/'/g, `''`) + "'";
    });
    return quotedValues.join(',');
  }

  /**
   * Create a request to the scalyr time series endpoint.
   * @param {*} options 
   */
  createTimeSeriesQuery(options) {
    const queries = [];
    options.targets.forEach((target) => {
      const queryText = this.templateSrv.replace(target.queryText, options.scopedVars, GenericDatasource.interpolateVariable);
      let facetFunction = '';
      if (target.facet) {
        facetFunction = `${target.function || 'count'}(${target.facet})`;
      }
      const query = {
        startTime: options.range.from.valueOf(),
        endTime: options.range.to.valueOf(),
        buckets: GenericDatasource.getNumberOfBuckets(options),
        filter: queryText,
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
        queries
      })
    };
  }

  createLogsQueryForAnnotation(options) {
    const queryText = this.templateSrv.replace(options.annotation.queryText, options.scopedVars, GenericDatasource.interpolateVariable);

    return {
      url: this.url + '/query',
      method: 'POST',
      headers: this.headers,
      data: JSON.stringify({
        token: this.apiKey,
        queryType: "log",
        filter: queryText,
        startTime: options.range.from.valueOf(),
        endTime: options.range.to.valueOf(),
        maxCount: 5000
      })
    };
  }

  /**
   * Get how many buckets to return based on the query time range
   * @param {*} options 
   */
  static getNumberOfBuckets(options) {
    return Math.floor((options.range.to.valueOf() - options.range.from.valueOf()) / options.intervalMs);
  }

  /**
   * Perform the timeseries query using the Grafana proxy.
   * @param {*} options 
   */
  performTimeseriesQuery(options) {
    const query = this.createTimeSeriesQuery(options);
    return this.backendSrv.datasourceRequest(query)
      .then( (response) => {
        const data = response.data;
        return GenericDatasource.transformTimeSeriesResults(data.results, options);
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
  static transformTimeSeriesResults(results, options) {
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
      const conversionFactor = getValidConversionFactor(currentTarget.conversionFactor);
      for (let i = 0; i < dataValues.length; i += 1) {
        const dataValue = dataValues[i] * conversionFactor;
        responseObject.datapoints.push([dataValue, timeStamp]);
        timeStamp += options.intervalMs;
      }
      graphs.data.push(responseObject);
    });
    return graphs;
  }

  /**
   * Transform data returned by time series query into Grafana annotation format.
   * @param results
   * @param options
   * @returns Array
   */
  static transformAnnotationResults(results, timeField, timeEndField, textField) {
    const annotations = [];
    results.forEach((result) => {
      const responseObject = {};
      responseObject.time = Number(result[timeField]) / 1000000;
      if (!responseObject.time && result.attributes) {
        responseObject.time = Number(result.attributes[timeField]) / 1000000;
      }

      responseObject.text = result[textField];
      if (!responseObject.text && result.attributes) {
        responseObject.text = result.attributes[textField];
      }

      if (timeEndField && !(timeEndField.length === 0)) {
        responseObject.timeEnd = Number(result[timeEndField]) / 1000000;
        if (!responseObject.timeEnd && result.attributes) {
          responseObject.timeEnd = Number(result.attributes[timeEndField]) / 1000000;
        }
      }
      if (responseObject.time) {
        annotations.push(responseObject);
      }
    });
    return annotations;
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
      startTime,
      endTime
    };
    return {
      url: this.url + '/powerQuery',
      method: 'POST',
      headers: this.headers,
      data: JSON.stringify(query)
    };
  }

  /**
   * Perform the powerquery using Grafana proxy.
   * @param options
   * @returns {Promise<{data: *[]}> | *}
   */
  performPowerQuery(options, visualizationType) {
    const target = options.targets[0];
    const query = this.createPowerQuery(target.queryText, options.range.from.valueOf(), options.range.to.valueOf());
    return this.backendSrv.datasourceRequest(query).then( (response) => {
      const data = response && response.data;
      return this.transformPowerQueryData(data, visualizationType);
    });
  }

  /**
   * Transform power query data based on the visualization type
   * @param data data returned by the power query API
   * @returns {{data: Object[]}} transformed data that can be used by Grafana
   */
  transformPowerQueryData(data, visualizationType) {
    if (visualizationType === this.visualizationType.TABLE) {
      return this.transformPowerQueryDataToTable(data);
    }
    return GenericDatasource.transformPowerQueryDataToGraph(data);
  }

  /**
   * Transform data returned by power query to a graph format.
   * Each row is an individual series; this helps in looking at each value as bar in graphs.
   * @param {*} data 
   */
  static transformPowerQueryDataToGraph(data) {
    const result = [];
    const values = data.values;
    for (let i = 0; i < values.length; i += 1) {
      const dataValue = values[i];
      for (let j = 1; j < dataValue.length; j += 1) {
        const responseObject = {
          target: dataValue[0] + ": " + data.columns[j].name,
          datapoints: [[dataValue[j], Date.now()]]
        };
        result.push(responseObject);
      }
    }
    return {
      data: result
    };
  }

  /**
   * Transform Power Query Data in table format that Grafana needs.
   * https://grafana.com/docs/plugins/developing/datasources/#query
   * @param data
   * @returns {{data: *[]}}
   */
  transformPowerQueryDataToTable(data) {
    const cloneData = _.clone(data);
    cloneData.columns.map((col) => {col.text = col.name; return col;});

    return {
      data : [{
        type: this.visualizationType.TABLE,
        columns: cloneData.columns,
        rows: cloneData.values
      }]
    };
  }
}
