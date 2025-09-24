import React, { useEffect, useState } from 'react';
import { List, useDataProvider, useNotify, useTranslate } from 'react-admin';

const DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];
// Slots represent 1h30m start times; show only full-hour start times from 08:00 to 22:00
const generateSlots = () => {
	const slots = [];
	const startHour = 8;
	const endHour = 22;
	for (let h = startHour; h <= endHour; ++h) {
		slots.push(`${String(h).padStart(2,'0')}:00`);
	}
	return slots;
};
const SLOTS = generateSlots();

function TimeGrid({ availMap, onToggle, translate }) {
	return (
		<div style={{ overflowX: 'auto' }}>
			<table style={{ borderCollapse: 'collapse', width: '100%' }}>
				<thead>
					<tr>
						<th style={{ border: '1px solid #ddd', padding: 8 }}>{translate('instructorAvailabilities.time_label', { defaultValue: 'Time' })}</th>
						{DAYS.map(d => (
							<th key={d} style={{ border: '1px solid #ddd', padding: 8 }}>{translate(`days.${d}_short`, { defaultValue: d.slice(0,3) })}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{SLOTS.map(slot => (
						<tr key={slot}>
							<td style={{ border: '1px solid #eee', padding: 6, whiteSpace: 'nowrap' }}>{slot}</td>
							{DAYS.map(day => {
								const key = `${day}|${slot}`;
								const active = availMap[key];
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
											title={active ? translate('instructorAvailabilities.availabilities_saved', { defaultValue: 'Available - click to remove' }) : translate('instructorAvailabilities.select_instructor', { defaultValue: 'Not available - click to add' })}
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

export default function InstructorAvailabilityList(props) {
	const dp = useDataProvider();
	const notify = useNotify();
	const translate = useTranslate();
	const [instructors, setInstructors] = useState([]);
	const [selected, setSelected] = useState('');
	const [availMap, setAvailMap] = useState({});

	useEffect(() => {
		dp.getList('instructors', { pagination: { page:1, perPage: 200 }, sort: { field: 'id', order: 'ASC' }, filter: {} })
			.then(r => setInstructors(r.data))
			.catch(() => notify(translate('instructorAvailabilities.failed_load_instructors', { defaultValue: 'Failed to load instructors' }), { type: 'error' }));
	}, []);

	useEffect(() => {
		if (!selected) { setAvailMap({}); return; }
		dp.getList('instructor-availabilities', { pagination: { page:1, perPage: 100 }, sort: { field: 'id', order: 'ASC' }, filter: { instructor_id: selected } })
			.then(r => {
				const map = {};
				r.data.forEach(av => {
					const day = av.day;
					(av.hours || []).forEach(hour => {
						map[`${day}|${hour}`] = true;
					});
				});
				setAvailMap(map);
			})
			.catch(() => notify(translate('instructorAvailabilities.failed_load_availabilities', { defaultValue: 'Failed to load availabilities' }), { type: 'error' }));
	}, [selected]);

	const upsertDay = async (instructorId, day, hours) => {
		try {
			const list = await dp.getList('instructor-availabilities', { pagination: { page:1, perPage: 50 }, sort: { field:'id', order:'ASC' }, filter: { instructor_id: instructorId, day } });
			if (list.data && list.data.length) {
				const rec = list.data[0];
				await dp.update('instructor-availabilities', { id: rec.id, data: { instructor_id: instructorId, day, hours } });
			} else {
				await dp.create('instructor-availabilities', { data: { instructor_id: instructorId, day, hours } });
			}
		} catch (e) {
			throw e;
		}
	};

	const handleToggle = async (day, slot) => {
	if (!selected) return notify(translate('instructorAvailabilities.select_instructor_first', { defaultValue: 'Select an instructor first' }), { type: 'warning' });
		const key = `${day}|${slot}`;
		const currently = !!availMap[key];
		const newMap = { ...availMap };
		if (currently) delete newMap[key]; else newMap[key] = true;
		setAvailMap(newMap);

		const hours = SLOTS.filter(s => newMap[`${day}|${s}`]);
		try {
			await upsertDay(selected, day, hours);
			notify(translate('instructorAvailabilities.availabilities_saved', { defaultValue: 'Availability saved' }), { type: 'info' });
		} catch (e) {
			notify(translate('instructorAvailabilities.failed_saving_availabilities', { defaultValue: 'Failed saving availability' }), { type: 'error' });
		}
	};

	return (
		<List {...props} title={translate('resources.instructor-availabilities.name', { defaultValue: 'Instructor Availability' })}>
			<div style={{ padding: 12 }}>
				<div style={{ marginBottom: 12, maxWidth: 360 }}>
					<label style={{ display: 'block', marginBottom: 6 }}>{translate('resources.instructor-availabilities.fields.instructor_id', { defaultValue: 'Instructor' })}</label>
					<select value={selected} onChange={e => setSelected(e.target.value)} style={{ width: '100%', padding: 8 }}>
						<option value="">{translate('instructorAvailabilities.select_instructor', { defaultValue: '-- Select instructor --' })}</option>
						{instructors.map(i => (
							<option key={i.id} value={i.id}>{i.first_name} {i.last_name} (#{i.id})</option>
						))}
					</select>
				</div>

				<TimeGrid availMap={availMap} onToggle={handleToggle} translate={translate} />
			</div>
		</List>
	);
}

