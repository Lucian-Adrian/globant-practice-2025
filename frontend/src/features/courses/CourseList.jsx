import * as React from 'react';
import { List, Datagrid, NumberField, TextField } from 'react-admin';

export default function CourseList(props) {
  return (
    <List {...props}>
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
