import StudentListAside from './students/StudentListAside';
import ImportButton from './components/ImportButton';
import ResourceEmptyState from './components/ResourceEmptyState';
import InstructorDetails from './instructors/InstructorDetails';
import InstructorCalendar from './instructors/InstructorCalendar';

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
  SimpleForm,
  TextInput,
  NumberInput,
  DateInput,
  BooleanInput,
  SelectInput,
  ReferenceInput,
  fetchUtils,
  useListContext,
  useNotify,
  useRefresh,
  HttpError,
} from 'react-admin';
import { CreateSmart, EditSmart } from './components/SmartCrudWrappers';
import { raEmail, raPhone, raDob, raHireDate, req } from './validation/raValidators';
import { YEARS_125, YEARS_15, yyyyMmDdYearsAgo } from './constants';
import PhoneFieldRA from './components/PhoneFieldRA';
import DisabledUntilValidToolbar from './components/DisabledUntilValidToolbar';
import { Route } from 'react-router-dom';

// Use relative base URL so the browser hits the Vite dev server, which proxies to the backend container
const baseApi = '/api';

// Map React-Admin resource names to DRF endpoints and ensure trailing slash
const mapResource = (resource) => {
  const mapping = { classes: 'courses' };
  const name = mapping[resource] || resource;
  return `${name}/`;
};

// Normalize DRF error responses so RA shows a clear toast and inline field errors.
// Strategy:
// - Catch fetchJson HttpError
// - Derive a human message using priority: json.message > json.detail > first field error > statusText > generic
// - Re-throw new HttpError(message, status, body) where body is the full parsed JSON (unchanged)
//   so RA can map field-level errors (e.g., { email: ["already exists"] }) to matching inputs.
const httpClient = async (url, options = {}) => {
  const opts = { ...options };
  opts.headers = new Headers(opts.headers || { 'Content-Type': 'application/json' });

  const deriveMessage = (body, fallback, status) => {
    // Prefer explicit message/detail from API
    if (body && typeof body === 'object') {
      const msg = typeof body.message === 'string' ? body.message.trim() : '';
      if (msg) return msg;
      const det = typeof body.detail === 'string' ? body.detail.trim() : '';
      if (det) return det;
      // Otherwise pick first field error (arrays or strings)
      for (const [k, v] of Object.entries(body)) {
        if (k === 'message' || k === 'detail') continue;
        if (Array.isArray(v) && v.length) {
          const first = v.find((x) => typeof x === 'string');
          if (first) return first;
        }
        if (typeof v === 'string' && v.trim()) return v.trim();
      }
    }
    // Generic but meaningful fallback for 5xx
    if (typeof status === 'number' && status >= 500) {
      return 'A server error occurred. Please try again.';
    }
    return fallback || 'Request failed';
  };

  try {
    return await fetchUtils.fetchJson(url, opts);
  } catch (error) {
    // fetchJson throws HttpError-like objects with status and body
    const status = error?.status ?? 0;
    let body = error?.body;
    // Attempt to parse body if it's a JSON string
    if (typeof body === 'string') {
      try {
        const parsed = JSON.parse(body);
        body = parsed;
      } catch {
        // leave body as string
      }
    }
    const statusText = error?.statusText || error?.message || '';
    const message = deriveMessage(body, statusText, status);

    // React-Admin expects server-side validation errors under body.errors
    // in the shape: { errors: { field: 'message', other: '...' } }
    // DRF typically returns: { field: ['msg1', 'msg2'], other: 'msg' }
    // Map DRF field errors to RA format ONLY for 400/409/422 statuses.
    let mappedBody = body;
    if ([400, 409, 422].includes(Number(status)) && body && typeof body === 'object' && !Array.isArray(body)) {
      const errors = {};
      Object.entries(body).forEach(([key, value]) => {
        if (key === 'message' || key === 'detail') return; // keep these for top-level messages
        if (Array.isArray(value)) {
          const first = value.find((v) => typeof v === 'string' && v.trim());
          if (first) errors[key] = first.trim();
        } else if (typeof value === 'string' && value.trim()) {
          errors[key] = value.trim();
        }
      });
      if (Object.keys(errors).length > 0) {
        mappedBody = { ...body, errors };
      }
    }

    throw new HttpError(message, status, mappedBody);
  }
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
  const onExport = () => {
    const qs = buildFilterSortQuery(filterValues, sort);
    const url = `${baseApi}/students/export/${qs ? `?${qs}` : ''}`;
    window.open(url, '_blank');
  };
  return (
    <TopToolbar>
      <CreateButton />
      <ImportButton endpoint="students" />
      <Button label="Export CSV" onClick={onExport} />
    </TopToolbar>
  );
};
// ImportActions removed in favor of shared <ImportButton /> component.



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

const customRoutes = [
  <Route key="instructor-details" path="/instructors/:id/details" element={<InstructorDetails />} />,
  <Route key="instructor-calendar" path="/instructors/:id/calendar" element={<InstructorCalendar />} />,
];

import { i18nProvider } from './i18n.js';

export default function App() {
  return (
    <Admin dataProvider={dataProvider} customRoutes={customRoutes} i18nProvider={i18nProvider}>
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
  <List
    {...props}
    aside={<StudentListAside />}
    filters={[]}
    actions={<StudentListActions />}
    empty={<ResourceEmptyState endpoint="students" message="No students yet. Create one or import a batch." />}
  >
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
  <EditSmart {...props}>
    <SimpleForm mode="onChange" reValidateMode="onChange" toolbar={<DisabledUntilValidToolbar isEdit={true} />}>
    <TextInput source="first_name" validate={[req]} />
    <TextInput source="last_name" validate={[req]} />
    <TextInput source="email" validate={[req, raEmail]} />
  <PhoneFieldRA source="phone_number" validate={[req, raPhone()]} />
      <DateInput
        source="date_of_birth"
        inputProps={{
          min: yyyyMmDdYearsAgo(YEARS_125),
          max: yyyyMmDdYearsAgo(YEARS_15),
        }}
        validate={[req, raDob()]}
      />
      <SelectInput source="status" choices={STUDENT_STATUS} validate={[req]} defaultValue="ACTIVE" />
    </SimpleForm>
  </EditSmart>
);

const StudentCreate = (props) => (
  <CreateSmart {...props}>
    <SimpleForm mode="onChange" reValidateMode="onChange" toolbar={<DisabledUntilValidToolbar isEdit={false} />}>
    <TextInput source="first_name" validate={[req]} />
    <TextInput source="last_name" validate={[req]} />
    <TextInput source="email" validate={[req, raEmail]} />
  <PhoneFieldRA source="phone_number" validate={[req, raPhone()]} />
      <DateInput
        source="date_of_birth"
        inputProps={{
          min: yyyyMmDdYearsAgo(YEARS_125),
          max: yyyyMmDdYearsAgo(YEARS_15),
        }}
        validate={[req, raDob()]}
      />
      <SelectInput source="status" choices={STUDENT_STATUS} validate={[req]} defaultValue="ACTIVE" />
    </SimpleForm>
  </CreateSmart>
);

// Instructors
const InstructorListActions = () => {
  const { filterValues, sort } = useListContext();
  const onExport = () => {
    const qs = buildFilterSortQuery(filterValues, sort);
    const url = `${baseApi}/instructors/export/${qs ? `?${qs}` : ''}`;
    window.open(url, '_blank');
  };
  return (
    <TopToolbar>
      <CreateButton />
      <ImportButton endpoint="instructors" />
      <Button label="Export CSV" onClick={onExport} />
    </TopToolbar>
  );
};

const InstructorList = (props) => (
  <List
    {...props}
    actions={<InstructorListActions />}
    empty={<ResourceEmptyState endpoint="instructors" message="No instructors yet. Create one or import a batch." />}
  >
    <Datagrid rowClick={(id, resource) => `/instructors/${id}/details`}>
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
  <EditSmart {...props}>
    <SimpleForm mode="onChange" reValidateMode="onChange" toolbar={<DisabledUntilValidToolbar isEdit={true} />}>
    <TextInput source="first_name" validate={[req]} />
    <TextInput source="last_name" validate={[req]} />
    <TextInput source="email" validate={[req, raEmail]} />
  <PhoneFieldRA source="phone_number" validate={[req, raPhone()]} />
      <DateInput
        source="hire_date"
        inputProps={{
          min: yyyyMmDdYearsAgo(YEARS_125),
        }}
        validate={[req, raHireDate({ allowFuture: true })]}
      />
      <TextInput source="license_categories" validate={[req]} />
    </SimpleForm>
  </EditSmart>
);

const InstructorCreate = (props) => (
  <CreateSmart {...props}>
    <SimpleForm mode="onChange" reValidateMode="onChange" toolbar={<DisabledUntilValidToolbar isEdit={false} />}>
    <TextInput source="first_name" validate={[req]} />
    <TextInput source="last_name" validate={[req]} />
    <TextInput source="email" validate={[req, raEmail]} />
  <PhoneFieldRA source="phone_number" validate={[req, raPhone()]} />
      <DateInput
        source="hire_date"
        inputProps={{
          min: yyyyMmDdYearsAgo(YEARS_125),
        }}
        validate={[req, raHireDate({ allowFuture: true })]}
      />
      <TextInput source="license_categories" validate={[req]} />
    </SimpleForm>
  </CreateSmart>
);

// Vehicles
const VehicleListActions = () => {
  const { filterValues, sort } = useListContext();
  const onExport = () => {
    const qs = buildFilterSortQuery(filterValues, sort);
    const url = `${baseApi}/vehicles/export/${qs ? `?${qs}` : ''}`;
    window.open(url, '_blank');
  };
  return (
    <TopToolbar>
      <CreateButton />
      <ImportButton endpoint="vehicles" />
      <Button label="Export CSV" onClick={onExport} />
    </TopToolbar>
  );
};

const VehicleList = (props) => (
  <List
    {...props}
    actions={<VehicleListActions />}
    empty={<ResourceEmptyState endpoint="vehicles" message="No vehicles yet. Create one or import a batch." />}
  >
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
  <EditSmart {...props}>
    <SimpleForm mode="onChange" reValidateMode="onChange" toolbar={<DisabledUntilValidToolbar isEdit={true} />}>
  <TextInput source="make" validate={[req]} />
  <TextInput source="model" validate={[req]} />
  <TextInput source="license_plate" validate={[req]} />
  <NumberInput source="year" validate={[req]} />
  <SelectInput source="category" choices={VEHICLE_CATEGORIES} validate={[req]} />
      <BooleanInput source="is_available" />
    </SimpleForm>
  </EditSmart>
);

const VehicleCreate = (props) => (
  <CreateSmart {...props}>
    <SimpleForm mode="onChange" reValidateMode="onChange" toolbar={<DisabledUntilValidToolbar isEdit={false} />}>
  <TextInput source="make" validate={[req]} />
  <TextInput source="model" validate={[req]} />
  <TextInput source="license_plate" validate={[req]} />
  <NumberInput source="year" validate={[req]} />
  <SelectInput source="category" choices={VEHICLE_CATEGORIES} validate={[req]} />
      <BooleanInput source="is_available" />
    </SimpleForm>
  </CreateSmart>
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
  <EditSmart {...props}>
    <SimpleForm mode="onChange" reValidateMode="onChange" toolbar={<DisabledUntilValidToolbar isEdit={true} />}>
  <TextInput source="name" validate={[req]} />
  <SelectInput source="category" choices={VEHICLE_CATEGORIES} validate={[req]} />
      <TextInput source="description" multiline rows={3} />
  <NumberInput source="price" validate={[req]} />
  <NumberInput source="required_lessons" validate={[req]} />
    </SimpleForm>
  </EditSmart>
);

const CourseCreate = (props) => (
  <CreateSmart {...props}>
    <SimpleForm mode="onChange" reValidateMode="onChange" toolbar={<DisabledUntilValidToolbar isEdit={false} />}>
  <TextInput source="name" validate={[req]} />
  <SelectInput source="category" choices={VEHICLE_CATEGORIES} validate={[req]} />
      <TextInput source="description" multiline rows={3} />
  <NumberInput source="price" validate={[req]} />
  <NumberInput source="required_lessons" validate={[req]} />
    </SimpleForm>
  </CreateSmart>
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
  <EditSmart {...props}>
    <SimpleForm mode="onChange" reValidateMode="onChange" toolbar={<DisabledUntilValidToolbar isEdit={true} />}>
      <ReferenceInput label="Enrollment" source="enrollment_id" reference="enrollments" perPage={50}>
        <SelectInput optionText={(r) => `#${r.id}`} validate={[req]} />
      </ReferenceInput>
      <NumberInput source="amount" validate={[req]} />
      <SelectInput source="payment_method" choices={PAYMENT_METHODS} validate={[req]} />
      <TextInput source="description" />
    </SimpleForm>
  </EditSmart>
);

const PaymentCreate = (props) => (
  <CreateSmart {...props}>
    <SimpleForm mode="onChange" reValidateMode="onChange" toolbar={<DisabledUntilValidToolbar isEdit={false} />}>
      <ReferenceInput label="Enrollment" source="enrollment_id" reference="enrollments" perPage={50}>
        <SelectInput optionText={(r) => `#${r.id}`} validate={[req]} />
      </ReferenceInput>
      <NumberInput source="amount" validate={[req]} />
      <SelectInput source="payment_method" choices={PAYMENT_METHODS} validate={[req]} />
      <TextInput source="description" />
    </SimpleForm>
  </CreateSmart>
);
