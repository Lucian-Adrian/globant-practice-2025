import * as React from 'react';
import { List, Datagrid, NumberField, TextField, DateField, ReferenceField } from 'react-admin';
import LessonListAside from './LessonListAside.jsx';

export default function LessonList(props) {
  return (
    <List {...props} aside={<LessonListAside />}> 
      <Datagrid rowClick="edit">
        <NumberField source="id" />
        <ReferenceField source="enrollment.id" reference="enrollments" label="Enrollment">
          <TextField source="label" />
        </ReferenceField>
        <ReferenceField source="instructor.id" reference="instructors" label="Instructor" />
        <TextField source="vehicle.license_plate" label="Vehicle" />
        <DateField source="scheduled_time" />
        <NumberField source="duration_minutes" />
        <TextField source="status" />
      </Datagrid>
    </List>
  );
}
