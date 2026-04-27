import { useState, useCallback, useEffect } from 'react';
import { getGlucoseReadings, getMeals, getInsulinDoses, calculateStats } from '../lib/dataService';

function buildRecentActivity(meals, insulin, glucose) {
  const mealItems = (meals ?? []).slice(0, 4).map((meal) => ({
    key: `meal-${meal.id ?? meal.logged_at}`,
    type: 'meal',
    title: meal.meal_type ?? 'Meal',
    subtitle: meal.food_name ?? meal.name,
    value: meal.carbs ?? 0,
    unit: 'g',
    occurredAt: meal.logged_at,
  }));

  const insulinItems = (insulin ?? []).slice(0, 4).map((dose) => ({
    key: `insulin-${dose.id ?? dose.logged_at}`,
    type: 'insulin',
    title: dose.insulin_type ?? 'Insulin',
    subtitle: dose.brand ?? 'Dose',
    value: dose.units ?? 0,
    unit: 'u',
    occurredAt: dose.logged_at,
  }));

  const glucoseItems = (glucose ?? []).slice(-4).map((reading) => ({
    key: `glucose-${reading.id ?? reading.recorded_at}`,
    type: 'glucose',
    title: 'Glucose',
    subtitle: 'Manual reading',
    value: reading.value ?? 0,
    unit: ' mg/dL',
    occurredAt: reading.recorded_at,
  }));

  return [...mealItems, ...insulinItems, ...glucoseItems]
    .filter((item) => item.occurredAt)
    .sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt))
    .slice(0, 6);
}

export function useDashboardData() {
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

    Promise.all([getGlucoseReadings(24), getMeals(50), getInsulinDoses(50)])
      .then(([glucoseResult, mealsResult, insulinResult]) => {
        if (cancelled) return;

        const glucose = glucoseResult.data ?? [];
        const meals = mealsResult.data ?? [];
        const insulin = insulinResult.data ?? [];

        setState({
          loading: false,
          error: glucoseResult.error ?? mealsResult.error ?? insulinResult.error ?? null,
          stats: calculateStats(glucose, meals, insulin),
          recentActivity: buildRecentActivity(meals, insulin, glucose),
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
  }, [refreshKey]);

  return { ...state, refresh };
}
