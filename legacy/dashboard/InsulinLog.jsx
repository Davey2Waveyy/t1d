import { useState, useEffect } from 'react';
import { Plus, Syringe, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getInsulinDoses, addInsulinDose, calculateInsulinBreakdown } from '../../lib/dataService';
import { useSettings } from '../../contexts/SettingsContext';
import NumberInput from '../ui/NumberInput';
import EmptyState from '../ui/EmptyState';
import './InsulinLog.css';

export default function InsulinLog() {
  const { formatTime, getLocalDatetimeValue } = useSettings();
  const [doses, setDoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    units: '',
    insulin_type: 'bolus',
    brand: 'Humalog',
    injection_site: 'Abdomen',
    notes: '',
    logged_at: getLocalDatetimeValue(),
  });

  useEffect(() => {
    loadDoses();
  }, []);

  async function loadDoses() {
    setLoading(true);
    const { data, error } = await getInsulinDoses(50);
    if (error) {
      console.error('Error loading insulin doses:', error);
    } else {
      setDoses(data);
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.units || Number(formData.units) <= 0) {
      setError('Please enter a valid insulin amount');
      return;
    }

    setSaving(true);
    const doseData = {
      units: Number(formData.units),
      insulin_type: formData.insulin_type,
      brand: formData.brand,
      injection_site: formData.injection_site,
      notes: formData.notes.trim() || null,
      logged_at: formData.logged_at ? new Date(formData.logged_at).toISOString() : new Date().toISOString(),
    };

    const { data, error } = await addInsulinDose(doseData);
    setSaving(false);

    if (error) {
      setError(error.message || 'Failed to save dose');
    } else {
      setSuccess('Insulin dose logged successfully!');
      setDoses([data, ...doses]);
      setFormData({
        units: '',
        insulin_type: 'bolus',
        brand: 'Humalog',
        injection_site: 'Abdomen',
        notes: '',
        logged_at: getLocalDatetimeValue(),
      });
      setTimeout(() => setSuccess(''), 3000);
    }
  }

  const insulinBreakdown = calculateInsulinBreakdown(doses);
  const hasChartData = insulinBreakdown.some(day => day.bolus > 0 || day.basal > 0 || day.correction > 0);

  if (loading) {
    return (
      <div className="insulin-log">
        <div className="module-header">
          <div>
            <h1 className="module-title">Insulin Log</h1>
            <p className="module-subtitle">Track your insulin doses and daily usage</p>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-2xl)' }}>
          <Loader2 size={32} className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="insulin-log">
      <div className="module-header">
        <div>
          <h1 className="module-title">Insulin Log</h1>
          <p className="module-subtitle">Track your insulin doses and daily usage</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => document.getElementById('insulin-amount')?.focus()}>
          <Plus size={16} /> Add Dose
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="insulin-grid">
        <div className="card insulin-form">
          <h3 className="card-title">Log Insulin Dose</h3>
          <form className="insulin-form-inner" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="insulin-amount">Units *</label>
                <NumberInput
                  id="insulin-amount"
                  step="0.5"
                  placeholder="0"
                  value={formData.units}
                  onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                  disabled={saving}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="insulin-type">Type</label>
                <select
                  className="form-select"
                  id="insulin-type"
                  value={formData.insulin_type}
                  onChange={(e) => setFormData({ ...formData, insulin_type: e.target.value })}
                  disabled={saving}
                >
                  <option value="bolus">Bolus (Rapid)</option>
                  <option value="basal">Basal (Long-acting)</option>
                  <option value="correction">Correction</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="insulin-brand">Brand</label>
                <select
                  className="form-select"
                  id="insulin-brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  disabled={saving}
                >
                  <option>Humalog</option>
                  <option>NovoLog</option>
                  <option>Lantus</option>
                  <option>Tresiba</option>
                  <option>Fiasp</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="insulin-site">Site</label>
                <select
                  className="form-select"
                  id="insulin-site"
                  value={formData.injection_site}
                  onChange={(e) => setFormData({ ...formData, injection_site: e.target.value })}
                  disabled={saving}
                >
                  <option>Abdomen</option>
                  <option>Thigh</option>
                  <option>Arm</option>
                  <option>Hip</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="insulin-time">Time</label>
              <input
                className="form-input"
                id="insulin-time"
                type="datetime-local"
                value={formData.logged_at}
                onChange={(e) => setFormData({ ...formData, logged_at: e.target.value })}
                disabled={saving}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={saving}
            >
              {saving ? <><Loader2 size={16} className="spinner" /> Saving...</> : 'Save Dose'}
            </button>
          </form>
        </div>

        <div className="card insulin-chart">
          <h3 className="card-title">Weekly Insulin Breakdown</h3>
          {hasChartData ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={insulinBreakdown} barGap={2}>
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} unit="u" />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-light)',
                    fontSize: '0.85rem',
                  }}
                  formatter={(value) => [`${value}u`]}
                />
                <Legend wrapperStyle={{ fontSize: '0.8rem', fontFamily: 'var(--font-sans)' }} />
                <Bar dataKey="basal" name="Basal" fill="#38BDF8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="bolus" name="Bolus" fill="#2DD4A8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="correction" name="Correction" fill="#FBBF24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              icon={Syringe}
              title="No insulin data yet"
              description="Log insulin doses to see your weekly breakdown"
            />
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Doses</h3>
        </div>

        {doses.length === 0 ? (
          <EmptyState
            icon={Syringe}
            title="No insulin doses logged yet"
            description="Log your first insulin dose to start tracking"
            action="Log Dose"
            onAction={() => document.getElementById('insulin-amount')?.focus()}
          />
        ) : (
          <div className="meals-table">
            <div className="table-header">
              <span>Amount</span>
              <span>Type</span>
              <span>Brand</span>
              <span>Site</span>
              <span>Time</span>
            </div>
            {doses.map((dose) => (
              <div key={dose.id} className="table-row">
                <span className="meal-name-cell">
                  <div className="meal-type-icon" style={{ background: 'var(--accent-sky-dim)', color: 'var(--accent-sky)' }}>
                    <Syringe size={14} />
                  </div>
                  <strong>{dose.units}u</strong>
                </span>
                <span>
                  <span className={`badge ${
                    dose.insulin_type === 'bolus' ? 'badge-teal' :
                    dose.insulin_type === 'basal' ? 'badge-sky' : 'badge-amber'
                  }`}>
                    {dose.insulin_type}
                  </span>
                </span>
                <span className="text-data">{dose.brand}</span>
                <span className="text-data">{dose.injection_site}</span>
                <span className="text-data table-time">
                  {formatTime(dose.logged_at, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
