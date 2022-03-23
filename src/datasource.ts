import { DataSourceInstanceSettings } from '@grafana/data';
import { DataSourceWithBackend, getTemplateSrv } from '@grafana/runtime';
import { MyDataSourceOptions, MyQuery } from './types';

export class DataSource extends DataSourceWithBackend<MyQuery, MyDataSourceOptions> {
  annotations = {};
  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
  }
  applyTemplateVariables(query: MyQuery) {
    const templateSrv = getTemplateSrv();
    return {
      ...query,
      expression: query.expression ? templateSrv.replace(query.expression) : '',
      queryType: query.queryType ? templateSrv.replace(query.queryType) : '',
    };
  }
  // async metricFindQuery(query: string, options?: any) {
  //   // Retrieve DataQueryResponse based on query.
  //   const response = await this.postResource('facet-query', { query: query, test: 'val' });

  //   // Convert query results to a MetricFindValue[]
  //   const values = response?.data.map((frame: { name: any }) => ({ text: frame.name }));

  //   return values;
  // }
}
