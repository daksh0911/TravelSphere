import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Heart } from 'lucide-react';
import './SaveHeart.css';

const ANGLES = [0, 60, 120, 180, 240, 300];

// Visual only: render inside your own <button>. Pops and bursts when `saved` turns on.
export default function SaveHeart({ saved, size = 17 }) {
  const reduced = useReducedMotion();
  const [previous, setPrevious] = useState(saved);
  const [burst, setBurst] = useState(0);

  if (previous !== saved) {
    setPrevious(saved);
    if (saved && !reduced) setBurst((count) => count + 1);
  }

  return (
    <span className="save-heart">
      <motion.span
        key={saved ? 'on' : 'off'}
        className="save-heart-icon"
        initial={reduced ? false : { scale: saved ? 0.6 : 1 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 12 }}
      >
        <Heart size={size} fill={saved ? 'currentColor' : 'none'} />
      </motion.span>
      <AnimatePresence>
        {burst > 0 && saved && ANGLES.map((angle) => (
          <motion.i
            key={`${burst}-${angle}`}
            className="save-heart-dot"
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: Math.cos((angle * Math.PI) / 180) * 18, y: Math.sin((angle * Math.PI) / 180) * 18, opacity: 0, scale: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </span>
  );
}
