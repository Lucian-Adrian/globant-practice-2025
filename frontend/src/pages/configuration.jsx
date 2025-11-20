// import * as React from 'react';
// import { useEffect, useMemo, useState } from 'react';
// import {
//   SimpleForm,
//   TextInput,
//   NumberInput,
//   ArrayInput,
//   SimpleFormIterator,
//   SelectArrayInput,
//   ImageInput,
//   ImageField,
//   useNotify,
//   RecordContextProvider,
//   TranslatableInputs
// } from 'react-admin';
// import { Card, CardContent, CardHeader, Grid, Box } from '@mui/material';
// import QuickAddPanel from '../components/QuickAddPanel.tsx';
// import { API_PREFIX, buildHeaders } from '../api/httpClient.js';
// import { VEHICLE_CATEGORIES } from '../shared/constants/drivingSchool.js';

// // Mock fallback config
// const MOCK_CONFIG = {
//   school_name: 'DriveAdmin School',
//   business_hours: 'Mon-Fri 08:00-18:00',
//   email: 'contact@driveadmin.example',
//   contact_phone1: '+40 712 345 678',
//   contact_phone2: '+40 723 456 789',
//   school_logo: '',
//   landing_image: '',
//   addresses: [
//     { line1: 'Str. Principală 10', line2: '', city: 'București', state: '', postal_code: '010101', country: 'RO' },
//   ],
//   landing_text: {
//     en: 'Welcome to our driving school!',
//     ro: 'Bine ați venit la școala noastră de șoferi!',
//     ru: 'Добро пожаловать в нашу автошколу!',
//   },
//   social_links: {
//     facebook: 'https://facebook.com/driveadmin',
//     instagram: 'https://instagram.com/driveadmin',
//     twitter: '',
//     youtube: '',
//   },
//   rules: {
//     min_theory_hours_before_practice: 10,
//   },
//   available_categories: ['B', 'C'],
// };

// async function uploadImageTo(endpoint, file) {
//   const fd = new FormData();
//   fd.append('file', file);
//   const resp = await fetch(endpoint, { method: 'POST', headers: buildHeaders(), body: fd });
//   const body = await resp.json().catch(() => ({}));
//   if (!resp.ok) throw new Error(body?.detail || body?.message || 'Upload failed');
//   return body.url || body.location || body.path || '';
// }

// export default function Configuration() {
//   const notify = useNotify();
//   const [loading, setLoading] = useState(true);
//   const [record, setRecord] = useState(null);
//   const categoryChoices = useMemo(() => VEHICLE_CATEGORIES, []);

//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         const resp = await fetch(`${API_PREFIX}/v1/school/config/`, { headers: buildHeaders() });
//         if (resp.ok) {
//           const data = await resp.json();
//           if (mounted) setRecord(data);
//         } else {
//           if (mounted) setRecord(MOCK_CONFIG);
//         }
//       } catch (_) {
//         if (mounted) setRecord(MOCK_CONFIG);
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     })();
//     return () => { mounted = false; };
//   }, []);

//   const onSubmit = async (values) => {
//     try {
//       const data = { ...values };
//       if (data.school_logo) {
//         const s = data.school_logo;
//         if (s.rawFile instanceof File) data.school_logo = await uploadImageTo(`${API_PREFIX}/v1/school/config/upload_logo/`, s.rawFile);
//         else if (typeof s === 'object' && typeof s.src === 'string') data.school_logo = s.src;
//       }
//       if (data.landing_image) {
//         const s = data.landing_image;
//         if (s.rawFile instanceof File) data.landing_image = await uploadImageTo(`${API_PREFIX}/v1/school/config/upload_landing_image/`, s.rawFile);
//         else if (typeof s === 'object' && typeof s.src === 'string') data.landing_image = s.src;
//       }
//       const resp = await fetch(`${API_PREFIX}/v1/school/config/`, {
//         method: 'PUT',
//         headers: new Headers({ 'Content-Type': 'application/json', ...Object.fromEntries(buildHeaders().entries()) }),
//         body: JSON.stringify(data),
//       });
//       const body = await resp.json().catch(() => ({}));
//       if (!resp.ok) throw new Error(body?.detail || body?.message || 'Save failed');
//       notify('common.configuration.saved', { type: 'success', messageArgs: { defaultValue: 'Configuration saved' } });
//       setRecord(body || data);
//     } catch (e) {
//       notify(e?.message || 'Save failed', { type: 'error' });
//       throw e;
//     }
//   };

//   if (loading || !record) {
//     return (
//       <Box sx={{ p: 3 }}>
//         <Card>
//           <CardHeader title="Configuration" />
//           <CardContent>Loading…</CardContent>
//         </Card>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ p: 3 }}>
//       <Grid container spacing={3}>
//         <Grid item xs={12} md={7} lg={8}>
//           <Card>
//             <CardHeader title="School Configuration" />
//             <CardContent>
//               <RecordContextProvider value={record}>
//                 <SimpleForm onSubmit={onSubmit} defaultValues={record}>
//                   <TextInput source="school_name" label="School Name" fullWidth />
//                   <TextInput source="business_hours" label="Business Hours" fullWidth />
//                   <TextInput source="email" label="Email" fullWidth />
//                   <TextInput source="contact_phone1" label="Contact Phone 1" fullWidth />
//                   <TextInput source="contact_phone2" label="Contact Phone 2" fullWidth />

//                   <ImageInput source="school_logo" label="School Logo" accept="image/*" multiple={false}
//                     format={v => v ? (typeof v === 'string' ? { src: v } : v) : null}
//                     parse={v => v}
//                   >
//                     <ImageField source="src" title="title" />
//                   </ImageInput>
//                   <ImageInput source="landing_image" label="Landing Image" accept="image/*" multiple={false}
//                     format={v => v ? (typeof v === 'string' ? { src: v } : v) : null}
//                     parse={v => v}
//                   >
//                     <ImageField source="src" title="title" />
//                   </ImageInput>

//                   <ArrayInput source="addresses" label="Addresses">
//                     <SimpleFormIterator inline>
//                       <TextInput source="line1" label="Line 1" fullWidth />
//                       <TextInput source="line2" label="Line 2" fullWidth />
//                       <TextInput source="city" label="City" />
//                       <TextInput source="state" label="State" />
//                       <TextInput source="postal_code" label="Postal Code" />
//                       <TextInput source="country" label="Country" />
//                     </SimpleFormIterator>
//                   </ArrayInput>

//                   <TranslatableInputs locales={['en','ro','ru']} groupKey="landing_text">
//                     <TextInput source="landing_text.en" label="Landing Text (EN)" multiline fullWidth />
//                     <TextInput source="landing_text.ro" label="Landing Text (RO)" multiline fullWidth />
//                     <TextInput source="landing_text.ru" label="Landing Text (RU)" multiline fullWidth />
//                   </TranslatableInputs>

//                   <TextInput source="social_links.facebook" label="Facebook" fullWidth />
//                   <TextInput source="social_links.instagram" label="Instagram" fullWidth />
//                   <TextInput source="social_links.twitter" label="Twitter" fullWidth />
//                   <TextInput source="social_links.youtube" label="YouTube" fullWidth />

//                   <NumberInput source="rules.min_theory_hours_before_practice" label="Min theory hours before practice" />

//                   <SelectArrayInput source="available_categories" label="Available Categories" choices={categoryChoices} optionValue="id" optionText="name" />
			<QuickAddPanel />
//           <Card>
//             <CardHeader title="Quick Add" />
//             <CardContent>
//               <QuickAddPanel />
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// }
