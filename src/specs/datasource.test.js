import {GenericDatasource} from '../datasource';

describe('Scalyr datasource tests', () => {
  const now = new Date();
  const sixHoursAgo = new Date(new Date().setHours(now.getHours() - 6)); // Time 6 hours ago.
  const queryTypes = {
    STANDARD_QUERY: 'Standard Query',
    POWER_QUERY: 'Power Query'
  };


  const standardQueryOptions = {
    range: {
      from: sixHoursAgo.toISOString(),
      to: now.toISOString()
    },
    interval: '5s',
    targets: [
      {
        conversionFactor: '10',
        label: 'Test',
        queryText: '$foo=\'bar\'',
        queryType: queryTypes.STANDARD_QUERY,
        facet: 'value',
        function: 'mean'
      }
    ]
  };

  const variables = [
    {
      multi: true,
      current: {
        text: 'value 1 + value 2',
        value: ['value 1', 'value 2'],
      },
      name: 'name',
      query: '$query',
      type: 'query'
    },
    {
      multi: false,
      current: {
        text: 'value',
        value: 'value',
      },
      name: 'name',
      query: '$query2',
      type: 'query'
    }
  ];

  const instanceSettings = {
    url: 'proxied',
    jsonData: {
      scalyrApiKey: '123',
      scalyrUrl: 'url'
    }
  };

  const backendSrv = {
    datasourceRequest: jest.fn()
  };

  const datasource = new GenericDatasource(instanceSettings, {}, backendSrv, {});

  describe('Time Series', () => {
    it('Should create a time series request', () => {
      const request = datasource.createTimeSeriesQuery(standardQueryOptions, variables);
      expect(request.url).toBe('proxied/timeSeriesApi');
      expect(request.method).toBe('POST');
      const requestBody = JSON.parse(request.data);
      expect(requestBody.token).toBe('123');
      expect(requestBody.queries.length).toBe(1);
      expect(requestBody.queries[0].startTime).toBe(sixHoursAgo.toISOString());
      expect(requestBody.queries[0].endTime).toBe(now.toISOString());
    });

    it('Should transform time series results', () => {
      const results = [
        {
          executionTime: 0,
          values: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        }
      ];
      const transformedData = GenericDatasource.transformTimeSeriesResults(results, standardQueryOptions);
      expect(transformedData.data.length).toBe(1);
      expect(transformedData.data[0].target).toBe('Test');
      const dataPoints = transformedData.data[0].datapoints;
      expect(dataPoints.length).toBe(results[0].values.length);
      dataPoints.forEach((point) => {
        expect(point[0]).toBe(10);
      });
    });
  });

  describe('Power queries', () => {
    let results;
    beforeEach(() => {
      results = {
        columns: [{name: 'col1'}, {name: 'col2'}],
        warnings: [],
        values: [['r1', 1], ['r2', 1], ['r3', 1], ['r4', 1], ['r5', 1], ['r6', 1], ['r7', 1], ['r8', 1], ['r9', 1], ['r10', 1], ['r11', 1], ['r12', 1], ['r13', 1]]
      };
    });
    
    it('Should transform power query results to table', () => {
      const transformedResults = datasource.transformPowerQueryDataToTable(results).data;
      expect(transformedResults.length).toBe(1);
      const resultEntry = transformedResults[0];
      expect(resultEntry.columns.length).toBe(2);
      expect(resultEntry.columns.some(x => x.text === 'col1')).toBeTruthy();
      expect(resultEntry.type).toBe('table');
      expect(resultEntry.rows.length).toBe(results.values.length);
      expect(resultEntry.rows.every(x => x.length === 2)).toBeTruthy();
      expect(resultEntry.rows.some(x => x[0] === 'r12')).toBeTruthy();
    });

    it('Should transform power query results to graph series', () => {
      const transformedResults = GenericDatasource.transformPowerQueryDataToGraph(results).data;
      expect(transformedResults.length).toBe(13);
      expect(transformedResults.some(x => x.target === 'r1')).toBeTruthy();
      expect(transformedResults.every(x => x.datapoints.length === 1)).toBeTruthy();
    });
  });

  describe('Conversion Factor', () => {
    it('Should convert fractions', () => {
      expect(GenericDatasource.getValidConversionFactor('1/4')).toBe(0.25);
    });

    it('Should return 1 for invalid conversion factor', () => {
      expect(GenericDatasource.getValidConversionFactor('xxx')).toBe(1);
    });
  });

  describe('Filter from variables', () => {
    it('Should return empty string when no variables are present', () => {
      expect(GenericDatasource.getFilterFromVariables([])).toBe('');
    });

    it('Should create or enteries for variables with multi property set to true', () => {
      const multiVariables = [
        {
          multi: true,
          current: {
            text: 'value 1 + value 2',
            value: ['value 1', 'value 2'],
          },
          name: 'name',
          query: '$query',
          type: 'query'
        }
      ];
      expect(GenericDatasource.getFilterFromVariables(multiVariables)).toBe("$query == 'value 1' or $query == 'value 2'");
    });

    it('Should handle multiple variables', () => {
      expect(GenericDatasource.getFilterFromVariables(variables)).toBe(" $query == 'value 1' or $query == 'value 2'$query2 == 'value' ");
    });
  });

});
