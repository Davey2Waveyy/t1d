import { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const spring = { type: 'spring', stiffness: 380, damping: 38 };

export default function Sheet({ open, onOpenChange, children, title }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!open) return undefined;

    const onKey = (event) => {
      if (event.key === 'Escape') onOpenChange(false);
    };

    document.body.classList.add('overflow-hidden');
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.classList.remove('overflow-hidden');
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onOpenChange]);

  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-50">
          <motion.div
            data-testid="sheet-backdrop"
            onClick={() => onOpenChange(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="absolute bottom-0 left-1/2 flex max-h-[calc(100%-1.5rem)] w-full max-w-[480px] flex-col overflow-hidden bg-surface-base border-t border-x border-border-default rounded-t-2xl pb-safe shadow-pop"
            style={{ x: '-50%' }}
            initial={reduced ? { opacity: 0 } : { y: '100%' }}
            animate={reduced ? { opacity: 1 } : { y: 0 }}
            exit={reduced ? { opacity: 0 } : { y: '100%' }}
            transition={spring}
            drag={reduced ? false : 'y'}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 90 || info.velocity.y > 500) onOpenChange(false);
            }}
          >
            <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing" aria-hidden="true">
              <div className="w-10 h-1 rounded-full bg-text-muted/40" />
            </div>
            {title && (
              <h2 className="text-center font-body text-title-lg text-text-primary px-md pb-md">
                {title}
              </h2>
            )}
            <div className="overflow-y-auto px-md pb-lg">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
