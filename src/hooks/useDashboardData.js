import { useState, useCallback, useEffect } from 'react';
import { getGlucoseReadings, getMeals, getInsulinDoses, calculateStats, subscribeToDemoDataChanges } from '../lib/dataService';
import { useSettings } from '../contexts/SettingsContext';
import { getThresholds, toDisplayGlucose } from '../lib/glucoseUnits';
import { DEFAULT_SETTINGS } from '../lib/publishConfig';

function buildRecentActivity(meals, insulin, glucose, settings) {
  const mealItems = (meals ?? []).slice(0, 4).map((meal) => ({
    key: `meal-${meal.id ?? meal.logged_at}`,
    type: 'meal',
    title: meal.meal_type ?? 'Meal',
    subtitle: meal.food_name ?? meal.name,
    value: meal.carbs ?? 0,
    unit: 'g',
    occurredAt: meal.logged_at,
    source: meal.source,
  }));

  const insulinItems = (insulin ?? []).slice(0, 4).map((dose) => ({
    key: `insulin-${dose.id ?? dose.logged_at}`,
    type: 'insulin',
    title: dose.insulin_type ?? 'Insulin',
    subtitle: dose.brand ?? 'Dose',
    value: dose.units ?? 0,
    unit: 'u',
    occurredAt: dose.logged_at,
    source: dose.source,
  }));

  const glucoseItems = (glucose ?? []).slice(-4).map((reading) => ({
    key: `glucose-${reading.id ?? reading.recorded_at}`,
    type: 'glucose',
    title: 'Glucose',
    subtitle: 'Manual reading',
    value: toDisplayGlucose(reading.value ?? 0, settings.glucoseUnit),
    unit: ` ${settings.glucoseUnit}`,
    occurredAt: reading.recorded_at,
    source: reading.source,
  }));

  return [...mealItems, ...insulinItems, ...glucoseItems]
    .filter((item) => item.occurredAt)
    .sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt))
    .slice(0, 6);
}

export function useDashboardData({ glucoseHours = 24 } = {}) {
  const { settings = DEFAULT_SETTINGS } = useSettings();
  const { glucoseUnit, lowThreshold, highThreshold } = settings;
  const [state, setState] = useState({
    loading: true,
    error: null,
    stats: null,
    recentActivity: [],
    glucose: [],
    meals: [],
    insulin: [],
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((key) => key + 1), []);

  useEffect(() => {
    let cancelled = false;
    setState((current) => ({ ...current, loading: true }));

    // Only the primitives actually read below are in the dependency array;
    // deriving this here (rather than reading the outer `settings` object)
    // keeps the effect from re-running on every unrelated settings change.
    const effectSettings = { glucoseUnit, lowThreshold, highThreshold };

    Promise.all([getGlucoseReadings(glucoseHours), getMeals(50), getInsulinDoses(50)])
      .then(([glucoseResult, mealsResult, insulinResult]) => {
        if (cancelled) return;

        const glucose = glucoseResult.data ?? [];
        const meals = mealsResult.data ?? [];
        const insulin = insulinResult.data ?? [];

        setState({
          loading: false,
          error: glucoseResult.error ?? mealsResult.error ?? insulinResult.error ?? null,
          stats: calculateStats(glucose, meals, insulin, getThresholds(effectSettings)),
          recentActivity: buildRecentActivity(meals, insulin, glucose, effectSettings),
          glucose,
          meals,
          insulin,
        });
      })
      .catch((error) => {
        if (!cancelled) {
          setState((current) => ({ ...current, loading: false, error }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey, glucoseHours, glucoseUnit, lowThreshold, highThreshold]);

  // Manual log sheets and WebMCP tools both write through the same demo
  // data store; refresh immediately whenever either one succeeds.
  useEffect(() => {
    return subscribeToDemoDataChanges(() => refresh());
  }, [refresh]);

  return { ...state, refresh };
}
