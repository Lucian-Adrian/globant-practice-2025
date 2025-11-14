import * as React from 'react';
import { ReferenceInput, SelectInput } from 'react-admin';

/**
 * Resource dropdown for toolbar filters.
 * - Loads resources via useGetList (client-side list up to 1000)
 * - Presents combined name/license_plate display
 * - Uses resource id for filtering (preferring id over plate/name for consistency)
 * - Accepts legacy filtering by license plate if existing filter value matches
 */
export default function ResourceFilterInput({ source = 'resource_id', label, onlyVehicles = false, onlyClassrooms = false, ...rest }) {
  const baseFilter = rest.filter || {};
  let filter = baseFilter;
  if (onlyVehicles) {
    filter = { ...filter, max_capacity: 2 };
  } else if (onlyClassrooms) {
    // Backend supports gte/lte, not gt; use >= 3 to select classrooms
    filter = { ...filter, max_capacity_gte: 3 };
  }

  return (
    <ReferenceInput
      source={source}
      reference="resources"
      filter={filter}
      perPage={200}
      sort={{ field: 'license_plate', order: 'ASC' }}
      {...rest}
    >
      <SelectInput
        label={label || 'Resource'}
        optionText={(r) => r.license_plate || r.name || '—'}
        optionValue="id"
        emptyText={label || 'Resource'}
      />
    </ReferenceInput>
  );
}
