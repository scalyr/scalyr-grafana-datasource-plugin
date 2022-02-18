import { defaults } from 'lodash';

import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms, Select, InlineField } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from './datasource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from './types';

const { FormField } = LegacyForms;
const functionOptions = [
  { label: 'count', value: 'count' },
  { label: 'mean', value: 'mean' },
  { label: 'min', value: 'min' },
  { label: 'max', value: 'max' },
  { label: 'sum', value: 'sum' },
  { label: 'sumPerSecond', value: 'sumPerSecond' },
  { label: 'median', value: 'median' },
  { label: 'p10', value: 'p10' },
  { label: 'p50', value: 'p50' },
  { label: 'p90', value: 'p90' },
  { label: 'p95', value: 'p95' },
  { label: 'p99', value: 'p99' },
  { label: 'p999', value: 'p999' },
  { label: 'fraction', value: 'fraction' },
];

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  onFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, filter: event.target.value });
  };

  onFunctionChange = (selectable: SelectableValue<string>) => {
    if (!selectable?.value) {
      return;
    }
    const { onChange, query } = this.props;
    onChange({ ...query, func: selectable.value });
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const filter = query.filter;
    const func = query.func;

    return (
      <div className="gf-form">
        <FormField labelWidth={8} value={filter || ''} onChange={this.onFilterChange} label="Filter" />
        <InlineField label="Function" grow>
          <Select options={functionOptions} value={func} onChange={this.onFunctionChange} />
        </InlineField>
      </div>
    );
  }
}
