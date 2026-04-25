import { useEffect, useState } from 'react'
import {
  User,
  Ruler,
  Shield,
  Palette,
  Download,
  Save,
  Lock,
  Brain,
  CloudCog,
  ShieldCheck,
  Eraser,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useSettings } from '../../contexts/SettingsContext'
import { getIntegrationAccess } from '../../lib/dashboardAccess'
import NumberInput from '../ui/NumberInput'
import './Settings.css'

function LockedIntegrationCard({ icon: Icon, title, description, bullets }) {
  return (
    <div className="settings-lock-card">
      <div className="settings-lock-icon">
        <Icon size={18} />
      </div>
      <div className="settings-lock-copy">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
      <ul className="settings-lock-list">
        {bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
    </div>
  )
}

export default function Settings() {
  const { user, profile, isGuest } = useAuth()
  const {
    settings,
    updateSettings,
    clearSessionSettings,
  } = useSettings()
  const access = getIntegrationAccess({ user, isGuest })
  const [localSettings, setLocalSettings] = useState(settings)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const handleSave = () => {
    updateSettings(localSettings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleChange = (key, value) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleClearSessionCredentials = () => {
    clearSessionSettings()
    setLocalSettings((prev) => ({
      ...prev,
      enableAiInsights: false,
      geminiApiKey: '',
      nightscoutUrl: '',
      nightscoutToken: '',
    }))
  }

  return (
    <div className="settings">
      <div className="module-header">
        <div>
          <h1 className="module-title">Settings</h1>
          <p className="module-subtitle">Manage your profile, preferences, and session-only integrations</p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="card settings-section">
          <div className="settings-section-header">
            <User size={18} style={{ color: 'var(--accent-teal)' }} />
            <h3 className="card-title">Account</h3>
          </div>
          <div className="settings-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="settings-name">Display Name</label>
                <input
                  className="form-input"
                  id="settings-name"
                  value={isGuest ? 'Guest Session' : profile?.full_name || 'Betatrace User'}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="settings-email">Email</label>
                <input
                  className="form-input"
                  id="settings-email"
                  value={isGuest ? 'guest@example.com' : user?.email || 'No email available'}
                  readOnly
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <span className="unit-hint settings-note">
                  Guests can explore the product surface, but AI and Nightscout connections unlock only after sign-in.
                </span>
              </div>
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
            <button
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'center' }}
              type="button"
              disabled
            >
              <Download size={16} /> CSV export coming soon
            </button>
          </div>
        </div>

        <div className="card settings-section settings-section--span">
          <div className="settings-section-header">
            <Brain size={18} style={{ color: 'var(--accent-fuchsia)' }} />
            <h3 className="card-title">AI Assistant</h3>
          </div>
          {access.showLockedPreview ? (
            <LockedIntegrationCard
              icon={Lock}
              title="Locked in guest mode"
              description="Signed-in users can enable the assistant and add a Gemini API key for this session."
              bullets={[
                'Ask about recent glucose spikes and meal timing',
                'Use session-only credentials that clear on refresh or sign-out',
                'Keep the UI visible while protecting guest sessions',
              ]}
            />
          ) : (
            <div className="settings-form">
              <div className="toggle-row settings-toggle-row">
                <div className="toggle-info">
                  <span className="toggle-label">Enable AI assistant</span>
                  <span className="toggle-desc">Turns on the dashboard chat experience for this session only</span>
                </div>
                <button
                  className={`toggle-switch ${localSettings.enableAiInsights ? 'toggle-switch--on' : ''}`}
                  onClick={() => handleChange('enableAiInsights', !localSettings.enableAiInsights)}
                  aria-label="Toggle AI assistant"
                  type="button"
                >
                  <div className="toggle-thumb" />
                </button>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="settings-gemini-key">Gemini API Key</label>
                <input
                  id="settings-gemini-key"
                  className="form-input"
                  type="password"
                  autoComplete="off"
                  spellCheck="false"
                  placeholder="Paste your Gemini API key for this session"
                  value={localSettings.geminiApiKey || ''}
                  onChange={(e) => handleChange('geminiApiKey', e.target.value)}
                />
                <span className="unit-hint">
                  Stored in React session state only. Refreshing the app or signing out clears it.
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="card settings-section settings-section--span">
          <div className="settings-section-header">
            <CloudCog size={18} style={{ color: 'var(--accent-sky)' }} />
            <h3 className="card-title">Nightscout & Dexcom Import</h3>
          </div>
          {access.showLockedPreview ? (
            <LockedIntegrationCard
              icon={Lock}
              title="Preview only for guests"
              description="Sign in to connect Nightscout, test sync, and keep import controls in your live dashboard session."
              bullets={[
                'Nightscout URL and token remain in-memory only',
                'Live sync and CSV import stay visible in the right rail',
                'Guests can preview the workflow without connecting anything',
              ]}
            />
          ) : (
            <div className="settings-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="settings-nightscout-url">Nightscout URL</label>
                  <input
                    id="settings-nightscout-url"
                    className="form-input"
                    type="url"
                    autoComplete="off"
                    placeholder="https://your-site.fly.dev"
                    value={localSettings.nightscoutUrl || ''}
                    onChange={(e) => handleChange('nightscoutUrl', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="settings-nightscout-token">Nightscout API Secret</label>
                  <input
                    id="settings-nightscout-token"
                    className="form-input"
                    type="password"
                    autoComplete="off"
                    spellCheck="false"
                    placeholder="Enter your Nightscout API secret"
                    value={localSettings.nightscoutToken || ''}
                    onChange={(e) => handleChange('nightscoutToken', e.target.value)}
                  />
                </div>
              </div>
              <div className="settings-session-strip">
                <div className="settings-session-strip__copy">
                  <ShieldCheck size={16} />
                  <span>These credentials stay in memory only and are never written to localStorage.</span>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  type="button"
                  onClick={handleClearSessionCredentials}
                >
                  <Eraser size={14} /> Clear Session Secrets
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        className={`btn ${saved ? 'btn-save-success' : 'btn-primary'}`}
        style={{ alignSelf: 'flex-start' }}
        onClick={handleSave}
        type="button"
      >
        <Save size={16} />
        {saved ? 'Saved!' : 'Save Changes'}
      </button>
    </div>
  )
}
