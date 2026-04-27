# Betatrace PWA Ambient Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Ship the Stitch-designed Ambient PWA (mobile-first responsive, hybrid offline) wired to the existing Supabase data layer, replacing the desktop-sidebar UI with bottom-nav + FAB-driven Log action sheet.

**Architecture:** New `src/components/v2/` directory built alongside existing `src/components/dashboard/` with screen-by-screen cutover via import swaps in `Dashboard.jsx`. Tailwind-only styling using tokens extracted from Stitch HTML. Material Symbols Outlined for icons. PWA via `vite-plugin-pwa` with workbox runtime caching (cache reads, network-only writes). Old components deleted in final cleanup commit.

**Tech Stack:** React 19, Vite, Tailwind CSS, vite-plugin-pwa, workbox, Supabase JS, recharts, vitest + @testing-library/react (added in Phase 0), Material Symbols, JetBrains Mono + Inter.

**Design source:** `docs/plans/2026-04-27-pwa-ambient-design.md`. Read it first.

**Branch:** `feature/pwa-ambient` off `feature/core-functionality`.

**Delegation map:** §10 of the design doc. Track A (this plan) is the spine. Track B (nano-banana art) runs in parallel during Phase 0–1. Track C (Cursor polish) runs after Phase 2. Track D (Codex rescue) on demand.

---

## Phase 0 — Foundation

**Outcome:** Branch created, Tailwind + vite-plugin-pwa + vitest installed, design tokens wired, Material Symbols loaded, existing build still green.

### Task 0.1: Commit loose Remotion changes (clean working tree)

**Step 1: Stage Remotion files**

```bash
cd C:/Users/dodgi/betatrace
git status --short
git add src/remotion/
```

**Step 2: Commit**

```bash
git commit -m "chore(remotion): tweaks before pwa-ambient branch"
```

Expected: clean working tree (`git status --short` returns nothing).

### Task 0.2: Create the `feature/pwa-ambient` branch

**Step 1: Verify base**

```bash
git branch --show-current
```

Expected: `feature/core-functionality`.

**Step 2: Create + checkout**

```bash
git checkout -b feature/pwa-ambient
git branch --show-current
```

Expected: `feature/pwa-ambient`.

### Task 0.3: Install Tailwind + PostCSS + autoprefixer

**Step 1: Install**

```bash
npm install -D tailwindcss@^3.4 postcss autoprefixer
```

(Use Tailwind v3, not v4 — the Stitch HTML uses v3 syntax including `tailwind.config.js`. v4 is config-in-CSS and would require translation.)

**Step 2: Initialize**

```bash
npx tailwindcss init -p
```

Expected: creates `tailwind.config.js` and `postcss.config.js`.

**Step 3: Verify files exist**

```bash
ls tailwind.config.js postcss.config.js
```

### Task 0.4: Configure Tailwind with Stitch design tokens

**Files:**
- Modify: `tailwind.config.js`

**Step 1: Replace the file contents**

Open `tailwind.config.js` and replace with:

```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#56f1c3',
        'surface-tint': '#3edeb2',
        'glucose-normal': '#2DD4A8',
        'glucose-high': '#FBBF24',
        'glucose-low': '#FB7185',
        'surface-bright': '#333b37',
        'border-default': 'rgba(45, 212, 168, 0.15)',
        'border-strong': 'rgba(45, 212, 168, 0.30)',
        'border-subtle': 'rgba(45, 212, 168, 0.08)',
        'surface-container-lowest': '#09100d',
        'surface-container-low': '#161d1a',
        'surface-container': '#1a211e',
        'surface-container-high': '#242c28',
        'surface-container-highest': '#2f3633',
        'surface-base': '#0D1B16',
        'surface-raised': '#132B23',
        'surface-overlay': '#1A3D32',
        'surface-input': '#0A1410',
        'surface-dim': '#0e1512',
        background: '#0e1512',
        surface: '#0e1512',
        outline: '#85948d',
        'outline-variant': '#3c4a44',
        tertiary: '#ffcfad',
        'chart-carbs': '#38BDF8',
        'chart-insulin': '#A78BFA',
        'text-primary': '#E8F5F0',
        'text-secondary': '#8BA89F',
        'text-muted': '#4A6B60',
        'on-surface': '#dde4df',
        'on-background': '#dde4df',
        'on-primary': '#00382a',
        'primary-container': '#2dd4a8',
        'on-primary-container': '#005742',
        'secondary-container': '#334c43',
        'on-secondary-container': '#a0bbaf',
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        base: '4px',
        md: '1rem',
        lg: '1.5rem',
        xl: '3rem',
      },
      fontFamily: {
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'body-base': ['15px', { lineHeight: '1.5', fontWeight: '400' }],
        'label-caps': ['11px', { lineHeight: '1.2', letterSpacing: '0.1em', fontWeight: '600' }],
        'title-lg': ['22px', { lineHeight: '1.2', fontWeight: '600' }],
        'data-mono': ['13px', { lineHeight: '1', fontWeight: '500' }],
        'stat-lg': ['28px', { lineHeight: '1.2', letterSpacing: '-0.03em', fontWeight: '600' }],
        'headline-hero': ['56px', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '700' }],
      },
      transitionTimingFunction: {
        'out-strong': 'cubic-bezier(0.23, 1, 0.32, 1)',
        'in-out-strong': 'cubic-bezier(0.77, 0, 0.175, 1)',
        drawer: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
    },
  },
  plugins: [],
};
```

**Step 2: Verify build still works**

```bash
npm run build
```

Expected: build succeeds (Tailwind not yet imported into CSS, so no visual change yet).

### Task 0.5: Wire Tailwind directives into index.css

**Files:**
- Modify: `src/index.css` (top of file)

**Step 1: Read current index.css head**

```bash
head -10 src/index.css
```

**Step 2: Prepend Tailwind directives**

Add to the very top of `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 3: Verify build**

```bash
npm run build
```

Expected: passes. Existing styles still apply.

**Step 4: Sanity test in dev**

```bash
npm run dev
```

Open localhost in browser, then in DevTools console:

```js
document.body.classList.add('bg-surface-base'); document.body.style
```

Expected: body bg becomes `#0D1B16`. Then revert: `document.body.classList.remove('bg-surface-base')`.

Stop dev server (Ctrl-C).

### Task 0.6: Add Material Symbols + drop Playfair Display

**Files:**
- Modify: `index.html`

**Step 1: Replace the font `<link>`**

Find this line in `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

Replace with:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
```

**Step 2: Add Material Symbols default settings to index.css**

Append to the bottom of `src/index.css`:

```css
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
.material-symbols-outlined.icon-fill { font-variation-settings: 'FILL' 1; }
```

**Step 3: Verify build**

```bash
npm run build && npm run dev
```

In DevTools console:

```html
document.body.insertAdjacentHTML('beforeend', '<span class="material-symbols-outlined" style="position:fixed;top:10px;left:10px;z-index:9999;color:#56f1c3">home</span>')
```

Expected: green house icon appears top-left. Remove it: `document.querySelectorAll('span.material-symbols-outlined')[0].remove()`.

Stop dev.

### Task 0.7: Install vitest + Testing Library

**Step 1: Install**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Step 2: Configure vitest in vite.config.js**

Replace `vite.config.js` contents:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
  },
});
```

**Step 3: Create test setup**

Create `src/test/setup.js`:

```js
import '@testing-library/jest-dom/vitest';
```

**Step 4: Update package.json scripts**

In `package.json`, replace the `"test"` script:

```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 5: Smoke-test vitest**

Create `src/test/smoke.test.js`:

```js
import { describe, it, expect } from 'vitest';

describe('vitest setup', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

Run:

```bash
npm test
```

Expected: 1 passed. Delete the smoke file after passing:

```bash
rm src/test/smoke.test.js
```

### Task 0.8: Install vite-plugin-pwa + workbox

**Step 1: Install**

```bash
npm install -D vite-plugin-pwa workbox-window
```

(We won't wire up the plugin yet — that's Phase 5. Just installing now so we don't have surprise install steps mid-stream.)

**Step 2: Verify**

```bash
npm ls vite-plugin-pwa
```

Expected: shows installed version.

### Task 0.9: Commit Phase 0

**Step 1: Stage**

```bash
git add tailwind.config.js postcss.config.js vite.config.js index.html package.json package-lock.json src/index.css src/test/setup.js
```

**Step 2: Commit**

```bash
git commit -m "$(cat <<'EOF'
chore(v2): foundation — tailwind, vitest, material symbols, pwa deps

- Add Tailwind v3 with Stitch design tokens (colors, type scale,
  spacing, custom easings).
- Drop Playfair Display from index.html; load Material Symbols.
- Install vitest + @testing-library/react with jsdom environment.
- Install vite-plugin-pwa + workbox-window (wired up in Phase 5).

Verified: existing build still passes, existing app still renders.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 1 — Shell + Sheet primitive + LogActionSheet

**Outcome:** Empty v2 shell renders behind every dashboard screen. Pressing the FAB opens the action sheet with three log options. Old screens still work — Dashboard.jsx still renders the old `Overview` etc. inside the new shell's `<Outlet/>`.

### Task 1.1: Add tokens.css for non-utility code

**Files:**
- Create: `src/styles/tokens.css`

**Step 1: Write the file**

```css
:root {
  --surface-base: #0D1B16;
  --surface-raised: #132B23;
  --surface-overlay: #1A3D32;
  --surface-input: #0A1410;
  --primary: #56f1c3;
  --glucose-normal: #2DD4A8;
  --glucose-high: #FBBF24;
  --glucose-low: #FB7185;
  --chart-carbs: #38BDF8;
  --chart-insulin: #A78BFA;
  --text-primary: #E8F5F0;
  --text-secondary: #8BA89F;
  --text-muted: #4A6B60;
  --border-subtle: rgba(45, 212, 168, 0.08);
  --border-default: rgba(45, 212, 168, 0.15);
  --border-strong: rgba(45, 212, 168, 0.30);

  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
}

.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
.pt-safe { padding-top: env(safe-area-inset-top); }
.pb-safe-nav { padding-bottom: calc(5rem + env(safe-area-inset-bottom)); }
```

**Step 2: Import from index.css**

Add at the top of `src/index.css` (above `@tailwind base;`):

```css
@import './styles/tokens.css';
```

**Step 3: Verify build**

```bash
npm run build
```

### Task 1.2: AppContainer shell component

**Files:**
- Create: `src/components/v2/shell/AppContainer.jsx`

**Step 1: Write component**

```jsx
export default function AppContainer({ children }) {
  return (
    <div className="min-h-screen bg-surface-base text-text-primary font-body antialiased flex justify-center selection:bg-primary-container selection:text-on-primary-container">
      <div className="w-full max-w-[480px] min-h-screen relative flex flex-col pb-safe-nav lg:pb-0 lg:max-w-6xl lg:grid lg:grid-cols-[240px_1fr] lg:gap-md">
        {children}
      </div>
    </div>
  );
}
```

(No tests — pure layout container, verified visually in Task 1.7.)

### Task 1.3: TopBar + BottomNav

**Files:**
- Create: `src/components/v2/shell/TopBar.jsx`
- Create: `src/components/v2/shell/BottomNav.jsx`

**Step 1: TopBar**

Create `src/components/v2/shell/TopBar.jsx`:

```jsx
import { Link } from 'react-router-dom';

export default function TopBar({ user }) {
  return (
    <header className="fixed top-0 w-full max-w-[480px] z-40 bg-surface-base/80 backdrop-blur-xl flex items-center justify-between px-md h-16 pt-safe lg:static lg:max-w-none lg:col-span-2">
      <Link to="/dashboard" className="flex items-center gap-sm">
        <div className="w-8 h-8 rounded-full border border-border-default bg-surface-raised flex items-center justify-center text-primary text-xs font-mono">
          {user?.email?.[0]?.toUpperCase() ?? 'B'}
        </div>
      </Link>
      <div className="text-lg font-bold tracking-widest text-text-primary font-body">GLUCOSE</div>
      <button className="w-10 h-10 flex items-center justify-center text-primary rounded-full active:scale-95 transition-transform">
        <span className="material-symbols-outlined">notifications</span>
      </button>
    </header>
  );
}
```

**Step 2: BottomNav**

Create `src/components/v2/shell/BottomNav.jsx`:

```jsx
import { NavLink } from 'react-router-dom';

const items = [
  { to: '/dashboard', icon: 'home', label: 'Home', end: true },
  { to: '/dashboard/glucose', icon: 'insights', label: 'Glucose' },
  { to: '/dashboard/meals', icon: 'restaurant', label: 'Meals' },
  { to: '/dashboard/more', icon: 'more_horiz', label: 'More' },
];

export default function BottomNav({ onPressLog }) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40 pb-safe bg-surface-base/85 backdrop-blur-xl border-t border-border-subtle text-[10px] font-medium font-body uppercase tracking-wider flex justify-around items-center h-20 px-2">
      {items.slice(0, 2).map((item) => (
        <NavItem key={item.to} {...item} />
      ))}
      <button
        type="button"
        onClick={onPressLog}
        aria-label="Open log menu"
        className="flex flex-col items-center justify-center text-text-secondary active:scale-90 transition-all duration-200 w-16 h-full -mt-6"
      >
        <div className="w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-[28px] icon-fill">add_circle</span>
        </div>
        <span className="mt-1">Log</span>
      </button>
      {items.slice(2).map((item) => (
        <NavItem key={item.to} {...item} />
      ))}
    </nav>
  );
}

function NavItem({ to, icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center w-16 h-full gap-1 active:scale-90 transition-all duration-200 ${
          isActive ? 'text-primary' : 'text-text-muted hover:text-text-secondary'
        }`
      }
    >
      <span className="material-symbols-outlined text-[24px]">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}
```

**Step 3: Verify build**

```bash
npm run build
```

### Task 1.4: Sheet primitive (drag-to-dismiss)

**Files:**
- Create: `src/components/v2/ui/Sheet.jsx`
- Create: `src/components/v2/ui/Sheet.test.jsx`

**Step 1: Write the failing test**

Create `src/components/v2/ui/Sheet.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Sheet from './Sheet';

describe('Sheet', () => {
  it('renders children when open', () => {
    render(<Sheet open onOpenChange={() => {}}>hello</Sheet>);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    const { queryByText } = render(<Sheet open={false} onOpenChange={() => {}}>hello</Sheet>);
    expect(queryByText('hello')).not.toBeInTheDocument();
  });

  it('calls onOpenChange(false) when backdrop is clicked', () => {
    const onOpenChange = vi.fn();
    render(<Sheet open onOpenChange={onOpenChange}>hello</Sheet>);
    fireEvent.click(screen.getByTestId('sheet-backdrop'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onOpenChange(false) on Escape', () => {
    const onOpenChange = vi.fn();
    render(<Sheet open onOpenChange={onOpenChange}>hello</Sheet>);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
```

**Step 2: Run test, expect failure**

```bash
npx vitest run src/components/v2/ui/Sheet.test.jsx
```

Expected: FAIL — module not found.

**Step 3: Write minimal Sheet**

Create `src/components/v2/ui/Sheet.jsx`:

```jsx
import { useEffect } from 'react';

export default function Sheet({ open, onOpenChange, children, title }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onOpenChange(false); };
    document.body.classList.add('overflow-hidden');
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('overflow-hidden');
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        data-testid="sheet-backdrop"
        onClick={() => onOpenChange(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_250ms_var(--ease-out)]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-surface-base border-t border-border-subtle rounded-t-2xl pb-safe animate-[slideUp_280ms_var(--ease-drawer)]"
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-text-muted/40" />
        </div>
        {title && (
          <h2 className="text-center font-body text-title-lg text-text-primary px-md pb-md">
            {title}
          </h2>
        )}
        <div className="px-md pb-lg">{children}</div>
      </div>
    </div>
  );
}
```

**Step 4: Add the keyframes to tokens.css**

Append to `src/styles/tokens.css`:

```css
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translate(-50%, 100%); } to { transform: translate(-50%, 0); } }
```

**Step 5: Run tests, expect pass**

```bash
npx vitest run src/components/v2/ui/Sheet.test.jsx
```

Expected: 4 passed.

**Step 6: Commit**

```bash
git add src/components/v2/ui/Sheet.jsx src/components/v2/ui/Sheet.test.jsx src/styles/tokens.css
git commit -m "feat(v2): Sheet primitive with backdrop + escape dismissal"
```

> **Note for Track C (Cursor polish):** drag-to-dismiss with momentum + multi-touch protection is left to a follow-up commit. The current Sheet ships without drag — backdrop tap and Escape are sufficient for v1. Vaul library patterns are the reference. Add a TODO comment in `Sheet.jsx` noting this.

### Task 1.5: LogActionSheet

**Files:**
- Create: `src/components/v2/sheets/LogActionSheet.jsx`

**Step 1: Write component**

```jsx
import { Link } from 'react-router-dom';
import Sheet from '../ui/Sheet';

const options = [
  { to: '/dashboard/glucose/log', icon: 'water_drop', label: 'Log Glucose reading', tone: 'glucose-normal' },
  { to: '/dashboard/meals/log', icon: 'restaurant', label: 'Log Meal / carbs', tone: 'chart-carbs' },
  { to: '/dashboard/insulin/log', icon: 'vaccines', label: 'Log Insulin dose', tone: 'chart-insulin' },
];

export default function LogActionSheet({ open, onOpenChange }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Log what?">
      <div className="flex flex-col gap-sm">
        {options.map((opt) => (
          <Link
            key={opt.to}
            to={opt.to}
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-md p-md bg-surface-overlay border border-border-subtle rounded-xl active:scale-[0.97] transition-transform duration-150 ease-out-strong hover:border-border-default"
          >
            <div className={`w-10 h-10 rounded-full bg-${opt.tone}/20 text-${opt.tone} flex items-center justify-center`}>
              <span className="material-symbols-outlined">{opt.icon}</span>
            </div>
            <span className="flex-1 font-body text-body-base text-text-primary">{opt.label}</span>
            <span className="material-symbols-outlined text-text-muted">chevron_right</span>
          </Link>
        ))}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="mt-sm py-md text-text-secondary text-body-base active:scale-95 transition-transform"
        >
          × Cancel
        </button>
      </div>
    </Sheet>
  );
}
```

> **Tailwind safelist note:** dynamic class names like `bg-${tone}/20` won't be detected by Tailwind's content scanner. Add a safelist in `tailwind.config.js`. (Step 2.)

**Step 2: Add safelist to tailwind.config.js**

Add to the config object (above `theme:`):

```js
  safelist: [
    'bg-glucose-normal/20', 'text-glucose-normal',
    'bg-chart-carbs/20', 'text-chart-carbs',
    'bg-chart-insulin/20', 'text-chart-insulin',
  ],
```

### Task 1.6: New Dashboard.jsx with v2 shell + nested routes

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/pages/Dashboard.jsx`

**Step 1: Update App.jsx routing**

Replace the `/dashboard` route block in `src/App.jsx` with nested routes:

```jsx
<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
  <Route index element={<DashboardHomeLegacy />} />
  <Route path="glucose" element={<GlucoseLegacy />} />
  <Route path="meals" element={<MealsLegacy />} />
  <Route path="more" element={<MoreLegacy />} />
  <Route path="glucose/log" element={<GlucoseLogPlaceholder />} />
  <Route path="meals/log" element={<MealLogPlaceholder />} />
  <Route path="insulin/log" element={<InsulinLogPlaceholder />} />
</Route>
```

For now, the `*Legacy` and `*Placeholder` components are inline simple wrappers; add at the bottom of `src/App.jsx`:

```jsx
import OverviewLegacy from './components/dashboard/Overview';
import MealLogLegacy from './components/dashboard/MealLog';
import GlucoseTrendsLegacy from './components/dashboard/GlucoseTrends';

function DashboardHomeLegacy() { return <OverviewLegacy />; }
function GlucoseLegacy() { return <GlucoseTrendsLegacy />; }
function MealsLegacy() { return <MealLogLegacy />; }
function MoreLegacy() { return <div className="p-md text-text-secondary">More menu coming in Phase 4.</div>; }
function GlucoseLogPlaceholder() { return <div className="p-md">Glucose log sheet — Phase 2.</div>; }
function MealLogPlaceholder() { return <div className="p-md">Meal log sheet — Phase 2.</div>; }
function InsulinLogPlaceholder() { return <div className="p-md">Insulin log sheet — Phase 2.</div>; }
```

**Step 2: Rewrite Dashboard.jsx with v2 shell**

Replace `src/pages/Dashboard.jsx` contents:

```jsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AppContainer from '../components/v2/shell/AppContainer';
import TopBar from '../components/v2/shell/TopBar';
import BottomNav from '../components/v2/shell/BottomNav';
import LogActionSheet from '../components/v2/sheets/LogActionSheet';

export default function Dashboard() {
  const { user } = useAuth();
  const [logOpen, setLogOpen] = useState(false);

  return (
    <AppContainer>
      <TopBar user={user} />
      <main className="flex-1 mt-16 lg:mt-0 lg:col-start-2 px-md py-lg overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav onPressLog={() => setLogOpen(true)} />
      <LogActionSheet open={logOpen} onOpenChange={setLogOpen} />
    </AppContainer>
  );
}
```

**Step 3: Delete the old Dashboard.css import**

The old `src/pages/Dashboard.css` is no longer imported. Don't delete the file yet (Phase 6 cleanup), but verify it's not imported:

```bash
grep -n "Dashboard.css" src/pages/Dashboard.jsx
```

Expected: no output (already removed by the rewrite above).

### Task 1.7: Visual verification of Phase 1

**Step 1: Run dev**

```bash
npm run dev
```

Open localhost. Sign in (or use guest mode).

**Step 2: Manual test list**

- [ ] Bottom nav has 5 slots: Home, Glucose, [+], Meals, More.
- [ ] Top bar shows GLUCOSE wordmark + bell + avatar circle.
- [ ] Tapping the FAB opens the action sheet from the bottom with backdrop fade.
- [ ] Sheet has 3 colored options + Cancel.
- [ ] Tapping a sheet option navigates to a placeholder route.
- [ ] Tapping the backdrop closes the sheet.
- [ ] Pressing Escape closes the sheet.
- [ ] At ≥ 1024px, bottom nav hides; nav doesn't break.
- [ ] Old `Overview` still renders inside the new shell at `/dashboard`.
- [ ] Old `GlucoseTrends` still renders at `/dashboard/glucose`.

**Step 3: Stop dev. Commit Phase 1.**

```bash
git add src/components/v2 src/pages/Dashboard.jsx src/App.jsx src/styles/tokens.css src/index.css tailwind.config.js
git commit -m "$(cat <<'EOF'
feat(v2): shell, nested routes, log action sheet

- AppContainer with mobile (max-w-480) + desktop (3-col grid) variants.
- TopBar with glucose wordmark + bell + avatar.
- BottomNav with 4 nav items + center FAB Log button.
- Sheet primitive (backdrop tap + Escape dismissal; drag TODO).
- LogActionSheet with 3 categorical-color options.
- Nested routes: /dashboard{,/glucose,/meals,/more,/{glucose,meals,insulin}/log}.
- Old screens still render inside new shell as Legacy wrappers.

Tests: 4 passing (Sheet primitive).

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 2 — Home screen + Log sheets (the demo-able cut)

**Outcome:** `/dashboard` renders the Stitch Overview design with real Supabase data. All three log sheets save to Supabase. Old `Overview` no longer mounted.

### Task 2.1: GlucoseHero card

**Files:**
- Create: `src/components/v2/cards/GlucoseHero.jsx`

```jsx
const TREND_ICON = {
  rising_fast: 'trending_up',
  rising: 'trending_up',
  stable: 'trending_flat',
  falling: 'trending_down',
  falling_fast: 'trending_down',
};

const STATUS = (value) => {
  if (value == null) return { label: '—', tone: 'text-secondary' };
  if (value < 70) return { label: 'LOW', tone: 'glucose-low' };
  if (value > 180) return { label: 'HIGH', tone: 'glucose-high' };
  return { label: 'IN RANGE', tone: 'glucose-normal' };
};

export default function GlucoseHero({ value, trend, updatedAt, unit = 'mg/dL' }) {
  const status = STATUS(value);
  const trendIcon = TREND_ICON[trend] ?? 'trending_flat';
  return (
    <div className="bg-surface-raised border border-border-subtle rounded-xl p-5 flex flex-col gap-md relative overflow-hidden">
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl bg-${status.tone}/10`} />
      <div className="flex justify-between items-start">
        <span className="text-label-caps text-text-secondary uppercase tracking-widest">Current</span>
        <div className={`bg-${status.tone}/20 text-${status.tone} px-2 py-1 rounded border border-${status.tone}/30 flex items-center gap-1`}>
          <span className="material-symbols-outlined text-[14px]">check_circle</span>
          <span className="text-label-caps">{status.label}</span>
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-headline-hero text-text-primary">
          {value ?? '—'}
        </span>
        <span className="font-mono text-data-mono text-text-secondary">{unit}</span>
      </div>
      <div className="flex items-center gap-2 text-text-muted mt-auto pt-sm border-t border-border-subtle">
        <span className="material-symbols-outlined text-[14px]">sync</span>
        <span className="font-mono text-data-mono">{updatedAt ? `Updated ${updatedAt}` : 'No data yet'}</span>
        <span className={`material-symbols-outlined text-[16px] text-${status.tone} ml-auto icon-fill`}>{trendIcon}</span>
      </div>
    </div>
  );
}
```

**Step 1: Add safelist entries**

In `tailwind.config.js`, expand the safelist:

```js
safelist: [
  'bg-glucose-normal/10', 'bg-glucose-normal/20', 'bg-glucose-normal/30', 'text-glucose-normal', 'border-glucose-normal/30',
  'bg-glucose-high/10', 'bg-glucose-high/20', 'bg-glucose-high/30', 'text-glucose-high', 'border-glucose-high/30',
  'bg-glucose-low/10', 'bg-glucose-low/20', 'bg-glucose-low/30', 'text-glucose-low', 'border-glucose-low/30',
  'bg-chart-carbs/10', 'bg-chart-carbs/20', 'text-chart-carbs', 'border-chart-carbs/30',
  'bg-chart-insulin/10', 'bg-chart-insulin/20', 'text-chart-insulin', 'border-chart-insulin/30',
  'bg-text-secondary/20', 'text-text-secondary',
],
```

### Task 2.2: StatCard + ActivityRow

**Files:**
- Create: `src/components/v2/cards/StatCard.jsx`
- Create: `src/components/v2/cards/ActivityRow.jsx`

**StatCard:**

```jsx
export default function StatCard({ label, value, unit, unitTone = 'text-secondary' }) {
  return (
    <div className="bg-surface-raised border border-border-subtle rounded-xl p-5 flex flex-col justify-between hover:border-border-default transition-colors h-[100px]">
      <span className="text-label-caps text-text-secondary uppercase tracking-widest">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="font-mono text-stat-lg text-text-primary">{value ?? '—'}</span>
        {unit && <span className={`font-mono text-data-mono text-${unitTone}`}>{unit}</span>}
      </div>
    </div>
  );
}
```

**ActivityRow:**

```jsx
const TYPE_VISUALS = {
  meal: { icon: 'restaurant', tone: 'chart-carbs' },
  insulin: { icon: 'vaccines', tone: 'chart-insulin' },
  glucose: { icon: 'water_drop', tone: 'glucose-normal' },
};

export default function ActivityRow({ type, title, subtitle, value, unit, time }) {
  const v = TYPE_VISUALS[type] ?? TYPE_VISUALS.glucose;
  return (
    <div className="bg-surface-overlay border border-border-subtle rounded-lg p-3 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-full bg-${v.tone}/20 text-${v.tone} flex items-center justify-center`}>
        <span className="material-symbols-outlined">{v.icon}</span>
      </div>
      <div className="flex-1 flex flex-col">
        <span className="font-body text-body-base text-text-primary font-medium">{title}</span>
        {subtitle && <span className="font-mono text-[11px] text-text-secondary">{subtitle}</span>}
      </div>
      <div className="flex flex-col items-end">
        <span className={`font-mono text-data-mono text-${v.tone}`}>{value}{unit}</span>
        <span className="font-mono text-[11px] text-text-muted">{time}</span>
      </div>
    </div>
  );
}
```

### Task 2.3: GlucoseChart (recharts dark wrapper)

**Files:**
- Create: `src/components/v2/charts/GlucoseChart.jsx`

```jsx
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, ReferenceArea, Tooltip } from 'recharts';

export default function GlucoseChart({ readings, height = 160 }) {
  const data = (readings ?? []).map((r) => ({
    t: new Date(r.recorded_at).getTime(),
    value: r.value,
  }));

  return (
    <div className="bg-surface-raised border border-border-subtle rounded-xl p-5" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <ReferenceArea y1={70} y2={180} fill="#2DD4A8" fillOpacity={0.05} stroke="#2DD4A8" strokeOpacity={0.1} />
          <XAxis
            dataKey="t"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: 'numeric', hour12: true })}
            stroke="#4A6B60"
            tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
            axisLine={{ stroke: 'rgba(45,212,168,0.08)' }}
            tickLine={false}
          />
          <YAxis hide domain={[40, 250]} />
          <Tooltip
            contentStyle={{
              background: '#0D1B16',
              border: '1px solid rgba(45,212,168,0.15)',
              borderRadius: 8,
              fontFamily: 'JetBrains Mono',
              fontSize: 12,
              color: '#E8F5F0',
            }}
            labelFormatter={(t) => new Date(t).toLocaleString()}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2DD4A8"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#2DD4A8' }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### Task 2.4: EmptyState v2

**Files:**
- Create: `src/components/v2/ui/EmptyState.jsx`

```jsx
export default function EmptyState({ icon = 'database', title, description, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-xl px-md gap-md">
      <div className="w-16 h-16 rounded-full bg-surface-raised border border-border-subtle flex items-center justify-center text-text-muted">
        <span className="material-symbols-outlined text-[32px]">{icon}</span>
      </div>
      <h3 className="font-body text-title-lg text-text-primary">{title}</h3>
      {description && <p className="font-body text-body-base text-text-secondary max-w-xs">{description}</p>}
      {action && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-sm bg-primary text-on-primary px-md py-sm rounded-full font-body text-body-base font-medium active:scale-95 transition-transform"
        >
          {action}
        </button>
      )}
    </div>
  );
}
```

### Task 2.5: useDashboardData hook (TDD)

**Files:**
- Create: `src/hooks/useDashboardData.js`
- Create: `src/hooks/useDashboardData.test.js`

This hook fetches glucose/meals/insulin in parallel and returns `{ stats, recentActivity, loading, error, refresh }`. Tests verify the shape and the `refresh` behavior.

**Step 1: Write the failing test**

```js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import * as dataService from '../lib/dataService';
import { useDashboardData } from './useDashboardData';

vi.mock('../lib/dataService');

beforeEach(() => {
  vi.clearAllMocks();
  dataService.getGlucoseReadings.mockResolvedValue({ data: [{ value: 110, recorded_at: new Date().toISOString() }], error: null });
  dataService.getMeals.mockResolvedValue({ data: [], error: null });
  dataService.getInsulinDoses.mockResolvedValue({ data: [], error: null });
});

describe('useDashboardData', () => {
  it('fetches all three streams on mount', async () => {
    const { result } = renderHook(() => useDashboardData());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(dataService.getGlucoseReadings).toHaveBeenCalledTimes(1);
    expect(dataService.getMeals).toHaveBeenCalledTimes(1);
    expect(dataService.getInsulinDoses).toHaveBeenCalledTimes(1);
    expect(result.current.stats.currentGlucose).toBe(110);
  });

  it('exposes a refresh that re-fetches', async () => {
    const { result } = renderHook(() => useDashboardData());
    await waitFor(() => expect(result.current.loading).toBe(false));
    result.current.refresh();
    await waitFor(() => expect(dataService.getGlucoseReadings).toHaveBeenCalledTimes(2));
  });
});
```

**Step 2: Run test, expect failure**

```bash
npx vitest run src/hooks/useDashboardData.test.js
```

Expected: FAIL.

**Step 3: Write the hook**

```js
import { useState, useCallback, useEffect } from 'react';
import { getGlucoseReadings, getMeals, getInsulinDoses, calculateStats } from '../lib/dataService';

export function useDashboardData() {
  const [state, setState] = useState({ loading: true, error: null, stats: null, glucose: [], meals: [], insulin: [] });
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));
    Promise.all([getGlucoseReadings(24), getMeals(50), getInsulinDoses(50)])
      .then(([g, m, i]) => {
        if (cancelled) return;
        const glucose = g.data ?? [];
        const meals = m.data ?? [];
        const insulin = i.data ?? [];
        setState({
          loading: false,
          error: g.error ?? m.error ?? i.error ?? null,
          stats: calculateStats(glucose, meals, insulin),
          glucose,
          meals,
          insulin,
        });
      })
      .catch((err) => { if (!cancelled) setState((s) => ({ ...s, loading: false, error: err })); });
    return () => { cancelled = true; };
  }, [refreshKey]);

  return { ...state, refresh };
}
```

**Step 4: Run tests, expect pass**

```bash
npx vitest run src/hooks/useDashboardData.test.js
```

Expected: 2 passed.

### Task 2.6: Home screen

**Files:**
- Create: `src/components/v2/screens/Home.jsx`

```jsx
import { useNavigate } from 'react-router-dom';
import GlucoseHero from '../cards/GlucoseHero';
import StatCard from '../cards/StatCard';
import ActivityRow from '../cards/ActivityRow';
import GlucoseChart from '../charts/GlucoseChart';
import EmptyState from '../ui/EmptyState';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { useAuth } from '../../../contexts/AuthContext';

function relTime(iso) {
  if (!iso) return null;
  const diff = (Date.now() - new Date(iso).getTime()) / 60000;
  if (diff < 1) return 'just now';
  if (diff < 60) return `${Math.floor(diff)}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { loading, stats, glucose, meals, insulin } = useDashboardData();

  if (loading) return <div className="p-md text-text-secondary">Loading…</div>;

  const lastReading = glucose[glucose.length - 1];
  const recent = [
    ...meals.slice(0, 2).map((m) => ({
      key: `m-${m.id}`, type: 'meal', title: m.meal_type ?? 'Meal',
      subtitle: m.food_name, value: m.carbs ?? 0, unit: 'g',
      time: new Date(m.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })),
    ...insulin.slice(0, 2).map((i) => ({
      key: `i-${i.id}`, type: 'insulin', title: 'Bolus',
      subtitle: i.insulin_type ?? 'Rapid-acting', value: i.units ?? 0, unit: 'u',
      time: new Date(i.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })),
  ];

  const isEmpty = !lastReading && meals.length === 0 && insulin.length === 0;

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-xs">
        <h1 className="font-body text-title-lg text-text-primary">Good {greeting()}, {user?.email?.split('@')[0] ?? 'friend'}</h1>
        <p className="font-body text-body-base text-text-secondary">Here is your daily snapshot.</p>
      </div>

      {isEmpty ? (
        <EmptyState
          icon="data_object"
          title="No data yet"
          description="Log your first reading to see your dashboard come to life."
          action="Log a reading"
          onAction={() => navigate('/dashboard/glucose/log')}
        />
      ) : (
        <>
          <GlucoseHero
            value={stats?.currentGlucose}
            trend={stats?.glucoseTrend}
            updatedAt={relTime(lastReading?.recorded_at)}
          />

          <div className="grid grid-cols-2 gap-sm">
            <StatCard label="Today's Carbs" value={stats?.carbsToday} unit="g" unitTone="chart-carbs" />
            <StatCard label="Last Insulin" value={insulin[0]?.units} unit="u" unitTone="chart-insulin" />
            <StatCard label="Time in Range" value={stats?.timeInRange} unit="%" />
            <StatCard label="A1C Est." value={stats?.estimatedA1C} unit="%" />
          </div>

          <div className="flex flex-col gap-sm">
            <div className="flex justify-between items-end">
              <h2 className="font-body text-[18px] font-semibold text-text-primary">24h Trend</h2>
              <button onClick={() => navigate('/dashboard/glucose')} className="font-mono text-data-mono text-primary flex items-center gap-1">
                Details <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
            <GlucoseChart readings={glucose} />
          </div>

          {recent.length > 0 && (
            <div className="flex flex-col gap-sm">
              <h2 className="font-body text-[18px] font-semibold text-text-primary">Recent Activity</h2>
              <div className="flex flex-col gap-2">
                {recent.map((r) => <ActivityRow {...r} key={r.key} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}
```

### Task 2.7: GlucoseLogSheet, MealLogSheet, InsulinLogSheet

**Files:**
- Create: `src/components/v2/sheets/GlucoseLogSheet.jsx`
- Create: `src/components/v2/sheets/MealLogSheet.jsx`
- Create: `src/components/v2/sheets/InsulinLogSheet.jsx`
- Create: `src/components/v2/ui/Field.jsx` (shared form input)

**Field primitive:**

```jsx
export default function Field({ label, unit, children }) {
  return (
    <label className="flex flex-col gap-xs">
      <span className="text-label-caps text-text-secondary uppercase tracking-widest">{label}{unit && <span className="ml-1 text-text-muted">({unit})</span>}</span>
      {children}
    </label>
  );
}

export const inputCls = 'bg-surface-input border border-border-subtle rounded-lg px-md py-sm font-mono text-body-base text-text-primary focus:outline-none focus:border-primary transition-colors';
```

**GlucoseLogSheet:**

```jsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sheet from '../ui/Sheet';
import Field, { inputCls } from '../ui/Field';
import { addGlucoseReading } from '../../../lib/dataService';

export default function GlucoseLogSheet() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('mg/dL');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const close = () => navigate(state?.background ?? '/dashboard');

  async function submit(e) {
    e.preventDefault();
    if (!value) return;
    setSaving(true); setError(null);
    const { error } = await addGlucoseReading({
      value: Number(value),
      unit,
      recorded_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) { setError(error.message ?? 'Save failed — check connection.'); return; }
    close();
  }

  return (
    <Sheet open onOpenChange={(o) => { if (!o) close(); }} title="Log glucose reading">
      <form onSubmit={submit} className="flex flex-col gap-md">
        <Field label="Reading" unit={unit}>
          <input
            type="number"
            inputMode="decimal"
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. 108"
            className={inputCls}
          />
        </Field>
        <Field label="Unit">
          <div className="flex gap-sm">
            {['mg/dL', 'mmol/L'].map((u) => (
              <button
                type="button"
                key={u}
                onClick={() => setUnit(u)}
                className={`flex-1 py-sm rounded-lg border text-data-mono font-mono ${unit === u ? 'bg-primary/20 border-primary text-primary' : 'bg-surface-overlay border-border-subtle text-text-secondary'}`}
              >{u}</button>
            ))}
          </div>
        </Field>
        {error && <p className="text-glucose-low text-body-base">{error}</p>}
        <button
          type="submit"
          disabled={!value || saving}
          className="mt-sm bg-primary text-on-primary py-md rounded-full font-medium disabled:opacity-50 active:scale-[0.98] transition-transform"
        >{saving ? 'Saving…' : 'Save reading'}</button>
      </form>
    </Sheet>
  );
}
```

**MealLogSheet:**

```jsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sheet from '../ui/Sheet';
import Field, { inputCls } from '../ui/Field';
import { addMeal } from '../../../lib/dataService';

const TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function MealLogSheet() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [form, setForm] = useState({ meal_type: 'breakfast', food_name: '', carbs: '', protein: '', fat: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const close = () => navigate(state?.background ?? '/dashboard');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setSaving(true); setError(null);
    const { error } = await addMeal({
      ...form,
      carbs: Number(form.carbs) || 0,
      protein: form.protein ? Number(form.protein) : null,
      fat: form.fat ? Number(form.fat) : null,
      logged_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) { setError(error.message ?? 'Save failed.'); return; }
    close();
  }

  return (
    <Sheet open onOpenChange={(o) => { if (!o) close(); }} title="Log meal">
      <form onSubmit={submit} className="flex flex-col gap-md">
        <Field label="Type">
          <div className="grid grid-cols-4 gap-sm">
            {TYPES.map((t) => (
              <button
                type="button" key={t} onClick={() => setForm({ ...form, meal_type: t })}
                className={`py-sm rounded-lg border text-data-mono font-mono capitalize ${form.meal_type === t ? 'bg-chart-carbs/20 border-chart-carbs text-chart-carbs' : 'bg-surface-overlay border-border-subtle text-text-secondary'}`}
              >{t}</button>
            ))}
          </div>
        </Field>
        <Field label="What did you eat?">
          <input type="text" value={form.food_name} onChange={set('food_name')} placeholder="e.g. Oatmeal & berries" className={inputCls} />
        </Field>
        <Field label="Carbs" unit="g">
          <input type="number" inputMode="decimal" autoFocus value={form.carbs} onChange={set('carbs')} className={inputCls} />
        </Field>
        {error && <p className="text-glucose-low text-body-base">{error}</p>}
        <button type="submit" disabled={saving} className="mt-sm bg-primary text-on-primary py-md rounded-full font-medium disabled:opacity-50 active:scale-[0.98] transition-transform">
          {saving ? 'Saving…' : 'Save meal'}
        </button>
      </form>
    </Sheet>
  );
}
```

**InsulinLogSheet:** (analogous to MealLogSheet, fields: insulin_type, brand, units, injection_site, notes)

```jsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sheet from '../ui/Sheet';
import Field, { inputCls } from '../ui/Field';
import { addInsulinDose } from '../../../lib/dataService';

const TYPES = ['bolus', 'basal', 'correction'];

export default function InsulinLogSheet() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [form, setForm] = useState({ insulin_type: 'bolus', brand: '', units: '', injection_site: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const close = () => navigate(state?.background ?? '/dashboard');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setSaving(true); setError(null);
    const { error } = await addInsulinDose({
      ...form,
      units: Number(form.units) || 0,
      logged_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) { setError(error.message ?? 'Save failed.'); return; }
    close();
  }

  return (
    <Sheet open onOpenChange={(o) => { if (!o) close(); }} title="Log insulin dose">
      <form onSubmit={submit} className="flex flex-col gap-md">
        <Field label="Type">
          <div className="grid grid-cols-3 gap-sm">
            {TYPES.map((t) => (
              <button
                type="button" key={t} onClick={() => setForm({ ...form, insulin_type: t })}
                className={`py-sm rounded-lg border text-data-mono font-mono capitalize ${form.insulin_type === t ? 'bg-chart-insulin/20 border-chart-insulin text-chart-insulin' : 'bg-surface-overlay border-border-subtle text-text-secondary'}`}
              >{t}</button>
            ))}
          </div>
        </Field>
        <Field label="Units" unit="u">
          <input type="number" inputMode="decimal" step="0.5" autoFocus value={form.units} onChange={set('units')} className={inputCls} />
        </Field>
        <Field label="Brand (optional)">
          <input type="text" value={form.brand} onChange={set('brand')} placeholder="e.g. Humalog" className={inputCls} />
        </Field>
        {error && <p className="text-glucose-low text-body-base">{error}</p>}
        <button type="submit" disabled={saving} className="mt-sm bg-primary text-on-primary py-md rounded-full font-medium disabled:opacity-50 active:scale-[0.98] transition-transform">
          {saving ? 'Saving…' : 'Save dose'}
        </button>
      </form>
    </Sheet>
  );
}
```

### Task 2.8: Wire up routes — cut over to Home + log sheets

**Files:**
- Modify: `src/App.jsx`

Replace the dashboard routes block:

```jsx
<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
  <Route index element={<Home />} />
  <Route path="glucose" element={<GlucoseTrendsLegacy />} />
  <Route path="meals" element={<MealLogLegacy />} />
  <Route path="more" element={<MoreLegacy />} />
  <Route path="glucose/log" element={<GlucoseLogSheet />} />
  <Route path="meals/log" element={<MealLogSheet />} />
  <Route path="insulin/log" element={<InsulinLogSheet />} />
</Route>
```

Imports added at the top:

```jsx
import Home from './components/v2/screens/Home';
import GlucoseLogSheet from './components/v2/sheets/GlucoseLogSheet';
import MealLogSheet from './components/v2/sheets/MealLogSheet';
import InsulinLogSheet from './components/v2/sheets/InsulinLogSheet';
```

### Task 2.9: Verify Phase 2 + Commit

**Step 1: Run tests**

```bash
npm test
```

Expected: all tests pass (Sheet + useDashboardData).

**Step 2: Run dev + manual test list**

```bash
npm run dev
```

- [ ] `/dashboard` shows the new Home with greeting + hero + 2x2 stats + chart + recent activity.
- [ ] If logged in to a fresh account: `EmptyState` shows.
- [ ] Tap FAB → action sheet → Glucose → form.
- [ ] Save a glucose reading → sheet closes → home updates after a refresh (or manually nav).
- [ ] Same for meal + insulin.
- [ ] Form validation: empty units button is disabled.
- [ ] Manifest shortcut URLs still work (e.g., open `/dashboard/glucose/log` directly).

**Step 3: Commit**

```bash
git add src/components/v2 src/hooks/useDashboardData.js src/hooks/useDashboardData.test.js src/App.jsx tailwind.config.js
git commit -m "$(cat <<'EOF'
feat(v2): home screen + log sheets wired to Supabase

- Home renders Stitch overview design with real data via
  useDashboardData hook (parallel fetches of glucose, meals, insulin).
- GlucoseHero, StatCard, ActivityRow cards.
- GlucoseChart wraps recharts with dark theme + reference area for
  in-range zone.
- EmptyState v2 for fresh accounts.
- GlucoseLogSheet, MealLogSheet, InsulinLogSheet save to Supabase
  via addGlucoseReading / addMeal / addInsulinDose; close on success;
  inline error message on failure.
- Field primitive shared by all log sheets.
- /dashboard cut over from old Overview to v2 Home.

Tests: 6 passing (Sheet, useDashboardData).

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 3 — Glucose Trends screen

**Outcome:** `/dashboard/glucose` shows the Stitch Glucose Trends design with real data; old `GlucoseTrends` no longer mounted.

### Task 3.1: TimeInRangeBar

**Files:**
- Create: `src/components/v2/charts/TimeInRangeBar.jsx`

```jsx
const ROWS = [
  { key: 'high', label: 'HIGH', tone: 'glucose-high' },
  { key: 'inRange', label: 'TARGET', tone: 'glucose-normal' },
  { key: 'low', label: 'LOW', tone: 'glucose-low' },
];

export default function TimeInRangeBar({ readings }) {
  const total = readings?.length ?? 0;
  const counts = total === 0 ? { high: 0, inRange: 0, low: 0 } : {
    high: readings.filter((r) => r.value > 180).length,
    inRange: readings.filter((r) => r.value >= 70 && r.value <= 180).length,
    low: readings.filter((r) => r.value < 70).length,
  };
  const pct = (n) => (total === 0 ? 0 : Math.round((n / total) * 100));

  return (
    <div className="bg-surface-raised border border-border-subtle rounded-xl p-5 flex flex-col gap-md">
      <h3 className="font-body text-title-lg text-text-primary">Time in Range</h3>
      <div className="flex flex-col gap-sm">
        {ROWS.map((r) => {
          const v = pct(counts[r.key]);
          return (
            <div key={r.key} className="flex items-center gap-md">
              <span className={`w-12 text-label-caps text-${r.tone} uppercase tracking-widest`}>{r.label}</span>
              <div className="flex-1 h-2 bg-surface-input rounded-full overflow-hidden">
                <div className={`h-full bg-${r.tone} rounded-full transition-[width] duration-300 ease-out-strong`} style={{ width: `${v}%` }} />
              </div>
              <span className="w-10 text-right font-mono text-data-mono text-text-secondary">{v}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### Task 3.2: Glucose screen

**Files:**
- Create: `src/components/v2/screens/Glucose.jsx`

```jsx
import { useState, useEffect } from 'react';
import { getGlucoseReadings, calculateStats } from '../../../lib/dataService';
import GlucoseChart from '../charts/GlucoseChart';
import TimeInRangeBar from '../charts/TimeInRangeBar';
import StatCard from '../cards/StatCard';
import ActivityRow from '../cards/ActivityRow';
import EmptyState from '../ui/EmptyState';
import { useNavigate } from 'react-router-dom';

const RANGES = [
  { key: '24H', hours: 24 },
  { key: '7D', hours: 24 * 7 },
  { key: '30D', hours: 24 * 30 },
  { key: '90D', hours: 24 * 90 },
];

export default function Glucose() {
  const navigate = useNavigate();
  const [range, setRange] = useState(RANGES[1]);
  const [readings, setReadings] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setReadings(null);
    getGlucoseReadings(range.hours).then(({ data, error }) => {
      if (cancelled) return;
      setReadings(data ?? []);
      setError(error);
    });
    return () => { cancelled = true; };
  }, [range]);

  if (readings === null) return <div className="p-md text-text-secondary">Loading…</div>;
  if (readings.length === 0) {
    return (
      <EmptyState
        icon="show_chart"
        title="No glucose data in this range"
        description="Try a different time range or log your first reading."
        action="Log a reading"
        onAction={() => navigate('/dashboard/glucose/log')}
      />
    );
  }

  const stats = calculateStats(readings, [], []);

  return (
    <div className="flex flex-col gap-lg">
      <div className="grid grid-cols-4 gap-sm bg-surface-input rounded-lg p-1">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r)}
            className={`py-sm rounded text-data-mono font-mono ${range.key === r.key ? 'bg-primary text-on-primary' : 'text-text-secondary'}`}
          >{r.key}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-sm">
        <StatCard label="Avg Glucose" value={stats.avgGlucose} unit="mg/dL" />
        <StatCard label="GMI" value={stats.estimatedA1C} unit="%" />
      </div>

      <div className="flex flex-col gap-sm">
        <div className="flex justify-between items-end">
          <h2 className="font-body text-[18px] font-semibold text-text-primary">Trends</h2>
          <span className="font-mono text-data-mono text-text-muted">Last {range.key}</span>
        </div>
        <GlucoseChart readings={readings} height={220} />
      </div>

      <TimeInRangeBar readings={readings} />

      <div className="flex flex-col gap-sm">
        <h2 className="font-body text-[18px] font-semibold text-text-primary">Recent Logs</h2>
        <div className="flex flex-col gap-2">
          {[...readings].reverse().slice(0, 5).map((r) => (
            <ActivityRow
              key={r.id}
              type="glucose"
              title={r.notes ?? 'Reading'}
              subtitle={new Date(r.recorded_at).toLocaleString()}
              value={r.value}
              unit={r.unit ?? 'mg/dL'}
              time=""
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Task 3.3: Wire up + verify + commit

**Step 1: Update App.jsx**

```jsx
import Glucose from './components/v2/screens/Glucose';
// ...
<Route path="glucose" element={<Glucose />} />
```

**Step 2: Manual test list (npm run dev)**

- [ ] `/dashboard/glucose` renders new design.
- [ ] Range tabs switch data.
- [ ] Empty state shows for ranges with no data.
- [ ] Time in Range bar percentages sum to 100.
- [ ] Recent Logs lists last 5 readings newest first.

**Step 3: Commit**

```bash
git add src/components/v2 src/App.jsx
git commit -m "feat(v2): glucose trends screen with time-range tabs"
```

---

## Phase 4 — Meals, More, Insulin history, Settings, Coming Soon

**Outcome:** every nav slot is live; deferred analytics show as `ComingSoonCard` rows under More.

### Task 4.1: ComingSoonCard

**Files:**
- Create: `src/components/v2/cards/ComingSoonCard.jsx`

```jsx
export default function ComingSoonCard({ icon, label, description }) {
  return (
    <div className="flex items-center gap-md p-md bg-surface-overlay/40 border border-border-subtle/50 rounded-lg opacity-60 cursor-not-allowed">
      <div className="w-10 h-10 rounded-full bg-surface-raised text-text-muted flex items-center justify-center">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="flex-1 flex flex-col">
        <span className="font-body text-body-base text-text-primary font-medium">{label}</span>
        {description && <span className="font-mono text-[11px] text-text-muted">{description}</span>}
      </div>
      <span className="text-label-caps text-text-muted bg-surface-raised border border-border-subtle px-2 py-0.5 rounded-full uppercase tracking-widest">Coming Soon</span>
    </div>
  );
}
```

### Task 4.2: Meals screen

**Files:**
- Create: `src/components/v2/screens/Meals.jsx`

```jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMeals } from '../../../lib/dataService';
import ActivityRow from '../cards/ActivityRow';
import EmptyState from '../ui/EmptyState';

export default function Meals() {
  const navigate = useNavigate();
  const [meals, setMeals] = useState(null);

  useEffect(() => {
    getMeals(50).then(({ data }) => setMeals(data ?? []));
  }, []);

  if (meals === null) return <div className="p-md text-text-secondary">Loading…</div>;
  if (meals.length === 0) {
    return (
      <EmptyState
        icon="restaurant"
        title="No meals logged"
        description="Track what you eat to see how it affects your glucose."
        action="Log a meal"
        onAction={() => navigate('/dashboard/meals/log')}
      />
    );
  }

  // Group by day
  const groups = meals.reduce((acc, m) => {
    const day = new Date(m.logged_at).toDateString();
    (acc[day] = acc[day] ?? []).push(m);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-lg">
      {Object.entries(groups).map(([day, items]) => (
        <div key={day} className="flex flex-col gap-sm">
          <h3 className="text-label-caps text-text-secondary uppercase tracking-widest">{formatDay(day)}</h3>
          <div className="flex flex-col gap-2">
            {items.map((m) => (
              <ActivityRow
                key={m.id}
                type="meal"
                title={m.meal_type ?? 'Meal'}
                subtitle={m.food_name}
                value={m.carbs ?? 0}
                unit="g"
                time={new Date(m.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function formatDay(s) {
  const d = new Date(s);
  const today = new Date(); today.setHours(0,0,0,0);
  const dDay = new Date(d); dDay.setHours(0,0,0,0);
  const diffDays = Math.round((today - dDay) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}
```

### Task 4.3: More + sub-screens

**Files:**
- Create: `src/components/v2/screens/More.jsx`
- Create: `src/components/v2/screens/MoreInsulin.jsx`
- Create: `src/components/v2/screens/MoreSettings.jsx`

**More.jsx:**

```jsx
import { Link } from 'react-router-dom';
import ComingSoonCard from '../cards/ComingSoonCard';

const live = [
  { to: 'insulin', icon: 'vaccines', label: 'Insulin', description: 'History' },
  { to: 'settings', icon: 'settings', label: 'Settings', description: 'Targets, ICR, preferences' },
];

const soon = [
  { icon: 'science', label: 'ICR Predictor', description: 'Insulin-to-carb ratio' },
  { icon: 'percent', label: 'A1C Estimator', description: 'From glucose data' },
  { icon: 'auto_awesome', label: 'Pattern Alerts', description: 'Insights & predictions' },
  { icon: 'forum', label: 'AI Chat', description: 'Ask questions about your data' },
  { icon: 'medication', label: 'AI Dose Assistant', description: 'Suggested doses' },
  { icon: 'sync', label: 'Dexcom Import', description: 'Pull readings from Dexcom' },
  { icon: 'tune', label: 'Correction Factor', description: 'Calculator' },
];

export default function More() {
  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-sm">
        <h3 className="text-label-caps text-text-secondary uppercase tracking-widest">Tools</h3>
        <div className="flex flex-col gap-2">
          {live.map((it) => (
            <Link
              key={it.to} to={it.to}
              className="flex items-center gap-md p-md bg-surface-overlay border border-border-subtle rounded-lg active:scale-[0.97] transition-transform"
            >
              <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined">{it.icon}</span>
              </div>
              <div className="flex-1">
                <div className="font-body text-body-base text-text-primary">{it.label}</div>
                <div className="font-mono text-[11px] text-text-secondary">{it.description}</div>
              </div>
              <span className="material-symbols-outlined text-text-muted">chevron_right</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-sm">
        <h3 className="text-label-caps text-text-secondary uppercase tracking-widest">On the roadmap</h3>
        <div className="flex flex-col gap-2">
          {soon.map((it) => <ComingSoonCard key={it.label} {...it} />)}
        </div>
      </div>
    </div>
  );
}
```

**MoreInsulin.jsx:** mirror of `Meals.jsx` but for `insulin_doses` (use `getInsulinDoses`).

**MoreSettings.jsx:** restyled wrapper around the existing settings logic. Use Tailwind classes; keep the data flow from `getUserSettings()` / `updateUserSettings()`. Reference the existing `src/components/dashboard/Settings.jsx` for the field set, but rebuild the layout. Group into "Glucose targets", "Insulin", "Preferences" sections, each a `bg-surface-raised` card with `Field` inputs.

### Task 4.4: Wire up + commit

**Step 1: Update App.jsx**

```jsx
import Meals from './components/v2/screens/Meals';
import More from './components/v2/screens/More';
import MoreInsulin from './components/v2/screens/MoreInsulin';
import MoreSettings from './components/v2/screens/MoreSettings';
// ...
<Route path="meals" element={<Meals />} />
<Route path="more" element={<More />} />
<Route path="more/insulin" element={<MoreInsulin />} />
<Route path="more/settings" element={<MoreSettings />} />
```

Remove the legacy imports for `MealLogLegacy` and `MoreLegacy` from `App.jsx`.

**Step 2: Manual test list**

- [ ] `/dashboard/meals` shows day-grouped history.
- [ ] `/dashboard/more` shows live tools + Coming Soon list.
- [ ] `/dashboard/more/insulin` shows insulin history.
- [ ] `/dashboard/more/settings` saves and reloads.
- [ ] Coming Soon cards have lower opacity, no tap action.

**Step 3: Commit**

```bash
git add src/components/v2 src/App.jsx
git commit -m "feat(v2): meals, more, insulin history, settings + coming soon cards"
```

---

## Phase 5 — PWA shell + offline + iOS install

**Outcome:** App installs on iOS and Android home screens. Lighthouse PWA > 90. Cached-read dashboard works in airplane mode after one online use. Writes show offline error toast.

### Task 5.1: useOnline hook (TDD)

**Files:**
- Create: `src/hooks/useOnline.js`
- Create: `src/hooks/useOnline.test.js`

**Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnline } from './useOnline';

describe('useOnline', () => {
  it('returns navigator.onLine on mount', () => {
    const { result } = renderHook(() => useOnline());
    expect(typeof result.current).toBe('boolean');
  });

  it('updates on offline event', () => {
    const { result } = renderHook(() => useOnline());
    act(() => { window.dispatchEvent(new Event('offline')); });
    expect(result.current).toBe(false);
    act(() => { window.dispatchEvent(new Event('online')); });
    expect(result.current).toBe(true);
  });
});
```

**Step 2: Run, expect fail.**

**Step 3: Write hook**

```js
import { useEffect, useState } from 'react';

export function useOnline() {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, []);
  return online;
}
```

**Step 4: Run, expect pass.**

### Task 5.2: Manifest + icon placeholders

**Files:**
- Create: `public/manifest.json`
- Create: `public/icons/icon-192.png`, `icon-512.png`, `icon-maskable-192.png`, `icon-maskable-512.png`, `icon-apple-180.png`, `shortcut-glucose.png`, `shortcut-meal.png`, `shortcut-insulin.png` (placeholders unless Track B has shipped real icons)

**Step 1: Manifest**

Copy the manifest JSON from `docs/design/pwa-design-spec.md` § 2.1 into `public/manifest.json`.

**Step 2: Placeholder icons**

If Track B (nano-banana) hasn't delivered, generate solid-color PNG placeholders:

```bash
# Use any image tool, or a quick HTML canvas trick:
# Create with a small node script or just commit a neutral mint-on-dark PNG
```

Simplest: use the existing `public/favicon.svg` rasterized at the required sizes. Or temporarily commit 8 identical 1×1 mint PNGs and replace when Track B lands. **Do not block Phase 5 on art.**

**Step 3: Reference manifest from index.html**

Add inside `<head>` of `index.html`:

```html
<link rel="manifest" href="/manifest.json">
<link rel="apple-touch-icon" href="/icons/icon-apple-180.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Betatrace">
```

### Task 5.3: vite-plugin-pwa setup

**Files:**
- Modify: `vite.config.js`

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: false, // we manage manifest.json manually
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-v1',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: ({ url, request }) =>
              url.hostname.endsWith('.supabase.co') &&
              request.method === 'GET' &&
              /\/rest\/v1\/(glucose_readings|meals|insulin_doses|user_settings)/.test(url.pathname),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'data-reads-v1',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // All other Supabase requests (writes, auth) → NetworkOnly is the default
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
  },
});
```

### Task 5.4: Toast component + offline indicator

**Files:**
- Create: `src/components/v2/ui/Toast.jsx`
- Modify: `src/pages/Dashboard.jsx` (mount the offline toast)

**Toast.jsx:**

```jsx
import { useEffect, useState } from 'react';

export default function Toast({ children, tone = 'info', onDismiss, duration = 4000 }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (!duration) return;
    const t = setTimeout(() => { setVisible(false); onDismiss?.(); }, duration);
    return () => clearTimeout(t);
  }, [duration, onDismiss]);
  if (!visible) return null;
  return (
    <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-md py-sm rounded-full border ${TONE[tone]} font-body text-body-base shadow-lg animate-[fadeIn_180ms_var(--ease-out)]`}>
      {children}
    </div>
  );
}

const TONE = {
  info: 'bg-surface-raised border-border-default text-text-primary',
  warn: 'bg-glucose-high/10 border-glucose-high/30 text-glucose-high',
  error: 'bg-glucose-low/10 border-glucose-low/30 text-glucose-low',
};
```

**Dashboard.jsx — mount offline toast:**

Add to the imports:

```jsx
import Toast from '../components/v2/ui/Toast';
import { useOnline } from '../hooks/useOnline';
```

Inside the component:

```jsx
const online = useOnline();
// ...
{!online && <Toast tone="warn" duration={0}>You're offline — saves will fail until you reconnect.</Toast>}
```

### Task 5.5: Disable submit + show inline message in log sheets when offline

**Files:**
- Modify: `src/components/v2/sheets/GlucoseLogSheet.jsx`, `MealLogSheet.jsx`, `InsulinLogSheet.jsx`

In each sheet, import `useOnline` and add to the submit button:

```jsx
import { useOnline } from '../../../hooks/useOnline';
// ...
const online = useOnline();
// ...
<button type="submit" disabled={!online || saving || ...} ...>
  {!online ? 'Offline — try later' : (saving ? 'Saving…' : 'Save reading')}
</button>
```

### Task 5.6: Auth signOut clears data cache

**Files:**
- Modify: `src/contexts/AuthContext.jsx` (whatever its current path is)

**Step 1: Find signOut in AuthContext**

```bash
grep -n "signOut\|signout" src/contexts/AuthContext.jsx
```

**Step 2: Add cache clear**

In the `signOut` function, before the supabase call:

```js
if ('caches' in window) {
  await caches.delete('data-reads-v1');
}
```

This prevents user-A's cached reads from being visible to user-B on a shared device.

### Task 5.7: iOS A2HS prompt

**Files:**
- Create: `src/components/v2/ui/IOSInstallPrompt.jsx`
- Modify: `src/pages/Dashboard.jsx`

**IOSInstallPrompt.jsx:**

```jsx
import { useEffect, useState } from 'react';

const KEY = 'iosInstallPromptShown';

export default function IOSInstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(KEY)) return;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.navigator.standalone;
    if (isIOS && !isStandalone) {
      const t = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(t);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 max-w-[90%] bg-surface-raised border border-border-default rounded-xl p-md shadow-xl flex items-start gap-md">
      <span className="material-symbols-outlined text-primary text-[28px]">ios_share</span>
      <div className="flex-1 flex flex-col gap-xs">
        <div className="font-body text-body-base text-text-primary font-medium">Install Betatrace</div>
        <div className="font-body text-[13px] text-text-secondary">Tap <strong>Share</strong> → <strong>Add to Home Screen</strong> for the full app.</div>
      </div>
      <button
        onClick={() => { localStorage.setItem(KEY, '1'); setShow(false); }}
        aria-label="Dismiss"
        className="text-text-muted active:scale-95"
      >
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  );
}
```

Mount in Dashboard.jsx alongside Toast:

```jsx
<IOSInstallPrompt />
```

### Task 5.8: Build + Lighthouse audit + commit

**Step 1: Build production bundle**

```bash
npm run build
npm run preview
```

Open `http://localhost:4173`.

**Step 2: Lighthouse audit**

Open Chrome DevTools → Lighthouse → run "Mobile" + "Progressive Web App" + "Performance".

Targets:
- PWA score: > 90 (install criteria met).
- No "manifest missing" or "service worker missing" warnings.

**Step 3: Real-device test**

Get the dev server LAN URL: `npm run preview -- --host`. On a real iPhone:
- Open in Safari, sign in.
- Use the app for a minute; log a reading.
- Tap Share → Add to Home Screen. Confirm icon and name look right.
- Open the icon — app opens standalone, no Safari chrome.
- Enable airplane mode, reopen — dashboard still renders with cached data.
- Try to log a reading in airplane mode — submit button shows "Offline — try later".

**Step 4: Commit**

```bash
git add public/manifest.json public/icons src/hooks/useOnline.js src/hooks/useOnline.test.js src/components/v2/ui/Toast.jsx src/components/v2/ui/IOSInstallPrompt.jsx src/contexts/AuthContext.jsx src/pages/Dashboard.jsx index.html vite.config.js src/components/v2/sheets/
git commit -m "$(cat <<'EOF'
feat(pwa): manifest, service worker, offline reads, iOS install prompt

- Manifest with shortcuts to /dashboard/{glucose,meals,insulin}/log.
- vite-plugin-pwa with workbox: precache app shell; StaleWhileRevalidate
  on Supabase REST GETs for glucose/meals/insulin/settings; NetworkOnly
  on writes (default).
- useOnline hook drives offline toast on Dashboard + disables submit
  buttons in log sheets with inline "Offline — try later" message.
- Form values retained when submit is blocked or fails, so users can
  retry on reconnect.
- iOS A2HS prompt: detects iOS Safari + non-standalone, shows one-time
  banner with Share→Add-to-Home instructions.
- AuthContext.signOut clears 'data-reads-v1' cache to prevent
  cross-user leakage on shared devices.

Verified: Lighthouse PWA > 90; cold-start works on iOS in airplane mode
after one online use.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 6 — Cleanup

**Outcome:** Old `src/components/dashboard/` and unused deps gone. Diff is clean.

### Task 6.1: Verify nothing imports from `src/components/dashboard/`

**Step 1: Audit**

```bash
grep -rn "components/dashboard" src/ --include='*.jsx' --include='*.js' | grep -v "^src/components/dashboard"
```

Expected: empty (no v2 file should import from dashboard/).

If any results: fix those imports first. Likely candidates: `App.jsx` Legacy wrappers (delete), `Landing.jsx` (unlikely but check).

### Task 6.2: Delete old components

**Step 1: Remove**

```bash
rm -rf src/components/dashboard
rm src/data/mockData.js
```

**Step 2: Remove dataService.js mockData fallbacks**

Edit `src/lib/dataService.js`: remove the `import { mockGlucoseReadings, mockMeals, mockDoses, mockSettings } from './mockData'` line and the `if (!user) return { data: mockX, ... }` branches in each get function. Replace with returning `{ data: [], error: null }` for the no-user case (or move guest-mode logic elsewhere if needed).

**Step 3: Remove `src/data/` directory if empty**

```bash
rmdir src/data 2>/dev/null
```

**Step 4: Remove old Legacy wrappers from App.jsx**

Delete the inline `OverviewLegacy`, `GlucoseLegacy`, `MealLogLegacy`, `MoreLegacy`, `*Placeholder` components and their imports.

### Task 6.3: Remove unused deps

**Step 1: Check lucide-react usage**

```bash
grep -rn "lucide-react" src/ --include='*.jsx'
```

If empty: `npm uninstall lucide-react`.

**Step 2: Check Sidebar removal**

`src/components/dashboard/Sidebar.jsx` is gone with the directory; no separate action.

**Step 3: Drop Playfair from index.html**

Already done in Task 0.6. Verify:

```bash
grep -i "playfair" index.html
```

Expected: empty.

**Step 4: Drop unused styles from src/index.css**

Manually scan `src/index.css` for class names that only the old `dashboard/` components used. Remove. Tailwind handles the rest.

### Task 6.4: Final verification + commit

**Step 1: Run all tests**

```bash
npm test
```

Expected: all green.

**Step 2: Build**

```bash
npm run build
```

Expected: passes; no warnings about missing imports.

**Step 3: Smoke test app**

```bash
npm run preview
```

Click through every nav slot. Log one of each entry. Sign out, sign back in. Verify everything still works.

**Step 4: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
chore(v2): remove legacy dashboard, mockData, lucide-react

- Delete src/components/dashboard/* and Sidebar.
- Delete src/data/mockData.js; dataService no longer falls back to
  mock data for unauthenticated users (returns empty arrays).
- Drop lucide-react dependency (replaced by Material Symbols).
- Drop Playfair Display from index.html.
- Remove now-unused styles from src/index.css.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

### Task 6.5: PR + merge

**Step 1: Push**

```bash
git push -u origin feature/pwa-ambient
```

**Step 2: Open PR**

```bash
gh pr create --base feature/core-functionality --title "feat: PWA — Ambient design + hybrid offline" --body "$(cat <<'EOF'
## Summary
- Mobile-first responsive PWA matching Stitch Ambient design.
- Hybrid offline: app shell precache + StaleWhileRevalidate on read APIs + NetworkOnly on writes.
- v2 component library replaces old desktop-sidebar dashboard.
- Material Symbols replaces lucide-react; Playfair Display dropped.
- 7 deferred features ship as Coming Soon cards under More.

See `docs/plans/2026-04-27-pwa-ambient-design.md` and `docs/plans/2026-04-27-pwa-ambient.md` for design + implementation reference.

## Test plan
- [ ] All vitest tests pass (`npm test`).
- [ ] Lighthouse PWA > 90 on `/dashboard` mobile.
- [ ] Install on real iOS + Android home screens.
- [ ] Cold-start works offline after one online use.
- [ ] All four nav slots + FAB Log work.
- [ ] All three log sheets save to Supabase.
- [ ] Empty-state shows for fresh accounts.
- [ ] Manifest shortcuts launch the right log sheets.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Verification (post-merge)

Reference design doc § 13. Done when:

- Lighthouse PWA > 90.
- All four Stitch screens visually match the screenshots at iPhone 14 width (390px).
- All Track A unit tests pass.
- Real-device test on iPhone + Android both succeed.
- `manifest-validator.appspot.com/?url=https://your-vercel-preview/manifest.json` reports no errors.

## Delegation reminder

- **Track A (this plan)** — sequential through Phases 0–6.
- **Track B (nano-banana art)** — runs in parallel during Phase 0–1; commits PNGs into `public/icons/`. If not done by Phase 5, ship with placeholders.
- **Track C (Cursor polish)** — runs after Phase 2; assigned: drag-to-dismiss with momentum on Sheet (TODO from Task 1.4), animation tuning on real device, loading skeletons.
- **Track D (Codex rescue)** — invoke `codex:rescue` skill if stuck on workbox config, recharts dark theme, or iOS Safari rendering.

When Phase 5 ships and Lighthouse passes, the PWA is demo-ready regardless of Phase 6 cleanup state.
