# Role Preview Switcher Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a subtle "Preview as role" control to `UserMenu` that lets a SuperAdmin swap the sidebar nav to a static per-role layout (Agent, Supervisor, Operation Manager, SuperAdmin) for live stakeholder demos, reusing real screens where they exist and a single shared placeholder page for the rest.

**Architecture:** One Zustand store (`previewRole`, persisted) is read by `Sidebar.tsx` to swap in a static nav config instead of the real permission-computed one, and by `UserMenu.tsx` to render the picker + a visual indicator. One new route (`/role-preview/:section`) with one generic page component covers every not-yet-built nav destination. Nothing about real permissions, `ModuleGuard`, or API calls changes.

**Tech Stack:** React Router v7, Mantine v9, Zustand v5 (`persist` middleware), react-i18next, `@tabler/icons-react`.

## Global Constraints

- No git commits as part of this work (`DESIGN_ROLE.md` — commits only when explicitly requested).
- No tests written (`CLAUDE.md` — tests only when explicitly requested).
- No dev server run (`DESIGN_ROLE.md`).
- Verification per task is `npm run typecheck` only (agreed with the user) — a static compile check, not a test run and not the dev server.
- All new UI must use Mantine CSS variables / `light-dark()` for both themes — no hardcoded colors (`CLAUDE.md`).
- All code and comments in English (`CLAUDE.md`).
- Reuse `SectionCard` for the placeholder page; do not build a new card primitive (`CLAUDE.md` shared UI primitives).

## One approved adjustment from the spec

The spec (`docs/superpowers/specs/2026-07-24-role-preview-switcher-design.md`) describes the picker as a flyout "submenu ▸". Mantine's `Menu` has no built-in nested-submenu API, so this plan implements it as a `Menu.Label` + a vertical list of `Menu.Item`s (identical pattern to the existing "Switch Client" / "Profile" items in the same dropdown) plus a conditional "Exit preview" item. Same effect — subtle, inline, zero new chrome — lower implementation risk than reaching for an unproven nested-menu API.

---

### Task 1: Preview role type + Zustand store

**Files:**

- Create: `src/constants/previewRole.ts`
- Create: `src/stores/roleMockStore.ts`

**Interfaces:**

- Produces: `PreviewRole` type (`'agent' | 'supervisor' | 'operationManager' | 'superAdmin'`), `PREVIEW_ROLES: { key: PreviewRole; labelKey: string }[]`, `useRoleMockStore` hook exposing `{ previewRole: PreviewRole | null; setPreviewRole: (role: PreviewRole | null) => void; clearPreviewRole: () => void }`.

- [ ] **Step 1: Create `src/constants/previewRole.ts`**

```ts
export type PreviewRole =
	| 'agent'
	| 'supervisor'
	| 'operationManager'
	| 'superAdmin';

export interface PreviewRoleOption {
	key: PreviewRole;
	labelKey: string;
}

export const PREVIEW_ROLES: PreviewRoleOption[] = [
	{ key: 'agent', labelKey: 'userMenu.rolePreview.roles.agent' },
	{ key: 'supervisor', labelKey: 'userMenu.rolePreview.roles.supervisor' },
	{
		key: 'operationManager',
		labelKey: 'userMenu.rolePreview.roles.operationManager',
	},
	{ key: 'superAdmin', labelKey: 'userMenu.rolePreview.roles.superAdmin' },
];
```

- [ ] **Step 2: Create `src/stores/roleMockStore.ts`**

Follows the exact pattern of `src/stores/colorSchemeStore.ts` (Zustand + `persist`).

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PreviewRole } from '~/constants/previewRole';

interface RoleMockState {
	previewRole: PreviewRole | null;
	setPreviewRole: (role: PreviewRole | null) => void;
	clearPreviewRole: () => void;
}

export const useRoleMockStore = create<RoleMockState>()(
	persist(
		(set) => ({
			previewRole: null,
			setPreviewRole: (previewRole: PreviewRole | null) => set({ previewRole }),
			clearPreviewRole: () => set({ previewRole: null }),
		}),
		{
			name: 'role-preview',
		}
	)
);
```

- [ ] **Step 3: Verify types compile**

Run: `npm run typecheck`
Expected: no new errors (these two files have no dependents yet).

---

### Task 2: Placeholder registry, placeholder page, and route

**Files:**

- Create: `src/constants/rolePreviewPlaceholders.ts`
- Create: `src/modules/role-preview/RolePreviewPlaceholderPage.tsx`
- Modify: `src/routes.tsx:82` (add lazy import), `src/routes.tsx:957-965` (add route sibling to `profile`)

**Interfaces:**

- Consumes: none from Task 1 directly (this task's icon/title config is self-contained).
- Produces: `ROLE_PREVIEW_PLACEHOLDERS: Record<string, { slug: string; titleKey: string; icon: TablerIcon }>`, default-exported `RolePreviewPlaceholderPage` component, route id `role-preview` at path `role-preview/:section`.

- [ ] **Step 1: Create `src/constants/rolePreviewPlaceholders.ts`**

```ts
import type { TablerIcon } from '@tabler/icons-react';
import {
	IconBell,
	IconFolders,
	IconSchool,
	IconSearch,
	IconSettings,
	IconTargetArrow,
	IconUsersGroup,
	IconClipboardCheck,
} from '@tabler/icons-react';

export interface RolePreviewPlaceholder {
	slug: string;
	titleKey: string;
	icon: TablerIcon;
}

export const ROLE_PREVIEW_PLACEHOLDERS: Record<string, RolePreviewPlaceholder> =
	{
		'your-evaluations': {
			slug: 'your-evaluations',
			titleKey: 'sidebar.rolePreview.items.yourEvaluations',
			icon: IconClipboardCheck,
		},
		notifications: {
			slug: 'notifications',
			titleKey: 'sidebar.rolePreview.items.notifications',
			icon: IconBell,
		},
		coaching: {
			slug: 'coaching',
			titleKey: 'sidebar.rolePreview.items.coaching',
			icon: IconTargetArrow,
		},
		lms: {
			slug: 'lms',
			titleKey: 'sidebar.rolePreview.items.lms',
			icon: IconSchool,
		},
		'agents-roster': {
			slug: 'agents-roster',
			titleKey: 'sidebar.rolePreview.items.agentsRoster',
			icon: IconUsersGroup,
		},
		finder: {
			slug: 'finder',
			titleKey: 'sidebar.rolePreview.items.finder',
			icon: IconSearch,
		},
		'global-settings': {
			slug: 'global-settings',
			titleKey: 'sidebar.rolePreview.items.globalSettings',
			icon: IconSettings,
		},
	};
```

Note: `IconFolders` is imported here for consistency with the Sidebar's "Case Management" icon (Task 4) even though Case Management is a real page, not a placeholder — remove this import if unused after Task 4 review. (It is not referenced in this file's registry since Case Management has no placeholder entry; drop the `IconFolders` import from this file to avoid an unused-import error.)

- [ ] **Step 2: Create `src/modules/role-preview/RolePreviewPlaceholderPage.tsx`**

```tsx
import React from 'react';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import { ROLE_PREVIEW_PLACEHOLDERS } from '~/constants/rolePreviewPlaceholders';

const RolePreviewPlaceholderPage: React.FC = () => {
	const { section } = useParams<{ section: string }>();
	const { t } = useTranslation('common');

	const config = section ? ROLE_PREVIEW_PLACEHOLDERS[section] : undefined;
	const title = config
		? t(config.titleKey)
		: t('rolePreview.placeholder.genericTitle');

	return (
		<SectionCard
			icon={config?.icon}
			title={title}
			description={t('rolePreview.placeholder.description')}
		/>
	);
};

export default RolePreviewPlaceholderPage;
```

- [ ] **Step 3: Fix the `IconFolders` note from Step 1**

Remove the unused `IconFolders` import from `src/constants/rolePreviewPlaceholders.ts` — edit the import block to:

```ts
import {
	IconBell,
	IconSchool,
	IconSearch,
	IconSettings,
	IconTargetArrow,
	IconUsersGroup,
	IconClipboardCheck,
} from '@tabler/icons-react';
```

- [ ] **Step 4: Add the lazy import in `routes.tsx`**

Find (line 82):

```ts
const ProfilePage = React.lazy(() => import('./modules/profile/ProfilePage'));
```

Replace with:

```ts
const ProfilePage = React.lazy(() => import('./modules/profile/ProfilePage'));
const RolePreviewPlaceholderPage = React.lazy(
	() => import('./modules/role-preview/RolePreviewPlaceholderPage')
);
```

- [ ] **Step 5: Add the route in `routes.tsx`**

Find the `profile` route (around line 957):

```ts
							{
								path: 'profile',
								id: 'profile',
								element: (
									<Suspense fallback={<SuspenseFallback />}>
										<ProfilePage />
									</Suspense>
								),
							},
```

Replace with:

```ts
							{
								path: 'profile',
								id: 'profile',
								element: (
									<Suspense fallback={<SuspenseFallback />}>
										<ProfilePage />
									</Suspense>
								),
							},
							{
								path: 'role-preview/:section',
								id: 'role-preview',
								element: (
									<Suspense fallback={<SuspenseFallback />}>
										<RolePreviewPlaceholderPage />
									</Suspense>
								),
							},
```

- [ ] **Step 6: Verify types compile**

Run: `npm run typecheck`
Expected: no new errors.

---

### Task 3: Locale keys (en/es)

**Files:**

- Modify: `src/locales/en/common.json`
- Modify: `src/locales/es/common.json`

**Interfaces:**

- Produces: translation keys `sidebar.rolePreview.items.*` (14 keys), `rolePreview.placeholder.*` (2 keys), `userMenu.rolePreview.*` (menuLabel, exit, badge, roles.\*) — consumed by Tasks 2, 4, 5.

- [ ] **Step 1: Add `sidebar.rolePreview` to `src/locales/en/common.json`**

Find (end of the `sidebar` object, after `"theme"`):

```json
		"theme": {
			"label": "Appearance",
			"light": "Light mode",
			"dark": "Dark mode",
			"auto": "System mode"
		}
	},
```

Replace with:

```json
		"theme": {
			"label": "Appearance",
			"light": "Light mode",
			"dark": "Dark mode",
			"auto": "System mode"
		},
		"rolePreview": {
			"items": {
				"dashboard": "Dashboard",
				"profile": "Profile",
				"yourEvaluations": "Your Evaluations",
				"notifications": "Notifications",
				"coaching": "Coaching",
				"lms": "LMS",
				"qaTests": "QA Tests",
				"campaigns": "Campaigns",
				"agentsRoster": "Agents Roster",
				"caseManagement": "Case Management",
				"finder": "Finder",
				"billing": "Billing",
				"clients": "Clients",
				"globalSettings": "Global Settings"
			}
		}
	},
```

- [ ] **Step 2: Add top-level `rolePreview.placeholder` to `src/locales/en/common.json`**

Find (right after the `sidebar` object closes, before `"header"`):

```json
	"header": {
		"notifications": "Notifications"
	},
```

Replace with:

```json
	"rolePreview": {
		"placeholder": {
			"genericTitle": "Coming soon",
			"description": "This screen is a placeholder for the stakeholder demo. It has not been built yet."
		}
	},
	"header": {
		"notifications": "Notifications"
	},
```

- [ ] **Step 3: Add `userMenu.rolePreview` to `src/locales/en/common.json`**

Find (end of the `userMenu.items` object):

```json
		"items": {
			"campaignManagement": "Campaign Management",
			"configurations": "Configurations",
			"dashboards": "Dashboards",
			"agentTests": "Agent Tests",
			"doNotCall": "Do Not Call",
			"clients": "Clients",
			"knowledgeBases": "Knowledge Bases",
			"tools": "Tools",
			"users": "Users",
			"roles": "Roles"
		}
	},
```

Replace with:

```json
		"items": {
			"campaignManagement": "Campaign Management",
			"configurations": "Configurations",
			"dashboards": "Dashboards",
			"agentTests": "Agent Tests",
			"doNotCall": "Do Not Call",
			"clients": "Clients",
			"knowledgeBases": "Knowledge Bases",
			"tools": "Tools",
			"users": "Users",
			"roles": "Roles"
		},
		"rolePreview": {
			"menuLabel": "Preview as role",
			"exit": "Exit preview",
			"badge": "Previewing: {{role}}",
			"roles": {
				"agent": "Agent",
				"supervisor": "Supervisor",
				"operationManager": "Operation Manager",
				"superAdmin": "SuperAdmin"
			}
		}
	},
```

- [ ] **Step 4: Add `sidebar.rolePreview` to `src/locales/es/common.json`**

Find (end of the `sidebar` object, after `"theme"`):

```json
		"theme": {
			"label": "Apariencia",
			"light": "Modo claro",
			"dark": "Modo oscuro",
			"auto": "Modo del sistema"
		}
	},
```

Replace with:

```json
		"theme": {
			"label": "Apariencia",
			"light": "Modo claro",
			"dark": "Modo oscuro",
			"auto": "Modo del sistema"
		},
		"rolePreview": {
			"items": {
				"dashboard": "Dashboard",
				"profile": "Perfil",
				"yourEvaluations": "Tus evaluaciones",
				"notifications": "Notificaciones",
				"coaching": "Coaching",
				"lms": "LMS",
				"qaTests": "Pruebas de QA",
				"campaigns": "Campañas",
				"agentsRoster": "Plantilla de agentes",
				"caseManagement": "Gestión de casos",
				"finder": "Buscador",
				"billing": "Facturación",
				"clients": "Clientes",
				"globalSettings": "Configuración global"
			}
		}
	},
```

- [ ] **Step 5: Add top-level `rolePreview.placeholder` to `src/locales/es/common.json`**

Find (right after the `sidebar` object closes, before `"header"`):

```json
	"header": {
		"notifications": "Notificaciones"
	},
```

Replace with:

```json
	"rolePreview": {
		"placeholder": {
			"genericTitle": "Próximamente",
			"description": "Esta pantalla es un marcador de posición para la demo con stakeholders. Aún no ha sido construida."
		}
	},
	"header": {
		"notifications": "Notificaciones"
	},
```

- [ ] **Step 6: Add `userMenu.rolePreview` to `src/locales/es/common.json`**

Find (end of the `userMenu.items` object):

```json
		"items": {
			"campaignManagement": "Gestión de campañas",
			"configurations": "Configuraciones",
			"dashboards": "Dashboards",
			"agentTests": "Pruebas de agentes",
			"doNotCall": "No llamar (DNC)",
			"clients": "Clientes",
			"knowledgeBases": "Bases de conocimiento",
			"tools": "Herramientas",
			"users": "Usuarios",
			"roles": "Roles"
		}
	},
```

Replace with:

```json
		"items": {
			"campaignManagement": "Gestión de campañas",
			"configurations": "Configuraciones",
			"dashboards": "Dashboards",
			"agentTests": "Pruebas de agentes",
			"doNotCall": "No llamar (DNC)",
			"clients": "Clientes",
			"knowledgeBases": "Bases de conocimiento",
			"tools": "Herramientas",
			"users": "Usuarios",
			"roles": "Roles"
		},
		"rolePreview": {
			"menuLabel": "Vista previa por rol",
			"exit": "Salir de la vista previa",
			"badge": "Viendo como: {{role}}",
			"roles": {
				"agent": "Agent",
				"supervisor": "Supervisor",
				"operationManager": "Operation Manager",
				"superAdmin": "SuperAdmin"
			}
		}
	},
```

No typecheck needed for this task — JSON-only changes, nothing to compile yet (the keys are consumed starting in Task 4).

---

### Task 4: Sidebar integration

**Files:**

- Modify: `src/components/Sidebar/Sidebar.tsx`

**Interfaces:**

- Consumes: `useRoleMockStore` (Task 1), `PreviewRole` type (Task 1), `sidebar.rolePreview.items.*` keys (Task 3).
- Produces: exported `SidebarNavItem` type (was previously file-private) — consumed by Task 2's... no, actually consumed nowhere outside this file in this plan, but exporting it keeps the type reusable and costs nothing.

- [ ] **Step 1: Export `SidebarNavItem` and add new icon imports**

Find:

```ts
import {
	IconActivity,
	IconBook2,
	IconChecklist,
	IconChevronDown,
	IconClipboardCheck,
	IconForms,
	IconGitBranch,
	IconSpeakerphone,
	IconChevronLeft,
	IconChevronRight,
	IconChartBar,
	IconCpu,
	IconFileInvoice,
	IconLayoutDashboard,
	IconListDetails,
	IconInbox,
	IconSettings,
	IconTableExport,
	IconUsers,
} from '@tabler/icons-react';
```

Replace with:

```ts
import {
	IconActivity,
	IconBell,
	IconBook2,
	IconChecklist,
	IconChevronDown,
	IconClipboardCheck,
	IconForms,
	IconFolders,
	IconGitBranch,
	IconSchool,
	IconSearch,
	IconSpeakerphone,
	IconChevronLeft,
	IconChevronRight,
	IconChartBar,
	IconCpu,
	IconFileInvoice,
	IconLayoutDashboard,
	IconListDetails,
	IconInbox,
	IconSettings,
	IconTableExport,
	IconTargetArrow,
	IconUserCircle,
	IconUsers,
	IconUsersGroup,
} from '@tabler/icons-react';
```

- [ ] **Step 2: Add store/type imports**

Find:

```ts
import { hasAnyActiveClientRoleCode } from '~/modules/backoffice/hooks/useBackofficeRole';
import {
	BACKOFFICE_ADMIN_ROLE,
	BACKOFFICE_AGENT_ROLE,
} from '~/modules/backoffice/constants/BackofficeRoleConstants';
import UserMenu from '../UserMenu';
```

Replace with:

```ts
import { hasAnyActiveClientRoleCode } from '~/modules/backoffice/hooks/useBackofficeRole';
import {
	BACKOFFICE_ADMIN_ROLE,
	BACKOFFICE_AGENT_ROLE,
} from '~/modules/backoffice/constants/BackofficeRoleConstants';
import { useRoleMockStore } from '~/stores/roleMockStore';
import type { PreviewRole } from '~/constants/previewRole';
import UserMenu from '../UserMenu';
```

- [ ] **Step 3: Export the `SidebarNavItem` type**

Find:

```ts
type SidebarNavItem = {
	key: string;
	label: string;
	icon: React.ReactNode;
	to: string;
	/** When omitted, only the masterOnly/superAdminOnly checks apply. */
	module?: ModuleEnum;
	permission?: PermissionEnum;
	masterOnly?: boolean;
	superAdminOnly?: boolean;
	exact?: boolean;
	i18nNamespace?: string;
	roleCodes?: readonly string[];
};
```

Replace with:

```ts
export type SidebarNavItem = {
	key: string;
	label: string;
	icon: React.ReactNode;
	to: string;
	/** When omitted, only the masterOnly/superAdminOnly checks apply. */
	module?: ModuleEnum;
	permission?: PermissionEnum;
	masterOnly?: boolean;
	superAdminOnly?: boolean;
	exact?: boolean;
	i18nNamespace?: string;
	roleCodes?: readonly string[];
};
```

- [ ] **Step 4: Add the `rolePreviewNav` config**

Find:

```ts
export const Sidebar: React.FC = () => {
```

Insert immediately above it (after the `backofficePrimaryItems` const block that ends with `];` right before this line):

```ts
// Static per-role nav shown only when a SuperAdmin has an active role preview
// (see UserMenu's "Preview as role"). Purely a visual mock — see
// docs/superpowers/specs/2026-07-24-role-preview-switcher-design.md for the
// full role -> item mapping and which destinations are real vs. placeholder.
const rolePreviewNav: Record<PreviewRole, SidebarNavItem[]> = {
	agent: [
		{
			key: 'role-preview-dashboard',
			label: 'sidebar.rolePreview.items.dashboard',
			icon: <IconLayoutDashboard size={20} className={styles.menuIcon} />,
			to: '/',
			exact: true,
		},
		{
			key: 'role-preview-profile',
			label: 'sidebar.rolePreview.items.profile',
			icon: <IconUserCircle size={20} className={styles.menuIcon} />,
			to: '/profile',
		},
		{
			key: 'role-preview-your-evaluations',
			label: 'sidebar.rolePreview.items.yourEvaluations',
			icon: <IconClipboardCheck size={20} className={styles.menuIcon} />,
			to: '/role-preview/your-evaluations',
		},
		{
			key: 'role-preview-notifications',
			label: 'sidebar.rolePreview.items.notifications',
			icon: <IconBell size={20} className={styles.menuIcon} />,
			to: '/role-preview/notifications',
		},
		{
			key: 'role-preview-coaching',
			label: 'sidebar.rolePreview.items.coaching',
			icon: <IconTargetArrow size={20} className={styles.menuIcon} />,
			to: '/role-preview/coaching',
		},
		{
			key: 'role-preview-lms',
			label: 'sidebar.rolePreview.items.lms',
			icon: <IconSchool size={20} className={styles.menuIcon} />,
			to: '/role-preview/lms',
		},
	],
	supervisor: [
		{
			key: 'role-preview-dashboard',
			label: 'sidebar.rolePreview.items.dashboard',
			icon: <IconLayoutDashboard size={20} className={styles.menuIcon} />,
			to: '/',
			exact: true,
		},
		{
			key: 'role-preview-qa-tests',
			label: 'sidebar.rolePreview.items.qaTests',
			icon: <IconClipboardCheck size={20} className={styles.menuIcon} />,
			to: '/qa/dashboard',
		},
		{
			key: 'role-preview-campaigns',
			label: 'sidebar.rolePreview.items.campaigns',
			icon: <IconSpeakerphone size={20} className={styles.menuIcon} />,
			to: '/campaigns',
		},
		{
			key: 'role-preview-agents-roster',
			label: 'sidebar.rolePreview.items.agentsRoster',
			icon: <IconUsersGroup size={20} className={styles.menuIcon} />,
			to: '/role-preview/agents-roster',
		},
		{
			key: 'role-preview-coaching',
			label: 'sidebar.rolePreview.items.coaching',
			icon: <IconTargetArrow size={20} className={styles.menuIcon} />,
			to: '/role-preview/coaching',
		},
		{
			key: 'role-preview-case-management',
			label: 'sidebar.rolePreview.items.caseManagement',
			icon: <IconFolders size={20} className={styles.menuIcon} />,
			to: '/backoffice/cases',
		},
		{
			key: 'role-preview-lms',
			label: 'sidebar.rolePreview.items.lms',
			icon: <IconSchool size={20} className={styles.menuIcon} />,
			to: '/role-preview/lms',
		},
		{
			key: 'role-preview-finder',
			label: 'sidebar.rolePreview.items.finder',
			icon: <IconSearch size={20} className={styles.menuIcon} />,
			to: '/role-preview/finder',
		},
	],
	operationManager: [
		{
			key: 'role-preview-dashboard',
			label: 'sidebar.rolePreview.items.dashboard',
			icon: <IconLayoutDashboard size={20} className={styles.menuIcon} />,
			to: '/',
			exact: true,
		},
		{
			key: 'role-preview-qa-tests',
			label: 'sidebar.rolePreview.items.qaTests',
			icon: <IconClipboardCheck size={20} className={styles.menuIcon} />,
			to: '/qa/dashboard',
		},
		{
			key: 'role-preview-campaigns',
			label: 'sidebar.rolePreview.items.campaigns',
			icon: <IconSpeakerphone size={20} className={styles.menuIcon} />,
			to: '/campaigns',
		},
		{
			key: 'role-preview-agents-roster',
			label: 'sidebar.rolePreview.items.agentsRoster',
			icon: <IconUsersGroup size={20} className={styles.menuIcon} />,
			to: '/role-preview/agents-roster',
		},
		{
			key: 'role-preview-notifications',
			label: 'sidebar.rolePreview.items.notifications',
			icon: <IconBell size={20} className={styles.menuIcon} />,
			to: '/role-preview/notifications',
		},
		{
			key: 'role-preview-case-management',
			label: 'sidebar.rolePreview.items.caseManagement',
			icon: <IconFolders size={20} className={styles.menuIcon} />,
			to: '/backoffice/cases',
		},
		{
			key: 'role-preview-coaching',
			label: 'sidebar.rolePreview.items.coaching',
			icon: <IconTargetArrow size={20} className={styles.menuIcon} />,
			to: '/role-preview/coaching',
		},
		{
			key: 'role-preview-lms',
			label: 'sidebar.rolePreview.items.lms',
			icon: <IconSchool size={20} className={styles.menuIcon} />,
			to: '/role-preview/lms',
		},
		{
			key: 'role-preview-billing',
			label: 'sidebar.rolePreview.items.billing',
			icon: <IconFileInvoice size={20} className={styles.menuIcon} />,
			to: '/billing/invoices',
		},
		{
			key: 'role-preview-finder',
			label: 'sidebar.rolePreview.items.finder',
			icon: <IconSearch size={20} className={styles.menuIcon} />,
			to: '/role-preview/finder',
		},
	],
	superAdmin: [
		{
			key: 'role-preview-dashboard',
			label: 'sidebar.rolePreview.items.dashboard',
			icon: <IconLayoutDashboard size={20} className={styles.menuIcon} />,
			to: '/',
			exact: true,
		},
		{
			key: 'role-preview-qa-tests',
			label: 'sidebar.rolePreview.items.qaTests',
			icon: <IconClipboardCheck size={20} className={styles.menuIcon} />,
			to: '/qa/dashboard',
		},
		{
			key: 'role-preview-campaigns',
			label: 'sidebar.rolePreview.items.campaigns',
			icon: <IconSpeakerphone size={20} className={styles.menuIcon} />,
			to: '/campaigns',
		},
		{
			key: 'role-preview-clients',
			label: 'sidebar.rolePreview.items.clients',
			icon: <IconUsers size={20} className={styles.menuIcon} />,
			to: '/clients',
		},
		{
			key: 'role-preview-case-management',
			label: 'sidebar.rolePreview.items.caseManagement',
			icon: <IconFolders size={20} className={styles.menuIcon} />,
			to: '/backoffice/cases',
		},
		{
			key: 'role-preview-coaching',
			label: 'sidebar.rolePreview.items.coaching',
			icon: <IconTargetArrow size={20} className={styles.menuIcon} />,
			to: '/role-preview/coaching',
		},
		{
			key: 'role-preview-lms',
			label: 'sidebar.rolePreview.items.lms',
			icon: <IconSchool size={20} className={styles.menuIcon} />,
			to: '/role-preview/lms',
		},
		{
			key: 'role-preview-billing',
			label: 'sidebar.rolePreview.items.billing',
			icon: <IconFileInvoice size={20} className={styles.menuIcon} />,
			to: '/billing/invoices',
		},
		{
			key: 'role-preview-finder',
			label: 'sidebar.rolePreview.items.finder',
			icon: <IconSearch size={20} className={styles.menuIcon} />,
			to: '/role-preview/finder',
		},
		{
			key: 'role-preview-global-settings',
			label: 'sidebar.rolePreview.items.globalSettings',
			icon: <IconSettings size={20} className={styles.menuIcon} />,
			to: '/role-preview/global-settings',
		},
	],
};

export const Sidebar: React.FC = () => {
```

(Note: the `export const Sidebar: React.FC = () => {` line above is the existing line — this step only inserts the new const block before it, it does not duplicate the line.)

- [ ] **Step 5: Read `previewRole` from the store**

Find:

```ts
const isQaAdmin = useIsQaAdmin();
```

Replace with:

```ts
const isQaAdmin = useIsQaAdmin();
const previewRole = useRoleMockStore((state) => state.previewRole);
```

- [ ] **Step 6: Give `previewRole` top priority over the QA/Backoffice/normal nav**

Find:

```ts
const primaryNav = inQaApp
	? qaPrimaryItems
	: inBackofficeApp
		? visibleBackofficeItems
		: visiblePrimaryItems;
const sectionNav = inQaApp || inBackofficeApp ? [] : visibleSections;
```

Replace with:

```ts
const primaryNav = previewRole
	? rolePreviewNav[previewRole]
	: inQaApp
		? qaPrimaryItems
		: inBackofficeApp
			? visibleBackofficeItems
			: visiblePrimaryItems;
const sectionNav =
	previewRole || inQaApp || inBackofficeApp ? [] : visibleSections;
```

- [ ] **Step 7: Verify types compile**

Run: `npm run typecheck`
Expected: no new errors.

---

### Task 5: UserMenu picker + visual indicator

**Files:**

- Modify: `src/components/UserMenu/UserMenu.tsx`
- Modify: `src/components/UserMenu/UserMenu.module.css`

**Interfaces:**

- Consumes: `useRoleMockStore`, `PreviewRole` (Task 1), `PREVIEW_ROLES` (Task 1), `userMenu.rolePreview.*` keys (Task 3).

- [ ] **Step 1: Add imports**

Find:

```ts
import {
	IconLogout,
	IconDotsVertical,
	IconShield,
	IconSwitchHorizontal,
	IconUserCircle,
	IconSun,
	IconMoon,
	IconDeviceDesktop,
	IconApps,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useSessionStore } from '~/stores/sessionStore';
import { useImpersonationState } from '~/hooks/useImpersonationState';
```

Replace with:

```ts
import {
	IconLogout,
	IconDotsVertical,
	IconShield,
	IconSwitchHorizontal,
	IconUserCircle,
	IconSun,
	IconMoon,
	IconDeviceDesktop,
	IconApps,
	IconEyeglass,
	IconX,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useSessionStore } from '~/stores/sessionStore';
import { useImpersonationState } from '~/hooks/useImpersonationState';
import { useIsSuperAdmin } from '~/hooks/useIsSuperAdmin';
import { useRoleMockStore } from '~/stores/roleMockStore';
import { PREVIEW_ROLES } from '~/constants/previewRole';
import type { PreviewRole } from '~/constants/previewRole';
```

- [ ] **Step 2: Read preview state and add handlers**

Find:

```ts
const { user, targetClient } = useSessionStore();
const { isImpersonating } = useImpersonationState();
```

Replace with:

```ts
const { user, targetClient } = useSessionStore();
const { isImpersonating } = useImpersonationState();
const isSuperAdmin = useIsSuperAdmin();
const previewRole = useRoleMockStore((s) => s.previewRole);
const setPreviewRole = useRoleMockStore((s) => s.setPreviewRole);
```

Find:

```ts
const handleOpenChooser = () => {
	closeMenu();
	openChooser();
};
```

Replace with:

```ts
const handleOpenChooser = () => {
	closeMenu();
	openChooser();
};

const handleSelectPreviewRole = (role: PreviewRole) => {
	closeMenu();
	setPreviewRole(role);
	navigate('/');
};

const handleExitPreview = () => {
	closeMenu();
	setPreviewRole(null);
};
```

- [ ] **Step 3: Add the picker to the dropdown**

Find:

```ts
			{canSwitchApps && (
				<Menu.Item
					leftSection={<IconApps size={16} />}
					onClick={handleOpenChooser}
					className={styles.menuItem}
				>
					{t('appSwitcher.switchApp')}
				</Menu.Item>
			)}
			<Menu.Label className={styles.menuLabel}>
				{t('sidebar.account.language')}
			</Menu.Label>
```

Replace with:

```ts
			{canSwitchApps && (
				<Menu.Item
					leftSection={<IconApps size={16} />}
					onClick={handleOpenChooser}
					className={styles.menuItem}
				>
					{t('appSwitcher.switchApp')}
				</Menu.Item>
			)}
			{isSuperAdmin && (
				<>
					<Menu.Label className={styles.menuLabel}>
						{t('userMenu.rolePreview.menuLabel')}
					</Menu.Label>
					{PREVIEW_ROLES.map((role) => (
						<Menu.Item
							key={role.key}
							leftSection={<IconEyeglass size={16} />}
							onClick={() => handleSelectPreviewRole(role.key)}
							className={[
								styles.menuItem,
								previewRole === role.key ? styles.menuItemActive : '',
							].join(' ')}
						>
							{t(role.labelKey)}
						</Menu.Item>
					))}
					{previewRole && (
						<Menu.Item
							leftSection={<IconX size={16} />}
							onClick={handleExitPreview}
							className={styles.menuItem}
						>
							{t('userMenu.rolePreview.exit')}
						</Menu.Item>
					)}
				</>
			)}
			<Menu.Label className={styles.menuLabel}>
				{t('sidebar.account.language')}
			</Menu.Label>
```

- [ ] **Step 4: Add the avatar indicator (3 render sites)**

Find (compact avatar, `Menu.Target`):

```ts
							<UnstyledButton
								className={[
									styles.avatar,
									styles.avatarCompact,
									styles.avatarClickable,
									isImpersonating ? styles.avatarImpersonating : '',
								].join(' ')}
								onClick={() => {
									if (menuOpened) {
										closeMenu();
										return;
									}
									openMenu();
								}}
								aria-label={t('sidebar.account.menu')}
							>
								{initials}
								{isImpersonating && (
									<div className={styles.impersonationIndicator}>
										<IconShield size={10} />
									</div>
								)}
							</UnstyledButton>
```

Replace with:

```ts
							<UnstyledButton
								className={[
									styles.avatar,
									styles.avatarCompact,
									styles.avatarClickable,
									isImpersonating ? styles.avatarImpersonating : '',
									!isImpersonating && previewRole
										? styles.avatarPreviewingRole
										: '',
								].join(' ')}
								onClick={() => {
									if (menuOpened) {
										closeMenu();
										return;
									}
									openMenu();
								}}
								aria-label={t('sidebar.account.menu')}
							>
								{initials}
								{isImpersonating ? (
									<div className={styles.impersonationIndicator}>
										<IconShield size={10} />
									</div>
								) : (
									previewRole && (
										<div className={styles.previewIndicator}>
											<IconEyeglass size={10} />
										</div>
									)
								)}
							</UnstyledButton>
```

Find (compact badge below avatar):

```ts
					{isImpersonating && (
						<Badge size='xs' variant='light' color='orange'>
							{t('userMenu.impersonationMode')}
						</Badge>
					)}
				</div>
			) : (
```

Replace with:

```ts
					{isImpersonating && (
						<Badge size='xs' variant='light' color='orange'>
							{t('userMenu.impersonationMode')}
						</Badge>
					)}
					{!isImpersonating && previewRole && (
						<Badge size='xs' variant='light' color='teal'>
							{t('userMenu.rolePreview.badge', {
								role: t(
									PREVIEW_ROLES.find((r) => r.key === previewRole)!.labelKey
								),
							})}
						</Badge>
					)}
				</div>
			) : (
```

Find (expanded shell avatar):

```ts
						<div
							className={[
								styles.avatar,
								isImpersonating ? styles.avatarImpersonating : '',
							].join(' ')}
						>
							{initials}
							{isImpersonating && (
								<div className={styles.impersonationIndicator}>
									<IconShield size={10} />
								</div>
							)}
						</div>

						<Stack gap={1} className={styles.identity}>
							<Group gap={6} wrap='nowrap' align='center' justify='flex-start'>
								<Text size='sm' fw={600} className={styles.name}>
									{displayName}
								</Text>
								{isImpersonating && (
									<Badge size='xs' variant='light' color='orange'>
										{t('userMenu.impersonationMode')}
									</Badge>
								)}
							</Group>
```

Replace with:

```ts
						<div
							className={[
								styles.avatar,
								isImpersonating ? styles.avatarImpersonating : '',
								!isImpersonating && previewRole
									? styles.avatarPreviewingRole
									: '',
							].join(' ')}
						>
							{initials}
							{isImpersonating ? (
								<div className={styles.impersonationIndicator}>
									<IconShield size={10} />
								</div>
							) : (
								previewRole && (
									<div className={styles.previewIndicator}>
										<IconEyeglass size={10} />
									</div>
								)
							)}
						</div>

						<Stack gap={1} className={styles.identity}>
							<Group gap={6} wrap='nowrap' align='center' justify='flex-start'>
								<Text size='sm' fw={600} className={styles.name}>
									{displayName}
								</Text>
								{isImpersonating && (
									<Badge size='xs' variant='light' color='orange'>
										{t('userMenu.impersonationMode')}
									</Badge>
								)}
								{!isImpersonating && previewRole && (
									<Badge size='xs' variant='light' color='teal'>
										{t('userMenu.rolePreview.badge', {
											role: t(
												PREVIEW_ROLES.find((r) => r.key === previewRole)!
													.labelKey
											),
										})}
									</Badge>
								)}
							</Group>
```

- [ ] **Step 5: Add CSS for the new classes**

Find (in `UserMenu.module.css`):

```css
.shell {
	--usermenu-surface: var(--mantine-color-gray-0);
	--usermenu-border: transparent;
	--usermenu-text: var(--mantine-color-text);
	--usermenu-text-muted: var(--mantine-color-gray-6);
	--usermenu-hover-bg: var(--mantine-color-gray-1);
	--usermenu-active-bg: var(--mantine-color-gray-1);
	--usermenu-avatar-bg: #0098d4;
	--usermenu-impersonating-bg: var(--mantine-color-orange-6);
	--usermenu-indicator-bg: var(--mantine-color-red-6);
```

Replace with:

```css
.shell {
	--usermenu-surface: var(--mantine-color-gray-0);
	--usermenu-border: transparent;
	--usermenu-text: var(--mantine-color-text);
	--usermenu-text-muted: var(--mantine-color-gray-6);
	--usermenu-hover-bg: var(--mantine-color-gray-1);
	--usermenu-active-bg: var(--mantine-color-gray-1);
	--usermenu-avatar-bg: #0098d4;
	--usermenu-impersonating-bg: var(--mantine-color-orange-6);
	--usermenu-preview-bg: var(--mantine-color-teal-6);
	--usermenu-indicator-bg: var(--mantine-color-red-6);
```

Find:

```css
.avatarImpersonating {
	background: var(--usermenu-impersonating-bg);
}

[data-mantine-color-scheme='dark'] .avatarImpersonating {
	background: color-mix(
		in srgb,
		var(--usermenu-impersonating-bg) 85%,
		white 15%
	);
}

.impersonationIndicator {
	position: absolute;
	bottom: -2px;
	right: -2px;
	width: 14px;
	height: 14px;
	border-radius: 9999px;
	background: var(--usermenu-indicator-bg);
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--mantine-color-white);
	border: 2px solid var(--usermenu-surface);
}
```

Replace with:

```css
.avatarImpersonating {
	background: var(--usermenu-impersonating-bg);
}

[data-mantine-color-scheme='dark'] .avatarImpersonating {
	background: color-mix(
		in srgb,
		var(--usermenu-impersonating-bg) 85%,
		white 15%
	);
}

.avatarPreviewingRole {
	background: var(--usermenu-preview-bg);
}

[data-mantine-color-scheme='dark'] .avatarPreviewingRole {
	background: color-mix(in srgb, var(--usermenu-preview-bg) 85%, white 15%);
}

.impersonationIndicator {
	position: absolute;
	bottom: -2px;
	right: -2px;
	width: 14px;
	height: 14px;
	border-radius: 9999px;
	background: var(--usermenu-indicator-bg);
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--mantine-color-white);
	border: 2px solid var(--usermenu-surface);
}

.previewIndicator {
	position: absolute;
	bottom: -2px;
	right: -2px;
	width: 14px;
	height: 14px;
	border-radius: 9999px;
	background: var(--usermenu-preview-bg);
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--mantine-color-white);
	border: 2px solid var(--usermenu-surface);
}
```

Find:

```css
.menuDropdown {
	/* Surface & chrome */
	--usermenu-dropdown-surface: var(--mantine-color-body);
	--usermenu-dropdown-border: color-mix(
		in srgb,
		var(--mantine-color-gray-4) 55%,
		transparent
	);
	--usermenu-dropdown-shadow:
		0 2px 6px rgba(15, 23, 42, 0.05), 0 12px 28px rgba(15, 23, 42, 0.09);
	--usermenu-dropdown-header-bg: var(--mantine-color-gray-0);
	/* Text — redeclared here so portal children can access them */
	--usermenu-text: var(--mantine-color-gray-8);
	--usermenu-text-muted: var(--mantine-color-gray-5);
	/* Avatar — redeclared here for portal scope */
	--usermenu-avatar-bg: #0098d4;
	--usermenu-impersonating-bg: var(--mantine-color-orange-6);
```

Replace with:

```css
.menuDropdown {
	/* Surface & chrome */
	--usermenu-dropdown-surface: var(--mantine-color-body);
	--usermenu-dropdown-border: color-mix(
		in srgb,
		var(--mantine-color-gray-4) 55%,
		transparent
	);
	--usermenu-dropdown-shadow:
		0 2px 6px rgba(15, 23, 42, 0.05), 0 12px 28px rgba(15, 23, 42, 0.09);
	--usermenu-dropdown-header-bg: var(--mantine-color-gray-0);
	/* Text — redeclared here so portal children can access them */
	--usermenu-text: var(--mantine-color-gray-8);
	--usermenu-text-muted: var(--mantine-color-gray-5);
	/* Avatar — redeclared here for portal scope */
	--usermenu-avatar-bg: #0098d4;
	--usermenu-impersonating-bg: var(--mantine-color-orange-6);
	--usermenu-preview-bg: var(--mantine-color-teal-6);
```

Find (dark-mode `.menuDropdown` override):

```css
[data-mantine-color-scheme='dark'] .menuDropdown {
	--usermenu-dropdown-surface: var(--mantine-color-dark-7);
	--usermenu-dropdown-border: color-mix(
		in srgb,
		var(--mantine-color-dark-4) 60%,
		transparent
	);
	--usermenu-dropdown-shadow:
		0 2px 6px rgba(0, 0, 0, 0.18), 0 14px 32px rgba(0, 0, 0, 0.28);
	--usermenu-dropdown-header-bg: var(--mantine-color-dark-6);
	--usermenu-text: var(--mantine-color-dark-0);
	--usermenu-text-muted: var(--mantine-color-dark-2);
	--usermenu-avatar-bg: color-mix(in srgb, #0098d4 75%, white 25%);
	--usermenu-impersonating-bg: color-mix(
		in srgb,
		var(--mantine-color-orange-6) 85%,
		white 15%
	);
```

Replace with:

```css
[data-mantine-color-scheme='dark'] .menuDropdown {
	--usermenu-dropdown-surface: var(--mantine-color-dark-7);
	--usermenu-dropdown-border: color-mix(
		in srgb,
		var(--mantine-color-dark-4) 60%,
		transparent
	);
	--usermenu-dropdown-shadow:
		0 2px 6px rgba(0, 0, 0, 0.18), 0 14px 32px rgba(0, 0, 0, 0.28);
	--usermenu-dropdown-header-bg: var(--mantine-color-dark-6);
	--usermenu-text: var(--mantine-color-dark-0);
	--usermenu-text-muted: var(--mantine-color-dark-2);
	--usermenu-avatar-bg: color-mix(in srgb, #0098d4 75%, white 25%);
	--usermenu-impersonating-bg: color-mix(
		in srgb,
		var(--mantine-color-orange-6) 85%,
		white 15%
	);
	--usermenu-preview-bg: color-mix(
		in srgb,
		var(--mantine-color-teal-6) 85%,
		white 15%
	);
```

Find:

```css
.menuItem:hover {
	background: var(--usermenu-dropdown-item-hover);
}
```

Replace with:

```css
.menuItem:hover {
	background: var(--usermenu-dropdown-item-hover);
}

.menuItemActive {
	background: var(--usermenu-dropdown-item-active);
}
```

- [ ] **Step 6: Verify types compile**

Run: `npm run typecheck`
Expected: no new errors.

---

## Self-review notes

- **Spec coverage:** all 5 architecture pieces from the spec (store, static config, Sidebar branch, UserMenu picker + indicator, placeholder page + route) map 1:1 to Tasks 1–5. The role→nav table is reproduced exactly (icons and order verified against the icon set actually installed in `node_modules/@tabler/icons-react`).
- **Deviation flagged:** the "submenu ▸" language from the spec is implemented as an inline `Menu.Label` + item list (see "One approved adjustment" above) — functionally equivalent, lower risk, explicitly called out rather than silently changed.
- **No placeholders:** every step has complete, concrete code; no TBD/TODO; the one edge case (impersonation + role preview active at the same time both wanting the avatar indicator slot) is explicitly resolved in Step 4 of Task 5 by giving impersonation visual precedence.
- **Type consistency:** `PreviewRole` is defined once (Task 1) and imported everywhere it's used (Tasks 4, 5); `ROLE_PREVIEW_PLACEHOLDERS` keys (kebab-case slugs) match the `to` paths used in `rolePreviewNav` (Task 4) exactly.
