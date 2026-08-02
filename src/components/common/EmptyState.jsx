import { useTranslation } from 'react-i18next';
import Button from './Button';

const PRESET_ICONS = {
  properties: '🏗️',
  units:      '🚪',
  tenants:    '👥',
  leases:     '📄',
  payments:   '💳',
  admins:     '👤',
  audit:      '📋',
  search:     '🔍',
  generic:    '📭',
};

export default function EmptyState({
  type = 'generic',
  title,
  subtitle,
  action,
  actionLabel,
}) {
  const { t } = useTranslation();
  const icon = PRESET_ICONS[type] || PRESET_ICONS.generic;
  const defaultTitle = t(`empty.${type}Title`, { defaultValue: t('empty.genericTitle') });
  const defaultSubtitle = t(`empty.${type}Subtitle`, { defaultValue: t('empty.genericSubtitle') });

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <p className="text-5xl mb-4" role="img" aria-label={title || defaultTitle}>
        {icon}
      </p>
      <h3 className="text-base font-semibold text-slate-200 mb-1">
        {title || defaultTitle}
      </h3>
      <p className="text-sm text-slate-500 max-w-xs">
        {subtitle || defaultSubtitle}
      </p>
      {action && actionLabel && (
        <Button className="mt-5" onClick={action}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
export { default as EmptyState } from './EmptyState';