import AnimatedNumber from '../ui/AnimatedNumber';

const TREND = {
  rising_fast: { icon: 'north', label: 'Rising fast' },
  rising: { icon: 'north_east', label: 'Rising' },
  stable: { icon: 'east', label: 'Steady' },
  falling: { icon: 'south_east', label: 'Falling' },
  falling_fast: { icon: 'south', label: 'Falling fast' },
};

const STATUS = (value, thresholds) => {
  if (value == null) return { label: '—', tone: 'text-secondary', icon: 'remove' };
  if (value < thresholds.low) return { label: 'LOW', tone: 'glucose-low', icon: 'arrow_cool_down' };
  if (value > thresholds.high) return { label: 'HIGH', tone: 'glucose-high', icon: 'arrow_warm_up' };
  return { label: 'IN RANGE', tone: 'glucose-normal', icon: 'check_circle' };
};

export default function GlucoseHero({ value, trend, updatedAt, unit = 'mg/dL', target, thresholds = { low: 70, high: 180 } }) {
  const status = STATUS(value, thresholds);
  const trendInfo = TREND[trend] ?? TREND.stable;

  return (
    <div className="bg-surface-raised border border-border-subtle rounded-2xl p-5 flex flex-col gap-md relative overflow-hidden shadow-raise">
      <div className={`absolute -top-14 -right-14 w-44 h-44 rounded-full blur-3xl bg-${status.tone}/10 pointer-events-none`} />

      <div className="flex justify-between items-start relative">
        <span className="text-label-caps text-text-secondary uppercase tracking-widest">Current glucose</span>
        <div className={`bg-${status.tone}/10 text-${status.tone} px-2 py-1 rounded-full border border-${status.tone}/30 flex items-center gap-1`}>
          <span className="material-symbols-outlined text-[13px]">{status.icon}</span>
          <span className="text-label-caps">{status.label}</span>
        </div>
      </div>

      <div className="flex items-baseline gap-2 relative">
        <span className="font-mono text-headline-hero text-text-primary tabular-nums">
          <AnimatedNumber value={value} decimals={unit === 'mmol/L' ? 1 : 0} />
        </span>
        <span className="font-mono text-data-mono text-text-secondary">{unit}</span>
        <span className={`ml-auto flex items-center gap-1 text-${status.tone} font-mono text-data-mono`}>
          <span className="material-symbols-outlined text-[18px]">{trendInfo.icon}</span>
          {trendInfo.label}
        </span>
      </div>

      {target !== undefined && target !== '' && (
        <div className="font-mono text-[11px] text-text-muted relative">
          Target {target} {unit} · Range {thresholds.low}–{thresholds.high}
        </div>
      )}

      <div className="flex items-center gap-2 text-text-muted mt-auto pt-sm border-t border-border-subtle relative">
        <span className="material-symbols-outlined text-[14px]">sync</span>
        <span className="font-mono text-data-mono">{updatedAt ? `Updated ${updatedAt}` : 'No data yet'}</span>
      </div>
    </div>
  );
}
