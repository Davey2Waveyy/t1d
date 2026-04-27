# Betatrace PWA — Ambient Design

**Status**: Approved 2026-04-27
**Branch**: `feature/pwa-ambient` (off `feature/core-functionality`)
**Sources**: `docs/design/pwa-design-spec.md` (input that generated Stitch + Claude designs), `docs/design/stitch/*` (4 Stitch screens + extracted Tailwind config)

## 1. Intent

Take the Stitch-generated visual designs (Ambient variant chosen over Neo-Brutalist) and the existing Supabase data layer, and ship a real PWA: installable, mobile-first responsive, with a hybrid offline strategy. The current app's content is correct; the shell is wrong (desktop sidebar, mock data assumptions, no manifest, no service worker, decorative Playfair serif headings on a real-time data app).

## 2. Decisions log

| # | Decision | Choice | Rationale |
|---|---|---|---|
| 1 | Spec relationship | Stitch + Claude are downstream of `pwa-design-spec.md`; treat Stitch HTML as source of truth for visuals | Spec was the input; designs are the output |
| 2 | Layout breadth | Mobile-first, responsive up to desktop | User uses both phone and laptop |
| 3 | Dashboard variant | Ambient (over Neo-Brutalist) | Matches spec's "Apple Health + Linear + Dexcom Clarity" calm-precise philosophy |
| 4 | v1 scope | Stitch-designed core (Home/Glucose/Meals/Insulin/Settings) live; everything else "Coming soon" greyed cards | "Earn complexity" principle from spec |
| 5 | PWA depth | Hybrid: cache reads (StaleWhileRevalidate), require-network for writes, offline toast | Subway-readable dashboard without conflict-resolution headaches |
| 6 | Component strategy | New `src/components/v2/` directory; cut over screen-by-screen via import swap; old `dashboard/` deleted in final cleanup commit | Clean diffs, easy rollback, preserve subtle behaviors |
| 7 | Styling | Tailwind | Stitch HTML drops in nearly verbatim; old CSS files isolated to old components |
| 8 | Branch | Off `feature/core-functionality` | `main` is 10+ commits behind |

## 3. Design tokens

Drop-in Tailwind config sourced from `docs/design/stitch/overview.html`. See `tailwind.config.js` once written. Critical values:

```
colors:
  surface-base       #0D1B16   (page bg, matches existing manifest theme_color)
  surface-raised     #132B23   (cards)
  surface-overlay    #1A3D32   (list rows)
  surface-input      #0A1410
  primary            #56f1c3   (mint accent — buttons, FAB, links)
  glucose-normal     #2DD4A8
  glucose-high       #FBBF24
  glucose-low        #FB7185
  chart-carbs        #38BDF8   (blue)
  chart-insulin      #A78BFA   (purple)
  text-primary       #E8F5F0
  text-secondary     #8BA89F
  text-muted         #4A6B60
  border-subtle      rgba(45, 212, 168, 0.08)
  border-default     rgba(45, 212, 168, 0.15)
  border-strong      rgba(45, 212, 168, 0.30)

borderRadius: { DEFAULT: 0.25rem, lg: 0.5rem, xl: 0.75rem, full: 9999px }

spacing: { xs: 0.25rem, sm: 0.5rem, base: 4px, md: 1rem, lg: 1.5rem, xl: 3rem }

fontFamily: { body/title/label: Inter, data/stat/headline: JetBrains Mono }
fontSize:
  body-base       15px / 1.5
  label-caps      11px / 1.2 / 0.1em letter-spacing / 600 weight (uppercase)
  title-lg        22px / 1.2 / 600
  data-mono       13px / 1 / 500
  stat-lg         28px / 1.2 / -0.03em / 600
  headline-hero   56px / 1 / -0.02em / 700

icons: Material Symbols Outlined  (replaces lucide-react in v2 components)
```

**Drop**: Playfair Display serif (currently loaded in `index.html`, decorative, off-spec).

## 4. Component architecture

```
src/
  components/
    v2/
      shell/        TopBar.jsx, BottomNav.jsx, LogFab.jsx, AppContainer.jsx
      screens/      Home.jsx, Glucose.jsx, Meals.jsx, More.jsx, MoreInsulin.jsx, MoreSettings.jsx
      sheets/       Sheet.jsx (primitive), LogActionSheet.jsx, GlucoseLogSheet.jsx, MealLogSheet.jsx, InsulinLogSheet.jsx
      cards/        StatCard.jsx, GlucoseHero.jsx, ActivityRow.jsx, ComingSoonCard.jsx
      charts/       GlucoseChart.jsx (recharts wrapper), TimeInRangeBar.jsx
      ui/           Pill.jsx, Badge.jsx, EmptyState.jsx (v2), Toast.jsx
    dashboard/      (existing; deleted in final cleanup commit)
  styles/
    tokens.css      CSS variable mirror of Tailwind tokens for non-utility code
  hooks/
    useOnline.js    online/offline detection for write-disable + toast
    useMediaQuery.js
```

Old `Sidebar.jsx` is deleted (replaced by responsive nav).

## 5. Routes

```
/                          Landing (existing, untouched)
/dashboard                 → screens/Home.jsx
/dashboard/glucose         → screens/Glucose.jsx
/dashboard/glucose/log     → opens GlucoseLogSheet (modal route)
/dashboard/meals           → screens/Meals.jsx
/dashboard/meals/log       → opens MealLogSheet
/dashboard/insulin/log     → opens InsulinLogSheet
/dashboard/more            → screens/More.jsx
/dashboard/more/insulin    → MoreInsulin (history list)
/dashboard/more/settings   → MoreSettings
```

Manifest shortcuts (existing in spec) target the three `/log` routes.

## 6. Navigation

Bottom nav (mobile, ≤ md breakpoint), 5 slots:

| Slot | Route | Icon | State |
|---|---|---|---|
| Home | `/dashboard` | `home` | live |
| Glucose | `/dashboard/glucose` | `insights` | live |
| **Log (FAB)** | opens `LogActionSheet` | `add_circle` (filled, primary bg, elevated -mt-6) | live |
| Meals | `/dashboard/meals` | `restaurant` | live |
| More | `/dashboard/more` | `more_horiz` | live |

`More` page list:
- Insulin (live, history + form)
- Settings (live, restyled)
- ICR Predictor — *Coming soon*
- A1C Estimator — *Coming soon*
- Pattern Alerts — *Coming soon*
- AI Chat — *Coming soon*
- AI Dose Assistant — *Coming soon*
- Dexcom Import — *Coming soon*
- Correction Factor — *Coming soon* (still uses mockData; defer)

Desktop (≥ lg breakpoint, 1024px+): bottom nav hides; nav becomes a top tab bar inside `TopBar`. App container goes full-width with a 3-column grid (left rail nav, center main, optional right rail). No new component variants — pure responsive Tailwind classes.

## 7. PWA shell

### Manifest
Use the manifest already specified in `docs/design/pwa-design-spec.md` § 2.1. Place at `public/manifest.json`. Reference from `index.html`.

### Icons
Need `public/icons/`:
- `icon-192.png`, `icon-512.png` (any purpose)
- `icon-maskable-192.png`, `icon-maskable-512.png` (maskable purpose, with 10% safe-zone padding)
- `icon-apple-180.png`
- `shortcut-glucose.png`, `shortcut-meal.png`, `shortcut-insulin.png` (96x96)

Generate via nano-banana from existing `public/favicon.svg` or design fresh — see Delegation §10.

### Service worker
Use `vite-plugin-pwa` with workbox runtime caching:

| Asset | Strategy | Cache name | Expiration |
|---|---|---|---|
| App shell (HTML/CSS/JS/fonts) | Precache | `app-shell-v1` | on update |
| Material Symbols + Google Fonts | CacheFirst | `fonts-v1` | 1 year |
| Supabase REST GETs (`/rest/v1/glucose_readings`, `/rest/v1/meals`, `/rest/v1/insulin_doses`) | StaleWhileRevalidate | `data-reads-v1` | 1 hour |
| Supabase REST writes/auth | NetworkOnly | — | — |

Offline write behavior:
- `useOnline()` hook reads `navigator.onLine` + `online`/`offline` events
- All log forms disable submit + show inline "You're offline" message when `!online`
- If a submit fails because the network drops mid-request: show toast "Save failed — check your connection. Your entry is still in the form." Form values are retained.
- No retry queue (per decision 5).

### iOS install prompt
- iOS doesn't fire `beforeinstallprompt`. Detect iOS Safari via UA + `navigator.standalone`.
- Show a one-time custom prompt (`Toast`-styled) explaining "Tap Share → Add to Home Screen" with a small share-icon graphic.
- Dismissible; sets `localStorage.iosInstallPromptShown = '1'`.

## 8. Data flow

No schema changes. v2 components import from existing `src/lib/dataService.js`:
- `getMeals(limit)`, `addMeal(meal)`
- `getInsulinDoses(limit)`, `addInsulinDose(dose)`
- `getGlucoseReadings(hours)`, `addGlucoseReading(reading)`
- `getUserSettings()`, `updateUserSettings(settings)`

`AuthContext` and `SettingsContext` reused as-is.

Empty states ship per existing pattern (`src/components/ui/EmptyState.jsx` → ported to v2 with new visuals).

## 9. Animation principles (per Emil Kowalski / emil-design-eng)

- **Action sheet**: `translateY(100%) → 0` over 250ms `ease-out`; backdrop `opacity 0 → 0.6` same duration. Drag handle visible. Swipe-down dismiss with momentum (velocity threshold 0.11).
- **Buttons**: `transition: transform 160ms ease-out` + `:active { transform: scale(0.97) }`. Apply to FAB, sheet items, list rows, primary buttons.
- **Bottom nav active indicator**: color transition only (used hundreds of times/day; no movement).
- **Card hover** (desktop): `border-color` transition only.
- **Stat number changes**: blur-mask crossfade (`filter: blur(2px)` mid-transition, 200ms) so digits don't pop.
- **Stagger** on initial dashboard mount: stat cards 50ms staggered fade-in (top-down).
- **Reduced motion**: replace transform motion with opacity-only fades; keep instant for keyboard/nav actions.
- **No animation on**: route changes (besides sheet enter/exit), nav taps, form keystrokes, every-tap interactions.

Custom easing in tokens.css:
```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);  /* iOS-style sheet */
```

## 10. Delegation map (multi-track agent strategy)

This is parallelizable work. The user's existing track convention (memory: `project_idle_tower_game_tracks.md`) maps cleanly to betatrace:

### Track A — Claude Code / Opus 4.7 (main build)
**Owns**: foundation, screens, sheets, data wiring, PWA shell, cleanup.

This is the spine of the work. Phases 1–5 below run on Track A. Use `gsd:execute-phase` if you want milestone tracking, or just plain commits per phase.

**Subagent fanout within Track A:**
- `Explore` agent — when porting a screen, dispatch one to map all data dependencies (which dataService calls, which contexts, which hooks) before writing v2 code. Cheaper than reading 5 files yourself.
- `Plan` agent — for the Glucose chart specifically (recharts → dark theme + chart-grid pattern); unique enough to warrant a focused plan.
- `code-reviewer` agent — after each phase commit, before merging back. Uses your `superpowers:code-reviewer` skill.
- `gsd:verify-work` — after Phase 5 ships, run UAT-style validation against the design.

### Track B — Nano Banana (assets / art)
**Owns**: PWA icons, splash screens, custom favicon, optional in-app illustrations.

Run **in parallel with Phase 1**. Outputs land in `public/icons/`. Track A doesn't block on this — placeholder PNGs ship until Track B commits.

Tasks for Track B:
1. App icon (`icon-512.png`) — mint-on-dark glyph; the existing `favicon.svg` is a starting point. Render a 512×512 with the same shape but anti-aliased and filled mint (`#56f1c3`) on `surface-base` (`#0D1B16`).
2. Maskable variant — same icon, 10% safe-zone padding, fill background to bleed edge.
3. iOS app icon (180×180), no transparency, rounded corners handled by iOS.
4. Three shortcut icons (96×96): glucose drop (mint), restaurant (blue `#38BDF8`), syringe (purple `#A78BFA`).
5. Optional: empty-state illustrations for Home/Glucose/Meals.

Use the `nano-banana:nano-banana` skill. One prompt per icon, render at 2x then downscale.

### Track C — Cursor (UI polish + micro-interactions)
**Owns**: animation tuning, motion details, possibly a Storybook/showcase page.

Run **after Phase 2 ships** (so there's something to polish). Cursor is good for tight feedback loops on motion — write the animation, scrub it, rewrite, repeat.

Tasks for Track C:
1. Tune sheet enter/exit easing on real device (iOS Safari) — likely needs the iOS-style `--ease-drawer` curve.
2. Stagger calibration for the dashboard mount.
3. Build the `Sheet.jsx` primitive correctly (drag-to-dismiss with momentum, multi-touch protection, friction at boundaries) — this is non-trivial and motion-sensitive. Reference Vaul library patterns.
4. Toast component with timer pause-on-tab-hidden.
5. Loading skeletons (per-card) instead of the existing global spinner.

If Track C feels redundant with Track A, fold it back in. It's optional fanout, not required.

### Track D — Codex (rescue / second-pass review)
**Owns**: anything Track A gets stuck on; perf audit; second-opinion review.

Use the `codex:rescue` skill when Track A is genuinely blocked (workbox config issues, recharts dark-theme quirks, iOS Safari rendering bugs). Don't preemptively delegate — only when stuck.

### Branching for tracks
- Track A: `feature/pwa-ambient` (canonical)
- Track B: commits asset PNGs directly to `feature/pwa-ambient` (no branch — assets don't conflict)
- Track C: `feature/pwa-ambient-polish` if separate; merge into Track A's branch via PR
- Track D: never branches; pair-programs into Track A's working tree

### Rule of thumb
Track A drives schedule. Tracks B and C are *enrichment* — if they don't ship, the app still ships. Don't let track coordination become its own project.

## 11. Implementation phases (no time estimates — see feedback memory)

Phases are ordered by dependency. Each phase is a shippable atomic commit (or small commit cluster).

### Phase 0 — Branch & dependency setup
- Commit loose Remotion files on `feature/core-functionality` (not part of this work).
- Branch: `git checkout -b feature/pwa-ambient`.
- `npm install -D tailwindcss postcss autoprefixer vite-plugin-pwa workbox-window`.
- `npx tailwindcss init -p`.
- Drop the Stitch tokens into `tailwind.config.js`.
- Wire Tailwind into `src/index.css` (alongside existing CSS — no global break).
- Add Material Symbols `<link>` to `index.html`. Drop Playfair Display.
- Build verifies (`npm run build`).
- **Commit**: `chore(v2): add Tailwind + workbox + design tokens`.

**Unblocks**: Phase 1.

### Phase 1 — Shell + tokens.css
- `src/styles/tokens.css` (CSS-var mirror).
- `components/v2/shell/AppContainer.jsx` — max-w-[480px] mobile, 3-col grid ≥ lg.
- `components/v2/shell/TopBar.jsx` — title + bell, top-tabs on desktop.
- `components/v2/shell/BottomNav.jsx` — 4 nav slots + FAB hole, hides on desktop.
- `components/v2/shell/LogFab.jsx` — emits `onPressLog`.
- `components/v2/ui/Sheet.jsx` — primitive (header, drag handle, body, backdrop, ESC handler). Animation: `translateY(100%) → 0`, ease-out 250ms.
- `components/v2/sheets/LogActionSheet.jsx` — uses `Sheet`, three options.
- `pages/Dashboard.jsx` — render shell + `<Outlet/>`; nested routes scaffolded but each screen renders a "Phase N coming up" placeholder.
- **Commit**: `feat(v2): shell, app container, bottom nav, log action sheet`.

**Unblocks**: Phases 2–4.

### Phase 2 — Home screen + Log sheets (the demo-able cut)
- `components/v2/cards/GlucoseHero.jsx`, `StatCard.jsx`, `ActivityRow.jsx`.
- `components/v2/charts/GlucoseChart.jsx` (recharts dark theme, chart-grid CSS).
- `components/v2/screens/Home.jsx` — wires to `getGlucoseReadings`, `getMeals`, `getInsulinDoses`. Empty states via `EmptyState`.
- `components/v2/sheets/GlucoseLogSheet.jsx`, `MealLogSheet.jsx`, `InsulinLogSheet.jsx` — wire to `addX` mutations. Optimistic update on success; error toast on failure.
- Cut over `Dashboard.jsx` to render `Home` instead of old `Overview`.
- Manifest shortcuts route here.
- **Commit**: `feat(v2): home screen + log sheets, wired to Supabase`.

**Unblocks**: Phase 3 (Glucose), Phase 4 (Meals/Insulin/More).

### Phase 3 — Glucose Trends screen
- `components/v2/charts/TimeInRangeBar.jsx`.
- `components/v2/screens/Glucose.jsx` — time-range tabs (24H/7D/30D/90D), avg + GMI cards, chart, TIR bar, recent logs list.
- Recompute GMI client-side from `getGlucoseReadings(hours)`.
- Cut over from old `GlucoseTrends.jsx`.
- **Commit**: `feat(v2): glucose trends screen with time-range tabs`.

### Phase 4 — Meals + Insulin + More + Settings
- `components/v2/screens/Meals.jsx` — history list with day grouping.
- `components/v2/screens/MoreInsulin.jsx` — history list (insulin gets demoted to More menu).
- `components/v2/screens/More.jsx` — sectioned list with `ComingSoonCard` for the deferred 7.
- `components/v2/cards/ComingSoonCard.jsx` — greyed, "Coming soon" pill, disabled tap.
- `components/v2/screens/MoreSettings.jsx` — restyled Settings.
- Cut over remaining old components.
- **Commit**: `feat(v2): meals, more menu, insulin history, settings restyle`.

### Phase 5 — PWA shell + offline + iOS install
- `public/manifest.json` (per spec).
- `public/icons/*.png` (placeholders if Track B not done; real icons when Track B lands).
- `vite.config.js` — register `vite-plugin-pwa` with the cache strategies in §7.
- `src/hooks/useOnline.js`.
- `components/v2/ui/Toast.jsx` — used for offline + iOS install.
- iOS A2HS prompt component.
- Test on real phone via Vercel preview URL (or local with `vite preview` + ngrok).
- Lighthouse PWA audit > 90.
- **Commit**: `feat(pwa): manifest, service worker, offline reads, iOS install prompt`.

### Phase 6 — Cleanup
- Delete `src/components/dashboard/*` (all old components + .css files).
- Delete `src/data/mockData.js`.
- Remove `lucide-react` from `package.json` if fully unreferenced.
- Remove Playfair Display references in `index.html`.
- Drop unused entries from `src/index.css`.
- **Commit**: `chore(v2): remove legacy dashboard components and unused deps`.

### Merge
PR `feature/pwa-ambient` → `main` (after merging `feature/core-functionality` into `main` first to avoid double-merge headaches).

## 12. Risks & open questions

- **Material Symbols vs lucide-react**: Stitch design uses Material Symbols. lucide-react is already installed and used by old components. v2 uses Material Symbols only; lucide-react is removed in Phase 6 if no v2 component references it. If during build we discover lucide is needed elsewhere (Landing page?), keep both until Landing is also migrated.
- **Recharts dark theme**: existing `GlucoseTrends.jsx` uses recharts with light defaults. Dark-theme override needs a custom `<XAxis/>` `<YAxis/>` `<CartesianGrid/>` style. Track D rescue candidate if it gets fiddly.
- **iOS standalone status bar**: `apple-mobile-web-app-status-bar-style: black-translucent` puts content under the status bar — `pt-safe` class already in Stitch HTML handles it. Verify on real iPhone.
- **Supabase RLS + service worker cache**: cached responses are per-user (auth header in URL); workbox cache key includes URL but not headers. If a user logs out and another logs in on the same device, cached reads could leak. Mitigation: clear `data-reads-v1` cache on `signOut()`. Add to AuthContext.
- **Greyed "Coming soon" for components currently visible**: users on the existing app have access to ICR/A1C/AI features. Migrating to v2 hides those. Acceptable for a redesign sprint (you said "demo"), but document in commit messages so it's not surprising in changelogs.

## 13. Verification

After Phase 5:
- Lighthouse PWA score > 90 on `/dashboard` (mobile).
- Manifest passes `https://manifest-validator.appspot.com/`.
- Install on real iOS + Android home screens; cold-start works offline.
- Add a glucose reading offline → submit fails gracefully with toast → form retains values → reconnect → resubmit succeeds.
- Read cache: open app in airplane mode after recent online use → dashboard renders with last data + offline indicator.
- All four Stitch screens visually match the screenshots at iPhone 14 width (390px).

## Appendix A — Stitch source files

Local copies in `docs/design/stitch/`:
- `ambient-dashboard.html` (Stitch "Abstract Ambient Dashboard Variant" — used as inspiration only, not as a screen)
- `overview.html` (Stitch "Overview Dashboard" — basis for `screens/Home.jsx`)
- `glucose-trends.html` (Stitch "Glucose Trends" — basis for `screens/Glucose.jsx`)
- `log-action-sheet.html` (Stitch "Log Action Sheet" — basis for `sheets/LogActionSheet.jsx`)
- `*.png` screenshots for each
