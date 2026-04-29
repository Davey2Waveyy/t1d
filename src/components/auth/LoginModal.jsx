import { ArrowRight, ShieldCheck, X } from 'lucide-react';
import './LoginModal.css';

export default function LoginModal({ isOpen, onClose, onContinue }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container modal-preview animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="modal-preview-icon">
          <ShieldCheck size={22} />
        </div>

        <div className="modal-header">
          <p className="modal-kicker">Preview access</p>
          <h2 className="modal-title">Open the phone demo</h2>
          <p className="modal-subtitle">
            Get Started opens the guest preview. It will not collect an email, password, or start Google OAuth.
          </p>
        </div>

        <div className="modal-preview-copy">
          <p>
            Account sync is not connected for this public build yet. Guest mode keeps demo entries on this
            device so you can review the mobile dashboard safely.
          </p>
        </div>

        <button type="button" className="btn btn-primary btn-lg modal-submit" onClick={onContinue}>
          Continue to phone preview
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
