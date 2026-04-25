/**
 * Realistic Mock Data for 'Guest Mode' demo.
 * Generates 48 hours of glucose, meals, and insulin.
 */

const now = new Date();
const subtractHours = (h) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();

export const mockGlucoseReadings = Array.from({ length: 48 * 12 }, (_, i) => {
  const time = subtractHours(i * 0.5); // Every 30 mins
  // Generate a realistic trend (sine wave with noise)
  const hour = new Date(time).getHours();
  let base = 120 + Math.sin(hour / 4) * 40; // Circadian rhythm
  if (hour > 12 && hour < 14) base += 60; // Post-lunch spike
  if (hour > 19 && hour < 21) base += 80; // Post-dinner spike
  const value = Math.round(base + (Math.random() - 0.5) * 20);
  
  return {
    id: `mock-g-${i}`,
    recorded_at: time,
    value: Math.max(50, Math.min(350, value)),
    user_id: 'guest-uid'
  };
}).reverse();

export const mockMeals = [
  { id: 'm1', logged_at: subtractHours(2), name: 'Late Breakfast', carbs: 45, meal_type: 'Breakfast' },
  { id: 'm2', logged_at: subtractHours(18), name: 'Dinner: Pasta', carbs: 85, meal_type: 'Dinner' },
  { id: 'm3', logged_at: subtractHours(24), name: 'Lunch: Chicken Salad', carbs: 30, meal_type: 'Lunch' },
  { id: 'm4', logged_at: subtractHours(42), name: 'Pizza Night', carbs: 110, meal_type: 'Dinner' },
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
