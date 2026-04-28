# Mobile/Desktop Layout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace sidebar navigation with a mobile-first bottom tab bar, add a phone frame presentation on desktop, and add a phone mockup to the landing page hero.

**Architecture:** Dashboard always renders the mobile layout (TopHeader + scrollable content + BottomNav). On desktop (≥769px), a `PhoneFrame` wrapper adds the iPhone bezel and dark gradient background. On mobile/PWA, the frame is invisible and the app fills the screen natively.

**Tech Stack:** React 19, CSS custom properties (no new libraries needed), existing Lucide icons, Framer Motion (already installed)

---

## Context

- Design system lives in `src/index.css` — use CSS custom properties (`--accent-teal`, `--bg-dashboard`, etc.) everywhere
- No test framework in this project — verification is visual in browser at `http://localhost:5173`
- Sidebar (`src/components/dashboard/Sidebar.jsx`) is being replaced on all viewports — keep the file but stop rendering it in Dashboard
- `src/pages/Dashboard.jsx` is the entry point for all dashboard views

---

## Task 1: Create TopHeader Component

**Files:**
- Create: `src/components/dashboard/TopHeader.jsx`
- Create: `src/components/dashboard/TopHeader.css`

**Step 1: Create TopHeader.jsx**

```jsx
import { Bell, User } from 'lucide-react';
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
```

**Step 2: Create TopHeader.css**

```css
.top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-md);
  height: 60px;
  background: var(--bg-dashboard);
  border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;
}

.top-header-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 1.5px solid var(--border-medium);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: var(--text-muted);
  transition: border-color var(--transition-fast);
}

.top-header-avatar:hover {
  border-color: var(--accent-teal);
}

.top-header-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.top-header-initial {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--accent-teal);
}

.top-header-title {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-light);
}

.top-header-bell {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  border-radius: var(--radius-md);
  transition: color var(--transition-fast);
}

.top-header-bell:hover {
  color: var(--text-light);
}
```

**Step 3: Verify in browser**

The component will be wired up in Task 4. Skip browser check here.

**Step 4: Commit**

```bash
git add src/components/dashboard/TopHeader.jsx src/components/dashboard/TopHeader.css
git commit -m "feat: add TopHeader mobile component"
```

---

## Task 2: Create BottomNav Component

**Files:**
- Create: `src/components/dashboard/BottomNav.jsx`
- Create: `src/components/dashboard/BottomNav.css`

**Step 1: Create BottomNav.jsx**

```jsx
import { LayoutDashboard, TrendingUp, Utensils, MoreHorizontal, Plus } from 'lucide-react';
import './BottomNav.css';

const primaryTabs = [
  { id: 'overview', label: 'Home', icon: LayoutDashboard },
  { id: 'glucose', label: 'Glucose', icon: TrendingUp },
  { id: 'meals', label: 'Meals', icon: Utensils },
];

export default function BottomNav({ activeView, onViewChange, onFabPress, onMorePress }) {
  const isMoreActive = !['overview', 'glucose', 'meals'].includes(activeView);

  return (
    <nav className="bottom-nav">
      {/* Home */}
      <button
        className={`bottom-nav-tab ${activeView === 'overview' ? 'bottom-nav-tab--active' : ''}`}
        onClick={() => onViewChange('overview')}
      >
        <LayoutDashboard size={22} />
        <span>Home</span>
      </button>

      {/* Glucose */}
      <button
        className={`bottom-nav-tab ${activeView === 'glucose' ? 'bottom-nav-tab--active' : ''}`}
        onClick={() => onViewChange('glucose')}
      >
        <TrendingUp size={22} />
        <span>Glucose</span>
      </button>

      {/* FAB */}
      <button className="bottom-nav-fab" onClick={onFabPress} aria-label="Log">
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {/* Meals */}
      <button
        className={`bottom-nav-tab ${activeView === 'meals' ? 'bottom-nav-tab--active' : ''}`}
        onClick={() => onViewChange('meals')}
      >
        <Utensils size={22} />
        <span>Meals</span>
      </button>

      {/* More */}
      <button
        className={`bottom-nav-tab ${isMoreActive ? 'bottom-nav-tab--active' : ''}`}
        onClick={onMorePress}
      >
        <MoreHorizontal size={22} />
        <span>More</span>
      </button>
    </nav>
  );
}
```

**Step 2: Create BottomNav.css**

```css
.bottom-nav {
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 72px;
  background: var(--bg-dark);
  border-top: 1px solid var(--border-light);
  padding: 0 var(--space-sm);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  flex-shrink: 0;
  position: relative;
}

.bottom-nav-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--space-sm);
  color: var(--text-muted);
  transition: color var(--transition-fast);
  flex: 1;
  min-width: 0;
}

.bottom-nav-tab span {
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.bottom-nav-tab--active {
  color: var(--accent-teal);
}

.bottom-nav-fab {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--accent-teal);
  color: var(--bg-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -24px;
  box-shadow: 0 4px 20px rgba(45, 212, 168, 0.4);
  transition: all var(--transition-base);
  flex-shrink: 0;
}

.bottom-nav-fab:hover {
  background: #5AE6C5;
  transform: scale(1.05);
  box-shadow: 0 6px 24px rgba(45, 212, 168, 0.5);
}

.bottom-nav-fab:active {
  transform: scale(0.97);
}
```

**Step 3: Commit**

```bash
git add src/components/dashboard/BottomNav.jsx src/components/dashboard/BottomNav.css
git commit -m "feat: add BottomNav mobile tab bar component"
```

---

## Task 3: Create BottomSheet Component

Used for both the MORE nav sheet and the FAB quick-log sheet.

**Files:**
- Create: `src/components/dashboard/BottomSheet.jsx`
- Create: `src/components/dashboard/BottomSheet.css`

**Step 1: Create BottomSheet.jsx**

```jsx
import { useEffect } from 'react';
import './BottomSheet.css';

export default function BottomSheet({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet">
        <div className="sheet-handle" />
        {title && <h3 className="sheet-title">{title}</h3>}
        <div className="sheet-content">{children}</div>
      </div>
    </>
  );
}
```

**Step 2: Create BottomSheet.css**

```css
.sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: calc(var(--z-modal) - 1);
  animation: fadeIn 0.2s ease;
}

.sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-dark);
  border-top: 1px solid var(--border-medium);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  z-index: var(--z-modal);
  padding: var(--space-md) var(--space-lg) calc(var(--space-xl) + env(safe-area-inset-bottom, 0px));
  animation: slideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1);
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.sheet-handle {
  width: 36px;
  height: 4px;
  background: var(--border-strong);
  border-radius: var(--radius-full);
  margin: 0 auto var(--space-md);
}

.sheet-title {
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: var(--space-md);
}

.sheet-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
```

**Step 3: Commit**

```bash
git add src/components/dashboard/BottomSheet.jsx src/components/dashboard/BottomSheet.css
git commit -m "feat: add BottomSheet component for MORE and FAB sheets"
```

---

## Task 4: Refactor Dashboard.jsx

Replace the sidebar + hamburger layout with TopHeader + scrollable content + BottomNav. Add the MORE sheet and FAB quick-log sheet.

**Files:**
- Modify: `src/pages/Dashboard.jsx`
- Modify: `src/pages/Dashboard.css`

**Step 1: Rewrite Dashboard.jsx**

```jsx
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

      {/* MORE sheet */}
      <BottomSheet isOpen={moreOpen} onClose={() => setMoreOpen(false)} title="More">
        {moreItems.map(({ id, label, icon: Icon }) => (
          <button key={id} className="sheet-nav-item" onClick={() => handleViewChange(id)}>
            <div className="sheet-nav-icon">
              <Icon size={18} />
            </div>
            <span>{label}</span>
          </button>
        ))}
      </BottomSheet>

      {/* FAB quick-log sheet */}
      <BottomSheet isOpen={fabOpen} onClose={() => setFabOpen(false)} title="Quick Log">
        {fabItems.map(({ id, label, icon: Icon }) => (
          <button key={id} className="sheet-nav-item" onClick={() => handleViewChange(id)}>
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
```

**Step 2: Rewrite Dashboard.css**

```css
.dashboard-app {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  background: var(--bg-dashboard);
  overflow: hidden;
}

.dashboard-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  padding: var(--space-md);
  min-height: 0;
}

/* Sheet nav items (used in MORE and FAB sheets) */
.sheet-nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  width: 100%;
  padding: var(--space-md) var(--space-sm);
  color: var(--text-light);
  font-size: 0.95rem;
  font-weight: 450;
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
  text-align: left;
}

.sheet-nav-item:hover {
  background: var(--bg-card);
}

.sheet-nav-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-teal);
  flex-shrink: 0;
}

/* Desktop: inside phone frame, height fills the frame */
@media (min-width: 769px) {
  .dashboard-app {
    height: 100%;
  }
}
```

**Step 3: Verify in browser**

1. Open `http://localhost:5173` and sign in
2. Should see: top header (avatar, "HOME", bell), scrollable content, bottom nav (Home | Glucose | FAB | Meals | More)
3. Tap/click MORE → bottom sheet slides up with 7 items
4. Tap any item → navigates to that view, sheet closes
5. Tap FAB (+) → quick-log sheet with 3 options
6. Header title updates as you switch views

**Step 4: Commit**

```bash
git add src/pages/Dashboard.jsx src/pages/Dashboard.css
git commit -m "feat: refactor Dashboard to mobile-first layout with BottomNav and BottomSheet"
```

---

## Task 5: Create PhoneFrame Component

Wraps Dashboard on desktop with an iPhone-style bezel on a dark gradient background. On mobile it renders transparently.

**Files:**
- Create: `src/components/layout/PhoneFrame.jsx`
- Create: `src/components/layout/PhoneFrame.css`

**Step 1: Create PhoneFrame.jsx**

```jsx
import './PhoneFrame.css';

export default function PhoneFrame({ children }) {
  return (
    <div className="frame-outer">
      <div className="frame-bezel">
        <div className="frame-notch" />
        <div className="frame-screen">
          {children}
        </div>
        <div className="frame-home-bar" />
      </div>
    </div>
  );
}
```

**Step 2: Create PhoneFrame.css**

```css
/* Mobile: fully transparent — children render as normal */
.frame-outer,
.frame-bezel,
.frame-notch,
.frame-screen,
.frame-home-bar {
  display: contents;
}

/* Desktop: apply phone frame presentation */
@media (min-width: 769px) {
  .frame-outer {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background:
      radial-gradient(ellipse at 50% 65%, rgba(45, 212, 168, 0.07) 0%, transparent 55%),
      radial-gradient(ellipse at 50% 50%, #0D1B16 0%, #060D0A 100%);
    padding: var(--space-xl);
  }

  .frame-bezel {
    display: flex;
    flex-direction: column;
    width: 390px;
    height: 844px;
    background: var(--bg-dashboard);
    border-radius: 48px;
    border: 9px solid #1C1C1E;
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.07),
      0 50px 120px rgba(0, 0, 0, 0.7),
      0 0 0 1px rgba(0, 0, 0, 0.5),
      0 0 80px rgba(45, 212, 168, 0.06);
    overflow: hidden;
    position: relative;
    /* Scale down if viewport is short */
    transform-origin: center center;
  }

  .frame-notch {
    display: block;
    width: 120px;
    height: 28px;
    background: #1C1C1E;
    border-radius: 0 0 18px 18px;
    margin: 0 auto;
    flex-shrink: 0;
    z-index: 10;
  }

  .frame-screen {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
  }

  .frame-home-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 28px;
    flex-shrink: 0;
  }

  .frame-home-bar::after {
    content: '';
    width: 130px;
    height: 5px;
    background: rgba(255, 255, 255, 0.25);
    border-radius: var(--radius-full);
  }
}

/* Scale frame on short viewports */
@media (min-width: 769px) and (max-height: 920px) {
  .frame-bezel {
    transform: scale(0.88);
  }
}

@media (min-width: 769px) and (max-height: 800px) {
  .frame-bezel {
    transform: scale(0.78);
  }
}
```

**Step 3: Commit**

```bash
git add src/components/layout/PhoneFrame.jsx src/components/layout/PhoneFrame.css
git commit -m "feat: add PhoneFrame desktop presentation wrapper"
```

---

## Task 6: Wire PhoneFrame into App.jsx

**Files:**
- Modify: `src/App.jsx`

**Step 1: Update App.jsx to wrap Dashboard in PhoneFrame**

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import PhoneFrame from './components/layout/PhoneFrame';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <PhoneFrame>
              <Dashboard />
            </PhoneFrame>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
```

**Step 2: Verify mobile in browser**

Resize browser to mobile width (375px). Should see:
- Full-screen app, no bezel, no background, just the app

**Step 3: Verify desktop in browser**

Resize browser to desktop width (1280px). Should see:
- Dark gradient background fills viewport
- iPhone frame centered with subtle teal glow behind it
- App renders inside the frame, scrolls within it
- Home indicator bar at bottom of frame

**Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat: wrap Dashboard in PhoneFrame for desktop presentation"
```

---

## Task 7: Add Phone Mockup to Landing Hero

Show a preview of the app inside a phone frame in the hero section — right side on desktop, hidden on mobile.

**Files:**
- Modify: `src/components/landing/Hero.jsx`
- Modify: `src/components/landing/Hero.css`
- Source image: `src/assets/hero.png` (existing — use as app screenshot)

**Step 1: Update Hero.jsx to add two-column layout with phone mockup**

Replace the `hero-content` div with a two-column layout. Keep all existing copy/stats intact, add phone mockup to the right.

```jsx
// In Hero.jsx, replace the <div className="hero-content container"> block with:
<div className="hero-content container">
  <div className="hero-copy">
    <div className="hero-badge animate-fade-in-up">
      <Activity size={14} />
      <span>Intelligent T1D Management</span>
    </div>
    
    <h1 className="hero-title animate-fade-in-up stagger-1">
      Take control of<br />
      <span className="hero-title-accent">your Type 1.</span>
    </h1>
    
    <p className="hero-subtitle animate-fade-in-up stagger-2">
      Betatrace uses your meal and insulin data to build predictive models,
      optimize your insulin-to-carb ratio, and surface patterns you'd never spot alone.
    </p>

    <div className="hero-actions animate-fade-in-up stagger-3">
      <button className="btn btn-primary btn-lg" onClick={onGetStarted}>
        Get Started
        <ArrowRight size={18} />
      </button>
      <button className="btn btn-secondary btn-lg" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
        See Features
      </button>
    </div>

    <div className="hero-stats animate-fade-in-up stagger-4">
      <div className="hero-stat">
        <span className="hero-stat-value">72%</span>
        <span className="hero-stat-label">Avg Time in Range</span>
      </div>
      <div className="hero-stat-divider" />
      <div className="hero-stat">
        <span className="hero-stat-value">6.4</span>
        <span className="hero-stat-label">Est. A1C</span>
      </div>
      <div className="hero-stat-divider" />
      <div className="hero-stat">
        <span className="hero-stat-value">1:10</span>
        <span className="hero-stat-label">Predicted ICR</span>
      </div>
    </div>
  </div>

  {/* Phone mockup — desktop only */}
  <div className="hero-mockup animate-fade-in-up stagger-3">
    <div className="hero-phone">
      <div className="hero-phone-notch" />
      <div className="hero-phone-screen">
        <img src={heroImg} alt="Betatrace app screenshot" />
      </div>
      <div className="hero-phone-home" />
    </div>
  </div>
</div>
```

Also update the imports at the top of Hero.jsx:
```jsx
import heroImg from '../../assets/hero.png';
```

**Step 2: Update Hero.css — add two-column layout and phone mockup styles**

Add these rules to the existing Hero.css (do not remove existing styles):

```css
/* Two-column hero layout */
.hero-content {
  display: flex;
  align-items: center;
  gap: var(--space-4xl);
  max-width: 1200px;
}

.hero-copy {
  flex: 1;
  min-width: 0;
  max-width: 580px;
}

/* Phone mockup */
.hero-mockup {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-phone {
  width: 260px;
  height: 560px;
  background: var(--bg-dashboard);
  border-radius: 36px;
  border: 7px solid #1C1C1E;
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,0.06),
    0 40px 80px rgba(0,0,0,0.5),
    0 0 60px rgba(45, 212, 168, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: float 6s ease-in-out infinite;
}

.hero-phone-notch {
  width: 80px;
  height: 20px;
  background: #1C1C1E;
  border-radius: 0 0 12px 12px;
  margin: 0 auto;
  flex-shrink: 0;
}

.hero-phone-screen {
  flex: 1;
  overflow: hidden;
}

.hero-phone-screen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
}

.hero-phone-home {
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hero-phone-home::after {
  content: '';
  width: 80px;
  height: 4px;
  background: rgba(255,255,255,0.2);
  border-radius: var(--radius-full);
}

/* Hide mockup on mobile — copy takes full width */
@media (max-width: 900px) {
  .hero-content {
    flex-direction: column;
    gap: var(--space-2xl);
    max-width: 800px;
  }

  .hero-copy {
    max-width: 100%;
  }

  .hero-mockup {
    display: none;
  }
}
```

**Step 3: Verify in browser**

1. Visit `http://localhost:5173`
2. On desktop (wide): hero should show copy left + phone mockup right, phone has a floating animation
3. On mobile width (<900px): mockup is hidden, copy takes full width

**Step 4: Commit**

```bash
git add src/components/landing/Hero.jsx src/components/landing/Hero.css
git commit -m "feat: add phone mockup to landing hero section"
```

---

## Done

All tasks complete. The app now has:
- Mobile: bottom tab bar, top header, scrollable content, MORE and FAB sheets
- Desktop: dark gradient background, iPhone frame centered, app scrolls inside frame
- Landing: phone mockup in hero on desktop, hidden on mobile

Final check: visit `http://localhost:5173`, test on both mobile and desktop viewport widths, test auth flow, and verify all nav items work from both BottomNav and the MORE sheet.
