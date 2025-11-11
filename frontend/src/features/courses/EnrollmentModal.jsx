import * as React from 'react';
import { useState, useEffect } from 'react';

const EnrollmentModal = ({ isOpen, onClose, classData, onEnrollmentSuccess }) => {
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [enrollmentType, setEnrollmentType] = useState('THEORY');

  useEffect(() => {
    if (isOpen) {
      const fetchAvailableStudents = async () => {
        setLoading(true);

        setStudents([]); 
        setLoading(false);
      };

      fetchAvailableStudents();
    }
  }, [isOpen]);

  const filteredStudents = students.filter(student =>
    `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStudentToggle = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleEnroll = async () => {
    if (selectedStudents.length === 0) {
      alert('Vă rugăm să selectați cel puțin un student.');
      return;
    }

    setLoading(true);
    try {
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    
      const enrolledStudentsData = students
        .filter(student => selectedStudents.includes(student.id))
        .map(student => ({
          ...student,
          enrollment_date: new Date().toISOString().split('T')[0],
          status: 'IN_PROGRESS',
          progress: {
            theory_lessons_completed: 0,
            theory_lessons_total: 10,
            practice_lessons_completed: 0,
            practice_lessons_total: 20
          }
        }));


      if (onEnrollmentSuccess) {
        onEnrollmentSuccess(enrolledStudentsData);
      }

      setSelectedStudents([]);
      setSearchTerm('');
      
      alert(`${selectedStudents.length} student(i) au fost înscriși cu succes!`);
      onClose();
    } catch (error) {
      console.error('Error enrolling students:', error);
      alert('A apărut o eroare la înscrierea studenților.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Înscrie Studenți la {classData?.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Enrollment Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tip Înscriere
            </label>
            <select
              value={enrollmentType}
              onChange={(e) => setEnrollmentType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="THEORY">Doar Teorie</option>
              <option value="PRACTICE">Doar Practică</option>
              <option value="BOTH">Teorie + Practică</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Caută Studenți
            </label>
            <input
              type="text"
              placeholder="Caută după nume sau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Students List */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selectează Studenți ({selectedStudents.length} selectați)
            </label>
            
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-3 p-3 bg-gray-50 rounded">
                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                    <div className="flex-1 space-y-1">
                      <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-md">
                {filteredStudents.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {searchTerm ? 'Niciun student găsit pentru termenul de căutare.' : 'Nu sunt studenți disponibili pentru înscriere.'}
                  </div>
                ) : (
                  filteredStudents.map(student => (
                    <label
                      key={student.id}
                      className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleStudentToggle(student.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs text-blue-600 font-medium">
                          {student.first_name[0]}{student.last_name[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          {student.first_name} {student.last_name}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {student.email}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {student.phone_number}
                      </div>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Selected Students Summary */}
          {selectedStudents.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Studenți Selectați ({selectedStudents.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedStudents.map(studentId => {
                  const student = students.find(s => s.id === studentId);
                  return (
                    <span
                      key={studentId}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {student?.first_name} {student?.last_name}
                      <button
                        onClick={() => handleStudentToggle(studentId)}
                        className="ml-1 inline-flex items-center justify-center w-4 h-4 text-blue-400 hover:text-blue-600"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            disabled={loading}
          >
            Anulează
          </button>
          <button
            onClick={handleEnroll}
            disabled={selectedStudents.length === 0 || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Se înscriu...
              </>
            ) : (
              `Înscrie ${selectedStudents.length} Student${selectedStudents.length !== 1 ? 'i' : ''}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentModal;
