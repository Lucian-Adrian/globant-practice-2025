import React from 'react';
import { Edit, useTranslate } from 'react-admin';
import InstructorAvailabilityForm from './InstructorAvailabilityForm';

export default function InstructorAvailabilityEdit(props) {
	// We reuse the batch form. The form allows selecting the instructor and saving all days at once.
	const translate = useTranslate();
	return (
		<Edit {...props} title={translate('ra.page.edit', { defaultValue: 'Edit' })}>
			<InstructorAvailabilityForm />
		</Edit>
	);
}

