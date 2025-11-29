import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { instructorHttpJson } from '../../api/httpClient';
import { useAppLocaleState, useI18nForceUpdate } from '../../i18n/index.jsx';
import InstructorNavBar from './InstructorNavBar';

// Icons
const iconProps = "tw-w-4 tw-h-4";
const CalendarIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconProps} {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const ClockIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconProps} {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const UserIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconProps} {...props}>
    <path d="M20 21a8 8 0 1 0-16 0" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const CarIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconProps} {...props}>
    <path d="M3 13l2-5a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 5" />
    <path d="M5 16h14" />
    <circle cx="7" cy="16" r="2" />
    <circle cx="17" cy="16" r="2" />
  </svg>
);

const InstructorLessons = () => {
    useI18nForceUpdate();
    const { t } = useTranslation(['portal', 'common']);
    const [locale] = useAppLocaleState();
    const navigate = useNavigate();
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                const profile = JSON.parse(localStorage.getItem('instructor_profile') || '{}');
                if (!profile.id) {
                    navigate('/auth/instructor/login');
                    return;
                }

                // Fetch all lessons (up to 100) and use 'instructor_id' param
                const response = await instructorHttpJson(`/api/lessons?instructor_id=${profile.id}&page_size=100`);
                const data = response.json;
                const results = Array.isArray(data) ? data : (data.results || []);
                setLessons(results);
            } catch (error) {
                console.error("Failed to fetch lessons", error);
                setError(error.message || "Failed to fetch lessons");
            } finally {
                setLoading(false);
            }
        };

        fetchLessons();
    }, [navigate]);

    const [filter, setFilter] = useState('all'); // 'all', 'scheduled', 'history'

    const filteredLessons = lessons.filter(l => {
        const isUpcoming = new Date(l.scheduled_time) >= new Date();
        if (filter === 'scheduled') return isUpcoming;
        if (filter === 'history') return !isUpcoming;
        return true;
    });

    // Sort: Upcoming ascending, History descending
    const sortedLessons = [...filteredLessons].sort((a, b) => {
        const dateA = new Date(a.scheduled_time);
        const dateB = new Date(b.scheduled_time);
        if (filter === 'history') {
            return dateB - dateA;
        }
        return dateA - dateB;
    });

    return (
        <div className="tw-min-h-screen tw-bg-background tw-text-foreground">
            <InstructorNavBar />
            <main className="tw-pt-24 tw-px-6 tw-max-w-7xl tw-mx-auto tw-pb-12">
                <div className="tw-flex tw-flex-col md:tw-flex-row md:tw-items-center tw-justify-between tw-mb-8 tw-gap-4">
                    <h1 className="tw-text-3xl tw-font-bold">{t('instructorPortal.lessons.title')}</h1>
                    
                    <div className="tw-flex tw-bg-secondary/50 tw-p-1 tw-rounded-lg">
                        {[
                            { id: 'all', label: t('commonUI.viewAll', { defaultValue: 'All' }) },
                            { id: 'scheduled', label: t('filters.scheduled') },
                            { id: 'history', label: t('common.history', { defaultValue: 'History' }) },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setFilter(tab.id)}
                                className={`tw-px-4 tw-py-2 tw-rounded-md tw-text-sm tw-font-medium tw-transition-all ${
                                    filter === tab.id 
                                        ? 'tw-bg-background tw-text-foreground tw-shadow-sm' 
                                        : 'tw-text-muted-foreground hover:tw-text-foreground'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                
                {loading ? (
                    <p>{t('commonUI.loading')}</p>
                ) : error ? (
                    <div className="tw-p-6 tw-bg-red-50 tw-text-red-700 tw-rounded-xl tw-border tw-border-red-200">
                        <p>{error}</p>
                    </div>
                ) : sortedLessons.length === 0 ? (
                    <div className="tw-p-6 tw-bg-card tw-rounded-xl tw-border tw-border-border tw-shadow-sm">
                        <p className="tw-text-muted-foreground">{t('instructorPortal.lessons.noLessons')}</p>
                    </div>
                ) : (
                    <div className="tw-grid tw-gap-4">
                        {sortedLessons.map((lesson) => (
                            <LessonCard key={lesson.id} lesson={lesson} t={t} locale={locale} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

const LessonCard = ({ lesson, t, locale }) => {
    const date = new Date(lesson.scheduled_time);
    const statusColor = {
        'SCHEDULED': 'tw-bg-blue-100 tw-text-blue-700',
        'COMPLETED': 'tw-bg-green-100 tw-text-green-700',
        'CANCELED': 'tw-bg-red-100 tw-text-red-700',
    }[lesson.status] || 'tw-bg-gray-100 tw-text-gray-700';

    return (
        <div className="tw-p-6 tw-bg-card tw-rounded-xl tw-border tw-border-border tw-shadow-sm hover:tw-shadow-md tw-transition-shadow">
            <div className="tw-flex tw-flex-col md:tw-flex-row md:tw-items-center tw-justify-between tw-gap-4">
                <div className="tw-flex tw-items-start tw-gap-4">
                    <div className="tw-w-12 tw-h-12 tw-rounded-full tw-bg-primary/10 tw-flex tw-items-center tw-justify-center tw-shrink-0">
                        <UserIcon className="tw-w-6 tw-h-6 tw-text-primary" />
                    </div>
                    <div>
                        <h3 className="tw-font-semibold tw-text-lg">
                            {lesson.enrollment?.student?.first_name} {lesson.enrollment?.student?.last_name}
                        </h3>
                        <div className="tw-flex tw-flex-wrap tw-gap-x-4 tw-gap-y-2 tw-mt-1 tw-text-sm tw-text-muted-foreground">
                            <div className="tw-flex tw-items-center tw-gap-1">
                                <CalendarIcon className="tw-w-4 tw-h-4" />
                                <span>{date.toLocaleDateString(locale, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            </div>
                            <div className="tw-flex tw-items-center tw-gap-1">
                                <ClockIcon className="tw-w-4 tw-h-4" />
                                <span>{date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })} ({lesson.duration_minutes} min)</span>
                            </div>
                            {lesson.resource && (
                                <div className="tw-flex tw-items-center tw-gap-1">
                                    <CarIcon className="tw-w-4 tw-h-4" />
                                    <span>{lesson.resource.make} {lesson.resource.model} ({lesson.resource.license_plate})</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="tw-flex tw-items-center tw-justify-between md:tw-justify-end tw-gap-4 tw-w-full md:tw-w-auto">
                    <span className={`tw-px-3 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium ${statusColor}`}>
                        {t(`filters.${lesson.status.toLowerCase()}`, { defaultValue: lesson.status })}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default InstructorLessons;