import { useEffect, useState } from 'react';

const TONE = {
  info: 'bg-surface-raised border-border-default text-text-primary',
  warn: 'bg-glucose-high/10 border-glucose-high/30 text-glucose-high',
  error: 'bg-glucose-low/10 border-glucose-low/30 text-glucose-low',
};

export default function Toast({ children, tone = 'info', onDismiss, duration = 4000 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!duration) return undefined;

    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  if (!visible) return null;

  return (
    <div className={`absolute top-20 left-1/2 -translate-x-1/2 z-[55] max-w-[92%] px-md py-sm rounded-full border ${TONE[tone]} font-body text-[13px] backdrop-blur-xl shadow-pop animate-[fadeInUp_220ms_var(--ease-out)]`}>
      {children}
    </div>
  );
}
