export default function Field({ label, unit, children }) {
  return (
    <label className="flex flex-col gap-xs">
      <span className="text-label-caps text-text-secondary uppercase tracking-widest">
        {label}{unit && <span className="ml-1 text-text-muted">({unit})</span>}
      </span>
      {children}
    </label>
  );
}

export const inputCls = 'bg-surface-input border border-border-subtle rounded-lg px-md py-sm font-mono text-body-base text-text-primary focus:outline-none focus:border-primary transition-colors';
