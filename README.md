# Betatrace

A Type 1 Diabetes tracking app (glucose, meals, insulin) built with React 19, Vite, and Supabase.

## Pre-existing project

Betatrace lets a person log glucose readings, meals, and insulin doses, and see trends, time-in-range,
and simple pattern summaries on a mobile-first dashboard. Two ways to use it:

- **Signed in** — records are stored per-user in Supabase (Postgres + Row Level Security), so only the
  account owner can read or write their own rows.
- **Guest demo** — no account needed. The dashboard boots with realistic seeded synthetic data (48 hours
  of generated glucose, a handful of meals and insulin doses) and any entries you add are kept in
  `localStorage` on that device only. Nothing in guest mode ever touches Supabase.

Stack: React 19 + React Router 7, Vite 8, Tailwind, Framer Motion, Recharts, a PWA service worker
(`vite-plugin-pwa`), and `@supabase/supabase-js` for the authenticated path. `src/remotion/` is an
unrelated Remotion video project (a promo ad render) that ships in the same repo.

## WebMCP Challenge extension

This branch adds a **guest-demo-only** [WebMCP](https://github.com/webmachinelearning/webmcp) integration:
three tools an AI agent (or any WebMCP-aware client) can call to read and log data in the same synthetic
demo a human sees, side by side with the existing manual forms.

**Baseline and scope of the challenge work.** The annotated tag `pre-webmcp-baseline-2026-08-26` marks
commit `7de4e4c1c0176535bdad965e4f2424aa0c25f239` on `main` — the state of the app immediately before
any WebMCP work started. Everything described in this section was built on top of that commit, on the
`challenge/webmcp-core` branch, and is scoped to the guest demo only:

- WebMCP tools are registered **only** while the session is in guest mode. An authenticated Supabase
  session never has these tools registered, and the tools' code path never imports or calls Supabase.
- All data the tools read or write is explicitly synthetic (`synthetic: true` on every read), stored in
  `localStorage`, and clearly separated from anything an authenticated account would persist.
- No Nightscout, Dexcom, Groq, external chat, or other third-party service is reconnected as part of
  this work — see the repository's earlier cleanup history for why those were removed.

### Architecture

- **`src/lib/dataService.js`** — the demo data store. `getDemoSnapshot()`, `addDemoEntryBatch()`, and
  `resetDemoData()` are the single read/write/reset path used by *both* the manual log sheets and the
  WebMCP tools, so they can never validate or persist differently. Writes are validated in full before
  anything is written (an invalid field blocks its valid siblings too), IDs come from
  `crypto.randomUUID()` with an in-memory fallback, and every write/reset broadcasts a change event.
- **`src/hooks/useDashboardData.js`** — subscribes to that change event, so the dashboard refreshes
  immediately after a manual save or a tool call, with no navigation or reload.
- **`src/lib/webmcp.js`** — the three tool definitions (schema, annotations, `execute`), independent of
  React.
- **`src/hooks/useWebMcpTools.js`** — registers those tools via the native
  `document.modelContext.registerTool()` API when mounted with `enabled: true` (guest mode). One
  `AbortController` covers the whole registration lifecycle; its signal is passed as the second argument
  to every `registerTool()` call and is aborted on unmount or when guest mode ends, so tools unregister
  cleanly. A ref guard prevents duplicate live registrations across re-renders.
- Mounted once in **`src/pages/Dashboard.jsx`** (the shell that persists across internal navigation), not
  per-screen, so the tools stay registered no matter which dashboard tab is open.

### The three tools

| Tool | Type | Purpose | Notable constraints |
| --- | --- | --- | --- |
| `get_demo_state` | Read-only | Returns a factual snapshot: current glucose + unit, time-in-range %, today's carb/insulin totals, recent glucose/meal/insulin entries with provenance, and a safety boundary string. | `readOnlyHint: true`, `untrustedContentHint: true`. Never returns dose recommendations, correction suggestions, calculated dosing, estimated A1C, or active-insulin estimates. |
| `log_demo_entry` | Mutating | Logs one combined event — any combination of a glucose reading, a meal, and an insulin dose the user says was already taken. | Requires at least one of `glucose` / `meal` / `insulin`; `additionalProperties: false` at every object level; re-validated inside `execute` (never trusts JSON Schema alone); zero mutations on any invalid field. Only records the values given — never calculates or recommends a dose. |
| `reset_demo_data` | Mutating | Deletes locally-added synthetic glucose/meal/insulin entries and restores the seeded demo. | Requires `{ "confirm": true }`. Never touches settings, authentication, or remote records — only this browser's local synthetic demo data. |

### Safety and synthetic-data boundaries

- Every `get_demo_state` response is explicitly marked `synthetic: true` and carries a safety string
  stating the result is descriptive demo information, not medical advice.
- No tool anywhere in this codebase calculates, estimates, or recommends an insulin dose, a correction,
  an A1C estimate, or active insulin — `src/lib/webmcpSourceUsage.test.js` enforces this at the source
  level (fails the build if such a tool, or a Supabase reference, is ever added to `src/lib/webmcp.js`).
- Numeric bounds on `log_demo_entry` are conservative and enforced twice (schema + runtime): glucose
  20–600 mg/dL or 1.1–33.3 mmol/L, carbohydrates 0–500 g, insulin units `> 0` and `≤ 100`, and no
  timestamp more than 5 minutes in the future.
- Guest-mode data (manual or agent-logged) never leaves the browser and is never written to Supabase.

### Supported browsers

WebMCP's `document.modelContext.registerTool()` is an emerging, not-yet-standardized browser API. The
app **feature-detects** it (`document.modelContext?.registerTool`) before doing anything:

- **Supported browser/extension** — tools register and the status pill in the dashboard reads
  **"WebMCP ready."** An agent connected to that browser can call the three tools above.
- **Unsupported browser** — nothing throws, no tools are registered, and the pill reads
  **"Manual mode — WebMCP unavailable."** The dashboard, forms, and every existing feature work exactly
  as before; this is a pure progressive enhancement.
- If registration itself fails (a rejected promise from `registerTool`), the pill reads
  **"WebMCP registration failed"** and the app still falls back to full manual mode without crashing.

### Manual test prompts

With a WebMCP-aware agent/client attached to a supported browser, open the guest demo
(`/dashboard`, "Continue as guest") and try:

- *"What's the current glucose reading and time in range in the Betatrace demo?"* → calls
  `get_demo_state`, returns synthetic values only.
- *"Log that I just ate a bowl of oatmeal with 40g of carbs for breakfast."* → calls `log_demo_entry`
  with a `meal`; the entry appears immediately with an **"Agent logged"** badge.
- *"I just took 4.5 units of bolus insulin and my glucose read 142 mg/dL."* → calls `log_demo_entry`
  with both `glucose` and `insulin` in one combined write.
- *"How much insulin should I take for this meal?"* → the agent has no tool that can answer this;
  `log_demo_entry`'s own description says it never calculates or recommends a dose.
- *"Reset the demo data."* → calls `reset_demo_data` with `confirm: true`; the dashboard reverts to the
  seeded sample data immediately. The same reset is available to a human without an agent from
  **More → Demo → Reset demo data**, behind a confirmation sheet.

## Local setup, testing, and build

```bash
npm install --legacy-peer-deps   # matches the Vercel install command in vercel.json
cp .env.example .env             # optional — only needed for the authenticated Supabase path
npm run dev                      # start the Vite dev server
```

```bash
npm test                                          # vitest — component/hook/lib suites under jsdom
node --test src/lib/*.test.js src/remotion/*.test.js   # dependency-free node:test suites
npm run lint                                      # eslint (0 errors expected)
npm run build                                     # production build via vite build
```
