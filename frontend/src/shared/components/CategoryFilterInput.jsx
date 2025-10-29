import * as React from 'react';
import { SelectInput, useTranslate } from 'react-admin';
import { fetchEnums, mapToChoices } from '../../api/enumsClient';

/**
 * Reusable SelectInput for categories loaded from enums endpoint.
 * Props:
 * - source: filter field name (default 'category')
 * - enumKey: enums key to read (default 'vehicle_category')
 * - label: label (optional)
 * - ...rest: forwarded to SelectInput
 */
export default function CategoryFilterInput({ source = 'category', enumKey = 'vehicle_category', label, ...rest }) {
  const t = useTranslate();
  const [choices, setChoices] = React.useState([]);

  React.useEffect(() => {
    let mounted = true;
    fetchEnums().then((enums) => {
      if (!mounted || !enums) return;
      const items = mapToChoices(enums?.[enumKey]);
      if (Array.isArray(items) && items.length) setChoices(items);
    });
    return () => { mounted = false; };
  }, [enumKey]);

  return (
    <SelectInput
      source={source}
      choices={choices}
      label={label || t('resources.courses.fields.category', { defaultValue: 'Category' })}
      {...rest}
    />
  );
}
