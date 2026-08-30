import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../common/Modal';
import { leaseApi } from '../../api/leaseApi';
import { useToast } from '../../context/ToastContext';

// Convert old Cloudinary "raw" URLs to "image" URLs for inline PDF preview,
// and ensure PDF URLs end with .pdf so Cloudinary delivers the PDF inline.
function toPreviewUrl(url) {
  if (!url) return url;
  let converted = url;
  if (converted.includes('/raw/upload/')) {
    converted = converted.replace('/raw/upload/', '/image/upload/');
  }
  if (converted.includes('res.cloudinary.com')) {
    const [path, query] = converted.split('?');
    const filename = path.substring(path.lastIndexOf('/') + 1);
    if (!filename.includes('.')) {
      converted = `${path}.pdf${query ? `?${query}` : ''}`;
    }
  }
  return converted;
}

export default function DocumentViewer({
  leaseId,
  documentUrl,
  status,
  onStatusChange,
  isTenant = true,
  className,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
}) {
  const { t } = useTranslation();
  const toast = useToast();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(null); // 'approve' | 'reject' | null

  // If opened via autoOpen (externalIsOpen is true) OR user clicks button (internalIsOpen is true)
  const isOpen = Boolean(externalIsOpen || internalIsOpen);

  const handleClose = () => {
    setInternalIsOpen(false);
    if (externalOnClose) externalOnClose();
  };

  const previewUrl = toPreviewUrl(documentUrl);

  // Determine content type from the URL
  function getDocType(url) {
    if (!url) return 'unknown';
    const lower = url.toLowerCase();
    if (lower.endsWith('.pdf') || lower.includes('/raw/') || lower.includes('/documents/')) return 'pdf';
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.includes('/image/')) return 'image';
    return 'pdf';
  }

  const docType = getDocType(documentUrl);

  const handleApprove = async () => {
    if (!leaseId) return;
    try {
      setSubmittingAction('approve');
      await leaseApi.approveLease(leaseId);
      toast.success(t('leases.leaseApproved') || 'Lease approved successfully.');
      if (onStatusChange) {
        onStatusChange('ACTIVE');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t('leases.failedApproveLease') || 'Failed to approve lease.');
    } finally {
      setSubmittingAction(null);
    }
  };

  const handleReject = async () => {
    if (!leaseId) return;
    try {
      setSubmittingAction('reject');
      await leaseApi.rejectLease(leaseId);
      toast.success(t('leases.leaseRejected') || 'Lease rejected.');
      if (onStatusChange) {
        onStatusChange('REJECTED');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t('leases.failedRejectLease') || 'Failed to reject lease.');
    } finally {
      setSubmittingAction(null);
    }
  };

  return (
    <>
      <button
        onClick={() => setInternalIsOpen(true)}
        className={className || "text-emerald-500 hover:text-emerald-600 hover:underline text-xs font-medium transition-colors"}
      >
        {t('leases.viewDocument')}
      </button>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={t('leases.agreementDocument')}
        size="2xl"
        footer={null}
      >
        <div className="p-4 flex flex-col items-center min-h-[300px] justify-center">
          {!documentUrl ? (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm text-center">
              {t('errors.somethingWentWrong') || 'Could not load document.'}
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              {docType === 'image' ? (
                <img
                  src={previewUrl}
                  alt="Lease Document"
                  className="max-w-full rounded-lg border border-slate-200 dark:border-slate-700 object-contain max-h-[65vh] bg-slate-50 dark:bg-slate-900/50"
                />
              ) : (
                <iframe
                  src={previewUrl}
                  className="w-full h-[65vh] rounded-lg border border-slate-200 dark:border-slate-700 bg-white"
                  title="Document Viewer"
                />
              )}
              
              <div className="mt-6 flex items-center justify-between w-full flex-wrap gap-3">
                {/* Approve & Reject buttons for Tenant on PENDING lease */}
                {status === 'PENDING' && isTenant && (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={!!submittingAction}
                      onClick={handleReject}
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                    >
                      {submittingAction === 'reject' ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      {t('leases.reject') || 'Reject'}
                    </button>

                    <button
                      type="button"
                      disabled={!!submittingAction}
                      onClick={handleApprove}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                    >
                      {submittingAction === 'approve' ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {t('leases.approve') || 'Approve'}
                    </button>
                  </div>
                )}

                <div className="ml-auto">
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 text-white rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
