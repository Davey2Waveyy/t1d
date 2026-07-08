import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const KEY = 'iosInstallPromptShown';

export default function IOSInstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(KEY)) return undefined;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.navigator.standalone;

    if (isIOS && !isStandalone) {
      const timer = setTimeout(() => setShow(true), 2500);
      return () => clearTimeout(timer);
    }

    return undefined;
  }, []);

  const dismiss = () => {
    localStorage.setItem(KEY, '1');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute left-3 right-3 z-40 bg-surface-overlay/95 backdrop-blur-xl border border-border-default rounded-xl px-md py-sm shadow-pop flex items-center gap-sm"
          style={{ bottom: 'calc(9.25rem + env(safe-area-inset-bottom))' }}
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        >
          <span className="material-symbols-outlined text-primary text-[22px] flex-shrink-0">ios_share</span>
          <p className="flex-1 font-body text-[12.5px] leading-snug text-text-secondary">
            <strong className="text-text-primary font-medium">Install Betatrace</strong> — tap Share, then Add to Home Screen.
          </p>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
