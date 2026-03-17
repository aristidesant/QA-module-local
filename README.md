# NAI Agent Service Frontend

Frontend application for Newtech's Unified CXM platform.  
It provides campaign operations, AI-agent workflow configuration, conversation monitoring, analytics dashboards, and platform configuration tools in a single web app.

## What This App Does

- Create and manage outbound campaign experiences.
- Configure agents, prompts, workflow nodes/edges, and campaign-specific behavior.
- Monitor campaign contact lists and campaign conversations.
- Visualize performance through dashboard widgets and metric-driven analytics.
- Manage operational settings such as client configs, scheduler presets, regional params, phone numbers, and dictionary rules.

## Tech Stack And Architecture

### Core stack

- React 19 + TypeScript
- Vite 7
- React Router v7
- Mantine v8
- TanStack React Query v5
- Zustand
- Axios
- i18next + react-i18next

### App architecture highlights

- Routing source of truth is [`src/routes.tsx`](src/routes.tsx) with lazy-loaded route modules.
- Authentication and session bootstrap are handled by `RouteProtecter`:
  - Token is read from `sessionStorage` (`accessToken`).
  - Current user is fetched and stored in Zustand session store.
  - Expired/invalid session redirects to `/login`.
- Authorization is enforced at route level with `ModuleGuard` using module and permission checks.
- API communication is centralized in `src/api/*` using Axios wrappers and shared config.
- Async server state is managed through React Query hooks in `src/queries/*`.

## Modules Overview

### Overview and dashboards

- **Overview** (`/`) renders the default/global dashboard experience.
- **Dashboards** (`/dashboards`) manages dashboard definitions/widgets for global context (`campaignId = null`).
- Dashboard rendering is reused in campaign and overview contexts via dashboard viewer components.

### Campaigns

- Campaign listing, creation, editing, cloning, and viewing.
- Campaign wizard and advanced form sections.
- Workflow canvas for agent orchestration.
- Campaign contact list execution controls and metrics.
- Campaign conversations and campaign-level dashboard viewer.

### Conversations

- Conversation list and detail views.
- Transcript, disposition, metadata, contact context, and playback-related views.

### Configurations

- Client configs (master context).
- Campaign predefined params.
- Scheduler predefined params.
- Regional settings params.
- Phone numbers.
- Metric catalog.
- Pronunciation dictionary rules.

### Administration and supporting modules

- Users
- Roles
- Clients
- Tools
- Knowledge Bases
- Do Not Call
- Agent Tests
- Profile

## Recent Changes (March 2026)

Based on the latest merged and direct commits on **March 12-13, 2026**:

- Added and improved **custom/global dashboard** support.
- Added dedicated **Dashboards page and route** (`/dashboards`) and integrated overview dashboard behavior.
- Introduced **pronunciation dictionary rules** management and campaign attachment flow.
- Updated **metric catalog + dashboard viewer** behavior and related i18n namespaces/translations.
- Included additional dashboard-related UI/UX and data model adjustments.

## Setup

### Prerequisites

- Node.js 20+
- pnpm (via Corepack recommended)

### Environment variables

Create a `.env` file at project root:

```bash
VITE_APP_API_URL=http://localhost:3000
```

`VITE_APP_API_URL` is used by the frontend API config (`src/api/config.ts`).

### Install dependencies

```bash
corepack enable
pnpm install
```

## Commands

```bash
pnpm dev          # Start Vite dev server
pnpm build        # TypeScript compile + production build
pnpm preview      # Preview production build
pnpm typecheck    # TypeScript type check (no emit)
pnpm test         # Vitest run with coverage summary
pnpm coverage     # Coverage run (VALID_COVERAGE_ONLY mode)
```

## Docker

The Docker image injects API URL at build time through `VITE_APP_API_URL`.

```bash
docker build \
  --build-arg VITE_APP_API_URL=https://your-api.example.com \
  -t nai-agent-service-front .

docker run --rm -p 8080:80 nai-agent-service-front
```

## Project Structure (Compact)

Main app source is under `src/`:

- `api/` backend API clients
- `components/` reusable UI building blocks
- `modules/` feature modules/screens
- `queries/` React Query hooks
- `routes.tsx` application router and guards
- `stores/` Zustand stores
- `models/` domain and API typings
- `locales/` i18n namespaces (`en`, `es`)
- `hooks/` shared hooks
- `utils/` utility helpers

## Localization And Permissions Conventions

- Do not hardcode user-facing strings; use `useTranslation(namespace)`.
- Route namespace loading is tied to route IDs via `I18nNamespaceLoader`.
- Route access is enforced with `ModuleGuard`.
- Permission checks should rely on shared `usePermissions` helpers:
  - `canAccessModule`
  - `canPerformAction`
  - `hasAnyPermission`
  - `hasAllPermissions`

## Troubleshooting

### App loads but API calls fail

- Verify `.env` contains a valid `VITE_APP_API_URL`.
- Restart dev server after changing env values.
- Confirm backend CORS and auth headers are configured for this frontend origin.

### Redirect loops to `/login`

- Check if `accessToken` exists and is not expired.
- Confirm backend `currentUser` endpoint responds successfully.
- Invalid/expired tokens are cleared by auth/session guards.

### Route visible but content blocked

- Check current user permissions and active client context.
- Many screens are guarded by module + permission combinations in `src/routes.tsx`.
