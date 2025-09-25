import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../../shared/components/ui/Card';
import ClassCalendar from './ClassCalendar';
import EnrollmentModal from './EnrollmentModal';

const ClassDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        setLoading(true);
        
        // Mock class data
        /*
        const mockClass = {
          id: id,
          name: "Categoria B - Curs Complet",
          category: "B",
          type: "BOTH", // THEORY, PRACTICE, BOTH
          description: "Curs complet pentru obținerea permisului categoria B, incluzând teoria și practica de conducere.",
          price: 2500,
          required_lessons: 30,
          created_at: "2024-09-01",
          status: "ACTIVE"
        };

        // Mock enrolled students
        const mockStudents = [
          {
            id: 1,
            first_name: "Gabriela",
            last_name: "Botvișelyi",
            email: "gabriela.botviselyi@email.com",
            phone_number: "+373 69 123 456",
            enrollment_date: "2024-09-15",
            status: "IN_PROGRESS",
            progress: {
              theory_lessons_completed: 8,
              theory_lessons_total: 10,
              practice_lessons_completed: 15,
              practice_lessons_total: 20
            }
          },
          {
            id: 2,
            first_name: "Alexandru",
            last_name: "Popescu",
            email: "alex.popescu@email.com",
            phone_number: "+373 69 987 654",
            enrollment_date: "2024-09-10",
            status: "IN_PROGRESS",
            progress: {
              theory_lessons_completed: 10,
              theory_lessons_total: 10,
              practice_lessons_completed: 18,
              practice_lessons_total: 20
            }
          },
          {
            id: 3,
            first_name: "Maria",
            last_name: "Ionescu",
            email: "maria.ionescu@email.com",
            phone_number: "+373 69 111 222",
            enrollment_date: "2024-08-25",
            status: "COMPLETED",
            progress: {
              theory_lessons_completed: 10,
              theory_lessons_total: 10,
              practice_lessons_completed: 20,
              practice_lessons_total: 20
            }
          }
        ];

        // Mock instructor
        const mockInstructor = {
          id: 1,
          first_name: "Ion",
          last_name: "Vasilescu",
          email: "ion.vasilescu@school.com",
          phone_number: "+373 69 555 777",
          license_categories: "B,BE,C",
          experience_years: 12,
          rating: 4.8
        };
        */

        setClassData(null); // Set to null instead of mock data
        setEnrolledStudents([]); // Set empty array instead of mock data
        setInstructor(null); // Set to null instead of mock data
      } catch (error) {
        console.error('Error fetching class details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchClassDetails();
    }
  }, [id]);

  const getProgressColor = (completed, total) => {
    const percentage = (completed / total) * 100;
    if (percentage === 100) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'IN_PROGRESS': 'bg-blue-100 text-blue-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'CANCELED': 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const handleEnrollmentSuccess = (newStudents) => {
    setEnrolledStudents(prev => [...prev, ...newStudents]);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">Clasa nu a fost găsită.</p>
          <button 
            onClick={() => navigate('/classes')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Înapoi la Lista Clase
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{classData.name}</h1>
          <p className="text-gray-600 mt-1">Categoria {classData.category}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowEnrollModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Înscrie Student
          </button>
          <button
            onClick={() => navigate('/classes')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Înapoi
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Studenți Înscriși</p>
                <p className="text-2xl font-bold text-gray-900">{enrolledStudents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Absolvenți</p>
                <p className="text-2xl font-bold text-gray-900">
                  {enrolledStudents.filter(s => s.status === 'COMPLETED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lecții Obligatorii</p>
                <p className="text-2xl font-bold text-gray-900">{classData.required_lessons}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Preț</p>
                <p className="text-2xl font-bold text-gray-900">{classData.price} MDL</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Details & Instructor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Detalii Clasă</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Descriere</h4>
                  <p className="text-gray-600 mt-1">{classData.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Tip Curs</h4>
                    <p className="text-gray-600 mt-1">
                      {classData.type === 'THEORY' && 'Doar Teorie'}
                      {classData.type === 'PRACTICE' && 'Doar Practică'}
                      {classData.type === 'BOTH' && 'Teorie + Practică'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Categoria Vehicul</h4>
                    <p className="text-gray-600 mt-1">Categoria {classData.category}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Instructor Principal</CardTitle>
            </CardHeader>
            <CardContent>
              {instructor ? (
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {instructor.first_name[0]}{instructor.last_name[0]}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">
                        {instructor.first_name} {instructor.last_name}
                      </p>
                      <p className="text-sm text-gray-600">{instructor.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Telefon:</span>
                      <span className="ml-2 text-gray-900">{instructor.phone_number}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Categorii:</span>
                      <span className="ml-2 text-gray-900">{instructor.license_categories}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Experiență:</span>
                      <span className="ml-2 text-gray-900">{instructor.experience_years} ani</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600">Rating:</span>
                      <div className="ml-2 flex items-center">
                        <span className="text-gray-900">{instructor.rating}</span>
                        <div className="ml-1 flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(instructor.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Nu este asignat un instructor</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enrolled Students */}
      <Card>
        <CardHeader>
          <CardTitle>Studenți Înscriși ({enrolledStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Înscrierii
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progres Teorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progres Practică
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enrolledStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs text-blue-600 font-medium">
                            {student.first_name[0]}{student.last_name[0]}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {student.first_name} {student.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(student.enrollment_date).toLocaleDateString('ro-RO')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(student.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(student.progress.theory_lessons_completed / student.progress.theory_lessons_total) * 100}%`
                            }}
                          ></div>
                        </div>
                        <span className={`ml-2 text-sm ${getProgressColor(student.progress.theory_lessons_completed, student.progress.theory_lessons_total)}`}>
                          {student.progress.theory_lessons_completed}/{student.progress.theory_lessons_total}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${(student.progress.practice_lessons_completed / student.progress.practice_lessons_total) * 100}%`
                            }}
                          ></div>
                        </div>
                        <span className={`ml-2 text-sm ${getProgressColor(student.progress.practice_lessons_completed, student.progress.practice_lessons_total)}`}>
                          {student.progress.practice_lessons_completed}/{student.progress.practice_lessons_total}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => navigate(`/students/${student.id}`)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Vezi Detalii
                      </button>
                      <button
                        onClick={() => navigate(`/enrollments?filter=${JSON.stringify({student_id: student.id, course_id: classData.id})}`)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Editează
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Class Calendar */}
      <ClassCalendar classId={classData.id} />

      {/* Enrollment Modal */}
      <EnrollmentModal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        classData={classData}
        onEnrollmentSuccess={handleEnrollmentSuccess}
      />
    </div>
  );
};

export default ClassDetails;
