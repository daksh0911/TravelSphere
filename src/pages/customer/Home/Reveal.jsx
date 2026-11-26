import { useEffect, useRef, useState } from 'react';
import './Reveal.css';

export default function Reveal({ children, className = '', delay = 0, direction = 'up' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth <= 768;
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isMobile || prefersReduced) return true;
    }
    return false;
  });

  useEffect(() => {
    if (visible) return undefined;
    const node = ref.current;
    if (!node) return undefined;

    // Immediately check if element is already within the visible window
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.unobserve(node);
      }
    }, { threshold: 0.05, rootMargin: '80px 0px 80px 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);

  return <div ref={ref} className={`reveal reveal-${direction} ${visible ? 'is-visible' : ''} ${className}`} style={{ '--reveal-delay': `${delay}ms` }}>{children}</div>;
}
