# Betatrace Promo Video — Design Doc
**Date:** 2026-04-25  
**Format:** Remotion, 30s @ 30fps (900 frames)  
**Style:** Hybrid — flat illustrated accents + real app UI mockups  
**Approach:** Feature Blitz (rapid-fire, no narrative arc)  
**Audio:** High-energy music track, no voiceover  

---

## Scene Structure

| Frames | Time | Scene | Visual | Label |
|--------|------|-------|--------|-------|
| 0–60 | 0–2s | Cold Open | Teal orb pulses on black, "Betatrace" wordmark snaps in (Playfair Display) | — |
| 60–180 | 2–6s | Command Center | Dashboard animates in — 4 stat cards count up (glucose, TIR, insulin, carbs) | *"One workspace."* |
| 180–270 | 6–9s | Log Everything | Meal form → insulin form → glucose chart, each flashing 1s | *"Log meals. Insulin. Glucose."* |
| 270–390 | 9–13s | ICR Predictor | Confidence bar fills, per-meal cards stagger in | *"Auto-calculate your ratios."* |
| 390–510 | 13–17s | Pattern Alerts | Alert cards drop in with severity badges (rose → amber → teal) | *"Spot patterns before they become problems."* |
| 510–630 | 17–21s | AI Chatbot | Chat bubbles animate in, illustrated brain mascot peeks in corner | *"Ask anything."* |
| 630–720 | 21–24s | Nightscout Sync | Data stream animation: CGM device → app | *"Live CGM data. No manual entry."* |
| 720–810 | 24–27s | Brand Statement | Playfair italic on dark: *"Built for Type 1. By someone who gets it."* Teal underline draws across | — |
| 810–900 | 27–30s | End Card | Logo + "Get Started" teal button + github.com/Davey2Waveyy/t1d + LinkedIn | — |

---

## Visual Style

| Element | Spec |
|---------|------|
| Background | `#0D1B16` throughout — no per-scene background changes |
| Accent shapes | Flat geometric blobs/circles in teal `#2DD4A8`, emerald `#10B981`, violet `#A78BFA` |
| App UI | Real Betatrace components in phone/browser frame mockup, spring-animated |
| Feature labels | Inter Bold, white, all-caps, ~48px |
| Brand headlines | Playfair Display — brand statement scene only |
| Data numbers | JetBrains Mono, teal `#2DD4A8`, count-up on entrance |
| Transitions | Hard cuts between all feature scenes. Brand statement: 200ms fade-in only |
| Easing | `cubic-bezier(0.23, 1, 0.32, 1)` for UI elements; spring physics on stat cards |
| Music sync | Cut points align to beat drops via Remotion `useAudioData` + `visualizeAudio` |
| Illustrated accents | 1–2 flat geometric shapes per scene, animate in from off-screen in 150ms |

---

## Component Architecture

```
/remotion
  /src
    /compositions
      PromoVideo.tsx          ← root, 900 frames @ 30fps
    /scenes
      ColdOpen.tsx            ← 0–60f
      CommandCenter.tsx       ← 60–180f
      LogEverything.tsx       ← 180–270f
      ICRPredictor.tsx        ← 270–390f
      PatternAlerts.tsx       ← 390–510f
      AIChatbot.tsx           ← 510–630f
      NightscoutSync.tsx      ← 630–720f
      BrandStatement.tsx      ← 720–810f
      EndCard.tsx             ← 810–900f
    /components
      AppFrame.tsx            ← phone/browser mockup wrapper
      StatCard.tsx            ← animated metric card
      AlertBadge.tsx          ← severity badge
      ChatBubble.tsx          ← animated chat message
      AccentBlob.tsx          ← illustrated flat shape
      SceneLabel.tsx          ← bold white feature label
    /hooks
      useBeatSync.ts          ← music beat alignment
    /assets
      track.mp3
      betatrace-logo.svg
```

Each scene receives `from` and `durationInFrames` props, uses `useCurrentFrame` + `interpolate`. `<Series>` handles sequencing in `PromoVideo.tsx`.

---

## Brand Colors Reference

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#0D1B16` | All scenes |
| Primary accent | `#2DD4A8` | Labels, borders, data, CTA button |
| Emerald | `#10B981` | Positive indicators, accent blobs |
| Rose | `#FB7185` | Critical alerts |
| Amber | `#FBBF24` | Warning alerts |
| Violet | `#A78BFA` | AI/chatbot scene accent |

---

## End Card Links

- CTA: **"Get Started"**
- GitHub: `github.com/Davey2Waveyy/t1d`
- LinkedIn: `linkedin.com/in/david-cilliers`
