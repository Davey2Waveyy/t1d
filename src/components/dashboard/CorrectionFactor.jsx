import { Gauge, Clock } from 'lucide-react';
import { correctionFactorData } from '../../data/mockData';
import './CorrectionFactor.css';

export default function CorrectionFactor() {
  return (
    <div className="correction-factor">
      <div className="module-header">
        <div>
          <h1 className="module-title">Correction Factor</h1>
          <p className="module-subtitle">Your Insulin Sensitivity Factor (ISF) by time of day</p>
        </div>
      </div>

      <div className="cf-hero card">
        <div className="cf-hero-icon"><Gauge size={32} /></div>
        <div className="cf-hero-content">
          <span className="cf-hero-label">Overall Correction Factor</span>
          <span className="cf-hero-value">1:{correctionFactorData.overall}</span>
          <span className="cf-hero-explain">1 unit of insulin lowers glucose by ~{correctionFactorData.overall} mg/dL</span>
        </div>
      </div>

      <div className="cf-grid">
        {correctionFactorData.byTimeOfDay.map((period) => (
          <div key={period.period} className="card cf-period-card">
            <div className="cf-period-header">
              <Clock size={16} style={{ color: 'var(--accent-teal)' }} />
              <span className="cf-period-label">{period.label}</span>
            </div>
            <div className="cf-period-value">1:{period.factor}</div>
            <div className="cf-period-bar">
              <div className="cf-period-bar-fill" style={{ width: `${(period.factor / 60) * 100}%` }} />
            </div>
            <span className="cf-period-desc">~{period.factor} mg/dL per unit</span>
          </div>
        ))}
      </div>

      <div className="card cf-calculator">
        <h3 className="card-title">Correction Calculator</h3>
        <p className="card-subtitle">Calculate a correction dose based on your current glucose</p>
        <form className="cf-calc-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="cf-current">Current Glucose (mg/dL)</label>
              <input className="form-input" id="cf-current" type="number" placeholder="e.g. 220" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="cf-target">Target Glucose (mg/dL)</label>
              <input className="form-input" id="cf-target" type="number" placeholder="e.g. 120" defaultValue="120" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Calculate Correction</button>
          <div className="cf-result">
            <span className="cf-result-label">Suggested Correction</span>
            <span className="cf-result-value">2.5u</span>
            <span className="cf-result-note">Based on ISF of 1:{correctionFactorData.overall} and target of 120 mg/dL</span>
          </div>
        </form>
      </div>
    </div>
  );
}
