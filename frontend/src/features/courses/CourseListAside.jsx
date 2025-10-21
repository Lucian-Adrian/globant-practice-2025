import * as React from 'react';
import ListAsideFilters from '../../shared/components/ListAsideFilters.jsx';
import { FilterList, FilterListItem, useTranslate } from 'react-admin';
import { fetchEnums, mapToChoices } from '../../api/enumsClient';

export default function CourseListAside() {
  const t = useTranslate();
  const [categoryChoices, setCategoryChoices] = React.useState([]);
  const [typeChoices, setTypeChoices] = React.useState([
    { id: 'THEORY', name: 'THEORY' },
    { id: 'PRACTICE', name: 'PRACTICE' },
  ]);

  React.useEffect(() => {
    let mounted = true;
    fetchEnums().then((enums) => {
      if (!mounted || !enums) return;
      const cat = mapToChoices(enums.vehicle_category);
      const typ = mapToChoices(enums.course_type);
      if (Array.isArray(cat) && cat.length) setCategoryChoices(cat);
      if (Array.isArray(typ) && typ.length) setTypeChoices(typ);
    });
    return () => { mounted = false; };
  }, []);

  return (
    <ListAsideFilters
      dateField="updated_at" // reuses same last-activity UI for courses
      statusItems={[
        { value: { status: 'ACTIVE' }, labelKey: 'filters.active', color: '#60a5fa' },
        { value: { status: 'INACTIVE' }, labelKey: 'filters.inactive', color: '#fbbf24' },
      ]}
    >
      {/* Category filter */}
      <FilterList label={t('resources.courses.fields.category', 'Category')}>
        {categoryChoices.map((c) => (
          <FilterListItem key={`cat-${c.id}`} label={c.name} value={{ category: c.id }} />
        ))}
      </FilterList>
      {/* Type filter */}
      <FilterList label={t('resources.courses.fields.type', 'Type')}>
        {typeChoices.map((c) => (
          <FilterListItem key={`type-${c.id}`} label={c.name} value={{ type: c.id }} />
        ))}
      </FilterList>
    </ListAsideFilters>
  );
}

