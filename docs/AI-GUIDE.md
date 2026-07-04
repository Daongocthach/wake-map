# AI Agent Guide

This document is the quick reference for AI coding agents working in the heat-treatment app.

## Current App Shape

- `app/(auth)/login.tsx` handles authentication entry.
- `app/(main)/(tabs)/index.tsx` is the dashboard.
- `app/(main)/(tabs)/batches.tsx` is the batch list.
- `app/(main)/(tabs)/devices.tsx` is the device list.
- `app/(main)/(tabs)/alerts.tsx` is the alerts list.
- `app/(main)/batches/create.tsx`, `app/(main)/batches/[id].tsx`, `app/(main)/devices/create.tsx`, `app/(main)/devices/[id].tsx`, and `app/(main)/alerts/[id].tsx` handle detail/create flows outside the tab bar.
- `app/(main)/account.tsx`, `app/(main)/settings.tsx`, and `app/(main)/alert-settings.tsx` are main utility screens.

## Core Rules

- Use `useTranslation()` for every user-facing string.
- Use `react-native-unistyles` `StyleSheet.create((theme) => ...)`.
- Use theme tokens for all color and spacing values.
- Use `useAuthStore` for auth state.
- Use React Query for server state and mutations.
- Do not commit immediately after editing a file; inspect the diff, run `yarn validate`, and commit only after confirming the change set is correct.
- Use `yarn sync:version` when version/build values change.

## Feature Pattern

```
src/features/<feature>/
├── components/
├── constants/
├── hooks/
├── schemas/
├── services/
├── types/
└── utils/
```

## API Pattern

Service functions should unwrap Axios responses and return plain data:

```typescript
import { api } from '@/services/api';

export async function fetchItems() {
  const { data } = await api.get<Item[]>('/items');
  return data;
}
```

Login is handled by `src/features/auth/services/authService.ts`, which posts to `api/v1/auth/login/` and returns `{ user, session }`.

## Versioning

- `app.config.ts` is the source of truth for app version and build number.
- `package.json` mirrors the app version.
- `src/lib/constants/app-version.ts` exposes runtime constants.
- `scripts/sync-version.js` keeps them in sync.
