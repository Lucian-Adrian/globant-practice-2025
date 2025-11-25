import * as React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslate, useDataProvider, Button } from 'react-admin';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HelpIcon from '@mui/icons-material/Help';
import CircularProgress from '@mui/material/CircularProgress';
import { Box, Typography } from '@mui/material';

const DAY_ENUM = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const BUSINESS_TZ = 'Europe/Chisinau';

function formatInBusinessTZParts(date) {
    try {
        const fmt = new Intl.DateTimeFormat('en-GB', {
            timeZone: BUSINESS_TZ,
            weekday: 'short',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
        const parts = fmt.formatToParts(date);
        const byType = Object.fromEntries(parts.map((p) => [p.type, p.value]));
        const weekdayShort = (byType.weekday || '').slice(0, 3).toLowerCase();
        const map = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6 };
        const dayIndex = map[weekdayShort] ?? 0;
        const hh = String(byType.hour || '00').padStart(2, '0');
        const mm = String(byType.minute || '00').padStart(2, '0');
        return { dayIndex, hhmm: `${hh}:${mm}` };
    } catch {
        const d = new Date(date);
        const dayIndex = (d.getDay() + 6) % 7;
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return { dayIndex, hhmm: `${hh}:${mm}` };
    }
}

function minutesOf(hhmm) {
    const [h, m] = String(hhmm).split(':').map((x) => parseInt(x, 10));
    return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
}

export default function AvailabilityChecker() {
    const t = useTranslate();
    const dataProvider = useDataProvider();
    const { getValues } = useFormContext();
    
    // Watch fields to reset status when they change
    const instructorId = useWatch({ name: 'instructor_id' });
    const scheduledTime = useWatch({ name: 'scheduled_time' });

    const [status, setStatus] = React.useState('idle'); // idle, loading, available, unavailable, error
    const [message, setMessage] = React.useState('');

    // Reset status when inputs change
    React.useEffect(() => {
        setStatus('idle');
        setMessage('');
    }, [instructorId, scheduledTime]);

    const checkAvailability = async () => {
        const values = getValues();
        const iId = values.instructor_id;
        const sTime = values.scheduled_time;

        if (!iId || !sTime) {
            setStatus('error');
            setMessage(t('validation.requiredField'));
            return;
        }

        setStatus('loading');
        try {
            const start = new Date(sTime);
            const { dayIndex, hhmm } = formatInBusinessTZParts(start);
            const day = DAY_ENUM[dayIndex];

            const { data: availData } = await dataProvider.getList('instructor-availabilities', {
                filter: { instructor_id: iId, day: day },
                pagination: { page: 1, perPage: 50 },
                sort: { field: 'id', order: 'ASC' },
            });

            const slots = new Set();
            if (Array.isArray(availData)) {
                for (const a of availData) {
                    const hours = Array.isArray(a?.hours) ? a.hours : [];
                    hours.forEach((h) => {
                        if (typeof h === 'string') {
                            const [H, M] = h.split(':');
                            const HH = String(H || '00').padStart(2, '0');
                            const MM = String(M || '00').padStart(2, '0');
                            slots.add(`${HH}:${MM}`);
                        }
                    });
                }
            }

            if (slots.size === 0) {
                setStatus('unavailable');
                setMessage(t('validation.instructorNotWorking'));
                return;
            }

            const startMin = minutesOf(hhmm);
            const sorted = Array.from(slots).sort();
            const mins = sorted.map(minutesOf);
            let ok = false;
            if (startMin === mins[mins.length - 1]) ok = true;
            else {
                for (let i = 0; i < mins.length - 1; i++) {
                    if (mins[i] <= startMin && startMin < mins[i + 1]) {
                        ok = true;
                        break;
                    }
                }
            }

            if (ok) {
                // Check for conflicts
                const duration = Number(values.duration_minutes ?? 60);
                const end = new Date(start.getTime() + duration * 60000);
                const windowStart = new Date(start.getTime() - 8 * 60 * 60000); // 8 hours back

                // Helper to check overlap
                const overlap = (startA, endA, startB, endB) => startA < endB && startB < endA;

                // Check lessons
                const { data: lessons } = await dataProvider.getList('lessons', {
                    filter: { 
                        instructor: iId, 
                        scheduled_time__lt: end.toISOString(),
                        scheduled_time__gte: windowStart.toISOString()
                    },
                    pagination: { page: 1, perPage: 100 },
                });

                const hasLessonConflict = lessons.some(item => {
                    const st = new Date(item.scheduled_time);
                    const en = new Date(st.getTime() + Number(item.duration_minutes ?? 60) * 60000);
                    const active = item.status === 'SCHEDULED' || item.status === 'COMPLETED';
                    return active && overlap(start, end, st, en);
                });

                if (hasLessonConflict) {
                    setStatus('unavailable');
                    setMessage(t('validation.instructorConflict'));
                    return;
                }

                // Check scheduled classes
                const { data: classes } = await dataProvider.getList('scheduled-classes', {
                    filter: { 
                        instructor: iId, 
                        scheduled_time__lt: end.toISOString(),
                        scheduled_time__gte: windowStart.toISOString()
                    },
                    pagination: { page: 1, perPage: 100 },
                });

                const hasClassConflict = classes.some(item => {
                    if (values.id && item.id === values.id) return false; // Exclude self if editing
                    const st = new Date(item.scheduled_time);
                    const en = new Date(st.getTime() + Number(item.duration_minutes ?? 60) * 60000);
                    const active = item.status === 'SCHEDULED' || item.status === 'COMPLETED';
                    return active && overlap(start, end, st, en);
                });

                if (hasClassConflict) {
                    setStatus('unavailable');
                    setMessage(t('validation.instructorConflict'));
                    return;
                }

                setStatus('available');
                setMessage(t('validation.available'));
            } else {
                setStatus('unavailable');
                setMessage(t('validation.outsideAvailability'));
            }

        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage(t('ra.notification.http_error'));
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2, mb: 2 }}>
            <Button
                label={t('validation.checkAvailability')}
                onClick={checkAvailability}
                disabled={!instructorId || !scheduledTime || status === 'loading'}
                variant="outlined"
            >
                <HelpIcon sx={{ mr: 1 }} />
            </Button>
            
            {status === 'loading' && <CircularProgress size={24} />}
            
            {status === 'available' && (
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                    <CheckCircleIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">{message}</Typography>
                </Box>
            )}
            
            {status === 'unavailable' && (
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
                    <ErrorIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">{message}</Typography>
                </Box>
            )}

             {status === 'error' && (
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
                    <ErrorIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">{message}</Typography>
                </Box>
            )}
        </Box>
    );
}
