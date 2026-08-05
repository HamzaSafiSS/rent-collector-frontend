import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  variant = 'danger',
  loading = false,
}) {
  const { t } = useTranslation();
  const displayTitle = title || t('common.confirm');
  const displayConfirmText = confirmText || t('common.confirm');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={displayTitle}
      size="sm"
      footer={
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700/50 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {displayConfirmText}
          </Button>
        </div>
      }
    >
      {message && (
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{message}</p>
      )}
    </Modal>
  );
}