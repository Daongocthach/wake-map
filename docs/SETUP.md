# Setup Guide

## Prerequisites

- Node.js 18+
- Yarn 1.x
- Expo CLI via `yarn start` or `npx expo` if needed
- iOS Simulator or Android Emulator for native testing

## Install

```bash
yarn install
cp .env.example .env
yarn start
```

## Environment Variables

| Variable                   | Required | Description                            |
| -------------------------- | -------- | -------------------------------------- |
| `EXPO_PUBLIC_API_BASE_URL` | No       | API base URL                           |
| `EXPO_PUBLIC_SOCKET_URL`   | No       | Socket endpoint                        |
| `EXPO_PUBLIC_APP_ENV`      | No       | `development`, `staging`, `production` |

`src/config/env.ts` reads these values and falls back to the Expo app config extras when needed.

## Update Flow

When releasing a new app version:

1. Update `app.config.ts`
2. Run `yarn sync:version --version <x.y.z> --build <n>`
3. Verify `package.json` and `src/lib/constants/app-version.ts` are synced

## Common Scripts

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

## EAS Build

```bash
eas build --profile development --platform ios
eas build --profile preview --platform all
eas build --profile production --platform all
```
