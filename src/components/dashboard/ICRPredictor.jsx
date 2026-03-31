import { useState, useEffect } from 'react';
import { Brain, Info, Loader2, Calculator } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { getMeals, getInsulinDoses, getGlucoseReadings, getUserSettings } from '../../lib/dataService';
import EmptyState from '../ui/EmptyState';
import './ICRPredictor.css';

export default function ICRPredictor() {
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState([]);
  const [doses, setDoses] = useState([]);
  const [readings, setReadings] = useState([]);
  const [userSettings, setUserSettings] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [mealsRes, dosesRes, readingsRes, settingsRes] = await Promise.all([
      getMeals(100),
      getInsulinDoses(100),
      getGlucoseReadings(168), // 7 days
      getUserSettings(),
    ]);
    setMeals(mealsRes.data || []);
    setDoses(dosesRes.data || []);
    setReadings(readingsRes.data || []);
    setUserSettings(settingsRes.data);
    setLoading(false);
  }

  // Calculate ICR data from real meals and insulin doses
  const calculateICRData = () => {
    const byMeal = {
      breakfast: { carbs: 0, insulin: 0, count: 0 },
      lunch: { carbs: 0, insulin: 0, count: 0 },
      dinner: { carbs: 0, insulin: 0, count: 0 },
      snack: { carbs: 0, insulin: 0, count: 0 },
    };

    // Try to match meals with bolus doses within 30 min
    meals.forEach((meal) => {
      if (!meal.carbs || meal.carbs === 0) return;
      const mealTime = new Date(meal.logged_at).getTime();
      const mealType = meal.meal_type?.toLowerCase() || 'snack';

      // Find bolus dose close to this meal
      const matchingDose = doses.find((d) => {
        if (d.insulin_type === 'basal') return false;
        const doseTime = new Date(d.logged_at).getTime();
        return Math.abs(doseTime - mealTime) < 30 * 60 * 1000; // within 30 min
      });

      if (matchingDose && byMeal[mealType]) {
        byMeal[mealType].carbs += meal.carbs;
        byMeal[mealType].insulin += matchingDose.units;
        byMeal[mealType].count++;
      }
    });

    // Calculate ratios
    const calculated = {};
    let totalCarbs = 0;
    let totalInsulin = 0;

    Object.entries(byMeal).forEach(([mealType, data]) => {
      if (data.count > 0 && data.insulin > 0) {
        const ratio = Math.round(data.carbs / data.insulin);
        const confidence = Math.min(95, Math.round(50 + data.count * 3));
        calculated[mealType] = {
          ratio: `1:${ratio}`,
          ratioNum: ratio,
          confidence,
          mealsLogged: data.count,
        };
        totalCarbs += data.carbs;
        totalInsulin += data.insulin;
      } else {
        // Use user settings if available
        const settingKey = `icr_${mealType}`;
        const userRatio = userSettings?.[settingKey];
        calculated[mealType] = {
          ratio: userRatio ? `1:${userRatio}` : '—',
          ratioNum: userRatio || 0,
          confidence: userRatio ? 50 : 0,
          mealsLogged: data.count,
        };
      }
    });

    // Overall
    let overallRatio = 10;
    let overallConfidence = 0;

    if (totalInsulin > 0) {
      overallRatio = Math.round(totalCarbs / totalInsulin);
      const totalMeals = Object.values(byMeal).reduce((sum, d) => sum + d.count, 0);
      overallConfidence = Math.min(95, Math.round(40 + totalMeals * 2));
    }

    return {
      overall: { ratio: `1:${overallRatio}`, ratioNum: overallRatio, confidence: overallConfidence },
      byMeal: calculated,
    };
  };

  const icrData = calculateICRData();
  const totalMealsWithInsulin = Object.values(icrData.byMeal).reduce((sum, d) => sum + d.mealsLogged, 0);
  const hasEnoughData = totalMealsWithInsulin >= 3;

  if (loading) {
    return (
      <div className="icr-predictor">
        <div className="module-header">
          <div>
            <h1 className="module-title">ICR Predictor</h1>
            <p className="module-subtitle">Insulin-to-carb ratios based on your data</p>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-2xl)' }}>
          <Loader2 size={32} className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="icr-predictor">
      <div className="module-header">
        <div>
          <h1 className="module-title">ICR Predictor</h1>
          <p className="module-subtitle">Insulin-to-carb ratios based on your data</p>
        </div>
      </div>

      {!hasEnoughData ? (
        <div className="card">
          <EmptyState
            icon={Calculator}
            title="Not enough data to calculate ICR"
            description="Log meals and matching insulin doses (within 30 min) to calculate your insulin-to-carb ratios. Need at least 3 matched meal/dose pairs."
          />
          {userSettings && (
            <div style={{ padding: 'var(--space-lg)', borderTop: '1px solid var(--border-subtle)' }}>
              <h4 style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-md)', fontSize: '0.9rem' }}>
                Your configured ratios (from Settings):
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-md)' }}>
                {['breakfast', 'lunch', 'dinner', 'snack'].map((meal) => (
                  <div key={meal} style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'capitalize' }}>{meal}</div>
                    <div style={{ color: 'var(--text-light)', fontSize: '1.1rem', fontWeight: 600 }}>
                      {userSettings[`icr_${meal}`] ? `1:${userSettings[`icr_${meal}`]}` : '—'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="icr-hero card">
            <div className="icr-hero-badge"><Brain size={16} /> Calculated from {totalMealsWithInsulin} meals</div>
            <div className="icr-hero-ratio">
              <span className="icr-ratio-label">Overall Calculated ICR</span>
              <span className="icr-ratio-value">{icrData.overall.ratio}</span>
              <span className="icr-ratio-sub">1 unit of insulin per {icrData.overall.ratioNum}g of carbs</span>
            </div>
            <div className="icr-confidence">
              <div className="icr-confidence-bar">
                <div className="icr-confidence-fill" style={{ width: `${icrData.overall.confidence}%` }} />
              </div>
              <span className="icr-confidence-label">{icrData.overall.confidence}% Confidence</span>
            </div>
          </div>

          <div className="icr-grid">
            {Object.entries(icrData.byMeal).map(([meal, data]) => (
              <div key={meal} className="card icr-meal-card">
                <div className="icr-meal-type">{meal.charAt(0).toUpperCase() + meal.slice(1)}</div>
                <div className="icr-meal-ratio">{data.ratio}</div>
                <div className="icr-meal-meta">
                  {data.mealsLogged > 0 ? (
                    <>
                      <div className="icr-confidence-mini">
                        <div className="icr-confidence-bar-mini">
                          <div className="icr-confidence-fill-mini" style={{ width: `${data.confidence}%` }} />
                        </div>
                        <span>{data.confidence}%</span>
                      </div>
                      <span className="icr-meals-count">{data.mealsLogged} meals logged</span>
                    </>
                  ) : (
                    <span className="icr-meals-count">No data yet</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', color: 'var(--text-muted)' }}>
              <Info size={14} />
              <span style={{ fontSize: '0.85rem' }}>
                These ratios are calculated from your logged meals and insulin doses.
                Log more meals with matching bolus doses to improve accuracy.
                Always consult your healthcare provider before adjusting your ratios.
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
