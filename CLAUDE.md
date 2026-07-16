# Project Instructions

Precedence: 1) User request 2) This file 3) Repo patterns (`package.json`, `src/routes.tsx`)

## Critical Rules

- Check available skills before implementing any task.
- Write code and comments in English.
- Do not create tests unless explicitly requested.
- Use interactive prompts for any user input — never plain open-ended questions.
- **Dark/Light Mode:** Every component MUST correctly support both dark and light mode. Do not ship a component that looks broken or loses contrast in either theme. Use Mantine CSS variables (`var(--mantine-color-*)`, `var(--mantine-spacing-*)`) and `light-dark()` for manual overrides. Never hardcode color values without a dark-mode counterpart.

## Plan Mode

Ask concise interactive questions when input shapes the plan; skip only when context fully determines the path.

## Stack

| Layer         | Library                 |
| ------------- | ----------------------- |
| Routing       | React Router v7         |
| Build         | Vite + TypeScript       |
| UI            | Mantine v9              |
| Data fetching | TanStack React Query v5 |
| Tables        | TanStack React Table v8 |
| State         | Zustand v5              |
| HTTP          | Axios                   |
| Icons         | @tabler/icons-react     |
| i18n          | react-i18next           |

Source of truth: `package.json`, `src/routes.tsx`.

## Project Structure

All app code lives in `src/`: `api/`, `components/`, `modules/`, `queries/`, `routes/`, `routes.tsx`, `locales/`, `stores/`, `models/`, `hooks/`, `utils/`, `styles/`.

### QA section (`/qa/*`)

The QA tool (migrated from the former `qa-frontend-service` repo) lives in namespaced folders: `src/modules/qa/`, `src/api/qa/` (calls qa-backend via `qaHttpClient` from `src/api/qa/qaConfig.ts`, env var `VITE_APP_QA_API_URL`), `src/queries/qa/` (query keys prefixed `['qa', ...]`), `src/models/qa/`, and `qa.*.json` locale namespaces. Routes use ids `qa.*` behind `ModuleGuard superAdminOnly` (swap to `ModuleEnum.QA` once backend role permissions exist). QA screens use the shared UI primitives like the rest of the app.

## Shared UI Primitives (always apply)

- `SectionCard` (`src/components/SectionCard`) — form/page sections
- `AppDrawer` (`src/components/AppDrawer`) — drawers; do not use Mantine `Drawer` directly
- `BaseTable` (`src/components/BaseTable/BaseTable`) — data tables

## Dev Commands

- `npm run dev` — start dev server
- `npm run build` — TypeScript + production build
- `npm run typecheck` — type check only

## Conventions

Read the relevant doc before working in that area:

- [Component patterns](docs/conventions/component-conventions.md)
- [UI & Styling](docs/conventions/ui-styling.md)
- [Routing](docs/conventions/routing.md)
- [i18n](docs/conventions/i18n.md)
- [Permissions & Hooks](docs/conventions/permissions.md)
- [Data, Forms & State](docs/conventions/data-forms-state.md)
- [Testing](docs/conventions/testing.md)
- [TypeScript](docs/conventions/typescript.md)
