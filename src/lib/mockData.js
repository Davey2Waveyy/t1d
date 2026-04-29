/**
 * Realistic Mock Data for 'Guest Mode' demo.
 * Generates 48 hours of glucose, meals, and insulin.
 */

const now = new Date();
const subtractHours = (h) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();
const meals = [
  { hour: 8.2, rise: 42, width: 1.4 },
  { hour: 13.1, rise: 58, width: 1.8 },
  { hour: 19.4, rise: 72, width: 2.1 },
  { hour: 22.2, rise: 24, width: 1.1 },
];

function seededNoise(index) {
  return Math.sin(index * 12.9898) * 7 + Math.sin(index * 4.73) * 4;
}

export const mockGlucoseReadings = Array.from({ length: 48 * 6 }, (_, i) => {
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

export const mockMeals = [
  { id: 'm1', logged_at: subtractHours(3), name: 'Oatmeal and berries', carbs: 45, meal_type: 'Breakfast' },
  { id: 'm2', logged_at: subtractHours(18), name: 'Pasta dinner', carbs: 85, meal_type: 'Dinner' },
  { id: 'm3', logged_at: subtractHours(25), name: 'Chicken salad', carbs: 30, meal_type: 'Lunch' },
  { id: 'm4', logged_at: subtractHours(42), name: 'Pizza night', carbs: 110, meal_type: 'Dinner' },
];

export const mockDoses = [
  { id: 'd1', logged_at: subtractHours(2.1), units: 4.5, insulin_type: 'Bolus', brand: 'Humalog' },
  { id: 'd2', logged_at: subtractHours(18.2), units: 8.5, insulin_type: 'Bolus', brand: 'Humalog' },
  { id: 'd3', logged_at: subtractHours(24.1), units: 3.0, insulin_type: 'Bolus', brand: 'Humalog' },
  { id: 'd4', logged_at: subtractHours(24), units: 22.0, insulin_type: 'Basal', brand: 'Lantus' },
  { id: 'd5', logged_at: subtractHours(42.2), units: 11.0, insulin_type: 'Bolus', brand: 'Humalog' },
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
