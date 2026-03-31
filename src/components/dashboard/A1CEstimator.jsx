import { useState, useEffect } from 'react';
import { Target, TrendingDown, TrendingUp, Loader2, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { getAllGlucoseReadings, calculateStats } from '../../lib/dataService';
import EmptyState from '../ui/EmptyState';
import './A1CEstimator.css';

export default function A1CEstimator() {
  const [loading, setLoading] = useState(true);
  const [readings, setReadings] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const { data } = await getAllGlucoseReadings(500);
    setReadings(data || []);
    setLoading(false);
  }

  const stats = calculateStats(readings, [], []);
  const hasData = readings.length >= 10;

  // Calculate A1C history from readings (group by month)
  const a1cHistory = [];
  if (readings.length > 0) {
    const byMonth = {};
    readings.forEach((r) => {
      const date = new Date(r.recorded_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!byMonth[key]) byMonth[key] = [];
      byMonth[key].push(r.value);
    });

    Object.entries(byMonth)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .forEach(([month, values]) => {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const a1c = Number(((avg + 46.7) / 28.7).toFixed(1));
        a1cHistory.push({ date: month, value: a1c });
      });
  }

  const current = stats.estimatedA1C || 0;
  const previous = a1cHistory.length > 1 ? a1cHistory[a1cHistory.length - 2]?.value : current;
  const diff = (current - previous).toFixed(1);
  const improving = current < previous;

  // Gauge calculation
  const minA1C = 4;
  const maxA1C = 12;
  const pct = hasData ? ((current - minA1C) / (maxA1C - minA1C)) * 100 : 0;
  const angle = -90 + (pct / 100) * 180;

  // Interpretation
  const getInterpretation = (a1c) => {
    if (a1c === 0) return { badge: 'No data', color: 'badge-ghost', text: 'Log glucose readings to see your estimated A1C.' };
    if (a1c < 5.7) return { badge: 'Normal', color: 'badge-teal', text: 'Your glucose levels are in the normal, non-diabetic range.' };
    if (a1c <= 6.5) return { badge: 'Excellent', color: 'badge-teal', text: 'Excellent T1D management! Your levels are well-controlled.' };
    if (a1c <= 7.0) return { badge: 'Good', color: 'badge-sky', text: 'Good control. This is within target for most people with T1D.' };
    if (a1c <= 8.0) return { badge: 'Fair', color: 'badge-amber', text: 'Room for improvement. Consider reviewing your ratios.' };
    return { badge: 'Needs Work', color: 'badge-rose', text: 'Your levels are elevated. Work with your care team on adjustments.' };
  };

  const interp = getInterpretation(current);

  if (loading) {
    return (
      <div className="a1c-estimator">
        <div className="module-header">
          <div>
            <h1 className="module-title">A1C Estimator</h1>
            <p className="module-subtitle">Estimated HbA1c based on your glucose data</p>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-2xl)' }}>
          <Loader2 size={32} className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="a1c-estimator">
      <div className="module-header">
        <div>
          <h1 className="module-title">A1C Estimator</h1>
          <p className="module-subtitle">Estimated HbA1c based on your glucose data</p>
        </div>
      </div>

      {!hasData ? (
        <div className="card">
          <EmptyState
            icon={Activity}
            title="Not enough glucose data"
            description="Log at least 10 glucose readings to calculate your estimated A1C. More data = more accurate estimate."
          />
        </div>
      ) : (
        <>
          <div className="a1c-grid">
            <div className="card a1c-gauge-card">
              <div className="a1c-gauge">
                <svg viewBox="0 0 200 120" className="a1c-gauge-svg">
                  <defs>
                    <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2DD4A8" />
                      <stop offset="50%" stopColor="#FBBF24" />
                      <stop offset="100%" stopColor="#FB7185" />
                    </linearGradient>
                  </defs>
                  <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--bg-input)" strokeWidth="12" strokeLinecap="round" />
                  <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#gaugeGrad)" strokeWidth="12" strokeLinecap="round"
                    strokeDasharray={`${pct * 2.51} 251`} />
                  <line x1="100" y1="100" x2="100" y2="30"
                    stroke="var(--text-light)" strokeWidth="2" strokeLinecap="round"
                    transform={`rotate(${angle}, 100, 100)`} />
                  <circle cx="100" cy="100" r="5" fill="var(--text-light)" />
                </svg>
                <div className="a1c-gauge-value">
                  <span className="a1c-value">{current}%</span>
                  <span className="a1c-label">Estimated A1C</span>
                </div>
              </div>
              <div className="a1c-gauge-scale">
                <span>4%</span>
                <span className="a1c-target-zone">Target: 5.7-7.0%</span>
                <span>12%</span>
              </div>
              {a1cHistory.length > 1 && (
                <div className={`a1c-trend-badge ${improving ? 'a1c-trend--improving' : 'a1c-trend--worsening'}`}>
                  {improving ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                  <span>{improving ? '' : '+'}{diff}% from last month</span>
                </div>
              )}
            </div>

            <div className="a1c-info-cards">
              <div className="card a1c-info">
                <h3 className="card-title">Based On</h3>
                <div className="a1c-based-on">
                  <div className="summary-row">
                    <span className="summary-label">Average Glucose</span>
                    <span className="summary-value">{stats.avgGlucose} mg/dL</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Data Points</span>
                    <span className="summary-value">{readings.length.toLocaleString()}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Std. Deviation</span>
                    <span className="summary-value">{stats.standardDeviation}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Formula</span>
                    <span className="summary-value accent">ADAG (GMI)</span>
                  </div>
                </div>
              </div>
              <div className="card a1c-interpretation">
                <h3 className="card-title">Interpretation</h3>
                <p className="a1c-interp-text">
                  Your estimated A1C of <strong>{current}%</strong> is
                  <span className={`badge ${interp.color}`} style={{ margin: '0 4px' }}>{interp.badge}</span>
                  {interp.text}
                </p>
              </div>
            </div>
          </div>

          {a1cHistory.length > 1 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">A1C Trend</h3>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={a1cHistory}>
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[5, 9]} stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', color: 'var(--text-light)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }} formatter={(v) => [`${v}%`, 'A1C']} />
                  <Line type="monotone" dataKey="value" stroke="#2DD4A8" strokeWidth={2.5} dot={{ r: 5, fill: '#2DD4A8', stroke: '#0D1B16', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}
