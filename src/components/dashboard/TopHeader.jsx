import { Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './TopHeader.css';

const pageTitles = {
  overview: 'Home',
  meals: 'Meals',
  insulin: 'Insulin',
  glucose: 'Glucose',
  icr: 'ICR Predictor',
  dexcom: 'Dexcom',
  a1c: 'A1C',
  correction: 'Correction',
  patterns: 'Patterns',
  settings: 'Settings',
};

export default function TopHeader({ activeView, onSettingsOpen }) {
  const { user, profile } = useAuth();
  const avatarUrl = profile?.avatar_url;
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'U';
  const initial = displayName[0].toUpperCase();

  return (
    <header className="top-header">
      <button className="top-header-avatar" onClick={onSettingsOpen} aria-label="Profile">
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} />
        ) : (
          <span className="top-header-initial">{initial}</span>
        )}
      </button>

      <span className="top-header-title">{pageTitles[activeView] || 'Betatrace'}</span>

      <button className="top-header-bell" aria-label="Notifications">
        <Bell size={20} />
      </button>
    </header>
  );
}
