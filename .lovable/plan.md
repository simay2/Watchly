## Phase 1: Database Schema
Add new tables via migrations:
- **user_preferences** — stores quiz answers (viewer_type, genres, dislikes, mood, companion, time, surprise, ratings) per user
- **favorites** — stores saved/liked movies per user
- **swipe_history** — stores each swipe action (liked/skipped) per user
- Add `onboarding_completed` column to existing `profiles` table
- All tables with proper RLS policies

## Phase 2: Auth & Profile Updates
- Update `AuthContext` to include `onboarding_completed` flag
- Update `UserMenu` component with logout and username display (already exists, minor tweaks)

## Phase 3: New Pages & Routes
- **Recommendations page** — main post-onboarding experience with swipe cards
- **Favorites page** — list of saved movies
- **Swipe History page** — log of all swipes
- **Profile/Preferences page** — lightweight preference update panel
- Add navigation between pages
- All routes protected, redirect to `/login` if unauthenticated

## Phase 4: Onboarding Flow Updates
- After quiz completion, save preferences to `user_preferences` table
- Set `onboarding_completed = true` on profile
- On login: check flag → quiz if false, recommendations if true

## Phase 5: Recommendation Engine Updates
- Load stored preferences + swipe history from Supabase
- Filter out already-swiped movies
- Save swipe actions and favorites to Supabase in real-time

## Phase 6: Quick Preference Update
- Add a lightweight panel on recommendations page to tweak genres/mood without redoing the full quiz
- Updates saved to `user_preferences`
