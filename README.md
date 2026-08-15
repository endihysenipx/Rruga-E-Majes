# Udhëtari

Udhëtari is an offline-first Expo/React Native fantasy walking adventure inspired by the mountains and stories of Kosovo and Albania. Real-world steps are converted into progress through virtual journeys; the included development provider produces deterministic-style demo walks without requiring health permissions.

> Route lengths are balanced for gameplay. Udhëtari is not a hiking navigation app and must not be used as real-world route guidance.

## Architecture

- `app/` contains Expo Router screens: onboarding, tab navigation, journey details, and achievements.
- `src/domain/` contains framework-independent models and progression rules.
- `src/data/` contains replaceable seeded journeys, quests, achievements, and regions.
- `src/store/` contains the Zustand game state and derived selectors.
- `src/services/steps/` isolates mock, HealthKit, and Health Connect providers behind one interface.
- `src/services/database.ts` stores the versioned offline state in SQLite with WAL enabled.
- `src/services/cloud/` defines the future Supabase sync boundary without sending any data.
- `src/components/`, `src/theme/`, `src/config/`, and `src/i18n/` hold reusable presentation primitives, tokens, replaceable visual configuration, and translations.

## Run locally

Use Node.js `20.19.4` or newer. The app targets Expo SDK 54 for compatibility with Expo Go 54 on iPhone.

```bash
npm install
npm run start
```

Then press `a` for an Android emulator/device, or scan the QR code with Expo Go.

```bash
npm run android
npm run ios
```

`npm run ios` requires macOS for the iOS Simulator. From Windows, run the project on a physical iPhone through Expo Go, or use EAS Build for a native iOS build.

## Quality checks

```bash
npm run typecheck
npm run lint
npm test
npm run check
```

## Milestones

- Milestone 1 (implemented): project structure, routing, theme, English/Albanian localization, onboarding, mock steps, journey/home, explore, route details, quests, achievements, profile, SQLite persistence, loading/error/empty states, and unit tests.
- Milestone 2: native HealthKit and Health Connect packages, entitlements and permission screens, background sync, complete calendar/week streak accounting, quest claiming, checkpoint presentation, and production-grade timezone migration.
- Milestone 3: Supabase authentication and consented cloud backup, friends, leaderboards, conflict resolution, and privacy controls.

## Privacy assumption

Milestone 1 writes step totals only to local SQLite. The cloud gateway is deliberately inert. Raw health samples must never be uploaded unless a future consent flow explicitly enables it.
