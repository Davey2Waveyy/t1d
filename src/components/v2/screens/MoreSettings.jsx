import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { getUserSettings, updateUserSettings } from '../../../lib/dataService';
import { useSettings } from '../../../contexts/SettingsContext';
import { convertGlucoseSettingValue } from '../../../lib/glucoseUnits';
import Field, { inputCls } from '../ui/Field';
import StepperInput from '../ui/StepperInput';
import BackLink from '../ui/BackLink';
import ScreenSkeleton from '../ui/Skeleton';

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
      <span className="material-symbols-outlined text-[20px] text-primary">{icon}</span>
      <h2 className="font-body text-[16px] font-semibold text-text-primary">{title}</h2>
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
  const { settings, updateSettings } = useSettings();
  const [form, setForm] = useState(() => normalizeSettings(settings));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const sectionCls = 'bg-surface-raised border border-border-subtle rounded-lg p-sm sm:p-md flex flex-col gap-sm';

  useEffect(() => {
    let cancelled = false;

    getUserSettings()
      .then(({ data, error }) => {
        if (cancelled) return;
        setForm(normalizeSettings({ ...settings, ...data }));
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

  const setGlucoseUnit = (unit) => {
    setForm((current) => ({
      ...current,
      glucoseUnit: unit,
      targetGlucose: convertGlucoseSettingValue(current.targetGlucose, current.glucoseUnit, unit),
      lowThreshold: convertGlucoseSettingValue(current.lowThreshold, current.glucoseUnit, unit),
      highThreshold: convertGlucoseSettingValue(current.highThreshold, current.glucoseUnit, unit),
      isf: convertGlucoseSettingValue(current.isf, current.glucoseUnit, unit),
    }));
  };

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setStatus(null);

    const { error } = await updateUserSettings(form);
    setSaving(false);

    if (error) {
      setStatus(error.message ?? 'Settings could not save.');
      return;
    }

    updateSettings(form);
    setForm((current) => normalizeSettings(current));
    setStatus('Saved.');
  }

  if (loading) {
    return <ScreenSkeleton hero={false} rows={4} />;
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-md">
      <div className="flex flex-col gap-xs">
        <BackLink to="/dashboard/more" label="More" />
        <h1 className="font-body text-title-lg text-text-primary">Settings</h1>
        <p className="font-body text-body-base text-text-secondary">
          {isGuest ? 'Guest session' : profile?.full_name || user?.email || 'Betatrace user'}
        </p>
      </div>

      {status && (
        <p className={`rounded-lg border px-md py-sm text-body-base ${status === 'Saved.' ? 'border-primary/20 bg-primary/10 text-primary' : 'border-glucose-low/20 bg-glucose-low/10 text-glucose-low'}`}>{status}</p>
      )}

      <section className={sectionCls}>
        {sectionTitle('shield', 'Glucose targets')}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
          <Field label="Glucose unit">
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface-input p-1">
              {['mg/dL', 'mmol/L'].map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => setGlucoseUnit(unit)}
                  className={`rounded-md px-sm py-2 font-mono text-data-mono transition-colors ${
                    form.glucoseUnit === unit ? 'bg-primary text-on-primary' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
          </Field>
          <StepperInput label="Target glucose" unit={form.glucoseUnit} step={form.glucoseUnit === 'mg/dL' ? 1 : 0.1} value={form.targetGlucose} onChange={set('targetGlucose')} placeholder={form.glucoseUnit === 'mg/dL' ? '110' : '6.1'} />
          <StepperInput label="Low threshold" unit={form.glucoseUnit} step={form.glucoseUnit === 'mg/dL' ? 1 : 0.1} value={form.lowThreshold} onChange={set('lowThreshold')} placeholder={form.glucoseUnit === 'mg/dL' ? '70' : '3.9'} />
          <StepperInput label="High threshold" unit={form.glucoseUnit} step={form.glucoseUnit === 'mg/dL' ? 1 : 0.1} value={form.highThreshold} onChange={set('highThreshold')} placeholder={form.glucoseUnit === 'mg/dL' ? '180' : '10.0'} />
        </div>
      </section>

      <section className={sectionCls}>
        {sectionTitle('vaccines', 'Insulin')}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
          <StepperInput label="Breakfast ICR" step={0.5} value={form.icr_breakfast} onChange={set('icr_breakfast')} placeholder="10" />
          <StepperInput label="Lunch ICR" step={0.5} value={form.icr_lunch} onChange={set('icr_lunch')} placeholder="9" />
          <StepperInput label="Dinner ICR" step={0.5} value={form.icr_dinner} onChange={set('icr_dinner')} placeholder="11" />
          <StepperInput label="Snack ICR" step={0.5} value={form.icr_snack} onChange={set('icr_snack')} placeholder="12" />
          <StepperInput label="Correction factor" unit={form.glucoseUnit} step={0.5} value={form.isf} onChange={set('isf')} placeholder={form.glucoseUnit === 'mg/dL' ? '45' : '2.5'} />
        </div>
      </section>

      <section className={sectionCls}>
        {sectionTitle('tune', 'Preferences')}
        <Field label="Time zone">
          <select className={inputCls} value={form.timezone} onChange={set('timezone')}>
            {TIMEZONES.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>
        <div className="flex flex-col gap-sm rounded-lg border border-border-subtle bg-surface-overlay p-sm">
          <div className="flex flex-col">
            <span className="font-body text-body-base text-text-primary">Theme</span>
            <span className="font-mono text-[11px] text-text-secondary">Switch between the ambient dark view and a clean light workspace.</span>
          </div>
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface-input p-1">
            <button
              type="button"
              onClick={() => setForm((current) => ({ ...current, darkMode: true }))}
              className={`rounded-md px-sm py-2 font-mono text-data-mono transition-colors ${form.darkMode ? 'bg-primary text-on-primary' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Dark
            </button>
            <button
              type="button"
              onClick={() => setForm((current) => ({ ...current, darkMode: false }))}
              className={`rounded-md px-sm py-2 font-mono text-data-mono transition-colors ${!form.darkMode ? 'bg-primary text-on-primary' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Light
            </button>
          </div>
        </div>
      </section>

      <button
        type="submit"
        disabled={saving}
        className="bg-primary text-on-primary py-sm rounded-full font-body text-body-base font-semibold shadow-lg shadow-black/20 disabled:opacity-50 active:scale-[0.98] transition-transform"
      >
        {saving ? 'Saving...' : 'Save changes'}
      </button>
    </form>
  );
}
