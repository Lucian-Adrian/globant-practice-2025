# Refactor Archive (Frontend)

This document records movements & removals performed during the 2025 structure cleanup.

## Moved
| Original | New |
|----------|-----|
| `src/authProvider.js` | `src/auth/authProvider.js` |
| `src/enumsClient.js` | `src/api/enumsClient.js` |
| `src/i18n.js` | `src/i18n/index.js` |
| `src/phoneUtils.js` | `src/shared/utils/phone.js` |
| `src/constants.js` | `src/shared/constants/app.js` |
| `src/App.jsx` | `src/app/App.jsx` |
| `src/SignupForm.jsx` | `src/features/portal/SignupForm.jsx` (earlier step) |

## Removed (obsolete / replaced)
| File | Reason |
|------|--------|
| `App.js` | Legacy placeholder / no longer referenced |
| `Root.jsx` | Superseded by simplified `main.jsx` router |
| `LandingPage.jsx` | Portal root consolidated into signup route |
| `Login.jsx` | Debug auth UI (React Admin handles auth) |
| `TestJWT.jsx` | JWT debug console removed for production lean build |
| `translations.js` | Migrated to i18next resources in `i18n/index.js` |
| `LanguageContext.jsx` | Replaced by i18next provider-less init |
| `enums.js` | Static enums replaced by dynamic `/api/meta/enums/` fetch |

## Notes
- Imports updated to reflect new relative paths.
- React Admin `App` moved under `src/app/` for clarity.
- All phone utilities now centralized under `shared/utils/phone.js`.
- If future namespaces are added for translations, split `i18n/index.js` resources accordingly.
