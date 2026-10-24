import { useEffect, useRef } from 'react';
import './GlobalExperienceLayer.css';

export default function GlobalExperienceLayer() {
  const layerRef = useRef(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return undefined;

    let frame = 0;
    let lenisFrame = 0;
    let lenis;
    let disposed = false;
    let lenisRequest = 0;
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const useNativeHomepageScroll = window.location.pathname === '/';

    const updateScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
        layer.style.setProperty('--scroll-progress', String(progress));
      });
    };

    const stopLenis = () => {
      cancelAnimationFrame(lenisFrame);
      lenisFrame = 0;
      lenis?.destroy();
      lenis = undefined;
    };

    const syncLenisPreference = async () => {
      const request = ++lenisRequest;
      stopLenis();
      if (motionPreference.matches || useNativeHomepageScroll) return;

      try {
        const { default: Lenis } = await import('lenis');
        if (disposed || motionPreference.matches || request !== lenisRequest) return;

        lenis = new Lenis({
          duration: 1.1,
          smoothWheel: true,
          syncTouch: false,
        });

        const raf = (time) => {
          if (!lenis) return;
          lenis.raf(time);
          lenisFrame = requestAnimationFrame(raf);
        };
        lenisFrame = requestAnimationFrame(raf);
      } catch (error) {
        // Keep native scrolling available if the optional enhancement cannot load.
        console.warn('Lenis smooth scrolling could not be initialized.', error);
      }
    };

    const handleMotionPreferenceChange = () => {
      void syncLenisPreference();
    };

    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll, { passive: true });
    motionPreference.addEventListener('change', handleMotionPreferenceChange);
    updateScroll();
    void syncLenisPreference();

    return () => {
      disposed = true;
      lenisRequest += 1;
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
      motionPreference.removeEventListener('change', handleMotionPreferenceChange);
      stopLenis();
    };
  }, []);

  return (
    <div ref={layerRef} className="global-experience-layer" aria-hidden="true">
      <span className="global-scroll-progress" />
    </div>
  );
}
