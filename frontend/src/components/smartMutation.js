// Centralized error helpers and mutation options for React-Admin mutations
// Policy: suppress toasts for field-level validation errors (400/409/422 with field maps)
// so inline errors can render under the corresponding inputs. Show toasts for global errors.

import { useNotify, useRedirect } from 'react-admin';
import { useFormErrorBridge } from './SmartCrudWrappers';

// Returns true only when RA-style body.errors exists and has keys.
// We depend on httpClient to map DRF field maps into body.errors.
export function isFieldValidationError(error) {
  const status = error?.status;
  if (![400, 409, 422].includes(Number(status))) return false;
  const errors = error?.body?.errors;
  return !!(errors && typeof errors === 'object' && Object.keys(errors).length > 0);
}

// Derive a readable top-level message for toasts/fallbacks
export function getTopMessage(error) {
  if (!error) return 'Request failed';
  const statusText = error?.statusText || error?.message || '';
  const body = error?.body;
  if (typeof error?.message === 'string' && error.message.trim()) return error.message.trim();
  if (body && typeof body === 'object') {
    if (typeof body.message === 'string' && body.message.trim()) return body.message.trim();
    if (typeof body.detail === 'string' && body.detail.trim()) return body.detail.trim();
    for (const [k, v] of Object.entries(body)) {
      if (k === 'message' || k === 'detail') continue;
      if (Array.isArray(v)) {
        const first = v.find((x) => typeof x === 'string' && x.trim());
        if (first) return first.trim();
      }
      if (typeof v === 'string' && v.trim()) return v.trim();
    }
  }
  const status = Number(error?.status || 0);
  if (status >= 500) return 'A server error occurred. Please try again.';
  return statusText || 'Request failed';
}

// Hook returning mutationOptions that implement the toast policy above
export function useSmartMutationOptions({ successMessage, bridge, redirectTarget } = {}) {
  const notify = useNotify();
  const redirect = useRedirect();
  // Prefer injected bridge (from wrappers). Fall back to context hook if available.
  const contextBridge = useFormErrorBridge?.() || {};
  const applyServerErrorsRef = bridge?.applyServerErrorsRef || contextBridge.applyServerErrorsRef;
  const clearServerErrorsRef = bridge?.clearServerErrorsRef || contextBridge.clearServerErrorsRef;
  return {
    onError: (error) => {
      if (isFieldValidationError(error)) {
        // Do NOT show a toast for validation errors
        // Also push server errors into RHF so formState.isValid stays false until fixed
        const map = error?.body?.errors;
        const applier = applyServerErrorsRef?.current;
        if (applier && map) applier(map);
        return;
      }
      const msg = getTopMessage(error);
      const status = Number(error?.status || 0);
      const type = status >= 500 ? 'error' : 'warning';
      notify(msg, { type });
    },
    onSuccess: (data) => {
      // Clear server errors and show a success toast (defaulting when none provided)
      const clearer = clearServerErrorsRef?.current;
      if (clearer) clearer();
      notify(successMessage ?? (data && data.id ? 'Saved successfully' : 'Element created'), { type: 'info' });
      // Handle redirect ourselves to avoid double toasts and ensure navigation
      if (redirectTarget !== false) {
        redirect(redirectTarget ?? 'list');
      }
    },
  };
}
