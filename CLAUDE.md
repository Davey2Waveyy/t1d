# Betatrace - Auth Fix Session

## Branch: `feature/auth-fix`
## Priority: HIGH - Auth is broken, must fix first

---

## The Problem

**Sign In button does nothing.** No validation errors, no console output, nothing happens when clicked.

---

## Project Info

- **Repo**: https://github.com/Davey2Waveyy/t1d
- **Stack**: React 19, Vite, Supabase
- **Supabase Project**: `xteeeszbfvwjulpjudzo`
- **Run locally**: `cd C:\Users\dodgi\betatrace && npm run dev`

---

## Files to Debug

1. `src/components/auth/LoginModal.jsx` - The login form
2. `src/contexts/AuthContext.jsx` - Auth state and methods
3. `src/lib/supabase.js` - Supabase client
4. `src/App.jsx` - ProtectedRoute logic

---

## Debug Steps

### Step 1: Check if Supabase initializes
Add to `src/lib/supabase.js`:
```javascript
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase client created:', !!supabase)
```

### Step 2: Check if form submits
In `src/components/auth/LoginModal.jsx`, verify `handleSubmit` has:
```javascript
console.log('Form submitted', formData)
```

### Step 3: Check browser console
- Open http://localhost:5173
- Press F12 → Console tab
- Click Sign In
- Look for errors or logs

### Step 4: Check if button is inside form
Make sure the submit button has `type="submit"` and is inside the `<form>` tag.

---

## Expected Behavior When Fixed

1. **Empty fields** → Red error: "Please enter a valid email address"
2. **Invalid login** → Red error: "Invalid login credentials"
3. **Valid login** → Redirect to /dashboard
4. **Google button** → Redirect to Google OAuth (if configured)

---

## Environment

File `.env.local` must exist with:
```
VITE_SUPABASE_URL=https://xteeeszbfvwjulpjudzo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0ZWVlc3piZnZ3anVscGp1ZHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MjgyMzQsImV4cCI6MjA5MDUwNDIzNH0.2xSC5UG7FLCBcshdlWTQou_VGpd3aNELjQRawxcFXS8
```

---

## When Fixed

1. Test signup with real email
2. Test login works
3. Test logout works
4. Commit and merge to main:
```bash
git add -A && git commit -m "fix: Auth system working"
git checkout main && git merge feature/auth-fix
git push origin main
```
