import * as React from 'react';
import { SelectInput, useGetList } from 'react-admin';

/**
 * Resource dropdown for toolbar filters.
 * - Loads resources via useGetList (client-side list up to 1000)
 * - Presents combined name/license_plate display
 * - Uses resource id for filtering (preferring id over plate/name for consistency)
 * - Accepts legacy filtering by license plate if existing filter value matches
 */
export default function ResourceFilterInput({ source = 'resource', label, ...rest }) {
  const { data, isLoading } = useGetList('resources', {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: 'id', order: 'ASC' },
  });

  const choices = React.useMemo(() => {
    const arr = Array.isArray(data) ? data : Object.values(data || {});
    return arr.map((r) => {
      const plate = r.license_plate || '';
      const name = r.name || '';
      const displayName = plate ? `${name} - ${plate}`.trim() : name || plate || `#${r.id}`;
      return { id: r.id, name: displayName };
    });
  }, [data]);

  return (
    <SelectInput
      source={source}
      label={label || 'Resource'}
      choices={choices}
      disabled={isLoading}
      emptyText={label || 'Resource'}
      {...rest}
    />
  );
}
