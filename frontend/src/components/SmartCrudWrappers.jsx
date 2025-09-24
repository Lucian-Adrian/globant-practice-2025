import React from 'react';
import { Create, Edit, SimpleForm } from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { useSmartMutationOptions } from './smartMutation';

// Bridge RA server-side errors (error.body.errors) into react-hook-form state
// so formState.errors and isValid reflect server errors.
const FormErrorBridgeContext = React.createContext({
  applyServerErrorsRef: { current: null },
  clearServerErrorsRef: { current: null },
});

export const useFormErrorBridge = () => React.useContext(FormErrorBridgeContext);

// Registrar that captures RHF setError/clearErrors and registers bridge fns
export const FormErrorBridgeRegister = () => {
  const ctx = React.useContext(FormErrorBridgeContext);
  const { setError, clearErrors, getValues, watch, formState } = useFormContext();
  // Track fields that currently have server-side errors and the value that triggered them
  const serverErrorsRef = React.useRef({});

  // Register bridge functions so onError handlers can push server errors into RHF
  React.useEffect(() => {
    if (ctx?.applyServerErrorsRef) {
      ctx.applyServerErrorsRef.current = (errorsMap) => {
        if (!errorsMap || typeof errorsMap !== 'object') return;

        Object.entries(errorsMap).forEach(([field, message]) => {
          const msg = Array.isArray(message) ? message[0] : message;
          const valueNow = getValues(field);
          if (msg != null) {
            serverErrorsRef.current[field] = { message: String(msg), valueAtError: valueNow };
            setError(field, { type: 'server', message: String(msg) }, { shouldFocus: false });
          }
        });
      };
    }
    if (ctx?.clearServerErrorsRef) {
      ctx.clearServerErrorsRef.current = () => {
        serverErrorsRef.current = {};
        clearErrors();
      };
    }
  }, [ctx, setError, clearErrors, getValues]);

  // Watch form values; keep server errors asserted until the offending field value changes
  const allValues = watch();
  React.useEffect(() => {
    const entries = Object.entries(serverErrorsRef.current);
    if (entries.length === 0) return;
    entries.forEach(([field, meta]) => {
      const current = getValues(field);
      if (current === meta.valueAtError) {
        // Re-assert server error so RHF keeps it in formState.errors
        setError(field, { type: 'server', message: meta.message }, { shouldFocus: false });
      } else {
        // User changed the field; clear the server error and let client validation run
        delete serverErrorsRef.current[field];
        clearErrors(field);
      }
    });
  }, [allValues, getValues, setError, clearErrors]);

  // Clear server errors immediately when user edits the corresponding field
  React.useEffect(() => {
    const subscription = watch((_, { name }) => {
      if (name && formState?.errors?.[name]?.type === 'server') {
        // Stop reasserting and clear the error for this field; client validators will run
        delete serverErrorsRef.current[name];
        clearErrors(name);
      }
    });
    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, [watch, clearErrors, formState?.errors]);

  return null;
};

// Thin wrappers that only inject mutationOptions. All other props are passed through unchanged.
export const CreateSmart = ({ successMessage, mutationOptions, children, ...rest }) => {
  const applyServerErrorsRef = React.useRef(null);
  const clearServerErrorsRef = React.useRef(null);
  const bridge = { applyServerErrorsRef, clearServerErrorsRef };

  // Determine redirectTarget from SimpleForm child props (if any)
  const getRedirectTarget = (child) => {
    if (!React.isValidElement(child)) return undefined;
    const typeName = child.type?.displayName || child.type?.name;
    const isSimpleForm = child.type === SimpleForm || typeName === 'SimpleForm' || (typeName && typeName.includes('SimpleForm'));
    return isSimpleForm ? child.props.redirect : undefined;
  };
  const redirectTarget = getRedirectTarget(children);
  const smart = useSmartMutationOptions({ successMessage, bridge, redirectTarget });
  const merged = { ...(mutationOptions || {}), ...smart };

  const injectRegistrarIntoSimpleForm = (child) => {
    if (!React.isValidElement(child)) return child;
    const typeName = child.type?.displayName || child.type?.name;
    const isSimpleForm = child.type === SimpleForm || typeName === 'SimpleForm' || (typeName && typeName.includes('SimpleForm'));
    if (!isSimpleForm) return child; // Defensive: only inject into SimpleForm
    return React.cloneElement(child, {
      ...child.props,
      // Ensure RHF defaults so validity recomputes while typing
      mode: child.props.mode ?? 'onChange',
      reValidateMode: child.props.reValidateMode ?? 'onChange',
      shouldUnregister: child.props.shouldUnregister ?? false,
      children: (
        <>
          <FormErrorBridgeRegister />
          {child.props.children}
        </>
      ),
    });
  };

  const renderedChildren = injectRegistrarIntoSimpleForm(children);

  return (
    <FormErrorBridgeContext.Provider value={bridge}>
      {/* Force pessimistic so RA waits for server response and can display inline errors */}
      <Create {...rest} mutationOptions={merged} mutationMode="pessimistic">
        {renderedChildren}
      </Create>
    </FormErrorBridgeContext.Provider>
  );
};

export const EditSmart = ({ successMessage, mutationOptions, children, ...rest }) => {
  const applyServerErrorsRef = React.useRef(null);
  const clearServerErrorsRef = React.useRef(null);
  const bridge = { applyServerErrorsRef, clearServerErrorsRef };

  const getRedirectTarget = (child) => {
    if (!React.isValidElement(child)) return undefined;
    const typeName = child.type?.displayName || child.type?.name;
    const isSimpleForm = child.type === SimpleForm || typeName === 'SimpleForm' || (typeName && typeName.includes('SimpleForm'));
    return isSimpleForm ? child.props.redirect : undefined;
  };
  const redirectTarget = getRedirectTarget(children);
  const smart = useSmartMutationOptions({ successMessage, bridge, redirectTarget });
  const merged = { ...(mutationOptions || {}), ...smart };

  const injectRegistrarIntoSimpleForm = (child) => {
    if (!React.isValidElement(child)) return child;
    const typeName = child.type?.displayName || child.type?.name;
    const isSimpleForm = child.type === SimpleForm || typeName === 'SimpleForm' || (typeName && typeName.includes('SimpleForm'));
    if (!isSimpleForm) return child;
    return React.cloneElement(child, {
      ...child.props,
      // Ensure RHF defaults so validity recomputes while typing
      mode: child.props.mode ?? 'onChange',
      reValidateMode: child.props.reValidateMode ?? 'onChange',
      shouldUnregister: child.props.shouldUnregister ?? false,
      children: (
        <>
          <FormErrorBridgeRegister />
          {child.props.children}
        </>
      ),
    });
  };

  const renderedChildren = injectRegistrarIntoSimpleForm(children);

  return (
    <FormErrorBridgeContext.Provider value={bridge}>
      {/* Force pessimistic so RA waits for server response and can display inline errors */}
      <Edit {...rest} mutationOptions={merged} mutationMode="pessimistic">
        {renderedChildren}
      </Edit>
    </FormErrorBridgeContext.Provider>
  );
};

export default { CreateSmart, EditSmart };
