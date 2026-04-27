import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sheet from '../ui/Sheet';
import Field, { inputCls } from '../ui/Field';
import { addGlucoseReading } from '../../../lib/dataService';

export default function GlucoseLogSheet() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('mg/dL');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const close = () => navigate(state?.background ?? '/dashboard');

  async function submit(event) {
    event.preventDefault();
    if (!value) return;

    setSaving(true);
    setError(null);
    const { error: saveError } = await addGlucoseReading({
      value: Number(value),
      unit,
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
        {error && <p className="text-glucose-low text-body-base">{error}</p>}
        <button
          type="submit"
          disabled={!value || saving}
          className="mt-sm bg-primary text-on-primary py-md rounded-full font-medium disabled:opacity-50 active:scale-[0.98] transition-transform"
        >
          {saving ? 'Saving...' : 'Save reading'}
        </button>
      </form>
    </Sheet>
  );
}
