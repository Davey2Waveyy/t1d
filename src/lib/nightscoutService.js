import { supabase } from './supabase'
import { addGlucoseReading } from './dataService'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function sha1(str) {
  const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

function cleanUrl(url) {
  return (url || '').trim().replace(/\/$/, '')
}

async function buildHeaders(apiSecret) {
  if (!apiSecret) return {}
  const hashed = await sha1(apiSecret.trim())
  return { 'api-secret': hashed }
}

function mapDirection(direction) {
  const map = {
    DoubleUp: 'rising_fast',
    SingleUp: 'rising',
    FortyFiveUp: 'rising',
    Flat: 'stable',
    FortyFiveDown: 'falling',
    SingleDown: 'falling',
    DoubleDown: 'falling_fast',
  }
  return map[direction] || 'stable'
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Tests whether a Nightscout site is reachable and returns the latest entry.
 * @param {string} url        - Nightscout base URL, e.g. https://mysite.fly.dev
 * @param {string} apiSecret  - Raw API_SECRET value (will be SHA-1 hashed)
 * @returns {{ ok: boolean, sgv?: number, error?: string }}
 */
export async function testNightscoutConnection(url, apiSecret) {
  try {
    const base = cleanUrl(url)
    if (!base) throw new Error('No URL provided')
    const headers = await buildHeaders(apiSecret)
    const res = await fetch(`${base}/api/v1/entries.json?count=1`, { headers })
    if (res.status === 401) throw new Error('Unauthorized — check your API secret')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return { ok: true, sgv: data[0]?.sgv ?? null }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

/**
 * Fetches recent SGV entries from Nightscout.
 * @param {string} url
 * @param {string} apiSecret
 * @param {number} hours - how many hours back to fetch
 * @returns {Array} raw Nightscout entry objects
 */
export async function fetchNightscoutEntries(url, apiSecret, hours = 24) {
  const base = cleanUrl(url)
  const headers = await buildHeaders(apiSecret)
  // 1 reading every 5 min = 12/hr
  const count = Math.ceil(hours * 12)
  const res = await fetch(`${base}/api/v1/entries.json?count=${count}`, { headers })
  if (res.status === 401) throw new Error('Unauthorized — check your API secret')
  if (!res.ok) throw new Error(`Nightscout returned HTTP ${res.status}`)
  return res.json()
}

/**
 * Fetches entries from Nightscout and inserts any not already in Supabase.
 * Uses the timestamp of the most recent existing reading to skip duplicates.
 *
 * @param {string} url
 * @param {string} apiSecret
 * @param {number} hours - how many hours of history to sync
 * @returns {{ inserted: number, total: number }}
 */
export async function syncNightscoutToSupabase(url, apiSecret, hours = 24) {
  // 1. Find the latest reading already in Supabase so we don't re-insert
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
  const { data: existing } = await supabase
    .from('glucose_readings')
    .select('recorded_at')
    .gte('recorded_at', cutoff)
    .order('recorded_at', { ascending: false })
    .limit(1)

  const latestExisting = existing?.length
    ? new Date(existing[0].recorded_at)
    : new Date(0)

  // 2. Fetch from Nightscout
  const entries = await fetchNightscoutEntries(url, apiSecret, hours)

  // 3. Insert only new SGV readings
  let inserted = 0
  for (const entry of entries) {
    if (entry.type !== 'sgv' || !entry.sgv) continue
    const recordedAt = new Date(entry.date)   // entry.date is Unix ms
    if (recordedAt <= latestExisting) continue

    const { error } = await addGlucoseReading({
      value: entry.sgv,
      recorded_at: recordedAt.toISOString(),
      trend: mapDirection(entry.direction),
      source: 'nightscout',
    })
    if (!error) inserted++
  }

  return { inserted, total: entries.filter(e => e.type === 'sgv' && e.sgv).length }
}
