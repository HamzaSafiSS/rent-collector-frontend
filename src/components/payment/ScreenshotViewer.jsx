import { useState } from 'react';
import { paymentApi } from '../../api/paymentApi';
import { Spinner } from '../common';

// Fetches and displays the payment proof screenshot inline.
// If screenshotUrl is a Cloudinary URL, uses it directly.
// Otherwise, falls back to blob fetch through the authenticated API.

export default function ScreenshotViewer({ paymentId, screenshotUrl }) {
  const [url, setUrl]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [loaded, setLoaded] = useState(false);

  // Check if the screenshotUrl is a direct Cloudinary URL
  const isDirectUrl = screenshotUrl &&
    (screenshotUrl.startsWith('http://') || screenshotUrl.startsWith('https://'));

  async function handleLoad() {
    if (url) return; // already loaded

    // If we have a direct URL, use it immediately
    if (isDirectUrl) {
      setUrl(screenshotUrl);
      return;
    }

    // Fallback: fetch via authenticated API (legacy local files)
    try {
      setLoading(true);
      setError('');

      const response = await paymentApi.getProofBlob(paymentId);
      
      const blobUrl = URL.createObjectURL(response.data);
      setUrl(blobUrl);
    } catch {
      setError('Could not load screenshot.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {!url && !loading && (
        <button
          onClick={handleLoad}
          className="text-sm text-emerald-400 hover:text-emerald-300 hover:underline font-medium transition-colors"
        >
          View screenshot
        </button>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Spinner size="sm" /> Loading screenshot...
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {url && (
        <div className="mt-2">
          <img
            src={url}
            alt="Payment proof"
            onLoad={() => setLoaded(true)}
            className={`max-w-full rounded-lg border border-slate-200 dark:border-slate-700 transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            style={{ maxHeight: '400px', objectFit: 'contain' }}
          />
          <a
            href={url}
            download={`payment-proof-${paymentId}`}
            className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline mt-2 block transition-colors"
          >
            Download
          </a>
        </div>
      )}
    </div>
  );
}