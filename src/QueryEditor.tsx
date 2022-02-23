import { defaults } from 'lodash';

import React, { ChangeEvent, PureComponent } from 'react';
import { InlineField, InlineFieldRow, Input } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './datasource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from './types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  onExpressionChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, expression: event.target.value });
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const expression = query.expression;

    return (
      <InlineFieldRow>
        <InlineField label="Expression" grow>
          <Input type="text" value={expression || ''} onChange={this.onExpressionChange} />
        </InlineField>
      </InlineFieldRow>
    );
  }
}
