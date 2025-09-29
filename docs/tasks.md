# Tasks

## Context
This document tracks remaining items from today’s portal i18n work and the upcoming feature list you outlined. Each task includes clear subtasks, acceptance criteria, and notes/risks.

---

## Remaining tasks from today (Portal i18n + UX)

1) Complete i18n coverage in portal components
- Add missing portal keys in `frontend/src/i18n/locales/en.json`:
  - BookLesson: header subtitle, lesson details title, form labels/placeholders, error messages.
  - InstructorCalendarAvailability: weekly header, legend labels, loading/empty, table headers, nav tooltips, slot tooltip.
  - Lessons/Dashboard: use existing `type.theory`/`type.driving` instead of literal strings; add a reusable label for “Lesson” and small word “at”.
  - Payments: payment status chips (paid/due soon/upcoming/overdue), relative due date strings (today/in X days/X days ago).
  - Progress: section headers (Course Milestones, Recent Achievements), milestone item titles/descriptions, motivational card title/body.
  - Landing pages (public and student): hero kicker/title/subtitle, CTA labels, top menu labels, image alt text.
- Wire these keys in components to replace literals.
- Standardize error fallbacks to `t('commonUI.networkError')` where applicable.
Acceptance criteria:
- No user-facing English literals remain in portal pages/components once a locale file provides them.
- Language switcher changes all wired strings immediately.
- Build succeeds; no missing key warnings in console for common paths.

2) Student dashboard language switcher parity
- Ensure the legacy `StudentDashboard.jsx` (common namespace) exposes a language selector using the same persistence (localStorage key already used in i18n init: `app_lang`).
- Option: replace legacy dashboard with the new portal dashboard or align the header to reuse `PortalNavBar` for consistent switcher.
Acceptance criteria:
- When switching language in one dashboard view, a full reload preserves the language.
- All visible dashboard text pulls from i18n.

3) Add RO and RU locale files
- Create `ro.json` and `ru.json` mirroring `en.json` keys under `frontend/src/i18n/locales/`.
- Leave any temporarily untranslated strings in English or mark TODO; they’ll fall back to EN.
Acceptance criteria:
- Switching to RO/RU shows translated strings for keys that exist; missing keys cleanly fall back to EN.

---

## Upcoming feature list (detailed)

### 3. Filters să meargă (Filters function end-to-end)
Scope:
- Ensure filters in portal and admin views behave correctly.
Subtasks:
- Portal: Lessons page filters (all/scheduled/completed/canceled) already implemented—verify correctness against status values from API.
- Payments: date range, status, method (optional future).
- Admin lists: add consistent query param binding; server-side filtering for performance.
- Persist filters in URL (query params) so refresh preserves state.
Acceptance criteria:
- Changing filters updates results instantly; reloading the page or sharing the URL reproduces the same filtered view.

### 4. Practice tab: Category selector (theory/practice) and language
Goal:
- Replace current “Country” with “Category”; language selector still controls the external website URL.
Subtasks:
- Update `Practice.tsx` UI: add category dropdown according to website, remove country.
- Define mapping from category + language -> external site URL parameters. Example:
  - `https://auto-test.online/test/?category={{category}}&language={{language}}`
  - If the target site still expects `country`, implement mapping table (e.g., category->country) or switch to their category param if supported.
- Validate language selector matches options supported by the destination site.
Acceptance criteria:
- Selecting category+language opens the correct external URL in a new tab.
- No stale references to country remain in Practice tab.

### 5. Unify vehicles and classrooms as a single “resource”
Goal:
- One table for both “classrooms” (theory) and “vehicles” (practice) with a `resource_type` discriminator; adapt frontend filters.
Backend subtasks:
- New table `resources` with fields: id, resource_type (enum: VEHICLE|CLASSROOM), name, license_plate (nullable), category, is_available, capacity (for classrooms), metadata (JSON), created_at.
- Migrate: copy `vehicles` into `resources` with type VEHICLE; copy existing classrooms into `resources` with type CLASSROOM.
- Lessons: add `resource_id` FK; backfill from `vehicle_id`/`classroom_id`; deprecate old columns.
- API: expose `/api/resources/` and update `/api/lessons/` to use `resource_id`; maintain backward-compat read until frontend is migrated.
Frontend subtasks:
- Replace vehicle/classroom fetches with unified `/api/resources/` plus `?resource_type=` filter.
- In booking and calendars, filter resources by lesson type (theory → CLASSROOM, practice → VEHICLE).
- Surface a small “Type” badge or icon per resource.
Acceptance criteria:
- Database has a single source of truth for both resource kinds.
- Booking UI correctly auto-selects a valid resource for lesson type without conflicts.
- Modify all system calls and make sure all vehicle mentions are correctly changed
Success criteria: - no errors in booking lessons, creating resources, viewing resources, viewing lessons, viewing calendars, viewing dashboards, viewing progress, viewing payments, viewing practice tab, viewing landing pages, viewing navbars, viewing footers, viewing any other part of the system that mentions vehicles or classrooms

### 6. Instructor specialization: theory vs practice
Goal:
- Modify Instructor categories to be a multi select, and select either Theory or multiple Practice categories.
- Filter instructor dropdown by the selected type; refresh availability.
Acceptance criteria:
- Attempting to book with a mismatched instructor is prevented in UI and rejected by API.
- Instructors can have multiple practice categories or only one theory category.


### 7. Frontend language switcher parity across student views
Goal:
- Ensure a consistent language switcher on all student views.
Subtasks:
- Already implemented in `PortalNavBar`. Add or reuse the same in the legacy `StudentDashboard.jsx` (or route everything through portal pages using the navbar).
- Persist to localStorage (`app_lang`) and change language on i18n instance.
- Ensure `ro.json`/`ru.json` exist and match key structure.
Acceptance criteria:
- Changing language anywhere affects all student pages after navigation/reload; no orphan screens without a switcher.

### 8. Student import with hashed password support
Goal:
- On import, keep password hashes; on login, validate against stored hash.
Subtasks:
- Decide hash algorithm(s) accepted (bcrypt, argon2, PBKDF2). Store algo + salt (if needed) with the hash.
- Import path: if `password_hash` present, store as-is with metadata; if `password_plain` present, hash on import using the configured algorithm.
- Login: detect algorithm from stored metadata and verify accordingly; return uniform errors for security.
- Tests: unit tests for hash verification and migration from plain to hashed.
Acceptance criteria:
- Imported users with provided hashes can log in successfully; logins fail reliably with wrong passwords.
- No plain-text storage of passwords.

---

## Dependencies & risks
- Backend schema changes (tasks 5, 6, 8) require DB migrations and careful data backfill.
- External practice site parameters (task 4) must be confirmed; mapping table might be needed.
- RO/RU translation scope is sizable; prioritize high-traffic screens first.

## Suggested order of execution
1) Finish i18n coverage + switcher parity (today’s items).
2) Practice tab category+language UX (isolated, quick win).
3) Import/export fundamentals (admin productivity).
4) Instructor specialization + unified resource model (requires backend work + migration).
5) Student import hashed passwords (security-critical; can be parallelized with 3/4).

## Tracking
- Create individual tickets per task with checklists from the subtasks here.
- Link PRs to tickets; attach screenshots for UI changes and sample files for import/export.
