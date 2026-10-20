# Sidebar: no scrolling, sleeker, for every role

## Context

The sidebar scrolls for the roles with the most destinations. Reasons, from the code (heights are arithmetic from the CSS, not measured in a browser):

- **Rows are expensive.** `.menuItem` is `min-height: 44px` with `padding: 0.6875rem 0.875rem` and a `0.25rem` gap, so a row costs 48 px; group headers (`.sectionHeader`) cost 40 px + gap.
- **Group headers hide destinations.** Collapsed groups (Operations, Configuration, Insights) occupy a full row and hide Analytics, Reports, Disputes (including its unread badge) and the config pages.
- **Mixed patterns.** QA Manager has 7 flat links, one open group and two collapsed groups; Supervisor has 8 flat links and two collapsed groups; Operation Manager is four groups; Agent is flat.
- **Heavy chrome.** The brand block (top bar + collapse row + divider ≈ 96 px) and the footer (divider + user card + version + a second divider ≈ 95 px) take about 220 px before the first link.
- **The scroll is a safety net, not a design.** `.primaryLinksScrollable` hides the scrollbar, so users just find items missing.

Current default rows (items → rows shown): Agent 6 → 6; Operation Manager 8 → 9; Supervisor 13 → 10; QA Manager 15 → 13. Estimated total sidebar height: Agent ≈ 520 px, Operation Manager ≈ 650, Supervisor ≈ 700, QA Manager ≈ 840. On a 768 px laptop (about 650 px of viewport) Supervisor and QA Manager scroll; the Operation Manager is borderline.

The QA-admin sidebar without a role preview (`qaPrimaryItems` in `Sidebar.tsx`) is a flat list of **17** items (about 820 px of links) and scrolls on every laptop.

Goal: **no scrolling at 650 px of viewport height for every role**, with a lighter, quieter look. Scrolling remains only as a hidden safety net.

Decisions (made while writing this plan; the user can redirect):

- **Promote what is used daily** (Analytics, Reports, Disputes) into the main list; keep **one** collapsed "Configuration" group per role for rarely used pages (existing mechanism, auto-opens when a child is active) instead of a new footer menu.
- **Replace group header rows with thin dividers** between clusters of links (13 px) and drop the always-open "Operations/Organization" headers.
- **Density tokens** instead of fixed sizes, with an **automatic compact mode on short screens**.
- **Slimmer header and footer**: logo and collapse button on one row, the version moves into the user menu, one divider instead of two.
- **Quieter visual style**: flat surface (no gradient), no hover "lift", neutral selected pill with a thin primary indicator, smaller unread badges.
- Touch layouts (`max-width: 768px`, `hover: none`) keep their larger targets.

Mode: mockup. Mantine v9, CSS modules, strings in `en` and `es`, no inline `style=`. No tests, no dev server. Prettier on touched files only. Do not commit unless asked.

---

## Verified facts (do not re-explore)

**Where the nav is chosen** (`src/components/Sidebar/Sidebar.tsx`): `primaryNav = inEmotionSentimentApp ? emotionSentimentPrimaryItems : previewRole ? rolePreviewNav[previewRole] : inQaApp ? qaPrimaryItems : inBackofficeApp ? visibleBackofficeItems : visiblePrimaryItems`. `rolePreviewNav` = `roleNavigationMap.agent()` (flat) and `roleNavigationGroupedMap.{supervisor,operationManager,qaManager}()` from `roleNavigation.tsx`. For these apps `sectionNav` is empty, so the list renders inside `<Stack gap='xs' className={sectionNav.length === 0 ? `${styles.primaryLinks} ${styles.primaryLinksScrollable}` : styles.primaryLinks}>` (`Sidebar.tsx` ~L940-1024): groups render as `<div className={styles.sectionGroup}>` with an `UnstyledButton.sectionHeader` (disabled when `collapsible === false`) and `<Stack gap={4} className={styles.sectionItems}>` when open; flat items render `SidebarLinkItem`. Open state: `openGroupSection` (one open group at a time) and an effect that opens the group containing the active item.

**Types** (`roleNavigation.tsx` L31-38): `NavGroup { key; label; icon?; items: SidebarNavItem[]; collapsible?; defaultExpanded? }`. `SidebarNavItem` (`Sidebar.tsx` L94-114): `key, label, icon, to, module?, permission?, masterOnly?, superAdminOnly?, exact?, i18nNamespace?, roleCodes?, disabled?, badge?: 'disputes'|'inbox', activePaths?`.

**Role navs today** (`roleNavigation.tsx`): Agent flat (6): dashboard, calls, inbox, rankings, lms, coaching. Supervisor grouped (L188-228): flat `supervisor-dashboard, -inbox, -team, -conversations, -customers, -campaigns, -coaching, -lms`; collapsed `supervisor-operations` (`-disputes`, `-triggers`) and `supervisor-insights` (`-analytics`, `-reports`, `-rankings`). QA Manager (L346-400): flat `qamanager-dashboard, -inbox, -teams, -conversations, -forms, -coaching, -lms`; non-collapsible expanded `qamanager-operations` (`-customers`, `-disputes`, `-campaigns`); collapsed `qamanager-configuration` (`-triggers`, `-rankings`, `-settings`) and `qamanager-insights` (`-analytics`, `-reports`). Operation Manager (L462-507): `operationmanager-primary` (dashboard, inbox), `-organization` (team-config, team-health, clients), collapsed `-configuration` (rankings), collapsed `-insights` (analytics, reports). All item objects use `icon: <IconX size={20} className={styles.menuIcon} />`.

**CSS** (`Sidebar.module.css`): `.sidebar` gradient background and `padding: 0.875rem 0.875rem 1rem`; `.menuItem` (L288) `min-height: 44px; padding: 0.6875rem 0.875rem; border-radius: 14px; font-size: 0.875rem`, `:hover { transform: translateY(-1px) }`; `.menuItemSelected` uses `--sidebar-active-bg` (12% primary mix) and primary text colour; `.menuIcon` 1.25rem; `.sectionHeader` `min-height: 40px; padding: 0.625rem 0.875rem; border-radius: 12px`; `.sectionItems { padding-left: .5rem; margin-left: .5rem; border-left }`; `.primaryLinks, .sectionsList { gap: 0.25rem }`; `.divider { margin: 0.375rem 0 }`; `.brandDivider { margin: 0 0 0.5rem }`; `.topBar { min-height: 2.25rem }`, `.brandControls`, `.logoWrapper { min-height: 2rem }`, `.collapseButton 2rem`; `.menuItemCollapsed` 40 × 40 (rail); `.bottomSection` (flex column, gap .375rem) containing a divider, `<UserMenu />` and `<Text className={styles.versionText}>`; `@media (max-width: 768px)` sets `.menuItem, .sectionHeader { min-height: 42px }`; `@media (hover: none)` removes the hover lift. The scroll safety net is `.primaryLinksScrollable { flex: 1; min-height: 0; overflow-y: auto; scrollbar hidden }`.

**Footer** (`src/components/UserMenu/UserMenu.tsx` + `.module.css`): expanded `Paper.shell` (`padding: 0.5rem 0.625rem`) with a 2.25 rem avatar, name + subtitle and a `⋮` `Menu` (width 220) whose dropdown holds header, account items, role preview, logout. Collapsed: avatar button.

**Locale** `src/locales/{en,es}/common.json` `sidebar.*`: per role `groupOperations`, `groupInsights`, `groupConfiguration`, `groupOrganization` exist for some roles; `sidebar.version` = "Version". Supervisor has no `groupConfiguration`.

---

## Design

### Row budget (how we know it fits)

Default density: item 36 px + 2 px gap = **38**; divider between clusters = **13** (1 px + 6 + 6); collapsed Configuration header = **34**. Compact density (viewport height ≤ 760 px, desktop pointer): item 32 + 1 = **33**; header **31**. Chrome after the header/footer pass ≈ **150 px** (padding 30 + brand row 52 + footer 68).

| Role                      | Main rows              | Config  | Dividers | Default | Compact | Viewport needed (default / compact) |
| ------------------------- | ---------------------- | ------- | -------- | ------- | ------- | ----------------------------------- |
| Agent                     | 6                      | none    | 0        | 228     | 198     | ~380 / ~350                         |
| Operation Manager         | 8                      | none    | 2        | 330     | 290     | ~480 / ~440                         |
| Supervisor                | 11                     | 1 group | 4        | 504     | 446     | ~654 / ~596                         |
| QA Manager                | 12                     | 1 group | 4        | 542     | 479     | ~692 / ~629                         |
| QA admin app (no preview) | 7 + 2 collapsed groups | n/a     | 0        | 334     | 297     | ~484 / ~447                         |

Compact mode switches on below 760 px of height, so QA Manager (needs ~692 at default) never has to scroll: at 650 px it runs compact (needs ~629).

### New structure per role

Clusters are separated by a divider, not by a labelled header. A cluster is a `NavGroup` with `collapsible: false`, `unlabeled: true` (new optional field, rendered without any header row).

- **Agent** (unchanged, flat): Dashboard · My Calls · Inbox · Rankings · LMS · Coaching.
- **Supervisor**: [Dashboard, Inbox] · [Your Team, Conversations, Customers, Campaigns] · [Coaching, LMS, Disputes] · [Analytics, Reports] · collapsed **Configuration** [Triggers config, Rankings config].
- **QA Manager**: [Dashboard, Inbox] · [Teams, Conversations, Customers, Campaigns] · [Coaching, LMS, Forms, Disputes] · [Analytics, Reports] · collapsed **Configuration** [Triggers, Rankings, Settings].
- **Operation Manager**: [Dashboard, Inbox] · [Team configuration, Team health, Clients, Rankings] · [Analytics, Reports]. No collapsed group (everything is used).
- **QA admin app (no role preview)**: [Dashboard, Evaluations, Campaigns, Forms, Disputes, Agents, Evaluator agents] · collapsed **Role dashboards** [Agent, Supervisor, QA Manager, Operation Manager dashboards] · collapsed **Advanced** [Disputes list, Auto triggers, Reporting, Agent rankings]. 17 rows become 9.

### Density tokens

Declared on `.sidebar`:

```css
--sb-item-h: 36px;
--sb-gap: 2px;
--sb-icon: 18px;
--sb-radius: 10px;
--sb-font: 0.8125rem; /* 13px */
--sb-header-h: 34px; /* collapsible group header */
--sb-label-h: 22px; /* reserved, unlabeled clusters do not use it */
```

Compact override (short desktop screens only):

```css
@media (max-height: 760px) and (min-width: 769px) and (hover: hover) {
	.sidebar {
		--sb-item-h: 32px;
		--sb-gap: 1px;
		--sb-header-h: 31px;
	}
}
```

Touch (`max-width: 768px`, `hover: none`) keeps `42px` rows as today.

### Visual style ("sleek")

- Surface: flat `var(--sidebar-surface)` (remove the 3-stop gradient).
- Hover: background only (remove `translateY(-1px)`); transitions stay at 160 ms.
- Selected: `background: var(--sidebar-hover-bg)` slightly stronger (light: gray-1, dark: dark-5), text weight 600 in the normal text colour, and a **3 px primary indicator** on the left (`::before`, 16 px tall, rounded). Primary colour appears only on that bar (aligns with the app-wide "colour means exception" rule).
- Icons 18 px, text 13 px, radius 10 px.
- Unread badges: `size='xs'` (was `sm`), still filled primary so the count reads.
- Dividers between clusters use `--sidebar-divider` at 1 px.

---

## Implementation plan

Execute in order; `npm run typecheck` after each task.

### Task 0 — Plan copy

This file already lives at `docs/superpowers/plans/2026-10-20-sidebar-compact.md`; nothing to copy.

### Task 1 — Density tokens and item styles (`Sidebar.module.css`)

1. Add the tokens above to `.sidebar` and the compact media query (after the existing `@media (max-width: 768px)` block, before `@media (hover: none)`).
2. `.menuItem`: `min-height: var(--sb-item-h); padding: 0 0.75rem; gap: 0.625rem; border-radius: var(--sb-radius); font-size: var(--sb-font); position: relative;` and delete the hover `transform`. `.menuItemSelected`: `background: light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-5)); color: var(--mantine-color-text); font-weight: 600;` plus

```css
.menuItemSelected::before {
	content: '';
	position: absolute;
	left: 0;
	top: 50%;
	width: 3px;
	height: 16px;
	transform: translateY(-50%);
	border-radius: 0 3px 3px 0;
	background: var(--mantine-primary-color-filled);
}
```

Remove `.menuItemSelected:hover { transform }`; keep its background so hover does not flicker. In the rail (`.menuItemCollapsed`) the indicator is hidden (`.sidebarCollapsed .menuItemSelected::before { display: none; }`) and the selected pill keeps the same background. 3. `.menuIcon { width: var(--sb-icon); height: var(--sb-icon); }` (the `size={20}` attribute on each icon is overridden by this CSS because `className` is on the `<svg>`). 4. `.sectionHeader`: `min-height: var(--sb-header-h); padding: 0 0.75rem; border-radius: var(--sb-radius);` remove its hover lift; keep the label style (11 px, 0.08em tracking, muted). 5. Gaps: `.primaryLinks, .sectionsList { gap: var(--sb-gap); }`; raise specificity so Mantine's `Stack` gap cannot win: `.sidebar .primaryLinks, .sidebar .sectionsList { gap: var(--sb-gap); }`. `.sectionGroup { gap: var(--sb-gap); }`. For the group items (`<Stack gap={4}>` in `Sidebar.tsx`) override with `.sectionItems { gap: var(--sb-gap); }` at the same raised specificity (`.sidebar .sectionItems`). 6. New cluster divider:

```css
.cluster {
	display: flex;
	flex-direction: column;
	gap: var(--sb-gap);
}
.cluster + .cluster,
.cluster + .sectionGroup,
.sectionGroup + .cluster {
	margin-top: 6px;
	padding-top: 6px;
	border-top: 1px solid var(--sidebar-divider);
}
```

7. `.sidebar`: replace the `background: linear-gradient(...)` with `background: var(--sidebar-surface);` (keep the border/inset shadow and the dark-mode variables).
8. Mobile block: keep `min-height: 42px` for `.menuItem, .sectionHeader` (now with `padding-block: 0`), unchanged otherwise; the `@media (hover: none)` block loses the now-removed transforms.

### Task 2 — Header, footer and brand row (`Sidebar.module.css`, `Sidebar.tsx`)

- **Brand row:** in `Sidebar.tsx` (`<div className={styles.brandSection}>` ~L907-938) put the logo and the collapse button in one row when expanded: `<div className={styles.brandRow}>` with the existing `logoWrapper` on the left and the collapse `ActionIcon` on the right; keep the stacked layout when collapsed (rail). CSS: `.brandRow { display: flex; align-items: center; justify-content: space-between; min-height: 40px; gap: 0.5rem; width: 100%; }`, `.sidebarCollapsed .brandRow { flex-direction: column; min-height: 0; }`; `.brandControls` and `.topBar` become part of this row (delete the extra `min-height` rules, keep the class names used by the rail). `.brandDivider { margin: 0.25rem 0 0.5rem; }` (single 1 px rule).
- **Footer:** delete the duplicate `<Divider className={styles.divider} />` outside `.bottomSection` (L1026) or the one inside (L1073) so only one remains; remove the version `<Text className={styles.versionText}>` block (L1075-1079) and move the version into the user menu (below).
- **User menu** (`UserMenu.tsx`): add at the end of the dropdown, after logout's divider, `<Menu.Label className={styles.menuLabel}>{t('sidebar.version')} {APP_VERSION}</Menu.Label>` (import `APP_VERSION` from where `Sidebar.tsx` gets it). In `UserMenu.module.css` shrink the expanded shell: `.shell { padding: 0.375rem 0.5rem; }`, `.avatar { width: 2rem; height: 2rem; }` (the compact avatar variant keeps its size).

### Task 3 — Group rendering and the "unlabeled cluster" (`roleNavigation.tsx`, `Sidebar.tsx`)

- `NavGroup` gains `unlabeled?: boolean`.
- In the `primaryNav.map` of `Sidebar.tsx`: when `isNavGroup(navItem)` and `navItem.unlabeled`, render `<div key className={styles.cluster}>{items.map(SidebarLinkItem)}</div>` (always open, no header). A cluster in the collapsed rail renders its items stacked with the same `SidebarLinkItem collapsed` props and a rail divider (existing `.divider` margin) instead of the top border.
- Collapsible groups keep the existing button + `sectionItems` rendering (auto-open for the active item stays). Rename nothing else.

### Task 4 — Role navigation structures (`roleNavigation.tsx`)

Rewrite the three `get*NavigationGrouped` functions (flat `get*Navigation` arrays and all item objects stay as they are). Helper at the top of the file:

```ts
const cluster = (key: string, items: SidebarNavItem[]): NavGroup => ({
	key,
	label: '',
	items,
	collapsible: false,
	defaultExpanded: true,
	unlabeled: true,
});
```

- `getSupervisorNavigationGrouped`: `[cluster('supervisor-main', pick('supervisor-dashboard','supervisor-inbox')), cluster('supervisor-team-work', pick('supervisor-team','supervisor-conversations','supervisor-customers','supervisor-campaigns')), cluster('supervisor-development', pick('supervisor-coaching','supervisor-lms','supervisor-disputes')), cluster('supervisor-insights', pick('supervisor-analytics','supervisor-reports')), { key: 'supervisor-configuration', label: 'sidebar.supervisor.groupConfiguration', items: pick('supervisor-triggers','supervisor-rankings'), collapsible: true, defaultExpanded: false }]`.
- `getQAManagerNavigationGrouped`: `[cluster('qamanager-main', pick('qamanager-dashboard','qamanager-inbox')), cluster('qamanager-operation', pick('qamanager-teams','qamanager-conversations','qamanager-customers','qamanager-campaigns')), cluster('qamanager-quality', pick('qamanager-coaching','qamanager-lms','qamanager-forms','qamanager-disputes')), cluster('qamanager-insights', pick('qamanager-analytics','qamanager-reports')), { key: 'qamanager-configuration', label: 'sidebar.qamanager.groupConfiguration', items: pick('qamanager-triggers','qamanager-rankings','qamanager-settings'), collapsible: true, defaultExpanded: false }]`.
- `getOperationManagerNavigationGrouped`: `[cluster('operationmanager-main', [dashboard, inbox]), cluster('operationmanager-organization', [team-config, team-health, clients, rankings]), cluster('operationmanager-insights', [analytics, reports])]` using the existing `byKey`.
- Keep the `pick` / `byKey` helpers and the existing disputes/inbox `badge` fields.

### Task 5 — QA admin app grouping (`Sidebar.tsx`)

Turn `qaPrimaryItems` (L352) into `qaPrimaryNav: (SidebarNavItem | NavGroup)[]`: the first seven items stay flat in this order (`qa-dashboard`, `qa-evaluations`, `qa-campaigns`, `qa-forms`, `qa-disputes`, `qa-agents`, `qa-evaluator-agents`), then `{ key: 'qa-role-dashboards', label: 'sidebar.groups.qaRoleDashboards', items: [the four role dashboards], collapsible: true, defaultExpanded: false }` and `{ key: 'qa-advanced', label: 'sidebar.groups.qaAdvanced', items: [qa-disputes-list, qa-auto-triggers, qa-reporting, qa-agent-rankings], collapsible: true, defaultExpanded: false }`. Update the `primaryNav` selection (`inQaApp ? qaPrimaryNav : ...`). Any other reader of `qaPrimaryItems` (grep) must flatten it with `qaPrimaryNav.flatMap(...)`.

### Task 6 — Copy (`src/locales/{en,es}/common.json`, `sidebar.*`)

Add: `sidebar.supervisor.groupConfiguration` ("Configuration" / "Configuración"), `sidebar.groups.qaRoleDashboards` ("Role dashboards" / "Dashboards por rol"), `sidebar.groups.qaAdvanced` ("Advanced" / "Avanzado"). The unused `groupOperations`, `groupInsights`, `groupOrganization` keys stay (other code may reference them; grep before deleting nothing).

### Task 7 — Checks

- `npm run typecheck` clean.
- Greps: `style=` in `src/components/Sidebar/**` and `src/components/UserMenu/**` → only the existing `inline-style-allow` lines; `translateY(-1px)` in `Sidebar.module.css` → none; `linear-gradient` in `.sidebar` → none; `qaPrimaryItems` → no stale reference; `versionText` → no stale reference (remove the class from the CSS).
- Locale script: the three new keys exist in en and es.
- Prettier on touched files only; `git status --short` lists only intended files.

---

## Verification (user, in the browser; no dev server is started here)

Use the role preview (user menu → preview as role) and a window of 1366 × 768 (about 650 px of viewport) and again at 1440 × 900 and 1920 × 1080. For each of Agent, Supervisor, QA Manager and Operation Manager, and for the QA admin app without a preview:

1. No scrollbar or clipped item at 650 px (compact density), at 900 px and at 1080 px.
2. At ≥ 760 px of height the rows are 36 px; below it they are 32 px with no layout jump on resize.
3. Clusters are separated by hairlines; Configuration (Supervisor, QA Manager) is one collapsed row that opens, and opens automatically when a child page (Triggers, Rankings, Settings) is the current page.
4. Inbox and Disputes badges are visible without opening anything.
5. The selected item shows the gray pill with the thin green bar; hover has no movement; focus ring still visible with the keyboard.
6. Collapse to the rail: icons stay centred, tooltips work, clusters keep a divider, the selected item stays distinguishable without the bar.
7. Footer is one 44 px row; Version appears at the bottom of the user menu; the user menu still shows role preview, switch client and logout.
8. Dark mode: selected pill, dividers and the indicator keep contrast; light mode has no gradient.
9. Mobile width (≤ 768 px): rows keep 42 px touch height.

## Out of scope

- A footer "Configuration" flyout menu (this plan keeps one collapsed group instead).
- Renaming or re-ordering routes, changing permissions or the Campaign-management / Backoffice / emotion-sentiment sidebars (they keep the denser look automatically through the tokens but their structure is unchanged).
- Collapsed-rail item size (stays 40 px).
- Auto-switching to the rail on very short screens (below about 560 px the hidden-scroll safety net still applies).
