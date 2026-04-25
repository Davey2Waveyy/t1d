import { supabase } from './supabase'
import { mockGlucoseReadings, mockMeals, mockDoses, mockSettings } from './mockData'

// ============================================
// MEALS
// ============================================

export async function getMeals(limit = 50) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: mockMeals.slice(0, limit), error: null }

  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .order('logged_at', { ascending: false })
    .limit(limit)
  return { data: data || [], error }
}

export async function addMeal(meal) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: { message: 'Not authenticated' } }

  const { data, error } = await supabase
    .from('meals')
    .insert({ ...meal, user_id: user.id })
    .select()
    .single()
  return { data, error }
}

export async function deleteMeal(id) {
  const { error } = await supabase
    .from('meals')
    .delete()
    .eq('id', id)
  return { error }
}

// ============================================
// INSULIN DOSES
// ============================================

export async function getInsulinDoses(limit = 50) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: mockDoses.slice(0, limit), error: null }

  const { data, error } = await supabase
    .from('insulin_doses')
    .select('*')
    .order('logged_at', { ascending: false })
    .limit(limit)
  return { data: data || [], error }
}

export async function addInsulinDose(dose) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: { message: 'Not authenticated' } }

  const { data, error } = await supabase
    .from('insulin_doses')
    .insert({ ...dose, user_id: user.id })
    .select()
    .single()
  return { data, error }
}

export async function deleteInsulinDose(id) {
  const { error } = await supabase
    .from('insulin_doses')
    .delete()
    .eq('id', id)
  return { error }
}

// ============================================
// GLUCOSE READINGS
// ============================================

export async function getGlucoseReadings(hours = 24) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000)
    const filtered = mockGlucoseReadings.filter(r => new Date(r.recorded_at) >= cutoff)
    return { data: filtered, error: null }
  }

  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('glucose_readings')
    .select('*')
    .gte('recorded_at', cutoff)
    .order('recorded_at', { ascending: true })
  return { data: data || [], error }
}

export async function getAllGlucoseReadings(limit = 500) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: mockGlucoseReadings.slice(0, limit), error: null }

  const { data, error } = await supabase
    .from('glucose_readings')
    .select('*')
    .order('recorded_at', { ascending: false })
    .limit(limit)
  return { data: data || [], error }
}

export async function addGlucoseReading(reading) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: { message: 'Not authenticated' } }

  const { data, error } = await supabase
    .from('glucose_readings')
    .insert({ ...reading, user_id: user.id })
    .select()
    .single()
  return { data, error }
}

// ============================================
// USER SETTINGS
// ============================================

export async function getUserSettings() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: mockSettings, error: null }

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()
  return { data, error }
}

export async function updateUserSettings(settings) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: { message: 'Not authenticated' } }

  const { data, error } = await supabase
    .from('user_settings')
    .upsert({ ...settings, user_id: user.id, updated_at: new Date().toISOString() })
    .select()
    .single()
  return { data, error }
}

// ============================================
// STATISTICS HELPERS
// ============================================

export function calculateStats(glucoseReadings, meals, insulinDoses) {
  // Default empty stats
  const emptyStats = {
    currentGlucose: null,
    glucoseTrend: 'stable',
    timeInRange: 0,
    activeInsulin: 0,
    carbsToday: 0,
    insulinToday: 0,
    avgGlucose: 0,
    estimatedA1C: 0,
    standardDeviation: 0,
  }

  if (!glucoseReadings || glucoseReadings.length === 0) {
    return emptyStats
  }

  // Current glucose (most recent)
  const sortedReadings = [...glucoseReadings].sort(
    (a, b) => new Date(b.recorded_at) - new Date(a.recorded_at)
  )
  const currentGlucose = sortedReadings[0]?.value || null

  // Calculate trend from last 3 readings
  let glucoseTrend = 'stable'
  if (sortedReadings.length >= 3) {
    const recent = sortedReadings.slice(0, 3)
    const diff = recent[0].value - recent[2].value
    if (diff > 30) glucoseTrend = 'rising_fast'
    else if (diff > 10) glucoseTrend = 'rising'
    else if (diff < -30) glucoseTrend = 'falling_fast'
    else if (diff < -10) glucoseTrend = 'falling'
  }

  // Time in range (70-180)
  const inRange = glucoseReadings.filter(r => r.value >= 70 && r.value <= 180).length
  const timeInRange = Math.round((inRange / glucoseReadings.length) * 100)

  // Average glucose
  const avgGlucose = Math.round(
    glucoseReadings.reduce((sum, r) => sum + r.value, 0) / glucoseReadings.length
  )

  // Standard deviation
  const variance = glucoseReadings.reduce((sum, r) => sum + Math.pow(r.value - avgGlucose, 2), 0) / glucoseReadings.length
  const standardDeviation = Math.round(Math.sqrt(variance))

  // Estimated A1C (using formula: A1C = (avgGlucose + 46.7) / 28.7)
  const estimatedA1C = Number(((avgGlucose + 46.7) / 28.7).toFixed(1))

  // Today's carbs
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayMeals = (meals || []).filter(m => new Date(m.logged_at) >= today)
  const carbsToday = todayMeals.reduce((sum, m) => sum + (m.carbs || 0), 0)

  // Today's insulin
  const todayDoses = (insulinDoses || []).filter(d => new Date(d.logged_at) >= today)
  const insulinToday = todayDoses.reduce((sum, d) => sum + (d.units || 0), 0)

  // Active insulin (approximate: insulin from last 4 hours with decay)
  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000)
  const recentDoses = (insulinDoses || []).filter(d =>
    new Date(d.logged_at) >= fourHoursAgo && d.insulin_type !== 'basal'
  )
  const activeInsulin = Number(
    recentDoses.reduce((sum, d) => {
      const hoursAgo = (Date.now() - new Date(d.logged_at).getTime()) / (60 * 60 * 1000)
      const decay = Math.max(0, 1 - hoursAgo / 4)
      return sum + (d.units || 0) * decay
    }, 0).toFixed(1)
  )

  return {
    currentGlucose,
    glucoseTrend,
    timeInRange,
    activeInsulin,
    carbsToday,
    insulinToday: Number(insulinToday.toFixed(1)),
    avgGlucose,
    estimatedA1C,
    standardDeviation,
  }
}

export function calculateTimeInRangeData(glucoseReadings) {
  if (!glucoseReadings || glucoseReadings.length === 0) {
    return [
      { name: 'In Range', value: 0, fill: '#2DD4A8' },
      { name: 'Above', value: 0, fill: '#FBBF24' },
      { name: 'Below', value: 0, fill: '#FB7185' },
    ]
  }

  const total = glucoseReadings.length
  const inRange = glucoseReadings.filter(r => r.value >= 70 && r.value <= 180).length
  const above = glucoseReadings.filter(r => r.value > 180).length
  const below = glucoseReadings.filter(r => r.value < 70).length

  return [
    { name: 'In Range', value: Math.round((inRange / total) * 100), fill: '#2DD4A8' },
    { name: 'Above', value: Math.round((above / total) * 100), fill: '#FBBF24' },
    { name: 'Below', value: Math.round((below / total) * 100), fill: '#FB7185' },
  ]
}

export function calculateCarbBreakdown(meals) {
  if (!meals || meals.length === 0) {
    return [
      { name: 'Breakfast', value: 0, fill: '#2DD4A8' },
      { name: 'Lunch', value: 0, fill: '#38BDF8' },
      { name: 'Dinner', value: 0, fill: '#A78BFA' },
      { name: 'Snacks', value: 0, fill: '#FBBF24' },
    ]
  }

  const breakdown = {
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snack: 0,
  }

  meals.forEach(meal => {
    const type = meal.meal_type?.toLowerCase() || 'snack'
    if (breakdown[type] !== undefined) {
      breakdown[type] += meal.carbs || 0
    }
  })

  return [
    { name: 'Breakfast', value: breakdown.breakfast, fill: '#2DD4A8' },
    { name: 'Lunch', value: breakdown.lunch, fill: '#38BDF8' },
    { name: 'Dinner', value: breakdown.dinner, fill: '#A78BFA' },
    { name: 'Snacks', value: breakdown.snack, fill: '#FBBF24' },
  ]
}

export function calculateInsulinBreakdown(insulinDoses) {
  if (!insulinDoses || insulinDoses.length === 0) {
    return []
  }

  // Group by day for last 7 days
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const breakdown = {}

  // Initialize last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dayName = days[date.getDay()]
    breakdown[dayName] = { day: dayName, bolus: 0, basal: 0, correction: 0 }
  }

  // Fill in data
  insulinDoses.forEach(dose => {
    const date = new Date(dose.logged_at)
    const dayName = days[date.getDay()]
    if (breakdown[dayName]) {
      const type = dose.insulin_type?.toLowerCase() || 'bolus'
      if (type === 'basal') breakdown[dayName].basal += dose.units || 0
      else if (type === 'correction') breakdown[dayName].correction += dose.units || 0
      else breakdown[dayName].bolus += dose.units || 0
    }
  })

  return Object.values(breakdown)
}
