import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'

// Mock react-admin components and hooks
vi.mock('react-admin', () => ({
  useTranslate: () => (key, optionsOrDefault) => {
    // Handle both patterns: t(key, options) and t(key, defaultValue)
    if (typeof optionsOrDefault === 'object' && optionsOrDefault?.defaultValue) {
      return optionsOrDefault.defaultValue;
    }
    if (typeof optionsOrDefault === 'string') {
      return optionsOrDefault;
    }
    return key;
  },
  useNotify: () => vi.fn(),
  useRefresh: () => vi.fn(),
  useUnselectAll: () => vi.fn(),
  useDataProvider: () => vi.fn(),
  useRecordContext: () => ({}),
  useMutation: () => [vi.fn(), { mutate: vi.fn(), isLoading: false }],
  useAuthenticated: () => undefined,
  useAuthState: () => ({ authenticated: true, loading: false }),
  useLogout: () => vi.fn(),
  Create: ({ children }) => children,
  Edit: ({ children }) => children,
  SimpleForm: ({ children }) => React.createElement('form', null, children),
  TextInput: ({ source, label, validate }) => React.createElement('input', { 'data-testid': source }),
  ReferenceInput: ({ children }) => children,
  SelectInput: ({ source, choices, label }) => React.createElement('select', { 'data-testid': source }, choices?.map(choice => React.createElement('option', { key: choice.id, value: choice.id }, choice.name))),
  DateInput: ({ source, label, validate, inputProps }) => React.createElement('input', { type: 'date', 'data-testid': source, ...inputProps }),
  NumberInput: ({ source, label }) => React.createElement('input', { type: 'number', 'data-testid': source }),
  ArrayInput: ({ source, children }) => React.createElement('div', { 'data-testid': source }, children),
  SimpleFormIterator: ({ children }) => children,
  ReferenceArrayInput: ({ children }) => children,
  SelectArrayInput: ({ source }) => React.createElement('select', { multiple: true, 'data-testid': source }),
  Button: ({ children, onClick, label }) => React.createElement('button', { onClick }, label || children),
  List: ({ children }) => children,
  Datagrid: ({ children }) => React.createElement('table', null, React.createElement('tbody', null, children)),
  TextField: ({ source }) => React.createElement('span', { 'data-testid': source }),
  DateField: ({ source }) => React.createElement('span', { 'data-testid': source }),
  NumberField: ({ source }) => React.createElement('span', { 'data-testid': source }),
  ReferenceField: ({ children }) => children,
  BulkDeleteButton: () => React.createElement('button', null, 'Bulk Delete'),
  BulkUpdateButton: () => React.createElement('button', null, 'Bulk Update'),
  Confirm: ({ children }) => children,
  CircularProgress: () => React.createElement('div', null, 'Loading...'),
  TopToolbar: ({ children }) => React.createElement('div', null, children),
  ListButton: () => React.createElement('button', null, 'List'),
  ShowButton: () => React.createElement('button', null, 'Show'),
  required: () => vi.fn(),
}))

// Mock MUI components
vi.mock('@mui/material', () => ({
  CircularProgress: () => React.createElement('div', null, 'Loading...'),
  Link: ({ children, ...props }) => React.createElement('a', props, children),
}))

// Mock icons
vi.mock('@mui/icons-material', () => ({
  PlayArrow: () => React.createElement('div', null, 'PlayArrow'),
  Refresh: () => React.createElement('div', null, 'Refresh'),
  Visibility: () => React.createElement('div', null, 'Visibility'),
}))

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
  Link: ({ children, ...props }) => React.createElement('a', props, children),
}))

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, defaultValue) => {
      // Handle react-i18next t(key, defaultValue) pattern
      if (typeof defaultValue === 'string') {
        return defaultValue;
      }
      return key;
    },
    i18n: { changeLanguage: vi.fn() }
  }),
  I18nextProvider: ({ children }) => children,
  initReactI18next: vi.fn(),
}))

// Mock the raI18nProvider
vi.mock('../i18n/index.js', () => ({
  raI18nProvider: {
    translate: (key, optionsOrDefault) => {
      // Handle both patterns: translate(key, options) and translate(key, defaultValue)
      if (typeof optionsOrDefault === 'object' && optionsOrDefault?.defaultValue) {
        return optionsOrDefault.defaultValue;
      }
      if (typeof optionsOrDefault === 'string') {
        return optionsOrDefault;
      }
      // For React Admin keys, provide fallback text
      if (key.startsWith('ra.')) {
        const raKey = key.replace('ra.', '');
        if (raKey === 'action.save') return 'Save';
        if (raKey === 'action.create') return 'Create';
        if (raKey === 'action.edit') return 'Edit';
        if (raKey === 'action.delete') return 'Delete';
        if (raKey === 'action.refresh') return 'Refresh';
        if (raKey === 'action.show') return 'Show';
        if (raKey === 'action.list') return 'List';
        if (raKey === 'action.bulk_actions') return 'Bulk actions';
        if (raKey === 'action.export') return 'Export';
        if (raKey === 'action.search') return 'Search';
        if (raKey === 'action.select_all') return 'Select all';
        if (raKey === 'action.clear_input_value') return 'Clear';
        if (raKey === 'action.remove_filter') return 'Remove filter';
        if (raKey === 'action.add_filter') return 'ADD FILTER';
        if (raKey === 'action.open_menu') return 'Open menu';
        if (raKey === 'action.close_menu') return 'Close menu';
        if (raKey === 'action.open') return 'Open';
        if (raKey === 'action.close') return 'Close';
        if (raKey === 'action.back') return 'Back';
        if (raKey === 'action.undo') return 'Undo';
      }
      // For resource field keys, provide fallback text
      if (key.startsWith('resources.scheduledclasses.fields.')) {
        const field = key.replace('resources.scheduledclasses.fields.', '');
        if (field === 'name') return 'Name';
        if (field === 'course') return 'Course';
        if (field === 'pattern_start_date') return 'Pattern Start Date';
        if (field === 'number_of_lessons') return 'Number of Lessons';
        if (field === 'recurrence_type') return 'Recurrence Type';
        if (field === 'recurrence_value') return 'Recurrence Value';
        if (field === 'instructor') return 'Instructor';
        if (field === 'resource') return 'Resource';
        if (field === 'start_time') return 'Start Time';
        if (field === 'duration_minutes') return 'Duration Minutes';
      }
      // For scheduled class patterns fields
      if (key.startsWith('resources.scheduledclasspatterns.fields.')) {
        const field = key.replace('resources.scheduledclasspatterns.fields.', '');
        if (field === 'start_date') return 'Pattern Start Date';
        if (field === 'name') return 'Name';
        if (field === 'course') return 'Course';
        if (field === 'instructor') return 'Instructor';
        if (field === 'resource') return 'Resource';
        if (field === 'day') return 'Day';
        if (field === 'time') return 'Time';
        if (field === 'num_lessons') return 'Number of Lessons';
        if (field === 'duration_minutes') return 'Duration (min)';
        if (field === 'max_students') return 'Max Students';
        if (field === 'status') return 'Status';
        if (field === 'students') return 'Students';
      }
      return key;
    },
    changeLocale: vi.fn(),
    getLocale: () => 'en',
  },
  default: vi.fn(), // Mock the default export (i18n instance)
}))