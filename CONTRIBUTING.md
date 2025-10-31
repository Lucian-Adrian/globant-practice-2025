# Contributing to Globant Practice 2025

Thank you for your interest in contributing! This guide will help you understand our development workflow and standards.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Git Workflow](#git-workflow)
3. [Branch Naming](#branch-naming)
4. [Commit Guidelines](#commit-guidelines)
5. [Pull Request Process](#pull-request-process)
6. [Code Style](#code-style)
7. [Testing](#testing)
8. [Documentation](#documentation)

## Getting Started

### Prerequisites

- Docker Desktop installed and running
- Visual Studio Code (recommended)
- Git configured with your name and email

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/Lucian-Adrian/globant-practice-2025
cd globant-practice-2025

# Start the development environment
docker-compose up --build
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/
- Database: localhost:5432

## Git Workflow

We follow a **feature branch workflow** with protected main branch.

### Basic Workflow

1. **Always start from the latest main branch**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes and commit regularly**
   ```bash
   git add .
   git commit -m "type: brief description"
   ```

4. **Keep your branch up to date**
   ```bash
   git checkout main
   git pull origin main
   git checkout feature/your-feature-name
   git merge main
   # Resolve any conflicts if they occur
   ```

5. **Push your branch and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

### When to Create Branches

- **Always** create a new branch for any change, no matter how small
- **Never** commit directly to `main`
- Create branches for:
  - New features
  - Bug fixes
  - Documentation updates
  - Refactoring
  - Dependency updates

## Branch Naming

Use descriptive, lowercase names with hyphens. Follow this pattern:

```
<type>/<short-description>
```

### Branch Types

- `feature/` - New features or enhancements
  - Example: `feature/add-payment-status`
  - Example: `feature/instructor-conflict-validation`

- `fix/` - Bug fixes
  - Example: `fix/lesson-timezone-issue`
  - Example: `fix/payment-status-calculation`

- `docs/` - Documentation only changes
  - Example: `docs/update-api-endpoints`
  - Example: `docs/add-deployment-guide`

- `refactor/` - Code refactoring without changing functionality
  - Example: `refactor/payment-list-performance`
  - Example: `refactor/lesson-serializer`

- `test/` - Adding or updating tests
  - Example: `test/lesson-conflict-validation`
  - Example: `test/payment-api-endpoints`

- `chore/` - Maintenance tasks, dependency updates
  - Example: `chore/update-dependencies`
  - Example: `chore/configure-linter`

### Branch Naming Best Practices

- Keep names short but descriptive (max 50 characters)
- Use hyphens to separate words, not underscores
- Avoid special characters except hyphens
- Reference issue/task IDs when applicable: `feature/P0-STR-01-add-validation`

## Commit Guidelines

Write clear, meaningful commit messages that explain **what** and **why**, not just **how**.

### Commit Message Format

```
<type>: <subject>

[optional body]

[optional footer]
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, no logic change)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Maintenance tasks, dependencies
- `ci` - CI/CD changes

### Subject Line Rules

- Use imperative mood: "add feature" not "added feature"
- Don't capitalize first letter
- No period at the end
- Max 50 characters
- Be specific and descriptive

### Examples

**Good commits:**
```bash
feat: add payment status field to Payment model
fix: resolve instructor conflict validation in lessons
docs: update API endpoint documentation
refactor: optimize PaymentList performance with memoization
test: add unit tests for lesson conflict detection
chore: update Django to version 4.2
```

**Bad commits:**
```bash
Update files           # Too vague
Fixed bug              # Which bug?
WIP                    # Work in progress should not be pushed
asdasd                 # Meaningless
FEAT: PAYMENT STATUS   # Don't use all caps
Added new feature.     # Has period, not imperative
```

### Commit Body (Optional)

Add a body when you need to explain:
- Why the change was needed
- How it addresses the issue
- Any side effects or considerations

```bash
feat: add business timezone support for lesson scheduling

The lesson validation now uses BUSINESS_TZ (Europe/Chisinau) for
availability checks while storing all datetimes in UTC. This ensures
instructors see availability in their local business hours.

Task: P0-STR-01
```

### When to Commit

- **Commit often**: Small, logical chunks
- **Commit working code**: Don't break the build
- **One logical change per commit**: Easier to review and revert
- **Before switching tasks**: Commit current work first

## Pull Request Process

### Before Creating a PR

1. **Ensure your branch is up to date**
   ```bash
   git checkout main
   git pull origin main
   git checkout your-branch
   git merge main
   ```

2. **Run all tests and linters**
   ```bash
   # Backend (from backend/ directory)
   python manage.py test
   black --check .
   ruff check .
   
   # Frontend (from frontend/ directory)
   npm run lint
   npm run build
   ```

3. **Test your changes locally**
   - Start services with `docker-compose up`
   - Manually test the functionality
   - Check for console errors
   - Verify no regressions

### Creating a Pull Request

1. **Push your branch**
   ```bash
   git push origin your-branch-name
   ```

2. **Open PR on GitHub**
   - Go to the repository on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template (if available)

### PR Title Format

Follow the same format as commit messages:

```
type: brief description of the change
```

Examples:
- `feat: add payment status tracking`
- `fix: resolve timezone issues in lesson scheduling`
- `docs: update contributing guidelines`

### PR Description

Include:

1. **Summary**: What does this PR do?
2. **Motivation**: Why is this change needed?
3. **Changes**: Key changes made (bullet list)
4. **Testing**: How was this tested?
5. **Screenshots**: For UI changes (required)
6. **Task Reference**: Link to task ID if applicable (e.g., `P0-STR-01`)

**Template:**
```markdown
## Summary
Brief description of what this PR accomplishes.

## Motivation
Why this change is needed.

## Changes
- Added X feature
- Updated Y component
- Fixed Z issue

## Testing
- [ ] Manual testing completed
- [ ] All tests pass
- [ ] No console errors
- [ ] Tested in Docker environment

## Screenshots
[If UI changes, include before/after screenshots]

## Task Reference
P0-STR-01
```

### PR Review Process

1. **Self-review first**: Review your own changes before requesting review
2. **Request reviewers**: Tag appropriate team members
3. **Respond to feedback**: Address comments promptly and professionally
4. **Update as needed**: Push additional commits to address feedback
5. **Keep PR focused**: One feature/fix per PR
6. **Stay responsive**: Respond to reviews within 24 hours

### PR Approval & Merge

- **Minimum 1 approval** required (project may require more)
- **All CI checks** must pass
- **No merge conflicts** with main
- **Squash and merge** for small PRs (preferred)
- **Merge commit** for feature branches with multiple logical commits
- **Delete branch** after merge

### When NOT to Merge

- Tests are failing
- Linter errors exist
- Unresolved review comments
- Merge conflicts present
- Breaking changes without migration plan

## Code Style

### Python (Backend)

We use **Black**, **isort**, and **Ruff** for Python code.

**Configuration** (see `pyproject.toml`):
- Line length: 100 characters
- Target: Python 3.11
- Profile: Black

**Run formatters:**
```bash
cd backend/
black .
isort .
ruff check . --fix
```

**Pre-commit check:**
```bash
black --check .
ruff check .
```

### JavaScript/React (Frontend)

Follow React and React Admin conventions.

**Key principles:**
- Use functional components and hooks
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable names
- Add PropTypes or TypeScript types
- Keep components small and focused
- Use memoization (`useMemo`, `useCallback`) for performance

**File organization:**
```
src/
├── features/          # Feature-based modules
│   ├── students/
│   │   ├── index.js
│   │   ├── StudentList.jsx
│   │   ├── StudentCreate.jsx
│   │   └── StudentEdit.jsx
├── shared/
│   ├── components/    # Reusable components
│   └── validation/    # Shared validation logic
└── i18n.js           # Internationalization
```

### General Principles

- **DRY**: Don't Repeat Yourself - extract reusable code
- **KISS**: Keep It Simple, Stupid - avoid overengineering
- **Clear naming**: Variables and functions should be self-documenting
- **Comments**: Explain "why", not "what"
- **Consistent style**: Follow existing patterns in the codebase

## Testing

### Backend Tests

Located in `backend/school/tests/`.

**Run tests:**
```bash
cd backend/
python manage.py test
```

**Writing tests:**
- Test all new features and bug fixes
- Use Django's TestCase or APITestCase
- Test both success and error cases
- Test edge cases and validation
- Mock external dependencies

**Example:**
```python
from django.test import TestCase
from school.models import Student

class StudentModelTest(TestCase):
    def test_student_creation(self):
        student = Student.objects.create(
            first_name="John",
            last_name="Doe",
            phone="+37312345678"
        )
        self.assertEqual(student.first_name, "John")
```

### Frontend Tests

Testing infrastructure is minimal currently. For critical features:

- **Manual testing**: Essential for all UI changes
- **Test in Docker**: Ensure it works in the containerized environment
- **Cross-browser testing**: Test in Chrome, Firefox, Safari (if possible)

### Test Requirements

Before submitting PR:
- [ ] All existing tests pass
- [ ] New tests added for new features
- [ ] Edge cases covered
- [ ] No console errors
- [ ] Manual testing completed

## Documentation

### When to Update Documentation

Update docs when you:
- Add new features
- Change API endpoints
- Modify setup/deployment process
- Change configuration
- Add dependencies
- Discover common issues

### Documentation Locations

- `README.md` - Setup and quick start
- `CONTRIBUTING.md` - This file
- `CHANGELOG.md` - All notable changes (update this!)
- `docs/` - Additional documentation
- Code comments - For complex logic

### Updating CHANGELOG.md

**Always update** `CHANGELOG.md` with your changes!

Add entries under `## [Unreleased]` in appropriate sections:
- `### Added` - New features
- `### Changed` - Changes to existing functionality
- `### Fixed` - Bug fixes
- `### Removed` - Removed features

**Format:**
```markdown
### Added
- Payment status field to Payment model with enum choices
- Comprehensive React Admin translations in EN, RO, RU
```

### API Documentation

API schema and docs auto-generate from Django REST Framework:
- Schema: `http://localhost:8000/api/schema/`
- Swagger: `http://localhost:8000/api/docs/swagger/`
- ReDoc: `http://localhost:8000/api/docs/redoc/`

Keep docstrings updated in serializers and viewsets.

## Additional Guidelines

### Dependencies

**When adding dependencies:**

1. **Check necessity**: Do we really need this package?
2. **Check security**: Any known vulnerabilities?
3. **Check maintenance**: Is it actively maintained?
4. **Update requirements**:
   ```bash
   # Python
   cd backend/
   pip install package-name
   pip freeze > requirements.txt
   
   # JavaScript
   cd frontend/
   npm install --save package-name
   ```
5. **Document why**: Add comment in requirements file if non-obvious

### Environment Variables

- Never commit secrets or credentials
- Use `.env` files (already gitignored)
- Document all environment variables in README

### Database Migrations

**Backend migrations:**
```bash
cd backend/
python manage.py makemigrations
python manage.py migrate
```

**Include migrations in your PR** - Don't let others recreate them

### Troubleshooting

**Clean slate:**
```bash
docker-compose down -v
docker-compose up --build
```

**Reset database:**
```bash
docker-compose down -v
docker volume rm globant-practice-2025_postgres_data
docker-compose up --build
```

## Getting Help

- Check existing documentation first
- Review similar PRs and issues
- Ask in team communication channels
- Tag maintainers on GitHub for complex issues

## Code of Conduct

- Be respectful and professional
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow
- Celebrate wins together

---

**Thank you for contributing! 🎉**

Your contributions make this project better for everyone.
