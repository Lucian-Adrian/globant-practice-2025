import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { List, Datagrid, NumberField, TextField, EmailField, DateField } from 'react-admin';

const InstructorDetailsButton = ({ record }) => {
  const navigate = useNavigate();
  return (
    <Button variant="outlined" size="small" onClick={() => navigate(`/instructors/${record.id}/details`)}>
      Detalii
    </Button>
  );
};

export const InstructorList = (props) => (
  <List {...props}>
    <Datagrid>
      <NumberField source="id" />
      <TextField source="first_name" />
      <TextField source="last_name" />
      <EmailField source="email" />
      <TextField source="phone_number" />
      <DateField source="hire_date" />
      <TextField source="license_categories" />
      <InstructorDetailsButton label="Detalii" />
    </Datagrid>
  </List>
);

export { default as InstructorEdit } from './InstructorEdit';
export { default as InstructorCreate } from './InstructorCreate';
