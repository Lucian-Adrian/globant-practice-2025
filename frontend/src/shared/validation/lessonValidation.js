import { API_PREFIX } from '../../api/httpClient';

const addMinutes = (date, mins) => new Date(new Date(date).getTime() + mins * 60000);
const overlap = (startA, endA, startB, endB) => startA < endB && startB < endA; // adjacency allowed
const DAY_ENUM = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
// Business-local timezone for availability checks (must match backend settings BUSINESS_TZ)
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
		// Fallback to local if Intl fails
		const d = new Date(date);
		const dayIndex = (d.getDay() + 6) % 7;
		const hh = String(d.getHours()).padStart(2, '0');
		const mm = String(d.getMinutes()).padStart(2, '0');
		return { dayIndex, hhmm: `${hh}:${mm}` };
	}
}

function minutesOf(hhmm) {
	const [h, m] = String(hhmm)
		.split(':')
		.map((x) => parseInt(x, 10));
	return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
}

async function getJson(url) {
	const resp = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
	let body = {};
	try {
		body = await resp.json();
	} catch (_) {}
	const data = Array.isArray(body) ? body : Array.isArray(body?.results) ? body.results : body;
	return { ok: resp.ok, data, raw: body };
}

export async function validateLesson(values, t, currentId) {
	const errors = {};

	const enrollmentId = values.enrollment_id ?? values.enrollment?.id;
	const instructorId = values.instructor_id ?? values.instructor?.id;
	const resourceId = values.resource_id ?? values.resource?.id ?? null;
	const scheduled = values.scheduled_time;
	const duration = Number(values.duration_minutes ?? 90);

	if (!enrollmentId) errors.enrollment_id = t('validation.requiredField');
	if (!instructorId) errors.instructor_id = t('validation.requiredField');
	if (!scheduled) errors.scheduled_time = t('validation.requiredField');
	if (Object.keys(errors).length) return errors;

	const start = new Date(scheduled);
	const end = addMinutes(start, duration);
	const windowStart = addMinutes(start, -480); // 8 hours back

	// Fetch enrollment for course.category and student id
	const enr = await getJson(`${API_PREFIX}/enrollments/${enrollmentId}/`);
	const enrollment = enr.data || {};
	const course = enrollment.course || {};
	const courseCategory = course.category;

	// Practice-only: lessons must be created for practice enrollments
	const courseType = String(course.type || enrollment.type || '').toUpperCase();
	if (courseType && courseType !== 'PRACTICE') {
		errors.enrollment_id = t('validation.practiceEnrollmentRequired');
	}

	// Fetch instructor for license categories
	const ins = await getJson(`${API_PREFIX}/instructors/${instructorId}/`);
	const instructor = ins.data || {};

	// Fetch resource if provided
	let resource = null;
	if (resourceId) {
		const res = await getJson(`${API_PREFIX}/resources/${resourceId}/`);
		resource = res.data || null;
	}

	// Availability: GET by instructor and business-local day, accept any-minute within intervals
	const { dayIndex, hhmm } = formatInBusinessTZParts(start);
	const day = DAY_ENUM[dayIndex];
	const avail = await getJson(
		`${API_PREFIX}/instructor-availabilities/?instructor_id=${encodeURIComponent(
			instructorId
		)}&day=${encodeURIComponent(day)}&page_size=50`
	);
	const slots = new Set();
	if (Array.isArray(avail.data)) {
		for (const a of avail.data) {
			const hours = Array.isArray(a?.hours) ? a.hours : [];
			hours.forEach((h) => {
				if (typeof h === 'string') {
					const [H, M] = h.split(':');
					const hh = String(H || '00').padStart(2, '0');
					const mm = String(M || '00').padStart(2, '0');
					slots.add(`${hh}:${mm}`);
				}
			});
		}
	}
	if (slots.size > 0) {
		const startMin = minutesOf(hhmm);
		const sorted = Array.from(slots).sort();
		const mins = sorted.map(minutesOf);
		let ok = false;
		if (startMin === mins[mins.length - 1]) ok = true; // accept exact last slot
		else {
			for (let i = 0; i < mins.length - 1; i++) {
				if (mins[i] <= startMin && startMin < mins[i + 1]) {
					ok = true;
					break;
				}
			}
		}
		if (!ok) errors.scheduled_time = t('validation.outsideAvailability');
	}

	// Category & license checks
	if (resource && courseCategory && resource.category !== courseCategory) {
		errors.resource_id = t('validation.categoryMismatch');
	}
	if (courseCategory) {
		const cats = String(instructor.license_categories || '')
			.split(',')
			.map((c) => c.trim().toUpperCase())
			.filter(Boolean);
		if (!cats.includes(String(courseCategory).toUpperCase())) {
			errors.instructor_id = t('validation.instructorLicenseMismatch');
		}
	}

	// Overlaps: lessons in window, filter client-side by status and by entity
	async function findAnyOverlap(url, predicate) {
		const r = await getJson(url);
		const list = Array.isArray(r.data) ? r.data : [];
		return list.some((item) => {
			if (currentId && item.id === currentId) return false;
			const st = new Date(item.scheduled_time);
			const en = addMinutes(st, Number(item.duration_minutes ?? 60));
			const active = item.status === 'SCHEDULED' || item.status === 'COMPLETED';
			return active && predicate(item) && overlap(start, end, st, en);
		});
	}

	// Narrow time window for payload; we only need to know if any exists
	const baseWin = `scheduled_time__lt=${encodeURIComponent(
		end.toISOString()
	)}&scheduled_time__gte=${encodeURIComponent(windowStart.toISOString())}&page_size=1`;

	// Instructor conflict (cross-entity: lessons + scheduled-classes)
	const instrLessonUrl = `${API_PREFIX}/lessons/?instructor=${encodeURIComponent(
		instructorId
	)}&${baseWin}`;
	const instrHitLessons = await findAnyOverlap(instrLessonUrl, () => true);
	let instrHitClasses = false;
	{
		const instrClassUrl = `${API_PREFIX}/scheduled-classes/?instructor=${encodeURIComponent(
			instructorId
		)}&${baseWin}`;
		const r = await getJson(instrClassUrl);
		const list = Array.isArray(r.data) ? r.data : [];
		instrHitClasses = list.some((item) => {
			const st = new Date(item.scheduled_time);
			const en = addMinutes(st, Number(item.duration_minutes ?? 60));
			const active = item.status === 'SCHEDULED' || item.status === 'COMPLETED';
			return active && overlap(start, end, st, en);
		});
	}
	const instrHit = instrHitLessons || instrHitClasses;
	if (instrHit) errors.instructor_id = t('validation.instructorConflict');

	// Student conflict
	const studentId = enrollment?.student?.id ?? enrollment?.student_id;
	if (studentId) {
		const stuUrl = `${API_PREFIX}/lessons/?enrollment__student=${encodeURIComponent(
			studentId
		)}&${baseWin}`;
		const stuHitLessons = await findAnyOverlap(stuUrl, () => true);
		// Also check scheduled-classes where this student is enrolled (no server filter for students -> filter client-side)
		const clsUrl = `${API_PREFIX}/scheduled-classes/?${baseWin}`;
		const r = await getJson(clsUrl);
		const list = Array.isArray(r.data) ? r.data : [];
		const stuHitClasses = list.some((item) => {
			const st = new Date(item.scheduled_time);
			const en = addMinutes(st, Number(item.duration_minutes ?? 60));
			const active = item.status === 'SCHEDULED' || item.status === 'COMPLETED';
			const hasStudent = Array.isArray(item.students) &&
				item.students.some((s) => (s?.id ?? s) === studentId);
			return active && hasStudent && overlap(start, end, st, en);
		});
		if (stuHitLessons || stuHitClasses) errors.enrollment_id = t('validation.studentConflict');
	}

	// Resource conflict
	if (resourceId) {
		// Use efficient server-side filter by resource id
		const resUrl = `${API_PREFIX}/lessons/?resource_id=${encodeURIComponent(resourceId)}&${baseWin}`;
		const resHit = await findAnyOverlap(resUrl, () => true);
		if (resHit) errors.resource_id = t('validation.resourceConflict');
	}

	return errors;
}

export async function validateScheduledClass(values, t, currentId) {
	const errors = {};

	const courseId = values.course_id ?? values.course?.id;
	const instructorId = values.instructor_id ?? values.instructor?.id;
	const resourceId = values.resource_id ?? values.resource?.id;
	const scheduled = values.scheduled_time;
	const duration = Number(values.duration_minutes ?? 60);
	const maxStudents = values.max_students;

	if (!courseId) errors.course_id = t('validation.requiredField');
	if (!instructorId) errors.instructor_id = t('validation.requiredField');
	if (!resourceId) errors.resource_id = t('validation.requiredField');
	if (!scheduled) errors.scheduled_time = t('validation.requiredField');
	if (maxStudents == null) errors.max_students = t('validation.requiredField');
	if (Object.keys(errors).length) return errors;

	const start = new Date(scheduled);
	const end = addMinutes(start, duration);
	const windowStart = addMinutes(start, -480);
	const baseWin = `scheduled_time__lt=${encodeURIComponent(
		end.toISOString()
	)}&scheduled_time__gte=${encodeURIComponent(windowStart.toISOString())}&page_size=1000`;

	// Load referenced entities
	const [courseRes, instructorRes, resourceRes] = await Promise.all([
		getJson(`${API_PREFIX}/courses/${courseId}/`),
		getJson(`${API_PREFIX}/instructors/${instructorId}/`),
		getJson(`${API_PREFIX}/resources/${resourceId}/`),
	]);
	const course = courseRes.data || {};
	const instructor = instructorRes.data || {};
	const resource = resourceRes.data || {};

	// Theory-only
	const ctype = String(course?.type || '').toUpperCase();
	if (ctype && ctype !== 'THEORY') {
		errors.course_id = t('validation.theoryOnly');
	}

	// Classroom-only (resource not vehicle)
	const rcap = Number(resource?.max_capacity ?? NaN);
	if (!Number.isNaN(rcap) && rcap <= 2) {
		errors.resource_id = t('validation.classroomResourceRequired');
	}

	// Instructor availability (business-local)
	const { dayIndex, hhmm } = formatInBusinessTZParts(start);
	const day = DAY_ENUM[dayIndex];
	const avail = await getJson(
		`${API_PREFIX}/instructor-availabilities/?instructor_id=${encodeURIComponent(
			instructorId
		)}&day=${encodeURIComponent(day)}&page_size=50`
	);
	const slots = new Set();
	if (Array.isArray(avail.data)) {
		for (const a of avail.data) {
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
	if (slots.size > 0) {
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
		if (!ok) errors.scheduled_time = t('validation.outsideAvailability');
	}

	// Category & license
	const courseCategory = course?.category;
	if (resource && courseCategory && resource.category !== courseCategory) {
		errors.resource_id = t('validation.categoryMismatch');
	}
	if (courseCategory) {
		const cats = String(instructor?.license_categories || '')
			.split(',')
			.map((c) => c.trim().toUpperCase())
			.filter(Boolean);
		if (!cats.includes(String(courseCategory).toUpperCase())) {
			errors.instructor_id = t('validation.instructorLicenseMismatch');
		}
	}

		// NEW: Each selected student must be enrolled in the chosen course
		const studentIds = Array.isArray(values.student_ids)
			? values.student_ids.map((s) => (s?.id ?? s))
			: [];
		if (studentIds.length > 0 && courseId) {
			// Run checks in parallel and collect any missing enrollments
			const results = await Promise.all(
				studentIds.map(async (sid) => {
					const url = `${API_PREFIX}/enrollments/?student=${encodeURIComponent(
						sid
					)}&course=${encodeURIComponent(courseId)}&page_size=1`;
					const r = await getJson(url);
					const list = Array.isArray(r.data) ? r.data : [];
					const ok = list.some((e) => {
						const stId = e?.student?.id ?? e?.student_id;
						const coId = e?.course?.id ?? e?.course_id;
						return String(stId) === String(sid) && String(coId) === String(courseId);
					});
					return { sid, ok };
				})
			);

			const notEnrolled = results.filter((r) => !r.ok).map((r) => r.sid);
			if (notEnrolled.length > 0) {
				// Try to resolve names for better UX
				const nameResults = await Promise.all(
					notEnrolled.map(async (sid) => {
						try {
							const s = await getJson(`${API_PREFIX}/students/${sid}/`);
							const sd = s.data || {};
							const name = `${sd.first_name || ''} ${sd.last_name || ''}`.trim();
							return name || String(sid);
						} catch (_) {
							return String(sid);
						}
					})
				);
						const names = nameResults.join(', ');
						const key = 'validation.studentNotEnrolledToCourseNames';
						const translated = t(key, { names });
						errors.student_ids = translated === key
							? `The following students are not enrolled in the chosen course: ${names}`
							: translated;
			}
		}

	// Capacity
	if (!Number.isNaN(rcap) && maxStudents != null) {
		const m = Number(maxStudents);
		if (!(m > 0)) {
			errors.max_students = t('validation.capacityExceeded');
		} else if (!Number.isNaN(rcap) && m > rcap) {
			errors.max_students = t('validation.capacityExceeded');
		}
	}
		// Additional create-time capacity checks: ensure selected students fit and max_students is not below their count
		const selectedCount = Array.isArray(values.student_ids) ? values.student_ids.length : 0;
		if (!currentId) { // creation
			if (selectedCount > 0) {
				if (maxStudents != null && Number(maxStudents) < selectedCount) {
					// Fallback aware translation (handles namespace variations or missing key)
					const key = 'validation.capacityBelowSelected';
					let msg = t(key, { count: selectedCount });
					if (msg === key) {
						// Try alternate key form without explicit namespace prefix
						msg = t('capacityBelowSelected', { count: selectedCount });
					}
					if (msg === key || msg === 'capacityBelowSelected') {
						msg = 'Max students cannot be lower than number of selected students.';
					}
					errors.max_students = msg;
				}
				if (!Number.isNaN(rcap) && rcap < selectedCount) {
					const key = 'validation.selectedStudentsExceedCapacity';
					let msg = t(key, { count: selectedCount, capacity: rcap });
					if (msg === key) msg = t('selectedStudentsExceedCapacity', { count: selectedCount, capacity: rcap });
					if (msg === key || msg === 'selectedStudentsExceedCapacity') {
						msg = 'Selected students exceed room capacity.';
					}
					errors.student_ids = msg;
				}
			}
		} else { // editing: still enforce max_students >= current enrollment (below)
			// (handled below)
		}
	if (currentId) {
		// load current to compare enrollment
		const curr = await getJson(`${API_PREFIX}/scheduled-classes/${currentId}/`);
		const current = curr.data || {};
		const enrolled = Number(current?.current_enrollment ?? 0);
		if (maxStudents != null && Number(maxStudents) < enrolled) {
			errors.max_students = t('validation.capacityBelowEnrolled');
		}

		// Edit-time capacity checks (new additions beyond original enrollment)
		// We validate against the newly selected list which may be bigger than current enrollment.
		const editSelectedCount = Array.isArray(values.student_ids) ? values.student_ids.length : 0;
		if (editSelectedCount > 0) {
			if (maxStudents != null && Number(maxStudents) < editSelectedCount) {
				const key = 'validation.capacityBelowSelected';
				let msg = t(key, { count: editSelectedCount });
				if (msg === key) msg = t('capacityBelowSelected', { count: editSelectedCount });
				if (msg === key || msg === 'capacityBelowSelected') {
					msg = 'Max students cannot be lower than number of selected students.';
				}
				errors.max_students = msg;
			}
			if (!Number.isNaN(rcap) && rcap < editSelectedCount) {
				const key = 'validation.selectedStudentsExceedCapacity';
				let msg = t(key, { count: editSelectedCount, capacity: rcap });
				if (msg === key) msg = t('selectedStudentsExceedCapacity', { count: editSelectedCount, capacity: rcap });
				if (msg === key || msg === 'selectedStudentsExceedCapacity') {
					msg = 'Selected students exceed room capacity.';
				}
				errors.student_ids = msg;
			}
		}
	}

	// Instructor conflicts (cross-entity)
	const instrLessonsUrl = `${API_PREFIX}/lessons/?instructor=${encodeURIComponent(
		instructorId
	)}&${baseWin}`;
	const instrLessons = await getJson(instrLessonsUrl);
	const instrHitLessons = (Array.isArray(instrLessons.data) ? instrLessons.data : []).some(
		(item) => {
			const st = new Date(item.scheduled_time);
			const en = addMinutes(st, Number(item.duration_minutes ?? 60));
			const active = item.status === 'SCHEDULED' || item.status === 'COMPLETED';
			return active && overlap(start, end, st, en);
		}
	);
	const instrClassesUrl = `${API_PREFIX}/scheduled-classes/?instructor=${encodeURIComponent(
		instructorId
	)}&${baseWin}`;
	const instrClasses = await getJson(instrClassesUrl);
	const instrHitClasses = (Array.isArray(instrClasses.data) ? instrClasses.data : []).some(
		(item) => {
			if (currentId && item.id === currentId) return false;
			const st = new Date(item.scheduled_time);
			const en = addMinutes(st, Number(item.duration_minutes ?? 60));
			const active = item.status === 'SCHEDULED' || item.status === 'COMPLETED';
			return active && overlap(start, end, st, en);
		}
	);
	if (instrHitLessons || instrHitClasses) {
		errors.instructor_id = t('validation.instructorConflict');
	}

	// Resource conflicts (classes vs classes)
	const clsByResUrl = `${API_PREFIX}/scheduled-classes/?resource=${encodeURIComponent(
		resourceId
	)}&${baseWin}`;
	const clsByRes = await getJson(clsByResUrl);
	const resHit = (Array.isArray(clsByRes.data) ? clsByRes.data : []).some((item) => {
		if (currentId && item.id === currentId) return false;
		const st = new Date(item.scheduled_time);
		const en = addMinutes(st, Number(item.duration_minutes ?? 60));
		const active = item.status === 'SCHEDULED' || item.status === 'COMPLETED';
		return active && overlap(start, end, st, en);
	});
	if (resHit) errors.resource_id = t('validation.resourceConflict');

	return errors;
}

