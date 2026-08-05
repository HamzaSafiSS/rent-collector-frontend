import { useState } from 'react';
import { inputBase, inputError } from './styles';

export default function Input({
  label, error, hint, className = '', id, required, type, ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId    = id || label?.toLowerCase().replace(/\s+/g, '-');
  const errorId    = error ? `${inputId}-error` : undefined;
  const hintId     = hint  ? `${inputId}-hint`  : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;
  const errorClass = error ? inputError : '';
  const inputType  = type === 'password' ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium leading-none text-slate-700 dark:text-slate-300 mb-2"
        >
          {required && <span className="text-red-500 dark:text-red-400 mr-1" aria-hidden="true">*</span>}
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={inputType}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          aria-required={required}
          required={required}
          className={`${inputBase} ${errorClass} ${className} ${type === 'password' ? 'pr-10' : ''}`}
          {...props}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            tabIndex="-1"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
      {hint && !error && (
        <p id={hintId} className="mt-1 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}