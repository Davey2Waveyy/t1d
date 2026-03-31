import './StatCard.css';

export default function StatCard({ icon: Icon, label, value, unit, trend, trendLabel, accentColor = 'teal', children }) {
  const colorMap = {
    teal: 'var(--accent-teal)',
    emerald: 'var(--accent-emerald)',
    sky: 'var(--accent-sky)',
    rose: 'var(--accent-rose)',
    amber: 'var(--accent-amber)',
    violet: 'var(--accent-violet)',
  };

  const dimMap = {
    teal: 'var(--accent-teal-dim)',
    emerald: 'var(--accent-emerald-dim)',
    sky: 'var(--accent-sky-dim)',
    rose: 'var(--accent-rose-dim)',
    amber: 'var(--accent-amber-dim)',
    violet: 'var(--accent-violet-dim)',
  };

  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div className="stat-card-icon" style={{ background: dimMap[accentColor], color: colorMap[accentColor] }}>
          {Icon && <Icon size={18} />}
        </div>
        {trend && (
          <span className={`stat-card-trend ${trend === 'up' ? 'trend-up' : trend === 'down' ? 'trend-down' : 'trend-stable'}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendLabel}
          </span>
        )}
      </div>
      <div className="stat-card-value" style={{ color: colorMap[accentColor] }}>
        {value}
        {unit && <span className="stat-card-unit">{unit}</span>}
      </div>
      <div className="stat-card-label">{label}</div>
      {children}
    </div>
  );
}
