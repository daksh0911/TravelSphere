import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function MagneticLink({ to, href, children, className = '', ...props }) {
  const prefersReducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 20, mass: 0.45 });
  const springY = useSpring(y, { stiffness: 220, damping: 20, mass: 0.45 });
  const Component = to ? Link : 'a';

  const handlePointerMove = (event) => {
    if (prefersReducedMotion || event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - bounds.left - bounds.width / 2) * 0.12);
    y.set((event.clientY - bounds.top - bounds.height / 2) * 0.12);
  };

  const resetPosition = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      className="magnetic-link-shell"
      style={{ x: springX, y: springY }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPosition}
    >
      <Component {...(to ? { to } : { href })} className={className} {...props}>
        {children}
      </Component>
    </motion.span>
  );
}
