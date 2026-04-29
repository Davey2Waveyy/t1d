import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sheet from '../ui/Sheet';
import Field, { inputCls } from '../ui/Field';
import { addGlucoseReading } from '../../../lib/dataService';
import { useOnline } from '../../../hooks/useOnline';
import { useSettings } from '../../../contexts/SettingsContext';
import { toMgDl } from '../../../lib/glucoseUnits';

export default function GlucoseLogSheet() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { settings } = useSettings();
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState(settings.glucoseUnit ?? 'mg/dL');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const online = useOnline();

  const close = () => navigate(state?.background ?? '/dashboard');

  async function submit(event) {
    event.preventDefault();
    if (!value || !online) return;

    setSaving(true);
    setError(null);
    const { error: saveError } = await addGlucoseReading({
      value: toMgDl(value, unit),
      unit,
      notes,
      recorded_at: new Date().toISOString(),
    });
    setSaving(false);

    if (saveError) {
      setError(saveError.message ?? 'Save failed - check connection.');
      return;
    }

    close();
  }

  return (
    <Sheet open onOpenChange={(open) => { if (!open) close(); }} title="Log glucose reading">
      <form onSubmit={submit} className="flex flex-col gap-md">
        <Field label="Reading" unit={unit}>
          <input
            type="number"
            inputMode="decimal"
            autoFocus
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="e.g. 108"
            className={inputCls}
          />
        </Field>
        <Field label="Unit">
          <div className="flex gap-sm">
            {['mg/dL', 'mmol/L'].map((u) => (
              <button
                type="button"
                key={u}
                onClick={() => setUnit(u)}
                className={`flex-1 py-sm rounded-lg border text-data-mono font-mono ${unit === u ? 'bg-primary/20 border-primary text-primary' : 'bg-surface-overlay border-border-subtle text-text-secondary'}`}
              >
                {u}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Note">
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            placeholder="Meal context, symptoms, activity, or sensor check"
            className={`${inputCls} resize-none leading-relaxed`}
          />
        </Field>
        {!online && <p className="text-glucose-high text-body-base">You're offline - reconnect to save this reading.</p>}
        {error && <p className="text-glucose-low text-body-base">{error}</p>}
        <button
          type="submit"
          disabled={!online || !value || saving}
          className="mt-sm bg-primary text-on-primary py-md rounded-full font-medium disabled:opacity-50 active:scale-[0.98] transition-transform"
        >
          {!online ? 'Offline - try later' : (saving ? 'Saving...' : 'Save reading')}
        </button>
      </form>
    </Sheet>
  );
}
