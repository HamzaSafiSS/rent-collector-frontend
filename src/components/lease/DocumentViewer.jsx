import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../common/Modal';

// Convert old Cloudinary "raw" URLs to "image" URLs for inline PDF preview.
// Raw URLs force download (Content-Disposition: attachment).
// Image URLs render inline (Content-Disposition: inline).
function toPreviewUrl(url) {
  if (!url) return url;
  if (url.includes('/raw/upload/')) {
    let converted = url.replace('/raw/upload/', '/image/upload/');
    if (!converted.toLowerCase().endsWith('.pdf')) {
      converted += '.pdf';
    }
    return converted;
  }
  return url;
}

export default function DocumentViewer({ leaseId, documentUrl, className }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={className || "text-emerald-500 hover:text-emerald-600 hover:underline text-xs font-medium transition-colors"}
      >
        {t('leases.viewDocument')}
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
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
              
              <div className="mt-6 flex justify-end w-full">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  Download
                </a>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
