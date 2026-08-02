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

  return (
    <div className="flex items-center justify-between py-3 px-1">
      {/* Info text */}
      <p className="text-sm text-slate-500">
        {t('common.showing')} <span className="font-medium text-slate-300">{from}–{to}</span>{' '}
        {t('common.of')} <span className="font-medium text-slate-300">{totalElements}</span> {t('common.results')}
      </p>

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="secondary"
          size="sm"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
        >
          {t('common.previous')}
        </Button>

        {/* Page numbers — show up to 5 centered around current page */}
        {Array.from({ length: totalPages }, (_, i) => i)
          .filter((i) => Math.abs(i - page) <= 2)
          .map((i) => (
            <button
              key={i}
              onClick={() => onPageChange(i)}
              className={`
                w-8 h-8 rounded text-sm font-medium transition-colors
                ${i === page
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800'}
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
        >
          {t('common.next')}
        </Button>
      </div>
    </div>
  );
}