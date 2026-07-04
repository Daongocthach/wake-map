# Architecture

## Overview

Heat Treatment is a production React Native Expo app for tracking heat treatment batches, monitoring furnace/device status, reviewing alerts, and managing account/settings screens.

## Stack

| Layer        | Technology                             |
| ------------ | -------------------------------------- |
| Framework    | React Native 0.83.6 + Expo SDK 55      |
| Routing      | `expo-router` with typed routes        |
| Language     | TypeScript 5.9 strict                  |
| Styling      | `react-native-unistyles` 3.x           |
| Server State | `@tanstack/react-query`                |
| Client State | Zustand                                |
| API Client   | Axios with auth/error interceptors     |
| i18n         | `react-i18next` (EN, VI, zh-CN, zh-TW) |
| Storage      | `react-native-mmkv`                    |
| Forms        | `react-hook-form` + `zod/v4`           |
| Testing      | Jest + `jest-expo`                     |

## Directory Structure

```text
app/
├── _layout.tsx
├── (auth)/
│   └── login.tsx
└── (main)/
    ├── _layout.tsx
    ├── account.tsx
    ├── alert-settings.tsx
    ├── alerts/[id].tsx
    ├── batches/[id].tsx
    ├── batches/create.tsx
    ├── devices/[id].tsx
    ├── devices/create.tsx
    ├── settings.tsx
    └── (tabs)/
        ├── index.tsx
        ├── batches.tsx
        ├── devices.tsx
        └── alerts.tsx

src/
├── common/components/   # 41 shared UI components
├── config/              # Env access
├── features/            # auth, alerts, batches, dashboard, devices
├── hooks/               # Global hooks
├── i18n/                # Locale config and translations
├── lib/constants/       # Runtime constants such as app version
├── providers/           # Query, auth, drawer, alert, bottom-sheet
├── services/api/        # Axios client and helpers
├── theme/               # Design tokens and metrics
├── types/               # Shared types
└── utils/               # Storage and utility helpers
```

## Key Patterns

### Auth

`useAuthStore` owns auth state. `useAuthInit()` hydrates the store from MMKV at startup.

### API

`src/services/api/client.ts` exports the shared Axios clients. Services unwrap responses before returning data.

### React Query

Server data lives in query hooks under `src/features/*/hooks`. Mutations invalidate the relevant query keys.

### Theme

`react-native-unistyles` provides semantic colors and responsive spacing tokens. Use tokens only, never raw color literals.

### Versioning

Runtime version data comes from `src/lib/constants/app-version.ts`. Release values are synced from `app.config.ts` and `package.json` with `yarn sync:version`.

## Adding Features

1. Add feature files under `src/features/<name>/`
2. Add screens under `app/(main)/` or the relevant route group
3. Add translation keys to all locale files
4. Use `yarn validate` before merging
