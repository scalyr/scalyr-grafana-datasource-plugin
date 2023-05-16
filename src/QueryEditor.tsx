import { defaults } from 'lodash';
import React, { ChangeEvent, ReactElement, useState } from 'react';
import { ActionMeta, InlineField, InlineFieldRow, Input, Select, MultiSelect, TextArea } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from './datasource';
import { defaultQuery, MyDataSourceOptions, MyQuery, queryTypes } from './types';
import { useFacetsQuery } from 'useFacetsQuery';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export function QueryEditor(props: Props): ReactElement {
  const { datasource } = props;
  const { loading, topFacets } = useFacetsQuery(datasource);
  const query = defaults(props.query, defaultQuery);
  const [ teamEmails, setTeamEmails ] = useState<Array<SelectableValue<string>>>(
    (query.teamEmails || []).map(v => ({label: v, value: v})));

  const onExpressionChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = props;
    onChange({ ...query, expression: event.target.value });
  };
  const onPQExpressionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { onChange, query } = props;
    onChange({ ...query, expression: event.target.value });
  };
  const onQueryTypeChange = (value: SelectableValue<string>, actionMeta: ActionMeta) => {
    const { onChange, query } = props;
    onChange({ ...query, queryType: value.value, expression: '' });
  };

  const onBreakDownChange = (value: SelectableValue<string>, actionMeta: ActionMeta) => {
    const { onChange, query, onRunQuery } = props;
    onChange({ ...query, breakDownFacetValue: value ? value.value : null, expression: query.expression });
    onRunQuery();
  };

  const onLabelChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = props;
    onChange({ ...query, label: event.target.value });
  };

  const onTeamEmailsChange = (values: Array<SelectableValue<string>>, actionMeta: ActionMeta) => {
    const { onChange, query, onRunQuery } = props;
    setTeamEmails(values);
    onChange({ ...query, teamEmails: values.length > 0 ? values.map((v) => {return v.value;}) : null });
    onRunQuery();
  };

  const onBlur = async () => {
    const { onRunQuery } = props;
    onRunQuery();
  };

  return (
    <>
      <InlineFieldRow>
        <InlineField label="Query Type" grow>
          <Select
            options={queryTypes}
            value={query.queryType}
            allowCustomValue
            onChange={onQueryTypeChange}
            defaultValue={query.queryType}
          />
        </InlineField>
      </InlineFieldRow>
      <InlineFieldRow>
        <InlineField label="Expression" grow>
          {query.queryType === 'Standard' ? (
            <Input type="text" value={query.expression || ''} onChange={onExpressionChange} onBlur={onBlur} />
          ) : (
            <TextArea value={query.expression || ''} rows={3} onChange={onPQExpressionChange} onBlur={onBlur} />
          )}
        </InlineField>
      </InlineFieldRow>
      <InlineFieldRow>
        {query.queryType === 'Standard' && (
          <InlineField label="Breakdown" grow>
            <Select
              options={topFacets}
              value={query.breakDownFacetValue}
              allowCustomValue
              isLoading={loading}
              disabled={!query.expression}
              onChange={onBreakDownChange}
              isClearable
              isSearchable
            />
          </InlineField>
        )}
      </InlineFieldRow>
      <InlineFieldRow>
        <InlineField label="Label" grow>
          <Input type="text" value={query.label || ''} onChange={onLabelChange} />
        </InlineField>
      </InlineFieldRow>
      <InlineFieldRow>
        <InlineField label="Team Emails" grow>
          <MultiSelect
            value={teamEmails}
            allowCustomValue
            isClearable
            onChange={onTeamEmailsChange}
          />
        </InlineField>
      </InlineFieldRow>
    </>
  );
}
