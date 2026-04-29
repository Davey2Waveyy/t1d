import { useState, useEffect } from 'react';
import { Plus, Search, Utensils, Coffee, Sun, Moon, Cookie, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getMeals, addMeal, calculateCarbBreakdown } from '../../lib/dataService';
import { useSettings } from '../../contexts/SettingsContext';
import NumberInput from '../ui/NumberInput';
import EmptyState from '../ui/EmptyState';
import './MealLog.css';

const mealIcons = { breakfast: Coffee, lunch: Sun, dinner: Moon, snack: Cookie };

export default function MealLog() {
  const { formatTime, getLocalDatetimeValue } = useSettings();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    food_name: '',
    carbs: '',
    meal_type: 'lunch',
    protein: '',
    fat: '',
    fiber: '',
    notes: '',
    logged_at: getLocalDatetimeValue(),
  });

  useEffect(() => {
    loadMeals();
  }, []);

  async function loadMeals() {
    setLoading(true);
    const { data, error } = await getMeals(50);
    if (error) {
      console.error('Error loading meals:', error);
    } else {
      setMeals(data);
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.food_name.trim()) {
      setError('Please enter a meal name');
      return;
    }
    if (!formData.carbs || Number(formData.carbs) < 0) {
      setError('Please enter valid carbs');
      return;
    }

    setSaving(true);
    const mealData = {
      food_name: formData.food_name.trim(),
      carbs: Number(formData.carbs),
      protein: formData.protein ? Number(formData.protein) : null,
      fat: formData.fat ? Number(formData.fat) : null,
      fiber: formData.fiber ? Number(formData.fiber) : null,
      meal_type: formData.meal_type,
      notes: formData.notes.trim() || null,
      logged_at: formData.logged_at ? new Date(formData.logged_at).toISOString() : new Date().toISOString(),
    };

    const { data, error } = await addMeal(mealData);
    setSaving(false);

    if (error) {
      setError(error.message || 'Failed to save meal');
    } else {
      setSuccess('Meal logged successfully!');
      setMeals([data, ...meals]);
      setFormData({
        food_name: '',
        carbs: '',
        meal_type: 'lunch',
        protein: '',
        fat: '',
        fiber: '',
        notes: '',
        logged_at: getLocalDatetimeValue(),
      });
      setTimeout(() => setSuccess(''), 3000);
    }
  }

  const filtered = meals.filter((m) =>
    m.food_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const carbBreakdown = calculateCarbBreakdown(meals);
  const hasCarbData = carbBreakdown.some(item => item.value > 0);

  if (loading) {
    return (
      <div className="meal-log">
        <div className="module-header">
          <div>
            <h1 className="module-title">Meal Log</h1>
            <p className="module-subtitle">Track your meals and carbohydrate intake</p>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-2xl)' }}>
          <Loader2 size={32} className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="meal-log">
      <div className="module-header">
        <div>
          <h1 className="module-title">Meal Log</h1>
          <p className="module-subtitle">Track your meals and carbohydrate intake</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => document.getElementById('meal-name')?.focus()}>
          <Plus size={16} /> Add Meal
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="meal-log-grid">
        {/* Entry Form */}
        <div className="card meal-form">
          <h3 className="card-title">Log New Meal</h3>
          <form className="meal-form-inner" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="meal-name">Meal Name</label>
              <input
                className="form-input"
                id="meal-name"
                placeholder="e.g. Grilled Chicken Salad"
                value={formData.food_name}
                onChange={(e) => setFormData({ ...formData, food_name: e.target.value })}
                disabled={saving}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="meal-carbs">Carbs (g) *</label>
                <NumberInput
                  id="meal-carbs"
                  placeholder="0"
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                  disabled={saving}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="meal-type">Meal Type</label>
                <select
                  className="form-select"
                  id="meal-type"
                  value={formData.meal_type}
                  onChange={(e) => setFormData({ ...formData, meal_type: e.target.value })}
                  disabled={saving}
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="meal-protein">Protein (g)</label>
                <NumberInput
                  id="meal-protein"
                  placeholder="0"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                  disabled={saving}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="meal-time">Time</label>
                <input
                  className="form-input"
                  id="meal-time"
                  type="datetime-local"
                  value={formData.logged_at}
                  onChange={(e) => setFormData({ ...formData, logged_at: e.target.value })}
                  disabled={saving}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="meal-notes">Notes</label>
              <input
                className="form-input"
                id="meal-notes"
                placeholder="Optional notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                disabled={saving}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={saving}
            >
              {saving ? <><Loader2 size={16} className="spinner" /> Saving...</> : 'Save Meal'}
            </button>
          </form>
        </div>

        {/* Carb breakdown chart */}
        <div className="card meal-chart">
          <h3 className="card-title">Carb Breakdown by Meal Type</h3>
          {hasCarbData ? (
            <div className="meal-chart-area">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={carbBreakdown.filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {carbBreakdown.filter(item => item.value > 0).map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-light)',
                      fontSize: '0.85rem',
                    }}
                    formatter={(value) => [`${value}g`, 'Carbs']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="meal-chart-legend">
                {carbBreakdown.map((item) => (
                  <div key={item.name} className="legend-item">
                    <span className="legend-dot" style={{ background: item.fill }} />
                    <span className="legend-label">{item.name}</span>
                    <span className="legend-value">{item.value}g</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Utensils}
              title="No carb data yet"
              description="Log meals to see your carb breakdown"
            />
          )}
        </div>
      </div>

      {/* Recent meals table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Meals</h3>
          <div className="search-box">
            <Search size={14} />
            <input
              className="search-input"
              placeholder="Search meals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {meals.length === 0 ? (
          <EmptyState
            icon={Utensils}
            title="No meals logged yet"
            description="Log your first meal to start tracking your carbohydrate intake"
            action="Log Meal"
            onAction={() => document.getElementById('meal-name')?.focus()}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No meals found"
            description={`No meals match "${searchTerm}"`}
          />
        ) : (
          <div className="meals-table">
            <div className="table-header">
              <span>Meal</span>
              <span>Type</span>
              <span>Carbs</span>
              <span>Protein</span>
              <span>Time</span>
            </div>
            {filtered.map((meal) => {
              const Icon = mealIcons[meal.meal_type] || Utensils;
              return (
                <div key={meal.id} className="table-row">
                  <span className="meal-name-cell">
                    <div className={`meal-type-icon meal-type-icon--${meal.meal_type}`}>
                      <Icon size={14} />
                    </div>
                    {meal.food_name}
                  </span>
                  <span className="badge badge-teal">{meal.meal_type}</span>
                  <span className="text-data">{meal.carbs}g</span>
                  <span className="text-data">{meal.protein ? `${meal.protein}g` : '—'}</span>
                  <span className="text-data table-time">
                    {formatTime(meal.logged_at, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
