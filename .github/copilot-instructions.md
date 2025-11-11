# Repository instructions for AI coding agents

Ask questions for clarity.
Ask questions for context.
Ask questions for instructions and to understand the task better.

This file gives concise, actionable guidance for AI coding agents working on this repo (full-stack Django + React).

Important: `frontend/` is the working application today. `frontend-structured-minimal/` is a reference for structure and patterns only. When refactoring, keep all features working from `frontend/` while reorganizing code to match the `frontend-structured-minimal` layout.

High level
- Backend: Django + DRF under `backend/` (see `backend/manage.py`, `backend/project/settings.py`, and `backend/school/`). Use DRF serializers and `school/api.py` for endpoints.
- Frontend: React Admin SPA. Working app is under `frontend/`. The structural reference is under `frontend-structured-minimal/` (entry: `src/main.jsx`, app root: `src/App.jsx`). Frontend uses `react-admin`, `ra-data-simple-rest`, `i18next` and MUI.

Frontend dev workflow
- Start dev server (working app): `cd frontend && npm install && npm run dev` (or `npm run start`). Vite serves on port 3000 by default.
- Build for production: `npm run build` in `frontend/`.
- Preview production build: `npm run preview`.

Key frontend files and patterns
- `src/main.jsx`: app bootstrap and providers (i18n, dataProvider). Modify when adding global providers.
- `src/App.jsx`: main React Admin resource registration. Add new resources (students, instructors, vehicles, courses, payments) here.
- `src/api/dataProvider.js` (to be added in `frontend/` during refactor): the React Admin data provider; adapt endpoints/path or auth logic here when backend changes.
- Feature folders (`src/features/<resource>/`): each resource follows the same pattern: `index.js`, `*List.jsx`, `*Create.jsx`, `*Edit.jsx`, optional `*ListAside.jsx` / `*ListActions.jsx`.
- Shared components: `src/shared/components/` contains small reusable UI helpers (e.g., `PhoneFieldRA.jsx`, `ImportButton.jsx`, `DisabledUntilValidToolbar.jsx`). Prefer reusing these instead of copying logic.
- Validation utilities: `src/shared/validation/raValidators.js` and `validators.js` contain project-specific validation rules (phone handling uses `libphonenumber-js` and there are helpers in `phoneUtils.js` in other frontends).

Conventions & patterns
- Resource CRUD: each feature exposes List/Edit/Create components wired to `ra-data-simple-rest` via `dataProvider`. Keep REST endpoints conventional: `/students/`, `/instructors/`, etc.
- CSV import/export: `papaparse` is used; check `ImportButton.jsx` for behavior and expected CSV columns.
- Phone fields: standardized using `libphonenumber-js` and project helpers. See `PhoneFieldRA.jsx` and `shared/validation` for examples. The working `frontend/` includes `phoneUtils.js` and `PhoneInput.jsx`; prefer the `PhoneFieldRA` + validators pattern during refactor.
- i18n: `i18next` + `react-i18next` configured in `src/i18n.js`. Use translation keys from components; extend `i18n.js` for new namespaces.

Testing & quality gates
- No frontend tests shipped by default. For small changes, run the dev server and smoke-test UI flows. For CI or unit tests, prefer Jest + React Testing Library; add tests under the feature folder mirroring components.

Integration points
- Frontend expects a simple REST API compatible with `ra-data-simple-rest`. If backend responses differ (paginated format, envelope), adapt `src/api/dataProvider.js`.
- Auth: the working `frontend/` includes `authProvider.js` and legacy `Login.jsx`/`SignupForm.jsx`. Keep auth functional while refactoring; longer-term, integrate auth via RA `authProvider` and attach tokens in the `dataProvider`.

Admin mount and future split
- Admin panel is mounted under `/admin` (React Admin + auth). The default route `/` redirects to `/admin`; unauthenticated users see the RA login first.
- Public routes like `/signup` can remain outside `/admin`. A later iteration can flesh out the Student Portal at root while keeping Admin under `/admin`.

What to change vs. where to be conservative
- Change UI and resource components freely under `frontend-structured-minimal/src/features/*` and `shared/*`.
- Modify backend models/serializers when API data changes, but coordinate with frontend `dataProvider` expectations.

Examples (copy-paste friendly)
- Register a new resource in `src/App.jsx`:
  - import the resource's `index.js` from `src/features/<resource>/index.js` and add it to `<Admin resources={[...]} />` (follow style used for `students`).
- Adjust endpoints: edit `src/api/dataProvider.js` to map `getList` to the backend's pagination keys.

Notes and sources
- This guidance reflects the `CLEAN_STRUCTURE.md` layout and the `frontend-structured-minimal` package layout (scripts: `dev`, `build`, `preview`).
- If you need backend startup commands, look at `backend/requirements.txt` and Dockerfile; typical Django commands used here are `python manage.py runserver` or Docker Compose in root.

ALWAYS CHECK CONTRIBUTING.md AND PROJECT-SPECIFIC GUIDELINES IF PRESENT.


