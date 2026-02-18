# Smart Bookmark App

## Problems I Ran Into & How I Solved Them

### 1. Tailwind CSS v4 `@apply` Not Working
**Problem:** My gradient background using `@apply bg-gradient-to-br from-slate-50 to-blue-50` threw "Cannot apply unknown utility class" error.

**Solution:** Tailwind v4 uses a different configuration system. I switched to applying classes directly in JSX (`className="bg-gradient-to-br..."`) instead of using `@apply` in CSS files.

### 2. Supabase "Unsupported Provider" Error
**Problem:** Got `{"code":400,"error_code":"validation_failed","msg":"Unsupported provider"}` when trying Google sign-in.

**Solution:** I was looking in the wrong tab! Google OAuth is configured under **Supabase Auth → Providers**, not "Third-Party Auth" (which is for Firebase/Clerk). Enabled Google there and added my Client ID/Secret.

### 3. Google OAuth Redirect URI Mismatch
**Problem:** `Error 400: redirect_uri_mismatch` - Google rejected my callback URL.

**Solution:** I had a typo! Copied the URL from Supabase dashboard (`https://z....supabase.co/auth/v1/callback`) but mistyped it in Google Cloud Console. Used the Copy button to get the exact URL and fixed the mismatch.

### 4. Auth Working Locally But Not on GitHub Codespaces
**Problem:** After Google auth, got `localhost refused to connect` because my dev server wasn't running.

**Solution:** Realized Codespaces uses a different URL (`https://...-3000.app.github.dev`). Added this full URL to both Google Cloud Console and Supabase redirect settings. Also discovered the `-3000` in the hostname is NOT the port - it's part of the name, so `window.location.origin` works correctly.

### 5. Double Port in URL (`:3000:3000`)
**Problem:** Got redirected to `https://...-3000.app.github.dev:3000/` with duplicate ports.

**Solution:** The `-3000` in the Codespaces URL is part of the hostname, not an actual port. Using `window.location.origin` handles this correctly without manual URL construction.

### 6. Flash of Login Page After OAuth
**Problem:** After Google redirected back, I briefly saw the login form before the main app loaded. Had to manually refresh.

**Solution:** Implemented a loading state that defaults to `true`. Added `supabase.auth.getSession()` check in `useEffect` to detect if user is already logged in. When `SIGNED_IN` event fires, I use `router.push("/")` combined with `router.refresh()` to force Next.js to re-evaluate the server component with the fresh session.

### 7. Real-Time Sync Not Working Across Tabs
**Problem:** Adding a bookmark in one tab didn't show in another tab without refresh.

**Solution:** Set up Supabase Realtime subscription in `BookmarkList.tsx` with `postgres_changes` listeners for INSERT, UPDATE, and DELETE events. Used `useCallback` for stable function references and proper cleanup in `useEffect` return.

### 8. Delete Not Reflecting in Other Tab
**Problem:** Real-time DELETE events weren't firing reliably with user_id filter.

**Solution:** Removed the `filter: user_id=eq.${userId}` from the DELETE subscription. Since Row Level Security (RLS) is enabled, Supabase only sends events for rows the user owns anyway. The filter was actually preventing events from reaching the client.

### 9. Static Bookmark Count Not Updating
**Problem:** The bookmark count in my server component (`page.tsx`) never updated when bookmarks were added/deleted.

**Solution:** The count was server-rendered once and never refreshed. I removed the fancy count widget from the server component and relied on the dynamic count in `BookmarkList.tsx` which updates via React state in real-time.

### 10. Vercel Deployment Redirecting to localhost
**Problem:** Deployed to Vercel but OAuth still redirected to `http://localhost:3000`.

**Solution:** Added the Vercel URL(s) to Google Cloud Console and Supabase:
- Production: `https://smart-bookmark-app-fe-1.vercel.app`

### 11. Supabase Key Confusion (ANON_KEY vs PUBLISHABLE_DEFAULT_KEY)
**Problem:** Didn't know which environment variable to use for the new `@supabase/ssr` package.

**Solution:** Researched the difference: `ANON_KEY` is for older `@supabase/supabase-js`, while `PUBLISHABLE_DEFAULT_KEY` is for newer `@supabase/ssr`. Used find-and-replace to update all 5 files (`client.ts`, `server.ts`, `middleware.ts`, `callback/route.ts`, `.env.local`) to use the new key name.

### 12. Next.js 15 Middleware Deprecation Warning
**Problem:** Got warning: `"middleware" file convention is deprecated. Please use "proxy" instead.`

**Solution:** Renamed `middleware.ts` to `proxy.ts` and exported `proxy` function instead of `middleware`. Updated the cookie handling to only set on response (not request) since direct request cookie modification doesn't work in the new pattern.

---
