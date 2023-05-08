import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface MyQuery extends DataQuery {
  expression: string;
  queryType: any;
  breakDownFacetValue: string | undefined | null;
  label: string | undefined | null;
  accountEmails: string[] | undefined | null;
}

export const defaultQuery: Partial<MyQuery> = {
  expression: '',
  queryType: 'Standard',
  breakDownFacetValue: '',
  label: '',
};

export const queryTypes = [
  { label: 'Standard', value: 'Standard' },
  { label: 'Power Query', value: 'Power Query' },
];

/**
 * These are options configured for each DataSource instance.
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  scalyrUrl?: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface MySecureJsonData {
  apiKey?: string;
}
