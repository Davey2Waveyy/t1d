import { useState } from 'react';

const NOTICE_KEY = 'betatrace_preview_notice_seen';

export default function PreviewNotice({ onAccept }) {
  const [visible, setVisible] = useState(() => localStorage.getItem(NOTICE_KEY) !== 'true');

  if (!visible) return null;

  const accept = () => {
    localStorage.setItem(NOTICE_KEY, 'true');
    setVisible(false);
    onAccept?.();
  };

  return (
    <div className="absolute inset-0 z-[60] flex items-end bg-black/65 p-md backdrop-blur-sm sm:items-center sm:justify-center">
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Preview safety notice"
        className="w-full rounded-xl border border-border-default bg-surface-base p-md shadow-2xl sm:max-w-sm"
      >
        <div className="mb-md flex items-center gap-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
            <span className="material-symbols-outlined">health_and_safety</span>
          </div>
          <div>
            <p className="font-body text-[12px] font-semibold uppercase tracking-widest text-primary">Preview demo</p>
            <h2 className="font-body text-title-lg text-text-primary">Safety first</h2>
          </div>
        </div>

        <div className="flex flex-col gap-sm font-body text-[14px] leading-relaxed text-text-secondary">
          <p>
            Betatrace is a preview demo for personal logging and pattern review. It is not medical advice,
            diagnosis, treatment, or an emergency tool.
          </p>
          <p>
            Do not use Betatrace to make insulin dosing, correction, or treatment decisions. Use your prescribed
            care plan and talk with a qualified clinician before changing therapy.
          </p>
          <p>
            Guest mode stores demo entries on this device. Account sync is beta and should only be used after
            the backend connection is verified.
          </p>
        </div>

        <button
          type="button"
          onClick={accept}
          className="mt-lg flex h-12 w-full items-center justify-center rounded-lg bg-primary font-body font-semibold text-on-primary active:scale-[0.98] transition-transform"
        >
          I understand
        </button>
      </section>
    </div>
  );
}
