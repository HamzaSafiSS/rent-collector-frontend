import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const DEFAULT_ACCEPT = 'image/jpeg,image/png,application/pdf';
const DEFAULT_MAX_MB = 10;

export default function FileUpload({
  onFileSelect,
  accept = DEFAULT_ACCEPT,
  maxSizeMB = DEFAULT_MAX_MB,
  label,
  className = '',
  required = false,
}) {
  const { t }                           = useTranslation();
  const inputRef                        = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError]               = useState(null);
  const [dragging, setDragging]         = useState(false);

  function handleFile(file) {
    if (!file) return;
    setError(null);

    // Validate MIME type
    const allowed = accept.split(',').map((t) => t.trim());
    if (!allowed.includes(file.type)) {
      setError(t('validation.invalidFileType'));
      return;
    }

    // Validate size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      setError(t('validation.fileTooLarge', { size: maxSizeMB }));
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  }

  function handleInputChange(e) {
    handleFile(e.target.files[0]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {required && <span className="text-red-400 mr-1" aria-hidden="true">*</span>}
          {label}
        </label>
      )}

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6
          flex flex-col items-center justify-center gap-2
          cursor-pointer transition-colors duration-150
          ${dragging
            ? 'border-emerald-400 bg-emerald-500/5'
            : 'border-slate-300 dark:border-slate-600 hover:border-emerald-400/50 hover:bg-slate-50 dark:hover:bg-slate-800/50'}
        `}
      >
        {/* Upload icon */}
        <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>

        {selectedFile ? (
          <div className="text-center">
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{selectedFile.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              <span className="font-medium text-emerald-600 dark:text-emerald-400">{t('fileUpload.clickToUpload')}</span>
              {' '}{t('fileUpload.orDragDrop')}
            </p>
            <p className="text-xs text-slate-500 mt-1">{t('fileUpload.fileFormats', { size: maxSizeMB })}</p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="sr-only"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="mt-1.5 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}