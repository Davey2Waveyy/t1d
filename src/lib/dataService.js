import { supabase } from './supabase'
import { mockGlucoseReadings, mockMeals, mockDoses, mockSettings } from './mockData'
import { sanitizeStoredSettings } from './publishConfig'

const DEMO_MEALS_KEY = 'betatrace_demo_meals'
const DEMO_DOSES_KEY = 'betatrace_demo_insulin_doses'
const DEMO_GLUCOSE_KEY = 'betatrace_demo_glucose_readings'
const DEMO_SETTINGS_KEY = 'betatrace_settings'

// In-browser this is always window.localStorage. The in-memory fallback
// keeps the demo store (and its tests) working in any environment without
// a DOM, e.g. under plain `node --test`.
const memoryStorage = new Map()
const memoryStorageFallback = {
  getItem: (key) => (memoryStorage.has(key) ? memoryStorage.get(key) : null),
  setItem: (key, value) => { memoryStorage.set(key, String(value)) },
  removeItem: (key) => { memoryStorage.delete(key) },
}

function getStorage() {
  return typeof localStorage !== 'undefined' ? localStorage : memoryStorageFallback
}

async function getCurrentUser() {
  if (!supabase) return null

  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (err) {
    console.error('Supabase user lookup failed; using demo data.', err)
    return null
  }
}

// ============================================
// DEMO DATA STORE
//
// Guest-only, browser-local synthetic data. This is the single source of
// truth for reads, writes, and change notifications used by both the
// manual log sheets and the WebMCP tools, so the two paths can never
// diverge in validation or persistence behavior.
// ============================================

export class DemoValidationError extends Error {
  constructor(message, field) {
    super(message)
    this.name = 'DemoValidationError'
    this.field = field
  }
}

const demoDataListeners = new Set()

function notifyDemoDataChange(detail) {
  for (const listener of demoDataListeners) {
    try {
      listener(detail)
    } catch (err) {
      console.error('Demo data change listener failed.', err)
    }
  }
}

/**
 * Subscribe to demo data writes/resets. Returns an unsubscribe function.
 */
export function subscribeToDemoDataChanges(listener) {
  demoDataListeners.add(listener)
  return () => demoDataListeners.delete(listener)
}

function generateDemoId(prefix) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`
}

function readDemoList(key) {
  try {
    const parsed = JSON.parse(getStorage().getItem(key) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeDemoList(key, entries) {
  getStorage().setItem(key, JSON.stringify(entries))
}

function toResultError(err) {
  if (err instanceof DemoValidationError) {
    return { message: err.message, field: err.field }
  }
  console.error('Demo data write failed.', err)
  return { message: 'Could not save entry.' }
}

// ---- Validation ----------------------------------------------------------

const GLUCOSE_MIN_MGDL = 20
const GLUCOSE_MAX_MGDL = 600
const GLUCOSE_MIN_MMOL = 1.1
const GLUCOSE_MAX_MMOL = 33.3
const CARBS_MIN = 0
const CARBS_MAX = 500
const INSULIN_MAX_UNITS = 100
const MAX_FUTURE_SKEW_MS = 5 * 60 * 1000
const NOTES_MAX_LENGTH = 500
const FOOD_NAME_MAX_LENGTH = 120
const BRAND_MAX_LENGTH = 60

const MEAL_TYPES = new Set(['breakfast', 'lunch', 'dinner', 'snack'])
const INSULIN_TYPES = new Set(['bolus', 'basal', 'correction'])
const GLUCOSE_UNITS = new Set(['mg/dL', 'mmol/L'])

function trimText(value, maxLength, field) {
  if (value == null || value === '') return undefined
  if (typeof value !== 'string') {
    throw new DemoValidationError(`${field} must be text.`, field)
  }
  const trimmed = value.trim()
  if (trimmed.length > maxLength) {
    throw new DemoValidationError(`${field} must be ${maxLength} characters or fewer.`, field)
  }
  return trimmed || undefined
}

export function normalizeOccurredAt(occurredAt) {
  if (occurredAt == null) return new Date().toISOString()
  const date = new Date(occurredAt)
  if (Number.isNaN(date.getTime())) {
    throw new DemoValidationError('occurredAt must be a valid date-time.', 'occurredAt')
  }
  if (date.getTime() - Date.now() > MAX_FUTURE_SKEW_MS) {
    throw new DemoValidationError('occurredAt cannot be more than 5 minutes in the future.', 'occurredAt')
  }
  return date.toISOString()
}

function toMgDlValue(value, unit) {
  return unit === 'mmol/L' ? value * 18 : value
}

function validateGlucoseInput(glucose) {
  if (glucose == null) return null
  if (typeof glucose !== 'object' || Array.isArray(glucose)) {
    throw new DemoValidationError('glucose must be an object.', 'glucose')
  }

  const unit = glucose.unit ?? 'mg/dL'
  if (!GLUCOSE_UNITS.has(unit)) {
    throw new DemoValidationError('glucose.unit must be "mg/dL" or "mmol/L".', 'glucose.unit')
  }

  const value = Number(glucose.value)
  if (!Number.isFinite(value)) {
    throw new DemoValidationError('glucose.value must be a number.', 'glucose.value')
  }

  const min = unit === 'mmol/L' ? GLUCOSE_MIN_MMOL : GLUCOSE_MIN_MGDL
  const max = unit === 'mmol/L' ? GLUCOSE_MAX_MMOL : GLUCOSE_MAX_MGDL
  if (value < min || value > max) {
    throw new DemoValidationError(`glucose.value must be between ${min} and ${max} ${unit}.`, 'glucose.value')
  }

  const notes = trimText(glucose.notes, NOTES_MAX_LENGTH, 'glucose.notes')

  return {
    value: Math.round(toMgDlValue(value, unit) * 10) / 10,
    notes,
  }
}

function validateMealInput(meal) {
  if (meal == null) return null
  if (typeof meal !== 'object' || Array.isArray(meal)) {
    throw new DemoValidationError('meal must be an object.', 'meal')
  }

  const foodName = trimText(meal.foodName, FOOD_NAME_MAX_LENGTH, 'meal.foodName')
  if (!foodName) {
    throw new DemoValidationError('meal.foodName is required.', 'meal.foodName')
  }

  const carbs = Number(meal.carbs)
  if (!Number.isFinite(carbs) || carbs < CARBS_MIN || carbs > CARBS_MAX) {
    throw new DemoValidationError(`meal.carbs must be between ${CARBS_MIN} and ${CARBS_MAX} g.`, 'meal.carbs')
  }

  const mealType = (meal.mealType ?? 'snack').toLowerCase()
  if (!MEAL_TYPES.has(mealType)) {
    throw new DemoValidationError('meal.mealType must be breakfast, lunch, dinner, or snack.', 'meal.mealType')
  }

  const notes = trimText(meal.notes, NOTES_MAX_LENGTH, 'meal.notes')

  return { foodName, carbs, mealType, notes }
}

function validateInsulinInput(insulin) {
  if (insulin == null) return null
  if (typeof insulin !== 'object' || Array.isArray(insulin)) {
    throw new DemoValidationError('insulin must be an object.', 'insulin')
  }

  const units = Number(insulin.units)
  if (!Number.isFinite(units) || units <= 0 || units > INSULIN_MAX_UNITS) {
    throw new DemoValidationError(`insulin.units must be greater than 0 and at most ${INSULIN_MAX_UNITS}.`, 'insulin.units')
  }

  const insulinType = (insulin.insulinType ?? 'bolus').toLowerCase()
  if (!INSULIN_TYPES.has(insulinType)) {
    throw new DemoValidationError('insulin.insulinType must be bolus, basal, or correction.', 'insulin.insulinType')
  }

  const brand = trimText(insulin.brand, BRAND_MAX_LENGTH, 'insulin.brand')
  const notes = trimText(insulin.notes, NOTES_MAX_LENGTH, 'insulin.notes')

  return { units, insulinType, brand, notes }
}

// ---- Reads -----------------------------------------------------------------

/**
 * The current synthetic glucose/meal/insulin records: locally added demo
 * entries (manual or webmcp) layered over the seeded sample data, newest
 * first. This is the one place both reads and the WebMCP `get_demo_state`
 * tool pull from.
 */
export function getDemoSnapshot() {
  return {
    glucose: [...readDemoList(DEMO_GLUCOSE_KEY), ...mockGlucoseReadings],
    meals: [...readDemoList(DEMO_MEALS_KEY), ...mockMeals],
    insulin: [...readDemoList(DEMO_DOSES_KEY), ...mockDoses],
  }
}

// ---- Writes ------------------------------------------------------------

function buildGlucoseRecord(glucose, occurredAt, source) {
  return {
    id: generateDemoId('demo-glucose'),
    value: glucose.value,
    unit: 'mg/dL',
    notes: glucose.notes,
    recorded_at: occurredAt,
    source,
    user_id: 'guest-uid',
  }
}

function buildMealRecord(meal, occurredAt, source) {
  return {
    id: generateDemoId('demo-meal'),
    food_name: meal.foodName,
    name: meal.foodName,
    carbs: meal.carbs,
    meal_type: meal.mealType,
    notes: meal.notes,
    logged_at: occurredAt,
    source,
    user_id: 'guest-uid',
  }
}

function buildInsulinRecord(insulin, occurredAt, source) {
  return {
    id: generateDemoId('demo-insulin'),
    units: insulin.units,
    insulin_type: insulin.insulinType,
    brand: insulin.brand,
    notes: insulin.notes,
    logged_at: occurredAt,
    source,
    user_id: 'guest-uid',
  }
}

/**
 * Validates a combined { occurredAt, glucose, meal, insulin } request in
 * full before writing anything, then makes one atomic local write per
 * included record type. Used by both the manual log sheets (source:
 * "manual") and the WebMCP log_demo_entry tool (source: "webmcp").
 */
export function addDemoEntryBatch({ occurredAt, glucose, meal, insulin, source = 'manual' } = {}) {
  if (glucose == null && meal == null && insulin == null) {
    throw new DemoValidationError('At least one of glucose, meal, or insulin is required.', 'entries')
  }

  // Validate everything before any write happens.
  const normalizedGlucose = validateGlucoseInput(glucose)
  const normalizedMeal = validateMealInput(meal)
  const normalizedInsulin = validateInsulinInput(insulin)
  const normalizedOccurredAt = normalizeOccurredAt(occurredAt)

  const created = {}

  if (normalizedGlucose) {
    const record = buildGlucoseRecord(normalizedGlucose, normalizedOccurredAt, source)
    writeDemoList(DEMO_GLUCOSE_KEY, [record, ...readDemoList(DEMO_GLUCOSE_KEY)])
    created.glucose = record
  }
  if (normalizedMeal) {
    const record = buildMealRecord(normalizedMeal, normalizedOccurredAt, source)
    writeDemoList(DEMO_MEALS_KEY, [record, ...readDemoList(DEMO_MEALS_KEY)])
    created.meal = record
  }
  if (normalizedInsulin) {
    const record = buildInsulinRecord(normalizedInsulin, normalizedOccurredAt, source)
    writeDemoList(DEMO_DOSES_KEY, [record, ...readDemoList(DEMO_DOSES_KEY)])
    created.insulin = record
  }

  notifyDemoDataChange({ type: 'write', source, created })
  return created
}

/**
 * Removes only locally-added demo glucose, meal, and insulin entries and
 * restores the seeded sample display. Never touches settings, auth state,
 * or the guest-notification-seen flag.
 */
export function resetDemoData() {
  getStorage().removeItem(DEMO_MEALS_KEY)
  getStorage().removeItem(DEMO_DOSES_KEY)
  getStorage().removeItem(DEMO_GLUCOSE_KEY)
  notifyDemoDataChange({ type: 'reset' })
}

// ============================================
// MEALS
// ============================================

export async function getMeals(limit = 50) {
  const user = await getCurrentUser()
  if (!user) {
    return { data: getDemoSnapshot().meals.slice(0, limit), error: null }
  }

  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .order('logged_at', { ascending: false })
    .limit(limit)
  return { data: data || [], error }
}

export async function addMeal(meal) {
  const user = await getCurrentUser()
  if (!user) {
    try {
      const created = addDemoEntryBatch({
        occurredAt: meal.logged_at,
        meal: {
          foodName: meal.food_name ?? meal.name,
          carbs: meal.carbs,
          mealType: meal.meal_type,
          notes: meal.notes,
        },
        source: 'manual',
      })
      return { data: created.meal, error: null }
    } catch (err) {
      return { data: null, error: toResultError(err) }
    }
  }

  const { data, error } = await supabase
    .from('meals')
    .insert({ ...meal, user_id: user.id })
    .select()
    .single()
  return { data, error }
}

export async function deleteMeal(id) {
  if (!supabase) return { error: null }

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
  const user = await getCurrentUser()
  if (!user) {
    return { data: getDemoSnapshot().insulin.slice(0, limit), error: null }
  }

  const { data, error } = await supabase
    .from('insulin_doses')
    .select('*')
    .order('logged_at', { ascending: false })
    .limit(limit)
  return { data: data || [], error }
}

export async function addInsulinDose(dose) {
  const user = await getCurrentUser()
  if (!user) {
    try {
      const created = addDemoEntryBatch({
        occurredAt: dose.logged_at,
        insulin: {
          units: dose.units,
          insulinType: dose.insulin_type,
          brand: dose.brand,
          notes: dose.notes,
        },
        source: 'manual',
      })
      return { data: created.insulin, error: null }
    } catch (err) {
      return { data: null, error: toResultError(err) }
    }
  }

  const { data, error } = await supabase
    .from('insulin_doses')
    .insert({ ...dose, user_id: user.id })
    .select()
    .single()
  return { data, error }
}

export async function deleteInsulinDose(id) {
  if (!supabase) return { error: null }

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
  const user = await getCurrentUser()
  if (!user) {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000)
    const filtered = getDemoSnapshot().glucose.filter(r => new Date(r.recorded_at) >= cutoff)
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
  const user = await getCurrentUser()
  if (!user) {
    return { data: getDemoSnapshot().glucose.slice(0, limit), error: null }
  }

  const { data, error } = await supabase
    .from('glucose_readings')
    .select('*')
    .order('recorded_at', { ascending: false })
    .limit(limit)
  return { data: data || [], error }
}

export async function addGlucoseReading(reading) {
  const user = await getCurrentUser()
  if (!user) {
    try {
      const created = addDemoEntryBatch({
        occurredAt: reading.recorded_at,
        glucose: {
          value: reading.value,
          unit: 'mg/dL',
          notes: reading.notes,
        },
        source: 'manual',
      })
      return { data: created.glucose, error: null }
    } catch (err) {
      return { data: null, error: toResultError(err) }
    }
  }

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
  const user = await getCurrentUser()
  if (!user) {
    try {
      const saved = JSON.parse(getStorage().getItem(DEMO_SETTINGS_KEY) || 'null')
      return { data: sanitizeStoredSettings(saved ?? mockSettings), error: null }
    } catch {
      return { data: sanitizeStoredSettings(mockSettings), error: null }
    }
  }

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()
  return { data, error }
}

export async function updateUserSettings(settings) {
  const user = await getCurrentUser()
  if (!user) {
    const data = sanitizeStoredSettings(settings)
    getStorage().setItem(DEMO_SETTINGS_KEY, JSON.stringify(data))
    return { data, error: null }
  }

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

export function calculateStats(glucoseReadings, meals, insulinDoses, thresholds = { low: 70, high: 180 }) {
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
  const inRange = glucoseReadings.filter(r => r.value >= thresholds.low && r.value <= thresholds.high).length
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
