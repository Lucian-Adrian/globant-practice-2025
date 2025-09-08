import * as React from 'react';
import {
  Admin,
  Resource,
  List,
  Datagrid,
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
} from 'react-admin';

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
  query.set('page', String(page));
  query.set('page_size', String(perPage));
  if (params.filter) {
    Object.entries(params.filter).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.set(k, String(v));
    });
  }
  return query.toString();
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

// Students
const StudentList = (props) => (
  <List {...props}>
    <Datagrid rowClick="edit">
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
const InstructorList = (props) => (
  <List {...props}>
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
      <TextInput source="email" validate={[required()]} />
      <TextInput source="phone_number" validate={[required()]} />
      <DateInput source="hire_date" validate={[required()]} />
      <TextInput source="license_categories" />
    </SimpleForm>
  </Edit>
);

const InstructorCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="first_name" validate={[required()]} />
      <TextInput source="last_name" validate={[required()]} />
      <TextInput source="email" validate={[required()]} />
      <TextInput source="phone_number" validate={[required()]} />
      <DateInput source="hire_date" validate={[required()]} />
      <TextInput source="license_categories" />
    </SimpleForm>
  </Create>
);

// Vehicles
const VehicleList = (props) => (
  <List {...props}>
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
