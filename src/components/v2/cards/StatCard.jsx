export default function StatCard({ label, value, unit, unitTone = 'text-secondary' }) {
  return (
    <div className="bg-surface-raised border border-border-subtle rounded-xl p-5 flex flex-col justify-between hover:border-border-default transition-colors h-[100px]">
      <span className="text-label-caps text-text-secondary uppercase tracking-widest">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="font-mono text-stat-lg text-text-primary">{value ?? '-'}</span>
        {unit && <span className={`font-mono text-data-mono text-${unitTone}`}>{unit}</span>}
      </div>
    </div>
  );
}
