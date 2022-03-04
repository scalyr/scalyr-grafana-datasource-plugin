import { defaults } from 'lodash';

import React, { ChangeEvent, PureComponent } from 'react';
import { ActionMeta, InlineField, InlineFieldRow, Input, Select, TextArea } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from './datasource';
import { defaultQuery, MyDataSourceOptions, MyQuery, queryTypes } from './types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  onExpressionChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, expression: event.target.value });
  };
  onPQExpressionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, expression: event.target.value });
  };
  onQueryTypeChange = (value: SelectableValue<string>, actionMeta: ActionMeta) => {
    const { onChange, query } = this.props;
    onChange({ ...query, queryType: value.value, expression: '' });
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const expression = query.expression;
    const value = query.queryType;
    return (
      <>
        <InlineFieldRow>
          <InlineField label="Query Type" grow>
            <Select
              options={queryTypes}
              value={value}
              allowCustomValue
              onChange={this.onQueryTypeChange}
              defaultValue={value}
            />
          </InlineField>
        </InlineFieldRow>
        <InlineFieldRow>
          <InlineField label="Expression" grow>
            {value === 'Standard' ? (
              <Input type="text" value={expression || ''} onChange={this.onExpressionChange} />
            ) : (
              <TextArea value={expression || ''} cols={4} onChange={this.onPQExpressionChange} />
            )}
          </InlineField>
        </InlineFieldRow>
      </>
    );
  }
}
