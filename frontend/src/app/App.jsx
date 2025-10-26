import * as React from 'react';
import { Admin, Resource, CustomRoutes } from 'react-admin';
import { raI18nProvider } from '../i18n/index.js';
import Layout from './Layout.jsx';
import dataProvider from '../api/dataProvider';
import { authProvider } from '../auth/authProvider';
import { fetchEnums, mapToChoices, mapToLocalizedChoices } from '../api/enumsClient';
import { makeStudentList, makeStudentEdit, makeStudentCreate } from '../features/students';
import { VehicleList, makeVehicleEdit, makeVehicleCreate } from '../features/vehicles';
import { InstructorList, InstructorEdit, InstructorCreate } from '../features/instructors';
import { InstructorAvailabilityList } from '../features/instructoravailabilities';
import { CourseList, makeCourseEdit, makeCourseCreate } from '../features/courses';
import { PaymentList, makePaymentEdit, makePaymentCreate } from '../features/payments';
import { EnrollmentList, EnrollmentEdit, EnrollmentCreate } from '../features/enrollments';
import { LessonList, LessonEdit, LessonCreate } from '../features/lessons';
import { VEHICLE_CATEGORIES as FALLBACK_VEHICLE, STUDENT_STATUS as FALLBACK_STUDENT, PAYMENT_METHODS as FALLBACK_PAYMENT } from '../shared/constants/drivingSchool';
import { Route } from 'react-router-dom';
import StudentsKanban from '../features/students/kanban/StudentsKanban.jsx';
import Dashboard from './Dashboard.jsx';

export default function App() {
  const [enums, setEnums] = React.useState(null);
  React.useEffect(() => { fetchEnums().then(setEnums); }, []);
  const vehicleChoices = enums ? mapToChoices(enums.vehicle_category) : FALLBACK_VEHICLE;
  const studentChoices = enums ? mapToLocalizedChoices('student_status', enums.student_status) : FALLBACK_STUDENT;
  const courseTypeChoices = enums ? mapToLocalizedChoices('course_type', enums.course_type) : [ { id: 'THEORY', name: 'common.filters.theory' }, { id: 'PRACTICE', name: 'common.filters.practice' } ];
  const paymentChoices = enums ? mapToLocalizedChoices('payment_method', enums.payment_method) : FALLBACK_PAYMENT;
  return (
  <Admin basename="/admin" dataProvider={dataProvider} authProvider={authProvider} i18nProvider={raI18nProvider} layout={Layout} dashboard={Dashboard}>
      <CustomRoutes>
        <Route path="students/board" element={<StudentsKanban />} />
      </CustomRoutes>
      <Resource name="students" list={makeStudentList()} edit={makeStudentEdit(studentChoices)} create={makeStudentCreate()} />
      <Resource name="instructors" list={InstructorList} edit={InstructorEdit} create={InstructorCreate} />
      <Resource name="vehicles" list={VehicleList} edit={makeVehicleEdit(vehicleChoices)} create={makeVehicleCreate(vehicleChoices)} />
      <Resource name="instructor-availabilities" list={InstructorAvailabilityList} />
      <Resource name="classes" list={CourseList} edit={makeCourseEdit(vehicleChoices, courseTypeChoices)} create={makeCourseCreate(vehicleChoices, courseTypeChoices)} />
      <Resource name="payments" list={PaymentList} edit={makePaymentEdit(paymentChoices)} create={makePaymentCreate(paymentChoices)} />
      <Resource name="enrollments" list={EnrollmentList} edit={EnrollmentEdit} create={EnrollmentCreate} />
      <Resource name="lessons" list={LessonList} edit={LessonEdit} create={LessonCreate} />
    </Admin>
  );
}
