import * as React from 'react';
import { SelectInput, useGetList } from 'react-admin';

/**
 * Vehicle dropdown for toolbar filters.
 * - Loads vehicles via useGetList
 * - Uses license plate as id to match existing 'vehicle' filter usage
 * - Default source: 'vehicle'
 */
export default function VehicleFilterInput({ source = 'vehicle', label, ...rest }) {
  const { data, isLoading } = useGetList('vehicles', {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: 'id', order: 'ASC' },
  });

  const choices = React.useMemo(() => {
    const arr = Array.isArray(data) ? data : Object.values(data || {});
    return arr.map((v) => {
      const plate = v.license_plate || '';
      const name = plate ? `${v.make || ''} ${v.model || ''} - ${plate}`.trim() : `${v.make || ''} ${v.model || ''}`.trim();
      return { id: plate || name, name };
    });
  }, [data]);

  return (
    <SelectInput
      source={source}
      label={label || 'Vehicle'}
      choices={choices}
      disabled={isLoading}
      {...rest}
    />
  );
}
