# Betatrace - T1D Management App

## Project Overview
A Type 1 Diabetes management app that tracks meals, insulin, builds predictive models, optimizes insulin-to-carb ratios, and surfaces patterns.

## Tech Stack
- **Frontend**: React 19, Vite, React Router, Framer Motion, Recharts
- **Backend**: Supabase (Auth + PostgreSQL)
- **AI Chat**: Groq (Llama 3.3 70B) via Vercel serverless function
- **Deployment**: Vercel

## Supabase Configuration
- **Project ID**: `xteeeszbfvwjulpjudzo`
- **Region**: us-east-1
- See `.env.example` for required env vars (do not commit real values).

### Database Tables (all have RLS enabled)
1. `profiles` - User profiles (auto-created on signup via trigger)
2. `meals` - Meal logs (carbs, protein, fat, fiber, notes)
3. `insulin_doses` - Insulin records (type, units, brand, site)
4. `glucose_readings` - Blood glucose data (value, unit, source)
5. `user_settings` - ICR ratios, targets, preferences (auto-created via trigger)

### Auth Providers
- Email/password: Enabled
- Google OAuth: Configure in Supabase dashboard + Google Cloud Console.
  Redirect URI: `https://xteeeszbfvwjulpjudzo.supabase.co/auth/v1/callback`

## File Structure (key paths)

```
api/
└── chat.js                 # Vercel serverless fn — Groq proxy for demo chat
src/
├── lib/supabase.js         # Supabase client init
├── contexts/AuthContext.jsx
├── components/
│   ├── auth/               # LoginModal, etc.
│   ├── chat/DemoChat.jsx   # Floating demo chatbot (3-msg cap)
│   └── dashboard/          # Overview, MealLog, InsulinLog, ICRPredictor, ...
├── pages/
│   ├── Landing.jsx
│   └── Dashboard.jsx
└── App.jsx                 # Routes with ProtectedRoute wrapper
```

## Environment Variables
Local dev uses `.env.local` (gitignored). See `.env.example` for the schema.

| Var | Where | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Client (bundled) | Public |
| `VITE_SUPABASE_ANON_KEY` | Client (bundled) | Public, RLS-protected |
| `GROQ_API_KEY` | Server only (`/api/chat.js`) | Never prefix with `VITE_` |

In Vercel: add the same three under Project → Settings → Environment Variables.

## GitHub Repo
https://github.com/Davey2Waveyy/t1d
