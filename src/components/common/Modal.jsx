import { useEffect, useRef } from 'react';

export default function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  position = 'center',
  children,
  footer,
}) {
  const dialogRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Focus the dialog when it opens
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [isOpen]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' };

  const positions = {
    center: 'items-center justify-center p-4 sm:p-6',
    medium: 'items-center justify-center p-4 sm:p-6',
    top: 'items-start justify-center p-4 pt-10 sm:p-6 sm:pt-12',
    bottom: 'items-end sm:items-center justify-center p-0 sm:p-6',
  };

  const cardRounded = {
    bottom: 'rounded-t-3xl sm:rounded-2xl',
    center: 'rounded-2xl',
    medium: 'rounded-2xl',
    top: 'rounded-2xl',
  };

  const currentPos = positions[position] || positions.center;
  const currentRadius = cardRounded[position] || cardRounded.center;

  return (
    <div
      className={`fixed inset-0 z-50 flex ${currentPos} bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-slide-in`}
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className={`relative w-full ${widths[size] || widths.md} bg-white dark:bg-[#111827] ${currentRadius} shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[90vh] focus:outline-none border border-slate-200 dark:border-slate-700/50`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-700/50">
          <h2 id="modal-title" className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {footer !== undefined ? footer : (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/30 rounded-b-2xl flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600/50 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}