function fmtDate(value) {
  if (!value) return 'unknown';
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function summarizeGlucose(readings = []) {
  const recent = readings.slice(-18);
  return recent.map((reading) => ({
    time: fmtDate(reading.recorded_at),
    value: reading.value,
    note: reading.notes || '',
  }));
}

function summarizeMeals(meals = []) {
  return meals.slice(0, 8).map((meal) => ({
    time: fmtDate(meal.logged_at ?? meal.created_at),
    type: meal.meal_type || 'Meal',
    name: meal.food_name || meal.name || meal.notes || 'Logged meal',
    carbs: meal.carbs ?? 0,
  }));
}

function summarizeInsulin(insulin = []) {
  return insulin.slice(0, 8).map((dose) => ({
    time: fmtDate(dose.logged_at ?? dose.created_at),
    type: dose.insulin_type || 'Insulin',
    brand: dose.brand || '',
    units: dose.units ?? 0,
  }));
}

export function buildChatContext({ stats, glucose, meals, insulin, settings }) {
  return {
    source: 'Betatrace public guest preview',
    safety:
      'Preview data only. Do not provide medical advice, diagnosis, treatment instructions, or specific dosing recommendations.',
    settings: {
      glucoseUnit: settings?.glucoseUnit || 'mg/dL',
      targetGlucose: settings?.targetGlucose || 110,
      lowThreshold: settings?.lowThreshold || 70,
      highThreshold: settings?.highThreshold || 180,
      icrBreakfast: settings?.icr_breakfast || '',
      icrLunch: settings?.icr_lunch || '',
      icrDinner: settings?.icr_dinner || '',
      correctionFactor: settings?.isf || '',
    },
    stats: {
      currentGlucose: stats?.currentGlucose ?? null,
      glucoseTrend: stats?.glucoseTrend ?? 'unknown',
      timeInRange: stats?.timeInRange ?? null,
      activeInsulin: stats?.activeInsulin ?? null,
      carbsToday: stats?.carbsToday ?? null,
      insulinToday: stats?.insulinToday ?? null,
      avgGlucose: stats?.avgGlucose ?? null,
      estimatedA1C: stats?.estimatedA1C ?? null,
      standardDeviation: stats?.standardDeviation ?? null,
    },
    recentGlucose: summarizeGlucose(glucose),
    recentMeals: summarizeMeals(meals),
    recentInsulin: summarizeInsulin(insulin),
  };
}
