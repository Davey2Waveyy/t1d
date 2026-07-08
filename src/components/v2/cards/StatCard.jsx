import AnimatedNumber from '../ui/AnimatedNumber';

export default function StatCard({ label, value, unit, unitTone = 'text-secondary', decimals = 0 }) {
  return (
    <div className="bg-surface-raised border border-border-subtle rounded-xl p-4 flex flex-col justify-between gap-sm hover:border-border-default hover:-translate-y-px transition-all duration-200 min-h-[96px] shadow-raise">
      <span className="text-label-caps text-text-secondary uppercase tracking-widest">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="font-mono text-stat-lg text-text-primary tabular-nums">
          <AnimatedNumber value={value} decimals={decimals} />
        </span>
        {unit && <span className={`font-mono text-data-mono text-${unitTone}`}>{unit}</span>}
      </div>
    </div>
  );
}
