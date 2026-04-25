# Betatrace Promo Video — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor the existing `BetaTraceAd.jsx` into a punchy 30-second Feature Blitz promo matching the approved design — 9 scenes, hard cuts, illustrated accent blobs, updated end card with GitHub/LinkedIn, and beat-synced music.

**Architecture:** Refactor `src/remotion/BetaTraceAd.jsx` in place, extracting reusable components into `src/remotion/components/`. Each scene is a self-contained component receiving its frame via Remotion's `useCurrentFrame`. Scenes are sequenced via `<Sequence>` in the root composition.

**Tech Stack:** Remotion 4, React, JSX (no TypeScript in this project), `interpolate`, `spring`, `useCurrentFrame`, `useVideoConfig`, `<Sequence>`, `<Audio>`, `staticFile`.

---

## Current State vs Target

| Scene | Current (BetaTraceAd.jsx) | Target |
|-------|--------------------------|--------|
| 0–60f | HookScene (chaos/alarm) | ColdOpen (teal orb + wordmark snap) |
| 60–180f | BrandScene (logo) | CommandCenter (dashboard stats) |
| 180–270f | DashboardScene | LogEverything (meal/insulin/glucose) |
| 270–390f | LoggingScene | ICRPredictor (confidence bar) |
| 390–510f | IntelligenceScene | PatternAlerts (severity badges) |
| 510–630f | CopilotScene | AIChatbot (chat bubbles + blob) |
| 630–720f | CtaScene | NightscoutSync (data stream) — NEW |
| 720–810f | — | BrandStatement ("Built for T1D...") |
| 810–900f | — | EndCard (logo + CTA + links) |

Total: 900 frames @ 30fps = 30s. Same duration, same file, restructured.

---

## Task 1: Extract Shared Components

**Files:**
- Create: `src/remotion/components/AccentBlob.jsx`
- Create: `src/remotion/components/SceneLabel.jsx`
- Create: `src/remotion/components/StatCard.jsx`
- Create: `src/remotion/components/AlertBadge.jsx`
- Create: `src/remotion/components/ChatBubble.jsx`

**Step 1: Create AccentBlob.jsx**

```jsx
// src/remotion/components/AccentBlob.jsx
import { interpolate } from 'remotion';

const palette = {
  teal: '#2dd4a8', emerald: '#10b981', violet: '#a78bfa',
  rose: '#fb7185', amber: '#fbbf24', sky: '#38bdf8',
};

export default function AccentBlob({ frame, color = 'teal', size = 160, top, left, right, bottom, delay = 0, shape = 'circle' }) {
  const progress = interpolate(frame - delay, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const borderRadius = shape === 'blob' ? '60% 40% 55% 45% / 45% 55% 40% 60%' : '50%';
  return (
    <div style={{
      position: 'absolute', top, left, right, bottom,
      width: size, height: size,
      borderRadius,
      background: `${palette[color]}22`,
      border: `3px solid ${palette[color]}44`,
      opacity: progress * 0.85,
      transform: `scale(${0.6 + progress * 0.4})`,
    }} />
  );
}
```

**Step 2: Create SceneLabel.jsx**

```jsx
// src/remotion/components/SceneLabel.jsx
import { interpolate } from 'remotion';

export default function SceneLabel({ frame, text, delay = 0 }) {
  const progress = interpolate(frame - delay, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return (
    <div style={{
      position: 'absolute', top: 90, left: 80,
      color: '#fff',
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: 48,
      fontWeight: 900,
      letterSpacing: 3,
      textTransform: 'uppercase',
      opacity: progress,
      transform: `translateY(${16 * (1 - progress)}px)`,
    }}>
      {text}
    </div>
  );
}
```

**Step 3: Create StatCard.jsx**

```jsx
// src/remotion/components/StatCard.jsx
import { interpolate, spring } from 'remotion';

export default function StatCard({ frame, fps = 30, label, value, unit = '', color = '#2dd4a8', delay = 0 }) {
  const appear = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 100 } });
  const numValue = parseFloat(value);
  const displayValue = isNaN(numValue)
    ? value
    : Math.round(interpolate(frame - delay, [0, 25], [0, numValue], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

  return (
    <div style={{
      borderRadius: 24, background: '#10251f', border: `2px solid ${color}44`,
      padding: '28px 32px',
      opacity: appear,
      transform: `translateY(${28 * (1 - appear)}px)`,
    }}>
      <div style={{ color: '#6b8a80', fontFamily: 'Inter, Arial, sans-serif', fontSize: 22, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>{label}</div>
      <div style={{ color, fontFamily: 'JetBrains Mono, Consolas, monospace', fontSize: 58, fontWeight: 800, marginTop: 8 }}>
        {displayValue}{unit}
      </div>
    </div>
  );
}
```

**Step 4: Create AlertBadge.jsx**

```jsx
// src/remotion/components/AlertBadge.jsx
import { spring } from 'remotion';

const severityColors = { critical: '#fb7185', warning: '#fbbf24', info: '#2dd4a8' };

export default function AlertBadge({ frame, fps = 30, severity = 'info', title, description, delay = 0 }) {
  const color = severityColors[severity];
  const appear = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 90 } });
  return (
    <div style={{
      borderRadius: 20, background: '#10251f', border: `2px solid ${color}55`,
      padding: '24px 30px', marginBottom: 20,
      opacity: appear,
      transform: `translateY(${40 * (1 - appear)}px)`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <div style={{ color: '#e8f5f0', fontFamily: 'Inter, Arial, sans-serif', fontSize: 30, fontWeight: 800 }}>{title}</div>
        <div style={{ marginLeft: 'auto', color, fontFamily: 'Inter, Arial, sans-serif', fontSize: 20, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>{severity}</div>
      </div>
      <div style={{ color: '#6b8a80', fontFamily: 'Inter, Arial, sans-serif', fontSize: 24, marginTop: 10, paddingLeft: 26 }}>{description}</div>
    </div>
  );
}
```

**Step 5: Create ChatBubble.jsx**

```jsx
// src/remotion/components/ChatBubble.jsx
import { interpolate } from 'remotion';

export default function ChatBubble({ frame, text, align = 'right', color = '#183c32', textColor = '#dffcf3', delay = 0, fontSize = 30 }) {
  const progress = interpolate(frame - delay, [0, 16], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return (
    <div style={{
      borderRadius: 22,
      background: color,
      padding: '22px 28px',
      marginBottom: 20,
      marginLeft: align === 'right' ? 80 : 0,
      marginRight: align === 'left' ? 80 : 0,
      opacity: progress,
      transform: `translateY(${20 * (1 - progress)}px)`,
      color: textColor,
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize,
      lineHeight: 1.3,
    }}>
      {text}
    </div>
  );
}
```

**Step 6: Commit**

```bash
git add src/remotion/components/
git commit -m "feat(remotion): add shared scene components (AccentBlob, SceneLabel, StatCard, AlertBadge, ChatBubble)"
```

---

## Task 2: Rewrite ColdOpen Scene (frames 0–60)

**Files:**
- Modify: `src/remotion/BetaTraceAd.jsx` — replace `HookScene` function

**Step 1: Replace HookScene with ColdOpen**

Remove the entire `HookScene` function and replace with:

```jsx
function ColdOpen() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const orbScale = spring({ frame, fps, config: { damping: 22, stiffness: 80 } });
  const wordmarkProgress = interpolate(frame, [18, 30], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const wordmarkY = interpolate(frame, [18, 30], [20, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#0D1B16', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        width: 180, height: 180, borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 35%, #4eedc4, #2dd4a8)',
        boxShadow: '0 0 60px rgba(45,212,168,0.5)',
        transform: `scale(${orbScale})`,
        marginBottom: 48,
      }} />
      <div style={{
        color: '#e8f5f0',
        fontFamily: 'Georgia, serif',
        fontSize: 110,
        fontWeight: 500,
        letterSpacing: -2,
        opacity: wordmarkProgress,
        transform: `translateY(${wordmarkY}px)`,
      }}>
        Betatrace
      </div>
    </AbsoluteFill>
  );
}
```

**Step 2: Update Sequence in BetaTraceAd — change `<HookScene />` to `<ColdOpen />`**

In the return JSX at the bottom, change:
```jsx
<Sequence from={0} durationInFrames={90}>
  <HookScene />
</Sequence>
```
to:
```jsx
<Sequence from={0} durationInFrames={60}>
  <ColdOpen />
</Sequence>
```

**Step 3: Run Remotion studio to verify visually**

```bash
npm run remotion:studio
```

Navigate to frame 0–60. Verify: teal orb springs in, "Betatrace" wordmark snaps up at frame 18.

**Step 4: Commit**

```bash
git add src/remotion/BetaTraceAd.jsx
git commit -m "feat(remotion): replace HookScene with ColdOpen (orb + wordmark snap)"
```

---

## Task 3: Command Center Scene (frames 60–180)

**Files:**
- Modify: `src/remotion/BetaTraceAd.jsx` — replace `BrandScene` function + update Sequence

**Step 1: Replace BrandScene with CommandCenter**

```jsx
function CommandCenter() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stats = [
    { label: 'Glucose', value: '142', unit: ' mg/dL', color: '#2dd4a8' },
    { label: 'Time in Range', value: '72', unit: '%', color: '#10b981' },
    { label: 'Active Insulin', value: '2.4', unit: 'u', color: '#38bdf8' },
    { label: 'Carbs Today', value: '68', unit: 'g', color: '#fbbf24' },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: '#0D1B16', padding: 80 }}>
      <SceneLabel frame={frame} text="One workspace." />
      <AccentBlob frame={frame} color="teal" size={200} top={-60} right={-60} delay={5} />
      <div style={{ marginTop: 160, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {stats.map((s, i) => (
          <StatCard key={s.label} frame={frame} fps={fps} delay={i * 12} {...s} />
        ))}
      </div>
      <div style={{
        marginTop: 36, borderRadius: 24, background: '#10251f',
        border: '2px solid #2dd4a844', padding: '28px 32px',
        opacity: interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      }}>
        <div style={{ color: '#6b8a80', fontFamily: 'Inter, Arial, sans-serif', fontSize: 22, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700 }}>48h Glucose Trace</div>
        <AnimatedGlucoseLine progress={interpolate(frame, [50, 115], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} opacity={0.9} />
      </div>
    </AbsoluteFill>
  );
}
```

**Step 2: Update Sequence**

Change:
```jsx
<Sequence from={90} durationInFrames={90}>
  <BrandScene />
</Sequence>
```
to:
```jsx
<Sequence from={60} durationInFrames={120}>
  <CommandCenter />
</Sequence>
```

**Step 3: Verify in studio** — frames 60–180, stat cards count up staggered, glucose trace draws.

**Step 4: Commit**

```bash
git add src/remotion/BetaTraceAd.jsx
git commit -m "feat(remotion): CommandCenter scene with animated stat cards and glucose trace"
```

---

## Task 4: Log Everything Scene (frames 180–270)

**Files:**
- Modify: `src/remotion/BetaTraceAd.jsx` — update `LoggingScene` + Sequence

**Step 1: Update LoggingScene to add SceneLabel and AccentBlob, shorten to 90 frames**

Replace the existing `LoggingScene` with:

```jsx
function LoggingScene() {
  const frame = useCurrentFrame();

  const items = [
    { label: 'Meal logged', detail: '45g carbs · dinner', color: '#fbbf24' },
    { label: 'Insulin logged', detail: '4.5u rapid dose', color: '#38bdf8' },
    { label: 'Glucose reading', detail: '142 mg/dL · rising', color: '#2dd4a8' },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: '#0D1B16', padding: 80 }}>
      <SceneLabel frame={frame} text="Log meals. Insulin. Glucose." />
      <AccentBlob frame={frame} color="emerald" size={140} bottom={100} right={60} delay={8} shape="blob" />
      <div style={{ position: 'absolute', left: 80, right: 80, top: 200 }}>
        {items.map((item, i) => {
          const appear = interpolate(frame - i * 16, [0, 20], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });
          return (
            <div key={item.label} style={{
              height: 130, borderRadius: 24, background: '#10251f',
              border: `2px solid ${item.color}33`, marginBottom: 24,
              display: 'flex', alignItems: 'center', padding: '0 32px',
              opacity: appear,
              transform: `translateX(${60 * (1 - appear)}px)`,
            }}>
              <div style={{ width: 60, height: 60, borderRadius: 16, background: `${item.color}22`, border: `2px solid ${item.color}66`, marginRight: 28 }} />
              <div>
                <div style={{ color: '#e8f5f0', fontFamily: 'Inter, Arial, sans-serif', fontSize: 32, fontWeight: 800 }}>{item.label}</div>
                <div style={{ color: '#6b8a80', fontFamily: 'Inter, Arial, sans-serif', fontSize: 24, marginTop: 6 }}>{item.detail}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
```

**Step 2: Update Sequence**

Change:
```jsx
<Sequence from={360} durationInFrames={150}>
  <LoggingScene />
</Sequence>
```
to:
```jsx
<Sequence from={180} durationInFrames={90}>
  <LoggingScene />
</Sequence>
```

**Step 3: Verify in studio** — frames 180–270, 3 log rows slide in staggered left-to-right.

**Step 4: Commit**

```bash
git add src/remotion/BetaTraceAd.jsx
git commit -m "feat(remotion): LoggingScene refactor with staggered row animations"
```

---

## Task 5: ICR Predictor Scene (frames 270–390)

**Files:**
- Modify: `src/remotion/BetaTraceAd.jsx` — add `ICRPredictorScene` + Sequence

**Step 1: Add ICRPredictorScene function**

```jsx
function ICRPredictorScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const confidenceWidth = interpolate(frame, [20, 70], [0, 78], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const mealTypes = [
    { meal: 'Breakfast', ratio: '1:8', confidence: 82, color: '#fbbf24', delay: 30 },
    { meal: 'Lunch', ratio: '1:10', confidence: 91, color: '#2dd4a8', delay: 45 },
    { meal: 'Dinner', ratio: '1:12', confidence: 74, color: '#38bdf8', delay: 60 },
  ];

  const overallAppear = spring({ frame, fps, config: { damping: 20, stiffness: 90 } });

  return (
    <AbsoluteFill style={{ backgroundColor: '#0D1B16', padding: 80 }}>
      <SceneLabel frame={frame} text="Auto-calculate your ratios." />
      <AccentBlob frame={frame} color="teal" size={120} top={200} right={40} delay={10} />

      {/* Overall ICR */}
      <div style={{
        marginTop: 170, borderRadius: 28, background: '#10251f',
        border: '2px solid #2dd4a844', padding: '32px 36px',
        opacity: overallAppear,
        transform: `scale(${0.92 + overallAppear * 0.08})`,
      }}>
        <div style={{ color: '#6b8a80', fontFamily: 'Inter, Arial, sans-serif', fontSize: 22, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700 }}>Overall ICR</div>
        <div style={{ color: '#2dd4a8', fontFamily: 'JetBrains Mono, Consolas, monospace', fontSize: 72, fontWeight: 800 }}>1:10</div>
        <div style={{ marginTop: 16, height: 12, borderRadius: 999, background: '#132b23', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${confidenceWidth}%`, borderRadius: 999, background: 'linear-gradient(90deg, #2dd4a8, #10b981)', transition: 'none' }} />
        </div>
        <div style={{ color: '#6b8a80', fontFamily: 'Inter, Arial, sans-serif', fontSize: 22, marginTop: 10 }}>{Math.round(confidenceWidth)}% confidence</div>
      </div>

      {/* Per-meal cards */}
      <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
        {mealTypes.map((m) => {
          const appear = interpolate(frame - m.delay, [0, 20], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });
          return (
            <div key={m.meal} style={{
              borderRadius: 22, background: '#10251f', border: `2px solid ${m.color}44`,
              padding: '24px 28px',
              opacity: appear,
              transform: `translateY(${30 * (1 - appear)}px)`,
            }}>
              <div style={{ color: '#6b8a80', fontFamily: 'Inter, Arial, sans-serif', fontSize: 20, textTransform: 'uppercase', letterSpacing: 1 }}>{m.meal}</div>
              <div style={{ color: m.color, fontFamily: 'JetBrains Mono, Consolas, monospace', fontSize: 44, fontWeight: 800 }}>{m.ratio}</div>
              <div style={{ color: '#4a6b60', fontFamily: 'Inter, Arial, sans-serif', fontSize: 20 }}>{m.confidence}% confidence</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
```

**Step 2: Add Sequence**

In the root return, after the LoggingScene Sequence, add:
```jsx
<Sequence from={270} durationInFrames={120}>
  <ICRPredictorScene />
</Sequence>
```

**Step 3: Verify in studio** — frames 270–390, confidence bar fills, 3 meal cards stagger in.

**Step 4: Commit**

```bash
git add src/remotion/BetaTraceAd.jsx
git commit -m "feat(remotion): add ICRPredictorScene with animated confidence bar"
```

---

## Task 6: Pattern Alerts Scene (frames 390–510)

**Files:**
- Modify: `src/remotion/BetaTraceAd.jsx` — replace `IntelligenceScene` + update Sequence

**Step 1: Replace IntelligenceScene with PatternAlertsScene**

```jsx
function PatternAlertsScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const alerts = [
    { severity: 'critical', title: 'Overnight lows detected', description: 'Recurring 12am–3am drops. Check basal rate.', delay: 0 },
    { severity: 'warning', title: 'Post-breakfast highs', description: '8am–11am readings consistently above 180.', delay: 20 },
    { severity: 'info', title: 'Afternoon stability', description: 'Great control 1pm–6pm. Keep it up.', delay: 40 },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: '#0D1B16', padding: 80 }}>
      <SceneLabel frame={frame} text="Spot patterns before they become problems." />
      <AccentBlob frame={frame} color="rose" size={150} top={-40} left={-40} delay={5} />
      <div style={{ position: 'absolute', left: 80, right: 80, top: 200 }}>
        {alerts.map((a) => (
          <AlertBadge key={a.title} frame={frame} fps={fps} {...a} />
        ))}
      </div>
    </AbsoluteFill>
  );
}
```

**Step 2: Update Sequence**

Change:
```jsx
<Sequence from={510} durationInFrames={150}>
  <IntelligenceScene />
</Sequence>
```
to:
```jsx
<Sequence from={390} durationInFrames={120}>
  <PatternAlertsScene />
</Sequence>
```

**Step 3: Verify in studio** — frames 390–510, 3 alert cards drop in staggered (rose → amber → teal).

**Step 4: Commit**

```bash
git add src/remotion/BetaTraceAd.jsx
git commit -m "feat(remotion): add PatternAlertsScene with severity-colored alert cards"
```

---

## Task 7: AI Chatbot Scene (frames 510–630)

**Files:**
- Modify: `src/remotion/BetaTraceAd.jsx` — update `CopilotScene` + Sequence

**Step 1: Replace CopilotScene with AIChatbotScene**

```jsx
function AIChatbotScene() {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{
      background: 'radial-gradient(circle at 22% 12%, rgba(167,139,250,0.22), transparent 34%), radial-gradient(circle at 80% 76%, rgba(45,212,168,0.18), transparent 30%), #0D1B16',
      padding: 80,
    }}>
      <SceneLabel frame={frame} text="Ask anything." />
      <AccentBlob frame={frame} color="violet" size={180} bottom={-50} right={-50} delay={8} shape="blob" />

      {/* Brain mascot */}
      <div style={{
        position: 'absolute', bottom: 140, right: 80,
        width: 120, height: 120, borderRadius: '60% 40% 55% 45% / 45% 55% 40% 60%',
        background: '#a78bfa33', border: '3px solid #a78bfa55',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: interpolate(frame, [8, 24], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        transform: `scale(${interpolate(frame, [8, 24], [0.6, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})`,
      }}>
        <span style={{ fontSize: 52 }}>🧠</span>
      </div>

      <div style={{ position: 'absolute', left: 80, right: 200, top: 200 }}>
        <ChatBubble frame={frame} text="What changed after dinner?" align="right" color="#183c32" textColor="#dffcf3" delay={10} />
        <ChatBubble frame={frame} text="Dinner carbs + a late bolus explain the rise. Correction stabilised by 10pm." align="left" color="#1f2738" textColor="#dbeafe" delay={35} fontSize={27} />
        <ChatBubble frame={frame} text="Should I adjust my ICR?" align="right" color="#183c32" textColor="#dffcf3" delay={65} />
      </div>
    </AbsoluteFill>
  );
}
```

**Step 2: Update Sequence**

Change:
```jsx
<Sequence from={660} durationInFrames={150}>
  <CopilotScene />
</Sequence>
```
to:
```jsx
<Sequence from={510} durationInFrames={120}>
  <AIChatbotScene />
</Sequence>
```

**Step 3: Verify in studio** — frames 510–630, 3 chat bubbles animate in staggered, brain blob appears.

**Step 4: Commit**

```bash
git add src/remotion/BetaTraceAd.jsx
git commit -m "feat(remotion): add AIChatbotScene with chat bubbles and brain mascot"
```

---

## Task 8: Nightscout Sync Scene (frames 630–720) — NEW

**Files:**
- Modify: `src/remotion/BetaTraceAd.jsx` — add `NightscoutSyncScene` + Sequence

**Step 1: Add NightscoutSyncScene**

```jsx
function NightscoutSyncScene() {
  const frame = useCurrentFrame();

  const streamProgress = interpolate(frame, [15, 75], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const readings = ['142 mg/dL', '138 mg/dL', '141 mg/dL', '145 mg/dL', '149 mg/dL'];

  return (
    <AbsoluteFill style={{ backgroundColor: '#0D1B16', padding: 80 }}>
      <SceneLabel frame={frame} text="Live CGM data. No manual entry." />
      <AccentBlob frame={frame} color="sky" size={160} bottom={60} left={40} delay={6} />

      {/* Sync card */}
      <div style={{
        marginTop: 170, borderRadius: 28, background: '#10251f',
        border: '2px solid #38bdf844', padding: '32px 36px',
        opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 28 }}>
          <div style={{
            width: 16, height: 16, borderRadius: '50%', background: '#10b981',
            boxShadow: `0 0 ${12 + Math.sin(frame * 0.3) * 6}px #10b981`,
          }} />
          <div style={{ color: '#10b981', fontFamily: 'Inter, Arial, sans-serif', fontSize: 26, fontWeight: 700 }}>Nightscout · Live</div>
          <div style={{ marginLeft: 'auto', color: '#6b8a80', fontFamily: 'JetBrains Mono, Consolas, monospace', fontSize: 22 }}>288 readings</div>
        </div>

        {/* Streaming readings */}
        {readings.map((r, i) => {
          const itemProgress = interpolate(frame - 20 - i * 8, [0, 14], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });
          return (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 0', borderBottom: i < readings.length - 1 ? '1px solid #1a3d31' : 'none',
              opacity: itemProgress,
              transform: `translateX(${-20 * (1 - itemProgress)}px)`,
            }}>
              <div style={{ color: '#6b8a80', fontFamily: 'JetBrains Mono, Consolas, monospace', fontSize: 22 }}>
                {`${5 * (i + 1)}m ago`}
              </div>
              <div style={{ color: '#2dd4a8', fontFamily: 'JetBrains Mono, Consolas, monospace', fontSize: 30, fontWeight: 700 }}>{r}</div>
            </div>
          );
        })}

        {/* Progress bar */}
        <div style={{ marginTop: 24, height: 6, borderRadius: 999, background: '#132b23', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${streamProgress * 100}%`, background: 'linear-gradient(90deg, #38bdf8, #2dd4a8)', borderRadius: 999 }} />
        </div>
      </div>
    </AbsoluteFill>
  );
}
```

**Step 2: Add Sequence**

After AIChatbotScene Sequence, add:
```jsx
<Sequence from={630} durationInFrames={90}>
  <NightscoutSyncScene />
</Sequence>
```

**Step 3: Verify in studio** — frames 630–720, readings stream in, pulsing green dot, progress bar fills.

**Step 4: Commit**

```bash
git add src/remotion/BetaTraceAd.jsx
git commit -m "feat(remotion): add NightscoutSyncScene with streaming readings"
```

---

## Task 9: Brand Statement Scene (frames 720–810)

**Files:**
- Modify: `src/remotion/BetaTraceAd.jsx` — add `BrandStatementScene` + Sequence

**Step 1: Add BrandStatementScene**

```jsx
function BrandStatementScene() {
  const frame = useCurrentFrame();

  const textOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const underlineWidth = interpolate(frame, [24, 70], [0, 100], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(180deg, #0d1b16 0%, #07110e 100%)',
      alignItems: 'center', justifyContent: 'center', padding: 80,
    }}>
      <div style={{ textAlign: 'center', opacity: textOpacity }}>
        <div style={{
          color: '#e8f5f0',
          fontFamily: 'Georgia, serif',
          fontSize: 72,
          fontWeight: 500,
          fontStyle: 'italic',
          lineHeight: 1.2,
          marginBottom: 36,
        }}>
          "Built for Type 1.<br />By someone who gets it."
        </div>
        <div style={{
          height: 4, borderRadius: 999,
          background: 'linear-gradient(90deg, #2dd4a8, #10b981)',
          width: `${underlineWidth}%`,
          margin: '0 auto',
        }} />
        <div style={{
          color: '#6b8a80',
          fontFamily: 'Inter, Arial, sans-serif',
          fontSize: 28,
          marginTop: 32,
          opacity: interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}>
          Named after beta cells — the ones we're missing.
        </div>
      </div>
    </AbsoluteFill>
  );
}
```

**Step 2: Add Sequence**

```jsx
<Sequence from={720} durationInFrames={90}>
  <BrandStatementScene />
</Sequence>
```

**Step 3: Verify in studio** — frames 720–810, italic quote fades in, teal underline draws across, subtitle fades.

**Step 4: Commit**

```bash
git add src/remotion/BetaTraceAd.jsx
git commit -m "feat(remotion): add BrandStatementScene with animated teal underline"
```

---

## Task 10: End Card Scene (frames 810–900)

**Files:**
- Modify: `src/remotion/BetaTraceAd.jsx` — replace `CtaScene` + Sequence

**Step 1: Replace CtaScene with EndCardScene**

```jsx
function EndCardScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 18, stiffness: 100 } });
  const linksOpacity = interpolate(frame, [35, 55], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{
      background: 'radial-gradient(circle at 50% 36%, rgba(45,212,168,0.28), transparent 34%), linear-gradient(180deg, #0d1b16, #07110e)',
      alignItems: 'center', justifyContent: 'center', padding: 90,
    }}>
      <Img src={staticFile('favicon.svg')} style={{
        width: 120, height: 120,
        transform: `scale(${logoScale})`,
        filter: 'drop-shadow(0 0 28px rgba(45,212,168,0.4))',
        marginBottom: 32,
      }} />
      <h1 style={{
        color: '#e8f5f0', fontFamily: 'Georgia, serif',
        fontSize: 100, fontWeight: 500, lineHeight: 0.92,
        textAlign: 'center', margin: 0,
      }}>
        Betatrace
      </h1>
      <div style={{
        marginTop: 48, borderRadius: 999, background: '#2dd4a8',
        color: '#0d1b16', fontFamily: 'Inter, Arial, sans-serif',
        fontSize: 32, fontWeight: 900, padding: '20px 44px',
        transform: `scale(${logoScale})`,
      }}>
        Get Started
      </div>

      {/* Links */}
      <div style={{
        marginTop: 48, display: 'flex', gap: 40, opacity: linksOpacity,
        alignItems: 'center',
      }}>
        <div style={{ color: '#6b8a80', fontFamily: 'JetBrains Mono, Consolas, monospace', fontSize: 22 }}>
          github.com/Davey2Waveyy/t1d
        </div>
        <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#2dd4a8' }} />
        <div style={{ color: '#6b8a80', fontFamily: 'JetBrains Mono, Consolas, monospace', fontSize: 22 }}>
          linkedin.com/in/david-cilliers
        </div>
      </div>
    </AbsoluteFill>
  );
}
```

**Step 2: Update Sequence**

Change:
```jsx
<Sequence from={810} durationInFrames={90}>
  <CtaScene />
</Sequence>
```
to:
```jsx
<Sequence from={810} durationInFrames={90}>
  <EndCardScene />
</Sequence>
```

**Step 3: Verify in studio** — frames 810–900, logo springs in, "Get Started" button appears, GitHub + LinkedIn links fade in.

**Step 4: Commit**

```bash
git add src/remotion/BetaTraceAd.jsx
git commit -m "feat(remotion): add EndCardScene with GitHub and LinkedIn links"
```

---

## Task 11: Remove Orphaned Sequences + Import Cleanup

**Files:**
- Modify: `src/remotion/BetaTraceAd.jsx`

**Step 1: Remove leftover old Sequence blocks**

After all new scenes are in place, check the root return for any Sequences referencing removed scenes (`HookScene`, `BrandScene`, `DashboardScene`, `IntelligenceScene`, `CopilotScene`, `CtaScene`). Delete them.

Verify total coverage: `0–60, 60–180, 180–270, 270–390, 390–510, 510–630, 630–720, 720–810, 810–900` — no gaps, no overlaps.

**Step 2: Remove unused function definitions**

Delete: `HookScene`, `BrandScene`, `DashboardScene`, `LoggingScene` (old version), `IntelligenceScene`, `CopilotScene`, `CtaScene`.

Keep: `AnimatedGlucoseLine`, `easedProgress`, `fade`, `palette`, `logRows`, `intelligenceCards` (or clean up unused constants too).

**Step 3: Add component imports**

At the top of `BetaTraceAd.jsx`, import shared components:
```jsx
import AccentBlob from './components/AccentBlob.jsx';
import SceneLabel from './components/SceneLabel.jsx';
import StatCard from './components/StatCard.jsx';
import AlertBadge from './components/AlertBadge.jsx';
import ChatBubble from './components/ChatBubble.jsx';
```

**Step 4: Run full studio preview**

```bash
npm run remotion:studio
```

Scrub from frame 0 to 900. Verify all 9 scenes appear in correct order with no blank frames.

**Step 5: Commit**

```bash
git add src/remotion/BetaTraceAd.jsx
git commit -m "refactor(remotion): remove orphaned scenes, clean up imports"
```

---

## Task 12: Music Track + Fade

**Files:**
- Modify: `src/remotion/BetaTraceAd.jsx` — verify Audio src and volume curve

**Step 1: Verify asset path**

The existing code references `staticFile('remotion/betatrace-pulse.wav')`. Confirm the file exists at `public/remotion/betatrace-pulse.wav`. If replacing with a new high-energy track, drop it in that folder.

```bash
ls public/remotion/
```

**Step 2: Update Audio volume envelope if needed**

The existing fade-in / fade-out is:
```jsx
volume={(audioFrame) =>
  interpolate(audioFrame, [0, fps, durationInFrames - fps, durationInFrames], [0, 0.55, 0.55, 0], ...)
}
```

Adjust the max volume (currently `0.55`) and fade points to taste. For high-energy track, `0.7` is reasonable.

**Step 3: Verify audio in studio** — play through in Remotion Studio (requires a real audio file).

**Step 4: Commit if changed**

```bash
git add src/remotion/BetaTraceAd.jsx public/remotion/
git commit -m "feat(remotion): update music track and volume envelope"
```

---

## Task 13: Render Final Video

**Step 1: Run render**

```bash
npm run remotion:render
```

Output: `out/betatrace-ad.mp4`

**Step 2: Review output**

Open `out/betatrace-ad.mp4` and verify:
- [ ] All 9 scenes appear in correct order
- [ ] Hard cuts between scenes (no fades except Brand Statement)
- [ ] Stat cards count up
- [ ] Confidence bar animates
- [ ] Alert badges drop in with correct colors (rose, amber, teal)
- [ ] Chat bubbles stagger in
- [ ] Nightscout readings stream in
- [ ] Teal underline draws across on Brand Statement
- [ ] End card shows GitHub + LinkedIn links
- [ ] Audio fades in at start, fades out at end

**Step 3: Commit final output reference**

```bash
git add out/betatrace-ad.mp4
git commit -m "feat: render betatrace promo video v1"
```

---

## Quick Reference: Final Sequence Layout

```
<Sequence from={0}   durationInFrames={60}>  <ColdOpen />            </Sequence>
<Sequence from={60}  durationInFrames={120}> <CommandCenter />       </Sequence>
<Sequence from={180} durationInFrames={90}>  <LoggingScene />        </Sequence>
<Sequence from={270} durationInFrames={120}> <ICRPredictorScene />   </Sequence>
<Sequence from={390} durationInFrames={120}> <PatternAlertsScene />  </Sequence>
<Sequence from={510} durationInFrames={120}> <AIChatbotScene />      </Sequence>
<Sequence from={630} durationInFrames={90}>  <NightscoutSyncScene /> </Sequence>
<Sequence from={720} durationInFrames={90}>  <BrandStatementScene /> </Sequence>
<Sequence from={810} durationInFrames={90}>  <EndCardScene />        </Sequence>
```
