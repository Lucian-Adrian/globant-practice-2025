import { makeStudentList, makeStudentEdit, makeStudentCreate } from './features/students';
import { VEHICLE_CATEGORIES as FALLBACK_VEHICLE, STUDENT_STATUS as FALLBACK_STUDENT, PAYMENT_METHODS as FALLBACK_PAYMENT } from './shared/constants/drivingSchool';
import { fetchEnums, mapToChoices } from './enumsClient';
import { VehicleList, makeVehicleEdit, makeVehicleCreate, LicensePlateInput } from './features/vehicles';
import { InstructorList, InstructorEdit, InstructorCreate } from './features/instructors';
import { CourseList, makeCourseEdit, makeCourseCreate } from './features/courses';
import { PaymentList, makePaymentEdit, makePaymentCreate } from './features/payments';
import { EnrollmentList, EnrollmentEdit, EnrollmentCreate } from './features/enrollments';
import { LessonList, LessonEdit, LessonCreate } from './features/lessons';
import dataProvider from './api/dataProvider';
// phone utils can be used later for composite inputs
import { authProvider } from './authProvider';

import * as React from 'react';
import { Admin, Resource } from 'react-admin';

// CSV Import/Export actions moved to features/students/StudentListActions


// Error extraction handled within dataProvider

// dataProvider now lives in ./api/dataProvider

export default function App() {
  const [enums, setEnums] = React.useState(null);
  React.useEffect(() => { fetchEnums().then(setEnums); }, []);
  const vehicleChoices = enums ? mapToChoices(enums.vehicle_category) : FALLBACK_VEHICLE;
  const studentChoices = enums ? mapToChoices(enums.student_status) : FALLBACK_STUDENT;
  const courseTypeChoices = enums ? mapToChoices(enums.course_type) : [ { id: 'THEORY', name: 'THEORY' }, { id: 'PRACTICE', name: 'PRACTICE' } ];
  const paymentChoices = enums ? mapToChoices(enums.payment_method) : FALLBACK_PAYMENT;
  return (
    <>
  <Admin basename="/admin" dataProvider={dataProvider} authProvider={authProvider}>
  <Resource name="students" list={makeStudentList()} edit={makeStudentEdit(studentChoices)} create={makeStudentCreate()} />
  <Resource name="instructors" list={InstructorList} edit={InstructorEdit} create={InstructorCreate} />
  <Resource name="vehicles" list={VehicleList} edit={makeVehicleEdit(vehicleChoices)} create={makeVehicleCreate(vehicleChoices)} />
  <Resource name="classes" list={CourseList} edit={makeCourseEdit(vehicleChoices, courseTypeChoices)} create={makeCourseCreate(vehicleChoices, courseTypeChoices)} />
  <Resource name="payments" list={PaymentList} edit={makePaymentEdit(paymentChoices)} create={makePaymentCreate(paymentChoices)} />
  <Resource name="enrollments" list={EnrollmentList} edit={EnrollmentEdit} create={EnrollmentCreate} />
  <Resource name="lessons" list={LessonList} edit={LessonEdit} create={LessonCreate} />
  </Admin>
    </>
  );
}
import { validateDOB, validateEmail, validatePhoneClient } from './shared/validation/validators';

