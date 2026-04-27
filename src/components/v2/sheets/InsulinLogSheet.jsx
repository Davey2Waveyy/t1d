import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sheet from '../ui/Sheet';
import Field, { inputCls } from '../ui/Field';
import { addInsulinDose } from '../../../lib/dataService';
import { useOnline } from '../../../hooks/useOnline';

const TYPES = ['bolus', 'basal', 'correction'];

export default function InsulinLogSheet() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [form, setForm] = useState({ insulin_type: 'bolus', brand: '', units: '', injection_site: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const online = useOnline();

  const close = () => navigate(state?.background ?? '/dashboard');
  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  async function submit(event) {
    event.preventDefault();
    if (!online) return;
    setSaving(true);
    setError(null);
    const { error: saveError } = await addInsulinDose({
      ...form,
      units: Number(form.units) || 0,
      logged_at: new Date().toISOString(),
    });
    setSaving(false);

    if (saveError) {
      setError(saveError.message ?? 'Save failed.');
      return;
    }

    close();
  }

  return (
    <Sheet open onOpenChange={(open) => { if (!open) close(); }} title="Log insulin dose">
      <form onSubmit={submit} className="flex flex-col gap-md">
        <Field label="Type">
          <div className="grid grid-cols-3 gap-sm">
            {TYPES.map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => setForm({ ...form, insulin_type: type })}
                className={`py-sm rounded-lg border text-data-mono font-mono capitalize ${form.insulin_type === type ? 'bg-chart-insulin/20 border-chart-insulin text-chart-insulin' : 'bg-surface-overlay border-border-subtle text-text-secondary'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Units" unit="u">
          <input type="number" inputMode="decimal" step="0.5" autoFocus value={form.units} onChange={set('units')} className={inputCls} />
        </Field>
        <Field label="Brand (optional)">
          <input type="text" value={form.brand} onChange={set('brand')} placeholder="e.g. Humalog" className={inputCls} />
        </Field>
        {!online && <p className="text-glucose-high text-body-base">You're offline - reconnect to save this dose.</p>}
        {error && <p className="text-glucose-low text-body-base">{error}</p>}
        <button type="submit" disabled={!online || saving} className="mt-sm bg-primary text-on-primary py-md rounded-full font-medium disabled:opacity-50 active:scale-[0.98] transition-transform">
          {!online ? 'Offline - try later' : (saving ? 'Saving...' : 'Save dose')}
        </button>
      </form>
    </Sheet>
  );
}
