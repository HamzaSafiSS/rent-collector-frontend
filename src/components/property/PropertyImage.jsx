import { useEffect, useState } from 'react';
import { propertyApi } from '../../api/propertyApi';

/**
 * Displays a property image fetched via authenticated API call.
 * Falls back to a placeholder if the property has no image or the request fails.
 */
export default function PropertyImage({ propertyId, hasImage, alt, className }) {
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    if (!propertyId || !hasImage) return;

    let objectUrl = null;
    propertyApi.getPropertyImageBlob(propertyId)
      .then((res) => {
        objectUrl = URL.createObjectURL(res.data);
        setBlobUrl(objectUrl);
      })
      .catch(() => {
        // Image load failed — fallback handled by parent
      });

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [propertyId, hasImage]);

  if (!blobUrl) return null;

  return (
    <img
      src={blobUrl}
      alt={alt || 'Property'}
      className={className || 'w-full h-full object-cover'}
    />
  );
}
