import * as React from 'react';
import { Edit, SimpleForm, TextInput, NumberInput, SelectInput, required, useTranslate } from 'react-admin';

export default function makeCourseEdit(vehicleChoices, courseTypeChoices) {
  return function CourseEdit(props) {
    const translate = useTranslate();
    return (
      <Edit {...props} title={translate('ra.page.edit', { defaultValue: 'Edit' })}>
        <SimpleForm>
          <TextInput source="name" validate={[required()]} />
          <SelectInput source="category" choices={vehicleChoices} validate={[required()]} />
          <SelectInput source="type" choices={courseTypeChoices} validate={[required()]} />
          <TextInput source="description" multiline rows={3} />
          <NumberInput source="price" validate={[required()]} />
          <NumberInput source="required_lessons" validate={[required()]} />
        </SimpleForm>
      </Edit>
    );
  };
}
