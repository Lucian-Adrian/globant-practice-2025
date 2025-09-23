import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t, i18n } = useTranslation('common');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem('student_access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('/api/student/dashboard/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 401) {
          localStorage.removeItem('student_access_token');
          localStorage.removeItem('student_refresh_token');
          navigate('/login');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const dashboardData = await response.json();
        setData(dashboardData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('student_access_token');
    localStorage.removeItem('student_refresh_token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>{t('common:loading', 'Loading...')}</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
        <h2>{t('common:error', 'Error')}</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/login')}>{t('common:backToLogin', 'Back to Login')}</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>{t('common:studentDashboard', 'Student Dashboard')}</h1>
        <div style={{ position: 'absolute', top: 20, right: 20 }}>
          <select value={i18n.language} onChange={e => i18n.changeLanguage(e.target.value)}>
            <option value="en">English</option>
            <option value="ro">Română</option>
            <option value="ru">Русский</option>
          </select>
          <button
            onClick={handleLogout}
            style={{ marginLeft: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            {t('common:logout', 'Logout')}
          </button>
        </div>
      </div>

      {data && (
        <div style={{ display: 'grid', gap: '2rem' }}>
          {/* Student Info */}
          <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem' }}>
            <h2>{t('common:yourInfo', 'Your Information')}</h2>
            <p><strong>{t('common:name', 'Name')}:</strong> {data.student.first_name} {data.student.last_name}</p>
            <p><strong>{t('common:email', 'Email')}:</strong> {data.student.email}</p>
            <p><strong>{t('common:phone', 'Phone')}:</strong> {data.student.phone_number}</p>
            <p><strong>{t('common:status', 'Status')}:</strong> {data.student.status}</p>
          </div>

          {/* Instructors */}
          {data.instructors && data.instructors.length > 0 && (
            <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem' }}>
              <h2>{t('common:yourInstructors', 'Your Instructors')}</h2>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {data.instructors.map(instructor => (
                  <div key={instructor.id} style={{ border: '1px solid #eee', borderRadius: '4px', padding: '0.5rem' }}>
                    <p><strong>{instructor.first_name} {instructor.last_name}</strong></p>
                    <p>{t('common:email', 'Email')}: {instructor.email}</p>
                    <p>{t('common:phone', 'Phone')}: {instructor.phone_number}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Courses */}
          {data.courses && data.courses.length > 0 && (
            <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem' }}>
              <h2>{t('common:yourCourses', 'Your Courses')}</h2>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {data.courses.map(course => (
                  <div key={course.id} style={{ border: '1px solid #eee', borderRadius: '4px', padding: '0.5rem' }}>
                    <p><strong>{course.name}</strong></p>
                    <p>{t('common:category', 'Category')}: {course.category}</p>
                    <p>{t('common:type', 'Type')}: {course.course_type}</p>
                    <p>{t('common:price', 'Price')}: ${course.price}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No data message */}
          {(!data.instructors || data.instructors.length === 0) &&
           (!data.courses || data.courses.length === 0) && (
            <div style={{ textAlign: 'center', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px' }}>
              <p>{t('common:noDataYet', 'No courses or instructors assigned yet. Please check back later.')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
