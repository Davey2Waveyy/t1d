import { useState, useCallback } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import Overview from '../components/dashboard/Overview';
import MealLog from '../components/dashboard/MealLog';
import InsulinLog from '../components/dashboard/InsulinLog';
import GlucoseTrends from '../components/dashboard/GlucoseTrends';
import ICRPredictor from '../components/dashboard/ICRPredictor';
import DexcomImport from '../components/dashboard/DexcomImport';
import A1CEstimator from '../components/dashboard/A1CEstimator';
import CorrectionFactor from '../components/dashboard/CorrectionFactor';
import PatternAlerts from '../components/dashboard/PatternAlerts';
import Settings from '../components/dashboard/Settings';
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
  settings: Settings,
};

export default function Dashboard() {
  const [activeView, setActiveView] = useState('overview');
  const [mobileMenu, setMobileMenu] = useState(false);

  const handleViewChange = useCallback((v) => {
    setActiveView(v);
    setMobileMenu(false);
  }, []);

  const ActiveComponent = viewComponents[activeView] || Overview;

  return (
    <div className="dashboard">
      <Sidebar activeView={activeView} onViewChange={handleViewChange} />
      
      <main className="dashboard-main">
        <div className="dashboard-mobile-header">
          <button className="btn btn-icon" onClick={() => setMobileMenu(!mobileMenu)}>
            <Menu size={20} />
          </button>
          <span className="dashboard-mobile-title">Betatrace</span>
        </div>
        <div className="dashboard-content">
          <ActiveComponent key={activeView} onViewChange={handleViewChange} />
        </div>
      </main>
    </div>
  );
}
