# Driving School Admin (React Admin)

Vite + React Admin UI for the Django backend.
Dev server runs on http://localhost:3000 and proxies /api to http://backend:8000 inside Docker.

## Scripts
- npm start: start Vite dev server on port 3000
- npm run build: build static assets
- npm run preview: preview build

## Docker
Service name: `frontend` (builds from this folder). It depends on `backend` and is reachable at http://localhost:3000.

## Refactor & Structure (2025 Migration)

### Current Layout
- `src/features/` – Domain & portal features (`students`, `vehicles`, `instructors`, `courses`, `payments`, `enrollments`, `lessons`, `portal/SignupForm.jsx`).
- `src/api/` – React Admin `dataProvider` & API helpers.
- `src/shared/` – Reusable UI components & validation utilities.
- `src/i18n.js` – i18next initialization with EN / RO / RU resources (migrated from legacy `translations.js`).

### Removed Legacy Files
Eliminated after successful migration to feature + i18n structure:
- `App.js`, `Root.jsx`, `LandingPage.jsx` (obsolete routing shells)
- `SignupForm.jsx` (moved to `features/portal/SignupForm.jsx`)
- `translations.js` & `LanguageContext.jsx` (replaced by i18next)
- `Login.jsx`, `TestJWT.jsx` (debug helpers superseded by RA auth & JWT endpoints)

### Routing
- `/` → Student portal signup form (portal feature)
- `/signup` → Alias to the same form
- `/admin/*` → React Admin application (resources & auth)

### i18n Usage
Example:
```jsx
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
<h2>{t('signupTitle')}</h2>
```
To add translations: extend the language objects in `src/i18n.js`.

### Follow‑Up Ideas
- Split portal translations into a dedicated namespace if they grow.
- Add Cypress/Jest smoke tests for signup + core CRUD flows.
- Centralize form validation messages for reuse across admin & portal.
