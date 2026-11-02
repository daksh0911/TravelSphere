import { useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';

// Pointer-driven 3D tilt. Disabled for touch input and prefers-reduced-motion.
export default function useTilt(max = 5) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 18, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 180, damping: 18, mass: 0.6 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-max, max]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [max, -max]);
  const enabled = !reduced && typeof window !== 'undefined'
    && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const onPointerMove = (event) => {
    if (!enabled || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  };
  const onPointerLeave = () => { x.set(0); y.set(0); };

  return enabled
    ? { style: { rotateX, rotateY, transformPerspective: 1100 }, onPointerMove, onPointerLeave }
    : {};
}
