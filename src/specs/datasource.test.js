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

  const annotationQueryOptions = {
    range: {
      from: sixHoursAgo.toISOString(),
      to: now.toISOString()
    },
    interval: '5s',
    annotation: [
      {
        queryText: '$foo=\'bar\'',
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

  /* eslint-disable no-unused-vars */
  /* eslint-disable class-methods-use-this */
  class TestTemplateSrv {
    replace(a, b, c) {
      return a;
    }
  }
  /* eslint-enable no-unused-vars */
  /* eslint-enable class-methods-use-this */

  const datasource = new GenericDatasource(instanceSettings, {}, backendSrv, new TestTemplateSrv());

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
        columns: [{name: 'col1'}, {name: 'col2'}, {name: 'col3'}],
        warnings: [],
        values: [['r1', 1, 2], ['r2', 1, 2], ['r3', 1, 2], ['r4', 1, 2], ['r5', 1, 2], ['r6', 1, 2], ['r7', 1, 2], ['r8', 1, 2], ['r9', 1, 2], ['r10', 1, 2], ['r11', 1, 2], ['r12', 1, 2], ['r13', 1, 2]]
      };
    });
    
    it('Should transform power query results to table', () => {
      const transformedResults = datasource.transformPowerQueryDataToTable(results).data;
      expect(transformedResults.length).toBe(1);
      const resultEntry = transformedResults[0];
      expect(resultEntry.columns.length).toBe(3);
      expect(resultEntry.columns.some(x => x.text === 'col1')).toBeTruthy();
      expect(resultEntry.type).toBe('table');
      expect(resultEntry.rows.length).toBe(results.values.length);
      expect(resultEntry.rows.every(x => x.length === 3)).toBeTruthy();
      expect(resultEntry.rows.some(x => x[0] === 'r12')).toBeTruthy();
    });

    it('Should transform power query results to graph series', () => {
      const transformedResults = GenericDatasource.transformPowerQueryDataToGraph(results).data;
      expect(transformedResults.length).toBe(26);
      expect(transformedResults.some(x => x.target === 'r1: col2')).toBeTruthy();
      expect(transformedResults.some(x => x.target === 'r1: col3')).toBeTruthy();
      expect(transformedResults.every(x => x.datapoints.length === 1)).toBeTruthy();
    });
  });

  describe('Annotation queries', () => {
    let results;
    beforeEach(() => {
      results = [
      {
        timefield: 12345,
        messagefield: "testmessage1",
        timeendfield: 54321
      },
      {
        timefield: 12345,
        messagefield: "testmessage2",
        timeendfield: 54321,
        attributes: {
          timefield: 11111,
          messagefield: "wrong",
          timeendfield: 22222,
        }
      },
      {
        timefield: 12345,
        messagefield: "testmessage4",
        timeendfield: 54321,
        attributes: {
          timefield2: 123456,
          messagefield2: "testmessage5",
          timeendfield2: 543211,
        }
      }
      ];
    });
    it('Should create a query request', () => {
      const request = datasource.createLogsQueryForAnnotation(annotationQueryOptions, variables);
      expect(request.url).toBe('proxied/query');
      expect(request.method).toBe('POST');
      const requestBody = JSON.parse(request.data);
      expect(requestBody.token).toBe('123');
      expect(requestBody.queryType).toBe('log');
      expect(requestBody.startTime).toBe(sixHoursAgo.toISOString());
      expect(requestBody.endTime).toBe(now.toISOString());
    });

    it('Should transform standard query results to annotations', () => {
      const transformedResults = GenericDatasource.transformAnnotationResults(results, "timefield", "timeendfield", "messagefield");
      expect(transformedResults.length).toBe(3);
      const resultEntry = transformedResults[0];
      expect(resultEntry.text).toBe("testmessage1");
      expect(resultEntry.time).toBe(0.012345);
      expect(resultEntry.timeEnd).toBe(0.054321);
    });

    it('Should transform standard query results to annotations, falling back to attribute fields', () => {
      const transformedResults = GenericDatasource.transformAnnotationResults(results, "timefield2", "timeendfield2", "messagefield2");
      expect(transformedResults.length).toBe(3);
      const resultEntry = transformedResults[2];
      expect(resultEntry.text).toBe("testmessage5");
      expect(resultEntry.time).toBe(0.123456);
      expect(resultEntry.timeEnd).toBe(0.543211);
    });

    it('Should transform standard query results to annotations not from attributes first', () => {
      const transformedResults = GenericDatasource.transformAnnotationResults(results, "timefield", "timeendfield", "messagefield");
      expect(transformedResults.length).toBe(3);
      const resultEntry = transformedResults[1];
      expect(resultEntry.text).toBe("testmessage2");
      expect(resultEntry.time).toBe(0.012345);
      expect(resultEntry.timeEnd).toBe(0.054321);
    });

    it('Should transform standard query results to annotations with bad field names', () => {
      const transformedResults = GenericDatasource.transformAnnotationResults(results, "missingField", null, null);
      expect(transformedResults.length).toBe(3);
      const resultEntry = transformedResults[0];
      expect(resultEntry.text).toBe(undefined);
      expect(resultEntry.time).toBe(NaN);
      expect(resultEntry.timeEnd).toBe(undefined);
    });
  });

});
