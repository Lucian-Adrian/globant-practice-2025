import StudentListAside from './students/StudentListAside';
import InstructorListAside from './instructors/InstructorListAside';
import translations from './translations';
import { LanguageContext as _LangContext, translateMessage as _translateMessage } from './i18n';

import * as React from 'react';
import {
  Admin,
  Resource,
  List,
  Datagrid,
  FunctionField,
  Show,
  SimpleShowLayout,
  Filter,
  TopToolbar,
  Button,
  CreateButton,
  TextField,
  EmailField,
  DateField,
  NumberField,
  BooleanField,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  DateInput,
  BooleanInput,
  SelectInput,
  ReferenceInput,
  fetchUtils,
  required,
  useListContext,
  useNotify,
  useRefresh,
} from 'react-admin';
import { Card, CardContent, Box, Stack, Typography } from '@mui/material';

// Use relative base URL so the browser hits the Vite dev server, which proxies to the backend container
const baseApi = '/api';

// Map React-Admin resource names to DRF endpoints and ensure trailing slash
const mapResource = (resource) => {
  const mapping = { classes: 'courses' };
  const name = mapping[resource] || resource;
  return `${name}/`;
};

const httpClient = (url, options = {}) => {
  const opts = { ...options };
  opts.headers = new Headers(opts.headers || { 'Content-Type': 'application/json' });
  return fetchUtils.fetchJson(url, opts);
};

const buildQuery = (params) => {
  const { page, perPage } = params.pagination || { page: 1, perPage: 25 };
  const query = new URLSearchParams();

  // paginație
  query.set('page', String(page));
  query.set('page_size', String(perPage));

  // filtre (mapăm *_gte -> __gte etc., pentru DRF)
  if (params.filter) {
    Object.entries(params.filter).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return;

      // detectăm sufixele uzuale și le convertim la notatia DRF
      const m = k.match(/^(.*)_(gte|lte|gt|lt)$/);
      const key = m ? `${m[1]}__${m[2]}` : k;

      query.set(key, String(v));
    });
  }

  // sortare (RA -> DRF: ?ordering=field | -field)
  if (params.sort && params.sort.field) {
    const { field, order } = params.sort;
    const ordering = order === 'DESC' ? `-${field}` : field;
    query.set('ordering', ordering);
  }

  return query.toString();
};

// Build only filter + sort query (no pagination) for export
const buildFilterSortQuery = (filterValues, sort) => {
  const query = new URLSearchParams();
  if (filterValues) {
    Object.entries(filterValues).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return;
      const m = k.match(/^(.*)_(gte|lte|gt|lt)$/);
      const key = m ? `${m[1]}__${m[2]}` : k;
      query.set(key, String(v));
    });
  }
  if (sort && sort.field) {
    const { field, order } = sort;
    const ordering = order === 'DESC' ? `-${field}` : field;
    query.set('ordering', ordering);
  }
  return query.toString();
};

// --- ADDED: simple language context + messages ---
// Re-export LanguageContext / translateMessage from i18n
export const LanguageContext = _LangContext;
const translateMessage = _translateMessage;
// --- end added ---

const StudentListActions = () => {
  const { filterValues, sort } = useListContext();
  const notify = useNotify();
  const refresh = useRefresh();

  // consume language context
  const { locale, setLocale, t } = React.useContext(LanguageContext);

  const onExport = () => {
    const qs = buildFilterSortQuery(filterValues, sort);
    const url = `${baseApi}/students/export/${qs ? `?${qs}` : ''}`;
    // Trigger file download in a new tab
    window.open(url, '_blank');
  };

  const fileInputRef = React.useRef(null);
  const onImportClick = () => fileInputRef.current?.click();
  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const form = new FormData();
      form.append('file', file);
      const resp = await fetch(`${baseApi}/students/import/`, {
        method: 'POST',
        body: form,
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || 'Import failed');
      }
      const json = await resp.json();
      notify(`Imported ${json.created} students`, { type: 'info' });
      refresh();
    } catch (err) {
      notify(err.message || 'Import failed', { type: 'warning' });
    } finally {
      // Reset input so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <TopToolbar>
      <CreateButton label={t('actions.create')} />
      <Button label={t('actions.import_csv')} onClick={onImportClick} />
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept=".csv,text/csv"
        style={{ display: 'none' }}
      />
      <Button label={t('actions.export_csv')} onClick={onExport} />

      {/* language selector */}
      <div style={{ marginLeft: 12, display: 'inline-flex', alignItems: 'center' }}>
        <label style={{ marginRight: 6, fontSize: 13 }}>{t('actions.language')}:</label>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
          style={{ padding: 6, borderRadius: 4 }}
        >
          <option value="en">English</option>
          <option value="ro">Română</option>
          <option value="ru">Русский</option>
        </select>
      </div>
    </TopToolbar>
  );
};

const InstructorListActions = () => {
  const { filterValues, sort } = useListContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const { locale, setLocale, t } = React.useContext(LanguageContext);

  const onExport = () => {
    const qs = buildFilterSortQuery(filterValues, sort);
    const url = `${baseApi}/instructors/export/${qs ? `?${qs}` : ''}`;
    window.open(url, '_blank');
  };

  const fileInputRef = React.useRef(null);
  const onImportClick = () => fileInputRef.current?.click();
  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const form = new FormData();
      form.append('file', file);
      const resp = await fetch(`${baseApi}/instructors/import/`, {
        method: 'POST',
        body: form,
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || 'Import failed');
      }
      const json = await resp.json();
      notify(`Imported ${json.created} instructors`, { type: 'info' });
      refresh();
    } catch (err) {
      notify(err.message || 'Import failed', { type: 'warning' });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <TopToolbar>
      <CreateButton label={t('actions.create')} />
      <Button label={t('actions.import_csv')} onClick={onImportClick} />
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept=".csv,text/csv"
        style={{ display: 'none' }}
      />
      <Button label={t('actions.export_csv')} onClick={onExport} />

      <div style={{ marginLeft: 12, display: 'inline-flex', alignItems: 'center' }}>
        <label style={{ marginRight: 6, fontSize: 13 }}>{t('actions.language')}:</label>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
          style={{ padding: 6, borderRadius: 4 }}
        >
          <option value="en">English</option>
          <option value="ro">Română</option>
          <option value="ru">Русский</option>
        </select>
      </div>
    </TopToolbar>
  );
};


const dataProvider = {
  getList: async (resource, params) => {
    const resName = mapResource(resource);
    const qs = buildQuery(params);
    const url = `${baseApi}/${resName}?${qs}`;
    const { json } = await httpClient(url);
    const data = Array.isArray(json) ? json : json.results || [];
    const total = Array.isArray(json) ? json.length : json.count ?? data.length;
    return { data, total };
  },
  getOne: async (resource, params) => {
    const resName = mapResource(resource);
    const url = `${baseApi}/${resName}${params.id}/`;
    const { json } = await httpClient(url);
    return { data: json };
  },
  getMany: async (resource, params) => {
    const items = await Promise.all(
      params.ids.map((id) => dataProvider.getOne(resource, { id }).then((r) => r.data))
    );
    return { data: items };
  },
  getManyReference: async (resource, params) => {
    const filter = { ...(params.filter || {}), [params.target]: params.id };
    return dataProvider.getList(resource, { ...params, filter });
  },
  update: async (resource, params) => {
    const resName = mapResource(resource);
    const url = `${baseApi}/${resName}${params.id}/`;
    const { json } = await httpClient(url, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    });
    return { data: json };
  },
  updateMany: async (resource, params) => {
    const results = await Promise.all(
      params.ids.map((id) => dataProvider.update(resource, { id, data: params.data }).then((r) => r.data.id))
    );
    return { data: results };
  },
  create: async (resource, params) => {
    const resName = mapResource(resource);
    const url = `${baseApi}/${resName}`;
    const { json } = await httpClient(url, {
      method: 'POST',
      body: JSON.stringify(params.data),
    });
    return { data: json };
  },
  delete: async (resource, params) => {
    const resName = mapResource(resource);
    const url = `${baseApi}/${resName}${params.id}/`;
    await httpClient(url, { method: 'DELETE' });
    return { data: { id: params.id } };
  },
  deleteMany: async (resource, params) => {
    const results = await Promise.all(
      params.ids.map((id) => dataProvider.delete(resource, { id }).then((r) => r.data.id))
    );
    return { data: results };
  },
};

// Choices
const VEHICLE_CATEGORIES = [
  'AM','A1','A2','A','B1','B','C1','C','D1','D','BE','C1E','CE','D1E','DE',
].map(v => ({ id: v, name: v }));

const STUDENT_STATUS = [
  'ACTIVE','INACTIVE','GRADUATED',
].map(v => ({ id: v, name: v }));

// Instructor statuses: only ACTIVE and INACTIVE (no GRADUATED)
const INSTRUCTOR_STATUS = ['ACTIVE','INACTIVE'].map(v => ({ id: v, name: v }));

const PAYMENT_METHODS = ['CASH','CARD','TRANSFER'].map(v => ({ id: v, name: v }));

// Stiluri de culoare pentru fiecare status de student
const studentRowStyle = (record, index) => {
  if (!record) return {};
  switch (record.status) {
    case 'ACTIVE':
      return { backgroundColor: 'rgba(96, 165, 250, 0.15)' };   // albastru pal
    case 'INACTIVE':
      return { backgroundColor: 'rgba(251, 191, 36, 0.15)' };   // galben pal
    case 'GRADUATED':
      return { backgroundColor: 'rgba(134, 239, 172, 0.15)' };  // verde pal
    default:
      return {};
  }
};

// Instructor row style (same logic as students)
const instructorRowStyle = (record, index) => {
  if (!record) return {};
  switch (record.status) {
    case 'ACTIVE':
      return { backgroundColor: 'rgba(96, 165, 250, 0.15)' };
    case 'INACTIVE':
      return { backgroundColor: 'rgba(251, 191, 36, 0.15)' };
    case 'GRADUATED':
      return { backgroundColor: 'rgba(134, 239, 172, 0.15)' };
    default:
      return {};
  }
};

// Students
const StudentList = (props) => {
  const { locale, t } = React.useContext(LanguageContext);
  const [gridKey, setGridKey] = React.useState(0);
  React.useEffect(() => setGridKey(k => k + 1), [locale]);

  return (
    <List {...props} aside={<StudentListAside />} filters={[]} actions={<StudentListActions />}>
      <Datagrid key={gridKey} rowClick="edit" rowStyle={studentRowStyle}>
        <NumberField source="id" label={t('students.fields.id')} />
        <TextField source="first_name" label={t('students.fields.first_name')} />
        <TextField source="last_name" label={t('students.fields.last_name')} />
        <EmailField source="email" label={t('students.fields.email')} />
        <TextField source="phone_number" label={t('students.fields.phone_number')} />
        <DateField source="date_of_birth" label={t('students.fields.date_of_birth')} />
        <DateField source="enrollment_date" label={t('students.fields.enrollment_date')} />
        <FunctionField source="status" label={t('students.fields.status')} render={(record) => t(`filters.${(record?.status||'').toLowerCase()}`)} />
      </Datagrid>
    </List>
  );
};


const StudentEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="first_name" validate={[required()]} />
      <TextInput source="last_name" validate={[required()]} />
      <TextInput source="email" validate={[required()]} />
      <TextInput source="phone_number" validate={[required()]} />
      <DateInput source="date_of_birth" validate={[required()]} />
      <SelectInput source="status" choices={STUDENT_STATUS} />
    </SimpleForm>
  </Edit>
);

const StudentCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="first_name" validate={[required()]} />
      <TextInput source="last_name" validate={[required()]} />
      <TextInput source="email" validate={[required()]} />
      <TextInput source="phone_number" validate={[required()]} />
      <DateInput source="date_of_birth" validate={[required()]} />
      <SelectInput source="status" choices={STUDENT_STATUS} />
    </SimpleForm>
  </Create>
);

// Instructors
// Instructor filters component
const InstructorFilter = (props) => {
  const { t } = React.useContext(LanguageContext);
  return (
    <Filter {...props}>
      <TextInput source="q" label={t('actions.search')} alwaysOn />
  <SelectInput source="status" label={t('instructors.filters.status')} choices={INSTRUCTOR_STATUS} />
  <SelectInput source="license_category" label={t('instructors.filters.category')} choices={VEHICLE_CATEGORIES} />
    </Filter>
  );
};

const InstructorList = (props) => {
  const { locale, t } = React.useContext(LanguageContext);
  const [gridKey, setGridKey] = React.useState(0);
  React.useEffect(() => setGridKey(k => k + 1), [locale]);
  return (
    <List {...props} aside={<InstructorListAside />} actions={<InstructorListActions />} filters={[]}>
      <Datagrid key={gridKey} rowClick="edit" rowStyle={instructorRowStyle}>
        <NumberField source="id" label={t('instructors.fields.id')} />
        <TextField source="first_name" label={t('instructors.fields.first_name')} />
        <TextField source="last_name" label={t('instructors.fields.last_name')} />
        <EmailField source="email" label={t('instructors.fields.email')} />
        <TextField source="phone_number" label={t('instructors.fields.phone_number')} />
        <DateField source="hire_date" label={t('instructors.fields.hire_date')} />
        <TextField source="license_categories" label={t('instructors.fields.license_categories')} />
        <FunctionField source="status" label={t('instructors.fields.status')} render={(record) => t(`filters.${(record?.status||'').toLowerCase()}`)} />
      </Datagrid>
    </List>
  );
};

const InstructorEdit = (props) => {
  const { t } = React.useContext(LanguageContext);
  return (
    <Edit {...props}>
      <SimpleForm>
        <TextInput source="first_name" label={t('instructors.fields.first_name')} validate={[required()]} />
        <TextInput source="last_name" label={t('instructors.fields.last_name')} validate={[required()]} />
        <TextInput source="email" label={t('instructors.fields.email')} validate={[required()]} />
        <TextInput source="phone_number" label={t('instructors.fields.phone_number')} validate={[required()]} />
        <DateInput source="hire_date" label={t('instructors.fields.hire_date')} validate={[required()]} />
        <TextInput source="license_categories" label={t('instructors.fields.license_categories')} />
  <SelectInput source="status" label={t('instructors.fields.status')} choices={INSTRUCTOR_STATUS} />
      </SimpleForm>
    </Edit>
  );
};

const InstructorCreate = (props) => {
  const { t } = React.useContext(LanguageContext);
  return (
    <Create {...props}>
      <SimpleForm>
        <TextInput source="first_name" label={t('instructors.fields.first_name')} validate={[required()]} />
        <TextInput source="last_name" label={t('instructors.fields.last_name')} validate={[required()]} />
        <TextInput source="email" label={t('instructors.fields.email')} validate={[required()]} />
        <TextInput source="phone_number" label={t('instructors.fields.phone_number')} validate={[required()]} />
        <DateInput source="hire_date" label={t('instructors.fields.hire_date')} validate={[required()]} />
        <TextInput source="license_categories" label={t('instructors.fields.license_categories')} />
  <SelectInput source="status" label={t('instructors.fields.status')} choices={INSTRUCTOR_STATUS} />
      </SimpleForm>
    </Create>
  );
};

// Instructor show (details)
const InstructorShow = (props) => {
  const { t } = React.useContext(LanguageContext);
  return (
    <Show {...props}>
      <SimpleShowLayout>
        <NumberField source="id" label={t('instructors.fields.id')} />
        <TextField source="first_name" label={t('instructors.fields.first_name')} />
        <TextField source="last_name" label={t('instructors.fields.last_name')} />
        <EmailField source="email" label={t('instructors.fields.email')} />
        <TextField source="phone_number" label={t('instructors.fields.phone_number')} />
        <DateField source="hire_date" label={t('instructors.fields.hire_date')} />
        <TextField source="license_categories" label={t('instructors.fields.license_categories')} />
        <TextField source="notes" label={t('instructors.fields.notes')} />
      </SimpleShowLayout>
    </Show>
  );
};

// Vehicles
const VehicleList = (props) => {
  const { locale, t } = React.useContext(LanguageContext);
  const [gridKey, setGridKey] = React.useState(0);
  React.useEffect(() => setGridKey(k => k + 1), [locale]);
  return (
    <List {...props}>
      <Datagrid key={gridKey} rowClick="edit">
        <NumberField source="id" label={t('vehicles.fields.id')} />
        <TextField source="make" label={t('vehicles.fields.make')} />
        <TextField source="model" label={t('vehicles.fields.model')} />
        <TextField source="license_plate" label={t('vehicles.fields.license_plate')} />
        <NumberField source="year" label={t('vehicles.fields.year')} />
        <TextField source="category" label={t('vehicles.fields.category')} />
        <BooleanField source="is_available" label={t('vehicles.fields.is_available')} />
      </Datagrid>
    </List>
  );
};

const VehicleEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="make" validate={[required()]} />
      <TextInput source="model" validate={[required()]} />
      <TextInput source="license_plate" validate={[required()]} />
      <NumberInput source="year" validate={[required()]} />
      <SelectInput source="category" choices={VEHICLE_CATEGORIES} validate={[required()]} />
      <BooleanInput source="is_available" />
    </SimpleForm>
  </Edit>
);

const VehicleCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="make" validate={[required()]} />
      <TextInput source="model" validate={[required()]} />
      <TextInput source="license_plate" validate={[required()]} />
      <NumberInput source="year" validate={[required()]} />
      <SelectInput source="category" choices={VEHICLE_CATEGORIES} validate={[required()]} />
      <BooleanInput source="is_available" />
    </SimpleForm>
  </Create>
);

// Courses (exposed as "classes")
const CourseList = (props) => {
  const { locale, t } = React.useContext(LanguageContext);
  const [gridKey, setGridKey] = React.useState(0);
  React.useEffect(() => setGridKey(k => k + 1), [locale]);
  return (
    <List {...props}>
      <Datagrid key={gridKey} rowClick="edit">
        <NumberField source="id" label={t('classes.fields.id')} />
        <TextField source="name" label={t('classes.fields.name')} />
        <TextField source="category" label={t('classes.fields.category')} />
        <TextField source="description" label={t('classes.fields.description')} />
        <NumberField source="price" label={t('classes.fields.price')} />
        <NumberField source="required_lessons" label={t('classes.fields.required_lessons')} />
      </Datagrid>
    </List>
  );
};

const CourseEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="name" validate={[required()]} />
      <SelectInput source="category" choices={VEHICLE_CATEGORIES} validate={[required()]} />
      <TextInput source="description" multiline rows={3} />
      <NumberInput source="price" validate={[required()]} />
      <NumberInput source="required_lessons" validate={[required()]} />
    </SimpleForm>
  </Edit>
);

const CourseCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="name" validate={[required()]} />
      <SelectInput source="category" choices={VEHICLE_CATEGORIES} validate={[required()]} />
      <TextInput source="description" multiline rows={3} />
      <NumberInput source="price" validate={[required()]} />
      <NumberInput source="required_lessons" validate={[required()]} />
    </SimpleForm>
  </Create>
);

// Payments
const PaymentList = (props) => {
  const { locale, t } = React.useContext(LanguageContext);
  const [gridKey, setGridKey] = React.useState(0);
  React.useEffect(() => setGridKey(k => k + 1), [locale]);
  return (
    <List {...props}>
      <Datagrid key={gridKey} rowClick="edit">
        <NumberField source="id" label={t('payments.fields.id') || 'Id'} />
        <TextField source="enrollment.id" label={t('payments.fields.enrollment')} />
        <NumberField source="amount" label={t('payments.fields.amount') || 'Amount'} />
        <DateField source="payment_date" label={t('payments.fields.payment_date') || 'Payment date'} />
        <TextField source="payment_method" label={t('payments.fields.payment_method') || 'Payment method'} />
        <TextField source="description" label={t('payments.fields.description') || 'Description'} />
      </Datagrid>
    </List>
  );
};

const PaymentEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <ReferenceInput label="Enrollment" source="enrollment_id" reference="enrollments" perPage={50}>
        <SelectInput optionText={(r) => `#${r.id}`} />
      </ReferenceInput>
      <NumberInput source="amount" validate={[required()]} />
      <SelectInput source="payment_method" choices={PAYMENT_METHODS} validate={[required()]} />
      <TextInput source="description" />
    </SimpleForm>
  </Edit>
);

const PaymentCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <ReferenceInput label="Enrollment" source="enrollment_id" reference="enrollments" perPage={50}>
        <SelectInput optionText={(r) => `#${r.id}`} />
      </ReferenceInput>
      <NumberInput source="amount" validate={[required()]} />
      <SelectInput source="payment_method" choices={PAYMENT_METHODS} validate={[required()]} />
      <TextInput source="description" />
    </SimpleForm>
  </Create>
);

export default function App() {
  // locale state for the simple language system (persisted)
  const [locale, setLocale] = React.useState(() => {
    try {
      return localStorage.getItem('locale') || 'en';
    } catch (e) {
      return 'en';
    }
  });
  React.useEffect(() => {
    try { localStorage.setItem('locale', locale); } catch (e) { /* ignore */ }
  }, [locale]);
  const t = (key) => translateMessage(locale, key);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      <Admin key={locale} dataProvider={dataProvider}>
        <Resource name="students" list={StudentList} edit={StudentEdit} create={StudentCreate} options={{ label: t('menu.students') }} />
        <Resource name="instructors" list={InstructorList} edit={InstructorEdit} create={InstructorCreate} options={{ label: t('menu.instructors') }} />
        <Resource name="vehicles" list={VehicleList} edit={VehicleEdit} create={VehicleCreate} options={{ label: t('menu.vehicles') }} />
        <Resource name="classes" list={CourseList} edit={CourseEdit} create={CourseCreate} options={{ label: t('menu.classes') }} />
        <Resource name="payments" list={PaymentList} edit={PaymentEdit} create={PaymentCreate} options={{ label: t('menu.payments') }} />
      </Admin>
    </LanguageContext.Provider>
  );
}