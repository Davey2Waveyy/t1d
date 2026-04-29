# Betatrace PWA — Design Specification

**Version**: 1.0  
**Date**: April 2026  
**Scope**: Full PWA implementation with redesigned mobile-first UI  
**Audience**: Implementation reference for AI agents and developers

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [PWA Technical Requirements](#2-pwa-technical-requirements)
3. [Navigation Architecture](#3-navigation-architecture)
4. [Color System](#4-color-system)
5. [Typography](#5-typography)
6. [Spacing & Layout](#6-spacing--layout)
7. [Component Library](#7-component-library)
8. [Screen Designs](#8-screen-designs)
9. [Motion & Animation](#9-motion--animation)
10. [Offline & Loading States](#10-offline--loading-states)
11. [Implementation Roadmap](#11-implementation-roadmap)

---

## 1. Design Philosophy

### The Problem with "Vibecodey"

The current app feels like a collection of features assembled without a unifying opinion. The symptoms:

- Sidebar navigation designed for desktop, awkwardly adapted for mobile
- Playfair Display serif headings in a real-time data app (decorative, not functional)
- Inconsistent card padding, varying border radii, mixed spacing values
- No clear visual hierarchy — everything competes for attention
- The mobile experience is a shrunken desktop layout, not a mobile app

### The Target: Precision Utility

Betatrace manages a serious health condition. The UI should reflect that. Think:

- **Apple Health + Linear** — data-forward, systematic, nothing wasted
- **Dexcom Clarity** — clean glucose charts, clinical confidence, calm color use
- **Things 3** — intentional whitespace, typography that works, native-feeling interactions

The goal is an app that a person trusts with their insulin dosing. It should feel **precise, calm, and reliable** — not flashy.

### Core Principles

1. **Numbers are the hero.** Glucose values, carb counts, insulin units — these are the content. Typography and layout exist to serve them.
2. **One action per screen.** Each view has a primary job. Don't make the user hunt.
3. **Thumb-reachable on mobile.** All primary actions live in the bottom 60% of the screen on mobile.
4. **Dark by default.** The app is used in low-light (early morning checks, overnight). Dark first.
5. **Earn complexity.** Start simple. Only show advanced data when the user has enough context to use it.
6. **No decorative motion.** Animation confirms actions and communicates state — it doesn't entertain.

---

## 2. PWA Technical Requirements

### 2.1 Web App Manifest

Create `/public/manifest.json`:

```json
{
  "name": "Betatrace",
  "short_name": "Betatrace",
  "description": "Type 1 diabetes management — glucose, meals, insulin.",
  "start_url": "/dashboard",
  "display": "standalone",
  "display_override": ["standalone", "minimal-ui"],
  "background_color": "#0D1B16",
  "theme_color": "#0D1B16",
  "orientation": "portrait-primary",
  "categories": ["health", "medical", "lifestyle"],
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" },
    { "src": "/icons/icon-apple-180.png", "sizes": "180x180", "type": "image/png" }
  ],
  "screenshots": [
    { "src": "/screenshots/dashboard-mobile.png", "sizes": "390x844", "type": "image/png", "form_factor": "narrow" }
  ],
  "shortcuts": [
    { "name": "Log Glucose", "url": "/dashboard/glucose/log", "icons": [{ "src": "/icons/shortcut-glucose.png", "sizes": "96x96" }] },
    { "name": "Log Meal", "url": "/dashboard/meals/log", "icons": [{ "src": "/icons/shortcut-meal.png", "sizes": "96x96" }] },
    { "name": "Log Insulin", "url": "/dashboard/insulin/log", "icons": [{ "src": "/icons/shortcut-insulin.png", "sizes": "96x96" }] }
  ]
}
```

**Key decisions:**

- `start_url: "/dashboard"` — authenticated users land at the app, not marketing
- `display: "standalone"` — removes browser chrome on iOS/Android
- `orientation: "portrait-primary"` — health tracking is a portrait-mode activity
- Shortcuts appear on long-press of the home screen icon (Android) and are useful for quick logging

### 2.2 Vite PWA Plugin

Install `vite-plugin-pwa` and configure in `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',         // Ask user before updating, not auto
      injectRegister: 'auto',
      strategies: 'generateSW',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // Supabase API — network first, fall back to cache
            urlPattern: /^https:\/\/xteeeszbfvwjulpjudzo\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 }, // 24h
              networkTimeoutSeconds: 5,
            },
          },
          {
            // Google Fonts — stale while revalidate
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      manifest: false, // Use our own /public/manifest.json
      devOptions: { enabled: true },
    }),
  ],
})
```

**Why `registerType: 'prompt'`**: Auto-updating a medical app mid-session is risky. Show an "Update available" banner and let the user choose.

### 2.3 iOS-Specific Head Tags

Add to `index.html` `<head>`:

```html
<!-- PWA -->
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#0D1B16" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Betatrace" />
<link rel="apple-touch-icon" href="/icons/icon-apple-180.png" />

<!-- Viewport: prevent zoom on input focus (critical for forms on iOS) -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
```

**Note on `black-translucent`**: This makes the iOS status bar overlay the app content (no white bar), giving a true full-bleed look. Account for this with `env(safe-area-inset-top)` in CSS.

### 2.4 Safe Area Handling

In `index.css`, ensure the app respects notches and home indicators:

```css
:root {
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left: env(safe-area-inset-left, 0px);
  --safe-right: env(safe-area-inset-right, 0px);
}

/* App shell must respect these */
.app-shell {
  padding-top: var(--safe-top);
}

.bottom-nav {
  padding-bottom: calc(var(--safe-bottom) + 8px);
}
```

### 2.5 Update Notification Component

```jsx
// src/components/pwa/UpdatePrompt.jsx
function UpdatePrompt({ onUpdate, onDismiss }) {
  return (
    <div className="update-prompt" role="alert">
      <span>Update available</span>
      <button onClick={onUpdate} className="btn btn-primary btn-sm">Reload</button>
      <button onClick={onDismiss} className="btn btn-ghost btn-sm">Later</button>
    </div>
  )
}
```

Position this as a **non-blocking toast at the top**, not a modal. The user may be mid-logging.

### 2.6 Install Prompt

Create `src/hooks/useInstallPrompt.js`:

```javascript
export function useInstallPrompt() {
  const [prompt, setPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setIsInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setIsInstalled(true)
    setPrompt(null)
  }

  return { canInstall: !!prompt && !isInstalled, install, isInstalled }
}
```

Surface the install prompt **in Settings**, not as a pop-up on first visit. Users who want to install the app will look in settings.

---

## 3. Navigation Architecture

### 3.1 The Problem with the Current Sidebar

The current sidebar is a desktop pattern. On mobile it becomes a slide-over drawer triggered by a hamburger icon — adding friction to every navigation action. In an app you might open 10+ times per day, every tap counts.

### 3.2 URL-Based Routing (Required for PWA)

Currently, dashboard views are controlled by `useState('overview')`. This means:

- The back button doesn't work
- You can't deep link to `/dashboard/meals`
- Web shortcuts in the manifest don't land on the right screen
- Sharing a specific view is impossible

**Replace view state with actual routes:**

```
/                         → Landing (unauthenticated only)
/dashboard                → Redirect to /dashboard/overview
/dashboard/overview       → Overview
/dashboard/glucose        → Glucose Trends
/dashboard/glucose/log    → Log Reading (modal or slide-up)
/dashboard/meals          → Meal Log
/dashboard/meals/log      → Log Meal
/dashboard/insulin        → Insulin Log
/dashboard/insulin/log    → Log Dose
/dashboard/analytics      → ICR, A1C, Correction, Patterns (tabbed)
/dashboard/settings       → Settings
```

### 3.3 Bottom Tab Bar (Mobile)

Replace the sidebar with a bottom tab bar on mobile (`< 768px`). Keep sidebar for desktop (`≥ 768px`).

**Tab structure — 5 tabs max:**


| Tab     | Icon                      | Route                                             |
| ------- | ------------------------- | ------------------------------------------------- |
| Home    | `LayoutDashboard`         | `/dashboard/overview`                             |
| Glucose | `TrendingUp`              | `/dashboard/glucose`                              |
| Log     | `Plus` (center, elevated) | Context-aware quick log                           |
| Meals   | `Utensils`                | `/dashboard/meals`                                |
| More    | `Menu`                    | Slide-up sheet with: Insulin, Analytics, Settings |


**The center "Log" button** is the most important element in the app. It's elevated, uses the primary accent, and opens a quick-action sheet:

```
┌─────────────────────────────────────┐
│  Log what?                          │
│                                     │
│  🩸 Glucose reading                 │
│  🍽  Meal / carbs                   │
│  💉 Insulin dose                    │
│                                     │
│  [Cancel]                           │
└─────────────────────────────────────┘
```

This sheet animates up from the bottom (drawer pattern), settles with a spring, and dismisses with a swipe down or tap outside.

### 3.4 Bottom Tab Bar Anatomy

```
┌────────────────────────────────────────────────┐
│                   content area                 │
│                                                │
│                                                │
├────────────────────────────────────────────────┤
│  [Home]  [Glucose]  [  ●  ]  [Meals]  [More]  │
│                      LOG                       │
│         ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔                │
└────────────────────────────────────────────────┘
         ← safe-area-inset-bottom applied →
```

**CSS:**

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 56px;
  padding-bottom: var(--safe-bottom);
  background: var(--bg-card);
  border-top: 1px solid var(--border-light);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.bottom-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 8px 0;
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  border: none;
  background: none;
  cursor: pointer;
  transition: color 150ms var(--ease-out);
}

.bottom-nav-item--active {
  color: var(--accent-teal);
}

.bottom-nav-log {
  flex: 0 0 56px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--accent-teal);
  color: #0D1B16;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -20px; /* Elevation above bar */
  box-shadow: 0 4px 16px rgba(45, 212, 168, 0.4);
  cursor: pointer;
  transition: transform 100ms var(--ease-out), box-shadow 100ms var(--ease-out);
}

.bottom-nav-log:active {
  transform: scale(0.92);
  box-shadow: 0 2px 8px rgba(45, 212, 168, 0.3);
}
```

### 3.5 Desktop Sidebar (≥ 768px)

The sidebar stays for desktop but gets cleaned up:

- Remove the collapse toggle — either always expanded or always collapsed based on viewport
- Sidebar width: `220px` (currently feels right)
- Remove the decorative gradient effects, keep it flat and structured
- Group nav items into logical sections with subtle labels:

```
OVERVIEW
  ○ Dashboard

TRACKING
  ○ Glucose
  ○ Meals
  ○ Insulin

ANALYTICS
  ○ ICR Predictor
  ○ A1C Estimator
  ○ Correction Factor
  ○ Pattern Alerts

──────────
  ○ Settings
  [avatar] David
```

---

## 4. Color System

### 4.1 Current System Assessment

The existing color tokens are good foundations. The issues:

- Too many accent colors (7 accents + dim variants = visual noise)
- Light mode tokens exist but the app is built dark-first — this causes drift
- `--bg-primary` and `--bg-secondary` are light-mode values living in the same `:root` as dark dashboard values

### 4.2 Revised Token Structure

```css
:root {
  /* === SURFACE === */
  --surface-base: #0D1B16;      /* App background */
  --surface-raised: #132B23;    /* Cards, panels */
  --surface-overlay: #1A3D32;   /* Hover states, nested cards */
  --surface-input: #0A1410;     /* Input fields */
  --surface-glass: rgba(19, 43, 35, 0.8);

  /* === BORDER === */
  --border-subtle: rgba(45, 212, 168, 0.08);   /* Card edges */
  --border-default: rgba(45, 212, 168, 0.15);  /* Focused inputs, dividers */
  --border-strong: rgba(45, 212, 168, 0.30);   /* Active states */

  /* === TEXT === */
  --text-primary: #E8F5F0;      /* Headlines, values */
  --text-secondary: #8BA89F;    /* Labels, supporting text */
  --text-muted: #4A6B60;        /* Placeholders, timestamps */
  --text-inverse: #0D1B16;      /* Text on accent backgrounds */

  /* === PRIMARY ACCENT (Teal) === */
  --teal-500: #2DD4A8;          /* Primary actions, active states */
  --teal-400: #5DDFBA;          /* Hover on primary */
  --teal-300: #8DEACB;          /* Disabled/dim */
  --teal-900: rgba(45, 212, 168, 0.12); /* Tinted backgrounds */

  /* === SEMANTIC (keep these, remove the rest) === */
  --glucose-low: #FB7185;       /* Rose — hypoglycemia */
  --glucose-low-bg: rgba(251, 113, 133, 0.12);
  --glucose-normal: #2DD4A8;    /* Teal — in range */
  --glucose-normal-bg: rgba(45, 212, 168, 0.12);
  --glucose-high: #FBBF24;      /* Amber — hyperglycemia */
  --glucose-high-bg: rgba(251, 191, 36, 0.12);

  /* === CHART LINES (distinct, readable on dark) === */
  --chart-glucose: #2DD4A8;
  --chart-insulin: #A78BFA;
  --chart-carbs: #38BDF8;
  --chart-target-zone: rgba(45, 212, 168, 0.08);

  /* === FEEDBACK === */
  --success: #10B981;
  --success-bg: rgba(16, 185, 129, 0.12);
  --warning: #FBBF24;
  --warning-bg: rgba(251, 191, 36, 0.12);
  --error: #FB7185;
  --error-bg: rgba(251, 113, 133, 0.12);

  /* === SHADOW === */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.4);
  --shadow-teal: 0 4px 20px rgba(45, 212, 168, 0.25);
}
```

**What was removed:** `--accent-emerald`, `--accent-sky`, `--accent-violet`, `--accent-fuchsia` and their dim variants. These were available but never used consistently. Fewer accents = more intentional use.

### 4.3 Color Usage Rules


| Use case           | Token                                                      |
| ------------------ | ---------------------------------------------------------- |
| App background     | `--surface-base`                                           |
| Cards, sheets      | `--surface-raised`                                         |
| Hover on card      | `--surface-overlay`                                        |
| Primary button     | `--teal-500` bg, `--text-inverse` text                     |
| Secondary button   | `--surface-overlay` bg, `--text-primary` text              |
| Ghost button       | transparent bg, `--text-secondary` text                    |
| In-range glucose   | `--glucose-normal` text + `--glucose-normal-bg` background |
| Low glucose alert  | `--glucose-low` text + `--glucose-low-bg` background       |
| High glucose       | `--glucose-high` text + `--glucose-high-bg` background     |
| Active nav item    | `--teal-500` icon + text                                   |
| Chart primary line | `--chart-glucose`                                          |
| Destructive action | `--error`                                                  |


---

## 5. Typography

### 5.1 Drop Playfair Display from the App UI

Playfair Display is a serif display font — appropriate for editorial, not for a real-time health dashboard. It's currently used for headings and some card titles.

**Keep:** Inter (body, UI), JetBrains Mono (numbers, data)  
**Remove from UI:** Playfair Display (keep in Landing/marketing only)

### 5.2 Type Scale

```css
:root {
  /* Scale */
  --text-xs: 0.6875rem;    /* 11px — timestamps, labels */
  --text-sm: 0.8125rem;    /* 13px — secondary UI, captions */
  --text-base: 0.9375rem;  /* 15px — body, descriptions */
  --text-md: 1rem;         /* 16px — card titles, nav */
  --text-lg: 1.125rem;     /* 18px — section headers */
  --text-xl: 1.375rem;     /* 22px — page titles */
  --text-2xl: 1.75rem;     /* 28px — large stats */
  --text-3xl: 2.5rem;      /* 40px — hero glucose value */
  --text-4xl: 3.5rem;      /* 56px — prominent dashboard number */

  /* Weight */
  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;

  /* Leading */
  --leading-tight: 1.2;
  --leading-normal: 1.5;
  --leading-relaxed: 1.7;

  /* Tracking */
  --tracking-tight: -0.02em;   /* Large numbers */
  --tracking-normal: 0;
  --tracking-wide: 0.05em;     /* Uppercase labels */
  --tracking-wider: 0.1em;     /* Tab labels */
}
```

### 5.3 Numeric Data Typography

Glucose values, carb counts, and insulin units are the content. Treat them differently:

```css
/* Big glucose value — the star of the show */
.glucose-value {
  font-family: var(--font-mono);
  font-size: var(--text-4xl);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-tight);
  line-height: 1;
  font-variant-numeric: tabular-nums;  /* Numbers don't shift width */
}

/* Stat card number */
.stat-value {
  font-family: var(--font-mono);
  font-size: var(--text-2xl);
  font-weight: var(--weight-semibold);
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}

/* Inline data (e.g. "12.4 g carbs") */
.data-inline {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
}
```

**Why monospace for numbers:** In a chart legend or table, proportional numbers jump around as values change. Tabular monospace keeps the layout stable.

### 5.4 Label Pattern

Every data point has a value and a label. The label is always uppercase, tracked wide, small:

```css
.data-label {
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
  color: var(--text-muted);
}
```

Example usage:

```
7.8          ← --font-mono, --text-3xl, --text-primary
mmol/L       ← --data-label, --text-muted
```

---

## 6. Spacing & Layout

### 6.1 Spacing Scale

```css
:root {
  --space-1: 0.25rem;   /* 4px  */
  --space-2: 0.5rem;    /* 8px  */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
}
```

Stop using `--space-xs`, `--space-sm`, etc. — the numbered scale is directly mappable to the `4px` base grid, which makes layout decisions explicit.

### 6.2 Card Pattern

Every card follows this structure:

```css
.card {
  background: var(--surface-raised);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);   /* 16px */
  padding: var(--space-5);           /* 20px */
  transition: border-color 150ms var(--ease-out);
}

.card:hover {
  border-color: var(--border-default);
}

/* Card header — always consistent */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.card-title {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  color: var(--text-secondary);
}
```

**Radius rule:** `--radius-lg` (16px) for cards, `--radius-md` (10px) for inputs and buttons, `--radius-sm` (6px) for badges and chips. Never mix.

### 6.3 Mobile Content Area

```css
.page-content {
  padding: var(--space-4);                         /* 16px sides */
  padding-bottom: calc(56px + var(--safe-bottom) + var(--space-4)); /* Clear the nav */
  max-width: 480px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .page-content {
    padding: var(--space-6) var(--space-8);
    max-width: none;
    padding-bottom: var(--space-6);
  }
}
```

### 6.4 Grid System

Use CSS Grid for stat cards, not flexbox. This gives consistent alignment regardless of content length:

```css
/* 2 columns on mobile, 4 on desktop */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

---

## 7. Component Library

### 7.1 Button System

Three variants, two sizes. That's it.

```css
/* Base */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-weight: var(--weight-semibold);
  cursor: pointer;
  transition: all 120ms var(--ease-out);
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
}

/* Sizes */
.btn-sm { height: 32px; padding: 0 var(--space-3); font-size: var(--text-sm); }
.btn-md { height: 44px; padding: 0 var(--space-5); font-size: var(--text-base); } /* 44px = min tap target */
.btn-lg { height: 52px; padding: 0 var(--space-6); font-size: var(--text-md); }

/* Primary */
.btn-primary {
  background: var(--teal-500);
  color: var(--text-inverse);
}
.btn-primary:hover { background: var(--teal-400); }
.btn-primary:active { transform: scale(0.97); }

/* Secondary */
.btn-secondary {
  background: var(--surface-overlay);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
}
.btn-secondary:hover { border-color: var(--border-strong); }

/* Ghost */
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
}
.btn-ghost:hover { background: var(--surface-overlay); color: var(--text-primary); }

/* Destructive */
.btn-destructive {
  background: var(--error-bg);
  color: var(--error);
  border: 1px solid rgba(251, 113, 133, 0.2);
}
```

**Minimum tap target is 44px** — this is iOS HIG and Android Material guidance. Never make buttons shorter on mobile.

### 7.2 Input System

```css
.input {
  width: 100%;
  height: 48px;
  padding: 0 var(--space-4);
  background: var(--surface-input);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  transition: border-color 150ms var(--ease-out);
  -webkit-appearance: none;  /* Remove iOS default styling */
}

.input:focus {
  outline: none;
  border-color: var(--teal-500);
  box-shadow: 0 0 0 3px var(--teal-900);
}

.input::placeholder {
  color: var(--text-muted);
}

/* Numeric inputs — use monospace */
.input[type="number"] {
  font-family: var(--font-mono);
  font-size: var(--text-md);
  font-variant-numeric: tabular-nums;
}
```

**Remove spinners from number inputs:**

```css
.input[type="number"]::-webkit-inner-spin-button,
.input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
```

### 7.3 Stat Card

```jsx
// src/components/ui/StatCard.jsx
function StatCard({ label, value, unit, trend, status }) {
  // status: 'normal' | 'low' | 'high' | 'neutral'
  const statusColors = {
    normal: 'var(--glucose-normal)',
    low: 'var(--glucose-low)',
    high: 'var(--glucose-high)',
    neutral: 'var(--text-primary)',
  }

  return (
    <div className="card stat-card">
      <span className="data-label">{label}</span>
      <div className="stat-card-value">
        <span
          className="stat-value"
          style={{ color: statusColors[status] ?? statusColors.neutral }}
        >
          {value}
        </span>
        {unit && <span className="stat-unit">{unit}</span>}
      </div>
      {trend && <TrendIndicator value={trend} />}
    </div>
  )
}
```

```css
.stat-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.stat-card-value {
  display: flex;
  align-items: baseline;
  gap: var(--space-1);
}

.stat-unit {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-muted);
}
```

### 7.4 Glucose Status Badge

```jsx
function GlucoseBadge({ value, unit = 'mmol/L' }) {
  const status = value < 3.9 ? 'low' : value > 10 ? 'high' : 'normal'
  const labels = { low: 'LOW', normal: 'IN RANGE', high: 'HIGH' }

  return (
    <span className={`glucose-badge glucose-badge--${status}`}>
      {labels[status]}
    </span>
  )
}
```

```css
.glucose-badge {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-wider);
}

.glucose-badge--normal { background: var(--glucose-normal-bg); color: var(--glucose-normal); }
.glucose-badge--low    { background: var(--glucose-low-bg);    color: var(--glucose-low);    }
.glucose-badge--high   { background: var(--glucose-high-bg);   color: var(--glucose-high);   }
```

### 7.5 Bottom Sheet (Drawer)

Used for: quick log action sheet, "More" nav drawer, log forms on mobile.

```jsx
// src/components/ui/BottomSheet.jsx
function BottomSheet({ isOpen, onClose, title, children }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`sheet-backdrop ${isOpen ? 'sheet-backdrop--visible' : ''}`}
        onClick={onClose}
      />
      {/* Sheet */}
      <div className={`sheet ${isOpen ? 'sheet--open' : ''}`} role="dialog" aria-modal>
        <div className="sheet-handle" aria-hidden />
        {title && <h2 className="sheet-title">{title}</h2>}
        <div className="sheet-content">{children}</div>
      </div>
    </>
  )
}
```

```css
.sheet-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  pointer-events: none;
  transition: opacity 250ms var(--ease-out);
}
.sheet-backdrop--visible { opacity: 1; pointer-events: auto; }

.sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 201;
  background: var(--surface-raised);
  border-radius: 20px 20px 0 0;
  border-top: 1px solid var(--border-default);
  padding: var(--space-3) var(--space-4) 0;
  padding-bottom: calc(var(--safe-bottom) + var(--space-6));
  transform: translateY(100%);
  transition: transform 320ms var(--ease-drawer);
  max-height: 90dvh;
  overflow-y: auto;
}
.sheet--open { transform: translateY(0); }

.sheet-handle {
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: var(--border-default);
  margin: 0 auto var(--space-4);
}

.sheet-title {
  font-size: var(--text-md);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-4);
}
```

### 7.6 Empty State

```jsx
// src/components/ui/EmptyState.jsx
function EmptyState({ icon: Icon, title, description, action, onAction }) {
  return (
    <div className="empty-state">
      {Icon && (
        <div className="empty-state-icon">
          <Icon size={24} strokeWidth={1.5} />
        </div>
      )}
      <p className="empty-state-title">{title}</p>
      {description && <p className="empty-state-description">{description}</p>}
      {action && (
        <button className="btn btn-primary btn-md" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  )
}
```

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-12) var(--space-6);
  gap: var(--space-3);
}

.empty-state-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: var(--surface-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  margin-bottom: var(--space-2);
}

.empty-state-title {
  font-size: var(--text-md);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.empty-state-description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  max-width: 280px;
  line-height: var(--leading-relaxed);
}
```

### 7.7 List Item (Log Entry)

Every log entry (meal, insulin, glucose) follows a consistent pattern:

```jsx
function LogEntry({ icon: Icon, title, subtitle, value, unit, timestamp, status }) {
  return (
    <div className="log-entry">
      <div className={`log-entry-icon log-entry-icon--${status}`}>
        <Icon size={16} strokeWidth={2} />
      </div>
      <div className="log-entry-body">
        <span className="log-entry-title">{title}</span>
        {subtitle && <span className="log-entry-subtitle">{subtitle}</span>}
      </div>
      <div className="log-entry-meta">
        <span className="log-entry-value">{value} <small>{unit}</small></span>
        <span className="log-entry-time">{timestamp}</span>
      </div>
    </div>
  )
}
```

```css
.log-entry {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--border-subtle);
  min-height: 60px;  /* Comfortable tap height even if not interactive */
}

.log-entry:last-child { border-bottom: none; }

.log-entry-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.log-entry-icon--normal  { background: var(--glucose-normal-bg); color: var(--glucose-normal); }
.log-entry-icon--low     { background: var(--glucose-low-bg);    color: var(--glucose-low);    }
.log-entry-icon--high    { background: var(--glucose-high-bg);   color: var(--glucose-high);   }
.log-entry-icon--neutral { background: var(--surface-overlay);   color: var(--text-secondary); }

.log-entry-body { flex: 1; min-width: 0; }
.log-entry-title    { display: block; font-size: var(--text-base); font-weight: var(--weight-medium); color: var(--text-primary); }
.log-entry-subtitle { display: block; font-size: var(--text-sm); color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.log-entry-meta { text-align: right; flex-shrink: 0; }
.log-entry-value { display: block; font-family: var(--font-mono); font-size: var(--text-base); font-weight: var(--weight-semibold); color: var(--text-primary); }
.log-entry-value small { font-size: var(--text-xs); color: var(--text-muted); }
.log-entry-time  { display: block; font-size: var(--text-xs); color: var(--text-muted); margin-top: 2px; }
```

---

## 8. Screen Designs

### 8.1 Overview / Home

**Purpose:** Status at a glance. Answer: "Am I okay right now?"

**Layout (top to bottom on mobile):**

```
┌─────────────────────────────┐
│ Good morning, David         │  ← Greeting, 15px, text-secondary
│                             │
│  ┌───────────────────────┐  │
│  │  CURRENT GLUCOSE      │  │  ← Card, full-width
│  │                       │  │
│  │  7.8                  │  │  ← 56px mono, teal if in range
│  │  mmol/L               │  │  ← 11px label
│  │                       │  │
│  │  [IN RANGE]  ↑ +0.3   │  │  ← Badge + trend
│  │  Updated 4 min ago    │  │  ← text-muted, 11px
│  └───────────────────────┘  │
│                             │
│  ┌──────────┐ ┌──────────┐  │
│  │ TODAY'S  │ │ LAST     │  │  ← 2-col stat grid
│  │ CARBS    │ │ INSULIN  │  │
│  │ 84g      │ │ 6u       │  │
│  └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐  │
│  │ TIME IN  │ │ A1C EST. │  │
│  │ RANGE    │ │          │  │
│  │ 71%      │ │ 7.2%     │  │
│  └──────────┘ └──────────┘  │
│                             │
│  GLUCOSE — LAST 24H         │  ← Chart section header
│  ┌───────────────────────┐  │
│  │  [line chart]         │  │  ← Recharts, 160px height
│  └───────────────────────┘  │
│                             │
│  RECENT ACTIVITY            │
│  ┌───────────────────────┐  │
│  │  [log entries list]   │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

**The glucose card is deliberately large.** It's the most important piece of information.

### 8.2 Glucose Trends

**Purpose:** See patterns. Identify time-in-range and trends over days/weeks.

**Layout:**

```
┌─────────────────────────────┐
│ [24H] [7D] [30D] [90D]     │  ← Segmented control, top
│                             │
│  ┌───────────────────────┐  │
│  │  [full chart]         │  │  ← 240px height, target zone shaded
│  └───────────────────────┘  │
│                             │
│  TIME IN RANGE              │
│  ┌───────────────────────┐  │
│  │  [progress bars]      │  │  ← Low / Normal / High breakdown
│  │  Low 4%               │  │
│  │  In range 71%  ████   │  │
│  │  High 25%      ██     │  │
│  └───────────────────────┘  │
│                             │
│  READINGS                   │
│  [log entry list]           │
└─────────────────────────────┘
```

**Segmented control (time range selector):**

```css
.segmented-control {
  display: flex;
  background: var(--surface-input);
  border-radius: var(--radius-md);
  padding: 3px;
  gap: 2px;
}

.segmented-control-option {
  flex: 1;
  height: 32px;
  border-radius: 7px;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--text-muted);
  background: none;
  border: none;
  cursor: pointer;
  transition: all 150ms var(--ease-out);
}

.segmented-control-option--active {
  background: var(--surface-overlay);
  color: var(--text-primary);
}
```

### 8.3 Log Flow (Glucose Example)

**On mobile:** Tapping the center Log button opens a bottom sheet with three action options. Tapping "Glucose reading" opens a second sheet (or replaces the first) with the log form.

```
┌─────────────────────────────┐
│  ████ handle ████           │
│                             │
│  LOG GLUCOSE                │  ← Sheet title
│                             │
│  ┌───────────────────────┐  │
│  │  7.8         mmol/L   │  │  ← Large number input, monospace
│  └───────────────────────┘  │
│                             │
│  [4.0] [5.5] [7.0] [8.5]   │  ← Quick-tap presets (optional)
│                             │
│  Source                     │
│  [Manual] [Dexcom] [Other] │  ← Segmented control
│                             │
│  Notes (optional)           │
│  ┌───────────────────────┐  │
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│  [  Save Reading  ]         │  ← Full-width primary button
└─────────────────────────────┘
```

**Key form UX rules:**

- Numeric inputs use `inputMode="decimal"` to show the numeric keyboard on mobile (not the full keyboard)
- The number input is large — 48px height, 20px font
- "Save" button is always visible (not below the fold)
- After save: dismiss sheet, brief success toast, update the overview

### 8.4 Meal Log

```
┌─────────────────────────────┐
│  MEAL LOG                   │
│                             │
│  TODAY                      │  ← Date section header
│  ┌───────────────────────┐  │
│  │ Breakfast             │  │  ← Log entries grouped by time
│  │ 8:14 AM               │  │
│  │ Oats + berries        │  │
│  │ 62g carbs ············│  │
│  │ ····· 12g protein     │  │
│  └───────────────────────┘  │
│  [more entries...]          │
│                             │
│  YESTERDAY                  │
│  [...]                      │
└─────────────────────────────┘
```

### 8.5 Settings

Settings should feel like native iOS settings. Grouped, sectioned, no elaborate cards.

```
┌─────────────────────────────┐
│  SETTINGS                   │
│                             │
│  ACCOUNT                    │  ← Section header
│  ┌───────────────────────┐  │
│  │ David Ogilvie         │  │
│  │ david@example.com     │  │
│  └───────────────────────┘  │
│                             │
│  GLUCOSE TARGETS            │
│  ┌───────────────────────┐  │
│  │ Low threshold  3.9    │  │
│  │ High threshold 10.0   │  │
│  │ Unit           mmol/L │  │
│  └───────────────────────┘  │
│                             │
│  APP                        │
│  ┌───────────────────────┐  │
│  │ Install App     [→]   │  │  ← PWA install prompt
│  │ Dark Mode    [toggle] │  │
│  │ Notifications [toggle]│  │
│  └───────────────────────┘  │
│                             │
│  AI FEATURES                │
│  [AI key setup...]          │
│                             │
│  [  Sign Out  ]             │  ← Destructive, bottom
└─────────────────────────────┘
```

Settings rows:

```css
.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--border-subtle);
  min-height: 52px;
}

.settings-row:last-child { border-bottom: none; }

.settings-row-label {
  font-size: var(--text-base);
  color: var(--text-primary);
}

.settings-row-value {
  font-size: var(--text-base);
  color: var(--text-secondary);
  font-family: var(--font-mono);
}
```

---

## 9. Motion & Animation

### 9.1 Principles

1. **Duration over distance.** Short animations (120–200ms) for micro-interactions, medium (250–350ms) for layout transitions, never over 400ms for UI elements.
2. **Ease out for entrances, ease in for exits.** Elements decelerate as they arrive; they accelerate as they leave.
3. **Spring for physical things.** The bottom sheet, drawers, and draggable elements use `--ease-drawer` or `--ease-spring`. Everything else uses `--ease-out`.
4. **Reduce motion.** Every animation must respect `prefers-reduced-motion`. Crossfades replace slides/springs.
5. **Framer Motion is installed but unused.** Either use it intentionally (for shared layout animations, presence animations) or remove it from the bundle.

### 9.2 Page Transition (View Change)

When switching dashboard views, fade the content in — don't slide (sliding between unrelated screens creates false spatial metaphors):

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.view-enter {
  animation: fadeIn 200ms var(--ease-out) both;
}

@media (prefers-reduced-motion: reduce) {
  .view-enter { animation: none; }
}
```

### 9.3 Bottom Sheet Animation

```css
/* Sheet opens with spring */
.sheet { transition: transform 320ms cubic-bezier(0.32, 0.72, 0, 1); }
.sheet--open { transform: translateY(0); }

/* Backdrop fades in */
.sheet-backdrop { transition: opacity 250ms var(--ease-out); }

/* On reduced motion — instant */
@media (prefers-reduced-motion: reduce) {
  .sheet, .sheet-backdrop { transition: none; }
}
```

### 9.4 Number Updates

When a stat value changes (e.g. live glucose updates), animate the number:

```css
@keyframes numberFlash {
  0%   { color: var(--text-primary); }
  30%  { color: var(--teal-500); }
  100% { color: var(--text-primary); }
}

.value-updated {
  animation: numberFlash 600ms var(--ease-out);
}
```

### 9.5 Tap Feedback

All interactive elements need immediate visual feedback on touch (mobile has 300ms delay removed, but visual response must be instant):

```css
.btn:active,
.log-entry:active,
.bottom-nav-item:active {
  opacity: 0.7;
  transform: scale(0.97);
  transition: transform 80ms var(--ease-out), opacity 80ms var(--ease-out);
}
```

---

## 10. Offline & Loading States

### 10.1 Offline Banner

When the service worker loses network connectivity, show a non-blocking indicator:

```jsx
function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const on = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  if (isOnline) return null

  return (
    <div className="offline-banner" role="status">
      Offline — viewing cached data
    </div>
  )
}
```

```css
.offline-banner {
  position: fixed;
  top: calc(var(--safe-top) + 8px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 300;
  background: var(--warning-bg);
  color: var(--warning);
  border: 1px solid rgba(251, 191, 36, 0.2);
  border-radius: var(--radius-full);
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
}
```

### 10.2 Skeleton Loading

Replace generic spinners with skeleton screens that match the actual content shape:

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--surface-overlay) 25%,
    var(--surface-raised) 50%,
    var(--surface-overlay) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm);
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; background: var(--surface-overlay); }
}
```

Skeleton for the stat grid:

```jsx
function StatGridSkeleton() {
  return (
    <div className="stats-grid">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card">
          <div className="skeleton" style={{ height: 11, width: '60%', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 28, width: '80%' }} />
        </div>
      ))}
    </div>
  )
}
```

### 10.3 Toast Notifications

For save confirmations, errors, and sync status:

```jsx
// Simple: use a toast context
// Toast appears at top on mobile, bottom-right on desktop
// Auto-dismisses after 3s
// Max 2 toasts visible at once

// Visual:
// [✓] Glucose reading saved   [×]
// [!] Failed to sync          [×]
```

```css
.toast-container {
  position: fixed;
  top: calc(var(--safe-top) + var(--space-3));
  left: var(--space-4);
  right: var(--space-4);
  z-index: 500;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--surface-raised);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  pointer-events: auto;
  box-shadow: var(--shadow-lg);
  animation: toastIn 250ms var(--ease-out) both;
}

@keyframes toastIn {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

---

## 11. Implementation Roadmap

This is the order of operations for converting the current app to a PWA with the new design system.

### Phase 1 — PWA Foundation (no visual changes)

1. Install `vite-plugin-pwa`
2. Create `/public/manifest.json`
3. Generate app icons (192, 512, maskable variants, Apple touch icon)
4. Update `index.html` with PWA meta tags and safe-area viewport
5. Configure service worker with Supabase caching strategy
6. Add `OfflineBanner` component
7. Add `UpdatePrompt` component
8. Add `useInstallPrompt` hook
9. Expose install prompt in Settings

**Test:** Install app to iPhone home screen. Verify it opens standalone, no address bar, correct icon.

### Phase 2 — Design System Token Cleanup

1. Update `index.css` CSS custom properties to the new token names defined in Section 4
2. Audit every component for token usage — replace old tokens with new ones
3. Update typography: remove Playfair Display from all dashboard components
4. Standardize border-radius, padding, spacing across all existing components
5. Implement the new button system (`btn-primary`, `btn-secondary`, `btn-ghost`)
6. Implement new input styles

**Test:** Visual pass through every dashboard view. No regressions.

### Phase 3 — URL-Based Routing

1. Replace `useState('overview')` in `Dashboard.jsx` with React Router nested routes
2. Create route definitions for all dashboard views
3. Update `Sidebar` and `BottomNav` to use `<NavLink>` instead of `onClick`
4. Ensure browser back button works between views
5. Test that manifest shortcuts (`/dashboard/glucose/log`) work

**Test:** Reload page on `/dashboard/meals` — stays on meals. Back button returns to previous view.

### Phase 4 — Mobile Navigation

1. Build `BottomNav` component with 5 tabs (Home, Glucose, Log, Meals, More)
2. Build `LogActionSheet` (the quick log bottom sheet)
3. Build `MoreSheet` (slide-up containing Insulin, Analytics, Settings links)
4. Hide sidebar on mobile (`< 768px`), show BottomNav
5. Clean up sidebar for desktop: add section groupings, remove collapse toggle

**Test:** Complete log flow on iPhone — tap Log, select Glucose, enter value, save, see it in Overview.

### Phase 5 — Component Polish

1. Implement `BottomSheet` component (reusable)
2. Implement `Toast` system
3. Implement skeleton loading screens for Overview, GlucoseTrends
4. Implement `OfflineBanner`
5. Update `EmptyState` to match new design
6. Update `LogEntry` list item pattern across all log views
7. Implement segmented control for time ranges in GlucoseTrends

### Phase 6 — Analytics & AI Views

1. Move ICR, A1C, Correction, Patterns into a single "Analytics" view with tabbed navigation
2. Clean up AI Chatbot — make it a proper sheet or dedicated view, not embedded in Overview
3. Implement "More" sheet navigation properly

---

## Appendix A — File Structure After Implementation

```
src/
  components/
    pwa/
      UpdatePrompt.jsx
      OfflineBanner.jsx
      InstallPrompt.jsx     ← Used in Settings
    ui/
      BottomSheet.jsx
      Toast.jsx             ← Toast + ToastProvider
      StatCard.jsx
      EmptyState.jsx
      Skeleton.jsx
      SegmentedControl.jsx
      LogEntry.jsx          ← Shared log item
    dashboard/
      BottomNav.jsx
      LogActionSheet.jsx
      MoreSheet.jsx
      Sidebar.jsx           ← Desktop only
      [existing views]
  hooks/
    useInstallPrompt.js
    useOnlineStatus.js
    useToast.js
public/
  manifest.json
  icons/
    icon-192.png
    icon-512.png
    icon-maskable-192.png
    icon-maskable-512.png
    icon-apple-180.png
    shortcut-glucose.png
    shortcut-meal.png
    shortcut-insulin.png
```

## Appendix B — Icon Generation

Use a 1024×1024 source SVG (the existing `favicon.svg` may work) and generate:

```bash
# Using sharp or a service like realfavicongenerator.net
npx pwa-asset-generator ./public/favicon.svg ./public/icons \
  --manifest ./public/manifest.json \
  --index ./index.html \
  --background "#0D1B16" \
  --padding "15%"
```

The maskable icons need `15–20%` safe-zone padding so the icon doesn't get cropped on Android adaptive icons.

## Appendix C — Accessibility Checklist

- All interactive elements have `aria-label` when icon-only
- Bottom sheet has `role="dialog"` and `aria-modal="true"`
- Focus is trapped inside open sheets
- Focus returns to trigger on sheet close
- Color is never the only differentiator (badges include text, not just color)
- All animations respect `prefers-reduced-motion`
- Minimum tap target 44×44px on all buttons and nav items
- Form inputs have associated `<label>` elements
- Charts have text alternatives (`aria-label` with summary data)

---

*This document is the implementation spec. Every section is a directive, not a suggestion. Deviations should be documented with rationale.*