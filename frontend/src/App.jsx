import StudentListAside from './students/StudentListAside';
import { VEHICLE_CATEGORIES as FALLBACK_VEHICLE, STUDENT_STATUS as FALLBACK_STUDENT, PAYMENT_METHODS as FALLBACK_PAYMENT } from './enums';
import { fetchEnums, mapToChoices } from './enumsClient';
import NameInput from './components/NameInput';
import PhoneInput from './components/PhoneInput';
import LicensePlateInput from './components/LicensePlateInput';
// phone utils can be used later for composite inputs
import { withAuthHeaders, authProvider } from './authProvider';

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
  ReferenceField,
} from 'react-admin';

// Use relative base URL so the browser hits the Vite dev server, which proxies to the backend container
const baseApi = '/api';

// Map React-Admin resource names to DRF endpoints and ensure trailing slash
const mapResource = (resource) => {
  const mapping = { classes: 'courses' };
  const name = mapping[resource] || resource;
  return `${name}/`;
};

// JSON client that automatically adds Authorization header if a token exists
const httpClient = withAuthHeaders(fetchUtils.fetchJson);
// Raw fetch wrapper (for non-JSON requests like FormData) with Authorization header
const fetchAuthed = withAuthHeaders(window.fetch.bind(window));

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


// Convert backend structured error shape -> RA field error mapping.
// Backend shape: { errors: { field: [msgs] }, message: "summary", error_code: "..." }
const extractFieldErrors = (body) => {
  if (!body) return {};
  if (!body.errors || typeof body.errors !== 'object') return body;
  const map = {};
  for (const [field, messages] of Object.entries(body.errors)) {
    if (Array.isArray(messages) && messages.length) {
      map[field] = messages[0];
    }
  }
  return map;
};

// Client-side validators
const validateDOB = (value) => {
  if (!value) return 'Date of birth is required';
  const date = new Date(value + 'T00:00:00');
  const today = new Date();
  if (date > today) return 'Date of birth cannot be in the future';
  const age = today.getFullYear() - date.getFullYear() - ((today.getMonth() < date.getMonth()) || (today.getMonth() === date.getMonth() && today.getDate() < date.getDate()) ? 1 : 0);
  if (age < 15) return 'Must be at least 15 years old';
};

const validateEmail = (value) => {
  if (!value) return 'Email is required';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return 'Enter a valid email address';
};

const validatePhoneClient = (value) => {
  if (!value) return 'Phone number is required';
  if (!/^\+?\d[\d ]{7,15}$/.test(value)) return 'Invalid phone number format';
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
    const resp = await fetchAuthed(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params.data) });
    let body = {};
    try { body = await resp.json(); } catch (_) {}
    if (!resp.ok) {
      const fieldErrors = extractFieldErrors(body);
      const baseMessage = body.message || body.detail || body.error || (resp.status === 400 ? 'Validation failed' : 'Server error');
      const error = new Error(baseMessage);
      error.status = resp.status; // eslint-disable-line
      error.body = fieldErrors; // eslint-disable-line
      error.backend = body; // optional extra debug
      throw error;
    }
    return { data: body };
  },
  updateMany: async (resource, params) => {
    const results = [];
    for (const id of params.ids) {
      const r = await dataProvider.update(resource, { id, data: params.data });
      results.push(r.data.id);
    }
    return { data: results };
  },
  create: async (resource, params) => {
    const resName = mapResource(resource);
    const url = `${baseApi}/${resName}`;
    const resp = await fetchAuthed(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params.data) });
    let body = {};
    try { body = await resp.json(); } catch (_) {}
    if (!resp.ok) {
      const fieldErrors = extractFieldErrors(body);
      const baseMessage = body.message || body.detail || body.error || (resp.status === 400 ? 'Validation failed' : 'Server error');
      const error = new Error(baseMessage);
      error.status = resp.status; // eslint-disable-line
      error.body = fieldErrors; // eslint-disable-line
      error.backend = body; // eslint-disable-line
      throw error;
    }
    return { data: body };
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
  const [enums, setEnums] = React.useState(null);
  React.useEffect(() => { fetchEnums().then(setEnums); }, []);
  const vehicleChoices = enums ? mapToChoices(enums.vehicle_category) : FALLBACK_VEHICLE;
  const studentChoices = enums ? mapToChoices(enums.student_status) : FALLBACK_STUDENT;
  const courseTypeChoices = enums ? mapToChoices(enums.course_type) : [ { id: 'THEORY', name: 'THEORY' }, { id: 'PRACTICE', name: 'PRACTICE' } ];
  const paymentChoices = enums ? mapToChoices(enums.payment_method) : FALLBACK_PAYMENT;
  return (
    <>
      <Admin dataProvider={dataProvider} authProvider={authProvider}>
      <Resource name="students" list={StudentList(studentChoices)} edit={StudentEdit(studentChoices)} create={StudentCreate(studentChoices)} />
      <Resource name="instructors" list={InstructorList} edit={InstructorEdit} create={InstructorCreate} />
      <Resource name="vehicles" list={VehicleList} edit={VehicleEdit(vehicleChoices)} create={VehicleCreate(vehicleChoices)} />
  <Resource name="classes" list={CourseList} edit={CourseEdit(vehicleChoices, courseTypeChoices)} create={CourseCreate(vehicleChoices, courseTypeChoices)} />
  <Resource name="payments" list={PaymentList} edit={PaymentEdit(paymentChoices)} create={PaymentCreate(paymentChoices)} />
  <Resource name="enrollments" list={EnrollmentList} edit={EnrollmentEdit} create={EnrollmentCreate} />
  <Resource name="lessons" list={LessonList} edit={LessonEdit} create={LessonCreate} />
  </Admin>
    </>
  );
}

// Dynamic choices wiring via higher-order components.

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
const StudentList = (studentChoices) => (props) => (
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


const StudentEdit = (studentChoices) => (props) => (
  <Edit {...props} mutationMode="pessimistic" redirect="list">
    <SimpleForm redirect="list">
  <NameInput source="first_name" validate={[v => (!v ? 'First name is required' : undefined)]} />
  <NameInput source="last_name" validate={[v => (!v ? 'Last name is required' : undefined)]} />
  <TextInput source="email" validate={[validateEmail]} />
  <PhoneInput source="phone_number" validate={[validatePhoneClient]} />
  <DateInput source="date_of_birth" validate={[validateDOB]} />
  <SelectInput source="status" choices={studentChoices.filter(c => c.id !== 'PENDING')} emptyText="PENDING (auto)" />
    </SimpleForm>
  </Edit>
);

const StudentCreate = (studentChoices) => (props) => (
  <Create {...props} redirect="list">
    <SimpleForm redirect="list">
  <NameInput source="first_name" validate={[v => (!v ? 'First name is required' : undefined)]} />
  <NameInput source="last_name" validate={[v => (!v ? 'Last name is required' : undefined)]} />
  <TextInput source="email" validate={[validateEmail]} />
  <PhoneInput source="phone_number" validate={[validatePhoneClient]} />
  <DateInput source="date_of_birth" validate={[validateDOB]} />
  {/* New students auto set to PENDING – hide field on create */}
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
  <TextInput source="email" validate={[validateEmail]} />
  <PhoneInput source="phone_number" validate={[validatePhoneClient]} />
      <DateInput source="hire_date" validate={[required()]} />
  <TextInput source="license_categories" helperText="Comma separated e.g. B,BE,C" />
    </SimpleForm>
  </Edit>
);

const InstructorCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="first_name" validate={[required()]} />
      <TextInput source="last_name" validate={[required()]} />
  <TextInput source="email" validate={[validateEmail]} />
  <PhoneInput source="phone_number" validate={[validatePhoneClient]} />
      <DateInput source="hire_date" validate={[required()]} />
  <TextInput source="license_categories" helperText="Comma separated e.g. B,BE,C" />
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
  {/* Custom render to avoid locale thousands separator for year */}
  <TextField source="year" />
      <TextField source="category" />
      <BooleanField source="is_available" />
    </Datagrid>
  </List>
);

const VehicleEdit = (vehicleChoices) => (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="make" validate={[required()]} />
      <TextInput source="model" validate={[required()]} />
  <LicensePlateInput source="license_plate" validate={[required(), (v) => (!/^[A-Z0-9]+$/.test(v || '') ? 'Only letters & digits' : undefined)]} />
      <NumberInput source="year" validate={[required()]} />
      <SelectInput source="category" choices={vehicleChoices} validate={[required()]} />
      <BooleanInput source="is_available" />
    </SimpleForm>
  </Edit>
);

const VehicleCreate = (vehicleChoices) => (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="make" validate={[required()]} />
      <TextInput source="model" validate={[required()]} />
  <LicensePlateInput source="license_plate" validate={[required(), (v) => (!/^[A-Z0-9]+$/.test(v || '') ? 'Only letters & digits' : undefined)]} />
      <NumberInput source="year" validate={[required()]} />
      <SelectInput source="category" choices={vehicleChoices} validate={[required()]} />
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
  <TextField source="type" />
      <TextField source="description" />
      <NumberField source="price" />
      <NumberField source="required_lessons" />
    </Datagrid>
  </List>
);

const CourseEdit = (vehicleChoices, courseTypeChoices) => (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="name" validate={[required()]} />
      <SelectInput source="category" choices={vehicleChoices} validate={[required()]} />
  <SelectInput source="type" choices={courseTypeChoices} validate={[required()]} />
      <TextInput source="description" multiline rows={3} />
      <NumberInput source="price" validate={[required()]} />
      <NumberInput source="required_lessons" validate={[required()]} />
    </SimpleForm>
  </Edit>
);

const CourseCreate = (vehicleChoices, courseTypeChoices) => (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="name" validate={[required()]} />
      <SelectInput source="category" choices={vehicleChoices} validate={[required()]} />
  <SelectInput source="type" choices={courseTypeChoices} validate={[required()]} />
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
  <TextField source="enrollment.label" label="Enrollment" />
      <NumberField source="amount" />
      <DateField source="payment_date" />
      <TextField source="payment_method" />
      <TextField source="description" />
    </Datagrid>
  </List>
);

const PaymentEdit = (paymentChoices) => (props) => (
  <Edit {...props}>
    <SimpleForm>
      <ReferenceInput label="Enrollment" source="enrollment_id" reference="enrollments" perPage={50}>
        <SelectInput optionText={(r) => r.label || `#${r.id}`} />
      </ReferenceInput>
      <NumberInput source="amount" validate={[required()]} />
      <SelectInput source="payment_method" choices={paymentChoices} validate={[required()]} />
      <TextInput source="description" />
    </SimpleForm>
  </Edit>
);

const PaymentCreate = (paymentChoices) => (props) => (
  <Create {...props}>
    <SimpleForm>
      <ReferenceInput label="Enrollment" source="enrollment_id" reference="enrollments" perPage={50}>
        <SelectInput optionText={(r) => r.label || `#${r.id}`} />
      </ReferenceInput>
      <NumberInput source="amount" validate={[required()]} />
      <SelectInput source="payment_method" choices={paymentChoices} validate={[required()]} />
      <TextInput source="description" />
    </SimpleForm>
  </Create>
);

// Enrollments
const EnrollmentList = (props) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <NumberField source="id" />
  <TextField source="label" label="Enrollment" />
      <DateField source="enrollment_date" />
      <TextField source="status" />
    </Datagrid>
  </List>
);

const EnrollmentEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <ReferenceInput label="Student" source="student_id" reference="students" perPage={50}>
        <SelectInput optionText={(r) => `${r.first_name} ${r.last_name}`} />
      </ReferenceInput>
      <ReferenceInput label="Course" source="course_id" reference="classes" perPage={50}>
        <SelectInput optionText={(r) => r.name} />
      </ReferenceInput>
      <SelectInput source="status" choices={[
        { id: 'IN_PROGRESS', name: 'IN_PROGRESS' },
        { id: 'COMPLETED', name: 'COMPLETED' },
        { id: 'CANCELED', name: 'CANCELED' },
      ]} />
    </SimpleForm>
  </Edit>
);

const EnrollmentCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <ReferenceInput label="Student" source="student_id" reference="students" perPage={50}>
        <SelectInput optionText={(r) => `${r.first_name} ${r.last_name}`} />
      </ReferenceInput>
      <ReferenceInput label="Course" source="course_id" reference="classes" perPage={50}>
        <SelectInput optionText={(r) => r.name} />
      </ReferenceInput>
      <SelectInput source="status" choices={[
        { id: 'IN_PROGRESS', name: 'IN_PROGRESS' },
        { id: 'COMPLETED', name: 'COMPLETED' },
        { id: 'CANCELED', name: 'CANCELED' },
      ]} />
    </SimpleForm>
  </Create>
);

// Lessons
const LessonList = (props) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <NumberField source="id" />
      <ReferenceField source="enrollment.id" reference="enrollments" label="Enrollment">
        <TextField source="label" />
      </ReferenceField>
      <ReferenceField source="instructor.id" reference="instructors" label="Instructor" />
      <TextField source="vehicle" label="Vehicle" />
      <DateField source="scheduled_time" />
      <NumberField source="duration_minutes" />
      <TextField source="status" />
    </Datagrid>
  </List>
);

const LessonEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <ReferenceInput label="Enrollment" source="enrollment_id" reference="enrollments" perPage={50}>
        <SelectInput optionText={(r) => r.label || `#${r.id}`} />
      </ReferenceInput>
      <ReferenceInput label="Instructor" source="instructor_id" reference="instructors" perPage={50}>
        <SelectInput optionText={(r) => `${r.first_name} ${r.last_name}`} />
      </ReferenceInput>
      <ReferenceInput label="Vehicle" source="vehicle" reference="vehicles" perPage={50}>
        <SelectInput optionText={(r) => `${r.license_plate}` } />
      </ReferenceInput>
      <DateInput source="scheduled_time" />
      <NumberInput source="duration_minutes" />
      <SelectInput source="status" choices={[
        { id: 'SCHEDULED', name: 'SCHEDULED' },
        { id: 'COMPLETED', name: 'COMPLETED' },
        { id: 'CANCELED', name: 'CANCELED' },
      ]} />
      <TextInput source="notes" multiline rows={2} />
    </SimpleForm>
  </Edit>
);

const LessonCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <ReferenceInput label="Enrollment" source="enrollment_id" reference="enrollments" perPage={50}>
        <SelectInput optionText={(r) => r.label || `#${r.id}`} />
      </ReferenceInput>
      <ReferenceInput label="Instructor" source="instructor_id" reference="instructors" perPage={50}>
        <SelectInput optionText={(r) => `${r.first_name} ${r.last_name}`} />
      </ReferenceInput>
      <ReferenceInput label="Vehicle" source="vehicle" reference="vehicles" perPage={50}>
        <SelectInput optionText={(r) => `${r.license_plate}` } />
      </ReferenceInput>
      <DateInput source="scheduled_time" />
      <NumberInput source="duration_minutes" defaultValue={50} />
      <SelectInput source="status" choices={[
        { id: 'SCHEDULED', name: 'SCHEDULED' },
        { id: 'COMPLETED', name: 'COMPLETED' },
        { id: 'CANCELED', name: 'CANCELED' },
      ]} />
      <TextInput source="notes" multiline rows={2} />
    </SimpleForm>
  </Create>
);

