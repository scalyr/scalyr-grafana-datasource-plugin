import { DataSourceInstanceSettings, ScopedVars } from '@grafana/data';
import { DataSourceWithBackend, getTemplateSrv } from '@grafana/runtime';
import { MyDataSourceOptions, MyQuery } from './types';

export class DataSource extends DataSourceWithBackend<MyQuery, MyDataSourceOptions> {
  annotations = {};
  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
  }
  applyTemplateVariables(query: MyQuery, scopedVars: ScopedVars) {
    const templateSrv = getTemplateSrv();
    return {
      ...query,
      expression: templateSrv.replace(query.expression, scopedVars),
    };
  }
  async metricFindQuery(query: string, options?: any) {
    // Retrieve DataQueryResponse based on query.
    const response = await this.postResource('facet-query', { queryVariable: query });
    // Convert query results to a MetricFindValue[]
    const values = response?.value.map((frame: string) => ({ text: frame }));
    return values;
  }
}
