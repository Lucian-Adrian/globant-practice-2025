import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  SimpleForm,
  TextInput,
  NumberInput,
  ArrayInput,
  SimpleFormIterator,
  SelectArrayInput,
  useNotify,
  ImageInput,
  ImageField,
} from 'react-admin';
import { Card, CardContent, CardHeader, Grid, Box } from '@mui/material';
import { useTranslate } from 'react-admin';
import QuickAddPanel from '../components/QuickAddPanel.tsx';
import { API_PREFIX, buildHeaders, rawFetch, httpJson } from '../api/httpClient.js';
import { VEHICLE_CATEGORIES } from '../shared/constants/drivingSchool.js';

// Public backend base (override with Vite env if provided)
const PUBLIC_BACKEND_BASE = (import.meta as any)?.env?.VITE_BACKEND_PUBLIC_BASE || 'http://localhost:8000';

function fixHost(u: string): string {
  if (!u) return '';
  let out = u;
  // Replace internal docker hostnames with public base
  out = out
    .replace('http://backend:8000', PUBLIC_BACKEND_BASE)
    .replace('https://backend:8000', PUBLIC_BACKEND_BASE)
    .replace('http://0.0.0.0:8000', PUBLIC_BACKEND_BASE)
    .replace('https://0.0.0.0:8000', PUBLIC_BACKEND_BASE);
  // Prefix bare media path
  if (out.startsWith('/media/')) out = `${PUBLIC_BACKEND_BASE}${out}`;
  return out;
}

interface Address {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface LandingText {
  en: string;
  ro: string;
  ru: string;
  [key: string]: string; // allow for future languages
}

interface SocialLinks {
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  [key: string]: string; // allow for future social platforms
}

interface Rules {
  min_theory_hours_before_practice: number;
  [key: string]: number; // allow for future rules
}

interface SchoolConfig {
  school_name: string;
  business_hours: string;
  email: string;
  contact_phone1: string;
  contact_phone2: string;
  school_logo: string;
  landing_image: string;
  addresses: Address[];
  landing_text: LandingText;
  social_links: SocialLinks;
  rules: Rules;
  available_categories: string[];
}
// Temporary mock until the real API exists (Task 1 JSON approximation)
const MOCK_CONFIG: SchoolConfig = {
  school_name: 'DriveAdmin School',
  business_hours: 'Mon-Fri 08:00-18:00',
  email: 'contact@driveadmin.example',
  contact_phone1: '+40 712 345 678',
  contact_phone2: '+40 723 456 789',
  school_logo: '',
  landing_image: '',
  addresses: [
    { line1: 'Str. Principală 10', line2: '', city: 'București', state: '', postal_code: '010101', country: 'RO' },
  ],
  landing_text: {
    en: 'Welcome to our driving school!',
    ro: 'Bine ați venit la școala noastră de șoferi!',
    ru: 'Добро пожаловать в нашу автошколу!',
  },
  social_links: {
    facebook: 'https://facebook.com/driveadmin',
    instagram: 'https://instagram.com/driveadmin',
    twitter: '',
    youtube: '',
  },
  rules: {
    min_theory_hours_before_practice: 10,
  },
  available_categories: ['B', 'C'],
};

async function uploadImageTo(endpoint: string, file: File, fieldName: 'logo' | 'image'): Promise<string> {
  const fd = new FormData();
  fd.append(fieldName, file);
  // Use rawFetch so 401 triggers a refresh and retries once
  const resp = await rawFetch(endpoint, { method: 'POST', headers: buildHeaders(), body: fd });
  const body = await resp.json().catch(() => ({} as any));
  if (!resp.ok) throw new Error(body?.detail || body?.message || 'Upload failed');
  // Backend returns specific keys; also support generic fallbacks
  const raw = body.school_logo || body.landing_image || body.url || body.location || body.path || '';
  return fixHost(raw);
}

const Configuration: React.FC = () => {
  const notify = useNotify();
  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState<SchoolConfig | null>(null);
  // IMPORTANT: call useTranslate unconditionally on every render (before any early returns)
  const translate = useTranslate();

  // Choices for categories
  const categoryChoices = useMemo(() => VEHICLE_CATEGORIES, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Use httpJson so token refresh happens automatically on 401
        const { json } = await httpJson(`${API_PREFIX}/school/config/`);
        if (mounted) {
          const normalized = { ...(json as any) };
          // Serializer provides only direct fields (no *_url); normalize existing values
          normalized.school_logo = fixHost((normalized as any).school_logo || '');
          normalized.landing_image = fixHost((normalized as any).landing_image || '');
          setInitial(normalized as any);
        }
      } catch (_) {
        if (mounted) setInitial(MOCK_CONFIG);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Loosen typing for react-admin form submit handler; we'll validate keys internally
  const onSubmit = async (values: any) => {
    try {
      const data: SchoolConfig = { ...values } as SchoolConfig;
      // Handle image inputs (ImageInput returns array of items)
      const logoVal: any = (values as any).school_logo;
      let logoUploadPerformed = false;
      let logoCleared = false;
      if (Array.isArray(logoVal) && logoVal.length) {
        const item = logoVal[0];
        if (item.rawFile instanceof File) {
          data.school_logo = await uploadImageTo(`${API_PREFIX}/school/config/upload_logo/`, item.rawFile as File, 'logo');
          logoUploadPerformed = true;
        } else if (item.src) {
          data.school_logo = fixHost(item.src);
        }
      } else if (typeof logoVal === 'string') {
        data.school_logo = fixHost(logoVal); // fallback plain string
      } else if (logoVal instanceof File) {
        data.school_logo = await uploadImageTo(`${API_PREFIX}/school/config/upload_logo/`, logoVal, 'logo');
        logoUploadPerformed = true;
      } else if (logoVal && typeof logoVal === 'object') {
        const src = logoVal.src || logoVal.url || logoVal.path || '';
        data.school_logo = fixHost(src);
      } else if (!logoVal) {
        logoCleared = true;
        data.school_logo = ''; // mark cleared
      }

      const landingVal: any = (values as any).landing_image;
      let landingUploadPerformed = false;
      let landingCleared = false;
      if (Array.isArray(landingVal) && landingVal.length) {
        const item = landingVal[0];
        if (item.rawFile instanceof File) {
          data.landing_image = await uploadImageTo(`${API_PREFIX}/school/config/upload_landing_image/`, item.rawFile as File, 'image');
          landingUploadPerformed = true;
        } else if (item.src) {
          data.landing_image = fixHost(item.src);
        }
      } else if (typeof landingVal === 'string') {
        data.landing_image = fixHost(landingVal);
      } else if (landingVal instanceof File) {
        data.landing_image = await uploadImageTo(`${API_PREFIX}/school/config/upload_landing_image/`, landingVal, 'image');
        landingUploadPerformed = true;
      } else if (landingVal && typeof landingVal === 'object') {
        const src = landingVal.src || landingVal.url || landingVal.path || '';
        data.landing_image = fixHost(src);
      } else if (!landingVal) {
        landingCleared = true;
        data.landing_image = '';
      }
      // Build payload excluding image fields if unchanged (avoid serializer complaining about non-file strings)
      const payload: any = { ...data };
      const initialLogo = (initial as any)?.school_logo || '';
      const initialLanding = (initial as any)?.landing_image || '';
      const logoUnchanged = !logoUploadPerformed && !logoCleared && (data.school_logo === initialLogo || data.school_logo === '' || typeof logoVal === 'undefined');
      const landingUnchanged = !landingUploadPerformed && !landingCleared && (data.landing_image === initialLanding || data.landing_image === '' || typeof landingVal === 'undefined');
      if (logoUnchanged) {
        delete payload.school_logo;
      } else if (logoCleared) {
        payload.school_logo = null; // explicit clear
      } else if (logoUploadPerformed) {
        // Already stored by upload endpoint; omit to avoid second validation
        delete payload.school_logo;
      }
      if (landingUnchanged) {
        delete payload.landing_image;
      } else if (landingCleared) {
        payload.landing_image = null;
      } else if (landingUploadPerformed) {
        delete payload.landing_image;
      }

      // PUT full config
      // Use rawFetch for PUT to auto-refresh on 401
      const putHeaders = buildHeaders();
      putHeaders.set('Content-Type', 'application/json');
      const resp = await rawFetch(`${API_PREFIX}/school/config/1/`, {
        method: 'PUT',
        headers: putHeaders,
        body: JSON.stringify(payload),
      });
      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(body?.detail || body?.message || 'Save failed');
      notify('Configuration saved', { type: 'success' });
      // Some backends omit image fields in PUT response; fetch full config to update previews
      try {
        const { json } = await httpJson(`${API_PREFIX}/school/config/`);
        const fullRaw = json as any;
        const full = {
          ...fullRaw,
          school_logo: fixHost(fullRaw.school_logo || data.school_logo || (initial as any)?.school_logo || ''),
          landing_image: fixHost(fullRaw.landing_image || data.landing_image || (initial as any)?.landing_image || ''),
        } as any;
        // Preserve just-uploaded URLs if GET lags
        const next = {
          ...(full || {}),
          school_logo: (full?.school_logo ?? data.school_logo ?? (initial as any)?.school_logo ?? ''),
          landing_image: (full?.landing_image ?? data.landing_image ?? (initial as any)?.landing_image ?? ''),
        } as SchoolConfig;
        setInitial(next);
      } catch (_) {
        // Fallback to local data merging so previews remain
        const next = {
          ...(initial || {}),
          ...(body || {}),
          school_logo: fixHost(body?.school_logo ?? data.school_logo ?? (initial as any)?.school_logo ?? ''),
          landing_image: fixHost(body?.landing_image ?? data.landing_image ?? (initial as any)?.landing_image ?? ''),
        } as SchoolConfig;
        setInitial(next);
      }
    } catch (e: any) {
      notify(e?.message || 'Save failed', { type: 'error' });
      throw e;
    }
  };

  if (loading || !initial) {
    return (
      <Box sx={{ p: 3 }}>
        <Card>
          <CardHeader title={translate('configuration.title', { defaultValue: 'School Configuration' })} />
          <CardContent>{translate('common.loading', { defaultValue: 'Loading…' })}</CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={7} lg={8}>
          <Card>
            <CardHeader title={translate('configuration.title', { defaultValue: 'School Configuration' })} />
            <CardContent>
              <SimpleForm onSubmit={onSubmit} defaultValues={initial}>
                {/* Basics */}
                <TextInput source="school_name" label={translate('configuration.school_name')} fullWidth />
                <TextInput source="business_hours" label={translate('configuration.business_hours')} fullWidth />
                <TextInput source="email" label={translate('configuration.email')} fullWidth />
                <TextInput source="contact_phone1" label={translate('configuration.contact_phone1')} fullWidth />
                <TextInput source="contact_phone2" label={translate('configuration.contact_phone2')} fullWidth />

                {/* Images */}
                <ImageInput
                  source="school_logo"
                  label={translate('configuration.school_logo')}
                  accept="image/*"
                  multiple={false}
                  placeholder={translate('configuration.image.placeholder', { defaultValue: 'Upload image' })}
                  format={(val: any) => {
                    if (!val) return [];
                    if (typeof val === 'string') return val ? [{ src: val }] : [];
                    // Support object from API like {path: 'image.jpg'} or {url: '...'}
                    if (typeof val === 'object' && !Array.isArray(val)) {
                      const src = val.src || val.url || val.path || '';
                      return src ? [{ src }] : [];
                    }
                    if (Array.isArray(val)) return val;
                    if (val.src) return [val];
                    return [];
                  }}
                  parse={(val: any) => {
                    if (!val) return [];
                    if (Array.isArray(val)) return val;
                    if (val instanceof File) {
                      return [{ src: URL.createObjectURL(val), rawFile: val }];
                    }
                    if (typeof val === 'string') return val ? [{ src: val }] : [];
                    if (typeof val === 'object' && (val.src || val.url || val.path)) {
                      const src = val.src || val.url || val.path;
                      return src ? [{ src, ...(val.rawFile ? { rawFile: val.rawFile } : {}) }] : [];
                    }
                    return [];
                  }}
                >
                  <ImageField source="src" />
                </ImageInput>
                <ImageInput
                  source="landing_image"
                  label={translate('configuration.landing_image')}
                  accept="image/*"
                  multiple={false}
                  placeholder={translate('configuration.image.placeholder', { defaultValue: 'Upload image' })}
                  format={(val: any) => {
                    if (!val) return [];
                    if (typeof val === 'string') return val ? [{ src: val }] : [];
                    if (typeof val === 'object' && !Array.isArray(val)) {
                      const src = val.src || val.url || val.path || '';
                      return src ? [{ src }] : [];
                    }
                    if (Array.isArray(val)) return val;
                    if (val.src) return [val];
                    return [];
                  }}
                  parse={(val: any) => {
                    if (!val) return [];
                    if (Array.isArray(val)) return val;
                    if (val instanceof File) {
                      return [{ src: URL.createObjectURL(val), rawFile: val }];
                    }
                    if (typeof val === 'string') return val ? [{ src: val }] : [];
                    if (typeof val === 'object' && (val.src || val.url || val.path)) {
                      const src = val.src || val.url || val.path;
                      return src ? [{ src, ...(val.rawFile ? { rawFile: val.rawFile } : {}) }] : [];
                    }
                    return [];
                  }}
                >
                  <ImageField source="src" />
                </ImageInput>

                {/* Addresses */}
        <ArrayInput source="addresses" label={translate('configuration.addresses')}>
                  <SimpleFormIterator inline>
          <TextInput source="line1" label={translate('configuration.address.line1')} fullWidth />
          <TextInput source="line2" label={translate('configuration.address.line2')} fullWidth />
          <TextInput source="city" label={translate('configuration.address.city')} />
          <TextInput source="state" label={translate('configuration.address.state')} />
          <TextInput source="postal_code" label={translate('configuration.address.postal_code')} />
          <TextInput source="country" label={translate('configuration.address.country')} />
                  </SimpleFormIterator>
                </ArrayInput>

                {/* Landing text (localized object) */}
                <TextInput source="landing_text.en" label={translate('configuration.landing_text.en')} multiline fullWidth />
                <TextInput source="landing_text.ro" label={translate('configuration.landing_text.ro')} multiline fullWidth />
                <TextInput source="landing_text.ru" label={translate('configuration.landing_text.ru')} multiline fullWidth />

                {/* Social links */}
                <TextInput source="social_links.facebook" label={translate('configuration.social_links.facebook')} fullWidth />
                <TextInput source="social_links.instagram" label={translate('configuration.social_links.instagram')} fullWidth />
                <TextInput source="social_links.twitter" label={translate('configuration.social_links.twitter')} fullWidth />
                <TextInput source="social_links.youtube" label={translate('configuration.social_links.youtube')} fullWidth />

                {/* Rules */}
                <NumberInput source="rules.min_theory_hours_before_practice" label={translate('configuration.rules.min_theory_hours_before_practice')} />

                {/* Available categories */}
                <SelectArrayInput source="available_categories" label={translate('configuration.available_categories')} choices={categoryChoices} optionValue="id" optionText="name" />
              </SimpleForm>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5} lg={4}>
          <QuickAddPanel />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Configuration;
