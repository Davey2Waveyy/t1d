/**
 * Realistic Mock Data for 'Guest Mode' demo.
 * Generates seven days of glucose, meals, and insulin — timestamps anchored
 * to believable local meal times so the log reads like a real day.
 */

const now = new Date();
const subtractHours = (h) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();

// A local wall-clock time `daysAgo` days back (0 = today, 1 = yesterday).
function atTime(daysAgo, hour, minute) {
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

// If a "today" slot hasn't happened yet, roll it back a day so entries
// never sit in the future.
function pastTime(daysAgo, hour, minute) {
  const iso = atTime(daysAgo, hour, minute);
  return new Date(iso) > now ? atTime(daysAgo + 1, hour, minute) : iso;
}

const meals = [
  { hour: 8.2, rise: 42, width: 1.4 },
  { hour: 13.1, rise: 58, width: 1.8 },
  { hour: 19.4, rise: 72, width: 2.1 },
  { hour: 22.2, rise: 24, width: 1.1 },
];

function seededNoise(index) {
  return Math.sin(index * 12.9898) * 7 + Math.sin(index * 4.73) * 4;
}

export const mockGlucoseReadings = Array.from({ length: 7 * 24 * 6 }, (_, i) => {
  const time = subtractHours(i / 6);
  const date = new Date(time);
  const hour = date.getHours() + date.getMinutes() / 60;
  const overnightDrift = hour < 5 ? -8 + hour * 2 : 0;
  const morningRise = Math.max(0, 18 - Math.abs(hour - 6.7) * 9);
  const circadian = Math.sin((hour - 4) / 24 * Math.PI * 2) * 10;
  const mealEffect = meals.reduce((sum, meal) => {
    const distance = Math.min(Math.abs(hour - meal.hour), Math.abs(hour + 24 - meal.hour), Math.abs(hour - 24 - meal.hour));
    return sum + meal.rise * Math.exp(-(distance * distance) / (2 * meal.width * meal.width));
  }, 0);
  const correctionDip = hour > 15 && hour < 17 ? -20 : 0;
  const value = Math.round(104 + overnightDrift + morningRise + circadian + mealEffect + correctionDip + seededNoise(i));

  return {
    id: `mock-g-${i}`,
    recorded_at: time,
    value: Math.max(50, Math.min(350, value)),
    user_id: 'guest-uid'
  };
}).reverse();

const mealTemplates = {
  Breakfast: [
    ['Oats and berries', 46, 7, 58],
    ['Eggs and toast', 31, 8, 12],
    ['Yogurt and granola', 35, 8, 5],
  ],
  Lunch: [
    ['Chicken wrap', 38, 12, 41],
    ['Rice bowl', 62, 13, 4],
    ['Soup and crackers', 44, 12, 52],
  ],
  Dinner: [
    ['Pasta night', 74, 19, 24],
    ['Homemade pizza', 96, 19, 47],
    ['Salmon and potatoes', 52, 18, 56],
  ],
};

export const mockMeals = Array.from({ length: 7 }, (_, day) => {
  return Object.entries(mealTemplates).map(([mealType, templates], mealIndex) => {
    const [name, carbs, hour, minute] = templates[day % templates.length];
    return {
      id: `m-${day}-${mealIndex}`,
      logged_at: pastTime(day, hour, minute),
      name,
      carbs,
      meal_type: mealType,
    };
  });
}).flat();

export const mockDoses = [
  { id: 'd1', logged_at: pastTime(0, 7, 52), units: 4.5, insulin_type: 'Bolus', brand: 'Humalog' },
  { id: 'd2', logged_at: pastTime(1, 19, 12), units: 7.5, insulin_type: 'Bolus', brand: 'Humalog' },
  { id: 'd3', logged_at: pastTime(1, 12, 35), units: 3.0, insulin_type: 'Bolus', brand: 'Humalog' },
  { id: 'd4', logged_at: pastTime(1, 22, 0), units: 22.0, insulin_type: 'Basal', brand: 'Lantus' },
  { id: 'd5', logged_at: pastTime(2, 19, 39), units: 9.5, insulin_type: 'Bolus', brand: 'Humalog' },
];

export const mockSettings = {
  user_id: 'guest-uid',
  timezone: 'America/New_York',
  glucoseUnit: 'mg/dL',
  targetGlucose: 110,
  lowThreshold: 70,
  highThreshold: 180,
  darkMode: true,
  icr_breakfast: 10,
  icr_lunch: 12,
  icr_dinner: 10,
  icr_snack: 15,
  isf: 40,
};
