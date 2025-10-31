import * as React from 'react';
import { SelectInput, useGetList, useTranslate } from 'react-admin';

/**
 * Instructor dropdown for toolbar filters.
 * - Loads instructors via useGetList
 * - Default source: 'instructor_id'
 */
export default function InstructorFilterInput({ source = 'instructor_id', label, ...rest }) {
  const t = useTranslate();
  const { data, isLoading } = useGetList('instructors', {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: 'id', order: 'ASC' },
  });

  const choices = React.useMemo(() => {
    const arr = Array.isArray(data) ? data : Object.values(data || {});
    return arr.map((ins) => ({ id: ins.id, name: `${ins.first_name || ''} ${ins.last_name || ''}`.trim() }));
  }, [data]);

  return (
    <SelectInput
      source={source}
  label={label || t('resources.lessons.fields.instructor', { defaultValue: 'Instructor' })}
      choices={choices}
      disabled={isLoading}
      {...rest}
    />
  );
}
