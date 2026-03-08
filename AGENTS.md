# Project Instructions

This document defines implementation rules for agents working in this repository.
If there is any conflict, use this precedence order:

1. User request
2. This `AGENTS.md`
3. Existing repository patterns (`package.json`, `src/routes.tsx`, current code)

## 1) Mandatory Global Rules

- Always check whether an available local skill applies before implementing.
- If no relevant skill exists, proceed with these project conventions.
- Always write code and code comments in English.
- Do not create tests unless the user explicitly asks for tests.

## 1.1) Plan Mode Behavior

- When operating in plan mode, prefer asking concise interactive questions whenever user input can meaningfully shape the plan.
- In plan mode, try to gather decisions through interactive prompts as much as possible instead of open-ended questions.
- Skip interactive questions only when the task is fully clear, trivial, or the repository context already determines the best path.

## 2) Stack And Source Of Truth

- Routing: React Router v7 (`src/routes.tsx`)
- Build: Vite + TypeScript
- UI: Mantine v8
- Data fetching: TanStack React Query
- State: Zustand
- HTTP: Axios
- Icons: `@tabler/icons-react`
- i18n: `react-i18next`

Use real repo configuration as source of truth (`package.json`, `src/`, route guards, modules).

## 3) Project Structure

All app code lives in `src/`:

- `api/`: Backend API calls
- `components/`: Reusable UI components
- `modules/`: Feature modules
- `queries/`: React Query hooks
- `routes/` and `routes.tsx`: Route components and router setup
- `locales/`: i18n files (`en`, `es`)
- `stores/`: Zustand stores
- `models/`: Types and interfaces
- `hooks/`: Custom hooks
- `utils/`: Utilities
- `styles/`: Global styles

## 4) Component Conventions

### File/Folder pattern (required)

Each reusable component must use folder colocation and barrel export:

```text
ComponentName/
  ComponentName.tsx
  ComponentName.module.css
  index.ts
```

`index.ts` must export:

```ts
export { default } from './ComponentName';
```

### Naming

- Use PascalCase for component files: `UserCard.tsx`
- Prefer colocated helper/type/constant files when needed:
  - `ComponentName.helpers.ts`
  - `ComponentName.types.ts`
  - `ComponentName.constants.ts`

## 5) UI And Styling Standards

Design quality is mandatory: clean, modern, production-ready, light mode first.

- Use Mantine components by default.
- Use CSS Modules (`*.module.css`) for component styles.
- Avoid inline styles unless there is a justified Mantine-specific need.
- Keep layouts compact:
  - Prefer `size="sm"` for controls and text
  - Prefer `gap="xs"` in `Stack`/`Group`
  - Use consistent spacing with Mantine CSS variables
- Keep hover states stable (no layout shift).
- Provide clear loading and error states.
- Avoid heavy shadows, gradients, and 3D effects.
- Subtle elevation with soft borders and ultra-light shadows is allowed when it improves hierarchy, especially for navigation and cards.
- Use Mantine shadow tokens for elevation instead of custom `box-shadow` values whenever possible.
- Standard default elevation for cards, forms, and section containers is Mantine `md` (`shadow="md"` in Mantine components or `var(--mantine-shadow-md)` in CSS Modules).
- Only use a custom shadow when there is a documented, component-specific exception.
- Avoid flat, boring forms: group related fields into clear visual sections
  (e.g. Basic Info, Configuration, Advanced) with explicit hierarchy.

### Shared UI primitives

- Use `SectionCard` from `src/components/SectionCard` for form/page sections.
- Use `AppDrawer` from `src/components/AppDrawer` for app drawers.
- For data tables, use `BaseTable` from `src/components/BaseTable/BaseTable` by default.

Do not use Mantine `Drawer` directly unless there is a justified exception that `AppDrawer` cannot cover.

## 6) Data, Forms, State, API

- Use React Query for server data.
- Use Mantine Form for forms and validation.
- Keep API functions in `src/api/`.
- Keep global state in Zustand stores under `src/stores/`.

## 7) Routing Rules (Project-Specific)

`src/routes.tsx` is the source of truth.

- Do not create custom routing outside React Router v7.
- Every new route must define an explicit `id`.
- Route `id` style is **hybrid current** (existing project style):
  - Examples: `users`, `do-not-call`, `campaign.detail`
- Use `ModuleGuard` for protected screens.
- Use `permission` and/or `masterOnly` in `ModuleGuard` when required by access policy.
- Keep route-level permission logic in guards, not inline in page components.
- Use lazy loading for route pages (`React.lazy`) and wrap with `Suspense` + `SuspenseFallback`.
- Use nested `children` routes and `Navigate` for default child redirects when needed.
- Use `I18nNamespaceLoader` for routes that depend on route-based namespace loading.

## 8) i18n Rules

- Never hardcode user-facing strings in components.
- Use `useTranslation('<namespace>')`.
- `common` is the global namespace.
- Route screens should use route-aligned namespaces.
- When adding keys, update both:
  - `src/locales/en/<namespace>.json`
  - `src/locales/es/<namespace>.json`

## 9) Permissions And Hooks Discipline

### Permission architecture

- Determine active client from impersonation target or current user client.
- Build permissions only from roles that belong to the active client.
- Merge permissions per module.
- Treat `MANAGE` as elevated permission for that module.
- Module mapping:
  - `ModuleEnum.SETTINGS`: setup/configuration/taxonomy areas
  - `ModuleEnum.CAMPAIGNS`: campaign operations and campaign screens

### Permission usage

Always use `usePermissions` helpers:

- `canAccessModule(module)`
- `canPerformAction(module, permission)`
- `hasAnyPermission(module, permissions)`
- `hasAllPermissions(module, permissions)`

Do not bypass these helpers.

### Hooks discipline

- Call hooks unconditionally at the top of the component.
- Do not place hooks inside branches, loops, or after early returns.

## 10) TypeScript Rules

- Keep strict typing.
- Use `~/` imports for `src/` paths.
- Put shared types in `src/models/`.
- Do not use `any`.

## 11) Testing Rules

Only add tests when explicitly requested.

- Use Vitest + React Testing Library.
- Default execution should target one file or one test case.
- Do not run full test suite by default while debugging.

Examples:

```bash
npx vitest src/components/UserCard/UserCard.test.tsx
npx vitest -t "renders submit button"
```

### Test setup conventions

- Use `renderWithProviders` from `src/test-utils/renderWithProviders`.
- Do not mock `react-i18next` in component tests.
- Assert translated user-visible text (not translation keys).
- If component uses `usePermissions`, mock it consistently.

## 12) Commands (Validated)

- `npm run dev`: Start dev server
- `npm run build`: TypeScript + production build
- `npm run preview`: Preview production build
- `npm run typecheck`: Type check only
- `npm run test`: Full test run with coverage
- `npm run coverage`: Coverage-focused run

For targeted test debugging, prefer `npx vitest <file>` instead of `npm run test`.

## 13) Quick Do / Don't

### Do

- Keep UI clean, consistent, and production-ready.
- Reuse shared components and route guards.
- Keep i18n and permission logic consistent with project patterns.
- Keep changes small, typed, and aligned with existing structure.

### Don't

- Introduce alternative routing/state/i18n patterns.
- Hardcode visible strings.
- Bypass permission helpers.
- Add unnecessary tests or run global test suites when a focused run is enough.
