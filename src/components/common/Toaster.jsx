import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './Toaster.css';

let nextId = 1;

export default function Toaster() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const timers = new Set();
    const remove = (id) => setItems((list) => list.filter((item) => item.id !== id));
    const onToast = (event) => {
      const id = nextId++;
      setItems((list) => [...list.slice(-2), { id, ...event.detail }]);
      const timer = setTimeout(() => { remove(id); timers.delete(timer); }, 4500);
      timers.add(timer);
    };
    window.addEventListener('ts:toast', onToast);
    return () => {
      window.removeEventListener('ts:toast', onToast);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="toaster" role="status" aria-live="polite">
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            className="toast"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          >
            <span>{item.message}</span>
            {item.actionLabel && (
              <button
                type="button"
                onClick={() => { item.onAction?.(); setItems((list) => list.filter((entry) => entry.id !== item.id)); }}
              >
                {item.actionLabel}
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
