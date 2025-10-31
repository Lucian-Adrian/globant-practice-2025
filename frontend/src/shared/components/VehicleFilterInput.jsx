import * as React from 'react';
import { SelectInput, useGetList, useTranslate } from 'react-admin';

/**
 * Resource dropdown for toolbar filters.
 * - Loads resources via useGetList
 * - Uses name or license plate as id to match existing filter usage
 * - Default source: 'resource'
 */
export default function VehicleFilterInput({ source = 'resource', label, ...rest }) {
  const { data, isLoading } = useGetList('resources', {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: 'id', order: 'ASC' },
  });

  const choices = React.useMemo(() => {
    const arr = Array.isArray(data) ? data : Object.values(data || {});
    return arr.map((r) => {
      const plate = r.license_plate || '';
      const name = r.name || '';
      const displayName = plate ? `${name} - ${plate}`.trim() : name;
      return { id: plate || name || r.id, name: displayName };
    });
  }, [data]);

  return (
    <SelectInput
      source={source}
      label={label || 'Resource'}
      choices={choices}
      disabled={isLoading}
      {...rest}
    />
  );
}
