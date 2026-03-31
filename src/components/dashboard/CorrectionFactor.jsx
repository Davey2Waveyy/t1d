import { useState } from 'react';
import { Gauge, Clock } from 'lucide-react';
import { correctionFactorData } from '../../data/mockData';
import { useSettings } from '../../contexts/SettingsContext';
import NumberInput from '../ui/NumberInput';
import './CorrectionFactor.css';

export default function CorrectionFactor() {
  const { settings } = useSettings();
  const [currentGlucose, setCurrentGlucose] = useState('');
  const [targetGlucose, setTargetGlucose] = useState(settings.targetGlucose || (settings.glucoseUnit === 'mg/dL' ? 120 : 6.7));

  // Determine sensitivity from global data or settings
  const isf = correctionFactorData.overall || (settings.glucoseUnit === 'mg/dL' ? 40 : 2.2);

  const calculateCorrection = () => {
    if (!currentGlucose || !targetGlucose) return '—';
    const curr = parseFloat(currentGlucose);
    const target = parseFloat(targetGlucose);
    if (curr <= target) return '0.0u';
    
    const dose = (curr - target) / isf;
    return dose > 0 ? `${dose.toFixed(1)}u` : '0.0u';
  };

  const suggestedDose = calculateCorrection();

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
          <span className="cf-hero-value">{correctionFactorData.overall ? `1:${correctionFactorData.overall}` : '—'}</span>
          <span className="cf-hero-explain">
            {correctionFactorData.overall
              ? `1 unit of insulin lowers glucose by ~${correctionFactorData.overall} ${settings.glucoseUnit}`
              : 'Connect Dexcom or log data to calculate your ISF'}
          </span>
        </div>
      </div>

      <div className="cf-grid">
        {correctionFactorData.byTimeOfDay.length > 0 ? (
          correctionFactorData.byTimeOfDay.map((period) => (
            <div key={period.period} className="card cf-period-card">
              <div className="cf-period-header">
                <Clock size={16} style={{ color: 'var(--accent-teal)' }} />
                <span className="cf-period-label">{period.label}</span>
              </div>
              <div className="cf-period-value">1:{period.factor}</div>
              <div className="cf-period-bar">
                <div className="cf-period-bar-fill" style={{ width: `${(period.factor / (settings.glucoseUnit === 'mg/dL' ? 60 : 3.3)) * 100}%` }} />
              </div>
              <span className="cf-period-desc">~{period.factor} {settings.glucoseUnit} per unit</span>
            </div>
          ))
        ) : (
          <div className="empty-state-mini" style={{ gridColumn: '1 / -1', padding: 'var(--space-xl)' }}>
            <p>No time-of-day data available</p>
          </div>
        )}
      </div>

      <div className="card cf-calculator">
        <h3 className="card-title">Correction Calculator</h3>
        <p className="card-subtitle">Calculate a correction dose based on your current glucose</p>
        <form className="cf-calc-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="cf-current">Current Glucose ({settings.glucoseUnit})</label>
              <NumberInput
                id="cf-current"
                placeholder={settings.glucoseUnit === 'mg/dL' ? '220' : '12.2'}
                value={currentGlucose}
                onChange={(e) => setCurrentGlucose(e.target.value)}
                step={settings.glucoseUnit === 'mg/dL' ? 1 : 0.1}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="cf-target">Target Glucose ({settings.glucoseUnit})</label>
              <NumberInput
                id="cf-target"
                placeholder={settings.glucoseUnit === 'mg/dL' ? '120' : '6.7'}
                value={targetGlucose}
                onChange={(e) => setTargetGlucose(e.target.value)}
                step={settings.glucoseUnit === 'mg/dL' ? 1 : 0.1}
              />
            </div>
          </div>
          <div className="cf-result">
            <span className="cf-result-label">Suggested Correction</span>
            <span className="cf-result-value">{suggestedDose}</span>
            <span className="cf-result-note">
              {correctionFactorData.overall || settings.targetGlucose
                ? `Based on ISF of 1:${isf} and target of ${targetGlucose} ${settings.glucoseUnit}`
                : 'Insufficient data for active calculations'}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
