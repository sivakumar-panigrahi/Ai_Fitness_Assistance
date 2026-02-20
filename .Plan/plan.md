

## Fix App Reload When Returning to the Application

### Problem
Every time you leave the app and come back, it shows the full loading sequence ("Loading your fitness profile..." then "Analyzing your health profile...") even though all the data was just loaded moments ago. The recommendations are cached in localStorage but never used on startup.

### Root Cause
- `useRecommendations` initializes `recommendations` as `null` every time, even though it saves them to localStorage. This `null` value triggers a fresh API call to regenerate recommendations.
- `useUserData` refetches all database data on every mount with no short-term caching.

### Solution

**1. Load cached recommendations on startup (`src/hooks/useRecommendations.tsx`)**
- Initialize the `recommendations` state by reading from `localStorage` (the `cachedRecommendations` key that's already being written to).
- Add a staleness check: if the cache is less than 30 minutes old, use it directly. If older, still show it immediately but allow a background refresh.
- This eliminates the "Analyzing your health profile" loading screen on return visits.

**2. Add short-term data caching to `useUserData` (`src/hooks/useUserData.tsx`)**
- Cache the fetched user data (profile, health data, streak, badges, progress) in a module-level variable with a timestamp.
- On mount, if cached data exists and is less than 2 minutes old, use it immediately (set `loading` to `false` right away) and do a background refresh.
- This eliminates the "Loading your fitness profile..." spinner on quick return visits.

**3. Skip redundant recommendation generation (`src/pages/Index.tsx`)**
- Update the `useEffect` that triggers `generateRecommendations` to also check if recommendations were already loaded from cache, avoiding unnecessary API calls.

### What the user will experience after the fix
- Switching away and coming back within a few minutes: dashboard appears instantly with no loading screens.
- After a longer absence (30+ minutes): cached content shows immediately, then quietly refreshes in the background if needed.

### Technical Details

**File: `src/hooks/useRecommendations.tsx`**
- Change `useState<FitnessRecommendation | null>(null)` to a lazy initializer that reads from `localStorage.getItem('cachedRecommendations')`.
- Parse the cached JSON and check if `timestamp` is within 30 minutes. If valid, return the cached recommendations as the initial state.

**File: `src/hooks/useUserData.tsx`**
- Add a module-level cache object: `let dataCache = { data: null, timestamp: 0 }`.
- In `fetchUserData`, before making API calls, check if cache is fresh (< 2 min). If so, populate state from cache and set `loading = false`. Still fetch in background to keep data fresh.
- After a successful fetch, update the cache.

**File: `src/pages/Index.tsx`**
- In the `useEffect`, the existing condition `!recommendations` already handles this -- once recommendations are loaded from cache, it won't re-trigger. No change needed here.

