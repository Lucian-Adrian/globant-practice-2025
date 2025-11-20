import * as React from 'react';
import { SelectInput, useGetList, useTranslate } from 'react-admin';

/**
 * Pattern dropdown for toolbar filters.
 * - Loads patterns via useGetList
 * - Default source: 'pattern_id'
 */
export default function PatternFilterInput({ source = 'pattern_id', label, ...rest }) {
  const t = useTranslate();
  const { data, isLoading } = useGetList('scheduledclasspatterns', {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: 'name', order: 'ASC' },
  });

  const choices = React.useMemo(() => {
    const arr = Array.isArray(data) ? data : Object.values(data || {});
    return arr.map((pattern) => ({ id: pattern.id, name: pattern.name }));
  }, [data]);

  return (
    <SelectInput
      source={source}
      label={label || t('resources.scheduledclasses.fields.pattern', { defaultValue: 'Pattern' })}
      choices={choices}
      disabled={isLoading}
      {...rest}
    />
  );
}