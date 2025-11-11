import * as React from 'react';
import { List, Datagrid, NumberField, TextField, BooleanField, EditButton, FunctionField, useListContext, useTranslate } from 'react-admin';
import { useLocation } from 'react-router-dom';
import { Chip } from '@mui/material';
import ResourceListAside from './ResourceListAside.jsx';
import ResourceListEmpty from './ResourceListEmpty.jsx';
import ListImportActions from '../../shared/components/ListImportActions';
import { Drawer, Box, Card, CardHeader, CardContent, CardActions, Typography } from '@mui/material';
import CategoryFilterInput from '../../shared/components/CategoryFilterInput.jsx';

// Function to get resource availability status with color coding
const getResourceStatus = (record) => {
  if (!record) {
    return { status: 'UNKNOWN', color: 'default' };
  }

  if (record.is_available === true) {
    return { status: 'AVAILABLE', color: 'success' };
  } else if (record.is_available === false) {
    return { status: 'IN_USE', color: 'warning' };
  } else {
    return { status: 'UNKNOWN', color: 'default' };
  }
};

// Status field component with colored chips
const ResourceStatusField = (recordOrProps) => {
  const record = recordOrProps?.record ?? recordOrProps;
  const { status, color } = getResourceStatus(record);
  const t = useTranslate();
  const labelMap = {
    AVAILABLE: t('filters.available', 'Available'),
    IN_USE: t('filters.unavailable', 'Unavailable'),
    UNKNOWN: t('unknown', 'Unknown')
  };
  const label = labelMap[status] || status;
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        fontWeight: 'bold',
        minWidth: '100px',
        ...(color === 'success' && {
          backgroundColor: '#4caf50',
          color: 'white'
        }),
        ...(color === 'warning' && {
          backgroundColor: '#ff9800',
          color: 'white'
        }),
        ...(color === 'default' && {
          backgroundColor: '#9e9e9e',
          color: 'white'
        })
      }}
    />
  );
};

export default function ResourceList(props) {
  const [selectedRecord, setSelectedRecord] = React.useState(null);
  const filters = [
    <CategoryFilterInput key="category" alwaysOn />,
  ];

  return (
    <List {...props} filters={filters} aside={<ResourceListAside />} actions={<ListImportActions endpoint="resources" />} empty={<ResourceListEmpty />}>
      <FilteredResourceDatagrid setSelectedRecord={setSelectedRecord} />
      <ResourceDetailPanel
       record={selectedRecord}
       onClose={() => setSelectedRecord(null)}
     />
    </List>
  );
}

function FilteredResourceDatagrid({ setSelectedRecord }) {
  const location = useLocation();
  const { data } = useListContext();
  const t = useTranslate();
  const params = new URLSearchParams(location.search);
  const gte = params.get('last_maintenance_gte');
  const lte = params.get('last_maintenance_lte');

  const filtered = (data || []).filter((record) => {
    if (!record) return false;
    const d = record.last_maintenance ? new Date(record.last_maintenance) : null;
    if (!d) return true;
    if (gte && d < new Date(gte)) return false;
    if (lte && d > new Date(lte)) return false;
    return true;
  });

  const alpha = 0.15;
  const handleRowClick = (id, basePath, record) => {
    setSelectedRecord(record);
    return false;
  };

  return (
    <>
      <Datagrid
        data={filtered}
        rowClick={handleRowClick}
        rowStyle={(record) => {
          const { color } = getResourceStatus(record);
          switch (color) {
            case 'success':
              return {
                backgroundColor: `rgba(76, 175, 80, ${alpha})`,
                borderLeft: '4px solid #4caf50'
              };
            case 'warning':
              return {
                backgroundColor: `rgba(255, 152, 0, ${alpha})`,
                borderLeft: '4px solid #ff9800'
              };
            default:
              return {};
          }
        }}
      >
        <NumberField source="id" label={t('resources.resources.fields.id', 'ID')} />
        <TextField source="name" label={t('resources.resources.fields.name', 'Name')} />
        <NumberField source="max_capacity" label={t('resources.resources.fields.max_capacity', 'Max Capacity')} />
        <TextField source="category" label={t('resources.resources.fields.category', 'Category')} />
        <TextField source="license_plate" label={t('resources.resources.fields.license_plate', 'License Plate')} />
        <FunctionField
          label={t('resources.resources.fields.resource_type', 'Type')}
          render={(record) => 
            (record.max_capacity ?? 0) <= 2
              ? t('resources.resources.fields.vehicle', 'Vehicle')
              : t('resources.resources.fields.classroom', 'Classroom')
          }
        />
        <FunctionField
          label={t('resources.resources.fields.is_available', 'Availability')}
          render={(record) => <ResourceStatusField record={record} />}
        />
      </Datagrid>
    </>
  );
}

function ResourceDetailPanel({ record, onClose }) {
  const t = useTranslate();
  return (
    <Drawer anchor="right" open={!!record} onClose={onClose} PaperProps={{ sx: { width: 340 } }}>
      {record ? (
        <Box sx={{ p: 2 }}>
          <Card elevation={0}>
            <CardHeader
              title={record.name}
              subheader={`Capacity: ${record.max_capacity} ${record.max_capacity === 2 ? '(Vehicle)' : '(Classroom)'}`}
            />
            <CardContent>
              <Typography variant="body2">Category: {record.category}</Typography>
              <Typography variant="body2">{t('resources.resources.fields.is_available', 'Availability')}: {record.is_available ? t('filters.available','Available') : t('filters.unavailable','Unavailable')}</Typography>
              {record.license_plate && (
                <Typography variant="body2">License Plate: {record.license_plate}</Typography>
              )}
              {record.make && record.model && (
                <Typography variant="body2">Model: {record.make} {record.model}</Typography>
              )}
              {record.year && (
                <Typography variant="body2">Year: {record.year}</Typography>
              )}
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <EditButton record={record} />
            </CardActions>
          </Card>
        </Box>
      ) : null}
    </Drawer>
  );
}