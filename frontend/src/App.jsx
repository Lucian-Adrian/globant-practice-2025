import StudentListAside from './students/StudentListAside';

import * as React from 'react';
import {
  Admin,
  Resource,
  List,
  Datagrid,
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
import { raEmail, raPhone, raStudentDob, raInstructorHireDate } from './validation/raValidators';

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

const StudentListActions = () => {
  const { filterValues, sort } = useListContext();
  const notify = useNotify();
  const refresh = useRefresh();

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
  <CreateButton />
      <Button label="Import CSV" onClick={onImportClick} />
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept=".csv,text/csv"
        style={{ display: 'none' }}
      />
      <Button label="Export CSV" onClick={onExport} />
    </TopToolbar>
  );
};
const ImportActions = ({ endpoint, label = 'Import CSV' }) => {
  const fileInputRef = React.useRef(null);
  const notify = useNotify();
  const refresh = useRefresh();
  const onImportClick = () => fileInputRef.current?.click();
  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const form = new FormData();
      form.append('file', file);
      const resp = await fetch(`${baseApi}/${endpoint}/import/`, {
        method: 'POST',
        body: form,
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || 'Import failed');
      }
      const json = await resp.json();
      notify(`Imported ${json.created} ${endpoint}`, { type: 'info' });
      refresh();
    } catch (err) {
      notify(err.message || 'Import failed', { type: 'warning' });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  return (
    <>
      <Button label={label} onClick={onImportClick} />
      <input type="file" ref={fileInputRef} onChange={onFileChange} accept=".csv,text/csv" style={{ display: 'none' }} />
    </>
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

export default function App() {
  return (
    <Admin dataProvider={dataProvider}>
      <Resource name="students" list={StudentList} edit={StudentEdit} create={StudentCreate} />
      <Resource name="instructors" list={InstructorList} edit={InstructorEdit} create={InstructorCreate} />
      <Resource name="vehicles" list={VehicleList} edit={VehicleEdit} create={VehicleCreate} />
      <Resource name="classes" list={CourseList} edit={CourseEdit} create={CourseCreate} />
      <Resource name="payments" list={PaymentList} edit={PaymentEdit} create={PaymentCreate} />
    </Admin>
  );
}

// Choices
const VEHICLE_CATEGORIES = [
  'AM','A1','A2','A','B1','B','C1','C','D1','D','BE','C1E','CE','D1E','DE',
].map(v => ({ id: v, name: v }));

const STUDENT_STATUS = [
  'ACTIVE','INACTIVE','GRADUATED',
].map(v => ({ id: v, name: v }));

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


// Students
const StudentList = (props) => (
  
  <List {...props} aside={<StudentListAside />} filters={[]} actions={<StudentListActions />}>
  
    <Datagrid rowClick="edit" rowStyle={studentRowStyle}>
      <NumberField source="id" />
      <TextField source="first_name" />
      <TextField source="last_name" />
      <EmailField source="email" />
      <TextField source="phone_number" />
      <DateField source="date_of_birth" />
      <DateField source="enrollment_date" />
      <TextField source="status" />
    </Datagrid>
  </List>
);


const StudentEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="first_name" validate={[required()]} />
      <TextInput source="last_name" validate={[required()]} />
      <TextInput source="email" validate={[required(), raEmail]} />
      <TextInput source="phone_number" validate={[required(), raPhone()]} />
      <DateInput source="date_of_birth" validate={[required(), raStudentDob]} />
      <SelectInput source="status" choices={STUDENT_STATUS} />
    </SimpleForm>
  </Edit>
);

const StudentCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="first_name" validate={[required()]} />
      <TextInput source="last_name" validate={[required()]} />
      <TextInput source="email" validate={[required(), raEmail]} />
      <TextInput source="phone_number" validate={[required(), raPhone()]} />
      <DateInput source="date_of_birth" validate={[required(), raStudentDob]} />
      <SelectInput source="status" choices={STUDENT_STATUS} />
    </SimpleForm>
  </Create>
);

// Instructors
const InstructorListActions = () => (
  <TopToolbar>
    <CreateButton />
    <ImportActions endpoint="instructors" />
  </TopToolbar>
);

const InstructorList = (props) => (
  <List {...props} actions={<InstructorListActions />}>
    <Datagrid rowClick="edit">
      <NumberField source="id" />
      <TextField source="first_name" />
      <TextField source="last_name" />
      <EmailField source="email" />
      <TextField source="phone_number" />
      <DateField source="hire_date" />
      <TextField source="license_categories" />
    </Datagrid>
  </List>
);

const InstructorEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="first_name" validate={[required()]} />
      <TextInput source="last_name" validate={[required()]} />
      <TextInput source="email" validate={[required(), raEmail]} />
      <TextInput source="phone_number" validate={[required(), raPhone()]} />
      <DateInput source="hire_date" validate={[required(), raInstructorHireDate]} />
      <TextInput source="license_categories" />
    </SimpleForm>
  </Edit>
);

const InstructorCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="first_name" validate={[required()]} />
      <TextInput source="last_name" validate={[required()]} />
      <TextInput source="email" validate={[required(), raEmail]} />
      <TextInput source="phone_number" validate={[required(), raPhone()]} />
      <DateInput source="hire_date" validate={[required(), raInstructorHireDate]} />
      <TextInput source="license_categories" />
    </SimpleForm>
  </Create>
);

// Vehicles
const VehicleListActions = () => (
  <TopToolbar>
    <CreateButton />
    <ImportActions endpoint="vehicles" />
  </TopToolbar>
);

const VehicleList = (props) => (
  <List {...props} actions={<VehicleListActions />}>
    <Datagrid rowClick="edit">
      <NumberField source="id" />
      <TextField source="make" />
      <TextField source="model" />
      <TextField source="license_plate" />
      <NumberField source="year" />
      <TextField source="category" />
      <BooleanField source="is_available" />
    </Datagrid>
  </List>
);

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
const CourseList = (props) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <NumberField source="id" />
      <TextField source="name" />
      <TextField source="category" />
      <TextField source="description" />
      <NumberField source="price" />
      <NumberField source="required_lessons" />
    </Datagrid>
  </List>
);

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
const PaymentList = (props) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <NumberField source="id" />
      <TextField source="enrollment.id" label="Enrollment" />
      <NumberField source="amount" />
      <DateField source="payment_date" />
      <TextField source="payment_method" />
      <TextField source="description" />
    </Datagrid>
  </List>
);

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
