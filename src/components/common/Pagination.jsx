import { useTranslation } from 'react-i18next';
import Button from './Button';

export default function Pagination({
  page,
  totalPages,
  totalElements,
  size,
  onPageChange,
}) {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;

  const from = page * size + 1;
  const to   = Math.min((page + 1) * size, totalElements);

  // Limit visible page numbers to 2 only, always keeping current page visible
  const getVisiblePages = () => {
    if (totalPages <= 2) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }
    let start = page;
    if (start >= totalPages - 1) {
      start = totalPages - 2;
    }
    return [start, start + 1];
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 py-3 px-1 sm:px-2">
      {/* Info text */}
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center sm:text-left">
        {t('common.showing')} <span className="font-medium text-slate-800 dark:text-slate-200">{from}–{to}</span>{' '}
        {t('common.of')} <span className="font-medium text-slate-800 dark:text-slate-200">{totalElements}</span> {t('common.results')}
      </p>

      {/* Page buttons */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          className="!px-2.5 sm:!px-3 !py-1 sm:!py-1.5 !text-xs sm:!text-sm font-medium"
        >
          {t('common.previous')}
        </Button>

        {/* Page numbers — limited to 2 only */}
        {visiblePages.map((i) => (
          <button
            key={i}
            onClick={() => onPageChange(i)}
            className={`
              w-7 h-7 sm:w-8 sm:h-8 rounded text-xs sm:text-sm font-medium transition-colors
              ${i === page
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}
            `}
          >
            {i + 1}
          </button>
        ))}

        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          className="!px-2.5 sm:!px-3 !py-1 sm:!py-1.5 !text-xs sm:!text-sm font-medium"
        >
          {t('common.next')}
        </Button>
      </div>
    </div>
  );
}