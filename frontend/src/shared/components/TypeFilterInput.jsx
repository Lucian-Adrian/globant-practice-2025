import * as React from 'react';
import { SelectInput, useTranslate } from 'react-admin';
import { fetchEnums, mapToChoices } from '../../api/enumsClient';

/**
 * Reusable SelectInput for type loaded from enums endpoint.
 * Props:
 * - source: filter field name (default 'type')
 * - enumKey: enums key to read (default 'course_type')
 * - label: label (optional)
 * - ...rest: forwarded to SelectInput
 */
export default function TypeFilterInput({ source = 'type', enumKey = 'course_type', label, ...rest }) {
  const t = useTranslate();
  const [choices, setChoices] = React.useState([
    { id: 'THEORY', name: 'THEORY' },
    { id: 'PRACTICE', name: 'PRACTICE' },
  ]);

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
      label={label || t('resources.courses.fields.type', { defaultValue: 'Type' })}
      {...rest}
    />
  );
}
