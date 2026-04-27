const TYPE_VISUALS = {
  meal: { icon: 'restaurant', tone: 'chart-carbs' },
  insulin: { icon: 'vaccines', tone: 'chart-insulin' },
  glucose: { icon: 'water_drop', tone: 'glucose-normal' },
};

export default function ActivityRow({ type, title, subtitle, value, unit, time }) {
  const visual = TYPE_VISUALS[type] ?? TYPE_VISUALS.glucose;

  return (
    <div className="bg-surface-overlay border border-border-subtle rounded-lg p-3 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-full bg-${visual.tone}/20 text-${visual.tone} flex items-center justify-center`}>
        <span className="material-symbols-outlined">{visual.icon}</span>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <span className="font-body text-body-base text-text-primary font-medium truncate">{title}</span>
        {subtitle && <span className="font-mono text-[11px] text-text-secondary truncate">{subtitle}</span>}
      </div>
      <div className="flex flex-col items-end">
        <span className={`font-mono text-data-mono text-${visual.tone}`}>{value}{unit}</span>
        <span className="font-mono text-[11px] text-text-muted">{time}</span>
      </div>
    </div>
  );
}
