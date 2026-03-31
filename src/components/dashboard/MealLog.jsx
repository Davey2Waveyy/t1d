import { useState } from 'react';
import { Plus, Search, Utensils, Coffee, Sun, Moon, Cookie } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { recentMeals, carbBreakdown } from '../../data/mockData';
import './MealLog.css';

const mealIcons = { breakfast: Coffee, lunch: Sun, dinner: Moon, snack: Cookie };

export default function MealLog() {
  const [searchTerm, setSearchTerm] = useState('');
  const filtered = recentMeals.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="meal-log">
      <div className="module-header">
        <div>
          <h1 className="module-title">Meal Log</h1>
          <p className="module-subtitle">Track your meals and carbohydrate intake</p>
        </div>
        <button className="btn btn-primary btn-sm"><Plus size={16} /> Add Meal</button>
      </div>

      <div className="meal-log-grid">
        {/* Entry Form */}
        <div className="card meal-form">
          <h3 className="card-title">Log New Meal</h3>
          <form className="meal-form-inner" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label className="form-label" htmlFor="meal-name">Meal Name</label>
              <input className="form-input" id="meal-name" placeholder="e.g. Grilled Chicken Salad" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="meal-carbs">Carbs (g)</label>
                <input className="form-input" id="meal-carbs" type="number" placeholder="0" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="meal-type">Meal Type</label>
                <select className="form-select" id="meal-type">
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="meal-insulin">Insulin (u)</label>
                <input className="form-input" id="meal-insulin" type="number" step="0.5" placeholder="0" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="meal-time">Time</label>
                <input className="form-input" id="meal-time" type="time" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="meal-notes">Notes</label>
              <input className="form-input" id="meal-notes" placeholder="Optional notes..." />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Save Meal
            </button>
          </form>
        </div>

        {/* Carb breakdown chart */}
        <div className="card meal-chart">
          <h3 className="card-title">Weekly Carb Breakdown</h3>
          <div className="meal-chart-area">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={carbBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {carbBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', color: 'var(--text-light)', fontSize: '0.85rem' }}
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
        <div className="meals-table">
          <div className="table-header">
            <span>Meal</span>
            <span>Type</span>
            <span>Carbs</span>
            <span>Insulin</span>
            <span>Time</span>
          </div>
          {filtered.map((meal) => {
            const Icon = mealIcons[meal.type] || Utensils;
            return (
              <div key={meal.id} className="table-row">
                <span className="meal-name-cell">
                  <div className={`meal-type-icon meal-type-icon--${meal.type}`}><Icon size={14} /></div>
                  {meal.name}
                </span>
                <span className="badge badge-teal">{meal.type}</span>
                <span className="text-data">{meal.carbs}g</span>
                <span className="text-data">{meal.insulin}u</span>
                <span className="text-data table-time">{new Date(meal.time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
