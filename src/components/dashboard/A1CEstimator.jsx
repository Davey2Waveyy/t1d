import { Target, TrendingDown, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { a1cHistory, currentStats } from '../../data/mockData';
import './A1CEstimator.css';

export default function A1CEstimator() {
  const current = currentStats.estimatedA1C;
  const previous = a1cHistory.length > 1 ? a1cHistory[a1cHistory.length - 2].value : current;
  const diff = (current - previous).toFixed(1);
  const improving = current < previous;

  // Gauge calculation
  const minA1C = 4;
  const maxA1C = 12;
  const pct = ((current - minA1C) / (maxA1C - minA1C)) * 100;
  const angle = -90 + (pct / 100) * 180;

  return (
    <div className="a1c-estimator">
      <div className="module-header">
        <div>
          <h1 className="module-title">A1C Estimator</h1>
          <p className="module-subtitle">Estimated HbA1c based on your glucose data</p>
        </div>
      </div>

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
              {/* Track */}
              <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--bg-input)" strokeWidth="12" strokeLinecap="round" />
              {/* Fill */}
              <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#gaugeGrad)" strokeWidth="12" strokeLinecap="round"
                strokeDasharray={`${pct * 2.51} 251`} />
              {/* Needle */}
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
          <div className={`a1c-trend-badge ${improving ? 'a1c-trend--improving' : 'a1c-trend--worsening'}`}>
            {improving ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
            <span>{improving ? '' : '+'}{diff}% from last check</span>
          </div>
        </div>

        <div className="a1c-info-cards">
          <div className="card a1c-info">
            <h3 className="card-title">Based On</h3>
            <div className="a1c-based-on">
              <div className="summary-row">
                <span className="summary-label">Average Glucose</span>
                <span className="summary-value">{currentStats.avgGlucose} mg/dL</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Data Points</span>
                <span className="summary-value">8,432</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Time Period</span>
                <span className="summary-value">90 days</span>
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
              Your estimated A1C of <strong>{current}%</strong> falls within the 
              <span className="badge badge-teal" style={{ margin: '0 4px' }}>Excellent</span>
              range for Type 1 Diabetes management. Keep up the great work!
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">A1C History</h3>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={a1cHistory}>
            <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis domain={[5, 8]} stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} unit="%" />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', color: 'var(--text-light)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }} formatter={(v) => [`${v}%`, 'A1C']} />
            <Line type="monotone" dataKey="value" stroke="#2DD4A8" strokeWidth={2.5} dot={{ r: 5, fill: '#2DD4A8', stroke: '#0D1B16', strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
