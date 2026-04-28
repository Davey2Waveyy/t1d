import { useEffect } from 'react';
import './BottomSheet.css';

export default function BottomSheet({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true">
        <div className="sheet-handle" />
        {title && <h3 className="sheet-title">{title}</h3>}
        <div className="sheet-content">{children}</div>
      </div>
    </>
  );
}
