import { Brain, TrendingUp, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { icrData } from '../../data/mockData';
import './ICRPredictor.css';

export default function ICRPredictor() {
  return (
    <div className="icr-predictor">
      <div className="module-header">
        <div>
          <h1 className="module-title">ICR Predictor</h1>
          <p className="module-subtitle">AI-predicted insulin-to-carb ratios based on your data</p>
        </div>
      </div>

      <div className="icr-hero card">
        <div className="icr-hero-badge"><Brain size={16} /> Predictive Model</div>
        <div className="icr-hero-ratio">
          <span className="icr-ratio-label">Overall Predicted ICR</span>
          <span className="icr-ratio-value">{icrData.overall.ratio}</span>
          <span className="icr-ratio-sub">1 unit of insulin per 10g of carbs</span>
        </div>
        <div className="icr-confidence">
          <div className="icr-confidence-bar">
            <div className="icr-confidence-fill" style={{ width: `${icrData.overall.confidence}%` }} />
          </div>
          <span className="icr-confidence-label">{icrData.overall.confidence}% Confidence</span>
        </div>
      </div>

      <div className="icr-grid">
        {Object.entries(icrData.byMeal).map(([meal, data]) => (
          <div key={meal} className="card icr-meal-card">
            <div className="icr-meal-type">{meal.charAt(0).toUpperCase() + meal.slice(1)}</div>
            <div className="icr-meal-ratio">{data.ratio}</div>
            <div className="icr-meal-meta">
              <div className="icr-confidence-mini">
                <div className="icr-confidence-bar-mini"><div className="icr-confidence-fill-mini" style={{ width: `${data.confidence}%` }} /></div>
                <span>{data.confidence}%</span>
              </div>
              <span className="icr-meals-count">{data.mealsLogged} meals logged</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card icr-trend-chart">
        <div className="card-header">
          <h3 className="card-title">ICR Trend (6 Months)</h3>
          <div className="flex items-center gap-sm">
            <Info size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Higher = fewer units needed per gram</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={icrData.trend}>
            <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis domain={[7, 13]} stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', color: 'var(--text-light)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }} formatter={(v) => [`1:${v}`, 'ICR']} />
            <Line type="monotone" dataKey="ratio" stroke="#A78BFA" strokeWidth={2.5} dot={{ r: 4, fill: '#A78BFA', stroke: '#0D1B16', strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
