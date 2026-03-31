// ============================================
// BETATRACE — Mock Data
// ============================================

// Generate glucose readings for the last 24 hours (every 5 minutes)
const generateGlucoseReadings = () => {
  const readings = [];
  const now = new Date();
  for (let i = 288; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 5 * 60000);
    // Simulate realistic glucose pattern with meals
    const hour = time.getHours();
    let base = 120;
    
    // Morning dawn phenomenon
    if (hour >= 4 && hour < 7) base = 130 + (hour - 4) * 10;
    // Post-breakfast spike
    if (hour >= 8 && hour < 10) base = 160 + Math.sin((hour - 8) * Math.PI) * 40;
    // Mid-morning settling
    if (hour >= 10 && hour < 12) base = 130 - (hour - 10) * 10;
    // Post-lunch spike
    if (hour >= 13 && hour < 15) base = 155 + Math.sin((hour - 13) * Math.PI) * 35;
    // Afternoon
    if (hour >= 15 && hour < 18) base = 115;
    // Post-dinner spike
    if (hour >= 19 && hour < 21) base = 150 + Math.sin((hour - 19) * Math.PI) * 30;
    // Night settling
    if (hour >= 21 || hour < 4) base = 105;
    
    const noise = (Math.random() - 0.5) * 30;
    const value = Math.round(Math.max(55, Math.min(300, base + noise)));
    
    readings.push({
      time: time.toISOString(),
      value,
      timeLabel: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    });
  }
  return readings;
};

export const glucoseReadings = generateGlucoseReadings();

// Weekly glucose data for trends
export const weeklyGlucose = Array.from({ length: 7 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (6 - i));
  return {
    day: date.toLocaleDateString('en-US', { weekday: 'short' }),
    avg: Math.round(110 + Math.random() * 40),
    min: Math.round(65 + Math.random() * 20),
    max: Math.round(180 + Math.random() * 60),
    inRange: Math.round(60 + Math.random() * 25),
  };
});

// Current stats
export const currentStats = {
  currentGlucose: 127,
  glucoseTrend: 'stable', // 'rising', 'falling', 'stable', 'rising_fast', 'falling_fast'
  timeInRange: 72,
  activeInsulin: 2.4,
  carbsToday: 185,
  insulinToday: 28.5,
  avgGlucose: 134,
  estimatedA1C: 6.4,
  standardDeviation: 38,
};

// Meals
export const recentMeals = [
  {
    id: 1,
    name: 'Grilled Chicken Salad',
    carbs: 25,
    type: 'lunch',
    time: new Date(Date.now() - 2 * 3600000).toISOString(),
    notes: 'With quinoa and avocado dressing',
    insulin: 2.5,
  },
  {
    id: 2,
    name: 'Overnight Oats',
    carbs: 45,
    type: 'breakfast',
    time: new Date(Date.now() - 6 * 3600000).toISOString(),
    notes: 'With blueberries and almond butter',
    insulin: 4.5,
  },
  {
    id: 3,
    name: 'Pasta Primavera',
    carbs: 65,
    type: 'dinner',
    time: new Date(Date.now() - 14 * 3600000).toISOString(),
    notes: 'Whole wheat pasta, extra veggies',
    insulin: 6.5,
  },
  {
    id: 4,
    name: 'Apple with Peanut Butter',
    carbs: 30,
    type: 'snack',
    time: new Date(Date.now() - 18 * 3600000).toISOString(),
    notes: '',
    insulin: 3.0,
  },
  {
    id: 5,
    name: 'Stir Fry with Rice',
    carbs: 55,
    type: 'dinner',
    time: new Date(Date.now() - 26 * 3600000).toISOString(),
    notes: 'Brown rice, tofu, mixed vegetables',
    insulin: 5.5,
  },
  {
    id: 6,
    name: 'Greek Yogurt Parfait',
    carbs: 35,
    type: 'breakfast',
    time: new Date(Date.now() - 30 * 3600000).toISOString(),
    notes: 'Honey, granola, strawberries',
    insulin: 3.5,
  },
];

// Insulin doses
export const recentInsulin = [
  { id: 1, amount: 2.5, type: 'Bolus', brand: 'Humalog', time: new Date(Date.now() - 2 * 3600000).toISOString(), site: 'Abdomen' },
  { id: 2, amount: 4.5, type: 'Bolus', brand: 'Humalog', time: new Date(Date.now() - 6 * 3600000).toISOString(), site: 'Thigh' },
  { id: 3, amount: 22.0, type: 'Basal', brand: 'Lantus', time: new Date(Date.now() - 8 * 3600000).toISOString(), site: 'Abdomen' },
  { id: 4, amount: 6.5, type: 'Bolus', brand: 'Humalog', time: new Date(Date.now() - 14 * 3600000).toISOString(), site: 'Arm' },
  { id: 5, amount: 3.0, type: 'Bolus', brand: 'Humalog', time: new Date(Date.now() - 18 * 3600000).toISOString(), site: 'Abdomen' },
  { id: 6, amount: 1.5, type: 'Correction', brand: 'Humalog', time: new Date(Date.now() - 20 * 3600000).toISOString(), site: 'Thigh' },
];

// ICR predictions
export const icrData = {
  overall: { ratio: '1:10', confidence: 85 },
  byMeal: {
    breakfast: { ratio: '1:8', confidence: 78, mealsLogged: 24 },
    lunch: { ratio: '1:12', confidence: 88, mealsLogged: 31 },
    dinner: { ratio: '1:10', confidence: 82, mealsLogged: 28 },
    snack: { ratio: '1:15', confidence: 65, mealsLogged: 15 },
  },
  trend: [
    { month: 'Oct', ratio: 9 },
    { month: 'Nov', ratio: 9.5 },
    { month: 'Dec', ratio: 10 },
    { month: 'Jan', ratio: 10 },
    { month: 'Feb', ratio: 10.5 },
    { month: 'Mar', ratio: 10 },
  ],
};

// A1C history
export const a1cHistory = [
  { date: '2025-07', value: 7.2 },
  { date: '2025-10', value: 6.9 },
  { date: '2026-01', value: 6.6 },
  { date: '2026-03', value: 6.4 },
];

// Pattern alerts
export const patternAlerts = [
  {
    id: 1,
    severity: 'warning',
    title: 'Post-Breakfast Highs',
    description: 'Glucose exceeded 180 mg/dL after breakfast on 4 of the last 5 days. Consider adjusting breakfast ICR.',
    pattern: 'Recurring in 80% of mornings',
    actionable: 'Try 1:7 ratio for breakfast',
    timestamp: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
  {
    id: 2,
    severity: 'critical',
    title: 'Nighttime Lows Detected',
    description: 'Glucose dropped below 70 mg/dL during sleep on 2 of the last 7 nights. Possible basal rate issue.',
    pattern: 'Occurring between 2-4 AM',
    actionable: 'Consider reducing overnight basal by 0.1u/hr',
    timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: 3,
    severity: 'info',
    title: 'Afternoon Stability',
    description: 'Your glucose has been consistently in range (70-180) between 2-6 PM for the past 10 days.',
    pattern: 'Consistent for 10 days',
    actionable: 'Current afternoon settings are working well',
    timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: 4,
    severity: 'warning',
    title: 'Exercise Impact',
    description: 'Glucose tends to drop sharply 1-2 hours after evening workouts. Consider a pre-workout snack.',
    pattern: '3 of last 4 workouts',
    actionable: 'Try 15-20g carbs before exercise',
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
];

// Correction factor data
export const correctionFactorData = {
  overall: 40, // 1 unit drops glucose by 40 mg/dL
  byTimeOfDay: [
    { period: 'Morning (6-12)', factor: 35, label: '6AM - 12PM' },
    { period: 'Afternoon (12-18)', factor: 45, label: '12PM - 6PM' },
    { period: 'Evening (18-24)', factor: 40, label: '6PM - 12AM' },
    { period: 'Night (0-6)', factor: 50, label: '12AM - 6AM' },
  ],
};

// Daily insulin breakdown (for charts)
export const dailyInsulinBreakdown = [
  { day: 'Mon', bolus: 18, basal: 22, correction: 3 },
  { day: 'Tue', bolus: 22, basal: 22, correction: 1 },
  { day: 'Wed', bolus: 20, basal: 22, correction: 4 },
  { day: 'Thu', bolus: 16, basal: 22, correction: 2 },
  { day: 'Fri', bolus: 24, basal: 22, correction: 0 },
  { day: 'Sat', bolus: 19, basal: 22, correction: 3 },
  { day: 'Sun', bolus: 21, basal: 22, correction: 2 },
];

// Carb breakdown by meal type
export const carbBreakdown = [
  { name: 'Breakfast', value: 280, fill: '#2DD4A8' },
  { name: 'Lunch', value: 310, fill: '#38BDF8' },
  { name: 'Dinner', value: 420, fill: '#A78BFA' },
  { name: 'Snacks', value: 190, fill: '#FBBF24' },
];

// Time in range data
export const timeInRangeData = [
  { name: 'In Range', value: 72, fill: '#2DD4A8' },
  { name: 'Above', value: 18, fill: '#FBBF24' },
  { name: 'Below', value: 10, fill: '#FB7185' },
];

// Activity feed
export const activityFeed = [
  { id: 1, type: 'meal', label: 'Grilled Chicken Salad', detail: '25g carbs', time: '2h ago', icon: 'utensils' },
  { id: 2, type: 'insulin', label: 'Bolus Dose', detail: '2.5u Humalog', time: '2h ago', icon: 'syringe' },
  { id: 3, type: 'glucose', label: 'Manual Reading', detail: '127 mg/dL', time: '3h ago', icon: 'droplet' },
  { id: 4, type: 'meal', label: 'Overnight Oats', detail: '45g carbs', time: '6h ago', icon: 'utensils' },
  { id: 5, type: 'insulin', label: 'Bolus Dose', detail: '4.5u Humalog', time: '6h ago', icon: 'syringe' },
];
