import PeopleIcon from '@mui/icons-material/People';
import { useMediaQuery, Drawer, Box, Card, CardHeader, CardContent, CardActions, Avatar, Typography } from '@mui/material';
import * as React from 'react';
import { BulkDeleteWithConfirmButton, List, SearchInput, SimpleList, TextInput, EditButton, ShowButton, DateField, TextField, EmailField } from 'react-admin';
import { useListContext } from 'react-admin';
import InstructorListAside from './InstructorListAside.jsx';

export const InstructorIcon = PeopleIcon;

const getInstructorFilters = () => [
  <SearchInput source="q" alwaysOn />,
  <TextInput source="first_name" />,
  <TextInput source="last_name" />,
  <TextInput source="license_categories" />,
];

const InstructorBulkActionButtons = props => (
  <BulkDeleteWithConfirmButton {...props} />
);

export default function InstructorList() {
  const isSmall = useMediaQuery(theme => theme.breakpoints.down('md'));
  const [selectedId, setSelectedId] = React.useState(null);
  return (
    <List
      filters={getInstructorFilters()}
      sort={{ field: 'first_name', order: 'ASC' }}
      aside={<InstructorListAside />}
    >
      {isSmall ? (
        <SimpleList
          primaryText={record => `${record.first_name} ${record.last_name}`}
          secondaryText={record => record.license_categories}
          onClick={record => setSelectedId(record.id)}
        />
      ) : (
        <InstructorRowList onSelect={setSelectedId} selectedId={selectedId} />
      )}
      <InstructorDetailPanel selectedId={selectedId} onClose={() => setSelectedId(null)} />
    </List>
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
