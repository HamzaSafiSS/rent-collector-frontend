import { useRef, useState } from 'react';

const DEFAULT_ACCEPT = 'image/jpeg,image/png,application/pdf';
const DEFAULT_MAX_MB = 10;

export default function FileUpload({
  onFileSelect,
  accept = DEFAULT_ACCEPT,
  maxSizeMB = DEFAULT_MAX_MB,
  label = 'Upload File',
  className = '',
}) {
  const inputRef              = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError]               = useState(null);
  const [dragging, setDragging]         = useState(false);

  function handleFile(file) {
    if (!file) return;
    setError(null);

    // Validate MIME type
    const allowed = accept.split(',').map((t) => t.trim());
    if (!allowed.includes(file.type)) {
      setError(`Invalid file type. Allowed: JPEG, PNG, PDF.`);
      return;
    }

    // Validate size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      setError(`File too large. Maximum size is ${maxSizeMB}MB.`);
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
        <label className="block text-sm font-medium text-slate-700 mb-1">
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
            ? 'border-blue-400 bg-blue-50'
            : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}
        `}
      >
        {/* Upload icon */}
        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>

        {selectedFile ? (
          <div className="text-center">
            <p className="text-sm font-medium text-blue-700">{selectedFile.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-slate-600">
              <span className="font-medium text-blue-600">Click to upload</span>
              {' '}or drag and drop
            </p>
            <p className="text-xs text-slate-400 mt-1">JPEG, PNG, PDF — max {maxSizeMB}MB</p>
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
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}