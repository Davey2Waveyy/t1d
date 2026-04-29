// ============================================
// BETATRACE — Mock Data (Restored with ISO Strings for Timezone Sync)
// ============================================

export const glucoseReadings = (() => {
  const readings = [];
  const now = new Date();
  for (let i = 24; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    readings.push({
      time: time.toISOString(),
      value: Math.round(100 + Math.random() * 80),
    });
  }
  return readings;
})();

export const currentStats = {
  currentGlucose: 127,
  glucoseTrend: 'stable',
  timeInRange: 72,
  activeInsulin: 2.4,
  carbsToday: 185,
  insulinToday: 28.5,
  avgGlucose: 134,
  estimatedA1C: 6.4,
  standardDeviation: 38,
};

// ... other mock data like meals and insulin can remain empty or be partially restored if needed
export const recentMeals = [];
export const recentInsulin = [];
export const activityFeed = [];

export const icrData = {
  overall: { ratio: '1:10', confidence: 85 },
  byMeal: {
    breakfast: { ratio: '1:8', confidence: 78, mealsLogged: 24 },
    lunch: { ratio: '1:12', confidence: 88, mealsLogged: 31 },
    dinner: { ratio: '1:10', confidence: 82, mealsLogged: 28 },
    snack: { ratio: '1:15', confidence: 65, mealsLogged: 15 },
  },
  trend: [],
};

export const correctionFactorData = {
  overall: 40,
  byTimeOfDay: [],
};

export const dailyInsulinBreakdown = [];
export const carbBreakdown = [];
export const timeInRangeData = [];
export const a1cHistory = [];
