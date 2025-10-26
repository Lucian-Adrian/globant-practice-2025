import * as React from 'react';
import { Create, SimpleForm, TextInput, NumberInput, SelectInput, required, useTranslate } from 'react-admin';

export default function makeCourseCreate(vehicleChoices, courseTypeChoices) {
  return function CourseCreate(props) {
    const translate = useTranslate();
    return (
      <Create {...props} title={translate('ra.page.create', { defaultValue: 'Create' })}>
        <SimpleForm>
          <TextInput source="name" validate={[required()]} />
          <SelectInput source="category" choices={vehicleChoices} translateChoice={false} validate={[required()]} />
          <SelectInput source="type" choices={courseTypeChoices} /* translatable keys */ validate={[required()]} />
          <TextInput source="description" multiline rows={3} />
          <NumberInput source="price" validate={[required()]} />
          <NumberInput source="required_lessons" validate={[required()]} />
        </SimpleForm>
      </Create>
    );
  };
}
