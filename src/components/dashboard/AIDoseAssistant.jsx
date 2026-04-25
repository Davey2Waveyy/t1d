import { useState } from 'react';
import { Brain, Sparkles, Loader2 } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { AIService } from '../../lib/AIService';
import { getMeals, getInsulinDoses, getGlucoseReadings, calculateStats } from '../../lib/dataService';
import NumberInput from '../ui/NumberInput';

export default function AIDoseAssistant() {
  const { settings } = useSettings();
  const [carbs, setCarbs] = useState('');
  const [glucose, setGlucose] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handlePredict = async () => {
    if (!settings.geminiApiKey) {
      setError('Please configure your Gemini API Key in Settings to use the AI Dose Assistant.');
      return;
    }
    
    setLoading(true);
    setError('');
    setResult(null);

    const aiService = new AIService(settings.geminiApiKey);
    
    // Gather context
    const [mealsRes, dosesRes, readingsRes] = await Promise.all([
      getMeals(10), // last 10 meals
      getInsulinDoses(10), // last 10 doses
      getGlucoseReadings(24), // last 24h glucose
    ]);

    const stats = calculateStats(readingsRes.data, mealsRes.data, dosesRes.data);

    const context = {
      userTarget: { 
        targetGlucose: Number(settings.targetGlucose) || 100, 
        currentGlucoseUnit: settings.glucoseUnit 
      },
      currentScenario: { 
        carbs: Number(carbs) || 0, 
        currentGlucose: Number(glucose) || stats.currentGlucose,
        activeInsulinApprox: stats.activeInsulin,
        glucoseTrend: stats.glucoseTrend,
      },
      recentMeals: mealsRes.data?.slice(0, 3) || [],
      recentInsulin: dosesRes.data?.slice(0, 3) || [],
      timeZone: settings.timezone,
      currentTime: new Date().toISOString()
    };

    const prediction = await aiService.getDoseRecommendation(context);

    if (prediction.error) {
      setError(prediction.error);
    } else {
      setResult(prediction);
    }
    
    setLoading(false);
  };

  return (
    <div className="card" style={{ borderColor: 'var(--accent-fuchsia)', boxShadow: '0 4px 20px rgba(217, 70, 239, 0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
        <Sparkles size={18} style={{ color: 'var(--accent-fuchsia)' }} />
        <h3 className="card-title" style={{ margin: 0, color: 'var(--accent-fuchsia)' }}>Smart Dose Assistant</h3>
      </div>
      
      <div className="settings-form">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" style={{ color: 'var(--text-light)' }}>Carbs (g)</label>
            <NumberInput 
              placeholder="e.g. 45" 
              value={carbs} 
              onChange={(e) => setCarbs(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ color: 'var(--text-light)' }}>Current Glucose ({settings.glucoseUnit})</label>
            <NumberInput 
              placeholder="Optional" 
              value={glucose} 
              onChange={(e) => setGlucose(e.target.value)} 
            />
          </div>
        </div>
        
        <button 
          className="btn" 
          style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-md)', background: 'var(--accent-fuchsia)', color: 'white', border: 'none' }}
          onClick={handlePredict}
          disabled={loading}
        >
          {loading ? <Loader2 size={16} className="spinner" /> : <Brain size={16} />}
          {loading ? 'Analyzing context...' : 'Get AI Recommendation'}
        </button>

        {error && (
          <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-sm)', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-md)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', borderTop: '2px solid var(--accent-fuchsia)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommended Dose</span>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'baseline', gap: 'var(--space-sm)', lineHeight: 1 }}>
                  {result.recommendedUnits} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Units</span>
                </div>
              </div>
              {result.confidenceScore && (
                <div style={{ background: 'rgba(217, 70, 239, 0.1)', color: 'var(--accent-fuchsia)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Brain size={12} /> {result.confidenceScore}% Confidence
                </div>
              )}
            </div>
            
            <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', lineHeight: 1.5, background: 'var(--bg-card)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)' }}>
              <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px', fontSize: '0.8rem', textTransform: 'uppercase' }}>Reasoning:</strong>
              {result.reasoning}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
