import { useState } from 'react';
import { AlertTriangle, AlertCircle, Info, X, BellOff, ChevronRight } from 'lucide-react';
import { patternAlerts } from '../../data/mockData';
import './PatternAlerts.css';

const severityConfig = {
  critical: { icon: AlertTriangle, color: 'rose', label: 'Critical' },
  warning: { icon: AlertCircle, color: 'amber', label: 'Warning' },
  info: { icon: Info, color: 'teal', label: 'Info' },
};

export default function PatternAlerts() {
  const [dismissed, setDismissed] = useState([]);
  const active = patternAlerts.filter((a) => !dismissed.includes(a.id));

  return (
    <div className="pattern-alerts">
      <div className="module-header">
        <div>
          <h1 className="module-title">Pattern Alerts</h1>
          <p className="module-subtitle">Detected patterns and actionable recommendations</p>
        </div>
        <div className="alert-summary">
          <span className="badge badge-rose">{active.filter(a => a.severity === 'critical').length} Critical</span>
          <span className="badge badge-amber">{active.filter(a => a.severity === 'warning').length} Warning</span>
          <span className="badge badge-teal">{active.filter(a => a.severity === 'info').length} Info</span>
        </div>
      </div>

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
                    <span className="alert-time">{new Date(alert.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
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
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No active pattern alerts. We'll notify you when we detect something.</p>
          </div>
        )}
      </div>
    </div>
  );
}
