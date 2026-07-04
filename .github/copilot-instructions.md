# GitHub Copilot Instructions

Follow `AGENTS.md` and `CONVENTIONS.md`. Keep suggestions aligned with the actual source tree.

## Core Facts

- React Native 0.83.2 + Expo SDK 55
- expo-router with typed routes
- TypeScript 5.9 strict
- react-native-unistyles 3.x
- @tanstack/react-query + Zustand
- Supabase with graceful degradation
- Axios client in `@/services/api`
- react-i18next with English, Vietnamese, Simplified Chinese, and Traditional Chinese
- react-native-mmkv
- react-hook-form + zod/v4

## Commit Messages

Use Conventional Commits:

```text
type(scope): subject
```

- Valid types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `build`, `ci`, `revert`
- Always include a concrete scope
- Keep the subject short, specific, and lowercase unless a proper noun requires capitalization
- Output only the final commit subject line when asked for a commit message

## Coding Rules

- Use `StyleSheet` from `react-native-unistyles`.
- Never use inline styles, color literals, or hardcoded spacing.
- Use project components from `@/common/components`.
- Translate every user-facing string with `useTranslation` and update all locale files (`en.json`, `vi.json`, `zh-CN.json`, `zh-TW.json`).
- Auth lives only in `useAuthStore`.
- Use React Query for server state and Zustand selectors for client state.
- Use `@/services/api` for HTTP requests.
- Use `react-hook-form` with `zod/v4`.
- No `any`, no suppression comments, no `--no-verify`.
