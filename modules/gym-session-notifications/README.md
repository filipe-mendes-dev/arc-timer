# Gym session notifications

This local Expo module presents an Android custom notification and an iOS Live Activity. Session data and notification actions stay in the app's TypeScript layer. Native presentations never write to SQLite.

- Android uses `RemoteViews` and a system chronometer. No foreground service is required.
- iOS uses ActivityKit and SwiftUI's date timer. The app requires iOS 16.4 or newer.
- Both presentations open the active session. End session opens the existing confirmation modal after validating the session ID.
- Dismissing a presentation does not finish the workout. A dismissed presentation is not recreated for that session.
- Session banners provide ongoing session information without a separate timed reminder. Old scheduled reminders are cancelled when the app opens or returns to the foreground.

Regenerate the logo with `node scripts/generate-classic-assets.js --notifications-only`. Run Expo prebuild after native or widget changes, then rebuild the app. The config plugin recreates the iOS extension and embeds its assets; generated `ios/` and `android/` files are not the source of truth.

Verify on devices with notifications enabled and denied, and with Live Activities disabled. Check quick, plan, and repeated sessions; background and cold launches; cancellation and completion; stale action links; theme changes; Portuguese text; and elapsed times above one hour. iOS ends Live Activities after its system lifetime limit without ending the saved session.
