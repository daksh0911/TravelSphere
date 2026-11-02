import { useEffect, useRef } from 'react';
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';

export default function CountUp({ value, duration = 1.15, className }) {
  const ref = useRef(null);
  const count = useMotionValue(0);
  const formattedCount = useTransform(count, (current) => Math.round(current).toLocaleString());
  const isInView = useInView(ref, { once: true, amount: 0.6 });
  const prefersReducedMotion = useReducedMotion();
  const target = Number.isFinite(Number(value)) ? Number(value) : 0;

  useEffect(() => {
    if (prefersReducedMotion) {
      count.set(target);
      return undefined;
    }
    if (!isInView) return undefined;

    const controls = animate(count, target, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [count, duration, isInView, prefersReducedMotion, target]);

  return (
    <motion.span ref={ref} className={className}>
      {prefersReducedMotion ? target.toLocaleString() : formattedCount}
    </motion.span>
  );
}
