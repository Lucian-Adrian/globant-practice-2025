# Driving School Admin (React Admin)

Vite + React Admin UI for the Django backend.
Dev server runs on http://localhost:3000 and proxies /api to http://backend:8000 inside Docker.

## Scripts
- npm start: start Vite dev server on port 3000
- npm run build: build static assets
- npm run preview: preview build

## Docker
Service name: `frontend` (builds from this folder). It depends on `backend` and is reachable at http://localhost:3000.