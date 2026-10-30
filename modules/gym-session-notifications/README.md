# Gym session notifications

This local Expo module presents an Android custom notification and an iOS Live Activity. Session data and notification actions stay in the app's TypeScript layer. Native presentations never write to SQLite.

- Android uses `RemoteViews` and a system chronometer. No foreground service is required.
- iOS uses ActivityKit and SwiftUI's date timer on iOS 16.1 and newer. Older versions can still receive the scheduled reminder.
- Both presentations open the active session. End session opens the existing confirmation modal after validating the session ID.
- Dismissing a presentation does not finish the workout. A dismissed presentation is not recreated for that session.
- The 90-minute local reminder is managed independently by `expo-notifications`. Android delivery can be delayed by power management.

Regenerate the logo with `node scripts/generate-classic-assets.js --notifications-only`. Run Expo prebuild after native or widget changes, then rebuild the app. The config plugin recreates the iOS extension and embeds its assets; generated `ios/` and `android/` files are not the source of truth.

Verify on devices with notifications enabled and denied, and with Live Activities disabled. Check quick, plan, and repeated sessions; background and cold launches; cancellation and completion; stale action links; theme changes; Portuguese text; and elapsed times above one hour. iOS ends Live Activities after its system lifetime limit without ending the saved session.
