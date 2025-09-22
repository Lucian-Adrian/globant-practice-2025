import * as React from 'react';
import { List, Datagrid, NumberField, TextField, BooleanField, EditButton } from 'react-admin';
import VehicleListAside from './VehicleListAside.jsx';
import { Drawer, Box, Card, CardHeader, CardContent, CardActions, Typography } from '@mui/material';

export default function VehicleList(props) {
  const [selectedRecord, setSelectedRecord] = React.useState(null);

  const handleRowClick = (id, basePath, record) => {
    setSelectedRecord(record);
    return undefined; // Prevent navigation
  };

  return (
    <List {...props} aside={<VehicleListAside />}> 
      <Datagrid rowClick={handleRowClick}>
        <NumberField source="id" />
        <TextField source="make" />
        <TextField source="model" />
        <TextField source="license_plate" />
        <TextField source="year" />
        <TextField source="category" />
        <BooleanField source="is_available" />
      </Datagrid>
      <VehicleDetailPanel record={selectedRecord} onClose={() => setSelectedRecord(null)} />
    </List>
  );
}

function VehicleDetailPanel({ record, onClose }) {
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
              <Typography variant="body2">Disponibil: {record.is_available ? 'Da' : 'Nu'}</Typography>
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
