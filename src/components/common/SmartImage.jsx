import { useState } from 'react';
import './SmartImage.css';

const FALLBACK_IMAGE = '/travel-image-placeholder.svg';

export default function SmartImage({ src, alt, className = '', priority = false, onError, ...props }) {
  const requestedSrc = src || FALLBACK_IMAGE;
  const [failedSrc, setFailedSrc] = useState(null);
  const imgSrc = failedSrc === requestedSrc ? FALLBACK_IMAGE : requestedSrc;

  const handleError = (event) => {
    onError?.(event);
    if (requestedSrc !== FALLBACK_IMAGE) setFailedSrc(requestedSrc);
  };

  return (
    <img
      src={imgSrc}
      alt={alt || 'TravelSphere image placeholder'}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      className={`smart-image ${className}`}
      onError={handleError}
      {...props}
    />
  );
}
