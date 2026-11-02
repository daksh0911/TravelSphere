import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SmartImage from '../../../components/common/SmartImage';
import './DestinationGallery.css';

const padIndex = (index) => String(index + 1).padStart(2, '0');

export default function DestinationGallery({ destinations }) {
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const scrollFrameRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!section || !viewport || !track || destinations.length < 2) return undefined;

    const desktopPointer = window.matchMedia('(min-width: 960px) and (hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let context;
    let disposed = false;
    let requestVersion = 0;
    let refreshFrame = 0;

    const scheduleStableRefresh = (ScrollTrigger, version) => {
      cancelAnimationFrame(refreshFrame);
      refreshFrame = requestAnimationFrame(() => {
        refreshFrame = requestAnimationFrame(() => {
          refreshFrame = 0;
          if (!disposed && version === requestVersion) ScrollTrigger.refresh();
        });
      });
    };

    const setIndexFromProgress = (progress) => {
      const next = Math.min(destinations.length - 1, Math.max(0, Math.round(progress * (destinations.length - 1))));
      setActiveIndex((current) => (current === next ? current : next));
    };

    const syncGalleryMode = async () => {
      const version = ++requestVersion;
      cancelAnimationFrame(refreshFrame);
      refreshFrame = 0;
      context?.revert();
      context = undefined;
      viewport.classList.remove('is-pinned');

      if (!desktopPointer.matches || reducedMotion.matches) return;

      try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([
          import('gsap'),
          import('gsap/ScrollTrigger'),
        ]);
        if (disposed || version !== requestVersion || !desktopPointer.matches || reducedMotion.matches) return;

        gsap.registerPlugin(ScrollTrigger);
        const getTravelDistance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
        if (getTravelDistance() < 1) return;

        viewport.classList.add('is-pinned');
        context = gsap.context(() => {
          gsap.to(track, {
            x: () => -getTravelDistance(),
            ease: 'none',
            force3D: true,
            scrollTrigger: {
              trigger: section,
              start: 'top top+=84',
              end: () => `+=${Math.round(getTravelDistance())}`,
              pin: true,
              scrub: 0.15,
              anticipatePin: 1,
              fastScrollEnd: true,
              invalidateOnRefresh: true,
              onUpdate: (trigger) => setIndexFromProgress(trigger.progress),
            },
          });
        }, section);
        scheduleStableRefresh(ScrollTrigger, version);
      } catch (error) {
        // Keep the native horizontal scroller usable if the optional pin enhancement fails.
        console.warn('The pinned destination gallery could not be initialized.', error);
      }
    };

    const handleScroll = () => {
      cancelAnimationFrame(scrollFrameRef.current);
      scrollFrameRef.current = requestAnimationFrame(() => {
        const maxScroll = viewport.scrollWidth - viewport.clientWidth;
        setIndexFromProgress(maxScroll > 0 ? viewport.scrollLeft / maxScroll : 0);
      });
    };

    desktopPointer.addEventListener('change', syncGalleryMode);
    reducedMotion.addEventListener('change', syncGalleryMode);
    viewport.addEventListener('scroll', handleScroll, { passive: true });
    void syncGalleryMode();

    return () => {
      disposed = true;
      requestVersion += 1;
      cancelAnimationFrame(refreshFrame);
      cancelAnimationFrame(scrollFrameRef.current);
      desktopPointer.removeEventListener('change', syncGalleryMode);
      reducedMotion.removeEventListener('change', syncGalleryMode);
      viewport.removeEventListener('scroll', handleScroll);
      context?.revert();
      viewport.classList.remove('is-pinned');
    };
  }, [destinations]);

  const handlePointerMove = (event) => {
    if (event.pointerType !== 'mouse' || prefersReducedMotion) return;
    const card = event.currentTarget;
    const cursor = card.querySelector('.destination-view-cursor');
    if (!cursor) return;
    const bounds = card.getBoundingClientRect();
    cursor.style.left = `${event.clientX - bounds.left}px`;
    cursor.style.top = `${event.clientY - bounds.top}px`;
  };

  return (
    <div className={`destination-gallery ${prefersReducedMotion ? 'motion-reduced' : ''}`} ref={sectionRef}>
      <div className="destination-gallery-meta" aria-live="polite">
        <span className="destination-gallery-count">
          {prefersReducedMotion ? (
            padIndex(activeIndex)
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={activeIndex}
                initial={{ opacity: 0, y: 7 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.22 }}
              >
                {padIndex(activeIndex)}
              </motion.span>
            </AnimatePresence>
          )}
          <span className="destination-gallery-count-divider">/</span>
          {String(destinations.length).padStart(2, '0')}
        </span>
        <span className="destination-gallery-instruction">Scroll to explore <span aria-hidden="true">→</span></span>
      </div>

      <div
        className="destination-gallery-viewport"
        ref={viewportRef}
        role="region"
        aria-label="Featured destinations. Scroll horizontally to browse."
        tabIndex={0}
      >
        <div className="destination-gallery-track" ref={trackRef}>
          {destinations.map((destination, index) => (
            <Link
              key={destination.id}
              className="destination-slide"
              to={`/destinations/${destination.id}`}
              onPointerMove={handlePointerMove}
              onPointerEnter={(event) => event.currentTarget.classList.add('pointer-inside')}
              onPointerLeave={(event) => event.currentTarget.classList.remove('pointer-inside')}
            >
              <motion.div layoutId={`destination-image-${destination.id}`} className="destination-slide-image">
                <SmartImage
                  src={destination.image}
                  alt={destination.name}
                  priority={index === 0}
                  sizes="(max-width: 620px) 86vw, (max-width: 960px) 74vw, 78vw"
                />
              </motion.div>
              <div className="destination-slide-shade" />
              <span className="destination-slide-index">{padIndex(index + 0)} <i>/</i> {String(destinations.length).padStart(2, '0')}</span>
              <div className="destination-slide-copy">
                <span>{destination.region}</span>
                <h3>{destination.name}</h3>
                <p>{destination.meta}</p>
                <strong>Discover this place <span aria-hidden="true">↗</span></strong>
              </div>
              <span className="destination-view-cursor" aria-hidden="true">View</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="destination-gallery-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${(activeIndex + 1) / destinations.length})` }} />
      </div>
    </div>
  );
}
