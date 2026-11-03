import { useEffect, useRef } from 'react';
import './FooterReveal.css';

// Footer shifting: as the footer scrolls into view its content glides up from behind the page
// Progress (0 → 1) is exposed as the --progress CSS variable.
export default function FooterReveal({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;
      const isMobile = window.innerWidth <= 768;
      
      // On mobile, reach full slide position briskly once the preceding section ends
      const totalDistance = isMobile
        ? Math.min(windowH * 0.55, 320)
        : Math.max(rect.height, 1);
        
      const progress = Math.min(1, Math.max(0, (windowH - rect.top) / totalDistance));
      el.style.setProperty('--progress', progress.toFixed(4));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <div className="footer-reveal" ref={ref}>{children}</div>;
}
