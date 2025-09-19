import * as React from 'react';
import { List, Datagrid, NumberField, TextField } from 'react-admin';
import CourseListAside from './CourseListAside.jsx';

export default function CourseList(props) {
  return (
    <List {...props} aside={<CourseListAside />}> 
      <Datagrid rowClick="edit">
        <NumberField source="id" />
        <TextField source="name" />
        <TextField source="category" />
        <TextField source="type" />
        <TextField source="description" />
        <NumberField source="price" />
        <NumberField source="required_lessons" />
      </Datagrid>
    </List>
  );
}
