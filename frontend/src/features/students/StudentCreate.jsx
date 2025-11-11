import * as React from 'react';
import { Create, SimpleForm, TextInput, DateInput, useTranslate } from 'react-admin';
import NameInput from '../../shared/components/NameInput';
import PhoneInput from '../../shared/components/PhoneInput';
import EmailInput from '../../shared/components/EmailInput';
import { validateDOB, validatePhoneClient } from '../../shared/validation/validators';

export default function makeStudentCreate() {
  return function StudentCreate(props) {
    const t = useTranslate();

    const validatePassword = (value) => {
      if (!value) return 'Password is required';
      if (String(value).length < 6) return 'Password must be at least 6 characters';
      return undefined;
    };

    const validateConfirmPassword = (value, allValues) => {
      if (!value) return 'Please confirm the password';
      if (value !== allValues.password) return 'Passwords do not match';
      return undefined;
    };

    const transformCreate = (data) => {
      const out = { ...data };
      // Remove confirm_password, backend expects only `password`
      delete out.confirm_password;
      return out;
    };

    return (
      <Create {...props} redirect="list" transform={transformCreate} title={t('ra.page.create', { defaultValue: 'Create' })}>
        <SimpleForm>
          <NameInput 
            source="first_name" 
            label={`${t('resources.students.fields.first_name', { defaultValue: 'First name' })} *`} 
            validate={[v => (!v ? 'First name is required' : undefined)]} 
          />
          <NameInput 
            source="last_name" 
            label={`${t('resources.students.fields.last_name', { defaultValue: 'Last name' })} *`} 
            validate={[v => (!v ? 'Last name is required' : undefined)]} 
          />
          <EmailInput 
            source="email" 
            label={`${t('resources.students.fields.email', { defaultValue: 'Email' })} *`} 
          />
          <PhoneInput 
            source="phone_number" 
            label={`${t('resources.students.fields.phone_number', { defaultValue: 'Phone number' })} *`} 
            validate={[validatePhoneClient]} 
          />
          <DateInput 
            source="date_of_birth" 
            label={`${t('resources.students.fields.date_of_birth', { defaultValue: 'Date of birth' })} *`} 
            validate={[validateDOB]} 
          />
          <TextInput 
            source="password" 
            label={`${t('resources.students.fields.password', { defaultValue: 'Password' })} *`} 
            type="password" 
            validate={[validatePassword]} 
          />
          <TextInput 
            source="confirm_password" 
            label={`${t('resources.students.fields.confirm_password', { defaultValue: 'Confirm password' })} *`} 
            type="password" 
            validate={[validateConfirmPassword]} 
          />
          {/* New students auto set to PENDING – hide status field on create */}
        </SimpleForm>
      </Create>
    );
  };
}