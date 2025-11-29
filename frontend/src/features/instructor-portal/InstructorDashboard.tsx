import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import InstructorNavBar from './InstructorNavBar';
import { instructorHttpJson, clearInstructorTokens } from '../../api/httpClient';

const InstructorDashboard = () => {
    const navigate = useNavigate();
    const { t } = useTranslation(['portal']);
    const [upcomingLessons, setUpcomingLessons] = useState([]);
    const [loadingLessons, setLoadingLessons] = useState(true);
    const [instructor, setInstructor] = useState<any>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem('instructor_access_token');
            if (!token) {
                navigate('/instructors/login');
                return;
            }

            try {
                // First verify auth and get profile
                const { json } = await instructorHttpJson('/api/auth/instructor/me/');
                setInstructor(json);
                localStorage.setItem('instructor_profile', JSON.stringify(json));

                // Fetch upcoming lessons
                try {
                    const lessons = await instructorHttpJson(`/api/lessons?instructor_id=${json.id}&status=SCHEDULED`);
                    // Handle paginated response (DRF returns { results: [...] } by default)
                    const results = Array.isArray(lessons.json) ? lessons.json : (lessons.json.results || []);
                    setUpcomingLessons(results.slice(0, 3));
                } catch (lessonError) {
                    console.warn("Failed to fetch lessons, but auth is valid", lessonError);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
                // Only redirect if it's an auth error (401/403)
                if (error.status === 401 || error.status === 403) {
                    clearInstructorTokens();
                    navigate('/instructors/login');
                }
            } finally {
                setLoadingLessons(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    if (loadingLessons) {
        return <div className="tw-flex tw-items-center tw-justify-center tw-h-screen">Loading...</div>;
    }

    return (
        <div className="tw-min-h-screen tw-bg-background tw-text-foreground">
            <InstructorNavBar />
            <main className="tw-pt-24 tw-px-6 tw-max-w-7xl tw-mx-auto tw-pb-12">
                <h1 className="tw-text-3xl tw-font-bold tw-mb-8">Welcome, {instructor?.first_name}</h1>
                
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
                    {/* Upcoming Lessons Widget */}
                    <div className="tw-p-6 tw-bg-card tw-rounded-xl tw-border tw-border-border tw-shadow-sm">
                        <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                            <h2 className="tw-text-xl tw-font-semibold">Upcoming Lessons</h2>
                            <a href="/instructors/lessons" className="tw-text-sm tw-text-primary hover:tw-underline">View All</a>
                        </div>
                        
                        {upcomingLessons.length === 0 ? (
                            <p className="tw-text-muted-foreground">No upcoming lessons scheduled.</p>
                        ) : (
                            <div className="tw-space-y-4">
                                {upcomingLessons.map((lesson: any) => (
                                    <div key={lesson.id} className="tw-flex tw-justify-between tw-items-center tw-p-3 tw-bg-secondary/50 tw-rounded-lg">
                                        <div>
                                            <p className="tw-font-medium">{lesson.enrollment?.student?.first_name} {lesson.enrollment?.student?.last_name}</p>
                                            <p className="tw-text-xs tw-text-muted-foreground">{new Date(lesson.scheduled_time).toLocaleString()}</p>
                                        </div>
                                        <span className="tw-text-xs tw-px-2 tw-py-1 tw-bg-blue-100 tw-text-blue-800 tw-rounded-full">
                                            {lesson.duration_minutes} min
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Availability Widget */}
                    <div className="tw-p-6 tw-bg-card tw-rounded-xl tw-border tw-border-border tw-shadow-sm">
                        <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                            <h2 className="tw-text-xl tw-font-semibold">Availability</h2>
                            <a href="/instructors/availability" className="tw-text-sm tw-text-primary hover:tw-underline">Manage</a>
                        </div>
                        <p className="tw-text-muted-foreground">Manage your working hours.</p>
                        <div className="tw-mt-4">
                             <a href="/instructors/availability" className="tw-w-full tw-block tw-text-center tw-py-2 tw-bg-primary tw-text-primary-foreground tw-rounded-lg hover:tw-bg-primary/90 tw-transition-colors">
                                Check Schedule
                             </a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default InstructorDashboard;
