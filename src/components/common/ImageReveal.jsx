import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

export default function ImageReveal({ children, className = '' }) {
  const ref = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [18, -18]);

  return (
    <motion.div
      ref={ref}
      className={`image-reveal ${className}`}
      initial={prefersReducedMotion ? false : { clipPath: 'inset(0 0 12% 0)', opacity: 0.82 }}
      whileInView={prefersReducedMotion ? undefined : { clipPath: 'inset(0 0 0% 0)', opacity: 1 }}
      viewport={prefersReducedMotion ? undefined : { once: true, amount: 0.18 }}
      transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div className="image-reveal-inner" style={{ y: prefersReducedMotion ? 0 : parallaxY }}>
        {children}
      </motion.div>
    </motion.div>
  );
}
