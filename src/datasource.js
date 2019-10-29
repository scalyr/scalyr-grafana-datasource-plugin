import _ from "lodash";

export class GenericDatasource {

  constructor(instanceSettings,$q,  backendSrv, templateSrv) {
    this.type = instanceSettings.type;
    this.url = instanceSettings.url;
    this.name = instanceSettings.name;
    this.apiKey = instanceSettings.jsonData.scalyrApiKey;
    this.backendSrv = backendSrv;
    this.q = $q;
    this.templateSrv = templateSrv;
    this.headers = {'Content-Type': 'application/json'};
  }

  query(options) {
    return this.performTimeseriesQuery(options);
  }

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

  getFilterFromVariables() {
    let variableFilter = '';
    if (this.templateSrv.variables && this.templateSrv.variables.length > 0) {
      this.templateSrv.variables.forEach((variable, index) => {
        const value = _.get(variable, 'current.value')
        if (variable.multi) {
          const valueCount =  value.length;
          for (let i = 0; i < valueCount; i++) {
            variableFilter = ` ${variableFilter + variable.query} == '${value[i]}' `;
            if (i !== valueCount - 1) {
              variableFilter += ' or '
            }
          }
        } else {
          variableFilter = ` ${variableFilter + variable.query} == '${value}' `;
        }
      })
    }
    return variableFilter;
  }

  getNumberOfBuckets(options) {
    return Math.floor((_.get(options, 'range.to').valueOf() - _.get(options, 'range.from').valueOf()) / options.intervalMs);
  }

  performTimeseriesQuery(options) {
    const query = this.createTimeSeriesQuery(options);
    return this.backendSrv.datasourceRequest(query)
      .then( (response) => {
        const data = response.data
        let graphs = {
          data: []
        };
        data.results.forEach((result, index) => {
          let timeStamp = options.range.from.valueOf();
          const dataValues = result.values;
          const currentTarget = options.targets[index];
          let responseObject = {
            target: currentTarget.label || currentTarget.queryText,
            datapoints: []
          }
          for (let i = 0; i <= dataValues.length; i++) {
            responseObject.datapoints.push([dataValues[i], timeStamp]);
            timeStamp += options.intervalMs
          }
          graphs.data.push(responseObject);
        })
        return graphs;
      }
    );
  }
  
  testDatasource() {
    return this.backendSrv.datasourceRequest({
      url: this.url + '/scalyrApi', 
      data: JSON.stringify({token: this.apiKey, queries: []}),
      method: 'POST'
    }).then(response => {
      if (response.status !== 401) {
        return { status: "success", message: "Data source is working", title: "Success" };
      }
    });
  }

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
      return response.data.values.map(value => 
        {
          return {
            text: value.value,
            value: value.value
          }
        }
      )
      //return response.data.values.map(value => value.value);
    })
  }
}