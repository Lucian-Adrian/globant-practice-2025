# Repository instructions for AI coding agents

Ask questions for clarity.
Ask questions for context.
Ask questions for instructions and to understand the task better.

This file gives concise, actionable guidance for AI coding agents working on this repo (full-stack Django + React Admin driving school management system).

## Architecture Overview

**Backend**: Django 5.2 + DRF + PostgreSQL under `backend/` (entry: `manage.py`, settings: `project/settings.py`, API: `school/api.py`)
**Frontend**: React Admin SPA under `frontend/` (entry: `src/main.jsx`, admin app: `src/app/App.jsx`)
**Database**: PostgreSQL with Docker Compose orchestration
**Deployment**: Containerized with hot reloading for development

## Critical Developer Workflows

### Full Development Environment
```bash
# Start all services (PostgreSQL + Django + React)
docker-compose up --build

# Services available at:
# - Frontend: http://localhost:3000 (Vite dev server)
# - Backend API: http://localhost:8000/api/
# - Database: localhost:5432
```

### Backend Development
```bash
# Run Django server (from backend/ directory)
python manage.py runserver 0.0.0.0:8000

# Create migrations
python manage.py makemigrations

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### Frontend Development
```bash
# Install dependencies
npm install

# Start dev server
npm run dev  # or npm start

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project-Specific Conventions & Patterns

### Feature Organization (Frontend)
Each resource follows identical structure under `src/features/<resource>/`:
- `index.js`: Exports List/Edit/Create components
- `*List.jsx`: Main listing with filters/search
- `*Edit.jsx`: Edit form with validation
- `*Create.jsx`: Create form
- Optional: `*ListAside.jsx`, `*ListActions.jsx`

**Example**: `src/features/students/index.js`
```javascript
export { default as StudentList } from './StudentList';
export { default as StudentEdit } from './StudentEdit';
export { default as StudentCreate } from './StudentCreate';
```

### React Admin Integration
- Resources registered in `src/app/App.jsx` with dataProvider/authProvider
- Data flows through `src/api/dataProvider.js` (adapts ra-data-simple-rest)
- Authentication via `src/auth/authProvider.js`
- Dynamic enums fetched via `src/api/enumsClient.js`

### Phone Number Handling
Standardized across frontend using `libphonenumber-js`:
- Validation: `src/shared/validation/validators.js`
- Components: `src/shared/components/PhoneFieldRA.jsx`
- Backend: `school/validators.py` with `normalize_phone()`

### CSV Import/Export
Uses `papaparse` library:
- Import: `src/shared/components/ImportButton.jsx`
- Export: Backend API endpoints with `@action` decorators
- Expected columns defined per resource

### Internationalization (i18n)
- Config: `src/i18n.js` with EN/RO/RU locales
- Usage: `const { t } = useTranslation(); <h1>{t('key')}</h1>`
- Extend language objects in `src/i18n.js` for new keys

### Validation Patterns
- Frontend: `src/shared/validation/validators.js` + `raValidators.js`
- Backend: `school/validators.py` with Django validators
- Phone validation assumes +373 (Moldova) default country code

## Integration Points

### API Communication
- Frontend proxies to `http://backend:8000` in Docker
- REST endpoints: `/api/students/`, `/api/instructors/`, etc.
- OpenAPI docs: `http://localhost:8000/api/docs/swagger/`
- Dynamic enums: `http://localhost:8000/api/meta/enums/`

### Authentication Flow
- Admin panel: `/admin/*` (React Admin auth)
- Student portal: `/` routes (separate JWT tokens)
- Token storage: `localStorage` with `student_access_token`

## Key Files & Directories

- `backend/school/models.py`: Core data models with enums
- `backend/school/api.py`: DRF viewsets with FullCrudViewSet
- `frontend/src/app/App.jsx`: React Admin resource registration
- `frontend/src/features/`: Feature-based component organization
- `frontend/src/shared/`: Reusable components and utilities
- `frontend/src/api/dataProvider.js`: API integration layer
- `docker-compose.yml`: Complete development environment

## Development Standards

### Git Workflow
- Feature branches from `main`: `feature/description`
- Protected main branch, PR reviews required
- Commit messages: `type: description` (e.g., `feat: add payment status`)

### Code Quality
- ESLint/Prettier configured in frontend
- Django migrations for schema changes
- No frontend tests yet (Jest + RTL planned)
- Backend tests in `school/tests/`

### Business Rules
- Currency: MDL (Moldovan Leu)
- Phone country: +373 (Moldova)
- Timezone: UTC (with local timezone considerations)
- Student lifecycle: PENDING → ACTIVE → GRADUATED

## Common Tasks

### Add New Resource
1. Create `src/features/<resource>/` with standard components
2. Add to `src/app/App.jsx`: `<Resource name="resource" ... />`
3. Create backend model in `school/models.py`
4. Add API endpoints in `school/api.py`
5. Run migrations: `python manage.py makemigrations && python manage.py migrate`

### Add Form Validation
1. Add validators to `src/shared/validation/validators.js`
2. Import in component: `validate={myValidator}`
3. Backend validation in `school/validators.py`

### Add Translation
1. Add keys to language objects in `src/i18n.js`
2. Use in component: `const { t } = useTranslation(); {t('myKey')}`

ALWAYS CHECK CONTRIBUTING.md AND PROJECT-SPECIFIC GUIDELINES IF PRESENT.




## Development Guidelines


### Documentation First
- Document new features in the appropriate `docs/` subdirectory before implementation
- Update `changelog.md` with notable changes using semantic versioning
- Keep `docs/file_structure.md` current as the codebase evolves


### Code Organization
- Backend code → document in `docs/backend/`
- Frontend code → document in `docs/frontend/`
- Database changes → document in `docs/db/`
- Track milestones in `docs/progress/`


### Contribution Workflow
- Follow patterns documented in `contributing.md`
- Use descriptive commit messages referencing the affected component (e.g., `[backend] Add user authentication`)


## Notes for AI Agents


- This is a greenfield project - prioritize clean, maintainable patterns from the start
- When creating new components, update `docs/file_structure.md` accordingly
- Prefer Romanian language for user-facing content where appropriate (Moldova context)




Criteria to write code:
KiSS
OOP
DRY
SOLID
Separation of Concerns
Modularity
Readability
clean code
open-closed principle