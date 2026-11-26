import { useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SmartImage from '../../../components/common/SmartImage';
import './DestinationGallery.css';

const padIndex = (index) => String(index + 1).padStart(2, '0');

export default function DestinationGallery({ destinations }) {
  const viewportRef = useRef(null);
  const scrollRafRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const handleScroll = () => {
    if (scrollRafRef.current) return;
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      const viewport = viewportRef.current;
      if (!viewport) return;
      const scrollLeft = viewport.scrollLeft;
      const slideWidth = viewport.clientWidth * 0.75 || 400;
      const newIndex = Math.min(
        destinations.length - 1,
        Math.max(0, Math.round(scrollLeft / slideWidth))
      );
      setActiveIndex(prev => (prev === newIndex ? prev : newIndex));
    });
  };

  const scrollPrev = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const slideWidth = viewport.clientWidth * 0.75 || 400;
    viewport.scrollBy({ left: -slideWidth, behavior: 'smooth' });
  };

  const scrollNext = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const slideWidth = viewport.clientWidth * 0.75 || 400;
    viewport.scrollBy({ left: slideWidth, behavior: 'smooth' });
  };

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
    <div className={`destination-gallery ${prefersReducedMotion ? 'motion-reduced' : ''}`}>
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

        <div className="destination-gallery-controls">
          <button
            type="button"
            className="gallery-nav-btn"
            onClick={scrollPrev}
            aria-label="Previous destination"
            disabled={activeIndex === 0}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="gallery-nav-btn"
            onClick={scrollNext}
            aria-label="Next destination"
            disabled={activeIndex === destinations.length - 1}
          >
            <ChevronRight size={16} />
          </button>
          <span className="destination-gallery-instruction">Swipe or click to explore <span aria-hidden="true">→</span></span>
        </div>
      </div>

      <div
        className="destination-gallery-viewport"
        ref={viewportRef}
        onScroll={handleScroll}
        role="region"
        aria-label="Featured destinations. Scroll horizontally to browse."
        tabIndex={0}
      >
        <div className="destination-gallery-track">
          {destinations.map((destination, index) => (
            <Link
              key={destination.id}
              className="destination-slide"
              to={`/destinations/${destination.id}`}
              onPointerMove={handlePointerMove}
              onPointerEnter={(event) => event.currentTarget.classList.add('pointer-inside')}
              onPointerLeave={(event) => event.currentTarget.classList.remove('pointer-inside')}
            >
              <div className="destination-slide-image">
                <SmartImage
                  src={destination.image}
                  alt={destination.name}
                  priority={index === 0}
                  sizes="(max-width: 620px) 86vw, (max-width: 960px) 74vw, 78vw"
                />
              </div>
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
