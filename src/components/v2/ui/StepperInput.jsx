import { useId } from 'react';

export default function StepperInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  placeholder,
}) {
  const id = useId();

  const commitValue = (next) => {
    if (Number.isNaN(next)) {
      onChange({ target: { value: '' } });
      return;
    }

    const bounded = Math.min(max ?? next, Math.max(min ?? next, next));
    onChange({ target: { value: String(bounded) } });
  };

  const nudge = (direction) => {
    const current = Number(value || 0);
    const normalized = Number.isFinite(current) ? current : 0;
    const next = Number((normalized + direction * step).toFixed(step < 1 ? 1 : 0));
    commitValue(next);
  };

  return (
    <label className="flex flex-col gap-xs" htmlFor={id}>
      <span className="text-label-caps text-text-secondary uppercase tracking-widest">
        {label}
        {unit && <span className="ml-1 text-text-muted">({unit})</span>}
      </span>
      <div className="flex items-center rounded-lg border border-border-subtle bg-surface-input px-1.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <button
          type="button"
          onClick={() => nudge(-1)}
          className="h-8 w-8 shrink-0 rounded-md border border-border-subtle bg-surface-overlay text-text-secondary transition-colors hover:text-text-primary"
          aria-label={`Decrease ${label}`}
        >
          <span className="material-symbols-outlined text-[16px]">remove</span>
        </button>
        <input
          id={id}
          className="w-full border-0 bg-transparent px-sm text-center font-mono text-[15px] text-text-primary focus:outline-none [appearance:textfield]"
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
        />
        <button
          type="button"
          onClick={() => nudge(1)}
          className="h-8 w-8 shrink-0 rounded-md border border-border-subtle bg-surface-overlay text-text-secondary transition-colors hover:text-text-primary"
          aria-label={`Increase ${label}`}
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
        </button>
      </div>
    </label>
  );
}
