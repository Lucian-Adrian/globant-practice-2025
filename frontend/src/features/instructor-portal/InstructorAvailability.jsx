import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { instructorHttpJson } from '../../api/httpClient';
import { useI18nForceUpdate } from '../../i18n/index.jsx';
import InstructorNavBar from './InstructorNavBar';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const SLOTS = [];
for (let h = 8; h <= 22; ++h) {
    SLOTS.push(`${String(h).padStart(2, '0')}:00`);
}

const TimeGrid = ({ availMap, t }) => {
    return (
        <div className="tw-overflow-x-auto tw-bg-card tw-rounded-xl tw-border tw-border-border tw-shadow-sm">
            <table className="tw-w-full tw-border-collapse">
                <thead>
                    <tr>
                        <th className="tw-p-3 tw-border-b tw-border-border tw-text-left tw-font-medium tw-text-muted-foreground tw-min-w-[80px]">
                            {t('common.time', { defaultValue: 'Time' })}
                        </th>
                        {DAYS.map(d => (
                            <th key={d} className="tw-p-3 tw-border-b tw-border-border tw-text-center tw-font-medium tw-text-muted-foreground tw-min-w-[100px]">
                                {t(`days.${d}`, { defaultValue: d })}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {SLOTS.map(slot => (
                        <tr key={slot} className="hover:tw-bg-secondary/20">
                            <td className="tw-p-2 tw-border-b tw-border-border tw-text-sm tw-font-medium tw-text-muted-foreground">
                                {slot}
                            </td>
                            {DAYS.map(day => {
                                const key = `${day}|${slot}`;
                                const active = availMap[key];
                                return (
                                    <td key={key} className="tw-p-2 tw-border-b tw-border-border tw-text-center">
                                        <div 
                                            className={`tw-w-full tw-h-8 tw-rounded-md tw-transition-colors ${
                                                active 
                                                    ? 'tw-bg-green-500/20 tw-border tw-border-green-500/50' 
                                                    : 'tw-bg-secondary/30'
                                            }`}
                                            title={active ? t('filters.available') : t('filters.unavailable')}
                                        >
                                            {active && (
                                                <span className="tw-sr-only">{t('filters.available')}</span>
                                            )}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const InstructorAvailability = () => {
    useI18nForceUpdate();
    const { t } = useTranslation(['portal', 'common']);
    const navigate = useNavigate();
    const [availMap, setAvailMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                const profile = JSON.parse(localStorage.getItem('instructor_profile') || '{}');
                if (!profile.id) {
                    navigate('/auth/instructor/login');
                    return;
                }

                // Use 'instructor_id' to match backend filter
                const response = await instructorHttpJson(`/api/instructor-availabilities?instructor_id=${profile.id}&page_size=100`);
                const data = response.json;
                const results = Array.isArray(data) ? data : (data.results || []);
                
                const map = {};
                results.forEach(av => {
                    const day = av.day;
                    (av.hours || []).forEach(hour => {
                        // Ensure hour format matches SLOTS (HH:MM)
                        // Backend might return "8:00", we need "08:00"
                        let h = hour;
                        if (h.length === 4 && h[1] === ':') {
                            h = '0' + h;
                        }
                        map[`${day}|${h}`] = true;
                    });
                });
                setAvailMap(map);
            } catch (error) {
                console.error("Failed to fetch availability", error);
                setError(error.message || "Failed to fetch availability");
            } finally {
                setLoading(false);
            }
        };

        fetchAvailability();
    }, [navigate]);

    return (
        <div className="tw-min-h-screen tw-bg-background tw-text-foreground">
            <InstructorNavBar />
            <main className="tw-pt-24 tw-px-6 tw-max-w-7xl tw-mx-auto tw-pb-12">
                <h1 className="tw-text-3xl tw-font-bold tw-mb-8">{t('instructorPortal.availability.title')}</h1>
                
                {loading ? (
                    <p>{t('commonUI.loading')}</p>
                ) : error ? (
                    <div className="tw-p-6 tw-bg-red-50 tw-text-red-700 tw-rounded-xl tw-border tw-border-red-200">
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="tw-space-y-6">
                        <p className="tw-text-muted-foreground">
                            {t('instructorPortal.availability.description', { defaultValue: 'View your weekly availability schedule below. Green slots indicate when you are available for lessons.' })}
                        </p>
                        <TimeGrid availMap={availMap} t={t} />
                    </div>
                )}
            </main>
        </div>
    );
};

export default InstructorAvailability;
