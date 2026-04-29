import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sheet from '../ui/Sheet';
import Field, { inputCls } from '../ui/Field';
import { addMeal } from '../../../lib/dataService';
import { useOnline } from '../../../hooks/useOnline';

const TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function MealLogSheet() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [form, setForm] = useState({ meal_type: 'breakfast', food_name: '', carbs: '', protein: '', fat: '', notes: '' });
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
    const { error: saveError } = await addMeal({
      ...form,
      carbs: Number(form.carbs) || 0,
      protein: form.protein ? Number(form.protein) : null,
      fat: form.fat ? Number(form.fat) : null,
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
    <Sheet open onOpenChange={(open) => { if (!open) close(); }} title="Log meal">
      <form onSubmit={submit} className="flex flex-col gap-md">
        <Field label="Type">
          <div className="grid grid-cols-4 gap-sm">
            {TYPES.map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => setForm({ ...form, meal_type: type })}
                className={`py-sm rounded-lg border text-data-mono font-mono capitalize ${form.meal_type === type ? 'bg-chart-carbs/20 border-chart-carbs text-chart-carbs' : 'bg-surface-overlay border-border-subtle text-text-secondary'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </Field>
        <Field label="What did you eat?">
          <input type="text" value={form.food_name} onChange={set('food_name')} placeholder="e.g. Oatmeal and berries" className={inputCls} />
        </Field>
        <Field label="Carbs" unit="g">
          <input type="number" inputMode="decimal" autoFocus value={form.carbs} onChange={set('carbs')} className={inputCls} />
        </Field>
        <Field label="Note">
          <textarea
            value={form.notes}
            onChange={set('notes')}
            rows={3}
            placeholder="Timing, symptoms, activity, or anything worth remembering"
            className={`${inputCls} resize-none leading-relaxed`}
          />
        </Field>
        {!online && <p className="text-glucose-high text-body-base">You're offline - reconnect to save this meal.</p>}
        {error && <p className="text-glucose-low text-body-base">{error}</p>}
        <button type="submit" disabled={!online || saving} className="mt-sm bg-primary text-on-primary py-md rounded-full font-medium disabled:opacity-50 active:scale-[0.98] transition-transform">
          {!online ? 'Offline - try later' : (saving ? 'Saving...' : 'Save meal')}
        </button>
      </form>
    </Sheet>
  );
}
