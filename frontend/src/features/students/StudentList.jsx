import * as React from 'react';
import { List, Datagrid, NumberField, TextField, EmailField, DateField } from 'react-admin';
import StudentListAside from './StudentListAside';
import StudentListActions from './StudentListActions';

const studentRowStyle = (record) => {
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

export default function makeStudentList() {
  return function StudentList(props) {
    return (
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
  };
}
