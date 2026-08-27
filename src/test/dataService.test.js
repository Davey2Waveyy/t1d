import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getDemoSnapshot,
  addDemoEntryBatch,
  resetDemoData,
  subscribeToDemoDataChanges,
  updateUserSettings,
  getUserSettings,
  DemoValidationError,
} from '../lib/dataService';

beforeEach(() => {
  localStorage.clear();
});

describe('getDemoSnapshot', () => {
  it('returns the seeded synthetic data when nothing has been added', () => {
    const snapshot = getDemoSnapshot();
    expect(snapshot.glucose.length).toBeGreaterThan(0);
    expect(snapshot.meals.length).toBeGreaterThan(0);
    expect(snapshot.insulin.length).toBeGreaterThan(0);
  });
});

describe('addDemoEntryBatch', () => {
  it('creates all requested record types in one atomic write', () => {
    const created = addDemoEntryBatch({
      glucose: { value: 120, unit: 'mg/dL' },
      meal: { foodName: 'Toast', carbs: 30, mealType: 'breakfast' },
      insulin: { units: 4, insulinType: 'bolus' },
    });

    expect(created.glucose).toBeTruthy();
    expect(created.meal).toBeTruthy();
    expect(created.insulin).toBeTruthy();

    const snapshot = getDemoSnapshot();
    expect(snapshot.glucose[0].id).toBe(created.glucose.id);
    expect(snapshot.meals[0].id).toBe(created.meal.id);
    expect(snapshot.insulin[0].id).toBe(created.insulin.id);
  });

  it('defaults provenance to manual and allows overriding to webmcp', () => {
    const manual = addDemoEntryBatch({ glucose: { value: 100, unit: 'mg/dL' } });
    expect(manual.glucose.source).toBe('manual');

    const agent = addDemoEntryBatch({ glucose: { value: 100, unit: 'mg/dL' }, source: 'webmcp' });
    expect(agent.glucose.source).toBe('webmcp');
  });

  it('converts mmol/L input to mg/dL for storage', () => {
    const created = addDemoEntryBatch({ glucose: { value: 6.1, unit: 'mmol/L' } });
    expect(created.glucose.value).toBeCloseTo(109.8, 1);
  });

  it('rejects a request with none of glucose, meal, or insulin, and writes nothing', () => {
    const before = getDemoSnapshot();
    expect(() => addDemoEntryBatch({})).toThrow(DemoValidationError);
    expect(getDemoSnapshot()).toEqual(before);
  });

  it('validates the entire request before writing anything - an invalid field blocks a valid sibling too', () => {
    const before = getDemoSnapshot();
    expect(() =>
      addDemoEntryBatch({
        glucose: { value: 9999, unit: 'mg/dL' },
        meal: { foodName: 'Toast', carbs: 30, mealType: 'breakfast' },
      })
    ).toThrow(DemoValidationError);

    const after = getDemoSnapshot();
    expect(after.meals).toEqual(before.meals);
    expect(after.glucose).toEqual(before.glucose);
  });

  describe('validation boundaries', () => {
    it.each([
      [19.9, 'mg/dL'],
      [600.1, 'mg/dL'],
      [1.0, 'mmol/L'],
      [33.4, 'mmol/L'],
    ])('rejects glucose value %s %s just outside range', (value, unit) => {
      expect(() => addDemoEntryBatch({ glucose: { value, unit } })).toThrow(DemoValidationError);
    });

    it.each([
      [20, 'mg/dL'],
      [600, 'mg/dL'],
      [1.1, 'mmol/L'],
      [33.3, 'mmol/L'],
    ])('accepts glucose value %s %s at the boundary', (value, unit) => {
      expect(() => addDemoEntryBatch({ glucose: { value, unit } })).not.toThrow();
    });

    it('rejects an unrecognized glucose unit', () => {
      expect(() => addDemoEntryBatch({ glucose: { value: 100, unit: 'g/L' } })).toThrow(DemoValidationError);
    });

    it('rejects carbs outside 0-500', () => {
      expect(() => addDemoEntryBatch({ meal: { foodName: 'X', carbs: -1, mealType: 'snack' } })).toThrow(DemoValidationError);
      expect(() => addDemoEntryBatch({ meal: { foodName: 'X', carbs: 501, mealType: 'snack' } })).toThrow(DemoValidationError);
    });

    it('accepts carbs at the 0-500 boundary', () => {
      expect(() => addDemoEntryBatch({ meal: { foodName: 'X', carbs: 0, mealType: 'snack' } })).not.toThrow();
      expect(() => addDemoEntryBatch({ meal: { foodName: 'X', carbs: 500, mealType: 'snack' } })).not.toThrow();
    });

    it('requires a non-empty meal.foodName', () => {
      expect(() => addDemoEntryBatch({ meal: { foodName: '   ', carbs: 10, mealType: 'snack' } })).toThrow(DemoValidationError);
    });

    it('rejects insulin units that are zero, negative, or over 100', () => {
      expect(() => addDemoEntryBatch({ insulin: { units: 0, insulinType: 'bolus' } })).toThrow(DemoValidationError);
      expect(() => addDemoEntryBatch({ insulin: { units: -1, insulinType: 'bolus' } })).toThrow(DemoValidationError);
      expect(() => addDemoEntryBatch({ insulin: { units: 100.1, insulinType: 'bolus' } })).toThrow(DemoValidationError);
    });

    it('accepts insulin units at the 100 boundary', () => {
      expect(() => addDemoEntryBatch({ insulin: { units: 100, insulinType: 'bolus' } })).not.toThrow();
    });

    it('rejects an invalid mealType or insulinType', () => {
      expect(() => addDemoEntryBatch({ meal: { foodName: 'X', carbs: 5, mealType: 'brunch' } })).toThrow(DemoValidationError);
      expect(() => addDemoEntryBatch({ insulin: { units: 1, insulinType: 'long-acting' } })).toThrow(DemoValidationError);
    });

    it('rejects an unparseable occurredAt', () => {
      expect(() =>
        addDemoEntryBatch({ glucose: { value: 100, unit: 'mg/dL' }, occurredAt: 'not-a-date' })
      ).toThrow(DemoValidationError);
    });

    it('rejects a timestamp more than 5 minutes in the future', () => {
      const future = new Date(Date.now() + 6 * 60 * 1000).toISOString();
      expect(() =>
        addDemoEntryBatch({ glucose: { value: 100, unit: 'mg/dL' }, occurredAt: future })
      ).toThrow(DemoValidationError);
    });

    it('accepts a timestamp within 5 minutes in the future', () => {
      const soon = new Date(Date.now() + 2 * 60 * 1000).toISOString();
      expect(() =>
        addDemoEntryBatch({ glucose: { value: 100, unit: 'mg/dL' }, occurredAt: soon })
      ).not.toThrow();
    });

    it('trims whitespace and enforces a maximum length on text fields', () => {
      const created = addDemoEntryBatch({
        meal: { foodName: '  Toast  ', carbs: 10, mealType: 'snack', notes: '  hi there  ' },
      });
      expect(created.meal.food_name).toBe('Toast');
      expect(created.meal.notes).toBe('hi there');

      expect(() =>
        addDemoEntryBatch({ meal: { foodName: 'A'.repeat(121), carbs: 10, mealType: 'snack' } })
      ).toThrow(DemoValidationError);
    });
  });

  it('generates collision-resistant ids via crypto.randomUUID', () => {
    const a = addDemoEntryBatch({ glucose: { value: 100, unit: 'mg/dL' } });
    const b = addDemoEntryBatch({ glucose: { value: 101, unit: 'mg/dL' } });
    expect(a.glucose.id).not.toBe(b.glucose.id);
    expect(a.glucose.id).toMatch(/^demo-glucose-/);
  });

  it('falls back to a safe id generator when crypto.randomUUID is unavailable', () => {
    vi.stubGlobal('crypto', {});
    try {
      const a = addDemoEntryBatch({ glucose: { value: 100, unit: 'mg/dL' } });
      const b = addDemoEntryBatch({ glucose: { value: 101, unit: 'mg/dL' } });
      expect(a.glucose.id).toMatch(/^demo-glucose-/);
      expect(a.glucose.id).not.toBe(b.glucose.id);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('notifies subscribers immediately on write', () => {
    const events = [];
    const unsubscribe = subscribeToDemoDataChanges((detail) => events.push(detail));
    addDemoEntryBatch({ glucose: { value: 100, unit: 'mg/dL' } });
    unsubscribe();

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('write');
  });
});

describe('resetDemoData', () => {
  it('removes only demo glucose/meal/insulin entries and restores the seeded display', () => {
    addDemoEntryBatch({
      glucose: { value: 100, unit: 'mg/dL' },
      meal: { foodName: 'X', carbs: 5, mealType: 'snack' },
      insulin: { units: 2, insulinType: 'bolus' },
    });

    resetDemoData();

    const after = getDemoSnapshot();
    expect(after.glucose.some((r) => r.source)).toBe(false);
    expect(after.meals.some((m) => m.source)).toBe(false);
    expect(after.insulin.some((d) => d.source)).toBe(false);
    // The seeded sample display is restored, not emptied.
    expect(after.glucose.length).toBeGreaterThan(0);
  });

  it('does not reset settings or authentication-adjacent local state', async () => {
    await updateUserSettings({ glucoseUnit: 'mmol/L', darkMode: false });
    localStorage.setItem('betatrace_is_guest', 'true');
    localStorage.setItem('betatrace_guest_notifications_seen', 'true');
    addDemoEntryBatch({ glucose: { value: 100, unit: 'mg/dL' } });

    resetDemoData();

    const { data } = await getUserSettings();
    expect(data.glucoseUnit).toBe('mmol/L');
    expect(data.darkMode).toBe(false);
    expect(localStorage.getItem('betatrace_is_guest')).toBe('true');
    expect(localStorage.getItem('betatrace_guest_notifications_seen')).toBe('true');
  });

  it('notifies subscribers on reset', () => {
    const events = [];
    const unsubscribe = subscribeToDemoDataChanges((detail) => events.push(detail));
    resetDemoData();
    unsubscribe();

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('reset');
  });
});
