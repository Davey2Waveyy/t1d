import { useState } from 'react';
import { User, Bell, Palette, Download, Shield } from 'lucide-react';
import './Settings.css';

export default function Settings() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState({ highs: true, lows: true, patterns: true, reminders: false });

  return (
    <div className="settings">
      <div className="module-header">
        <div>
          <h1 className="module-title">Settings</h1>
          <p className="module-subtitle">Manage your profile, preferences, and data</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Profile */}
        <div className="card settings-section">
          <div className="settings-section-header">
            <User size={18} style={{ color: 'var(--accent-teal)' }} />
            <h3 className="card-title">Profile</h3>
          </div>
          <div className="settings-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="settings-name">Name</label>
                <input className="form-input" id="settings-name" defaultValue="User" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="settings-email">Email</label>
                <input className="form-input" id="settings-email" defaultValue="user@betatrace.app" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="settings-dx-date">Diagnosis Date</label>
                <input className="form-input" id="settings-dx-date" type="date" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="settings-delivery">Insulin Delivery</label>
                <select className="form-select" id="settings-delivery">
                  <option>Multiple Daily Injections (MDI)</option>
                  <option>Insulin Pump</option>
                  <option>Pen</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Target Ranges */}
        <div className="card settings-section">
          <div className="settings-section-header">
            <Shield size={18} style={{ color: 'var(--accent-emerald)' }} />
            <h3 className="card-title">Target Ranges</h3>
          </div>
          <div className="settings-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="settings-low">Low Threshold (mg/dL)</label>
                <input className="form-input" id="settings-low" type="number" defaultValue="70" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="settings-high">High Threshold (mg/dL)</label>
                <input className="form-input" id="settings-high" type="number" defaultValue="180" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="settings-target">Target Glucose (mg/dL)</label>
                <input className="form-input" id="settings-target" type="number" defaultValue="120" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="settings-unit">Glucose Unit</label>
                <select className="form-select" id="settings-unit">
                  <option>mg/dL</option>
                  <option>mmol/L</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card settings-section">
          <div className="settings-section-header">
            <Bell size={18} style={{ color: 'var(--accent-amber)' }} />
            <h3 className="card-title">Notifications</h3>
          </div>
          <div className="settings-toggles">
            {[
              { key: 'highs', label: 'High Glucose Alerts' },
              { key: 'lows', label: 'Low Glucose Alerts' },
              { key: 'patterns', label: 'Pattern Notifications' },
              { key: 'reminders', label: 'Meal Logging Reminders' },
            ].map((item) => (
              <div key={item.key} className="toggle-row">
                <span className="toggle-label">{item.label}</span>
                <button
                  className={`toggle-switch ${notifications[item.key] ? 'toggle-switch--on' : ''}`}
                  onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                  aria-label={`Toggle ${item.label}`}
                >
                  <div className="toggle-thumb" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Appearance & Data */}
        <div className="card settings-section">
          <div className="settings-section-header">
            <Palette size={18} style={{ color: 'var(--accent-violet)' }} />
            <h3 className="card-title">Appearance & Data</h3>
          </div>
          <div className="settings-toggles">
            <div className="toggle-row">
              <span className="toggle-label">Dark Mode</span>
              <button
                className={`toggle-switch ${darkMode ? 'toggle-switch--on' : ''}`}
                onClick={() => setDarkMode(!darkMode)}
                aria-label="Toggle dark mode"
              >
                <div className="toggle-thumb" />
              </button>
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-lg)' }}>
            <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
              <Download size={16} /> Export All Data (CSV)
            </button>
          </div>
        </div>
      </div>

      <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Save Changes</button>
    </div>
  );
}
