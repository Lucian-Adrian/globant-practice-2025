import * as React from 'react';
import { useInput } from 'react-admin';
import { validatePhone, toE164 } from '../phoneUtils';

const COUNTRY_CODES = [
  '+373','+40','+49','+33','+39','+41','+44','+34','+351','+1','+7','+380','+48','+386','+372'
].map(c => ({ code: c, label: c }));

export function PhoneInput({ source, validate = [], required: req, ...rest }) {
  const {
    field,
    fieldState: { error },
    isRequired,
  } = useInput({ source, validate, ...rest });

  // Split existing value
  const initial = field.value || '';
  const initMatch = initial.match(/^(\+\d{1,4})(\d+)$/);
  const [countryCode, setCountryCode] = React.useState(initMatch ? initMatch[1] : '+373');
  const [local, setLocal] = React.useState(initMatch ? initMatch[2] : '');

  const fullPhone = React.useMemo(() => toE164(countryCode, local), [countryCode, local]);

  React.useEffect(() => {
    field.onChange(fullPhone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullPhone]);

  const onCcChange = (e) => setCountryCode(e.target.value);
  const onLocalChange = (e) => {
    const digits = e.target.value.replace(/[^0-9]/g, '');
    setLocal(digits);
  };

  const showError = error && (typeof error.message === 'string' ? error.message : String(error.message));
  const isValid = !local ? false : validatePhone(countryCode, local);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: '.5rem' }}>
        <select value={countryCode} onChange={onCcChange} style={{ width: '30%' }} aria-label="Country code">
          {COUNTRY_CODES.map(c => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
        <input
          type="tel"
          value={local}
          onChange={onLocalChange}
          onBlur={() => field.onBlur()}
          placeholder="60123456"
          aria-invalid={!!showError}
          style={{ flex: 1, borderColor: local && !isValid ? 'red' : undefined }}
        />
      </div>
  <input type="hidden" name={source} value={isValid ? fullPhone : ''} />
      {showError && (
        <span style={{ color: 'red', fontSize: '.75rem' }}>{showError}</span>
      )}
      {local && !isValid && !showError && (
        <span style={{ color: 'red', fontSize: '.75rem' }}>Invalid phone</span>
      )}
    </div>
  );
}

export default PhoneInput;
