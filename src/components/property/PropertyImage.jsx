import { useEffect, useState } from 'react';
import { propertyApi } from '../../api/propertyApi';

/**
 * Displays a property image.
 * If imageUrl is a full Cloudinary URL (starts with http), uses it directly.
 * Otherwise falls back to the authenticated blob fetch for backward compatibility.
 */
export default function PropertyImage({ propertyId, hasImage, imageUrl, alt, className }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    if (!hasImage) return;

    // If imageUrl is a full URL (Cloudinary), use it directly — no blob fetch needed
    if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
      setSrc(imageUrl);
      return;
    }

    // Fallback: fetch via authenticated API (legacy local files)
    if (!propertyId) return;

    let objectUrl = null;
    propertyApi.getPropertyImageBlob(propertyId)
      .then((res) => {
        objectUrl = URL.createObjectURL(res.data);
        setSrc(objectUrl);
      })
      .catch(() => {
        // Image load failed — fallback handled by parent
      });

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [propertyId, hasImage, imageUrl]);

  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt || 'Property'}
      className={className || 'w-full h-full object-cover'}
    />
  );
}
