import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import ScreenshotViewer from './ScreenshotViewer';

/**
 * Read-only modal for tenants to view full payment details
 * including screenshot, unit info, and rejection reason.
 */
export default function PaymentDetailModal({ payment, isOpen, onClose }) {
  if (!payment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Payment Details"
      size="lg"
      footer={
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      }
    >
      {/* Payment details grid */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <DetailRow label="Amount (ETB)" value={Number(payment.amount).toLocaleString()} />
        <DetailRow label="Month"        value={payment.paymentMonth} />
        <DetailRow label="Unit"         value={payment.unitNumber} />
        <DetailRow label="Property"     value={payment.propertyName} />
        <DetailRow label="Status"       value={<Badge label={payment.status} />} />
        <DetailRow label="Uploaded"     value={payment.uploadedAt ? new Date(payment.uploadedAt).toLocaleString() : '—'} />
        {payment.verifiedAt && (
          <DetailRow label="Reviewed" value={new Date(payment.verifiedAt).toLocaleString()} />
        )}
      </div>

      {/* Rejection reason */}
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
