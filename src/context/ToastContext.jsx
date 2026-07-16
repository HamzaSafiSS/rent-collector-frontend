import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, duration)  => addToast(msg, 'success', duration),
    error:   (msg, duration)  => addToast(msg, 'error',   duration ?? 6000),
    warning: (msg, duration)  => addToast(msg, 'warning', duration),
    info:    (msg, duration)  => addToast(msg, 'info',    duration),
    dismiss: removeToast,
  };

  const styles = {
    success: 'bg-green-600',
    error:   'bg-red-600',
    warning: 'bg-yellow-500',
    info:    'bg-blue-600',
  };

  const icons = {
    success: '✓',
    error:   '✕',
    warning: '⚠',
    info:    'ℹ',
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
              text-white text-sm font-medium min-w-[280px] max-w-sm
              pointer-events-auto animate-slide-in
              ${styles[t.type] || styles.info}
            `}
          >
            <span className="font-bold text-base flex-shrink-0" aria-hidden="true">
              {icons[t.type]}
            </span>
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              aria-label="Dismiss notification"
              className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1 focus:ring-offset-transparent rounded"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}