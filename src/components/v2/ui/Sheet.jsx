import { useEffect } from 'react';

export default function Sheet({ open, onOpenChange, children, title }) {
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        data-testid="sheet-backdrop"
        onClick={() => onOpenChange(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_250ms_var(--ease-out)]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-surface-base border-t border-border-subtle rounded-t-2xl pb-safe animate-[slideUp_280ms_var(--ease-drawer)]"
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-text-muted/40" />
        </div>
        {title && (
          <h2 className="text-center font-body text-title-lg text-text-primary px-md pb-md">
            {title}
          </h2>
        )}
        <div className="px-md pb-lg">{children}</div>
      </div>
    </div>
  );
}
