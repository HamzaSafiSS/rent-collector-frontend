export default function Input({
  label, error, hint, className = '', id, required, ...props
}) {
  const inputId    = id || label?.toLowerCase().replace(/\s+/g, '-');
  const errorId    = error ? `${inputId}-error` : undefined;
  const hintId     = hint  ? `${inputId}-hint`  : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;
  const errorClass = error ? inputError : '';

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        aria-required={required}
        className={`${inputBase} ${errorClass} ${className}`}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-red-600">{error}</p>
      )}
      {hint && !error && (
        <p id={hintId} className="mt-1 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}