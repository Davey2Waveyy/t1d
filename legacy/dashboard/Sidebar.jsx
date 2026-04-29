import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, LayoutDashboard, Utensils, Syringe, TrendingUp,
  Brain, Target, Gauge, AlertTriangle, Settings,
  ChevronLeft, ChevronRight, LogOut, User
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'meals', label: 'Meal Log', icon: Utensils },
  { id: 'insulin', label: 'Insulin Log', icon: Syringe },
  { id: 'glucose', label: 'Glucose Trends', icon: TrendingUp },
  { id: 'icr', label: 'ICR Predictor', icon: Brain },
  { id: 'a1c', label: 'A1C Estimator', icon: Target },
  { id: 'correction', label: 'Correction Factor', icon: Gauge },
  { id: 'patterns', label: 'Pattern Alerts', icon: AlertTriangle },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeView, onViewChange }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = profile?.avatar_url;

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar-header">
        <a href="/" className="sidebar-logo" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
          <Activity size={22} className="sidebar-logo-icon" />
          {!collapsed && <span className="sidebar-logo-text">Betatrace</span>}
        </a>
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${activeView === item.id ? 'sidebar-item--active' : ''}`}
            onClick={() => onViewChange(item.id)}
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={18} className="sidebar-item-icon" />
            {!collapsed && <span className="sidebar-item-label">{item.label}</span>}
            {activeView === item.id && <div className="sidebar-item-indicator" />}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        {!collapsed && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} />
              ) : (
                <User size={16} />
              )}
            </div>
            <span className="sidebar-user-name">{displayName}</span>
          </div>
        )}
        <button className="sidebar-item sidebar-logout" onClick={handleSignOut} title={collapsed ? 'Sign Out' : undefined}>
          <LogOut size={18} className="sidebar-item-icon" />
          {!collapsed && <span className="sidebar-item-label">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
