# Betatrace — Mobile & Desktop Layout Design

## Goal

Establish a clear, intentional responsive layout strategy: mobile-first PWA experience with a bottom tab bar, and a polished phone-frame presentation on desktop. Also add a phone mockup to the landing page hero.

---

## Landing Page

**Keep as-is.** The animated glucose curve hero, scroll reveal animations, feature grid, and HowItWorks section are all strong.

**One addition — phone mockup in hero:**
- On desktop: render a phone frame preview of the app to the right of the hero copy
- On mobile: hide it (copy + CTAs take full width)
- The mockup is a static screenshot inside an iPhone-style CSS frame (no iframe needed)
- This is the standard SaaS app pattern — immediately shows what the product looks like

---

## Mobile Layout (≤768px / PWA)

Replace the current sidebar + hamburger approach with a native-feeling mobile layout.

### Structure
```
┌─────────────────────────┐
│  [Avatar]  TITLE  [🔔]  │  ← Top header (sticky)
├─────────────────────────┤
│                         │
│    Scrollable content   │
│                         │
├─────────────────────────┤
│ HOME  GLUCOSE  [+]  MEALS  MORE │  ← Bottom tab bar
└─────────────────────────┘
```

### Bottom Tab Bar
- 5 positions: HOME | GLUCOSE | [+ FAB] | MEALS | MORE
- Center FAB: raised teal circle, opens a quick-log bottom sheet (log meal / log insulin / log glucose)
- MORE: opens a bottom sheet listing remaining views — ICR Predictor, Dexcom Import, A1C Estimator, Correction Factor, Pattern Alerts, Settings
- Active tab: teal icon + label, inactive: muted

### Top Header
- Left: user avatar (taps to profile/settings)
- Center: current page title (matches active tab)
- Right: notification bell icon
- Sticky, same dark background as app

### Content Area
- Full width, scrollable
- Padding adjusted for top header + bottom tab bar
- No sidebar at this breakpoint

---

## Desktop Layout (>768px)

### Background
- Pure CSS — no image required
- `radial-gradient` from `#0D1B16` at center bleeding to `#050D0A` at edges
- Subtle teal glow (`rgba(45, 212, 168, 0.06)`) emanating from center-bottom behind the phone frame
- Optional: SVG noise texture overlay at low opacity for depth

### Phone Frame
- Centered on screen, vertically centered
- Dimensions: ~390px wide × ~844px tall (iPhone 14 proportions)
- CSS-only bezel: dark `#1A1A1A` frame, `border-radius: 44px`, thin inner highlight
- Home indicator bar at bottom (small pill, subtle)
- Teal-tinted `box-shadow` for glow effect
- App content renders inside — scrollable via `overflow-y: scroll` with scrollbar hidden

### Scaling
- If viewport height < 900px, scale the frame down proportionally with `transform: scale()`
- Frame stays centered both axes at all times

---

## Navigation Mapping

| Bottom Tab | Views Covered |
|---|---|
| HOME | Overview |
| GLUCOSE | Glucose Trends |
| + FAB | Quick log sheet |
| MEALS | Meal Log |
| MORE sheet | Insulin Log, ICR Predictor, Dexcom Import, A1C Estimator, Correction Factor, Pattern Alerts, Settings |

---

## What Does NOT Change

- All existing components (Overview, MealLog, InsulinLog, etc.) — untouched
- All mock data and functionality
- Design system (colors, typography, spacing tokens)
- Supabase auth flow
- Landing page sections (Features, HowItWorks, Footer)
