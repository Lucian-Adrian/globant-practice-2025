import * as React from 'react';
import { SearchInput as RA_SearchInput, useTranslate } from 'react-admin';

/**
 * Shared search input using 'q' query param (backend supports QSearchFilter).
 * Props:
 * - source: filter field name (default 'q')
 * - placeholderKey: i18n key for placeholder
 * - ...rest: forwarded to RA SearchInput
 */
export default function SearchInput({ source = 'q', placeholderKey = 'ra.action.search', ...rest }) {
  const t = useTranslate();
  const placeholder = t(placeholderKey, { defaultValue: 'Search…' });
  return (
    <RA_SearchInput source={source} placeholder={placeholder} {...rest} />
  );
}
