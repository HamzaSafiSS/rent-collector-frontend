import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import App from './App';
import './index.css';
// Prevent unhandled promise rejections (e.g. from failed refresh on mount)
// from crashing the entire React tree
window.addEventListener('unhandledrejection', (event) => {
  // Suppress auth-related rejections — these are handled by AuthContext
  const message = event.reason?.message || '';
  if (
    message.includes('refresh') ||
    message.includes('token') ||
    message.includes('401') ||
    message.includes('403')
  ) {
    event.preventDefault();
    console.warn('Suppressed auth rejection:', message);
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);