# Changelog

All notable changes to this project will be documented in this file.

---

## [v1.1.0] - 2026-06-11

### Added

- Add a complete gym training mode with gym plans, active strength sessions, exercise set tracking, session summaries, gym history and plan-based session starts
- Add gym plan management with import/export, section editing, exercise target sets and reusable exercise definitions
- Add exercise definition tracking with default fields, personal records, references, recent training sessions, search, create/edit flows and workout block suggestions
- Add SQLite persistence for workouts, workout sessions, gym plans, gym sessions, exercise definitions and training history using Drizzle and Expo SQLite
- Add one-time migration from the previous AsyncStorage workout and history stores
- Add workout version tracking so completed sessions keep stable workout snapshots after edits or deletion
- Add React Query hooks, repositories, services, seed helpers, mapper tests and service-focused integration tests for the SQLite data layer
- Add selection mode UI for workouts and history sessions with selected item outlines, shared selection state, reusable top bar actions and bulk removal confirmations

### Changed

- Expand history to support both HIIT workout sessions and gym training sessions
- Replace persisted workout and history Zustand stores with repository-backed data access and a draft-only workout store
- Improve workout, gym, exercise definition and session data integrity with typed app errors, generated i18n keys and version-based persistence rules
- Improve shared list, modal, search, metric, icon and pressed-state UI components across workout and gym flows
- Improve workout editing UX with keyboard-aware scrolling, input dropdown coordination and automatic scrolling to the first invalid block field
- Replace app JSON configuration with variant-aware Expo config and guarded native build scripts
- Replace custom ID generation with nanoid
- Revamp the light theme palette for neutral card, field, button and meta-card surfaces

### Fixed

- Prevent completed gym exercise sets from being edited
- Improve gym session discard and delete behavior so related records and unreferenced user exercise definitions are cleaned up correctly
- Improve gym localization consistency in English and Portuguese

## [v1.0.1] - 2026-05-08

### Fixed

- Prevent `Stepper` text from clipping under larger font settings by replacing fixed height with flexible minimum height
- Improve Workout Run screen usability when large font/display settings previously pushed exercise details behind the footer

## [v1.0.0] - 2026-05-03

### Added

#### Workout Builder

- Create, edit, search, favorite and delete saved workouts
- Build workouts from blocks, sets, timed exercises and rest periods
- Edit individual workout blocks with validation for sets, exercises, duration and reps
- Start a quick workout without saving it first

#### Guided Timer

- Run structured workouts with work, rest, set-rest and preparation phases
- Pause, resume, skip and end active workouts with deliberate confirmation flows
- Hold to start each block to prevent accidental workout progression
- Show animated phase progress, set progress, current exercise details and upcoming exercises during a session
- Play timing beeps with separate sound cues for step progress and final countdown moments

#### Workout History

- Save completed workout sessions locally
- Browse and search previous workout sessions
- View detailed session summaries with duration, sets, exercises, work time, rest time and paused time
- Reopen saved workouts from session history when the source workout still exists
- Track when a workout has changed since a historical session was completed

#### Sharing & Import

- Export workouts as `.arcw` files for sharing between devices
- Import `.arcw` workout files with validation and user-facing error handling
- Share workout completion cards from finished sessions
- Share saved workouts from the workout summary screen

#### Settings & Personalization

- Switch between light, dark and system theme modes
- Choose between multiple accent colors
- Enable or disable workout sound effects
- Switch the app language between English and Portuguese (Portugal)
- Persist workouts, settings and session history on device

#### App Experience

- Branded Arc Timer icon, splash screen, logo and visual identity
- Drawer navigation for Home, Workouts, History and Settings
- Home screen with quick workout access and recent workout sessions
- Dedicated workout summary screens with overview metrics and block details
- Responsive mobile layouts designed for compact screens and long workout names

[v1.0.0]: https://github.com/filipe-mendes-dev/arc-timer/releases/tag/v1.0.0
[v1.0.1]: https://github.com/filipe-mendes-dev/arc-timer/releases/tag/v1.0.1
