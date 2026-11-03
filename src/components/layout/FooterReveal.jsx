import { useEffect, useRef } from 'react';
import './FooterReveal.css';

// Footer shifting: as the footer scrolls into view its content glides up from behind the page
// Progress (0 → 1) is dynamically calculated and exposed as the --progress CSS variable.
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
      const scrollDistance = Math.max(rect.height, 1);
      const visibleDistance = windowH - rect.top;
      const progress = Math.min(1, Math.max(0, visibleDistance / scrollDistance));
      el.style.setProperty('--progress', progress.toFixed(4));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(onScroll);
      ro.observe(el);
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (ro) ro.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return <div className="footer-reveal" ref={ref}>{children}</div>;
}
