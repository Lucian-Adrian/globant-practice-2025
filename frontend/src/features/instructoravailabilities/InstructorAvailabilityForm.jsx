import React, { useEffect, useState } from 'react';
import { useDataProvider, useNotify, useTranslate } from 'react-admin';

const DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];
// Row-based start times from 08:00 to 22:00 (each cell represents a 1h30m slot starting at the hour)
const generateHourStarts = () => {
  const start = 8;
  const end = 22;
  const arr = [];
  for (let h = start; h <= end; ++h) arr.push(`${String(h).padStart(2,'0')}:00`);
  return arr;
};
const SLOTS = generateHourStarts();

function TimeGrid({ availMap, onToggle, translate }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>Time</th>
            {DAYS.map(d => (
              <th key={d} style={{ border: '1px solid #ddd', padding: 8 }}>{d.slice(0,3)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SLOTS.map(slot => (
            <tr key={slot}>
              <td style={{ border: '1px solid #eee', padding: 6, whiteSpace: 'nowrap' }}>{slot}</td>
        {DAYS.map(day => {
                const key = `${day}|${slot}`;
                const active = !!availMap[key];
                return (
                  <td key={key} style={{ border: '1px solid #eee', padding: 6, textAlign: 'center' }}>
                    <button
                      onClick={() => onToggle(day, slot)}
                      style={{
                        width: 28,
                        height: 28,
                        background: active ? '#10b981' : '#eee',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer'
                      }}
          title={active ? translate('instructorAvailabilities.available', { defaultValue: 'Available - click to remove' }) : translate('instructorAvailabilities.not_available', { defaultValue: 'Not available - click to add' })}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function InstructorAvailabilityForm({ initialInstructorId = null, onSaved = null }) {
  const dp = useDataProvider();
  const notify = useNotify();
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(initialInstructorId || '');
  const [availMap, setAvailMap] = useState({});

  useEffect(() => {
    dp.getList('instructors', { pagination: { page:1, perPage: 200 }, sort: { field: 'id', order: 'ASC' }, filter: {} })
      .then(r => setInstructors(r.data))
      .catch(() => notify('Failed to load instructors', { type: 'error' }));
  }, []);

  useEffect(() => {
    if (!selectedInstructor) return setAvailMap({});
    dp.getList('instructor-availabilities', { pagination: { page:1, perPage: 200 }, sort: { field: 'id', order: 'ASC' }, filter: { instructor_id: selectedInstructor } })
      .then(r => {
        const map = {};
        r.data.forEach(av => {
          const day = av.day;
          (av.hours || []).forEach(hour => map[`${day}|${hour}`] = true);
        });
        setAvailMap(map);
      })
      .catch(() => notify('Failed to load availabilities', { type: 'error' }));
  }, [selectedInstructor]);

  const handleToggle = (day, slot) => {
    const key = `${day}|${slot}`;
    const newMap = { ...availMap };
    if (newMap[key]) delete newMap[key]; else newMap[key] = true;
    setAvailMap(newMap);
  };

  // Batch save: compute per-day desired hours and sync with backend (create/update/delete) in parallel
  const handleSave = async () => {
    if (!selectedInstructor) return notify('Select an instructor first', { type: 'warning' });
    try {
      const existing = await dp.getList('instructor-availabilities', { pagination: { page:1, perPage: 200 }, sort: { field:'id', order:'ASC' }, filter: { instructor_id: selectedInstructor } });
      const existingByDay = {};
      (existing.data || []).forEach(r => { existingByDay[r.day] = r; });

      const desiredByDay = {};
      SLOTS.forEach(s => {
        DAYS.forEach(d => {
          if (availMap[`${d}|${s}`]) {
            if (!desiredByDay[d]) desiredByDay[d] = [];
            desiredByDay[d].push(s);
          }
        });
      });

      // Build operations
      const ops = [];
      // handle creates/updates
      for (const [day, hours] of Object.entries(desiredByDay)) {
        if (existingByDay[day]) {
          const rec = existingByDay[day];
          ops.push(dp.update('instructor-availabilities', { id: rec.id, data: { instructor_id: selectedInstructor, day, hours } }));
        } else {
          ops.push(dp.create('instructor-availabilities', { data: { instructor_id: selectedInstructor, day, hours } }));
        }
      }
      // handle deletions for days that existed but now cleared
      for (const [day, rec] of Object.entries(existingByDay)) {
        if (!desiredByDay[day] || (Array.isArray(desiredByDay[day]) && desiredByDay[day].length === 0)) {
          ops.push(dp.delete('instructor-availabilities', { id: rec.id }));
        }
      }

      await Promise.all(ops);
      notify('Availabilities saved', { type: 'info' });
      if (typeof onSaved === 'function') onSaved();
    } catch (e) {
      console.error(e);
      notify('Failed saving availabilities', { type: 'error' });
    }
  };

  const translate = useTranslate();

  return (
    <div style={{ padding: 12 }}>
      <div style={{ marginBottom: 12, maxWidth: 420 }}>
        <label style={{ display: 'block', marginBottom: 6 }}>{translate('resources.instructor-availabilities.fields.instructor_id', { defaultValue: 'Instructor' })}</label>
        <select value={selectedInstructor || ''} onChange={e => setSelectedInstructor(e.target.value)} style={{ width: '100%', padding: 8 }}>
          <option value="">{translate('instructorAvailabilities.select_instructor', { defaultValue: '-- Select instructor --' })}</option>
          {instructors.map(i => (
            <option key={i.id} value={i.id}>{i.first_name} {i.last_name} (#{i.id})</option>
          ))}
        </select>
      </div>

  <TimeGrid availMap={availMap} onToggle={handleToggle} translate={translate} />

      <div style={{ marginTop: 12 }}>
        <button onClick={handleSave} style={{ padding: '8px 14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>{translate('instructorAvailabilities.save', { defaultValue: 'Save availabilities' })}</button>
      </div>
    </div>
  );
}
