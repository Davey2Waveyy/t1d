import { useState } from 'react';
import { User, Ruler, Shield, Palette, Download, Save } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import NumberInput from '../ui/NumberInput';
import './Settings.css';

export default function Settings() {
  const { settings, updateSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [insulinDelivery, setInsulinDelivery] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

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
                <input className="form-input" id="settings-name" placeholder="Your name" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="settings-email">Email</label>
                <input className="form-input" id="settings-email" placeholder="you@example.com" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="settings-dx-date">Diagnosis Date</label>
                <input className="form-input" id="settings-dx-date" type="date" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="settings-delivery">Insulin Delivery</label>
                <select
                  className="form-select"
                  id="settings-delivery"
                  value={insulinDelivery}
                  onChange={(e) => setInsulinDelivery(e.target.value)}
                >
                  <option value="" disabled>Select method...</option>
                  <option value="mdi">Multiple Daily Injections (MDI)</option>
                  <option value="pump">Insulin Pump</option>
                  <option value="pen">Pen</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="settings-timezone">Time Zone</label>
                <select
                  className="form-select"
                  id="settings-timezone"
                  value={localSettings.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                >
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="Europe/London">London (GMT/BST)</option>
                  <option value="Europe/Paris">Central Europe (CET/CEST)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                  <option value="Australia/Sydney">Sydney (AEST/AEDT)</option>
                </select>
              </div>
              <div className="form-group" />
            </div>
          </div>
        </div>

        {/* Glucose & Units */}
        <div className="card settings-section">
          <div className="settings-section-header">
            <Ruler size={18} style={{ color: 'var(--accent-sky)' }} />
            <h3 className="card-title">Glucose & Units</h3>
          </div>
          <div className="settings-form">
            <div className="form-group">
              <label className="form-label">Glucose Unit</label>
              <div className="unit-toggle">
                <button
                  className={`unit-toggle-btn ${localSettings.glucoseUnit === 'mg/dL' ? 'unit-toggle-btn--active' : ''}`}
                  onClick={() => handleChange('glucoseUnit', 'mg/dL')}
                  type="button"
                >
                  mg/dL
                </button>
                <button
                  className={`unit-toggle-btn ${localSettings.glucoseUnit === 'mmol/L' ? 'unit-toggle-btn--active' : ''}`}
                  onClick={() => handleChange('glucoseUnit', 'mmol/L')}
                  type="button"
                >
                  mmol/L
                </button>
              </div>
              <span className="unit-hint">
                {localSettings.glucoseUnit === 'mg/dL'
                  ? 'Used in the US, Japan, and others'
                  : 'Used in the UK, Canada, Australia, and most of Europe'}
              </span>
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
                <label className="form-label" htmlFor="settings-low">
                  Low Threshold ({localSettings.glucoseUnit})
                </label>
                <NumberInput
                  id="settings-low"
                  placeholder={localSettings.glucoseUnit === 'mg/dL' ? '70' : '3.9'}
                  value={localSettings.lowThreshold || ''}
                  onChange={(e) => handleChange('lowThreshold', e.target.value)}
                  step={localSettings.glucoseUnit === 'mg/dL' ? 1 : 0.1}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="settings-high">
                  High Threshold ({localSettings.glucoseUnit})
                </label>
                <NumberInput
                  id="settings-high"
                  placeholder={localSettings.glucoseUnit === 'mg/dL' ? '180' : '10.0'}
                  value={localSettings.highThreshold || ''}
                  onChange={(e) => handleChange('highThreshold', e.target.value)}
                  step={localSettings.glucoseUnit === 'mg/dL' ? 1 : 0.1}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="settings-target">
                  Target Glucose ({localSettings.glucoseUnit})
                </label>
                <NumberInput
                  id="settings-target"
                  placeholder={localSettings.glucoseUnit === 'mg/dL' ? '120' : '6.7'}
                  value={localSettings.targetGlucose || ''}
                  onChange={(e) => handleChange('targetGlucose', e.target.value)}
                  step={localSettings.glucoseUnit === 'mg/dL' ? 1 : 0.1}
                />
              </div>
              <div className="form-group" />
            </div>
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
              <div className="toggle-info">
                <span className="toggle-label">Dark Mode</span>
                <span className="toggle-desc">Use dark theme across the app</span>
              </div>
              <button
                className={`toggle-switch ${localSettings.darkMode ? 'toggle-switch--on' : ''}`}
                onClick={() => handleChange('darkMode', !localSettings.darkMode)}
                aria-label="Toggle dark mode"
                type="button"
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

      <button
        className={`btn ${saved ? 'btn-save-success' : 'btn-primary'}`}
        style={{ alignSelf: 'flex-start' }}
        onClick={handleSave}
      >
        <Save size={16} />
        {saved ? 'Saved!' : 'Save Changes'}
      </button>
    </div>
  );
}
