import { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, X, BellOff, ChevronRight, Loader2, Activity } from 'lucide-react';
import { getGlucoseReadings, getMeals, getInsulinDoses } from '../../lib/dataService';
import EmptyState from '../ui/EmptyState';
import './PatternAlerts.css';

const severityConfig = {
  critical: { icon: AlertTriangle, color: 'rose', label: 'Critical' },
  warning: { icon: AlertCircle, color: 'amber', label: 'Warning' },
  info: { icon: Info, color: 'teal', label: 'Info' },
};

function detectPatterns(readings, meals, doses) {
  const alerts = [];
  const now = Date.now();

  if (readings.length < 10) return alerts;

  // Group readings by time of day
  const byHour = {};
  readings.forEach((r) => {
    const hour = new Date(r.recorded_at).getHours();
    if (!byHour[hour]) byHour[hour] = [];
    byHour[hour].push(r.value);
  });

  // Detect overnight lows (12am - 6am)
  const overnightReadings = readings.filter((r) => {
    const hour = new Date(r.recorded_at).getHours();
    return hour >= 0 && hour < 6;
  });
  const overnightLows = overnightReadings.filter((r) => r.value < 70);
  if (overnightLows.length >= 2 && overnightReadings.length >= 5) {
    const pct = Math.round((overnightLows.length / overnightReadings.length) * 100);
    if (pct >= 15) {
      alerts.push({
        id: 'overnight-lows',
        severity: 'critical',
        title: 'Overnight Lows Detected',
        description: `${overnightLows.length} low readings detected between 12-6 AM. This may indicate your basal rate is too high overnight.`,
        pattern: `${pct}% of overnight readings below 70`,
        actionable: 'Consider reducing overnight basal rate',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Detect post-breakfast highs (8am - 11am)
  const morningReadings = readings.filter((r) => {
    const hour = new Date(r.recorded_at).getHours();
    return hour >= 8 && hour < 11;
  });
  const morningHighs = morningReadings.filter((r) => r.value > 180);
  if (morningHighs.length >= 3 && morningReadings.length >= 5) {
    const pct = Math.round((morningHighs.length / morningReadings.length) * 100);
    if (pct >= 40) {
      alerts.push({
        id: 'morning-highs',
        severity: 'warning',
        title: 'Post-Breakfast Highs',
        description: `Glucose frequently exceeds 180 mg/dL in the morning hours. Consider adjusting your breakfast ICR.`,
        pattern: `${pct}% of morning readings above target`,
        actionable: 'Try a more aggressive breakfast ICR (e.g., 1:8 instead of 1:10)',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Detect afternoon stability (good pattern)
  const afternoonReadings = readings.filter((r) => {
    const hour = new Date(r.recorded_at).getHours();
    return hour >= 14 && hour < 18;
  });
  const afternoonInRange = afternoonReadings.filter((r) => r.value >= 70 && r.value <= 180);
  if (afternoonReadings.length >= 10) {
    const pct = Math.round((afternoonInRange.length / afternoonReadings.length) * 100);
    if (pct >= 80) {
      alerts.push({
        id: 'afternoon-stable',
        severity: 'info',
        title: 'Afternoon Stability',
        description: `Your glucose is consistently in range during afternoon hours. Great control!`,
        pattern: `${pct}% time in range (2-6 PM)`,
        actionable: 'Current afternoon settings are working well',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Detect high variability
  if (readings.length >= 20) {
    const values = readings.map((r) => r.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
    const sd = Math.sqrt(variance);
    const cv = (sd / avg) * 100;

    if (cv > 36) {
      alerts.push({
        id: 'high-variability',
        severity: 'warning',
        title: 'High Glucose Variability',
        description: `Your glucose levels show high variability (CV: ${Math.round(cv)}%). Target is <36%.`,
        pattern: 'Coefficient of Variation above target',
        actionable: 'Focus on consistent meal timing and carb counting',
        timestamp: new Date().toISOString(),
      });
    }
  }

  return alerts;
}

export default function PatternAlerts() {
  const [loading, setLoading] = useState(true);
  const [readings, setReadings] = useState([]);
  const [meals, setMeals] = useState([]);
  const [doses, setDoses] = useState([]);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [readingsRes, mealsRes, dosesRes] = await Promise.all([
      getGlucoseReadings(168), // 7 days
      getMeals(50),
      getInsulinDoses(50),
    ]);
    setReadings(readingsRes.data || []);
    setMeals(mealsRes.data || []);
    setDoses(dosesRes.data || []);
    setLoading(false);
  }

  const patternAlerts = detectPatterns(readings, meals, doses);
  const active = patternAlerts.filter((a) => !dismissed.includes(a.id));
  const hasEnoughData = readings.length >= 10;

  if (loading) {
    return (
      <div className="pattern-alerts">
        <div className="module-header">
          <div>
            <h1 className="module-title">Pattern Alerts</h1>
            <p className="module-subtitle">Detected patterns and actionable recommendations</p>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-2xl)' }}>
          <Loader2 size={32} className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="pattern-alerts">
      <div className="module-header">
        <div>
          <h1 className="module-title">Pattern Alerts</h1>
          <p className="module-subtitle">Detected patterns and actionable recommendations</p>
        </div>
        {hasEnoughData && patternAlerts.length > 0 && (
          <div className="alert-summary">
            <span className="badge badge-rose">{active.filter(a => a.severity === 'critical').length} Critical</span>
            <span className="badge badge-amber">{active.filter(a => a.severity === 'warning').length} Warning</span>
            <span className="badge badge-teal">{active.filter(a => a.severity === 'info').length} Info</span>
          </div>
        )}
      </div>

      {!hasEnoughData ? (
        <div className="card">
          <EmptyState
            icon={Activity}
            title="Not enough data for pattern detection"
            description="Log at least 10 glucose readings over several days to enable pattern detection. The more data you log, the better patterns we can find."
          />
        </div>
      ) : (
        <div className="alerts-list">
          {active.map((alert) => {
            const config = severityConfig[alert.severity];
            const Icon = config.icon;
            return (
              <div key={alert.id} className={`card alert-card alert-card--${config.color}`}>
                <div className="alert-card-top">
                  <div className={`alert-icon alert-icon--${config.color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="alert-content">
                    <div className="alert-title-row">
                      <h3 className="alert-title">{alert.title}</h3>
                      <span className={`badge badge-${config.color}`}>{config.label}</span>
                    </div>
                    <p className="alert-desc">{alert.description}</p>
                    <div className="alert-meta">
                      <span className="alert-pattern">{alert.pattern}</span>
                      <span className="alert-time">Based on last 7 days</span>
                    </div>
                  </div>
                  <button className="alert-dismiss" onClick={() => setDismissed([...dismissed, alert.id])} aria-label="Dismiss alert">
                    <X size={16} />
                  </button>
                </div>
                <div className="alert-action">
                  <ChevronRight size={14} />
                  <span className="alert-action-text">{alert.actionable}</span>
                </div>
              </div>
            );
          })}

          {active.length === 0 && (
            <div className="card alerts-empty">
              <BellOff size={48} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
              <h3 style={{ color: 'var(--text-light)', fontFamily: 'var(--font-sans)', fontSize: '1.1rem' }}>All clear!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {patternAlerts.length === 0
                  ? "No patterns detected yet. Keep logging data and we'll analyze it."
                  : "No active pattern alerts. We'll notify you when we detect something."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
