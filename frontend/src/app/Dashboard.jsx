import * as React from 'react';
import { Card, CardContent, Typography, Grid, Box, LinearProgress, Avatar, Chip } from '@mui/material';
import { useTranslate } from 'react-admin';
import { 
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  Today as TodayIcon,
  CheckCircle as CheckCircleIcon,
  Group as GroupIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { API_PREFIX } from '../api/httpClient';

const fallbackStats = {
  todayScheduled: 2,
  thisWeekCompleted: 5,
  attendanceRate: 92,
  topInstructors: [
    { name: 'Ion Vasilescu', total: 4, completed: 3, completionRate: 75 },
    { name: 'Maria Popescu', total: 3, completed: 2, completionRate: 67 },
    { name: 'Ana Ionescu', total: 3, completed: 2, completionRate: 67 },
  ],
  weeklyTrend: [
    { week: 'W1', lessons: 18 },
    { week: 'W2', lessons: 22 },
    { week: 'W3', lessons: 15 },
    { week: 'W4', lessons: 25 },
  ],
};

async function fetchLessonStatistics() {
  try {
    const resp = await fetch(`${API_PREFIX}/utils/lesson-stats/`);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const json = await resp.json();

    if (json && typeof json === 'object' && 'todayScheduled' in json) return json;
    return fallbackStats;
  } catch (_) {
    return fallbackStats;
  }
}

const SimpleBarChart = ({ data, height = 100 }) => {
  const maxValue = Math.max(...data.map(d => d.lessons));
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'end', gap: 1, height, p: 1 }}>
      {data.map((item, index) => (
        <Box key={index} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box
            sx={{
              width: '100%',
              backgroundColor: '#3f51b5',
              borderRadius: '4px 4px 0 0',
              height: `${(item.lessons / maxValue) * 80}%`,
              minHeight: '4px',
              mb: 1
            }}
          />
          <Typography variant="caption" sx={{ fontSize: '10px' }}>
            {item.week}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '9px', color: '#666' }}>
            {item.lessons}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

const LessonStatsWidget = () => {
  const t = useTranslate();
  const [stats, setStats] = React.useState(fallbackStats);
  React.useEffect(() => {
    let mounted = true;
    fetchLessonStatistics().then((data) => { if (mounted) setStats(data); });
    return () => { mounted = false; };
  }, []);
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SchoolIcon sx={{ mr: 1, color: '#3f51b5' }} />
          <Typography variant="h6" component="h2">
            {t('dashboard.lesson_stats.title', 'Lesson statistics')}
          </Typography>
        </Box>
        
        {/* Key Metrics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#e3f2fd', borderRadius: 1 }}>
              <TodayIcon sx={{ color: '#1976d2', mb: 0.5 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                {stats.todayScheduled}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {t('dashboard.lesson_stats.today_created', 'Registered today')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#e8f5e9', borderRadius: 1 }}>
              <CheckCircleIcon sx={{ color: '#388e3c', mb: 0.5 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#388e3c' }}>
                {stats.thisWeekCompleted}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {t('dashboard.lesson_stats.completed_this_week', 'Completed this week')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        {/* Attendance Rate */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" fontWeight="medium">
              {t('dashboard.lesson_stats.attendance_rate', 'Attendance rate')}
            </Typography>
            <Typography variant="body2" fontWeight="bold" color="#4caf50">
              {stats.attendanceRate}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={stats.attendanceRate} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: stats.attendanceRate >= 80 ? '#4caf50' : 
                                 stats.attendanceRate >= 60 ? '#ff9800' : '#f44336'
              }
            }}
          />
        </Box>
        
        {/* Top Instructors */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight="medium" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
            <GroupIcon sx={{ mr: 0.5, fontSize: 18 }} />
            {t('dashboard.lesson_stats.top_instructors', 'Top instructors')}
          </Typography>
          {stats.topInstructors.map((instructor, index) => (
            <Box key={instructor.name} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: '#3f51b5', fontSize: '12px' }}>
                {instructor.name.split(' ').map(n => n[0]).join('')}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" sx={{ fontWeight: 'medium', display: 'block' }}>
                  {instructor.name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {instructor.total} lecții
                </Typography>
              </Box>
              <Chip 
                label={`${instructor.completionRate}%`}
                size="small"
                color={instructor.completionRate >= 90 ? 'success' : 'default'}
                sx={{ fontSize: '10px', height: '20px' }}
              />
            </Box>
          ))}
        </Box>
        
        {/* Weekly Trend Chart */}
        <Box>
          <Typography variant="body2" fontWeight="medium" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
            <BarChartIcon sx={{ mr: 0.5, fontSize: 18 }} />
            {t('dashboard.lesson_stats.weekly_trend', 'Weekly trend')}
          </Typography>
          <SimpleBarChart data={stats.weeklyTrend} height={80} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default function Dashboard() {
  const t = useTranslate();
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await fetch(`${API_PREFIX}/utils/summary/`);
        if (!resp.ok) throw new Error('Failed to load');
        const json = await resp.json();
        if (mounted) setData(json);
      } catch (e) {
        if (mounted) setError(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('ra.page.dashboard', 'Dashboard')}
      </Typography>
      
      {loading && <Typography variant="body2">{t('common.loading', 'Loading…')}</Typography>}
      {error && <Typography color="error">{t('common.error_loading', 'Error loading data')}: {String(error.message || error)}</Typography>}
      
      {data && (
        <>
        <Grid container spacing={3}>
          {/* Existing Stats */}
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Stat label={t('resources.students.name', 'Students')} value={data.students} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Stat label={t('resources.instructors.name', 'Instructors')} value={data.instructors} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Stat label={t('resources.resources.name', 'Resources')} value={data.resources} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Stat label={t('resources.courses.name', 'Courses')} value={data.courses} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Stat label={t('dashboard.top_stats.active_enrollments', 'Active enrollments')} value={data.enrollments_active} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Stat label={t('dashboard.top_stats.payments_total', 'Payments total')} value={data.payments_total} />
          </Grid>
          
          {/* Lesson Statistics Widget removed as requested */}
        </Grid>
        </>
      )}
    </Box>
  );
}

function Stat({ label, value }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {label}
        </Typography>
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}
