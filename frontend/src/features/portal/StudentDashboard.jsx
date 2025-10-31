import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t, i18n } = useTranslation('portal');
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
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
  <h1>{t('portal.dashboard.welcome', 'Student Dashboard')}</h1>
        <div style={{ position: 'absolute', top: 20, right: 20 }}>
          <select value={i18n.language} onChange={e => i18n.changeLanguage(e.target.value)}>
            <option value="en">EN</option>
            <option value="ro">RO</option>
            <option value="ru">RU</option>
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
          {/* Lesson Summary Widgets */}
          {data.lesson_summary && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {/* Remaining Lessons */}
              <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', backgroundColor: '#f9f9f9' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#d32f2f' }}>{t('common:remainingLessons', 'Remaining Lessons')}</h3>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {Object.entries(data.lesson_summary.remaining.theory).map(([category, count]) => (
                    <div key={`remaining-theory-${category}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{t('common:theory', 'Theory')} {category}:</span>
                      <strong>{count}</strong>
                    </div>
                  ))}
                  {Object.entries(data.lesson_summary.remaining.practice).map(([category, count]) => (
                    <div key={`remaining-practice-${category}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{t('common:practice', 'Practice')} {category}:</span>
                      <strong>{count}</strong>
                    </div>
                  ))}
                  {Object.keys(data.lesson_summary.remaining.theory).length === 0 && Object.keys(data.lesson_summary.remaining.practice).length === 0 && (
                    <div style={{ textAlign: 'center', color: '#666' }}>{t('common:noRemainingLessons', 'No remaining lessons')}</div>
                  )}
                </div>
              </div>

              {/* Completed Lessons */}
              <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', backgroundColor: '#f0f8f0' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#2e7d32' }}>{t('common:completedLessons', 'Completed Lessons')}</h3>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {Object.entries(data.lesson_summary.completed.theory).map(([category, count]) => (
                    <div key={`completed-theory-${category}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{t('common:theory', 'Theory')} {category}:</span>
                      <strong>{count}</strong>
                    </div>
                  ))}
                  {Object.entries(data.lesson_summary.completed.practice).map(([category, count]) => (
                    <div key={`completed-practice-${category}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{t('common:practice', 'Practice')} {category}:</span>
                      <strong>{count}</strong>
                    </div>
                  ))}
                  {Object.keys(data.lesson_summary.completed.theory).length === 0 && Object.keys(data.lesson_summary.completed.practice).length === 0 && (
                    <div style={{ textAlign: 'center', color: '#666' }}>{t('common:noCompletedLessons', 'No completed lessons')}</div>
                  )}
                </div>
              </div>
            </div>
          )}

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
                    <p>{t('common:type', 'Type')}: {course.type}</p>
                    <p>{t('common:price', 'Price')}: ${course.price}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lessons */}
          <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem' }}>
            <h2>{t('common:yourLessons', 'Your Lessons')}</h2>
            {data.lessons && data.lessons.length > 0 ? (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {data.lessons.map(lesson => (
                  <div key={lesson.id} style={{ border: '1px solid #eee', borderRadius: '4px', padding: '0.5rem' }}>
                    <p><strong>{lesson.enrollment.course.name}</strong></p>
                    <p>{t('common:date', 'Date')}: {new Date(lesson.scheduled_time).toLocaleDateString()}</p>
                    <p>{t('common:time', 'Time')}: {new Date(lesson.scheduled_time).toLocaleTimeString()}</p>
                    <p>{t('common:duration', 'Duration')}: {lesson.duration_minutes} minutes</p>
                    <p>{t('common:instructor', 'Instructor')}: {lesson.instructor.first_name} {lesson.instructor.last_name}</p>
                    <p>{t('common:resource', 'Resource')}: {lesson.resource?.license_plate || lesson.resource?.name || 'N/A'}</p>
                    <p>{t('common:status', 'Status')}: {lesson.status}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>{t('common:noLessonsYet', 'No lessons scheduled yet.')}</p>
            )}
          </div>

          {/* Payments */}
          <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem' }}>
            <h2>{t('common:yourPayments', 'Your Payments')}</h2>
            {data.payments && data.payments.length > 0 ? (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {data.payments.map(payment => (
                  <div key={payment.id} style={{ border: '1px solid #eee', borderRadius: '4px', padding: '0.5rem' }}>
                    <p><strong>{payment.enrollment.course.name}</strong></p>
                    <p>{t('common:amount', 'Amount')}: ${payment.amount}</p>
                    <p>{t('common:date', 'Date')}: {new Date(payment.payment_date).toLocaleDateString()}</p>
                    <p>{t('common:method', 'Method')}: {payment.payment_method}</p>
                    <p>{t('common:description', 'Description')}: {payment.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>{t('common:noPaymentsYet', 'No payments recorded yet.')}</p>
            )}
          </div>

          {/* No data message */}
          {(!data.instructors || data.instructors.length === 0) &&
           (!data.courses || data.courses.length === 0) &&
           (!data.lessons || data.lessons.length === 0) &&
           (!data.payments || data.payments.length === 0) && (
            <div style={{ textAlign: 'center', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px' }}>
              <p>{t('common:noDataYet', 'No courses, instructors, lessons, or payments assigned yet. Please check back later.')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
