import { Droplet, Timer, Syringe, Utensils, TrendingUp, Plus } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis } from 'recharts';
import StatCard from '../ui/StatCard';
import { currentStats, glucoseReadings, activityFeed } from '../../data/mockData';
import './Overview.css';

const trendArrows = {
  rising: '↑',
  falling: '↓',
  stable: '→',
  rising_fast: '↑↑',
  falling_fast: '↓↓',
};

const activityIcons = {
  utensils: Utensils,
  syringe: Syringe,
  droplet: Droplet,
};

export default function Overview({ onViewChange }) {
  // Sample last 100 readings for sparkline
  const sparklineData = glucoseReadings.slice(-100).map((r) => ({
    value: r.value,
    time: r.timeLabel,
  }));

  return (
    <div className="overview">
      <div className="overview-header">
        <div>
          <h1 className="overview-title">Good evening</h1>
          <p className="overview-subtitle">Here's your glucose overview for today</p>
        </div>
        <div className="overview-actions">
          <button className="btn btn-primary btn-sm" onClick={() => onViewChange('meals')}>
            <Plus size={16} /> Log Meal
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => onViewChange('insulin')}>
            <Plus size={16} /> Log Insulin
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="overview-stats">
        <StatCard
          icon={Droplet}
          label="Current Glucose"
          value={currentStats.currentGlucose}
          unit="mg/dL"
          trend="stable"
          trendLabel={trendArrows[currentStats.glucoseTrend]}
          accentColor="teal"
        />
        <StatCard
          icon={Timer}
          label="Time in Range"
          value={`${currentStats.timeInRange}%`}
          trend={currentStats.timeInRange > 70 ? 'stable' : 'down'}
          trendLabel={currentStats.timeInRange > 70 ? 'On target' : 'Below target'}
          accentColor="emerald"
        />
        <StatCard
          icon={Syringe}
          label="Active Insulin"
          value={currentStats.activeInsulin}
          unit="u"
          accentColor="sky"
        />
        <StatCard
          icon={Utensils}
          label="Carbs Today"
          value={`${currentStats.carbsToday}`}
          unit="g"
          accentColor="amber"
        />
      </div>

      {/* Glucose Sparkline */}
      <div className="overview-chart card">
        <div className="card-header">
          <div>
            <h3 className="card-title">24-Hour Glucose</h3>
            <p className="card-subtitle">Avg: {currentStats.avgGlucose} mg/dL  •  SD: {currentStats.standardDeviation}</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => onViewChange('glucose')}>
            View Details →
          </button>
        </div>
        <div className="overview-chart-area">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={sparklineData}>
              <defs>
                <linearGradient id="glucoseColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2DD4A8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2DD4A8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis domain={[50, 250]} hide />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-light)',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)',
                }}
                labelFormatter={(_, payload) => payload[0]?.payload?.time || ''}
                formatter={(value) => [`${value} mg/dL`, 'Glucose']}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2DD4A8"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#2DD4A8', stroke: '#0D1B16', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
          {/* Zone indicators */}
          <div className="glucose-zones">
            <div className="glucose-zone zone-high">
              <span>High &gt;180</span>
            </div>
            <div className="glucose-zone zone-range">
              <span>In Range</span>
            </div>
            <div className="glucose-zone zone-low">
              <span>Low &lt;70</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="overview-bottom">
        {/* Activity Feed */}
        <div className="card overview-activity">
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
          </div>
          <div className="activity-list">
            {activityFeed.map((item) => {
              const Icon = activityIcons[item.icon] || Droplet;
              return (
                <div key={item.id} className="activity-item">
                  <div className={`activity-icon activity-icon--${item.type}`}>
                    <Icon size={14} />
                  </div>
                  <div className="activity-info">
                    <span className="activity-label">{item.label}</span>
                    <span className="activity-detail">{item.detail}</span>
                  </div>
                  <span className="activity-time">{item.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick summary */}
        <div className="card overview-summary">
          <div className="card-header">
            <h3 className="card-title">Daily Summary</h3>
          </div>
          <div className="summary-items">
            <div className="summary-row">
              <span className="summary-label">Total Insulin</span>
              <span className="summary-value">{currentStats.insulinToday}u</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Total Carbs</span>
              <span className="summary-value">{currentStats.carbsToday}g</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Avg Glucose</span>
              <span className="summary-value">{currentStats.avgGlucose} mg/dL</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Est. A1C</span>
              <span className="summary-value accent">{currentStats.estimatedA1C}%</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Std. Deviation</span>
              <span className="summary-value">{currentStats.standardDeviation}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
