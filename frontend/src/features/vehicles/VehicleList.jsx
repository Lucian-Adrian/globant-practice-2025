import * as React from 'react';
import { List, Datagrid, NumberField, TextField, BooleanField, EditButton, FunctionField, useListContext, useTranslate } from 'react-admin';
import { useLocation } from 'react-router-dom';
import { Chip } from '@mui/material';
import VehicleListAside from './VehicleListAside.jsx';
import VehicleListEmpty from './VehicleListEmpty.jsx';
import ListImportActions from '../../shared/components/ListImportActions';
import { Drawer, Box, Card, CardHeader, CardContent, CardActions, Typography } from '@mui/material';
import CategoryFilterInput from '../../shared/components/CategoryFilterInput.jsx';

// Function to get vehicle availability status with color coding
const getVehicleStatus = (record) => {
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
const VehicleStatusField = (recordOrProps) => {
  const record = recordOrProps?.record ?? recordOrProps;
  const { status, color } = getVehicleStatus(record);
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

export default function VehicleList(props) {
  const [selectedRecord, setSelectedRecord] = React.useState(null);
  const filters = [
    <CategoryFilterInput key="category" alwaysOn />,
  ];

  return (
    <List {...props} filters={filters} aside={<VehicleListAside />} actions={<ListImportActions endpoint="vehicles" />} empty={<VehicleListEmpty />}> 
      <FilteredVehicleDatagrid setSelectedRecord={setSelectedRecord} />
      <VehicleDetailPanel
       record={selectedRecord}
       onClose={() => setSelectedRecord(null)}
     />
    </List>
  );
}

function FilteredVehicleDatagrid({ setSelectedRecord }) {
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
          const { color } = getVehicleStatus(record);
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
        <NumberField source="id" />
        <TextField source="make" />
        <TextField source="model" />
        <TextField source="license_plate" />
        <TextField source="year" />
        <TextField source="category" />
        <FunctionField 
          label={t('resources.vehicles.fields.is_available', 'Availability')} 
          render={(record) => <VehicleStatusField record={record} />}
        />
      </Datagrid>
    </>
  );
}

function VehicleDetailPanel({ record, onClose }) {
  const t = useTranslate();
  return (
    <Drawer anchor="right" open={!!record} onClose={onClose} PaperProps={{ sx: { width: 340 } }}>
      {record ? (
        <Box sx={{ p: 2 }}>
          <Card elevation={0}>
            <CardHeader
              title={`${record.make} ${record.model}`}
              subheader={`Număr: ${record.license_plate}`}
            />
            <CardContent>
              <Typography variant="body2">An: {record.year}</Typography>
              <Typography variant="body2">Categorie: {record.category}</Typography>
              <Typography variant="body2">{t('resources.vehicles.fields.is_available', 'Availability')}: {record.is_available ? t('filters.available','Available') : t('filters.unavailable','Unavailable')}</Typography>
              {/* Add maintenance status, instructor/lesson assignment info here if available */}
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
