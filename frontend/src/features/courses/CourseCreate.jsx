import * as React from 'react';
import { Create, SimpleForm, TextInput, NumberInput, SelectInput, required } from 'react-admin';

export default function makeCourseCreate(vehicleChoices, courseTypeChoices) {
  return function CourseCreate(props) {
    return (
      <Create {...props}>
        <SimpleForm>
          <TextInput source="name" validate={[required()]} />
          <SelectInput source="category" choices={vehicleChoices} validate={[required()]} />
          <SelectInput source="type" choices={courseTypeChoices} validate={[required()]} />
          <TextInput source="description" multiline rows={3} />
          <NumberInput source="price" validate={[required()]} />
          <NumberInput source="required_lessons" validate={[required()]} />
        </SimpleForm>
      </Create>
    );
  };
}
