# CLAUDE.md

Use `AGENTS.md` and `CONVENTIONS.md` as the source of truth. If this file conflicts with them, follow those documents.

## Project Overview

React Native Expo app for heat treatment operations. The app currently covers:

- authentication
- dashboard overview
- batch list/detail/create flows
- device list/detail/create flows
- alerts list/detail and alert settings
- account and settings screens

## Tech Stack

- React Native 0.83.6 + Expo SDK 55
- expo-router with typed routes
- TypeScript 5.9 strict
- react-native-unistyles 3.x
- @tanstack/react-query
- Zustand
- Axios
- react-i18next with EN, VI, zh-CN, zh-TW
- react-native-mmkv
- react-hook-form + zod/v4
- ESLint 9 + Prettier

## Commands

```bash
yarn start
yarn ios
yarn android
yarn type-check
yarn lint
yarn lint:fix
yarn format
yarn format:check
yarn validate
yarn test
yarn test:coverage
yarn sync:version
```

## Version Flow

- `app.config.ts` is the source of truth for app version and build number.
- `package.json` mirrors the release version.
- `src/lib/constants/app-version.ts` exposes runtime version constants.
- Run `yarn sync:version` after bumping version/build.

## Project Structure

```text
app/
├── _layout.tsx
├── +not-found.tsx
├── (auth)/
│   ├── _layout.tsx
│   └── login.tsx
└── (main)/
    ├── _layout.tsx
    ├── account.tsx
    ├── alert-settings.tsx
    ├── alerts/[id].tsx
    ├── batches/
    │   ├── [id].tsx
    │   └── create.tsx
    ├── devices/
    │   ├── [id].tsx
    │   └── create.tsx
    ├── settings.tsx
    └── (tabs)/
        ├── _layout.tsx
        ├── index.tsx
        ├── batches.tsx
        ├── devices.tsx
        └── alerts.tsx

src/
├── common/components/
├── config/
├── features/
├── hooks/
├── i18n/
├── lib/constants/
├── providers/
├── services/api/
├── theme/
├── types/
└── utils/
```

## Key Rules

- All user-facing text must go through `useTranslation`.
- No `any` types.
- No inline styles, color literals, or hardcoded spacing.
- Use `useAuthStore` for auth state.
- Use React Query for server state and Zustand selectors for client state.
- Keep `yarn validate` passing before completion.
