import { useTranslation } from 'react-i18next';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import ScreenshotViewer from './ScreenshotViewer';
import useCalendarDate from '../../hooks/useCalendarDate';

/**
 * Read-only modal for tenants to view full payment details
 * including screenshot, unit info, and rejection reason.
 */
export default function PaymentDetailModal({ payment, isOpen, onClose }) {
  const { t } = useTranslation();
  const { formatDateTime } = useCalendarDate();

  if (!payment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('payments.paymentDetails')}
      size="lg"
      footer={
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700/50 flex justify-end">
          <Button variant="secondary" onClick={onClose}>{t('common.close')}</Button>
        </div>
      }
    >
      {/* Payment details grid */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <DetailRow label={t('payments.amountETB')} value={Number(payment.amount).toLocaleString()} />
        <DetailRow label={t('payments.monthDetail')}        value={payment.paymentMonth} />
        <DetailRow label={t('payments.unitDetail')}         value={payment.unitNumber} />
        <DetailRow label={t('payments.propertyDetail')}     value={payment.propertyName} />
        <DetailRow label={t('payments.statusDetail')}       value={<Badge statusKey={payment.status} label={payment.status ? t(`common.status${payment.status.charAt(0) + payment.status.slice(1).toLowerCase()}`, { defaultValue: payment.status }) : ''} />} />
        <DetailRow label={t('payments.uploaded')}           value={payment.uploadedAt ? formatDateTime(payment.uploadedAt) : '—'} />
        {payment.verifiedAt && (
          <DetailRow label={t('payments.reviewed')} value={formatDateTime(payment.verifiedAt)} />
        )}
      </div>

      {/* Rejection reason */}
      {payment.status === 'REJECTED' && payment.landLoardComment && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-lg p-3 mb-4">
          <p className="text-xs font-semibold text-red-400 mb-1">{t('payments.rejectionReasonDisplay')}</p>
          <p className="text-sm text-red-300">{payment.landLoardComment}</p>
        </div>
      )}

      {/* Screenshot */}
      <div className="border-t border-slate-200 dark:border-slate-700/50 pt-4">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{t('payments.paymentProof')}</p>
        <ScreenshotViewer paymentId={payment.id} screenshotUrl={payment.screenshotUrl} />
      </div>
    </Modal>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className="text-sm text-slate-800 dark:text-slate-200 mt-0.5">{value ?? '—'}</p>
    </div>
  );
}
