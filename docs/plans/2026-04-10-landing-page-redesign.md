# Landing Page Redesign

## Status: APPROVED - Ready for Implementation

## Goals
1. Add interactive backgrounds to make the landing page feel more polished
2. Update Features section to reflect current app capabilities (AI Chatbot, AI Dose Assistant, Nightscout)

---

## 1. Interactive Backgrounds

### Style: Glucose-themed particle mesh
- Floating nodes connected by lines that react to mouse movement
- Nodes pulse like glucose readings, color-coded (green in-range, amber/red out of range)
- Subtle parallax layers on scroll
- Animated gradient backdrop that shifts slowly

### Implementation
- Create `src/components/landing/ParticleBackground.jsx`
- Use canvas or SVG for performance
- Mouse position tracking (already exists in Hero.jsx, extend it)
- Add to Hero section behind content

---

## 2. Updated Features Section

### Current Features to KEEP (with updates):
1. **Meal Logging** - Keep as-is
2. **Insulin Tracking** - Keep as-is
3. **Glucose Trends** - Keep as-is
4. **Pattern Detection** - Keep as-is
5. **A1C Estimator** - Keep as-is

### Features to UPDATE:
6. **Dexcom Import** → **CGM Integration** - "Import from Dexcom Clarity or sync live with Nightscout. Your CGM data, always up to date."

### NEW Features to ADD:
7. **AI Assistant** (violet/fuchsia color)
   - Icon: MessageSquare or Bot
   - Title: "AI Assistant"
   - Description: "Chat with your data. Ask about trends, get insights, and understand your patterns with Gemini-powered analysis."

8. **Smart Dose Assistant** (fuchsia color)
   - Icon: Sparkles or Brain
   - Title: "Smart Dose Assistant"
   - Description: "AI-powered insulin recommendations based on your carbs, current glucose, and personal history."

### Features to REMOVE:
- **ICR Predictor** - Fold into AI features
- **Correction Factor** - Less prominent, keep in app but not landing

### Final Feature Order (8 cards):
1. Meal Logging (teal)
2. Insulin Tracking (sky)
3. Glucose Trends (emerald)
4. AI Assistant (violet) - NEW
5. Smart Dose Assistant (fuchsia) - NEW
6. CGM Integration (amber) - UPDATED
7. Pattern Detection (rose)
8. A1C Estimator (teal)

---

## 3. Additional Polish

### Hero Section:
- Stats (72% TIR, 6.4 A1C, 1:10 ICR) animate/count up when scrolling into view
- Use AnimatedCounter component

### Feature Cards:
- Subtle glow on hover matching accent color (already partially done)
- Ensure Emil design principles applied (done in previous session)

### Scroll Animations:
- Staggered reveals (already implemented with ScrollReveal)
- Parallax depth on background elements

---

## Files to Create/Modify

### Create:
- `src/components/landing/ParticleBackground.jsx` - Interactive canvas background
- `src/components/landing/ParticleBackground.css` - Styles

### Modify:
- `src/components/landing/Hero.jsx` - Add ParticleBackground, animated counters
- `src/components/landing/Features.jsx` - Update features array with new AI features
- `src/components/landing/Hero.css` - Adjust for new background

---

## Implementation Order

1. Create ParticleBackground component with mouse-reactive nodes
2. Integrate into Hero section
3. Update Features.jsx with new feature list
4. Add animated counters to Hero stats
5. Test and polish

---

## Design Approved By User: Yes
