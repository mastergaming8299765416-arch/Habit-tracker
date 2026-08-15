# Habit Tracker

A digital monthly habit tracker: tap-to-mark grid, auto-generated score graph,
streaks, and per-user private data. Built with **Next.js 14 (App Router)** +
**Supabase** (Postgres + Auth). Deploys free on **Vercel + Supabase**.

## What's included

- Email/password signup, login, password reset (Supabase Auth)
- Monthly grid: habits as rows, days 1–31 as columns, tap a cell to cycle
  empty → done → partial → empty
- Auto-calculated daily score + line graph (recharts) — no manual math
- Stats page: completion %, current streak, longest streak, best day
- Manage Habits page: add / rename / delete / reorder, plus
  "carry over from previous month"
- Month switcher (view/edit any month, past or future)
- CSV export of the current month's grid
- Hidden admin area at `/secure-admin-x7q9` (not linked anywhere in the
  normal UI) — read-only view of every user's grid, plus basic analytics
  (total users, active this week/month, most common habits)
- **Security is enforced at the database level**, not just in the UI: every
  table has Postgres Row-Level Security policies, so even if someone bypassed
  the frontend entirely, the database itself would refuse to return another
  user's rows.

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → New Project. Pick a name,
   password, and region. Wait ~2 minutes for it to provision.
2. In the left sidebar, go to **SQL Editor → New query**, paste the entire
   contents of `supabase/schema.sql` from this project, and click **Run**.
   This creates the `profiles`, `habits`, and `daily_logs` tables, the
   trigger that auto-creates a profile on signup, and all RLS policies.
3. Go to **Project Settings → API**. Copy the **Project URL** and the
   **anon public** key — you'll need both in step 3.
4. (Recommended) Go to **Authentication → Providers → Email** and turn
   **off** "Confirm email" only if you want instant signup during testing;
   leave it **on** for production so people verify real emails.
5. Go to **Authentication → URL Configuration** and set your Site URL
   (e.g. `https://your-app.vercel.app`) once you've deployed, so password
   reset links point to the right place.

## 2. Run it locally

```bash
npm install
cp .env.example .env.local
# edit .env.local and paste your Supabase URL + anon key
npm run dev
```

Visit `http://localhost:3000` → you'll land on `/login`. Click
**Create account**, sign up, confirm your email if confirmation is on, then
log in.

## 3. Make yourself an admin

Regular signup never grants admin — there's no checkbox or setting for it
anywhere in the app, by design. To promote your own account:

1. Sign up normally once through `/signup`.
2. In Supabase, go to **SQL Editor** and run:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
3. Now go to `/secure-admin-x7q9` (not linked from the app — bookmark it)
   and log in with that same email/password. You'll land on a read-only
   admin dashboard.

If you want a different secret path, rename the
`app/secure-admin-x7q9` folder and update the `ADMIN_PATH` constant at the
top of `middleware.js` to match.

## 5. Enable Google and Facebook login (optional)

Email/password works out of the box. The app already has "Continue with
Google" and "Continue with Facebook" buttons built in — they just need to
be switched on in Supabase.

### Google

1. Go to [console.cloud.google.com](https://console.cloud.google.com/) →
   create a new project (or use an existing one).
2. Go to **APIs & Services → OAuth consent screen**. Choose **External**,
   fill in an app name and your email, and save (you don't need to submit
   for verification for personal/friend use — just add yourself and your
   friends as test users if it stays in "Testing" mode, or publish it for
   anyone to use without that limit).
3. Go to **APIs & Services → Credentials → Create Credentials → OAuth
   client ID**. Choose **Web application**.
4. Under **Authorized redirect URIs**, add:
   ```
   https://YOUR-PROJECT.supabase.co/auth/v1/callback
   ```
5. Click Create — you'll get a **Client ID** and **Client Secret**.
6. In Supabase, go to **Authentication → Providers → Google**, toggle it
   on, paste in the Client ID and Client Secret, and save.

Google login works immediately for any user, even while your Google
Cloud app is in "Testing" mode, as long as you've added their email as a
test user (or published the app).

### Facebook

1. Go to [developers.facebook.com](https://developers.facebook.com/apps) →
   **Create App** → choose **Consumer** as the app type.
2. In your new app, add the **Facebook Login** product.
3. Under Facebook Login → Settings, add this as a **Valid OAuth Redirect URI**:
   ```
   https://YOUR-PROJECT.supabase.co/auth/v1/callback
   ```
4. In your Facebook app's **Settings → Basic**, copy the **App ID** and
   **App Secret**.
5. In Supabase, go to **Authentication → Providers → Facebook**, toggle it
   on, and paste in the App ID and App Secret. Save.
6. While your Facebook app is in "Development" mode, only accounts you've
   added as testers/admins in the Facebook app can log in with it. To open
   it to everyone, submit the app for Facebook's App Review (needed for the
   `public_profile` and `email` permissions) and switch it to "Live" mode.

Both buttons already in the app will start working as soon as their
provider is turned on in Supabase — no code changes needed.

**Note on Instagram:** Meta doesn't offer a general-purpose "Login with
Instagram" for consumer apps — Instagram's login is tied to Facebook
Business/Creator accounts and the Graph API, meant for content and ads
tooling rather than app sign-in. Facebook login (above) covers the same
Meta account system for your users.

## 6. Deploy to Vercel

1. Push this project to a GitHub repo.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import
   the repo.
3. In the Vercel project's **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (same values as your `.env.local`)
4. Click **Deploy**. Once it's live, go back to Supabase →
   **Authentication → URL Configuration** and set the Site URL and Redirect
   URLs to your real `https://your-app.vercel.app` domain, so password
   reset and confirmation emails work correctly.

That's it — no server to manage, both the app and database scale on their
free tiers for personal/small use.

## How data privacy actually works

- Every `habits` and `daily_logs` row has a `user_id` column.
- Postgres RLS policies (in `schema.sql`) only allow a row to be
  read/written if `auth.uid() = user_id` — enforced by the database itself,
  independent of anything the frontend does.
- The admin role gets a narrow **read-only** exception to those same
  policies, checked against the `profiles.role` column.
- The admin route is additionally gated by `middleware.js`, which checks
  the logged-in user's role before allowing the page to render, and
  redirects regular users straight back to their own dashboard.

## Project structure

```
app/
  login/ signup/ forgot-password/ reset-password/   → auth pages
  dashboard/                                         → grid + graph (main page)
  dashboard/habits/                                  → add/edit/delete/reorder
  dashboard/stats/                                    → completion %, streaks
  secure-admin-x7q9/                                  → hidden admin login
  secure-admin-x7q9/dashboard/                        → read-only admin view
components/                                           → HabitGrid, ScoreGraph, etc.
lib/supabase/                                         → browser/server/middleware clients
lib/utils/                                            → streak math, CSV export
supabase/schema.sql                                   → run this once in Supabase
middleware.js                                         → route protection
```

## Extending it

- **Partial state color**: currently amber; edit `.cell-partial` in
  `app/globals.css`.
- **Reminders/notifications**: not included (would need a scheduled job —
  Supabase Edge Functions + `pg_cron`, or a Vercel Cron job hitting an
  email API like Resend).
- **Mobile app wrapper**: the UI is responsive out of the box; you could
  wrap it with Capacitor if you want an installable app icon.
