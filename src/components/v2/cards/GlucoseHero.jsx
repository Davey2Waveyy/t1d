const TREND_ICON = {
  rising_fast: 'trending_up',
  rising: 'trending_up',
  stable: 'trending_flat',
  falling: 'trending_down',
  falling_fast: 'trending_down',
};

const STATUS = (value, thresholds) => {
  if (value == null) return { label: '-', tone: 'text-secondary' };
  if (value < thresholds.low) return { label: 'LOW', tone: 'glucose-low' };
  if (value > thresholds.high) return { label: 'HIGH', tone: 'glucose-high' };
  return { label: 'IN RANGE', tone: 'glucose-normal' };
};

export default function GlucoseHero({ value, trend, updatedAt, unit = 'mg/dL', target, thresholds = { low: 70, high: 180 } }) {
  const status = STATUS(value, thresholds);
  const trendIcon = TREND_ICON[trend] ?? 'trending_flat';

  return (
    <div className="bg-surface-raised border border-border-subtle rounded-xl p-5 flex flex-col gap-md relative overflow-hidden">
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl bg-${status.tone}/10`} />
      <div className="flex justify-between items-start">
        <span className="text-label-caps text-text-secondary uppercase tracking-widest">Current</span>
        <div className={`bg-${status.tone}/20 text-${status.tone} px-2 py-1 rounded border border-${status.tone}/30 flex items-center gap-1`}>
          <span className="material-symbols-outlined text-[14px]">check_circle</span>
          <span className="text-label-caps">{status.label}</span>
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-headline-hero text-text-primary">{value ?? '-'}</span>
        <span className="font-mono text-data-mono text-text-secondary">{unit}</span>
      </div>
      {target !== undefined && target !== '' && (
        <div className="font-mono text-[11px] text-text-secondary">
          Target {target} {unit}
        </div>
      )}
      <div className="flex items-center gap-2 text-text-muted mt-auto pt-sm border-t border-border-subtle">
        <span className="material-symbols-outlined text-[14px]">sync</span>
        <span className="font-mono text-data-mono">{updatedAt ? `Updated ${updatedAt}` : 'No data yet'}</span>
        <span className={`material-symbols-outlined text-[16px] text-${status.tone} ml-auto icon-fill`}>{trendIcon}</span>
      </div>
    </div>
  );
}
