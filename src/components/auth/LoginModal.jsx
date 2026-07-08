import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, X } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onContinue }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-label="Preview access"
            onClick={(event) => event.stopPropagation()}
            initial={{ opacity: 0, y: 26, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
          >
            <button className="modal-close" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>

            <span className="modal-icon"><ShieldCheck size={20} strokeWidth={2} /></span>
            <p className="text-kicker">Preview access</p>
            <h2>Accounts aren’t open yet</h2>
            <p className="modal-copy">
              This public build runs as a guest preview — no email, no password,
              no OAuth. Demo entries stay in your browser so you can explore the
              full app safely.
            </p>

            <button type="button" className="btn btn-primary btn-lg modal-submit" onClick={onContinue}>
              Continue to the demo
              <span className="btn-orb"><ArrowRight size={15} strokeWidth={2} /></span>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
