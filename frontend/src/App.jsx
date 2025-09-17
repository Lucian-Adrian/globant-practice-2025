import StudentListAside from './students/StudentListAside';
import InstructorListAside from './instructors/InstructorListAside';
import translations from './translations';
import { LanguageContext as _LangContext, translateMessage as _translateMessage } from './i18n';

import * as React from 'react';
import {
  Admin,
  Resource,
  Show,
  List,
  Datagrid,
  FunctionField,
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
  ReferenceArrayInput,
  SelectArrayInput,
  fetchUtils,
  required,
  useListContext,
  useNotify,
  useRefresh,
  useRecordContext,
} from 'react-admin';
import { Card, CardContent, Box, Stack, Typography, Drawer, IconButton, Menu, MenuItem, Checkbox, FormControlLabel, Switch as MuiSwitch, Tooltip, TextField as MuiTextField, Dialog, DialogTitle, DialogContent, DialogActions, Select, InputLabel, FormControl, Chip, LinearProgress } from '@mui/material';
import PreviewIcon from '@mui/icons-material/Preview';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PaymentIcon from '@mui/icons-material/Payment';
import MoreVertIcon from '@mui/icons-material/MoreVert';

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
  const { filterValues, sort, setFilters } = useListContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const [columnsAnchor, setColumnsAnchor] = React.useState(null);

  // consume language context
  const { locale, setLocale, t } = React.useContext(LanguageContext);

  const onExport = () => {
    const qs = buildFilterSortQuery(filterValues, sort);
    const url = `${baseApi}/students/export/${qs ? `?${qs}` : ''}`;
    // Trigger file download in a new tab
    window.open(url, '_blank');
  };

  const [quick, setQuick] = React.useState(filterValues?.q || '');
  const onQuickChange = (e) => {
    const v = e.target.value;
    setQuick(v);
    setFilters({ ...(filterValues || {}), q: v }, null);
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
        {/* Column chooser menu */}
        <Tooltip title="Columns">
          <IconButton onClick={(e) => setColumnsAnchor(e.currentTarget)} size="small" sx={{ ml: 1 }}>
            <MoreVertIcon />
          </IconButton>
        </Tooltip>
      </div>
    </TopToolbar>
  );
};

const InstructorListActions = () => {
  const { filterValues, sort } = useListContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const { locale, setLocale, t } = React.useContext(LanguageContext);

  const [quick, setQuick] = React.useState('');
  const onQuickChange = (e) => {
    const v = e.target.value;
    setQuick(v);
    // Instructor list has its own filters; we can use the context's setFilters if needed
    // but for now just keep local quick state so the input doesn't error.
  };

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
  <MuiTextField size="small" placeholder={t('actions.search')} value={quick} onChange={onQuickChange} style={{ marginRight: 12, width: 220 }} />
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

// Student filters (aside and top-level)
const StudentFilter = (props) => {
  const { t } = React.useContext(LanguageContext);
  return (
    <Filter {...props}>
      <TextInput source="q" label={t('actions.search')} alwaysOn />
      <ReferenceInput source="course_id" reference="courses" label={t('classes.fields.name')} perPage={50}>
        <SelectInput optionText="name" />
      </ReferenceInput>
      <SelectInput source="language" choices={[{id:'ro',name:'RO'},{id:'en',name:'EN'},{id:'ru',name:'RU'}]} />
      <DateInput source="enrollment_date_gte" label="Enrolled after" />
      <DateInput source="enrollment_date_lte" label="Enrolled before" />
      <ReferenceInput source="instructor_id" reference="instructors" label="Instructor" perPage={50}>
        <SelectInput optionText={(r)=>`${r.first_name} ${r.last_name}`} />
      </ReferenceInput>
      <BooleanInput source="has_consent" label="Has consent" />
    </Filter>
  );
};

// Bulk actions for students
const StudentBulkActionButtons = ({ selectedIds, onUnselectAll }) => {
  const notify = useNotify();
  const refresh = useRefresh();
  if (!selectedIds || selectedIds.length === 0) return null;

  const exportSelected = () => {
    const qs = `ids=${selectedIds.join(',')}`;
    window.open(`${baseApi}/students/export/?${qs}`, '_blank');
  };

  const changeStatus = async (status) => {
    try {
      await Promise.all(selectedIds.map(id => fetch(`${baseApi}/students/${id}/`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) } )));
      notify('Status updated', { type: 'info' });
      onUnselectAll();
      refresh();
    } catch (e) { notify('Failed', { type: 'error' }); }
  };

  return (
    <React.Fragment>
      <Button label="Export selected" onClick={exportSelected} />
      <Button label="Set ACTIVE" onClick={() => changeStatus('ACTIVE')} />
    </React.Fragment>
  );
};

// Actions column per row
const StudentActionsField = ({ record }) => {
  if (!record) return null;
  const openPreview = () => { window.open(`/#/students/${record.id}/show`, '_blank', 'noopener,noreferrer'); };
  const schedule = () => window.dispatchEvent(new CustomEvent('open-schedule-lesson', { detail: record }));
  const addPayment = () => window.dispatchEvent(new CustomEvent('open-add-payment', { detail: record }));
  const changeStatus = () => window.dispatchEvent(new CustomEvent('open-change-status', { detail: record }));
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Tooltip title="Preview"><IconButton size="small" onClick={openPreview}><PreviewIcon fontSize="small" /></IconButton></Tooltip>
      <Tooltip title="Schedule lesson"><IconButton size="small" onClick={schedule}><ScheduleIcon fontSize="small" /></IconButton></Tooltip>
      <Tooltip title="Add payment"><IconButton size="small" onClick={addPayment}><PaymentIcon fontSize="small" /></IconButton></Tooltip>
      <MenuIconRow record={record} />
    </Box>
  );
};

const MenuIconRow = ({ record }) => {
  const [anchor, setAnchor] = React.useState(null);
  const open = Boolean(anchor);
  const handleOpen = (e) => setAnchor(e.currentTarget);
  const handleClose = () => setAnchor(null);
  const handleChangeStatus = async (s) => { await fetch(`${baseApi}/students/${record.id}/`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: s }) }); handleClose(); window.location.reload(); };
  return (
    <div>
      <IconButton size="small" onClick={handleOpen}><MoreVertIcon fontSize="small" /></IconButton>
      <Menu anchorEl={anchor} open={open} onClose={handleClose}>
        <MenuItem onClick={() => handleChangeStatus('ACTIVE')}>Set ACTIVE</MenuItem>
        <MenuItem onClick={() => handleChangeStatus('INACTIVE')}>Set INACTIVE</MenuItem>
      </Menu>
    </div>
  );
};

// Preview drawer listens to custom events
const StudentPreviewDrawer = () => {
  const [open, setOpen] = React.useState(false);
  const [rec, setRec] = React.useState(null);
  React.useEffect(() => {
    const handler = (e) => { setRec(e.detail); setOpen(true); };
    window.addEventListener('preview-student', handler);
    return () => window.removeEventListener('preview-student', handler);
  }, []);
  return (
    <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
      <Box sx={{ width: 360, p: 2 }}>
        {rec ? (
          <div>
            <Typography variant="h6">{rec.first_name} {rec.last_name}</Typography>
            <Typography>{rec.email}</Typography>
            <Typography>{rec.phone_number}</Typography>
            <Box sx={{ mt: 2 }}>
              <Button onClick={() => window.open(`/#/students/${rec.id}/show`)}>View full</Button>
              <Button onClick={() => window.open(`/#/lessons/create?student_id=${rec.id}`)}>Schedule</Button>
              <Button onClick={() => window.open(`/#/payments/create?student_id=${rec.id}`)}>Add payment</Button>
            </Box>
          </div>
        ) : null}
      </Box>
    </Drawer>
  );
};

// Schedule Lesson Dialog
const ScheduleLessonDialog = () => {
  const [open, setOpen] = React.useState(false);
  const [student, setStudent] = React.useState(null);
  const notify = useNotify();
  const [form, setForm] = React.useState({ enrollment_id: null, lesson_type: 'PRACTICAL', instructor_id: null, vehicle_id: null, scheduled_time: '', duration_minutes: 50, notes: '' });

  React.useEffect(() => {
    const handler = (e) => { setStudent(e.detail); setOpen(true); setForm(f => ({ ...f, student_id: e.detail.id })); };
    window.addEventListener('open-schedule-lesson', handler);
    return () => window.removeEventListener('open-schedule-lesson', handler);
  }, []);

  const onSave = async () => {
    try {
      const resp = await fetch(`${baseApi}/lessons/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enrollment_id: form.enrollment_id, instructor_id: form.instructor_id, vehicle_id: form.vehicle_id, scheduled_time: form.scheduled_time, duration_minutes: form.duration_minutes, notes: form.notes }) });
      if (!resp.ok) {
        const j = await resp.json().catch(() => ({}));
        notify(j.detail || 'Conflict or error scheduling', { type: 'warning' });
      } else {
        notify('Lesson scheduled', { type: 'info' });
        setOpen(false);
      }
    } catch (e) { notify('Failed to schedule', { type: 'error' }); }
  };

  if (!student) return null;
  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
      <DialogTitle>Schedule lesson for {student.first_name} {student.last_name}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 1 }}>
          <InputLabel>Enrollment</InputLabel>
          <Select value={form.enrollment_id} onChange={(e) => setForm({ ...form, enrollment_id: e.target.value })}>
            {/* enrollment options require backend support */}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mt: 1 }}>
          <InputLabel>Lesson type</InputLabel>
          <Select value={form.lesson_type} onChange={(e) => setForm({ ...form, lesson_type: e.target.value })}>
            <MenuItem value="THEORY">Theory</MenuItem>
            <MenuItem value="PRACTICAL">Practical</MenuItem>
          </Select>
        </FormControl>
        <TextField as MuiTextField label="Date & time" type="datetime-local" value={form.scheduled_time} onChange={(e) => setForm({ ...form, scheduled_time: e.target.value })} fullWidth sx={{ mt: 1 }} />
        <NumberInput source="duration_minutes" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value || '50', 10) })} />
        <TextField as MuiTextField label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} fullWidth multiline rows={3} sx={{ mt: 1 }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button onClick={onSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

// Add Payment Dialog
const AddPaymentDialog = () => {
  const [open, setOpen] = React.useState(false);
  const [student, setStudent] = React.useState(null);
  const notify = useNotify();
  const [form, setForm] = React.useState({ enrollment_id: null, amount: '', payment_method: 'CASH', description: '' });

  React.useEffect(() => {
    const handler = (e) => { setStudent(e.detail); setOpen(true); };
    window.addEventListener('open-add-payment', handler);
    return () => window.removeEventListener('open-add-payment', handler);
  }, []);

  const onSave = async () => {
    try {
      const resp = await fetch(`${baseApi}/payments/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enrollment_id: form.enrollment_id, amount: parseFloat(form.amount), payment_method: form.payment_method, description: form.description }) });
      if (!resp.ok) { const j = await resp.json().catch(() => ({})); notify(j.detail || 'Error', { type: 'warning' }); }
      else { notify('Payment recorded', { type: 'info' }); setOpen(false); }
    } catch (e) { notify('Failed to record', { type: 'error' }); }
  };

  if (!student) return null;
  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
      <DialogTitle>Add payment for {student.first_name} {student.last_name}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 1 }}>
          <InputLabel>Enrollment</InputLabel>
          <Select value={form.enrollment_id} onChange={(e) => setForm({ ...form, enrollment_id: e.target.value })}>
            {/* options from backend */}
          </Select>
        </FormControl>
        <MuiTextField label="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} fullWidth sx={{ mt: 1 }} />
        <FormControl fullWidth sx={{ mt: 1 }}>
          <InputLabel>Method</InputLabel>
          <Select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
            <MenuItem value="CASH">Cash</MenuItem>
            <MenuItem value="CARD">Card</MenuItem>
            <MenuItem value="TRANSFER">Transfer</MenuItem>
          </Select>
        </FormControl>
        <MuiTextField label="Notes" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth multiline rows={2} sx={{ mt: 1 }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button onClick={onSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

// Small actions toolbar used on lists that only need Create + language selector
const SmallListActions = () => {
  const { t, locale, setLocale } = React.useContext(LanguageContext);
  return (
    <TopToolbar>
      <CreateButton label={t('actions.create')} />
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

// Vehicle list actions: Create + Import/Export + language selector
const VehicleListActions = () => {
  const { filterValues, sort } = useListContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const { locale, setLocale, t } = React.useContext(LanguageContext);

  const onExport = () => {
    const qs = buildFilterSortQuery(filterValues, sort);
    const url = `${baseApi}/vehicles/export/${qs ? `?${qs}` : ''}`;
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
      const resp = await fetch(`${baseApi}/vehicles/import/`, {
        method: 'POST',
        body: form,
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || 'Import failed');
      }
      const json = await resp.json();
      notify(`Imported ${json.created} vehicles`, { type: 'info' });
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

// Course (classes) list actions: Create + Import/Export + language selector
const CourseListActions = () => {
  const { filterValues, sort } = useListContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const { locale, setLocale, t } = React.useContext(LanguageContext);

  const onExport = () => {
    const qs = buildFilterSortQuery(filterValues, sort);
    // backend exposes courses endpoint for classes
    const url = `${baseApi}/courses/export/${qs ? `?${qs}` : ''}`;
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
      const resp = await fetch(`${baseApi}/courses/import/`, {
        method: 'POST',
        body: form,
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || 'Import failed');
      }
      const json = await resp.json();
      notify(`Imported ${json.created} courses`, { type: 'info' });
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
const VEHICLE_CATEGORY_DESCRIPTIONS = {
  AM: 'AM – moped (≤45 km/h; motor ≤50 cm³ sau ≤4 kW)',
  A1: 'A1 – motociclete ≤125 cm³ și ≤11 kW; triciclu ≤15 kW',
  A2: 'A2 – motociclete ≤35 kW (raport ≤0,2 kW/kg)',
  A: 'A – motociclete (cu/fără ataș); triciclu >15 kW',
  B1: 'B1 – cuadricicluri motorizate',
  B: 'B – autoturism ≤3.500 kg și ≤8 locuri (fără șofer)',
  BE: 'BE – ansamblu B + remorcă >750 kg (ansamblu >3.500 kg)',
  C1: 'C1 – autovehicul 3.500–7.500 kg (≤8 locuri)',
  C1E: 'C1E – C1 + remorcă >750 kg (ansamblu ≤12.000 kg)',
  C: 'C – autovehicul >3.500 kg',
  CE: 'CE – C + remorcă >750 kg',
  D1: 'D1 – microbuz 9–16 locuri (≤8 m)',
  D1E: 'D1E – D1 + remorcă >750 kg (ansamblu ≤12.000 kg)',
  D: 'D – autovehicul pentru transport persoane >8 locuri',
  DE: 'DE – D + remorcă >750 kg',
  F: 'F – troleibuz (vehicul special)',
  H: 'H – tractor pe roți și mașini/utilaje autopropulsate',
  I: 'I – tramvai',
};

const VEHICLE_CATEGORIES = Object.keys(VEHICLE_CATEGORY_DESCRIPTIONS).map(k => ({ id: k, name: k }));

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
    <List {...props} aside={<StudentListAside />} filters={<StudentFilter />} actions={<StudentListActions />} bulkActionButtons={<StudentBulkActionButtons />}>
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
  <SelectInput source="course_type" label="Course type" choices={[{ id: 'THEORY', name: 'Theory' }, { id: 'PRACTICAL', name: 'Practical' }]} />
  <SelectArrayInput source="course_categories" label="Categories" choices={VEHICLE_CATEGORIES} />
  <SelectInput source="language" label="Language" choices={[{ id: 'ro', name: 'Română' }, { id: 'ru', name: 'Русский' }]} />
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
  <SelectInput source="course_type" label="Course type" choices={[{ id: 'THEORY', name: 'Theory' }, { id: 'PRACTICAL', name: 'Practical' }]} />
  <SelectArrayInput source="course_categories" label="Categories" choices={VEHICLE_CATEGORIES} />
  <SelectInput source="language" label="Language" choices={[{ id: 'ro', name: 'Română' }, { id: 'ru', name: 'Русский' }]} />
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

// Student details block used inside the Show page and as a richer preview
const StudentDetails = ({ record }) => {
  const [nextLesson, setNextLesson] = React.useState(null);
  const [lastPayment, setLastPayment] = React.useState(null);
  const [lastContact, setLastContact] = React.useState(null);
  const [balance, setBalance] = React.useState(null);
  const notify = useNotify();

  React.useEffect(() => {
    if (!record || !record.id) return;
    // fetch next lesson (best-effort)
    (async () => {
      try {
        const { json } = await httpClient(`${baseApi}/lessons/?student_id=${record.id}&ordering=scheduled_time`);
        const items = Array.isArray(json) ? json : json.results || [];
        setNextLesson(items.length ? items[0] : null);
      } catch (e) {
        // ignore
      }
    })();

    // fetch last payment
    (async () => {
      try {
        const { json } = await httpClient(`${baseApi}/payments/?student_id=${record.id}&ordering=-payment_date`);
        const items = Array.isArray(json) ? json : json.results || [];
        setLastPayment(items.length ? items[0] : null);
      } catch (e) {
        // ignore
      }
    })();

    // fetch last communication (best-effort)
    (async () => {
      try {
        const { json } = await httpClient(`${baseApi}/communications/?student_id=${record.id}&ordering=-created_at`);
        const items = Array.isArray(json) ? json : json.results || [];
        setLastContact(items.length ? items[0] : null);
      } catch (e) {
        // ignore
      }
    })();

    // try fetching balance endpoint, fallback to record.balance
    (async () => {
      try {
        const { json } = await httpClient(`${baseApi}/students/${record.id}/balance/`);
        setBalance(json.balance ?? json);
      } catch (e) {
        if (typeof record.balance === 'number') setBalance(record.balance);
      }
    })();
  }, [record]);

  const openSchedule = () => window.open(`/#/lessons/create?student_id=${record.id}`, '_blank');
  const openPayment = () => window.open(`/#/payments/create?student_id=${record.id}`, '_blank');
  const openProfile = () => window.open(`/#/students/${record.id}/edit`, '_blank');

  const balanceBadge = () => {
    if (balance === null || balance === undefined) return <Chip label="Balance: —" />;
    const n = Number(balance);
    if (Number.isNaN(n)) return <Chip label={`Balance: ${balance}`} />;
    if (n > 0) return <Chip label={`Credit ${n}`} color="success" />;
    if (n < 0) return <Chip label={`Debt ${Math.abs(n)}`} color="error" />;
    return <Chip label={`Zero`} />;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h6">Next lesson</Typography>
          {nextLesson ? (
            <div>
              <Typography>{new Date(nextLesson.scheduled_time).toLocaleString()} • {nextLesson.instructor?.first_name || ''} {nextLesson.instructor?.last_name || ''} • {nextLesson.vehicle?.license_plate || ''}</Typography>
              <Button size="small" onClick={() => window.open(`/#/lessons/${nextLesson.id}/edit`, '_blank')}>Reschedule</Button>
            </div>
          ) : (
            <Typography>No upcoming lessons</Typography>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6">Last payment</Typography>
          {lastPayment ? (
            <div>
              <Typography>{lastPayment.amount} — {new Date(lastPayment.payment_date).toLocaleDateString()} — {lastPayment.payment_method}</Typography>
              <Box sx={{ mt: 1 }}>{balanceBadge()}</Box>
            </div>
          ) : (
            <Typography>No payments yet</Typography>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6">Communications</Typography>
          {lastContact ? (
            <div>
              <Typography>Last contact: {lastContact.method || '—'} {new Date(lastContact.created_at).toLocaleDateString()}</Typography>
              <Box sx={{ mt: 1 }}>
                <Button size="small" onClick={() => window.open(`/#/communications/create?student_id=${record.id}`, '_blank')}>Add note / Send message</Button>
              </Box>
            </div>
          ) : (
            <div>
              <Typography>No recent contact</Typography>
              <Box sx={{ mt: 1 }}>
                <Button size="small" onClick={() => window.open(`/#/communications/create?student_id=${record.id}`, '_blank')}>Add note / Send message</Button>
              </Box>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <div>
              <Typography variant="h6">Consent</Typography>
              <Typography>{record.consent ? `Granted at ${record.consent_timestamp || '—'}` : 'Not granted'}</Typography>
            </div>
            <div>
              <Typography variant="h6">Flags</Typography>
              <Stack direction="row" spacing={1}>
                {!record.instructor_id && <Chip label="No instructor assigned" color="warning" />}
                {balance !== null && Number(balance) < -1000 && <Chip label="Debt > 1000 MDL" color="error" />}
                {record.exam_pending && <Chip label="Exam pending" />}
              </Stack>
            </div>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6">Progress</Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption">Theory</Typography>
              <LinearProgress variant="determinate" value={record.progress?.theory ?? 0} sx={{ height: 10, borderRadius: 2 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption">Practical</Typography>
              <LinearProgress variant="determinate" value={record.progress?.practical ?? 0} sx={{ height: 10, borderRadius: 2 }} />
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="contained" onClick={openSchedule}>Schedule lesson</Button>
        <Button variant="outlined" onClick={openPayment}>Add payment</Button>
        <Button onClick={openProfile}>Open full profile</Button>
      </Box>
    </Box>
  );
};

// Student show (details) page
const StudentShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <NumberField source="id" />
      <TextField source="first_name" />
      <TextField source="last_name" />
      <EmailField source="email" />
      <TextField source="phone_number" />
      <FunctionField label="Details" render={(record) => <StudentDetails record={record} />} />
    </SimpleShowLayout>
  </Show>
);

// Vehicles
const VehicleList = (props) => {
  const { locale, t } = React.useContext(LanguageContext);
  const [gridKey, setGridKey] = React.useState(0);
  React.useEffect(() => setGridKey(k => k + 1), [locale]);
  return (
    <List {...props} actions={<VehicleListActions />}>
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
    <List {...props} actions={<CourseListActions />}>
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
  <StudentPreviewDrawer />
    </LanguageContext.Provider>
  );
}