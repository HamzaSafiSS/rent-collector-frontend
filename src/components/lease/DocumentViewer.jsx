import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { leaseApi } from '../../api/leaseApi';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';

export default function DocumentViewer({ leaseId, className }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl]       = useState(null);
  const [type, setType]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  async function handleOpen() {
    setIsOpen(true);
    if (url) return; // already loaded
    try {
      setLoading(true);
      setError('');
      
      const response = await leaseApi.getDocumentBlob(leaseId);
      const contentType = response.headers['content-type'] || response.headers['Content-Type'];
      const blob = new Blob([response.data], { type: contentType });
      const blobUrl = URL.createObjectURL(blob);
      
      setType(contentType);
      setUrl(blobUrl);
    } catch {
      setError(t('errors.somethingWentWrong') || 'Could not load document.');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setIsOpen(false);
  }

  return (
    <>
      <button
        onClick={handleOpen}
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
          {loading && (
            <div className="flex flex-col items-center text-slate-500">
              <Spinner size="lg" />
              <p className="mt-4 text-sm font-medium">{t('common.loading')}</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          
          {url && !loading && (
            <div className="w-full flex flex-col items-center">
              {type && type.includes('pdf') ? (
                <iframe
                  src={url}
                  className="w-full h-[65vh] rounded-lg border border-slate-200 dark:border-slate-700 bg-white"
                  title="Document Viewer"
                />
              ) : (
                <img
                  src={url}
                  alt="Lease Document"
                  className="max-w-full rounded-lg border border-slate-200 dark:border-slate-700 object-contain max-h-[65vh] bg-slate-50 dark:bg-slate-900/50"
                />
              )}
              
              <div className="mt-6 flex justify-end w-full">
                <a
                  href={url}
                  download={`lease-document-${leaseId}`}
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
