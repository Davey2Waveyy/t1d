# Betatrace - Core Functionality Session

## Branch: `feature/core-functionality`
## Goal: Make the app actually work - real data, no mocks, empty states when no data

---

## Scope of This Session

Your scope is repository implementation only: inspect, edit, test, commit, and push the requested changes. Do not prepare the Devpost submission, demo video, judging materials, project strategy, or deployment; those will be handled separately.

---

## Project Info

- **Repo**: https://github.com/Davey2Waveyy/t1d
- **Stack**: React 19, Vite, Supabase
- **Supabase Project**: `xteeeszbfvwjulpjudzo`
- **Run locally**: `cd C:\Users\dodgi\betatrace && npm run dev`

---

## Current State

- Dashboard shows **fake mock data** everywhere
- Forms exist but **don't save anything**
- Charts display **hardcoded values**

## Target State

- Dashboard shows **empty states** until user adds data
- Forms **save to Supabase** database
- Charts display **real user data**
- Everything **actually works**

---

## Database Tables (Already Created in Supabase)

```
profiles        - User info (auto-created on signup)
meals           - user_id, meal_type, food_name, carbs, protein, fat, fiber, notes, logged_at
insulin_doses   - user_id, insulin_type, brand, units, injection_site, notes, logged_at
glucose_readings - user_id, value, unit, source, notes, recorded_at
user_settings   - user_id, target_low, target_high, icr values, correction_factor, preferences
```

All tables have Row Level Security - users only see their own data.

---

## Tasks

### 1. Create Data Service
**Create file**: `src/lib/dataService.js`

```javascript
import { supabase } from './supabase'

// MEALS
export async function getMeals(limit = 50) {
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .order('logged_at', { ascending: false })
    .limit(limit)
  return { data, error }
}

export async function addMeal(meal) {
  const { data, error } = await supabase
    .from('meals')
    .insert(meal)
    .select()
    .single()
  return { data, error }
}

// INSULIN
export async function getInsulinDoses(limit = 50) { ... }
export async function addInsulinDose(dose) { ... }

// GLUCOSE
export async function getGlucoseReadings(hours = 24) { ... }
export async function addGlucoseReading(reading) { ... }

// SETTINGS
export async function getUserSettings() { ... }
export async function updateUserSettings(settings) { ... }
```

### 2. Remove Mock Data Dependency
**File**: `src/data/mockData.js`
- Don't delete yet, but stop importing it in components
- Replace with real data fetching

### 3. Update Components with Empty States

**Pattern for each component:**
```javascript
function MealLog() {
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMeals()
  }, [])

  if (loading) return <LoadingSpinner />

  if (meals.length === 0) {
    return (
      <EmptyState
        title="No meals logged yet"
        description="Log your first meal to start tracking"
        action="Log Meal"
      />
    )
  }

  return <MealList meals={meals} />
}
```

### 4. Components to Update

| Component | File | Changes Needed |
|-----------|------|----------------|
| Overview | `src/components/dashboard/Overview.jsx` | Fetch real stats, empty state |
| MealLog | `src/components/dashboard/MealLog.jsx` | Save meals, load meals, empty state |
| InsulinLog | `src/components/dashboard/InsulinLog.jsx` | Save doses, load doses, empty state |
| GlucoseTrends | `src/components/dashboard/GlucoseTrends.jsx` | Load readings, empty chart state |
| ICRPredictor | `src/components/dashboard/ICRPredictor.jsx` | Calculate from real data or show "need more data" |
| A1CEstimator | `src/components/dashboard/A1CEstimator.jsx` | Calculate from readings or show empty |
| Settings | `src/components/dashboard/Settings.jsx` | Load/save user_settings |

### 5. Create EmptyState Component
**Create file**: `src/components/ui/EmptyState.jsx`

```javascript
export default function EmptyState({ icon, title, description, action, onAction }) {
  return (
    <div className="empty-state">
      {icon}
      <h3>{title}</h3>
      <p>{description}</p>
      {action && <button onClick={onAction}>{action}</button>}
    </div>
  )
}
```

---

## Implementation Order

1. Create `dataService.js` with all CRUD functions
2. Create `EmptyState.jsx` component
3. Update `MealLog.jsx` (simplest form)
4. Update `InsulinLog.jsx`
5. Update `GlucoseTrends.jsx`
6. Update `Overview.jsx` (aggregates data)
7. Update `Settings.jsx` (save preferences)
8. Update analytics components (ICR, A1C, Patterns)

---

## Testing

After each component:
1. Check empty state shows when no data
2. Add some data via form
3. Verify data appears in list/chart
4. Refresh page - data should persist
5. Check Supabase dashboard to confirm data saved

---

## When Done

```bash
git add -A
git commit -m "feat: Core functionality - real data, empty states, working forms"
git checkout main
git merge feature/core-functionality
git push origin main
```
