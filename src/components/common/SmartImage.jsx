import { useState, useRef, useEffect } from 'react';
import './SmartImage.css';

const FALLBACK_IMAGE = '/travel-image-placeholder.svg';

function resolveAssetPath(src) {
  if (!src) return FALLBACK_IMAGE;
  return src;
}

export default function SmartImage({ src, alt, className = '', priority = false, onError, ...props }) {
  const imgRef = useRef(null);
  const requestedSrc = resolveAssetPath(src);
  const [failedSrc, setFailedSrc] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgSrc = failedSrc === requestedSrc ? FALLBACK_IMAGE : requestedSrc;

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [imgSrc]);

  const handleError = (event) => {
    onError?.(event);
    if (requestedSrc !== FALLBACK_IMAGE) setFailedSrc(requestedSrc);
  };

  return (
    <img
      ref={imgRef}
      src={imgSrc}
      alt={alt || 'TravelSphere image placeholder'}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      className={`smart-image ${isLoaded ? 'loaded' : 'loading'} ${className}`}
      onLoad={() => setIsLoaded(true)}
      onError={handleError}
      {...props}
    />
  );
}
