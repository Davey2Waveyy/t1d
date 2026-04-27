import { useEffect, useState } from 'react';

const KEY = 'iosInstallPromptShown';

export default function IOSInstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(KEY)) return undefined;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.navigator.standalone;

    if (isIOS && !isStandalone) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }

    return undefined;
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 max-w-[90%] bg-surface-raised border border-border-default rounded-xl p-md shadow-xl flex items-start gap-md">
      <span className="material-symbols-outlined text-primary text-[28px]">ios_share</span>
      <div className="flex-1 flex flex-col gap-xs">
        <div className="font-body text-body-base text-text-primary font-medium">Install Betatrace</div>
        <div className="font-body text-[13px] text-text-secondary">Tap <strong>Share</strong> then <strong>Add to Home Screen</strong> for the full app.</div>
      </div>
      <button
        type="button"
        onClick={() => {
          localStorage.setItem(KEY, '1');
          setShow(false);
        }}
        aria-label="Dismiss"
        className="text-text-muted active:scale-95"
      >
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  );
}
