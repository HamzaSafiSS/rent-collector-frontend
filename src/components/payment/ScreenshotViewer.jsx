import { useState } from 'react';
import { paymentApi } from '../../api/paymentApi';
import { Spinner } from '../common';

// Fetches and displays the payment proof screenshot inline.
// Uses a blob URL so the image is streamed through the API
// (with authorization) rather than exposed as a direct URL.

export default function ScreenshotViewer({ paymentId }) {
  const [url, setUrl]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [loaded, setLoaded] = useState(false);

  async function handleLoad() {
    if (url) return; // already loaded
    try {
      setLoading(true);
      setError('');

      // Fetch the file as a blob using the Axios instance (automatically attaches Authorization header)
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
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          View screenshot
        </button>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Spinner size="sm" /> Loading screenshot...
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {url && (
        <div className="mt-2">
          <img
            src={url}
            alt="Payment proof"
            onLoad={() => setLoaded(true)}
            className={`max-w-full rounded-lg border border-slate-200 transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            style={{ maxHeight: '400px', objectFit: 'contain' }}
          />
          <a
            href={url}
            download={`payment-proof-${paymentId}`}
            className="text-xs text-blue-600 hover:underline mt-2 block"
          >
            Download
          </a>
        </div>
      )}
    </div>
  );
}