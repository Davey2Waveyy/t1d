# Betatrace - T1D Management App

## Project Overview
A Type 1 Diabetes management app that tracks meals, insulin, builds predictive models, optimizes insulin-to-carb ratios, and surfaces patterns.

## Tech Stack
- **Frontend**: React 19, Vite, React Router, Framer Motion, Recharts
- **Backend**: Supabase (Auth + PostgreSQL)
- **Deployment**: Vercel (frontend configured)

## Supabase Configuration
- **Project ID**: `xteeeszbfvwjulpjudzo`
- **Project URL**: `https://xteeeszbfvwjulpjudzo.supabase.co`
- **Region**: us-east-1
- **Status**: Active

### Database Tables (all have RLS enabled)
1. `profiles` - User profiles (auto-created on signup via trigger)
2. `meals` - Meal logs (carbs, protein, fat, fiber, notes)
3. `insulin_doses` - Insulin records (type, units, brand, site)
4. `glucose_readings` - Blood glucose data (value, unit, source)
5. `user_settings` - ICR ratios, targets, preferences (auto-created via trigger)

### Auth Providers
- Email/password: Enabled (default)
- Google OAuth: Needs configuration in Supabase dashboard

## Bug Fixed (2026-03-31)
**Issue**: `fetchProfile` was being called before it was declared in AuthContext.jsx
**Fix**: Moved `fetchProfile` to a `useCallback` hook before the `useEffect` that uses it.

## Current Issues (NEEDS TESTING)

### Issue 1: Sign In Button - RETRY AFTER FIX
**Status**: Fixed the hoisting bug. Need to test again.

**To test**:
1. Stop dev server (Ctrl+C in terminal)
2. Run `npm run dev`
3. Open http://localhost:5173
4. Open browser DevTools (F12) → Console tab
5. Click Sign In with empty fields → should see "Form submitted" in console
6. Should show validation error in the modal

If still not working, check console for errors.

### Issue 2: Google OAuth Not Redirecting
**Symptom**: Clicking "Continue with Google" does nothing.

**To fix**:
1. Ensure Google is enabled in Supabase: https://supabase.com/dashboard/project/xteeeszbfvwjulpjudzo/auth/providers
2. Add Google OAuth credentials from Google Cloud Console
3. Add localhost redirect URI in Google Console:
   - `http://localhost:5173` (JavaScript origins)
   - `https://xteeeszbfvwjulpjudzo.supabase.co/auth/v1/callback` (redirect URI)

## File Structure (Auth-related)

```
src/
├── lib/
│   └── supabase.js          # Supabase client init
├── contexts/
│   └── AuthContext.jsx      # Auth state & methods (signIn, signUp, signInWithGoogle, signOut)
├── components/
│   └── auth/
│       ├── LoginModal.jsx   # Login/signup form
│       └── LoginModal.css   # Styles including error/success states
├── pages/
│   ├── Landing.jsx          # Public landing page
│   └── Dashboard.jsx        # Protected dashboard
└── App.jsx                  # Routes with ProtectedRoute wrapper
```

## Environment Variables
File: `.env.local` (gitignored)
```
VITE_SUPABASE_URL=https://xteeeszbfvwjulpjudzo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0ZWVlc3piZnZ3anVscGp1ZHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MjgyMzQsImV4cCI6MjA5MDUwNDIzNH0.2xSC5UG7FLCBcshdlWTQou_VGpd3aNELjQRawxcFXS8
```

## Next Steps
1. **Debug auth**: Stop dev server, restart, check browser console for errors
2. **Verify Supabase client**: Add console.log in supabase.js to confirm it initializes
3. **Test form submission**: Add console.log in handleSubmit to verify it's being called
4. **Complete Google OAuth**: Configure in Google Cloud Console + Supabase dashboard
5. **Wire up data forms**: Connect MealLog, InsulinLog components to save to database

## GitHub Repo
https://github.com/Davey2Waveyy/t1d
