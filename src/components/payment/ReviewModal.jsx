import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Alert from '../common/Alert';
import Badge from '../common/Badge';
import ScreenshotViewer from './ScreenshotViewer';
import useCalendarDate from '../../hooks/useCalendarDate';

export default function ReviewModal({
  payment,
  isOpen,
  onClose,
  onApprove,
  onReject,
  loading,
  error,
}) {
  const { t } = useTranslation();
  const { formatDateTime } = useCalendarDate();
  const [rejectComment, setRejectComment] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [commentError, setCommentError]     = useState('');

  function handleReject() {
    if (!rejectComment.trim()) {
      setCommentError(t('validation.commentRequired'));
      return;
    }
    onReject(payment.id, rejectComment.trim());
  }

  function handleClose() {
    setRejectComment('');
    setShowRejectForm(false);
    setCommentError('');
    onClose();
  }

  if (!payment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('payments.reviewPaymentTitle')}
      size="lg"
      footer={
        payment.status === 'PENDING' ? (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700/50">
            {!showRejectForm ? (
              <div className="flex gap-3 justify-end">
                <Button variant="secondary" onClick={handleClose} disabled={loading}>{t('common.cancel')}</Button>
                <Button variant="danger"    onClick={() => setShowRejectForm(true)} disabled={loading}>{t('payments.reject')}</Button>
                <Button variant="success"   onClick={() => onApprove(payment.id)} loading={loading}>{t('payments.approve')}</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {commentError && <Alert type="error" message={commentError} />}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <span className="text-red-400 mr-1" aria-hidden="true">*</span>{t('payments.rejectionReasonLabel')}
                  </label>
                  <textarea
                    value={rejectComment}
                    onChange={(e) => { setRejectComment(e.target.value); setCommentError(''); }}
                    placeholder={t('payments.rejectionReasonPlaceholder')}
                    rows={3}
                    className="w-full px-3 py-2 text-sm text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 placeholder-slate-400 dark:placeholder-slate-500"
                    required
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button variant="secondary" onClick={() => { setShowRejectForm(false); setCommentError(''); }} disabled={loading}>{t('common.back')}</Button>
                  <Button variant="danger"    onClick={handleReject} loading={loading}>{t('payments.confirmRejection')}</Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700/50 flex justify-end">
            <Button variant="secondary" onClick={handleClose}>{t('common.close')}</Button>
          </div>
        )
      }
    >
      {error && <Alert type="error" message={error} className="mb-4" />}

      {/* Payment details */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <DetailRow label={t('payments.tenantDetail')}       value={payment.tenantFullName} />
        <DetailRow label={t('payments.unitDetail')}         value={payment.unitNumber} />
        <DetailRow label={t('payments.propertyDetail')}     value={payment.propertyName} />
        <DetailRow label={t('payments.monthDetail')}        value={payment.paymentMonth} />
        <DetailRow label={t('payments.amountETB')}          value={Number(payment.amount).toLocaleString()} />
        <DetailRow label={t('payments.statusDetail')}       value={<Badge statusKey={payment.status} label={payment.status ? t(`common.status${payment.status.charAt(0) + payment.status.slice(1).toLowerCase()}`, { defaultValue: payment.status }) : ''} />} />
        <DetailRow label={t('payments.uploaded')}           value={payment.uploadedAt ? formatDateTime(payment.uploadedAt) : '—'} />
        {payment.verifiedAt && (
          <DetailRow label={t('payments.reviewed')}         value={formatDateTime(payment.verifiedAt)} />
        )}
      </div>

      {/* Rejection comment (if already rejected) */}
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