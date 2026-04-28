import { useState } from 'react';
import { Syringe, Utensils, Droplet, Brain, Upload, Target, Gauge, AlertTriangle, Settings } from 'lucide-react';
import TopHeader from '../components/dashboard/TopHeader';
import BottomNav from '../components/dashboard/BottomNav';
import BottomSheet from '../components/dashboard/BottomSheet';
import Overview from '../components/dashboard/Overview';
import MealLog from '../components/dashboard/MealLog';
import InsulinLog from '../components/dashboard/InsulinLog';
import GlucoseTrends from '../components/dashboard/GlucoseTrends';
import ICRPredictor from '../components/dashboard/ICRPredictor';
import DexcomImport from '../components/dashboard/DexcomImport';
import A1CEstimator from '../components/dashboard/A1CEstimator';
import CorrectionFactor from '../components/dashboard/CorrectionFactor';
import PatternAlerts from '../components/dashboard/PatternAlerts';
import SettingsView from '../components/dashboard/Settings';
import './Dashboard.css';

const viewComponents = {
  overview: Overview,
  meals: MealLog,
  insulin: InsulinLog,
  glucose: GlucoseTrends,
  icr: ICRPredictor,
  dexcom: DexcomImport,
  a1c: A1CEstimator,
  correction: CorrectionFactor,
  patterns: PatternAlerts,
  settings: SettingsView,
};

const moreItems = [
  { id: 'insulin', label: 'Insulin Log', icon: Syringe },
  { id: 'icr', label: 'ICR Predictor', icon: Brain },
  { id: 'dexcom', label: 'Dexcom Import', icon: Upload },
  { id: 'a1c', label: 'A1C Estimator', icon: Target },
  { id: 'correction', label: 'Correction Factor', icon: Gauge },
  { id: 'patterns', label: 'Pattern Alerts', icon: AlertTriangle },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const fabItems = [
  { id: 'meals', label: 'Log Meal', icon: Utensils },
  { id: 'insulin', label: 'Log Insulin', icon: Syringe },
  { id: 'glucose', label: 'Log Glucose', icon: Droplet },
];

export default function Dashboard() {
  const [activeView, setActiveView] = useState('overview');
  const [moreOpen, setMoreOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  const ActiveComponent = viewComponents[activeView] || Overview;

  const handleViewChange = (view) => {
    setActiveView(view);
    setMoreOpen(false);
    setFabOpen(false);
  };

  return (
    <div className="dashboard-app">
      <TopHeader activeView={activeView} onSettingsOpen={() => handleViewChange('settings')} />

      <main className="dashboard-content">
        <ActiveComponent onViewChange={handleViewChange} />
      </main>

      <BottomNav
        activeView={activeView}
        onViewChange={handleViewChange}
        onFabPress={() => setFabOpen(true)}
        onMorePress={() => setMoreOpen(true)}
      />

      <BottomSheet isOpen={moreOpen} onClose={() => setMoreOpen(false)} title="More">
        {moreItems.map(({ id, label, icon: Icon }) => (
          <button type="button" key={id} className="sheet-nav-item" onClick={() => handleViewChange(id)}>
            <div className="sheet-nav-icon">
              <Icon size={18} />
            </div>
            <span>{label}</span>
          </button>
        ))}
      </BottomSheet>

      <BottomSheet isOpen={fabOpen} onClose={() => setFabOpen(false)} title="Quick Log">
        {fabItems.map(({ id, label, icon: Icon }) => (
          <button type="button" key={id} className="sheet-nav-item" onClick={() => handleViewChange(id)}>
            <div className="sheet-nav-icon">
              <Icon size={18} />
            </div>
            <span>{label}</span>
          </button>
        ))}
      </BottomSheet>
    </div>
  );
}
