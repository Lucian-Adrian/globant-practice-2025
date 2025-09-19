Driving School API
 0.1.0 
OAS 3.0
/api/schema/
API schema for the Driving School backend (enums, students, enrollments, etc.).


Authorize
auth


GET
/api/auth/me/



GET
/api/auth/test/check-username/



POST
/api/auth/test/signup/



POST
/api/auth/token/


POST
/api/auth/token/refresh/

courses


GET
/api/courses/



POST
/api/courses/



GET
/api/courses/{id}/



PUT
/api/courses/{id}/



PATCH
/api/courses/{id}/



DELETE
/api/courses/{id}/


enrollments


GET
/api/enrollments/



POST
/api/enrollments/



GET
/api/enrollments/{id}/



PUT
/api/enrollments/{id}/



PATCH
/api/enrollments/{id}/



DELETE
/api/enrollments/{id}/


instructors


GET
/api/instructors/



POST
/api/instructors/



GET
/api/instructors/{id}/



PUT
/api/instructors/{id}/



PATCH
/api/instructors/{id}/



DELETE
/api/instructors/{id}/


lessons


GET
/api/lessons/



POST
/api/lessons/



GET
/api/lessons/{id}/



PUT
/api/lessons/{id}/



PATCH
/api/lessons/{id}/



DELETE
/api/lessons/{id}/


meta


GET
/api/meta/enums/


payments


GET
/api/payments/



POST
/api/payments/



GET
/api/payments/{id}/



PUT
/api/payments/{id}/



PATCH
/api/payments/{id}/



DELETE
/api/payments/{id}/


students


GET
/api/students/



POST
/api/students/



GET
/api/students/{id}/



PUT
/api/students/{id}/



PATCH
/api/students/{id}/



DELETE
/api/students/{id}/



GET
/api/students/export/



POST
/api/students/import/


utils


GET
/api/utils/schedule/



GET
/api/utils/summary/


vehicles


GET
/api/vehicles/



POST
/api/vehicles/



GET
/api/vehicles/{id}/



PUT
/api/vehicles/{id}/



PATCH
/api/vehicles/{id}/



DELETE
/api/vehicles/{id}/


CategoryEnum
Course
Enrollment
EnrollmentStatusEnum
Instructor
Lesson
LessonStatusEnum
PaginatedCourseList
PaginatedEnrollmentList
PaginatedInstructorList
PaginatedLessonList
PaginatedPaymentList
PaginatedStudentList
PaginatedVehicleList
PatchedCourse
PatchedEnrollment
PatchedInstructor
PatchedLesson
PatchedPayment
PatchedStudent
PatchedVehicle
Payment
PaymentMethodEnum
Student
StudentStatusEnum
TokenObtainPair
TokenRefresh
TypeEnum
Vehicle
