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
} from 'react-admin';
import { Card, CardContent, CardHeader, Grid, Box } from '@mui/material';
import { useTranslate } from 'react-admin';
import QuickAddPanel from '../components/QuickAddPanel.tsx';
import { API_PREFIX, buildHeaders } from '../api/httpClient.js';
import { VEHICLE_CATEGORIES } from '../shared/constants/drivingSchool.js';

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

async function uploadImageTo(endpoint: string, file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const resp = await fetch(endpoint, { method: 'POST', body: fd });
  const body = await resp.json().catch(() => ({} as any));
  if (!resp.ok) throw new Error(body?.detail || body?.message || 'Upload failed');
  // Expect API to return { url: '...' } or similar
  return body.url || body.location || body.path || '';
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
        // Try real API first
        const resp = await fetch(`${API_PREFIX}/v1/school/config/`, { headers: buildHeaders() });
        if (resp.ok) {
          const data = await resp.json();
          if (mounted) setInitial(data);
        } else {
          if (mounted) setInitial(MOCK_CONFIG);
        }
      } catch (_) {
        if (mounted) setInitial(MOCK_CONFIG);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const onSubmit = async (values: SchoolConfig) => {
    try {
      const data: SchoolConfig = { ...values };

  // Handle potential future image uploads (currently using plain URL text inputs)
      if (data.school_logo) {
        const s = data.school_logo as any;
        if (s.rawFile instanceof File) {
          const url = await uploadImageTo(`${API_PREFIX}/v1/school/config/upload_logo/`, s.rawFile as File);
          data.school_logo = url;
        } else if (typeof s === 'object' && typeof s.src === 'string') {
          data.school_logo = s.src;
        }
      }
      if (data.landing_image) {
        const s = data.landing_image as any;
        if (s.rawFile instanceof File) {
          const url = await uploadImageTo(`${API_PREFIX}/v1/school/config/upload_landing_image/`, s.rawFile as File);
          data.landing_image = url;
        } else if (typeof s === 'object' && typeof s.src === 'string') {
          data.landing_image = s.src;
        }
      }

      // PUT full config
      const resp = await fetch(`${API_PREFIX}/v1/school/config/`, {
        method: 'PUT',
        headers: new Headers({ 'Content-Type': 'application/json', ...Object.fromEntries(buildHeaders().entries()) }),
        body: JSON.stringify(data),
      });
      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(body?.detail || body?.message || 'Save failed');
      notify('Configuration saved', { type: 'success' });
      setInitial(body || data);
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

                {/* Images (simplified as plain text inputs for now) */}
                <TextInput source="school_logo" label={translate('configuration.school_logo')} fullWidth />
                <TextInput source="landing_image" label={translate('configuration.landing_image')} fullWidth />

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
