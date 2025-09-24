# Frontend migration plan: `frontend/` → `frontend-structured-minimal/`

Purpose
- Document concrete differences and the exact steps to refactor the fully functional `frontend/` into the organized structure and patterns used in `frontend-structured-minimal/`.
- Backend stays as-is (Django + DRF). Focus is UI structure, conventions, and wiring.
 - IMPORTANT: Do NOT copy code from `frontend-structured-minimal/`. Use it only as a visual reference for folder layout and naming patterns. All code must come from the working `frontend/`.
 - Keep `frontend/` working at every step; use `frontend-structured-minimal/` only as a structural reference.

Big picture: target layout and patterns
- Single-page React Admin app with:
  - Entry: `src/main.jsx`
  - App root: `src/App.jsx` registers resources
  - API layer: `src/api/dataProvider.js` using `ra-data-simple-rest`
  - i18n: `src/i18n.js` with `i18next`
  - Feature folders per resource: `src/features/<resource>/{index.js, *List.jsx, *Edit.jsx, *Create.jsx, optional Aside/Actions}`
  - Shared UI and utilities under `src/shared/{components, validation, constants}`

Immediate deltas (what differs today)
- Legacy/extra files in `frontend/src/`: `App.js`, `Root.jsx`, `LandingPage.jsx`, `SignupForm.jsx`, `Login.jsx`, `TestJWT.jsx`, `translations.js`, `LanguageContext.jsx`.
- `frontend/` contains `authProvider.js`; target pattern prefers wiring auth in `dataProvider` or a dedicated RA `authProvider` colocated with API concerns.
- No dedicated `src/api/dataProvider.js` in `frontend/` (exists in `frontend-structured-minimal/`).
- i18n setup differs: `frontend/` uses `translations.js`/`LanguageContext.jsx`; target uses `src/i18n.js` with `react-i18next`.
- Duplicated student paths: `frontend/src/features/students/` and `frontend/src/students/` (e.g., `StudentListAside.jsx`). Target keeps everything under `src/features/students/`.
- Reusable inputs in `frontend/src/components/` (`LicensePlateInput.jsx`, `NameInput.jsx`, `PhoneInput.jsx`) should live under `src/shared/components/` (target already has `PhoneFieldRA.jsx`, `ImportButton.jsx`, etc.).
- Enums/constants: `frontend/src/enums.js`, `enumsClient.js` vs target `src/constants.js` and `src/shared/constants/drivingSchool.js`.

Refactor plan (ordered steps)
Phase 0) Baseline
   - Work inside `frontend/` only (the working app). Keep it running after each small change.
   - Dev commands:
     ```pwsh
     cd frontend
     npm install
     npm run dev
     ```

1) Create/confirm base folders in `frontend/src/`:
   - `api/`, `shared/components/`, `shared/validation/`, `shared/constants/`, `features/`.

2) API layer
   - Add `src/api/dataProvider.js` implemented for `ra-data-simple-rest` using ONLY logic from the working app.
     - Base URL: reuse whatever the working app uses (env/config or hardcoded if present).
     - Auth: attach JWT from the existing `authProvider.js`/storage (e.g., `localStorage`), adding `Authorization: Bearer <token>` to requests.
     - Pagination/format: adapt to the actual backend responses (e.g., `count`, `results`).
   - Keep the current `authProvider.js` and integrate it with React Admin.

3) i18n setup (defer)
   - Keep existing `translations.js` / `LanguageContext.jsx` for now to avoid breaking changes.
   - Plan a later migration to `i18next` (`src/i18n.js`) only after core refactor is stable and dependencies are added.

4) App bootstrap and providers
   - Update `src/main.jsx` to initialize i18n and pass the `dataProvider` to `<Admin />` (align with `frontend-structured-minimal/src/main.jsx`).
   - Ensure only `src/App.jsx` is used as the root app component (delete or ignore `App.js`).
   - Preserve existing routes during refactor. Future: mount the admin panel under `/admin`; keep public/student portal at root.
   - Preserve existing routes during refactor. Future: mount the admin panel under `/admin`; keep public/student portal at root.

5) Resource registration
   - In `src/App.jsx`, register resources via feature `index.js` files, mirroring the target pattern:
     - `students`, `instructors`, `vehicles`, `courses`, `payments`.
   - Each `features/<resource>/index.js` should export `{ list, edit, create }` components.

6) Consolidate Students feature
   - Move any files under `frontend/src/students/` into `frontend/src/features/students/` and de-duplicate.
   - Align component names with target: `StudentList.jsx`, `StudentEdit.jsx`, `StudentCreate.jsx`, optional `StudentListAside.jsx`, `StudentListActions.jsx`.

7) Promote shared UI and utils
   - Scope `LicensePlateInput.jsx` to vehicles: move to `src/features/vehicles/LicensePlateInput.jsx`.
   - Move `NameInput.jsx`, `PhoneInput.jsx` to `src/shared/components/`.
   - Prefer target’s `PhoneFieldRA.jsx` over custom `PhoneInput.jsx`. If keeping custom behaviors, wrap or extend `PhoneFieldRA`.
   - Port any phone helpers from `src/phoneUtils.js` into `src/shared/validation/` or integrate with `raValidators.js`/`validators.js`.

8) Constants/enums
   - Replace `enums.js` / `enumsClient.js` with `src/constants.js` (global) and granular `src/shared/constants/drivingSchool.js`.
   - Update imports across features to use the new constants locations.

9) Feature folders for remaining domains
   - Create folders and wire components similar to target for:
     - `features/instructors/`: `InstructorList/Edit/Create` (+ optional `ListAside`, `ListActions`).
     - `features/vehicles/`: `VehicleList/Edit/Create` (+ optional `ListAside`, `ListActions`).
     - `features/courses/`: `CourseList/Edit/Create`.
     - `features/payments/`: `PaymentList/Edit/Create`.
   - Add an `index.js` in each that exports `list`, `edit`, `create` (see target examples).

10) Remove or archive legacy screens
    - Remove or move to `src/legacy/`: `Root.jsx`, `LandingPage.jsx`, `SignupForm.jsx`, `Login.jsx`, `TestJWT.jsx`, and `App.js`.
    - If JWT auth is required, integrate it into the `dataProvider` or a dedicated `authProvider` aligned with React Admin patterns, not as standalone pages (unless explicitly needed).

11) Shared components: adopt target utilities
    - Use `ResourceEmptyState.jsx`, `ResourceListActions.jsx`, `ResourceSidebar.jsx`, `DisabledUntilValidToolbar.jsx`, `SmartCrudWrappers.jsx`, `smartMutation.js` from `src/shared/components/`.
    - Standardize CSV import/export using `ImportButton.jsx` (uses `papaparse`).

12) Validation
    - Ensure validations live in `src/shared/validation/{raValidators.js, validators.js}`.
    - Replace ad hoc validators with these shared utilities.

13) Imports and paths
    - Update all imports to new paths (e.g., `src/components/*` → `src/shared/components/*`; `src/students/*` → `src/features/students/*`).

14) Package and scripts alignment
    - Ensure `package.json` has (from target):
      - Dependencies: `react-admin`, `ra-data-simple-rest`, `i18next`, `react-i18next`, `@mui/material`, `@mui/icons-material`, `libphonenumber-js`, `papaparse`.
      - Scripts: `dev`, `start`, `build`, `preview` using Vite on port 3000.
    - Keep `vite.config.js` aligned with the target’s minimal setup.

15) Smoke test
    - Run locally:
      ```pwsh
      cd frontend
      npm install
      npm run dev
      ```
    - Verify resources list pages render and CRUD screens mount. If the backend pagination/envelope differs from `ra-data-simple-rest` defaults, adjust `src/api/dataProvider.js` accordingly.

File move/creation checklist (representative)
- Create: `src/api/dataProvider.js`, `src/i18n.js`, `src/constants.js`.
- Move: `src/components/LicensePlateInput.jsx` → `src/features/vehicles/LicensePlateInput.jsx`.
- Move: `src/components/NameInput.jsx` → `src/shared/components/NameInput.jsx`.
- Move: `src/components/PhoneInput.jsx` → replace with `src/shared/components/PhoneFieldRA.jsx` where possible.
- Move: `src/students/StudentListAside.jsx` → `src/features/students/StudentListAside.jsx`.
- Replace: usages of `enums.js` / `enumsClient.js` with `src/constants.js` + `src/shared/constants/drivingSchool.js`.
- Remove/archive: `App.js`, `Root.jsx`, `LandingPage.jsx`, `SignupForm.jsx`, `Login.jsx`, `TestJWT.jsx`, `translations.js`, `LanguageContext.jsx`.

Coding patterns to follow (from target)
- Resource modules export via `index.js`:
  - Example: `features/students/index.js` should export `{ list: StudentList, edit: StudentEdit, create: StudentCreate }`.
- Prefer `PhoneFieldRA` + validators in `shared/validation` for phone fields.
- Use `ImportButton` for CSV import; ensure expected columns match backend.
- Keep new shared utilities under `src/shared/*` for reuse.

Notes
- All guidance reflects `docs/CLEAN_STRUCTURE.md` and files present in `frontend-structured-minimal/`.
- Backend is stable; only adapt the `dataProvider` if response shape differs (pagination keys, nested results).
 - Preserve working pieces while moving files: `src/authProvider.js`, `src/phoneUtils.js`, `src/components/*`, `src/features/students/*`, `src/students/StudentListAside.jsx`.

---

Progress log (current state)
- Completed
   - Created `src/api/dataProvider.js` and wired it into `App.jsx`.
   - Mounted Admin under `/admin` via `src/main.jsx`; default `/` redirects to `/admin`.
   - Moved shared inputs: `NameInput.jsx`, `PhoneInput.jsx` → `src/shared/components/`.
   - Scoped `LicensePlateInput.jsx` under `src/features/vehicles/`.
   - Moved `students/StudentListAside.jsx` → `src/features/students/StudentListAside.jsx`.
   - Extracted Students feature: `StudentList.jsx`, `StudentEdit.jsx`, `StudentCreate.jsx`, `StudentListActions.jsx`, and `index.js` under `src/features/students/`.
   - Centralized validators: `src/shared/validation/validators.js` and updated imports.
   - Extracted Vehicles feature: `VehicleList.jsx`, `VehicleEdit.jsx` (factory), `VehicleCreate.jsx` (factory), and `index.js`.
   - Extracted Instructors feature: `InstructorList.jsx`, `InstructorEdit.jsx`, `InstructorCreate.jsx`, and `index.js`.
   - Updated `src/App.jsx` to consume feature modules for Students, Vehicles, Instructors; removed inline implementations.

- In progress / Next
   - Extract Courses (aka `classes`) into `src/features/courses/` with `CourseList/Edit/Create` and `index.js`.
   - Extract Payments into `src/features/payments/` with `PaymentList/Edit/Create` and `index.js`.
   - Extract Enrollments and Lessons into `src/features/enrollments/` and `src/features/lessons/` respectively.
   - Migrate enums/constants from `src/enums*.js` into `src/constants.js` and `src/shared/constants/drivingSchool.js`; adjust imports.
   - Standardize CSV import/export using a shared `ImportButton` abstraction (later), keeping current functionality intact for now.
   - Defer i18n migration to `i18n.js` until structure is fully stabilized; keep `translations.js`/`LanguageContext.jsx`.
   - Plan cleanup of legacy files (`App.js`, `Root.jsx`, `LandingPage.jsx`, `SignupForm.jsx`, `Login.jsx`, `TestJWT.jsx`) after feature extraction is complete and routes are confirmed.

Validation strategy
- After each extraction, run the dev server and smoke test list/edit/create flows for the affected resource.
- Ensure `dataProvider` mapping (`classes` → `courses`) and pagination keys (`count`, `results`) remain compatible.


Agent execution tasks (do not copy code from reference)
1) Inside `frontend/`, create missing folders: `src/api/`, `src/shared/{components,validation,constants}/`.
2) Implement `src/api/dataProvider.js` using `ra-data-simple-rest` and current JWT from `authProvider.js` (attach `Authorization` header).
3) Update `src/main.jsx` to inject `dataProvider` into React Admin. Keep the current language setup intact.
4) In `src/App.jsx`, register resources via `features/*/index.js`; for now, keep existing student components and wire additional features when available.
5) Move `src/components/*` to `src/shared/components/*` and update imports across the app.
6) Move `src/students/StudentListAside.jsx` to `src/features/students/StudentListAside.jsx` and update imports.
7) Replace `enums.js`/`enumsClient.js` imports with `src/constants.js` (global app-level) and `src/shared/constants/drivingSchool.js` (domain constants, e.g., statuses/categories). Populate from current values.
8) Keep `authProvider.js`, `phoneUtils.js` operational; only adjust import paths if needed.
9) Run the app after each step to ensure no regressions:
   ```pwsh
   cd frontend
   npm run dev
   ```
10) Mount Admin under `/admin` and set default redirect `/` → `/admin`. Unauthenticated users should see the RA login page; after login, unlock all Admin resources.
11) Defer migration to `i18next` (`src/i18n.js`) until the refactor is stable; then port keys from `translations.js` incrementally.
 - Preserve working pieces while moving files: `src/authProvider.js`, `src/phoneUtils.js`, `src/components/*`, `src/features/students/*`, `src/students/StudentListAside.jsx`.

Open questions (please confirm to finalize the refactor)
- Do we keep the custom `Login`/`Signup` screens, or should auth be fully handled via RA `authProvider`/`dataProvider` tokens flow?
- Any non-standard API endpoints or pagination formats we should encode in `src/api/dataProvider.js` (e.g., `results` keys, `count`, custom headers)?
- Should `LicensePlateInput` remain shared or be scoped to `features/vehicles`?
- Are there translations in `translations.js` that need porting to `i18n.js` namespaces?
- Any business constants from `enums*.js` that must live in `shared/constants/drivingSchool.js`?
 - When do you want the `/admin` route mounted (as part of this refactor or a later split)?
