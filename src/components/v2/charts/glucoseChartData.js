import { toDisplayGlucose } from '../../../lib/glucoseUnits';

export function buildGlucoseChartData(readings, unit) {
  return (readings ?? []).map((reading) => ({
    t: new Date(reading.recorded_at).getTime(),
    value: toDisplayGlucose(reading.value, unit),
    kind: 'glucose',
    source: reading.source ?? 'seeded',
  }));
}

export function buildMealMarkerData(meals, readings, mealY) {
  const timestamps = (readings ?? []).map((reading) => new Date(reading.recorded_at).getTime()).filter(Number.isFinite);
  if (timestamps.length === 0) return [];

  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);

  return (meals ?? [])
    .map((meal) => ({
      t: new Date(meal.logged_at ?? meal.created_at).getTime(),
      mealY,
      kind: 'meal',
      mealName: meal.food_name ?? meal.name ?? 'Meal',
      carbs: meal.carbs ?? 0,
      mealType: (meal.meal_type ?? 'snack').toLowerCase(),
      source: meal.source ?? 'seeded',
      loggedAt: meal.logged_at ?? meal.created_at,
    }))
    .filter((meal) => Number.isFinite(meal.t) && meal.t >= minTime && meal.t <= maxTime)
    .sort((a, b) => a.t - b.t);
}
