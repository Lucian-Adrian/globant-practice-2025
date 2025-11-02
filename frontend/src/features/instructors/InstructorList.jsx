import PeopleIcon from '@mui/icons-material/People';
import { useMediaQuery, Drawer, Box, Card, CardHeader, CardContent, CardActions, Avatar, Typography } from '@mui/material';
import { Chip } from '@mui/material';
import * as React from 'react';
import { BulkDeleteWithConfirmButton, List, SimpleList, EditButton, ShowButton, DateField, TextField, EmailField, Datagrid, NumberField, FunctionField, useTranslate, useListContext } from 'react-admin';
import InstructorListAside from './InstructorListAside.jsx';
import InstructorListEmpty from './InstructorListEmpty.jsx';
import ListImportActions from '../../shared/components/ListImportActions';
import CategoryFilterInput from '../../shared/components/CategoryFilterInput.jsx';
import SearchInput from '../../shared/components/SearchInput.jsx';
import { useAsidePanel } from '../../shared/state/AsidePanelContext.jsx';

export const InstructorIcon = PeopleIcon;

// Function to determine instructor status based on hire date and experience
const getInstructorStatus = (record) => {
  if (!record || !record.hire_date) {
    return { status: 'UNKNOWN', colorHex: '#9ca3af' };
  }

  const hireDate = new Date(record.hire_date);
  const now = new Date();
  const yearsExperience = (now - hireDate) / (1000 * 60 * 60 * 24 * 365);

  // Map experience buckets to hex colors (match InstructorListAside)
  if (yearsExperience < 1) {
    return { status: 'NEW', colorHex: '#60a5fa' };
  } else if (yearsExperience >= 1 && yearsExperience <= 5) {
    return { status: 'EXPERIENCED', colorHex: '#10b981' };
  } else if (yearsExperience > 5) {
    return { status: 'SENIOR', colorHex: '#ef4444' };
  } else {
    return { status: 'UNKNOWN', colorHex: '#9ca3af' };
  }
};

// helper to convert a hex color to rgba with alpha
const hexToRgba = (hex, alpha = 1) => {
  const cleaned = hex.replace('#', '');
  const full = cleaned.length === 3 ? cleaned.split('').map(c => c + c).join('') : cleaned;
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Status field component with colored chips (translated)
const InstructorStatusField = (recordOrProps) => {
  const t = useTranslate();
  const record = recordOrProps?.record ?? recordOrProps;
  const { status, colorHex } = getInstructorStatus(record);
  // Map status values to translation keys
  const statusKeyMap = {
    NEW: 'filters_extra.new',
    EXPERIENCED: 'filters_extra.experienced',
    SENIOR: 'filters_extra.senior',
    UNKNOWN: 'filters.unknown'
  };
  const labelKey = statusKeyMap[status] || statusKeyMap.UNKNOWN || 'filters.unknown';
  const label = t(labelKey, status);
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        fontWeight: 'bold',
        minWidth: '100px',
        backgroundColor: colorHex,
        color: 'white'
      }}
    />
  );
};

const getInstructorFilters = () => [
  <SearchInput key="search" alwaysOn />,
  <CategoryFilterInput key="category" source="category" alwaysOn />,
];

const InstructorBulkActionButtons = props => (
  <BulkDeleteWithConfirmButton {...props} />
);

export default function InstructorList() {
  const isSmall = useMediaQuery(theme => theme.breakpoints.down('md'));
  const [selectedId, setSelectedId] = React.useState(null);
  const { collapsed } = useAsidePanel();
  return (
    <List
      filters={getInstructorFilters()}
      sort={{ field: 'first_name', order: 'ASC' }}
      aside={collapsed ? null : <InstructorListAside />}
      actions={<ListImportActions endpoint="instructors" />}
      empty={<InstructorListEmpty />}
    >
      {isSmall ? (
        <SimpleList
          primaryText={record => `${record.first_name} ${record.last_name}`}
          secondaryText={record => record.license_categories}
          onClick={record => setSelectedId(record.id)}
        />
      ) : (
        <FilteredInstructorDatagrid setSelectedId={setSelectedId} />
      )}
      <InstructorDetailPanel selectedId={selectedId} onClose={() => setSelectedId(null)} />
    </List>
  );
}

function FilteredInstructorDatagrid({ setSelectedId }) {
  const isSmall = useMediaQuery(theme => theme.breakpoints.down('md'));
  const t = useTranslate();
  const alpha = 0.15;
  const [selectedId, setSelectedIdLocal] = React.useState(null);
  return (
  <Datagrid 
      rowClick={(id, basePath, record) => {
        setSelectedId(id);
        return undefined; // Prevent navigation
      }}
      rowStyle={(record) => {
        const { colorHex } = getInstructorStatus(record);
        if (!colorHex) return {};
        return {
          backgroundColor: hexToRgba(colorHex, alpha),
          borderLeft: `4px solid ${colorHex}`
        };
      }}
    >
      <NumberField source="id" />
      <TextField source="first_name" />
      <TextField source="last_name" />
      <EmailField source="email" />
      <TextField source="phone_number" />
      <DateField source="hire_date" />
      <TextField source="license_categories" />
      <FunctionField 
        label={t('resources.instructors.fields.experience', 'Experience')} 
        render={(record) => <InstructorStatusField record={record} />}
      />
    </Datagrid>
  );
}

// List instructors as single-line rows
function InstructorRowList({ onSelect, selectedId }) {
  const { data } = useListContext();
  if (!data) return null;
  return (
    <Box>
      {data.map(record => (
        <Box
          key={record.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 2,
            py: 1,
            mb: 1,
            borderRadius: 2,
            boxShadow: selectedId === record.id ? 4 : 1,
            border: selectedId === record.id ? '2px solid #1976d2' : '1px solid #eee',
            cursor: 'pointer',
            background: selectedId === record.id ? '#e3f2fd' : '#fff',
          }}
          onClick={() => onSelect(record.id)}
        >
          <Avatar sx={{ mr: 2 }}><PeopleIcon /></Avatar>
          <Typography variant="subtitle1" sx={{ flex: 1 }}>{record.first_name} {record.last_name}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mr: 2 }}>{record.license_categories}</Typography>
        </Box>
      ))}
    </Box>
  );
}

// Side panel with instructor details
function InstructorDetailPanel({ selectedId, onClose }) {
  const { data } = useListContext();
  const record = data?.find(r => r.id === selectedId);
  return (
    <Drawer anchor="right" open={!!record} onClose={onClose} PaperProps={{ sx: { width: 340 } }}>
      {record ? (
        <Box sx={{ p: 2 }}>
          <Card elevation={0}>
            <CardHeader
              title={`${record.first_name} ${record.last_name}`}
              subheader={record.license_categories}
              avatar={<Avatar><PeopleIcon /></Avatar>}
            />
            <CardContent>
              <Typography variant="body2">Email: {record.email}</Typography>
              <Typography variant="body2">Telefon: {record.phone_number}</Typography>
              <Typography variant="body2">Data angajării: {record.hire_date}</Typography>
              <Typography variant="body2">Categorie mașină: {record.car_category}</Typography>
              <Typography variant="body2">Categorii permis: {record.license_categories}</Typography>
              {/* Add any other fields you want to show here */}
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <EditButton record={record} />
              <ShowButton record={record} />
            </CardActions>
          </Card>
        </Box>
      ) : null}
    </Drawer>
  );
}
