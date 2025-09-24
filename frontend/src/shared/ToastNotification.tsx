import * as React from "react";
import { useState, useContext, createContext, useEffect } from "react";

// Types for notifications
export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
  icon?: React.ReactNode;
}

// Toast Context
interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Inline icons
const iconProps = "tw-w-5 tw-h-5";

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconProps} {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const XCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconProps} {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M15 9l-6 6" />
    <path d="M9 9l6 6" />
  </svg>
);

const AlertTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconProps} {...props}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const InfoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconProps} {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="tw-w-4 tw-h-4" {...props}>
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

// Toast Component
const ToastComponent: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Show animation
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto remove
    const removeTimer = setTimeout(() => {
      handleRemove();
    }, toast.duration || 5000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getToastStyles = () => {
    const baseStyles = "tw-flex tw-items-start tw-gap-3 tw-p-4 tw-rounded-lg tw-border tw-shadow-lg tw-backdrop-blur-sm tw-transition-all tw-duration-300 tw-min-w-80 tw-max-w-md";
    
    if (isRemoving) {
      return `${baseStyles} tw-transform tw-translate-x-full tw-opacity-0`;
    }
    
    if (!isVisible) {
      return `${baseStyles} tw-transform tw-translate-x-full tw-opacity-0`;
    }

    switch (toast.type) {
      case 'success':
        return `${baseStyles} tw-bg-green-50 tw-border-green-200 tw-text-green-800`;
      case 'error':
        return `${baseStyles} tw-bg-red-50 tw-border-red-200 tw-text-red-800`;
      case 'warning':
        return `${baseStyles} tw-bg-yellow-50 tw-border-yellow-200 tw-text-yellow-800`;
      case 'info':
        return `${baseStyles} tw-bg-blue-50 tw-border-blue-200 tw-text-blue-800`;
      default:
        return `${baseStyles} tw-bg-gray-50 tw-border-gray-200 tw-text-gray-800`;
    }
  };

  const getIcon = () => {
    if (toast.icon) return toast.icon;
    
    switch (toast.type) {
      case 'success':
        return <CheckCircleIcon className="tw-text-green-600" />;
      case 'error':
        return <XCircleIcon className="tw-text-red-600" />;
      case 'warning':
        return <AlertTriangleIcon className="tw-text-yellow-600" />;
      case 'info':
        return <InfoIcon className="tw-text-blue-600" />;
      default:
        return <InfoIcon className="tw-text-gray-600" />;
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className="tw-flex-shrink-0">
        {getIcon()}
      </div>
      <div className="tw-flex-1 tw-min-w-0">
        <h4 className="tw-font-semibold tw-text-sm tw-mb-1">{toast.title}</h4>
        <p className="tw-text-sm tw-opacity-90">{toast.message}</p>
      </div>
      <button
        onClick={handleRemove}
        className="tw-flex-shrink-0 tw-p-1 tw-rounded tw-hover:bg-black/10 tw-transition-colors"
      >
        <XIcon />
      </button>
    </div>
  );
};

// Toast Container
const ToastContainer: React.FC<{ toasts: Toast[]; onRemove: (id: string) => void }> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="tw-fixed tw-top-4 tw-right-4 tw-z-[9999] tw-space-y-2">
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

// Toast Provider
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearToasts = () => {
    setToasts([]);
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// Helper functions for common toast types
export const showSuccessToast = (addToast: ToastContextType['addToast'], title: string, message: string) => {
  addToast({
    type: 'success',
    title,
    message,
    duration: 4000
  });
};

export const showErrorToast = (addToast: ToastContextType['addToast'], title: string, message: string) => {
  addToast({
    type: 'error',
    title,
    message,
    duration: 6000
  });
};

export const showWarningToast = (addToast: ToastContextType['addToast'], title: string, message: string) => {
  addToast({
    type: 'warning',
    title,
    message,
    duration: 5000
  });
};

export const showInfoToast = (addToast: ToastContextType['addToast'], title: string, message: string) => {
  addToast({
    type: 'info',
    title,
    message,
    duration: 4000
  });
};
