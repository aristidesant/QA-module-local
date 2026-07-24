# Role Preview Switcher — Design

## Context

The user (Product Designer / UX-UI Designer, see `DESIGN_ROLE.md`) needs a subtle, non-invasive way to demo the application to stakeholders as if logged in under each of the four available roles — Agent, Supervisor, Operation Manager, SuperAdmin — without leaving the live app or building a separate mock environment. This is a presentation aid only: no backend, no real permission changes, no new business logic.

## Goals

- Let a presenter (SuperAdmin) switch what the sidebar shows to simulate each role's navigation, live, inside the real app.
- Reuse real screens wherever they already exist so the demo looks authentic.
- Keep the feature completely invisible to anyone who isn't already `superAdminOnly` — zero risk, zero UI change for regular users.
- Zero impact on the real permission/auth system — this is a visual nav filter, not a security feature.

## Non-goals

- Not a real "view as" / impersonation feature — does not change JWT, permissions, or API calls.
- Not pixel-perfect per-role dashboards — new (not-yet-built) sections get one shared placeholder page, not bespoke designs.
- No tests, no dev server run, no commit as part of this work unless explicitly requested (`DESIGN_ROLE.md`).

## Role → navigation mapping

✅ = links to an existing real page/route. 🔲 = new placeholder page (shared component, see below).

| Item             | Icon (`@tabler/icons-react`) | Agent | Supervisor | Op. Manager | SuperAdmin | Destination                      |
| ---------------- | ---------------------------- | :---: | :--------: | :---------: | :--------: | -------------------------------- |
| Dashboard        | `IconLayoutDashboard`        |  ✅   |     ✅     |     ✅      |     ✅     | `/` (Overview)                   |
| Profile          | `IconUserCircle`             |  ✅   |            |             |            | `/profile`                       |
| Your Evaluations | `IconClipboardCheck`         |  🔲   |            |             |            | `/role-preview/your-evaluations` |
| Notifications    | `IconBell`                   |  🔲   |            |     🔲      |            | `/role-preview/notifications`    |
| Coaching         | `IconTargetArrow`            |  🔲   |     🔲     |     🔲      |     🔲     | `/role-preview/coaching`         |
| LMS              | `IconSchool`                 |  🔲   |     🔲     |     🔲      |     🔲     | `/role-preview/lms`              |
| QA Tests         | `IconClipboardCheck`         |       |     ✅     |     ✅      |     ✅     | `/qa/dashboard`                  |
| Campaigns        | `IconSpeakerphone`           |       |     ✅     |     ✅      |     ✅     | `/campaigns`                     |
| Agents Roster    | `IconUsersGroup`             |       |     🔲     |     🔲      |            | `/role-preview/agents-roster`    |
| Case Management  | `IconFolders`                |       |     ✅     |     ✅      |     ✅     | `/backoffice/cases`              |
| Finder           | `IconSearch`                 |       |     🔲     |     🔲      |     🔲     | `/role-preview/finder`           |
| Billing          | `IconFileInvoice`            |       |            |     ✅      |     ✅     | `/billing/invoices`              |
| Clients          | `IconUsers`                  |       |            |             |     ✅     | `/clients`                       |
| Global Settings  | `IconSettings`               |       |            |             |     🔲     | `/role-preview/global-settings`  |

Every role lands on **Dashboard** (`/`) as the entry point when the preview role is switched — no special per-role landing route needed.

## Architecture

### 1. `src/stores/roleMockStore.ts` (new)

Zustand store, same shape/pattern as `src/stores/colorSchemeStore.ts`:

```ts
type PreviewRole =
	| 'agent'
	| 'supervisor'
	| 'operationManager'
	| 'superAdmin'
	| null;

interface RoleMockState {
	previewRole: PreviewRole;
	setPreviewRole: (role: PreviewRole) => void;
	clearPreviewRole: () => void;
}
```

Persisted via `zustand/middleware` `persist` (`name: 'role-preview'`), consistent with existing store conventions.

### 2. `src/constants/rolePreviewNav.ts` (new)

A single static config: for each `PreviewRole`, the ordered list of `{ key, labelKey, icon, to }` entries from the mapping table above. This is the only place the mapping table lives in code — no per-role branching logic scattered elsewhere.

### 3. `Sidebar.tsx` — one added branch

At the top of the render logic: `const previewRole = useRoleMockStore((s) => s.previewRole);`. If `previewRole` is set, render the nav items from `rolePreviewNav[previewRole]` directly (skipping `usePermissions`/module checks entirely for rendering purposes). If `previewRole` is `null` (default for every real user, always), the existing permission-driven rendering path runs exactly as today — this branch is purely additive.

### 4. `UserMenu.tsx` — new submenu item

A `Menu.Item` "Preview as role" (`t('userMenu.rolePreview.menuLabel')`, added to `common.json` en/es), rendered only when `useIsSuperAdmin()` is true, positioned next to the existing "Switch Client" item. Expands into the 4 role names (via nested `Menu` or a simple secondary popover) plus a distinct "Exit preview" item shown only when `previewRole` is already set. Selecting a role calls `setPreviewRole(role)` and navigates to `/` (Dashboard). No API calls, no modal — this is pure client-side state, unlike `ClientSwitcherModal`.

When `previewRole` is set:

- Avatar gets a small overlay icon distinct from the impersonation shield (e.g. `IconEyeglass`), reusing the existing `impersonationIndicator`-style overlay slot but with its own class/color.
- A badge next to the name shows the previewed role name, styled in a different color (e.g. teal) from the orange impersonation badge, so the two concepts are never visually confused.

### 5. `src/modules/role-preview/RolePreviewPlaceholderPage.tsx` (new) + one route

A single generic page component taking `title`, `icon`, and `description` derived from the URL's `:section` param (looked up in the same `rolePreviewNav` config). Renders inside a `SectionCard` with a centered icon + "Coming soon" style message — matches the shared UI primitives already mandated project-wide. One new route entry in `routes.tsx`: `path: 'role-preview/:section'`, `id: 'role-preview'`, no `ModuleGuard` needed since it carries no sensitive data (static copy only), but the route (and the sidebar items linking to it) are only ever reachable through the preview-role nav, itself gated to `superAdminOnly` users.

## Data flow

1. SuperAdmin opens `UserMenu` → "Preview as role" → picks e.g. "Supervisor".
2. `roleMockStore.setPreviewRole('supervisor')`, app navigates to `/`.
3. `Sidebar` re-renders, sees `previewRole === 'supervisor'`, renders the Supervisor row from `rolePreviewNav` instead of the real permission-computed sidebar.
4. Clicking "Case Management" navigates to the real `/backoffice/cases` (existing page, existing data — whatever the actual logged-in user can see there). Clicking "Coaching" navigates to `/role-preview/coaching`, rendering the shared placeholder.
5. "Exit preview" (or picking a different role) calls `setPreviewRole(null)` / a new role, restoring normal behavior.

## Visual design

- Dark/light mode: all new UI (submenu, badge, placeholder page) uses Mantine CSS variables / `light-dark()` exclusively, per project rule — no hardcoded colors.
- Reuses `SectionCard` for the placeholder page body, consistent with the rest of the app.
- No new modal component — avoids the heavier `ClientSwitcherModal`-style chrome for what's a lightweight, 4-option, no-network-call action.

## Error handling

None needed — this is fully client-side, static config, no API calls, no failure modes beyond "role not found" which can't happen since the 4 keys are a closed enum.

## Testing

None planned, per `DESIGN_ROLE.md` and project convention (tests only when explicitly requested).

## Out of scope for this spec

- Wiring "Exit preview" keyboard shortcut or URL-based deep-linking into a specific preview role.
- Building real functionality behind any of the 🔲 placeholder items.
- Any change to the real permission system, `usePermissions`, or `ModuleGuard`.
