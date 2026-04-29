import { LayoutDashboard, TrendingUp, Utensils, MoreHorizontal, Plus } from 'lucide-react';
import './BottomNav.css';

export default function BottomNav({ activeView, onViewChange, onFabPress, onMorePress }) {
  const isMoreActive = !['overview', 'glucose', 'meals'].includes(activeView);

  return (
    <nav className="bottom-nav">
      <button
        type="button"
        className={`bottom-nav-tab ${activeView === 'overview' ? 'bottom-nav-tab--active' : ''}`}
        onClick={() => onViewChange('overview')}
      >
        <LayoutDashboard size={22} />
        <span>Home</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-tab ${activeView === 'glucose' ? 'bottom-nav-tab--active' : ''}`}
        onClick={() => onViewChange('glucose')}
      >
        <TrendingUp size={22} />
        <span>Glucose</span>
      </button>

      <button type="button" className="bottom-nav-fab" onClick={onFabPress} aria-label="Quick log">
        <Plus size={26} strokeWidth={2.5} />
      </button>

      <button
        type="button"
        className={`bottom-nav-tab ${activeView === 'meals' ? 'bottom-nav-tab--active' : ''}`}
        onClick={() => onViewChange('meals')}
      >
        <Utensils size={22} />
        <span>Meals</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-tab ${isMoreActive ? 'bottom-nav-tab--active' : ''}`}
        onClick={onMorePress}
      >
        <MoreHorizontal size={22} />
        <span>More</span>
      </button>
    </nav>
  );
}
