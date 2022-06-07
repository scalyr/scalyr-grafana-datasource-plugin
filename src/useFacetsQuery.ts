import { useAsync } from 'react-use';
import { SelectableValue } from '@grafana/data';
import { DataSource } from 'datasource';

type AsyncTopFacetsState = {
  loading: boolean;
  topFacets: Array<SelectableValue<string>>;
  error: Error | undefined;
};

export function useFacetsQuery(datasource: DataSource): AsyncTopFacetsState {
  const result = useAsync(async () => {
    const { facets } = await datasource.postResource('top-facets');
    return facets.map((facet: { name: string }) => ({
      label: facet.name,
      value: facet.name,
    }));
  }, [datasource]);
  return {
    loading: result.loading,
    topFacets: result.value ?? [],
    error: result.error,
  };
}
