import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Alert from '../common/Alert';
import Badge from '../common/Badge';
import ScreenshotViewer from './ScreenshotViewer';

export default function ReviewModal({
  payment,
  isOpen,
  onClose,
  onApprove,
  onReject,
  loading,
  error,
}) {
  const [rejectComment, setRejectComment] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [commentError, setCommentError]     = useState('');

  function handleReject() {
    if (!rejectComment.trim()) {
      setCommentError('A comment is required when rejecting a payment.');
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
      title="Review Payment"
      size="lg"
      footer={
        payment.status === 'PENDING' ? (
          <div className="px-6 py-4 border-t border-slate-200">
            {!showRejectForm ? (
              <div className="flex gap-3 justify-end">
                <Button variant="secondary" onClick={handleClose} disabled={loading}>Cancel</Button>
                <Button variant="danger"    onClick={() => setShowRejectForm(true)} disabled={loading}>Reject</Button>
                <Button variant="success"   onClick={() => onApprove(payment.id)} loading={loading}>Approve</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {commentError && <Alert type="error" message={commentError} />}
                <textarea
                  value={rejectComment}
                  onChange={(e) => { setRejectComment(e.target.value); setCommentError(''); }}
                  placeholder="Explain the rejection reason to the tenant..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <div className="flex gap-3 justify-end">
                  <Button variant="secondary" onClick={() => { setShowRejectForm(false); setCommentError(''); }} disabled={loading}>Back</Button>
                  <Button variant="danger"    onClick={handleReject} loading={loading}>Confirm Rejection</Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
            <Button variant="secondary" onClick={handleClose}>Close</Button>
          </div>
        )
      }
    >
      {error && <Alert type="error" message={error} className="mb-4" />}

      {/* Payment details */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <DetailRow label="Tenant"       value={payment.tenantFullName} />
        <DetailRow label="Unit"         value={payment.unitNumber} />
        <DetailRow label="Property"     value={payment.propertyName} />
        <DetailRow label="Month"        value={payment.paymentMonth} />
        <DetailRow label="Amount (ETB)" value={Number(payment.amount).toLocaleString()} />
        <DetailRow label="Status"       value={<Badge label={payment.status} />} />
        <DetailRow label="Uploaded"     value={payment.uploadedAt ? new Date(payment.uploadedAt).toLocaleString() : '—'} />
        {payment.verifiedAt && (
          <DetailRow label="Reviewed" value={new Date(payment.verifiedAt).toLocaleString()} />
        )}
      </div>

      {/* Rejection comment (if already rejected) */}
      {payment.status === 'REJECTED' && payment.landLoardComment && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-xs font-semibold text-red-700 mb-1">Rejection Reason:</p>
          <p className="text-sm text-red-600">{payment.landLoardComment}</p>
        </div>
      )}

      {/* Screenshot */}
      <div className="border-t border-slate-100 pt-4">
        <p className="text-sm font-medium text-slate-700 mb-2">Payment Proof</p>
        <ScreenshotViewer paymentId={payment.id} />
      </div>
    </Modal>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className="text-sm text-slate-800 mt-0.5">{value ?? '—'}</p>
    </div>
  );
}