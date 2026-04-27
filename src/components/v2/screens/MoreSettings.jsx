import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { getUserSettings, updateUserSettings } from '../../../lib/dataService';
import Field, { inputCls } from '../ui/Field';

const DEFAULT_FORM = {
  timezone: 'America/New_York',
  glucoseUnit: 'mg/dL',
  lowThreshold: '',
  highThreshold: '',
  targetGlucose: '',
  darkMode: true,
  icr_breakfast: '',
  icr_lunch: '',
  icr_dinner: '',
  icr_snack: '',
  isf: '',
};

const TIMEZONES = [
  ['America/Los_Angeles', 'Pacific Time (PT)'],
  ['America/Denver', 'Mountain Time (MT)'],
  ['America/Chicago', 'Central Time (CT)'],
  ['America/New_York', 'Eastern Time (ET)'],
  ['Europe/London', 'London (GMT/BST)'],
  ['Europe/Paris', 'Central Europe (CET/CEST)'],
  ['Asia/Tokyo', 'Tokyo (JST)'],
  ['Australia/Sydney', 'Sydney (AEST/AEDT)'],
];

function sectionTitle(icon, title) {
  return (
    <div className="flex items-center gap-sm">
      <span className="material-symbols-outlined text-primary">{icon}</span>
      <h2 className="font-body text-[18px] font-semibold text-text-primary">{title}</h2>
    </div>
  );
}

function normalizeSettings(settings) {
  return {
    ...DEFAULT_FORM,
    ...(settings ?? {}),
    lowThreshold: settings?.lowThreshold ?? settings?.low_threshold ?? DEFAULT_FORM.lowThreshold,
    highThreshold: settings?.highThreshold ?? settings?.high_threshold ?? DEFAULT_FORM.highThreshold,
    targetGlucose: settings?.targetGlucose ?? settings?.target_glucose ?? DEFAULT_FORM.targetGlucose,
    glucoseUnit: settings?.glucoseUnit ?? settings?.glucose_unit ?? DEFAULT_FORM.glucoseUnit,
    darkMode: settings?.darkMode ?? settings?.dark_mode ?? DEFAULT_FORM.darkMode,
  };
}

export default function MoreSettings() {
  const { user, profile, isGuest } = useAuth();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    let cancelled = false;

    getUserSettings()
      .then(({ data, error }) => {
        if (cancelled) return;
        setForm(normalizeSettings(data));
        setStatus(error && error.code !== 'PGRST116' ? 'Settings could not load. Defaults are shown.' : null);
      })
      .catch(() => {
        if (!cancelled) setStatus('Settings could not load. Defaults are shown.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const set = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
  };

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setStatus(null);

    const { error } = await updateUserSettings(form);
    setSaving(false);
    setStatus(error ? (error.message ?? 'Settings could not save.') : 'Saved.');
  }

  if (loading) {
    return <div className="p-md text-text-secondary">Loading...</div>;
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-lg">
      <div className="flex flex-col gap-xs">
        <h1 className="font-body text-title-lg text-text-primary">Settings</h1>
        <p className="font-body text-body-base text-text-secondary">
          {isGuest ? 'Guest session' : profile?.full_name || user?.email || 'Betatrace user'}
        </p>
      </div>

      {status && (
        <p className={`text-body-base ${status === 'Saved.' ? 'text-primary' : 'text-glucose-low'}`}>{status}</p>
      )}

      <section className="bg-surface-raised border border-border-subtle rounded-xl p-md flex flex-col gap-md">
        {sectionTitle('shield', 'Glucose targets')}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
          <Field label="Glucose unit">
            <select className={inputCls} value={form.glucoseUnit} onChange={set('glucoseUnit')}>
              <option value="mg/dL">mg/dL</option>
              <option value="mmol/L">mmol/L</option>
            </select>
          </Field>
          <Field label="Target glucose" unit={form.glucoseUnit}>
            <input className={inputCls} type="number" step={form.glucoseUnit === 'mg/dL' ? '1' : '0.1'} value={form.targetGlucose} onChange={set('targetGlucose')} />
          </Field>
          <Field label="Low threshold" unit={form.glucoseUnit}>
            <input className={inputCls} type="number" step={form.glucoseUnit === 'mg/dL' ? '1' : '0.1'} value={form.lowThreshold} onChange={set('lowThreshold')} />
          </Field>
          <Field label="High threshold" unit={form.glucoseUnit}>
            <input className={inputCls} type="number" step={form.glucoseUnit === 'mg/dL' ? '1' : '0.1'} value={form.highThreshold} onChange={set('highThreshold')} />
          </Field>
        </div>
      </section>

      <section className="bg-surface-raised border border-border-subtle rounded-xl p-md flex flex-col gap-md">
        {sectionTitle('vaccines', 'Insulin')}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
          <Field label="Breakfast ICR">
            <input className={inputCls} type="number" step="0.1" value={form.icr_breakfast} onChange={set('icr_breakfast')} />
          </Field>
          <Field label="Lunch ICR">
            <input className={inputCls} type="number" step="0.1" value={form.icr_lunch} onChange={set('icr_lunch')} />
          </Field>
          <Field label="Dinner ICR">
            <input className={inputCls} type="number" step="0.1" value={form.icr_dinner} onChange={set('icr_dinner')} />
          </Field>
          <Field label="Snack ICR">
            <input className={inputCls} type="number" step="0.1" value={form.icr_snack} onChange={set('icr_snack')} />
          </Field>
          <Field label="Correction factor" unit={form.glucoseUnit}>
            <input className={inputCls} type="number" step="0.1" value={form.isf} onChange={set('isf')} />
          </Field>
        </div>
      </section>

      <section className="bg-surface-raised border border-border-subtle rounded-xl p-md flex flex-col gap-md">
        {sectionTitle('tune', 'Preferences')}
        <Field label="Time zone">
          <select className={inputCls} value={form.timezone} onChange={set('timezone')}>
            {TIMEZONES.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>
        <label className="flex items-center justify-between gap-md bg-surface-overlay border border-border-subtle rounded-lg p-md">
          <span className="flex flex-col">
            <span className="font-body text-body-base text-text-primary">Dark mode</span>
            <span className="font-mono text-[11px] text-text-secondary">Use the ambient dark theme.</span>
          </span>
          <input type="checkbox" checked={Boolean(form.darkMode)} onChange={set('darkMode')} className="h-5 w-5 accent-primary" />
        </label>
      </section>

      <button
        type="submit"
        disabled={saving}
        className="bg-primary text-on-primary py-md rounded-full font-body text-body-base font-medium disabled:opacity-50 active:scale-[0.98] transition-transform"
      >
        {saving ? 'Saving...' : 'Save changes'}
      </button>
    </form>
  );
}
