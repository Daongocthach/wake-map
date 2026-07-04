# Heat Treatment

Production-grade React Native Expo app for heat treatment tracking, batch management, furnace monitoring, alert handling, and device management.

## Stack

- React Native 0.83.6 + Expo SDK 55
- expo-router with typed routes
- TypeScript 5.9 strict
- react-native-unistyles 3.x
- @tanstack/react-query
- Zustand
- Axios
- react-i18next with English, Vietnamese, Simplified Chinese, and Traditional Chinese
- react-native-mmkv
- react-hook-form + zod/v4
- Jest + jest-expo
- ESLint 9 flat config + Prettier

## Core Areas

- Auth login with Zustand-backed session storage
- Dashboard overview and charts
- Batch list, batch detail, and batch creation
- Device list, device detail, and device creation
- Alerts list, alert detail, and alert settings
- Account and settings screens
- Shared UI component library under `src/common/components`

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

`yarn validate` runs:

- `type-check`
- `lint`
- `format:check`
- `i18n:check`

## Version Sync

Keep these files aligned when bumping app version or build number:

- `app.config.ts`
- `package.json`
- `src/lib/constants/app-version.ts`

Use:

```bash
yarn sync:version --version 1.0.1 --build 2
```

If you omit arguments, the script syncs the current values already in the repo.

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

## Documentation

- [`AGENTS.md`](AGENTS.md): universal agent instructions
- [`CLAUDE.md`](CLAUDE.md): Claude/OpenAI agent summary
- [`CONVENTIONS.md`](CONVENTIONS.md): coding conventions and repo rules
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): architecture overview
- [`docs/SETUP.md`](docs/SETUP.md): local setup guide
- [`docs/PROCESS.md`](docs/PROCESS.md): product and workflow overview
- [`docs/AI-GUIDE.md`](docs/AI-GUIDE.md): AI pattern cookbook
- [`docs/COMPONENTS.md`](docs/COMPONENTS.md): shared component API reference
- [`docs/llms.txt`](docs/llms.txt): compact context summary
