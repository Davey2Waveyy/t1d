import {
  getDemoSnapshot,
  addDemoEntryBatch,
  resetDemoData,
  calculateStats,
  DemoValidationError,
} from './dataService'
import { getThresholds, toDisplayGlucose } from './glucoseUnits'

/**
 * Feature detection for the native WebMCP tool-registration API. Unsupported
 * browsers should never see this module throw - always check this first.
 */
export function isWebMcpSupported() {
  return typeof document !== 'undefined' && typeof document.modelContext?.registerTool === 'function'
}

export const WEBMCP_TOOL_NAMES = ['get_demo_state', 'log_demo_entry', 'reset_demo_data']

const SAFETY_BOUNDARY =
  'This is descriptive information about explicitly synthetic Betatrace demo data. It is not medical advice, a diagnosis, or a dosing recommendation - decisions about insulin and treatment belong with the user and their clinician.'

const RECENT_LIMIT = 10

function createAbortError() {
  if (typeof DOMException === 'function') {
    return new DOMException('The operation was aborted.', 'AbortError')
  }
  const err = new Error('The operation was aborted.')
  err.name = 'AbortError'
  return err
}

function assertNotAborted(options) {
  if (options?.signal?.aborted) {
    throw createAbortError()
  }
}

function recordSource(record) {
  return record?.source ?? 'seeded'
}

// ---------------------------------------------------------------------------
// get_demo_state - read-only
// ---------------------------------------------------------------------------

function buildGetDemoStateTool({ getSettings } = {}) {
  return {
    name: 'get_demo_state',
    description:
      'Returns a factual, read-only snapshot of Betatrace\'s explicitly synthetic guest-demo data: the current glucose reading and unit, time-in-range percentage, today\'s logged carbohydrate and insulin totals, and recent glucose/meal/insulin entries with their provenance (manual, webmcp, or seeded). Never returns dose recommendations, correction suggestions, calculated dosing, estimated A1C, active-insulin estimates, or treatment advice.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: true,
      untrustedContentHint: true,
    },
    async execute(_input, options) {
      assertNotAborted(options)

      const settings = getSettings?.() ?? {}
      const unit = settings.glucoseUnit === 'mmol/L' ? 'mmol/L' : 'mg/dL'
      const thresholds = getThresholds(settings)
      const snapshot = getDemoSnapshot()
      const stats = calculateStats(snapshot.glucose, snapshot.meals, snapshot.insulin, thresholds)

      assertNotAborted(options)

      return {
        synthetic: true,
        glucose: {
          current: stats.currentGlucose == null ? null : toDisplayGlucose(stats.currentGlucose, unit),
          unit,
          trend: stats.glucoseTrend,
          timeInRangePercent: stats.timeInRange,
        },
        today: {
          carbsGrams: stats.carbsToday,
          insulinUnits: stats.insulinToday,
        },
        recent: {
          glucose: snapshot.glucose.slice(0, RECENT_LIMIT).map((reading) => ({
            id: reading.id,
            value: toDisplayGlucose(reading.value, unit),
            unit,
            recordedAt: reading.recorded_at,
            source: recordSource(reading),
          })),
          meals: snapshot.meals.slice(0, RECENT_LIMIT).map((meal) => ({
            id: meal.id,
            foodName: meal.food_name ?? meal.name ?? 'Meal',
            carbs: meal.carbs ?? 0,
            mealType: (meal.meal_type ?? 'snack').toLowerCase(),
            loggedAt: meal.logged_at,
            source: recordSource(meal),
          })),
          insulin: snapshot.insulin.slice(0, RECENT_LIMIT).map((dose) => ({
            id: dose.id,
            units: dose.units ?? 0,
            insulinType: (dose.insulin_type ?? 'bolus').toLowerCase(),
            loggedAt: dose.logged_at,
            source: recordSource(dose),
          })),
        },
        safety: SAFETY_BOUNDARY,
      }
    },
  }
}

// ---------------------------------------------------------------------------
// log_demo_entry - mutating
// ---------------------------------------------------------------------------

const GLUCOSE_ENTRY_SCHEMA = {
  type: 'object',
  description: 'A single glucose reading the user says was already taken.',
  properties: {
    value: { type: 'number', description: 'Reading value, in the given unit.' },
    unit: { type: 'string', enum: ['mg/dL', 'mmol/L'] },
    notes: { type: 'string', maxLength: 500 },
  },
  required: ['value', 'unit'],
  additionalProperties: false,
}

const MEAL_ENTRY_SCHEMA = {
  type: 'object',
  description: 'A meal the user says was already eaten.',
  properties: {
    foodName: { type: 'string', maxLength: 120 },
    carbs: { type: 'number', description: 'Grams of carbohydrate, 0-500.' },
    mealType: { type: 'string', enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
    notes: { type: 'string', maxLength: 500 },
  },
  required: ['foodName', 'carbs', 'mealType'],
  additionalProperties: false,
}

const INSULIN_ENTRY_SCHEMA = {
  type: 'object',
  description: 'An insulin dose the user says was already taken.',
  properties: {
    units: { type: 'number', description: 'Units, greater than 0 and at most 100.' },
    insulinType: { type: 'string', enum: ['bolus', 'basal', 'correction'] },
    brand: { type: 'string', maxLength: 60 },
    notes: { type: 'string', maxLength: 500 },
  },
  required: ['units', 'insulinType'],
  additionalProperties: false,
}

function summarizeCreatedEntries(created) {
  const result = {}

  if (created.glucose) {
    result.glucose = {
      id: created.glucose.id,
      value: created.glucose.value,
      unit: created.glucose.unit,
      recordedAt: created.glucose.recorded_at,
    }
  }
  if (created.meal) {
    result.meal = {
      id: created.meal.id,
      foodName: created.meal.food_name,
      carbs: created.meal.carbs,
      mealType: created.meal.meal_type,
      loggedAt: created.meal.logged_at,
    }
  }
  if (created.insulin) {
    result.insulin = {
      id: created.insulin.id,
      units: created.insulin.units,
      insulinType: created.insulin.insulin_type,
      loggedAt: created.insulin.logged_at,
    }
  }

  return result
}

function buildLogDemoEntryTool() {
  return {
    name: 'log_demo_entry',
    description:
      'Records one combined synthetic demo event - any combination of a glucose reading, a meal, and an insulin dose - that the user says was already consumed or taken. This tool only records the exact values you provide; it never calculates, estimates, or recommends an insulin dose, correction, or any other treatment. At least one of glucose, meal, or insulin is required.',
    inputSchema: {
      type: 'object',
      properties: {
        occurredAt: {
          type: 'string',
          description: 'ISO 8601 date-time the event occurred. Defaults to now if omitted. Cannot be more than 5 minutes in the future.',
        },
        glucose: GLUCOSE_ENTRY_SCHEMA,
        meal: MEAL_ENTRY_SCHEMA,
        insulin: INSULIN_ENTRY_SCHEMA,
      },
      anyOf: [
        { required: ['glucose'] },
        { required: ['meal'] },
        { required: ['insulin'] },
      ],
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
    },
    async execute(input, options) {
      assertNotAborted(options)

      if (!input || typeof input !== 'object' || Array.isArray(input)) {
        throw new DemoValidationError('A request object is required.', 'input')
      }
      if (input.glucose == null && input.meal == null && input.insulin == null) {
        throw new DemoValidationError('At least one of glucose, meal, or insulin is required.', 'entries')
      }

      assertNotAborted(options)

      const created = addDemoEntryBatch({
        occurredAt: input.occurredAt,
        glucose: input.glucose,
        meal: input.meal,
        insulin: input.insulin,
        source: 'webmcp',
      })

      return { created: summarizeCreatedEntries(created) }
    },
  }
}

// ---------------------------------------------------------------------------
// reset_demo_data - mutating
// ---------------------------------------------------------------------------

function buildResetDemoDataTool() {
  return {
    name: 'reset_demo_data',
    description:
      'Deletes all locally added synthetic demo glucose, meal, and insulin entries (both manual and agent-logged) and restores the original seeded demo. Requires confirm: true. Does not affect any account, authentication, or settings - this only clears this browser\'s local synthetic demo data.',
    inputSchema: {
      type: 'object',
      properties: {
        confirm: { type: 'boolean', const: true, description: 'Must be true to confirm the reset.' },
      },
      required: ['confirm'],
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
    },
    async execute(input, options) {
      assertNotAborted(options)

      if (!input || input.confirm !== true) {
        throw new DemoValidationError('confirm must be true to reset demo data.', 'confirm')
      }

      assertNotAborted(options)

      resetDemoData()
      return { reset: true }
    },
  }
}

/**
 * Builds the exact three WebMCP tool definitions Betatrace registers for
 * the guest demo. `getSettings` is an optional () => settings getter used
 * so get_demo_state can report values in the viewer's current glucose unit
 * without needing to re-register tools whenever settings change.
 */
export function getWebMcpToolDefinitions({ getSettings } = {}) {
  return [
    buildGetDemoStateTool({ getSettings }),
    buildLogDemoEntryTool(),
    buildResetDemoDataTool(),
  ]
}
