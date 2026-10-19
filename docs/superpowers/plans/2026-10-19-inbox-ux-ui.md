# Inbox UX/UI: triage structure, quieter rows, accessibility and an Operation Manager inbox

## Context

The Inbox (`/qa/{agent,supervisor,qa-manager,operation-manager}/inbox`) is one shared table for everything. A design critique of the code found:

- **No triage.** One list, no "needs action", no summary, no archived view. Priority is a loud filled badge on every row (blue for the most common value) and unread is signalled three times in blue.
- **Rows say too little.** Only the title shows: no sender name, no preview, and five category labels hide twelve real kinds (disputes, coaching and rankings all read "Message"). Dates read "a month ago" almost everywhere because the seed is in September and the clock is real.
- **Destructive and silent actions.** Archive is immediate with no undo and no way back. No toast anywhere. The check button's condition is inverted. Icon buttons rely on tooltips only.
- **Real bug.** The filter bar and unread title use a `data-theme` attribute that nothing sets, so they follow the OS theme, not the app toggle.
- **Operation Manager has no inbox entry** and, by URL, sees the QA Manager's inbox with its state and label.
- Smaller: filters miss priority and agent, the `?agent=` link from Triggers is ignored, the type filter is hard-coded English, "Agent" column can show a manager's own name, detail page lacks a coaching CTA, "Mark as unread" navigates away, mobile puts actions under the thread, not-found has no way back, breadcrumb link is not focusable.

Decisions made with the user (2026-10-19):

- **Scope:** fixes plus triage redesign, for all roles.
- **Triage:** tabs **Needs action · All · Archived** with counts.
- **Rows:** keep the table, richer: real type icon, sender by name, title with a one-line preview, neutral priority, row actions on hover.
- **Operation Manager:** own sidebar entry with unread badge, own identity and a few strategic seeded items, correct eyebrow.

Mode: mockup. Mantine v9, CSS modules, no inline styles, strings in `en` and `es`. No tests, no dev server. Prettier on touched files only. Do not commit unless asked.

Plan copy convention: Task 0 copies this file to `docs/superpowers/plans/2026-10-19-inbox-ux-ui.md`.

---

## Verified facts (do not re-explore)

**Files.**

- List page: `src/modules/qa/dashboard/pages/InboxPage.tsx` (LF). It filters with local state, `inboxFor(notifications, me.role, me.id)`, renders `SectionCard` > `InboxFilters` + `AgentInboxTable`, header with eyebrow `page.eyebrow.{role}`, blue "N unread" badge and "Mark all as read".
- Table and filters live in `src/modules/qa/agent/inbox/`: `AgentInboxTable.tsx`, `AgentInboxTable.module.css`, `InboxFilters.tsx`, `InboxFilters.module.css` (all **CRLF** in the worktree). Both CSS files switch themes with `@media (prefers-color-scheme)` and `[data-theme=…]` (bug).
- `AgentInboxTable`: `BaseTable` with `enablePagination pageSize={10}`, `initialSort createdAt desc`, `onRowClick`. `BaseTable` supports `getRowClassName(row: Row<TData>) => string | undefined`, `isLoading`, `emptyMessage` (plain text). Its rows are `role='button'` (nested icon buttons inside are a known limitation owned by `BaseTable`; do not change it).
- Detail page: `src/modules/qa/inbox/NotificationDetailPage/NotificationDetailPage.tsx` (LF, 341 lines). `primaryAction()` switch by `payload.kind`; right column buttons: CTA, `live.actions`, "Mark as unread" (navigates away), "Archive" (navigates away); `showThread = live.sourceRole !== 'SYSTEM' || replies.length > 0`; not-found = bare `EmptyState`.
- `src/modules/qa/inbox/constants.ts` (CRLF): `InboxRole = 'agent' | 'supervisor' | 'qa-manager'`, `INBOX_IDENTITY: Record<InboxRole, { role: NotificationRecipientRole; id; name }>`, `inboxRoleFromPath`, path helpers `disputesBasePath / disputesListPath / rankingsBasePath / analyticsPath / coachingPath / lmsPath / customersPath` (all `/qa/${role}/…`), `CATEGORY_META`, `PRIORITY_COLOR` (red/orange/blue/gray), `CATEGORY_ORDER`, `personNameOf(id)`. `inboxRoleFromPath` is **also used by the Disputes pages** and by `Sidebar.tsx`; do not change its behaviour.
- `src/modules/qa/inbox/helpers.ts` (LF): `isForInbox(n, role, id)` (unarchived + recipient match), `inboxFor`, `unreadCountFor`, `buildNotification`.
- Store `src/stores/qa/notificationStore.ts`: `markAsRead`, `markAsUnread`, `archiveNotification`, `unarchiveNotification` (never used by the UI), `markAllAsRead(role, id)`, `addNotification`, `addReply`. No store change is needed.
- Model `src/models/qa/notifications.ts`: `NotificationRecipientRole = 'AGENT' | 'SUPERVISOR' | 'QA_MANAGER'`; `AgentNotification` fields `category, priority, title, message, sourceRole, sourceId?, agentId, read, archived, actioned, payload?, recipientRole?, recipientId?, createdAt`; payload kinds `MESSAGE, METRIC_ALERT, TREND_WARNING, BURNOUT_RISK, RECOGNITION, BADGE_EARNED, WEEKLY_SUMMARY, COACHING_SESSION, LMS_ASSIGNMENT, FOLLOW_UP, DISPUTE_UPDATE, RANKING_UPDATE`.
- Seed `src/modules/qa/inbox/mockData.ts`: `buildNotification({ id, agentId, recipientRole, recipientId, category, priority, title, message, icon, sourceRole, sourceId?, metric?, read?, createdAt, payload })` per item, `day(d, 'HH:MM:SS')` = `2026-09-DD…Z`, three arrays (`AGENT_INBOX` 14, `SUPERVISOR_INBOX` 7, `QA_MANAGER_INBOX` 6) merged into `INBOX_SEED` sorted newest first. Payload examples to copy (all typed): `ntf-s02` BURNOUT_RISK `{ kind, level: 'high', percentage: 78, drivers: ['negativeEmotionShare','ahtVsTeam','afterHoursShare'] }`; `ntf-q03` TREND_WARNING `{ kind, area: 'COMPLIANCE', metricId: 'COMPLIANCE_OVERALL_SCORE', from, to, deltaPct, periodLabel, sparkline, ruleName }`; `ntf-s03` METRIC_ALERT `{ kind, area, metricId, value, threshold, direction: 'BELOW', windowLabel, sparkline, ruleName }`; `ntf-s05` WEEKLY_SUMMARY `{ kind, weekLabel, kpis: [{label,value,delta}], highlights: [] }`.
- Personas in `src/modules/qa/team/constants.ts`: `NOW_ISO = '2026-09-12T15:00:00Z'`, `SUPERVISOR_PERSONA`, `QA_MANAGER_PERSONA = { id: 'QAM-001', name: 'Elena Ruiz' }`.
- `fromMockNow(iso)` in `src/modules/qa/disputes/cases/helpers.ts` = `dayjs(iso).from(dayjs(NOW_ISO))` (relative to the mock clock; reuse it).
- `EmptyState` props: `icon?, message, description?, action?`. `DatePickerInput type='range'` + `size='sm'` example in `src/modules/qa/coaching/CoachingPage/tabs/SessionsTab.tsx`. Toasts: `notifySuccess(message)` in `src/modules/qa/utils/notifications.ts`; Mantine `notifications.show` / `notifications.hide` from `@mantine/notifications`.
- Colour convention: neutral by default, `amber` / `danger` tones for exceptions (`SCORE_BAND_TONE` in `src/modules/qa/constants/badgeColors.ts`).
- Sidebar: `Sidebar.tsx` L1099-1121 computes the badge from `INBOX_IDENTITY[inboxRoleFromPath(item.to)]`, L1181-1185 renders `<Badge size='sm' variant='filled'>` only when not collapsed. `roleNavigation.tsx`: `getOperationManagerNavigation()` (7 items, `to: '/workspace/qa/operationmanager/…'` except rankings) and `getOperationManagerNavigationGrouped()` which slices by index (`items[0]`, `slice(1,4)`, `[items[4]]`, `[items[5], items[6]]`). The QA Manager inbox item is the model: `{ key: 'qamanager-inbox', label: 'sidebar.qamanager.inbox', icon: <IconBell size={20} className={styles.menuIcon} />, to: '/qa/qa-manager/inbox', i18nNamespace: 'qa.inbox', badge: 'inbox' }`.
- Routes `qa.operation-manager.inbox` and `.detail` already exist and render the shared pages.
- `details/index.tsx` L80: `<SimpleGrid cols={3} spacing='md'>` (METRIC_ALERT facts, no breakpoint).
- `qa.inbox.json` (en/es, 195 lines, identical key sets) has `page`, `table`, `categories`, `priorities`, `sources`, `filters`, `drawer`, `reply`, `details`, `detail` (`back`, `from`, `notFound`). `common.json` has `sidebar.operationmanager.*` (no `inbox`).

---

## Direction

```
OPERATION MANAGER · PORTFOLIO
Inbox  [5 unread]                                         [Mark all as read]
Alerts, recognitions, messages and updates routed to you

┌ Notifications ─────────────────────────────────────────────────────────────────┐
│ Needs action 3 │ All 6 │ Archived 0                                            │
│ [Search…]  [Type ▾] [Priority ▾] [Agent ▾]* [Date range]  [Unread only ○] Clear│
│ ● Burnout risk   Burnout risk is rising across Team 2        —   System  Critical  2 h ago │
│                  Four of five burnout conditions are met…                [✉ ⌫ on hover]    │
│ ● Trend warning  Compliance is slipping on Collections       —   System  High      5 h ago │
│                  Compliance fell from 92% to 87% over…                                      │
│ ○ Weekly summary Portfolio week: 1–7 September               —   System  Low       4 d ago │
└────────────────────────────────────────────────────────────────────────────────┘
* Agent filter and column for managers only
```

Colour: unread = bold title + tinted row + brand dot (no blue title). Priority badge only for High (amber) and Critical (danger); Normal and Low are plain dimmed text.

---

## Implementation plan

Execute in order; `npm run typecheck` after each task. Files marked CRLF are edited with an EOL-aware script (read, normalise to LF, replace, write back with the original EOL); prettier may turn them into LF, which is harmless because the git index is LF. Scripts go in the scratchpad and are written with the Write tool.

### Task 0 — Plan copy

Copy this file to `docs/superpowers/plans/2026-10-19-inbox-ux-ui.md`.

### Task 1 — Model, identity and helpers

**1a. `src/models/qa/notifications.ts`**: `NotificationRecipientRole = 'AGENT' | 'SUPERVISOR' | 'QA_MANAGER' | 'OPERATION_MANAGER'`. Fix any exhaustive `Record<NotificationRecipientRole, …>` the typecheck reports.

**1b. `src/modules/qa/team/constants.ts`**: after `QA_MANAGER_PERSONA` add `export const OPERATION_MANAGER_PERSONA = { id: 'OPM-001', name: 'Sofía Navarro' };`.

**1c. `src/modules/qa/inbox/constants.ts`** (CRLF) — additions only, existing exports keep their behaviour:

```ts
/** Who can look at an inbox: the three roles plus the Operation Manager, which has its own mailbox but the QA Manager's routes. */
export type InboxViewer = InboxRole | 'operation-manager';

export const INBOX_VIEWER_IDENTITY: Record<
	InboxViewer,
	{ role: NotificationRecipientRole; id: string; name: string }
> = {
	...INBOX_IDENTITY,
	'operation-manager': {
		role: 'OPERATION_MANAGER',
		id: OPERATION_MANAGER_PERSONA.id,
		name: OPERATION_MANAGER_PERSONA.name,
	},
};

export const inboxViewerFromPath = (pathname: string): InboxViewer =>
	pathname.startsWith('/qa/operation-manager')
		? 'operation-manager'
		: inboxRoleFromPath(pathname);

/** The role whose routes serve this viewer (the Operation Manager reuses the QA Manager's pages). */
export const inboxRouteRole = (viewer: InboxViewer): InboxRole =>
	viewer === 'operation-manager' ? 'qa-manager' : viewer;
```

`personNameOf`: also resolve `OPERATION_MANAGER_PERSONA.id`. Add `agentNameOf(id) => TEAM_AGENTS.find(a => a.id === id)?.name ?? null` (agents only, so team-level items do not show a manager's name as "Agent").

Display kind (replaces the 5-label category in the UI; `CATEGORY_META` stays for other users):

```ts
export type InboxKind =
	| 'message'
	| 'metricAlert'
	| 'trendWarning'
	| 'burnout'
	| 'recognition'
	| 'badge'
	| 'weeklySummary'
	| 'coaching'
	| 'learning'
	| 'followUp'
	| 'dispute'
	| 'ranking';

export const INBOX_KIND_META: Record<InboxKind, { icon: TablerIcon }>; // Tabler icons: IconMessage, IconAlertTriangle, IconTrendingDown, IconFlame, IconTrophy, IconAward, IconCalendarStats, IconUsersGroup, IconSchool, IconPhoneCall, IconGavel, IconTarget

const KIND_BY_PAYLOAD: Record<NotificationPayload['kind'], InboxKind> = {
	MESSAGE: 'message',
	METRIC_ALERT: 'metricAlert',
	TREND_WARNING: 'trendWarning',
	BURNOUT_RISK: 'burnout',
	RECOGNITION: 'recognition',
	BADGE_EARNED: 'badge',
	WEEKLY_SUMMARY: 'weeklySummary',
	COACHING_SESSION: 'coaching',
	LMS_ASSIGNMENT: 'learning',
	FOLLOW_UP: 'followUp',
	DISPUTE_UPDATE: 'dispute',
	RANKING_UPDATE: 'ranking',
};

/** Falls back to the category for rows without a payload. */
export const kindOf = (n: AgentNotification): InboxKind =>
	n.payload
		? KIND_BY_PAYLOAD[n.payload.kind]
		: FALLBACK_BY_CATEGORY[n.category];
```

(`FALLBACK_BY_CATEGORY`: DIRECT_MESSAGE→message, METRIC_ALERT→metricAlert, TREND_WARNING→trendWarning, POSITIVE_RECOGNITION→recognition, WEEKLY_SUMMARY→weeklySummary.) Verify each Tabler icon name exists in `@tabler/icons-react` before using it; swap for a close one if not.

Priority tones, replacing `PRIORITY_COLOR` (grep its users first; the detail page is one; delete it when unused):

```ts
/** Exceptions only: High and Critical get a tone; Normal and Low stay plain text. */
export const PRIORITY_TONE: Record<
	AgentNotification['priority'],
	string | null
> = { CRITICAL: 'danger', HIGH: 'amber', NORMAL: null, LOW: null };
```

**1d. `src/modules/qa/inbox/helpers.ts`** (LF) — add:

```ts
/** Archived items of one inbox (same recipient rule as `isForInbox`, but archived). */
export const archivedFor = (all, role, id) =>
	all.filter(
		(n) =>
			n.archived &&
			(n.recipientRole ?? 'AGENT') === role &&
			(n.recipientId ?? n.agentId) === id
	);

/** Unread High / Critical items, plus follow-ups nobody has acted on. Opening an alert acknowledges it. */
export const needsAction = (n: AgentNotification): boolean =>
	(!n.read && (n.priority === 'CRITICAL' || n.priority === 'HIGH')) ||
	(n.payload?.kind === 'FOLLOW_UP' && !n.actioned);
```

### Task 2 — Operation Manager seed (`src/modules/qa/inbox/mockData.ts`, EOL-aware)

Add `OPERATION_MANAGER_INBOX: AgentNotification[]` (six items, all `recipientRole: 'OPERATION_MANAGER'`, `recipientId` and `agentId` = `OPERATION_MANAGER_PERSONA.id`, ids `ntf-o01…o06`) and spread it into `INBOX_SEED` before the sort. Reuse the payload shapes listed in Verified facts:

| id      | category / kind                                                                                                                                                                         | priority | source                                        | title                                                | read | date                 |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------- | ---------------------------------------------------- | ---- | -------------------- |
| ntf-o01 | TREND_WARNING / TREND_WARNING (COMPLIANCE 92→87, −5, 'Last 30 days', sparkline [92,91,90,89,88,88,87], ruleName 'Line of business compliance trend')                                    | HIGH     | SYSTEM                                        | Compliance is slipping on Collections                | no   | `day(12,'06:45:00')` |
| ntf-o02 | TREND_WARNING / BURNOUT_RISK (level 'high', 72, same drivers as s02)                                                                                                                    | CRITICAL | SYSTEM                                        | Burnout risk is rising across Team 2                 | no   | `day(12,'07:20:00')` |
| ntf-o03 | METRIC_ALERT / METRIC_ALERT (QUALITY_ASSURANCE, QA_OVERALL_SCORE, value 74, threshold 78, BELOW, 'Last 7 days', sparkline [80,79,78,77,76,75,74], ruleName 'Line of business QA floor') | HIGH     | SYSTEM                                        | QA score is under target on Tech Support             | no   | `day(11,'09:10:00')` |
| ntf-o04 | WEEKLY_SUMMARY / WEEKLY_SUMMARY (kpis QA 84% +1, Compliance 89% −1, Sentiment 3.8 0, Calls 1,284 +64; two highlights)                                                                   | LOW      | SYSTEM                                        | Portfolio week: 1–7 September                        | no   | `day(8,'07:00:00')`  |
| ntf-o05 | DIRECT_MESSAGE / MESSAGE                                                                                                                                                                | NORMAL   | QA_MANAGER, `sourceId: QA_MANAGER_PERSONA.id` | Disputes backlog: seven open, none older than a week | no   | `day(10,'14:20:00')` |
| ntf-o06 | POSITIVE_RECOGNITION / RANKING_UPDATE (as s06, rankingName 'Q3 Customer Service Sprint', event 'ENDED')                                                                                 | LOW      | SYSTEM                                        | Q3 Customer Service Sprint closed                    | yes  | `day(3,'09:00:00')`  |

Write natural 1-2 sentence English `message`s for each (strategic tone: lines of business, teams, portfolio; no individual agent names). Result: 6 items, 5 unread, 3 needing action.

### Task 3 — Feedback helpers (`src/modules/qa/inbox/inboxToasts.tsx`, new)

```tsx
/** Toast with an Undo button, for reversible actions such as archiving. */
export const notifyWithUndo = (
	message: string,
	undoLabel: string,
	onUndo: () => void
) => {
	const id = `inbox-undo-${Date.now()}`;
	notifications.show({
		id,
		autoClose: 6000,
		message: (
			<Group justify='space-between' wrap='nowrap' gap='sm'>
				<Text size='sm'>{message}</Text>
				<Button
					variant='subtle'
					size='compact-xs'
					onClick={() => {
						onUndo();
						notifications.hide(id);
					}}
				>
					{undoLabel}
				</Button>
			</Group>
		),
	});
};
```

Plain confirmations use `notifySuccess`.

### Task 4 — Filters (`InboxFilters.tsx`, CRLF; delete `InboxFilters.module.css`)

New props (replace the old ones): `search, onSearchChange`, `unreadOnly, onUnreadOnlyChange`, `kinds: InboxKind[], onKindsChange, kindOptions: InboxKind[]`, `priorities: AgentNotification['priority'][], onPrioritiesChange`, `agent: string | null, onAgentChange, agentOptions?: { value: string; label: string }[]` (the Agent `Select` renders only when `agentOptions` is passed, i.e. managers), `range: [string | null, string | null], onRangeChange`, `onClear`, `hasActiveFilters`.

Layout: one `Group gap='sm' wrap='wrap' align='flex-end'`, no grey panel (like Disputes), every control `size='sm'`:

- `TextInput` (search, `leftSection` search icon, clear `ActionIcon` with `aria-label={t('filters.clearSearch')}`), `w={260}`, placeholder `filters.search`.
- `MultiSelect` Type: `data = kindOptions.map(k => ({ value: k, label: t('kinds.' + k) }))`, `w={200}`.
- `MultiSelect` Priority: `['CRITICAL','HIGH','NORMAL','LOW']` labelled with `priorities.*`, `w={170}`.
- `Select` Agent (managers), `clearable`, `placeholder={t('filters.allAgents')}`, `w={190}`.
- `DatePickerInput type='range'`, `placeholder={t('filters.dateRange')}`, `clearable`, `w={250}`.
- `Switch` "Unread only" (`label={t('filters.unreadOnly')}`).
- "Clear filters" `Button variant='subtle'` with `IconX`, only when `hasActiveFilters`.
  No inline styles; no theme-specific CSS.

### Task 5 — Table (`AgentInboxTable.tsx`, CRLF; rewrite `AgentInboxTable.module.css`)

Props: `notifications, onView(id), onToggleRead(n), onArchive(id), onRestore?(id), archivedView?: boolean, showAbout?: boolean`.

Columns, left to right:

1. **State** (40px, no header text): non-interactive dot (brand colour when unread, `gray-4`/`gray-6` token when read) plus `<VisuallyHidden>{t(n.read ? 'table.read' : 'table.unread')}</VisuallyHidden>`.
2. **Type** (150px, sortable by kind label): `Group gap={6}`: neutral `ThemeIcon size='sm' variant='light' color='gray'` with `INBOX_KIND_META[kindOf(n)].icon`, then `Text size='sm'` `t('kinds.' + kind)`.
3. **Message** (flex): `Text size='sm' fw={unread ? 600 : 400}` title, under it `Text size='xs' c='dimmed' lineClamp={1}` with `n.message`.
4. **Agent** (managers only, 150px): `agentNameOf(n.agentId) ?? '—'`, dimmed.
5. **From** (150px): `personNameOf(n.sourceId) ?? t('sources.' + n.sourceRole)`, dimmed.
6. **Priority** (100px, sortable by rank): `PRIORITY_TONE[p]` → `Badge variant='light' size='sm' color={tone}` with the label; otherwise `Text size='sm' c='dimmed'` with the label.
7. **Date** (130px, sortable): `Tooltip` absolute `YYYY-MM-DD HH:mm`; text `fromMockNow(n.createdAt)`.
8. **Actions** (90px, right): `<div className={styles.rowActions}>` with two `ActionIcon variant='subtle' size='md'`, each with `aria-label` and a `Tooltip`: read/unread toggle (`IconMailOpened` when unread → "Mark as read", `IconMail` when read → "Mark as unread") and archive (`IconArchive`) — or restore (`IconArrowBackUp`) when `archivedView`. All `onClick` call `e.stopPropagation()`. The chevron and the inverted check button are removed.

`BaseTable` props: `getRowClassName={(row) => [styles.row, row.original.read ? '' : styles.unreadRow].filter(Boolean).join(' ')}`, `onRowClick`, `enablePagination pageSize={10} showPaginationControls`, `initialSort createdAt desc`, `emptyMessage={t('table.empty')}` (the page renders an `EmptyState` before the table when there is nothing to show, so this is only a fallback).

CSS (`AgentInboxTable.module.css`, Mantine tokens and `light-dark()` only; drop every `data-theme` / `prefers-color-scheme` rule and `.unreadTitle`):

```css
.tableRoot {
	overflow-x: auto;
}
.inboxTable {
	width: 100%;
}
.unreadRow {
	background-color: light-dark(
		var(--mantine-color-gray-0),
		var(--mantine-color-dark-6)
	);
}
.rowActions {
	display: flex;
	justify-content: flex-end;
	gap: var(--mantine-spacing-xs);
	opacity: 0;
	transition: opacity 0.15s ease;
}
.row:hover .rowActions,
.row:focus-within .rowActions {
	opacity: 1;
}
@media (hover: none) {
	.rowActions {
		opacity: 1;
	}
}
.dot {
	/* 8px circle */
	border-radius: 50%;
	width: 8px;
	height: 8px;
	background-color: var(--mantine-primary-color-filled);
}
.dotRead {
	background-color: light-dark(
		var(--mantine-color-gray-4),
		var(--mantine-color-dark-3)
	);
}
```

Remove the `style={{ fill: 'currentColor' }}` inline style with the old dot icon.

### Task 6 — Page (`InboxPage.tsx`, LF)

- Identity: `const viewer = inboxViewerFromPath(location.pathname); const me = INBOX_VIEWER_IDENTITY[viewer]; const isManager = viewer !== 'agent';`
- Data: `mine = inboxFor(...)`, `archived = archivedFor(notifications, me.role, me.id)`.
- State: `tab: 'needs' | 'all' | 'archived'` — lazy initial `needs` when `mine.some(needsAction)` else `all` (and `all` when `?agent=` is present); filters `search, unreadOnly, kinds, priorities, agent, range`. Read `?agent=` once with `useSearchParams` for managers to seed `agent`.
- Pipeline: `pool = tab === 'archived' ? archived : tab === 'needs' ? mine.filter(needsAction) : mine`; apply filters (unreadOnly, kinds via `kindOf`, priorities, agent via `n.agentId === agent`, range on `createdAt` day, search over title, message, sender name and agent name, lower-cased); sort `createdAt` desc. `counts = { needs: mine.filter(needsAction).length, all: mine.length, archived: archived.length }`.
- Header: eyebrow `t('page.eyebrow.' + viewer)`; unread badge becomes `Badge variant='light' color='gray' size='lg'`; "Mark all as read" acts on the **visible unread items** (`visible.filter(n => !n.read)`, not on the archived tab), disabled when none, then `notifySuccess(t('page.markedRead', { count }))`.
- Body: `SectionCard` (`title` and `description` as today) containing `Tabs` (tab list only; each `Tabs.Tab` has `rightSection={<Badge size='xs' variant='light' color='gray'>{count}</Badge>}`), `InboxFilters`, then either an `EmptyState` or `AgentInboxTable`.
- `EmptyState` (shared, `IconInbox` / `IconFilterOff` size 40): when a filter is active → `empty.filtered.*` with `action={<Button variant='default' size='xs' onClick={clear}>…</Button>}`; else per tab `empty.needsAction.*`, `empty.all.*`, `empty.archived.*`.
- Handlers: `onView` marks read then navigates to `${location.pathname}/${id}` (unchanged); `onToggleRead`; `onArchive(id)` → `archiveNotification(id)` + `notifyWithUndo(t('toast.archived'), t('toast.undo'), () => unarchiveNotification(id))`; `onRestore(id)` → `unarchiveNotification(id)` + `notifySuccess(t('toast.restored'))`.
- Filter option lists: `kindOptions = [...new Set(mine.concat(archived).map(kindOf))]` in `Object.keys(INBOX_KIND_META)` order; `agentOptions` (managers) from the distinct `agentNameOf` ids present in `mine.concat(archived)`.

### Task 7 — Detail page (`NotificationDetailPage.tsx`, LF) and details

- Use `inboxViewerFromPath` / `INBOX_VIEWER_IDENTITY`; compute `const routeRole = inboxRouteRole(viewer)` and pass `routeRole` to every path helper (`analyticsPath`, `customersPath`, `disputesBasePath`, `lmsPath`, `rankingsBasePath`, and the new CTA's `coachingPath`).
- Header badges: kind badge `Badge size='sm' variant='light' color='gray' leftSection={<KindIcon size={12} />}` with `t('kinds.' + kind)`; priority badge `variant='light' color={PRIORITY_TONE[p] ?? 'gray'}`. Remove `CATEGORY_META` and `PRIORITY_COLOR` from this file.
- Breadcrumb: `<Anchor component='button' type='button' size='sm' onClick=…>` so it takes focus.
- Not-found: `EmptyState` with `action={<Button variant='default' onClick={() => navigate(inboxListPath)}>{t('detail.notFoundAction')}</Button>}`.
- Actions: **Mark as unread** stays on the page (`markAsUnread` + `notifySuccess(t('toast.markedUnread'))`); **Archive** archives, shows `notifyWithUndo(t('toast.archived'), t('toast.undo'), () => unarchiveNotification(id))` and navigates back. Reply: `notifySuccess(t('toast.replySent'))` after `addReply`. Guard `handleSend` with `if (me.role === 'OPERATION_MANAGER') return;` (the Operation Manager has no reply thread) and hide the thread for that viewer: `showThread && viewer !== 'operation-manager'`. Widen `MessageThread`'s `viewerRole` prop type to `NotificationRecipientRole` if the typecheck asks.
- New CTA: `case 'COACHING_SESSION': return { label: t('details.coaching.cta'), to: coachingPath(routeRole) }`.
- Mobile order: on the two `Grid.Col`s set `order={{ base: 2, md: 1 }}` (main) and `order={{ base: 1, md: 2 }}` (actions) so the actions sit above the thread on narrow screens.
- `src/modules/qa/inbox/components/details/index.tsx` L80: `<SimpleGrid cols={{ base: 1, sm: 3 }} spacing='md'>`.

### Task 8 — Sidebar and navigation

- `roleNavigation.tsx` (check EOL): add `operationmanager-inbox` to `getOperationManagerNavigation()` as the second item with the QA Manager item's shape (`to: '/qa/operation-manager/inbox'`, `label: 'sidebar.operationmanager.inbox'`, `badge: 'inbox'`, `i18nNamespace: 'qa.inbox'`). Rewrite `getOperationManagerNavigationGrouped()` to pick items by key instead of by index (`const byKey = (k: string) => items.find((i) => i.key === k)!`): primary group `[dashboard, inbox]`, organization `[supervisors, team-health, clients]`, configuration `[rankings]`, insights `[analytics, reports]`.
- `Sidebar.tsx` (check EOL): the inbox badge uses `INBOX_VIEWER_IDENTITY[inboxViewerFromPath(item.to)]` (imports updated; the **disputes** badge keeps `inboxRoleFromPath`). Add `aria-label={t('sidebar.inboxUnread', { count: badgeCount })}` to the badge when `item.badge === 'inbox'`. When the sidebar is collapsed and `badgeCount > 0`, wrap the icon in Mantine `Indicator inline size={8} offset={3} color='var(--mantine-primary-color-filled)'` so the unread signal is not lost.

### Task 9 — Copy

Merge into both `src/locales/{en,es}/qa.inbox.json` (deep-merge script, `JSON.stringify(obj, null, '\t')`, then prettier; `git diff --stat` must show insertions only apart from the changed `filters.search` line):

| key                                                                                                                                                                     | en                                                                                                                                                 | es                                                                                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `page.eyebrow.operation-manager`                                                                                                                                        | Operation Manager · Portfolio                                                                                                                      | Gerente de operaciones · Cartera                                                                                                                                               |
| `page.markedRead_one` / `_other`                                                                                                                                        | {{count}} message marked as read / {{count}} messages marked as read                                                                               | {{count}} mensaje marcado como leído / {{count}} mensajes marcados como leídos                                                                                                 |
| `tabs.needsAction` / `all` / `archived`                                                                                                                                 | Needs action / All / Archived                                                                                                                      | Requiere acción / Todos / Archivados                                                                                                                                           |
| `filters.search` (changed)                                                                                                                                              | Search title, message, sender or agent                                                                                                             | Buscar por título, mensaje, remitente o agente                                                                                                                                 |
| `filters.clearSearch`                                                                                                                                                   | Clear search                                                                                                                                       | Borrar búsqueda                                                                                                                                                                |
| `filters.unreadOnly`                                                                                                                                                    | Unread only                                                                                                                                        | Solo sin leer                                                                                                                                                                  |
| `filters.kinds` / `priority` / `agent` / `allAgents` / `dateRange`                                                                                                      | Type / Priority / Agent / All agents / Date range                                                                                                  | Tipo / Prioridad / Agente / Todos los agentes / Rango de fechas                                                                                                                |
| `kinds.message` / `metricAlert` / `trendWarning` / `burnout` / `recognition` / `badge` / `weeklySummary` / `coaching` / `learning` / `followUp` / `dispute` / `ranking` | Message / Metric alert / Trend warning / Burnout risk / Recognition / Badge / Weekly summary / Coaching / Learning / Follow-up / Dispute / Ranking | Mensaje / Alerta de métrica / Alerta de tendencia / Riesgo de burnout / Reconocimiento / Insignia / Resumen semanal / Coaching / Aprendizaje / Seguimiento / Disputa / Ranking |
| `table.columns.message`                                                                                                                                                 | Message                                                                                                                                            | Mensaje                                                                                                                                                                        |
| `table.read` / `table.unread`                                                                                                                                           | Read / Unread                                                                                                                                      | Leído / Sin leer                                                                                                                                                               |
| `table.actions.restore`                                                                                                                                                 | Restore                                                                                                                                            | Restaurar                                                                                                                                                                      |
| `empty.needsAction.title` / `.description`                                                                                                                              | You are all caught up / Nothing needs your attention right now.                                                                                    | Estás al día / Nada requiere tu atención ahora.                                                                                                                                |
| `empty.all.title` / `.description`                                                                                                                                      | Your inbox is empty / New alerts, messages and updates will show up here.                                                                          | Tu bandeja está vacía / Aquí aparecerán nuevas alertas, mensajes y novedades.                                                                                                  |
| `empty.archived.title` / `.description`                                                                                                                                 | Nothing archived / Archived messages show up here so you can restore them.                                                                         | Nada archivado / Los mensajes archivados aparecen aquí para poder restaurarlos.                                                                                                |
| `empty.filtered.title` / `.description`                                                                                                                                 | No messages match these filters / Remove a filter or search for something else.                                                                    | Ningún mensaje coincide con estos filtros / Quita un filtro o busca otra cosa.                                                                                                 |
| `toast.archived` / `undo` / `restored` / `markedUnread` / `replySent`                                                                                                   | Message archived / Undo / Message restored / Marked as unread / Reply sent                                                                         | Mensaje archivado / Deshacer / Mensaje restaurado / Marcado como sin leer / Respuesta enviada                                                                                  |
| `detail.notFoundAction`                                                                                                                                                 | Back to inbox                                                                                                                                      | Volver a la bandeja                                                                                                                                                            |
| `details.coaching.cta` (only if absent)                                                                                                                                 | Open coaching                                                                                                                                      | Abrir coaching                                                                                                                                                                 |

Merge into both `src/locales/{en,es}/common.json` (`sidebar`): `operationmanager.inbox` = Inbox / Bandeja de entrada; `inboxUnread_one` / `inboxUnread_other` = {{count}} unread / {{count}} sin leer. Keep the now-unused `categories.*`, `table.empty`, `drawer.*` keys (other code may use them; grep before deleting nothing).

### Task 10 — Checks

- `npm run typecheck` clean.
- `JSON.parse` of the four locale files; a key script asserting every `t('…')` key in `InboxPage.tsx`, `InboxFilters.tsx`, `AgentInboxTable.tsx`, `NotificationDetailPage.tsx`, `inboxToasts` callers exists in en and es (`kinds.*` and `priorities.*` expanded by hand; `_one/_other` plurals resolved).
- Seed sanity script (regex over `mockData.ts`): per viewer total / unread / needs-action / archived. Expected: agent 14 / 7, supervisor 7 / 5, qa-manager 6 / 4, operation-manager 6 / 5 / **3** needing action; every viewer has at least one needs-action item and archived = 0.
- Greps, all empty: `data-theme\|prefers-color-scheme` in `src/modules/qa/agent/inbox/`; `style=` in the new/edited inbox files; `PRIORITY_COLOR\|getPriorityColor` anywhere; `'Direct Message'` in `InboxFilters`.
- `git ls-files --eol` on edited CRLF files; `git status --short` lists only intended files; `InboxFilters.module.css` deleted.
- `npx prettier --write` on touched files only.

---

## Behaviour summary (demo script)

| Where                    | Action                                        | Result                                                                                                            |
| ------------------------ | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Any inbox                | Open                                          | Lands on **Needs action** when it has items (counts on all three tabs), else **All**                              |
| Row                      | Hover or focus                                | Read/unread and archive actions appear; touch screens show them always                                            |
| Row                      | Click                                         | Marks read and opens the detail (unchanged)                                                                       |
| Row                      | Archive                                       | Row leaves the list, toast "Message archived · Undo" for 6 seconds                                                |
| Archived tab             | Restore                                       | Message returns to All, toast "Message restored"                                                                  |
| Filters                  | Type "burnout", Priority High                 | Rows narrow; "Clear filters" appears; an empty result shows "No messages match these filters" with a clear button |
| Manager inbox            | Agent filter / `?agent=AGT-006` from Triggers | Only that agent's items                                                                                           |
| Header                   | Mark all as read                              | Marks the **visible** unread items, toast with the count                                                          |
| Dark mode                | Toggle the app theme                          | Filters and unread rows follow the app theme, not the OS                                                          |
| Operation Manager        | Sidebar → Inbox                               | Own entry with badge 5, eyebrow "Operation Manager · Portfolio", six portfolio-level items, no reply thread       |
| Detail (coaching)        | Open                                          | New "Open coaching" button                                                                                        |
| Detail (mobile width)    | Open                                          | Actions above the conversation; "Mark as unread" keeps you on the page                                            |
| Collapsed sidebar        | Unread present                                | Dot on the Inbox icon                                                                                             |
| Disputes pages, Triggers | Open                                          | Unchanged                                                                                                         |

## Verification

No dev server and no tests: typecheck, JSON parse, key script, seed sanity script and greps from Task 10. Visual check by the user at `/qa/{agent,supervisor,qa-manager,operation-manager}/inbox`, light and dark, desktop and a narrow width.

## Out of scope

- The header bell (`Header.tsx` is never rendered), the dead dashboard widgets (`InboxSummary`, `AgentInbox`, `AlertsInbox`) and the legacy `InboxItem` model.
- Nested interactive elements inside `BaseTable`'s `role='button'` rows (owned by `BaseTable`).
- A real snooze or resolve state, bulk selection, and translating the seeded message bodies.
- Sidebar badge colour (shared with the Disputes badge) and focusable evidence badges in `CoachingSessionContext`.
- Reply threads for the Operation Manager.
