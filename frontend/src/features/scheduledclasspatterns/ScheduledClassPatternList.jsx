import * as React from 'react';
import { List, Datagrid, TextField, DateField, NumberField, ReferenceField } from 'react-admin';

export default function ScheduledClassPatternList(props) {
  return (
    <List {...props}>
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="name" />
        <ReferenceField source="course_id" reference="classes" link="show">
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField source="instructor_id" reference="instructors" link="show">
          <TextField source="first_name" />
        </ReferenceField>
        <DateField source="start_date" />
        <NumberField source="num_lessons" />
        <TextField source="status" />
      </Datagrid>
    </List>
  );
}