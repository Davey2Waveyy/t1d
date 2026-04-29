import { useEffect, useState } from 'react'
import {
  Bot,
  CalendarDays,
  CloudCog,
  Droplet,
  Loader2,
  Lock,
  Plus,
  Sparkles,
  Syringe,
  Timer,
  TrendingUp,
  Utensils,
} from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis } from 'recharts'
import { useAuth } from '../../contexts/AuthContext'
import { useSettings } from '../../contexts/SettingsContext'
import { getIntegrationAccess } from '../../lib/dashboardAccess'
import {
  calculateStats,
  getGlucoseReadings,
  getInsulinDoses,
  getMeals,
} from '../../lib/dataService'
import AIChatbot from './AIChatbot'
import DexcomImport from './DexcomImport'
import EmptyState from '../ui/EmptyState'
import StatCard from '../ui/StatCard'
import './Overview.css'

const trendArrows = {
  rising: '↑',
  falling: '↓',
  stable: '→',
  rising_fast: '↑↑',
  falling_fast: '↓↓',
}

const activityIcons = {
  meal: Utensils,
  insulin: Syringe,
  glucose: Droplet,
}

function getGreeting(timezone) {
  const now = new Date()
  const hourStr = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    hour12: false,
  }).format(now)

  const hour = parseInt(hourStr, 10)

  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function buildActivityFeed(meals, insulinDoses, glucoseReadings, formatTime, glucoseUnit) {
  const mealItems = (meals || []).map((meal) => ({
    id: `meal-${meal.id}`,
    type: 'meal',
    occurredAt: meal.logged_at,
    label: meal.name || meal.food_name || meal.meal_type || 'Meal logged',
    detail: `${meal.carbs || 0}g carbs`,
    time: formatTime(meal.logged_at),
  }))

  const doseItems = (insulinDoses || []).map((dose) => ({
    id: `dose-${dose.id}`,
    type: 'insulin',
    occurredAt: dose.logged_at,
    label: `${dose.insulin_type || 'Insulin'} dose`,
    detail: `${dose.units || 0}u ${dose.brand || ''}`.trim(),
    time: formatTime(dose.logged_at),
  }))

  const readingItems = (glucoseReadings || [])
    .slice(-3)
    .map((reading) => ({
      id: `glucose-${reading.id}`,
      type: 'glucose',
      occurredAt: reading.recorded_at,
      label: `${reading.value} ${glucoseUnit}`,
      detail: 'Latest glucose reading',
      time: formatTime(reading.recorded_at),
    }))

  return [...mealItems, ...doseItems, ...readingItems]
    .sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt))
    .slice(0, 6)
}

function buildQuickInsights({ stats, meals, insulinDoses, glucoseReadings, access, settings }) {
  if (!glucoseReadings.length) {
    return [
      {
        tone: 'sky',
        title: 'No glucose context yet',
        detail: 'Add readings or connect Nightscout to populate charts, quick insights, and the AI rail.',
      },
      {
        tone: 'amber',
        title: 'Seed the dashboard',
        detail: 'Logging a meal and an insulin dose is enough to make the command center feel alive.',
      },
    ]
  }

  const latestMeal = meals[0]
  const latestDose = insulinDoses[0]
  const insights = []

  if (stats.currentGlucose >= 180) {
    insights.push({
      tone: 'amber',
      title: 'Glucose is above target',
      detail: `Current glucose is ${stats.currentGlucose} ${settings.glucoseUnit} with a ${trendArrows[stats.glucoseTrend] || '→'} trend.`,
    })
  } else if (stats.currentGlucose <= 70) {
    insights.push({
      tone: 'rose',
      title: 'Glucose is below target',
      detail: `Current glucose is ${stats.currentGlucose} ${settings.glucoseUnit}. Prioritize a real-world safety check before acting on app data.`,
    })
  } else {
    insights.push({
      tone: 'emerald',
      title: 'Currently in range',
      detail: `${stats.timeInRange}% time in range over the loaded window with a ${trendArrows[stats.glucoseTrend] || '→'} trend.`,
    })
  }

  if (latestMeal) {
    insights.push({
      tone: 'amber',
      title: 'Latest meal context',
      detail: `${latestMeal.name || latestMeal.food_name || 'Most recent meal'} logged ${latestMeal.carbs || 0}g carbs at ${new Date(latestMeal.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
    })
  } else {
    insights.push({
      tone: 'sky',
      title: 'Meals are missing',
      detail: 'Your charts are live, but meal context is still sparse. Logging meals will make post-meal spikes easier to explain.',
    })
  }

  if (!access.canUseProtectedFeatures) {
    insights.push({
      tone: 'violet',
      title: 'AI and sync are preview-only',
      detail: 'Guests can explore the surface, but signed-in sessions unlock Gemini and Nightscout inputs.',
    })
  } else if (!settings.geminiApiKey || !settings.nightscoutUrl) {
    insights.push({
      tone: 'sky',
      title: 'Rail is ready for setup',
      detail: 'Add your Gemini key or Nightscout credentials in Settings to light up the assistant and live sync cards.',
    })
  } else if (latestDose) {
    insights.push({
      tone: 'violet',
      title: 'Full command center is armed',
      detail: `Most recent insulin entry was ${latestDose.units || 0}u ${latestDose.insulin_type || 'dose'} at ${new Date(latestDose.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
    })
  }

  return insights.slice(0, 3)
}

export default function Overview({ onViewChange }) {
  const { settings, formatTime } = useSettings()
  const { user, isGuest } = useAuth()
  const access = getIntegrationAccess({ user, isGuest })
  const [glucoseReadings, setGlucoseReadings] = useState([])
  const [meals, setMeals] = useState([])
  const [insulinDoses, setInsulinDoses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadOverviewData() {
      setLoading(true)

      try {
        const [readingsRes, mealsRes, dosesRes] = await Promise.all([
          getGlucoseReadings(48),
          getMeals(12),
          getInsulinDoses(12),
        ])

        if (cancelled) {
          return
        }

        setGlucoseReadings(readingsRes.data || [])
        setMeals(mealsRes.data || [])
        setInsulinDoses(dosesRes.data || [])
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadOverviewData()

    return () => {
      cancelled = true
    }
  }, [])

  const stats = calculateStats(glucoseReadings, meals, insulinDoses)
  const sparklineData = glucoseReadings.slice(-120).map((reading) => ({
    value: reading.value,
    time: reading.recorded_at,
  }))
  const activityFeed = buildActivityFeed(meals, insulinDoses, glucoseReadings, formatTime, settings.glucoseUnit)
  const quickInsights = buildQuickInsights({
    stats,
    meals,
    insulinDoses,
    glucoseReadings,
    access,
    settings,
  })

  const latestMeal = meals[0]
  const latestDose = insulinDoses[0]
  const glucoseTrendTone = stats.glucoseTrend.includes('falling')
    ? 'down'
    : stats.glucoseTrend.includes('rising')
      ? 'up'
      : 'stable'
  const glucoseTrendLabel = {
    rising_fast: 'Rising quickly',
    rising: 'Rising',
    falling_fast: 'Falling quickly',
    falling: 'Falling',
    stable: 'Stable',
  }[stats.glucoseTrend] || 'Stable'

  if (loading) {
    return (
      <div className="overview overview--loading">
        <div className="card overview-loading-card">
          <Loader2 size={28} className="spinner" />
          <p>Loading your command center...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="overview">
      <div className="overview-shell">
        <div className="overview-main">
          <section className="overview-hero">
            <div className="overview-hero-copy">
              <span className="overview-hero-kicker">{getGreeting(settings.timezone)}</span>
              <h1 className="overview-title">Your command center is live.</h1>
              <p className="overview-subtitle">
                Monitor glucose, meals, insulin, and protected integrations from one denser working surface.
              </p>
            </div>

            <div className="overview-hero-metrics">
              <div className="overview-chip">
                <CalendarDays size={14} />
                {glucoseReadings.length} readings loaded
              </div>
              <div className="overview-chip">
                {access.canUseProtectedFeatures ? <Bot size={14} /> : <Lock size={14} />}
                {access.canUseProtectedFeatures ? 'Signed-in session' : 'Guest preview'}
              </div>
              <div className="overview-chip">
                <CloudCog size={14} />
                {settings.nightscoutUrl ? 'Nightscout configured' : 'Nightscout not configured'}
              </div>
            </div>

            <div className="overview-actions">
              <button className="btn btn-primary btn-sm" type="button" onClick={() => onViewChange?.('meals')}>
                <Plus size={16} /> Log Meal
              </button>
              <button className="btn btn-secondary btn-sm" type="button" onClick={() => onViewChange?.('insulin')}>
                <Plus size={16} /> Log Insulin
              </button>
              <button className="btn btn-secondary btn-sm" type="button" onClick={() => onViewChange?.('settings')}>
                <Sparkles size={16} /> Configure Rail
              </button>
            </div>
          </section>

          <div className="overview-stats">
            <StatCard
              icon={Droplet}
              label="Current Glucose"
              value={stats.currentGlucose ?? '—'}
              unit={settings.glucoseUnit}
              trend={glucoseTrendTone}
              trendLabel={glucoseTrendLabel}
              accentColor="teal"
            />
            <StatCard
              icon={Timer}
              label="Time in Range"
              value={glucoseReadings.length ? `${stats.timeInRange}%` : '—'}
              trend={stats.timeInRange >= 70 ? 'stable' : 'down'}
              trendLabel={stats.timeInRange >= 70 ? 'On target' : 'Needs attention'}
              accentColor="emerald"
            />
            <StatCard
              icon={Syringe}
              label="Active Insulin"
              value={glucoseReadings.length ? stats.activeInsulin : '—'}
              unit="u"
              accentColor="sky"
            />
            <StatCard
              icon={Utensils}
              label="Carbs Today"
              value={meals.length ? stats.carbsToday : '—'}
              unit="g"
              accentColor="amber"
            />
          </div>

          <div className="overview-chart card">
            <div className="card-header">
              <div>
                <h3 className="card-title">48-Hour glucose trace</h3>
                <p className="card-subtitle">
                  Avg {stats.avgGlucose || '—'} {settings.glucoseUnit} · SD {stats.standardDeviation || '—'} · Est. A1C {stats.estimatedA1C || '—'}
                </p>
              </div>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => onViewChange?.('glucose')}>
                View Details →
              </button>
            </div>

            {sparklineData.length ? (
              <div className="overview-chart-area">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={sparklineData}>
                    <YAxis domain={[50, 250]} hide />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-light)',
                        fontSize: '0.85rem',
                        fontFamily: 'var(--font-mono)',
                      }}
                      labelFormatter={(time) => formatTime(time, { hour: '2-digit', minute: '2-digit' })}
                      formatter={(value) => [`${value} ${settings.glucoseUnit}`, 'Glucose']}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#2DD4A8"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 4, fill: '#2DD4A8', stroke: '#0D1B16', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>

                <div className="glucose-zones">
                  <div className="glucose-zone zone-high">High &gt; 180</div>
                  <div className="glucose-zone zone-range">In range</div>
                  <div className="glucose-zone zone-low">Low &lt; 70</div>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={Droplet}
                title="No glucose trace yet"
                description="Bring in CGM data or log manual readings to turn the chart into a live operating surface."
                action="Open Glucose Trends"
                onAction={() => onViewChange?.('glucose')}
              />
            )}
          </div>

          <div className="overview-lower-grid">
            <div className="card overview-activity">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Recent activity</h3>
                  <p className="card-subtitle">The most recent readings, meals, and insulin entries across your session</p>
                </div>
              </div>

              {activityFeed.length ? (
                <div className="activity-list">
                  {activityFeed.map((item) => {
                    const Icon = activityIcons[item.type] || Droplet

                    return (
                      <div key={item.id} className="activity-item">
                        <div className={`activity-icon activity-icon--${item.type}`}>
                          <Icon size={14} />
                        </div>
                        <div className="activity-info">
                          <span className="activity-label">{item.label}</span>
                          <span className="activity-detail">{item.detail}</span>
                        </div>
                        <span className="activity-time">{item.time}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <EmptyState
                  icon={CalendarDays}
                  title="Nothing logged yet"
                  description="Start with a meal, insulin dose, or glucose entry to replace this empty lane with real activity."
                  action="Log Meal"
                  onAction={() => onViewChange?.('meals')}
                />
              )}
            </div>

            <div className="card overview-summary">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Operations board</h3>
                  <p className="card-subtitle">Fast context for what is loaded, missing, and ready to use</p>
                </div>
              </div>

              <div className="summary-items">
                <div className="summary-row">
                  <span className="summary-label">Latest meal</span>
                  <span className="summary-value">
                    {latestMeal ? `${latestMeal.carbs || 0}g at ${formatTime(latestMeal.logged_at)}` : 'Not logged'}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Latest insulin</span>
                  <span className="summary-value">
                    {latestDose ? `${latestDose.units || 0}u at ${formatTime(latestDose.logged_at)}` : 'Not logged'}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Assistant</span>
                  <span className="summary-value accent">
                    {access.canUseProtectedFeatures
                      ? settings.geminiApiKey
                        ? 'Ready this session'
                        : 'Needs Gemini key'
                      : 'Locked in guest mode'}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Nightscout</span>
                  <span className="summary-value">
                    {settings.nightscoutUrl ? 'Configured this session' : 'Not configured'}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Loaded window</span>
                  <span className="summary-value">{glucoseReadings.length ? '48 hours' : 'Waiting for data'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="overview-rail">
          <AIChatbot onOpenSettings={() => onViewChange?.('settings')} />
          <DexcomImport onOpenSettings={() => onViewChange?.('settings')} />

          <div className="card overview-insights">
            <div className="card-header">
              <div>
                <h3 className="card-title">Quick insights</h3>
                <p className="card-subtitle">Local heuristics that keep the rail useful even before AI is configured</p>
              </div>
            </div>
            <div className="insight-list">
              {quickInsights.map((insight) => (
                <div key={insight.title} className={`insight-item insight-item--${insight.tone}`}>
                  <div className="insight-item__icon">
                    <TrendingUp size={14} />
                  </div>
                  <div>
                    <h4>{insight.title}</h4>
                    <p>{insight.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card overview-actions-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Next actions</h3>
                <p className="card-subtitle">Shortcuts for filling empty lanes or tightening the rail setup</p>
              </div>
            </div>

            <div className="overview-action-list">
              <button className="overview-action-row" type="button" onClick={() => onViewChange?.('meals')}>
                <span>Log a meal entry</span>
                <Plus size={14} />
              </button>
              <button className="overview-action-row" type="button" onClick={() => onViewChange?.('insulin')}>
                <span>Log an insulin dose</span>
                <Plus size={14} />
              </button>
              <button className="overview-action-row" type="button" onClick={() => onViewChange?.('glucose')}>
                <span>Open glucose detail view</span>
                <TrendingUp size={14} />
              </button>
              <button className="overview-action-row" type="button" onClick={() => onViewChange?.('settings')}>
                <span>Configure AI and Nightscout</span>
                <Sparkles size={14} />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
