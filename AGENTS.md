# AGENTS.md - Universal Agent Instructions

This file provides instructions for all AI agents (Claude Code, OpenAI Codex, Devin, SWE-agent, and others) working in this repository.

## Project Overview

A production-grade React Native Expo mobile application designed for **heat treatment** (xử lý nhiệt) tracking, monitoring, and management. It currently includes authentication, dashboard metrics, batch management, device management, alert review, and account/settings screens.

**Tech Stack:**

- React Native 0.83.6 + Expo SDK 55
- expo-router (file-based routing with typed routes)
- TypeScript 5.9 (strict mode)
- react-native-unistyles 3.x (styling with design tokens)
- @tanstack/react-query (server state management)
- Zustand (client state management)
- Supabase (authentication + database, graceful degradation if unconfigured)
- Axios HTTP client with interceptors
- react-i18next (English, Vietnamese, Simplified Chinese, and Traditional Chinese)
- react-native-mmkv (persistent key-value storage)
- react-hook-form + zod/v4 (forms and validation)
- Jest + jest-expo (testing)
- ESLint 9 flat config + Prettier

**Path Aliases:**

- `@/*` resolves to `src/*`
- `~/*` resolves to `app/*`

---

## Build and Test Commands

```bash
# Development
yarn start                 # Start Expo dev server
yarn ios                   # Run on iOS simulator
yarn android               # Run on Android emulator/device

# Type Checking
yarn type-check            # tsc --noEmit (must pass with zero errors)

# Linting
yarn lint                  # ESLint 9
yarn lint:fix              # Auto-fix ESLint violations

# Formatting
yarn format                # Prettier format all files
yarn format:check          # Check formatting (used in CI)

# Validation (run all checks)
yarn validate              # type-check + lint + format:check + i18n:check

# Version Sync
yarn sync:version          # Sync package.json, app.config.ts, and runtime app version constants

# Testing
yarn test                  # Run Jest test suite
yarn test:coverage         # Coverage report

# Before every commit
yarn validate              # Must pass with zero errors/warnings
```

## Package Manager

This repository uses `yarn` exclusively.

- Always use `yarn` instead of `npm`, `pnpm`, or `bun`
- Never run `npm install`, `npm run`, or `npx` unless the user explicitly asks
- Use `yarn`, `yarn add`, `yarn remove`, and `yarn <script>` for all dependency and script commands
- If an example command uses `npm`, convert it to the equivalent `yarn` command before running it

**IMPORTANT:** Always run `yarn validate` before completing a task. All checks (type-check, lint, format, i18n) must pass.

---

## Repository Structure

```
heat-treatment/
├── app/                        # Expo Router screens and layouts
│   ├── _layout.tsx             # Root layout (GestureHandlerRootView > ErrorBoundary > QueryProvider > AppAlertProvider > AppBottomSheetProvider > CameraProvider > AppContent)
│   ├── +not-found.tsx          # 404 screen
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   └── login.tsx
│   └── (main)/
│       ├── _layout.tsx
│       ├── account.tsx         # Account/Profile details
│       ├── alert-settings.tsx  # Alert settings screen
│       ├── settings.tsx        # Application settings and dark mode toggle
│       └── (tabs)/
│           ├── _layout.tsx     # Tab bar definition (Dashboard, Batches, Devices, Alerts)
│           ├── index.tsx       # Dashboard screen
│           ├── batches.tsx     # Batch list screen
│           ├── devices.tsx     # Device list screen
│           └── alerts.tsx      # Alerts list screen
├── src/
│   ├── common/components/      # 41 public shared UI components (see list in index.ts)
│   │   ├── Accordion/
│   │   ├── AppDrawer/
│   │   ├── AppHeader/
│   │   ├── AppImage/
│   │   ├── AppSwipeBack/
│   │   ├── Avatar/
│   │   ├── Badge/
│   │   ├── Button/
│   │   ├── CalendarStrip/
│   │   ├── Card/
│   │   ├── Checkbox/
│   │   ├── Chip/
│   │   ├── DateTimeField/
│   │   ├── Dialog/
│   │   ├── Divider/
│   │   ├── EmptyState/
│   │   ├── ErrorBoundary/
│   │   ├── FilterSheet/
│   │   ├── FormField/
│   │   ├── Icon/
│   │   ├── IconButton/
│   │   ├── Input/
│   │   ├── ListItem/
│   │   ├── Loading/
│   │   ├── Menu/
│   │   ├── MonthSelector/
│   │   ├── PaginatedList/
│   │   ├── ProgressBar/
│   │   ├── RadioGroup/
│   │   ├── SafeAreaModal/
│   │   ├── ScreenCard/
│   │   ├── ScreenContainer/
│   │   ├── SearchBar/
│   │   ├── SegmentedControl/
│   │   ├── Select/
│   │   ├── Skeleton/
│   │   ├── Snackbar/
│   │   ├── SubAppScreenCard/
│   │   ├── Switch/
│   │   ├── TabBar/
│   │   ├── TabView/
│   │   ├── Table/
│   │   ├── TabsHeader/
│   │   ├── Text/
│   │   ├── TextArea/
│   │   └── index.ts            # Top-level barrel
│   ├── config/
│   │   └── env.ts              # Centralized env config (EXPO_PUBLIC_* vars)
│   ├── features/               # Feature modules
│   │   ├── auth/               # auth feature (LoginForm, services, schemas)
│   │   ├── heat-treatment/     # heat treatment features
│   │   └── settings/           # Settings related features
│   ├── hooks/                  # Global hooks
│   │   ├── useBottomPadding.ts
│   │   ├── useNetworkStatus.ts
│   │   ├── useProtectedRoute.ts
│   │   └── useScreenDimensions.ts
│   ├── i18n/
│   │   ├── config.ts           # i18next initialization
│   │   └── locales/
│   │       ├── en.json         # English translations
│   │       ├── vi.json         # Vietnamese translations
│   │       ├── zh-CN.json      # Simplified Chinese translations
│   │       └── zh-TW.json      # Traditional Chinese translations
│   ├── providers/
│   │   ├── index.ts            # QueryProvider, auth store/init, bottom-sheet, alert exports
│   │   ├── auth/
│   │   │   └── authStore.ts    # useAuthStore (Zustand) + useAuthInit hook
│   │   ├── app-alert/
│   │   ├── bottom-sheet/
│   │   └── query/
│   │       └── mmkvPersister.ts
│   ├── services/api/
│   │   ├── client.ts           # Axios instance with interceptors
│   │   └── index.ts
│   ├── theme/
│   │   ├── light-theme.ts      # Light mode color tokens
│   │   ├── dark-theme.ts       # Dark mode color tokens
│   │   ├── metrics.ts          # rf(), hs(), vs(), spacing, spacingV, fontSize, borderRadius, iconSize
│   │   ├── fonts.ts
│   │   ├── config.ts           # Unistyles theme config
│   │   └── themeManager.ts     # Theme initialization
│   ├── types/                  # Global TypeScript types
│   └── utils/
│       └── storage/
│           ├── storage.ts      # MMKV wrapper
│           ├── useStorage.ts   # React hooks (useStorage, useStorageBoolean)
│           ├── constants.ts    # STORAGE_KEYS
│           └── types.ts
├── docs/
│   ├── AI-GUIDE.md             # Pattern cookbook for AI agents
│   ├── ARCHITECTURE.md         # Architecture overview
│   ├── COMPONENTS.md           # Full component API reference
│   ├── PROCESS.md              # Product workflow reference
│   ├── SETUP.md                # Setup guide
│   ├── llms.txt                # Plain text LLM context
│   └── MIGRATION.md            # Legacy migration note
├── CLAUDE.md                   # Claude Code project instructions
├── CONVENTIONS.md              # Coding conventions (source of truth)
├── AGENTS.md                   # This file
├── .cursorrules                # Cursor IDE rules
├── .cursor/rules/project.mdc  # Cursor MDC format rules
├── .windsurfrules              # Windsurf rules
├── .clinerules                 # Cline rules
├── .github/copilot-instructions.md  # GitHub Copilot instructions
└── .env.example                # Environment variable template
```

---

## Code Style Guidelines

### TypeScript

- **Strict mode is on.** No `any` types. Use `unknown` and narrow, or define proper types.
- **Type imports:** `import type { Foo } from './types'` for type-only imports.
- **Named exports** in `src/`: `export function MyComponent() {}` — never `export default` (exception: `app/` screen files which Expo Router requires to be default exports).
- **Interfaces** for object shapes: `interface ButtonProps {}`. **Type aliases** for unions: `type ButtonVariant = 'primary' | 'secondary'`.

### Styling

**Critical:** This project uses `react-native-unistyles`, not React Native's built-in `StyleSheet`.

```typescript
// ALWAYS - import from unistyles
import { StyleSheet } from 'react-native-unistyles';

// ALWAYS - theme callback form
const styles = StyleSheet.create((theme) => ({
  container: {
    padding: theme.metrics.spacing.p16, // not 16
    backgroundColor: theme.colors.background.surface, // not '#FFFFFF'
    borderRadius: theme.metrics.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  text: {
    fontSize: theme.fonts.size.md,
    color: theme.colors.text.primary,
  },
}));

// NEVER - inline styles
// NEVER - color literals (#fff, 'white', '#6366F1')
// NEVER - raw numbers for spacing (padding: 16)
```

Responsive helpers from `@/theme/metrics`:

```typescript
import { rf, hs, vs } from '@/theme/metrics';
rf(16); // responsive font (scales with screen width)
hs(20); // horizontal scale
vs(24); // vertical scale
```

### Components

**41 public shared components** in `src/common/components/`. Each has a directory with `ComponentName.tsx`, optional component files, and is exported from the top-level barrel `src/common/components/index.ts`.

Use project components instead of React Native primitives:

```typescript
// Text - always project Text for UI strings
import { Text } from '@/common/components/Text';
<Text variant="h1">{t('home.title')}</Text>  // variants: h1-h3, body, bodySmall, caption, label, overline

// Button - variants: primary, secondary, outline, ghost | sizes: sm, md, lg
import { Button } from '@/common/components/Button';
<Button title={t('actions.save')} variant="primary" loading={isPending} onPress={fn} />

// Icon - Lucide-backed project icon components, variants: primary, secondary, tertiary, muted, inverse, accent
import { Icon } from '@/common/components/Icon';
import { Home } from 'lucide-react-native';
<Icon icon={Home} variant="primary" size={20} />

// ScreenContainer - every screen root
import { ScreenContainer } from '@/common/components/ScreenContainer';
<ScreenContainer scrollable padded>{/* content */}</ScreenContainer>
```

Import from barrels: `@/common/components/Button` — not `@/common/components/Button/Button`.

### i18n

All user-facing strings go through `useTranslation`. This is non-negotiable.

```typescript
const { t } = useTranslation();
<Text>{t('home.welcome')}</Text>         // CORRECT
<Text>Welcome</Text>                     // WRONG

// Always update all locale files when adding text:
// src/i18n/locales/en.json, vi.json, zh-CN.json, and zh-TW.json
```

Zod validation messages use i18n keys:

```typescript
z.string().min(1, 'validation.required'); // key, not raw text
```

### State Management

**Server state** → React Query:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => api.get<Product[]>('/products').then((r) => r.data),
  });
}
```

**Client state** → Zustand with selectors:

```typescript
import { useAuthStore } from '@/providers/auth/authStore';
const user = useAuthStore((s) => s.user); // CORRECT - selector
const { user } = useAuthStore(); // WRONG - no selector
```

**Auth state** — exclusively `useAuthStore`. Never create React Context for auth.

### API

```typescript
import { api } from '@/services/api';
// Bearer token auto-attached from useAuthStore.getState().session
// 401 responses auto-call clearSession()
// All errors normalized to Error with .message string

const products = await api.get<Product[]>('/products').then((r) => r.data);
const product = await api.post<Product>('/products', data).then((r) => r.data);
```

- In `services/`, unwrap Axios responses before returning: `const { data } = await api.get<ApiResponse<T>>(...)` then `return data`.
- Prefer returning the API payload object, not the raw `AxiosResponse`, so hooks can read `response.data` consistently.

### Forms

```typescript
import { z } from 'zod/v4'; // zod/v4 not zod

const schema = z.object({
  email: z.email('validation.emailInvalid'),
  password: z.string().min(8, 'validation.passwordMin'),
});

type FormData = z.infer<typeof schema>;

const {
  control,
  handleSubmit,
  formState: { errors },
} = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: { email: '', password: '' },
});
```

---

## Testing Instructions

Test files live next to the files they test: `Button/Button.test.tsx`.

```typescript
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button', () => {
  it('renders with title', () => {
    render(<Button title="Submit" onPress={jest.fn()} />);
    expect(screen.getByText('Submit')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    render(<Button title="Submit" onPress={onPress} />);
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button title="Submit" loading onPress={jest.fn()} />);
    expect(screen.getByRole('button')).toHaveAccessibilityState({ busy: true });
  });
});
```

Test environment is configured in `jest.config.ts` and `jest.setup.ts`. Run `yarn test` to execute. Run `yarn test:coverage` for coverage.

---

## Development Environment Tips

### Environment Variables

Copy `.env.example` to `.env` and fill in values. Variables are accessed through `src/config/env.ts`:

```typescript
import { env } from '@/config/env';
env.apiBaseUrl;
env.appEnv; // 'development' | 'staging' | 'production'
env.isDev; // boolean
env.isProd; // boolean
```

All env vars use the `EXPO_PUBLIC_` prefix to be accessible on the client.

### Theme

The app supports light and dark modes via react-native-unistyles. Theme tokens are defined in `src/theme/light-theme.ts` and `src/theme/dark-theme.ts`. Always use `theme.colors.*` tokens — never hardcode colors.

### i18n

The app currently supports English, Vietnamese, Simplified Chinese, and Traditional Chinese. Keep all locale files in sync when adding or changing user-facing text.

---

## PR and Commit Guidelines

### Commit Format

```
<type>(<scope>): <subject>

Types: feat, fix, refactor, docs, test, chore, perf, build, ci, revert
Scope: The main area changed, such as home, settings, layout, theme, i18n, api, storage, or showcase

Examples:
  feat(home): redesign dashboard layout
  fix(layout): prevent tab bar from covering content
  refactor(storage): simplify screen container padding
  docs(ai): clarify copilot commit rules

Rules:
  - Always include a concrete scope
  - Keep the subject short, specific, and lowercase unless a proper noun requires capitalization
  - Do not use vague subjects like update, changes, fix, or wip
```

### Before Creating a PR

1. Run `yarn validate` — must pass with zero errors
2. Run `yarn test` — all tests must pass
3. Ensure `en.json`, `vi.json`, `zh-CN.json`, and `zh-TW.json` are updated if UI text was added
4. Ensure no `any` types were introduced
5. Ensure no inline styles, color literals, or hardcoded strings
6. Ensure all new interactive elements have `accessibilityRole` and `accessibilityLabel`

---

## Security Considerations

1. **Never commit `.env` files.** The `.env.example` file shows the expected variable names.
2. **Never log sensitive data.** Use `if (__DEV__) { console.log(...) }` guards.
3. **Never hardcode API keys, tokens, or secrets** in source files.
4. **The Axios client reads the session token from Zustand** (`useAuthStore.getState().session.access_token`). Never store tokens in AsyncStorage or plain MMKV without proper security consideration.
5. **Supabase Row Level Security (RLS)** should be enabled for all tables in production.
6. **Input validation** must happen both client-side (Zod) and server-side (API). Client validation is for UX only.

---

## Strict Enforcement Rules

The following patterns are **absolutely forbidden** and will be blocked by automated hooks (for Claude Code) or must be rejected in code review:

### Forbidden Patterns

| Pattern                                                               | Why It's Forbidden                               |
| --------------------------------------------------------------------- | ------------------------------------------------ |
| `eslint-disable` / `eslint-disable-next-line` / `eslint-disable-line` | Suppresses lint rules instead of fixing the code |
| `@ts-ignore`                                                          | Silently hides type errors without explanation   |
| `@ts-nocheck`                                                         | Disables type checking for the entire file       |
| Bare `@ts-expect-error` (no description)                              | Must explain why the suppression is needed       |
| `any` type (`: any`, `as any`, `<any>`)                               | Defeats the purpose of TypeScript                |
| `--no-verify` on git commit/push                                      | Skips pre-commit hooks that catch errors         |

### When You Encounter a Type Error

Do NOT suppress it. Instead:

1. **Type narrowing** — use `typeof`, `instanceof`, `in`, or discriminated unions
2. **`unknown` + type guards** — cast to `unknown` first, then narrow with runtime checks
3. **Proper interfaces** — define the correct shape instead of using `any`
4. **Generics** — use generic type parameters for reusable, type-safe functions
5. **`@ts-expect-error` with description** — only as a last resort, with a clear explanation

### When You Encounter a Lint Error

Do NOT disable the rule. Instead:

1. **Read the error message** — ESLint messages explain what's wrong and often suggest fixes
2. **Fix the code** — restructure to satisfy the rule (it exists for a reason)
3. **Run `yarn lint:fix`** — many issues are auto-fixable
4. **Ask the user** — if you genuinely can't resolve it, ask rather than suppress

---

## Complete Code Pattern Examples

### Full Feature Implementation

```typescript
// 1. Types: src/features/tasks/types/index.ts
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface CreateTaskData {
  title: string;
}

// 2. Service: src/features/tasks/services/taskService.ts
import { api } from '@/services/api';
import type { Task, CreateTaskData } from '../types';

export async function fetchTasks() {
  const { data } = await api.get<Task[]>('/tasks');
  return data;
}

export async function createTask(payload: CreateTaskData) {
  const { data } = await api.post<Task>('/tasks', payload);
  return data;
}

export async function toggleTask(id: string, completed: boolean) {
  const { data } = await api.patch<Task>(`/tasks/${id}`, { completed });
  return data;
}

// 3. Schema: src/features/tasks/schemas/taskSchema.ts
import { z } from 'zod/v4';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'validation.required').max(200, 'validation.titleTooLong'),
});

export type CreateTaskFormData = z.infer<typeof createTaskSchema>;

// 4. Hooks: src/features/tasks/hooks/useTasks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTasks, createTask, toggleTask } from '../services/taskService';
import type { CreateTaskData } from '../types';

export const TASK_KEYS = {
  all: ['tasks'] as const,
  list: () => [...TASK_KEYS.all, 'list'] as const,
};

export function useTasks() {
  return useQuery({
    queryKey: TASK_KEYS.list(),
    queryFn: fetchTasks,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskData) => createTask(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TASK_KEYS.all }),
  });
}

export function useToggleTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      toggleTask(id, completed),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TASK_KEYS.all }),
  });
}

// 5. Screen: app/(main)/(tabs)/tasks.tsx
import { FlatList, View } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native-unistyles';
import { ScreenContainer } from '@/common/components/ScreenContainer';
import { Text } from '@/common/components/Text';
import { Button } from '@/common/components/Button';
import { Loading } from '@/common/components/Loading';
import { EmptyState } from '@/common/components/EmptyState';
import { ErrorBoundary } from '@/common/components/ErrorBoundary';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import type { Task } from '@/features/tasks/types';

export default function TasksScreen() {
  const { t } = useTranslation();
  const { data: tasks, isLoading, error, refetch } = useTasks();

  if (isLoading) return <Loading fullScreen />;

  return (
    <ScreenContainer padded>
      <ErrorBoundary>
        <Text variant="h1">{t('tasks.title')}</Text>
        {error ? (
          <EmptyState
            title={t('errors.generic')}
            actionLabel={t('actions.retry')}
            onAction={refetch}
          />
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TaskItem task={item} />}
            ListEmptyComponent={<EmptyState title={t('tasks.empty')} />}
            contentContainerStyle={styles.list}
          />
        )}
      </ErrorBoundary>
    </ScreenContainer>
  );
}

function TaskItem({ task }: { task: Task }) {
  const { t } = useTranslation();
  const toggleTask = useToggleTask();

  return (
    <View style={styles.taskItem}>
      <Text variant="body">{task.title}</Text>
      <Button
        title={task.completed ? t('tasks.undo') : t('tasks.complete')}
        variant="outline"
        size="sm"
        onPress={() => toggleTask.mutate({ id: task.id, completed: !task.completed })}
        loading={toggleTask.isPending}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  list: {
    gap: theme.metrics.spacingV.p12,
    paddingTop: theme.metrics.spacingV.p16,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.metrics.spacing.p16,
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.metrics.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
}));
```

## Feature Development

When extending this application or adding new features:

1. Scaffold a new feature using the script: `yarn scaffold <feature-name>` (creates directories and updates i18n templates)
2. Build new features in `src/features/` with lowercase folder names (use kebab-case for multi-word folders, e.g., `heat-treatment`)
3. Create corresponding screens inside `app/(main)/` or appropriate tab subdirectories, and keep navigation synced with `app/(main)/(tabs)/_layout.tsx`

---

## Additional Documentation

| File                   | Contents                                            |
| ---------------------- | --------------------------------------------------- |
| `CONVENTIONS.md`       | Complete coding conventions reference               |
| `docs/AI-GUIDE.md`     | Pattern cookbook, file templates, anti-patterns     |
| `docs/COMPONENTS.md`   | Full API reference for all public shared components |
| `docs/MIGRATION.md`    | Legacy migration note                               |
| `docs/ARCHITECTURE.md` | Architecture overview                               |
| `docs/PROCESS.md`      | Product and release workflow                        |
| `docs/SETUP.md`        | Setup guide                                         |
| `docs/llms.txt`        | Plain text summary for LLM context                  |
| `CLAUDE.md`            | Claude Code specific project instructions           |
