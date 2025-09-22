import * as React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

export default function Dashboard() {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await fetch('/api/utils/summary/');
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
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Admin Dashboard
        </Typography>
        {loading && <Typography variant="body2">Loading…</Typography>}
        {error && <Typography color="error">{String(error.message || error)}</Typography>}
        {data && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
            <Stat label="Students" value={data.students} />
            <Stat label="Instructors" value={data.instructors} />
            <Stat label="Vehicles" value={data.vehicles} />
            <Stat label="Courses" value={data.courses} />
            <Stat label="Active enrollments" value={data.enrollments_active} />
            <Stat label="Scheduled lessons" value={data.lessons_scheduled} />
            <Stat label="Payments total" value={data.payments_total} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
      <div style={{ color: '#6b7280', fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 600 }}>{value}</div>
    </div>
  );
}
