import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { paymentApi } from '../../api/paymentApi';
import { Spinner } from '../common';

// Fetches and displays the payment proof screenshot/document inline.
// If screenshotUrl is a direct URL, uses it for preview.
// When downloading, fetches file as binary blob to trigger proper local file download.

export default function ScreenshotViewer({ paymentId, screenshotUrl }) {
  const { t } = useTranslation();
  const [url, setUrl]                 = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [loaded, setLoaded]           = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  // Check if the screenshotUrl is a direct URL (e.g., Cloudinary)
  const isDirectUrl = Boolean(
    screenshotUrl && (screenshotUrl.startsWith('http://') || screenshotUrl.startsWith('https://'))
  );

  const isPdf = Boolean(
    (url && url.toLowerCase().includes('.pdf')) ||
    (screenshotUrl && screenshotUrl.toLowerCase().includes('.pdf'))
  );

  async function handleLoad() {
    if (url) return; // already loaded

    // If we have a direct URL, use it immediately for display
    if (isDirectUrl) {
      setUrl(screenshotUrl);
      return;
    }

    // Fallback: fetch via authenticated API
    try {
      setLoading(true);
      setError('');

      const response = await paymentApi.getProofBlob(paymentId);
      const blobUrl = URL.createObjectURL(response.data);
      setUrl(blobUrl);
    } catch {
      setError(t('payments.couldNotLoadScreenshot', 'Could not load screenshot.'));
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (downloading) return;

    try {
      setDownloading(true);
      setDownloadError('');

      let blob = null;

      // 1. If we already have a local blob URL in state
      if (url && url.startsWith('blob:')) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            blob = await res.blob();
          }
        } catch {
          blob = null;
        }
      }

      // 2. Try fetching from Cloudinary / direct URL
      const targetUrl = screenshotUrl || (url && !url.startsWith('blob:') ? url : null);
      if (!blob && targetUrl && (targetUrl.startsWith('http://') || targetUrl.startsWith('https://'))) {
        try {
          const res = await fetch(targetUrl, { mode: 'cors' });
          if (res.ok) {
            blob = await res.blob();
          }
        } catch (corsErr) {
          // Direct fetch failed (e.g. CORS restriction), proceed to backend proxy endpoint
          console.warn('Direct fetch failed, falling back to authenticated API endpoint', corsErr);
        }
      }

      // 3. Fallback: fetch blob from authenticated backend endpoint
      if (!blob && paymentId) {
        const response = await paymentApi.getProofBlob(paymentId);
        blob = response.data;
      }

      if (!blob) {
        throw new Error('Failed to retrieve file data');
      }

      // Determine appropriate extension
      let extension = 'jpg';
      if (blob.type) {
        if (blob.type.includes('png')) extension = 'png';
        else if (blob.type.includes('jpeg') || blob.type.includes('jpg')) extension = 'jpg';
        else if (blob.type.includes('pdf')) extension = 'pdf';
        else if (blob.type.includes('webp')) extension = 'webp';
        else if (blob.type.includes('gif')) extension = 'gif';
      } else if (targetUrl) {
        const cleanUrl = targetUrl.split('?')[0].split('#')[0];
        const match = cleanUrl.match(/\.([a-zA-Z0-9]+)$/);
        if (match && match[1]) {
          extension = match[1].toLowerCase();
        }
      }

      const filename = `payment-proof-${paymentId || 'receipt'}.${extension}`;

      // Create a local blob object URL and trigger programmatic browser download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up object URL
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 1500);
    } catch (err) {
      console.error('Failed to download payment proof:', err);
      setDownloadError(t('payments.failedDownloadProof', 'Could not download payment proof.'));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div>
      {!url && (
        <div className="space-y-2">
          {!loading ? (
            <div>
              <button
                type="button"
                onClick={handleLoad}
                className="text-sm text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 hover:underline font-medium transition-colors inline-flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {t('payments.viewScreenshot', 'View screenshot')}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 py-1">
              <Spinner size="sm" /> {t('payments.loadingScreenshot', 'Loading screenshot...')}
            </div>
          )}

          {error && <p className="text-sm text-red-500 dark:text-red-400 mt-1">{error}</p>}

          <div>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/15 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {downloading ? (
                <>
                  <Spinner size="sm" />
                  <span>{t('common.downloading', 'Downloading...')}</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>{t('common.download', 'Download')}</span>
                </>
              )}
            </button>
          </div>

          {downloadError && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-1">{downloadError}</p>
          )}
        </div>
      )}

      {url && (
        <div className="mt-2">
          {isPdf ? (
            <iframe
              src={url}
              title={t('payments.paymentProof', 'Payment Proof')}
              className="w-full h-80 rounded-lg border border-slate-200 dark:border-slate-700 bg-white"
            />
          ) : (
            <img
              src={url}
              alt={t('payments.paymentProof', 'Payment proof')}
              onLoad={() => setLoaded(true)}
              className={`max-w-full rounded-lg border border-slate-200 dark:border-slate-700 transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
              style={{ maxHeight: '400px', objectFit: 'contain' }}
            />
          )}

          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/15 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {downloading ? (
                <>
                  <Spinner size="sm" />
                  <span>{t('common.downloading', 'Downloading...')}</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>{t('common.download', 'Download')}</span>
                </>
              )}
            </button>
          </div>

          {downloadError && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-2">{downloadError}</p>
          )}
        </div>
      )}
    </div>
  );
}