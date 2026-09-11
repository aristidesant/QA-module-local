# Manager Inbox (Supervisor / QA Manager) + Sidebar Unread Counters — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Execute tasks **in order**; every task compiles on its own.

**Goal:** Give Supervisors and QA Managers their own Inbox: the alerts they configured for themselves (metric alerts, trend warnings, burnout, weekly summaries, escalations, recognitions copied to them, dispute submissions) plus direct messages and replies from their agents — with the same structure and message types as the Agent inbox, filters by agent and by supervisor, a message detail with thread + reply, a compose flow, and an **unread counter** in the sidebar (same pattern as the Disputes counter) for the Agent, Supervisor and QA Manager inbox entries.

**Architecture:** New module `src/modules/qa/inbox/` with `ManagerInboxPage` replacing the agent `InboxPage` on the existing `supervisor/inbox` and `qa-manager/inbox` routes (route ids unchanged). New model `src/models/qa/managerInbox.ts`, new store `src/stores/qa/managerInboxStore.ts` seeded from `src/modules/qa/inbox/mockData.ts`. Sidebar gains a second badge kind (`'inbox'`) fed by a small hook that reads the agent store (`notificationStore`) or the manager store depending on the link. Compose/reply write into **both** stores so the agent Inbox shows the message (end-to-end demo). Namespace `qa.inbox`.

**Tech Stack:** React 19, React Router v7, Mantine v9.2 (`core`, `dates`, `form`, `modals`), dayjs (`relativeTime`, already used by `AgentInboxTable`), Zustand v5, react-i18next.

**Spec (user):** Inbox where the QA Manager and Supervisor receive the alerts they configured for themselves and any direct reply or direct message from agents. Counter in the sidebar menu item (nominal value in a circle) with unread count, like Disputes. Same structure as the agent inbox, same message types (direct message, trend alert, score alert, negative range…). Filters by agent and by supervisor (supervisor = every message coming from people under that supervisor).

**Assumptions (careful-colleague defaults, change if needed):** replies and a "Compose message to agent" flow are included because "respuestas directas" implies a thread; the agent Inbox page itself is not modified (only its sidebar counter is added).

**Dependencies:** none hard. Optional cross-links: Triggers (`/qa/<role>/triggers?tab=alerts`), Team Analytics (`/qa/<role>/analytics?view=burnout&agentId=`), Disputes list (`/qa/disputes`). If `notificationStore.addNotification` is missing (added by Triggers/Analytics plans), Task 1 adds it.

---

## Global Constraints

- **Design-session rules (DESIGN_ROLE.md):** mock only; no `npm run dev`, tests or `git commit` unless the user explicitly asks in the execution session. `npm run typecheck` after each task.
- Mantine v9, CSS Modules, no inline styles, tokens/`light-dark()` only, dark & light mode.
- Reuse: `SectionCard`, `AppDrawer`, `BaseTable` (with `enableRowSelection`), `EmptyState`, `FilterContainer`, `PaginationControls`, `InlineNotice`, `ContentContainer`, `AppSegmentedControl`.
- Do **not** modify `src/modules/qa/dashboard/pages/InboxPage.tsx`, `src/modules/qa/agent/inbox/**`, or `src/modules/qa/dashboard/mockData.ts`.
- New strings via `useTranslation('qa.inbox')`; add `src/locales/en/qa.inbox.json` + `src/locales/es/qa.inbox.json`. Sidebar labels live in `common.json` (`sidebar.rolePreview.items.inbox` already exists).
- TypeScript strict, no `any`, tabs, `~/` imports.

---

## Identity & roster (shared with the other plans)

- Supervisor persona **Maria García** (`SUP-001`, Team 1): agents `AGT-001` Sarah Johnson, `AGT-002` Mike Chen, `AGT-003` Jessica Martinez, `AGT-004` John Smith, `AGT-005` Emma Davis, `AGT-006` David Brown, `AGT-007` Lisa Wong.
- Other supervisors: **Juan Pérez** (`SUP-002`, Team 2: `AGT-008` Sofia Rodríguez, `AGT-010` Carlos Vega, `AGT-011` Lucía Torres, `AGT-012` Diego Ramírez …), **Laura Gómez** (`SUP-003`, Team 3: `AGT-015` Camila Herrera, `AGT-017` Nina Patel …).
- QA Manager persona **Elena Ruiz** (`QAM-001`) — sees messages about every team.

---

## File Structure

### New files

```
src/models/qa/managerInbox.ts
src/stores/qa/managerInboxStore.ts
src/locales/en/qa.inbox.json, src/locales/es/qa.inbox.json
src/modules/qa/inbox/
  constants.ts                                  — category meta (icon/color), priority colors, quick templates, status filters
  mockData.ts                                   — roster options + seeded messages for SUP-001 and QAM-001
  helpers.ts                                    — filterMessages, unread counters, initials, deep-link builders
  hooks/useInboxUnreadCount.ts                  — unread count for a sidebar link (agent or manager store)
  ManagerInboxPage/ManagerInboxPage.tsx (+ .module.css, index.ts)
  components/InboxCategoryChips.tsx             — category quick filter with counts
  components/InboxFilters/InboxFilters.tsx (+ index.ts)
  components/InboxTable/InboxTable.tsx (+ .module.css, index.ts)
  components/InboxBulkBar.tsx
  components/MessageDetailDrawer/MessageDetailDrawer.tsx (+ .module.css, index.ts)
  components/MessageThread.tsx                  — reply bubbles + composer
  components/ComposeMessageModal/ComposeMessageModal.tsx (+ index.ts)
```

### Modified files

- `src/models/qa/index.ts` — `export * from './managerInbox';`
- `src/stores/qa/notificationStore.ts` — `addNotification` (only if missing) and `addReply(notificationId, reply)`
- `src/routes.tsx` — `supervisor/inbox` and `qa-manager/inbox` render `ManagerInboxPage` (keep ids `qa.supervisor.inbox`, `qa.qa-manager.inbox`); add lazy import
- `src/modules/qa/qaNamespaces.ts` — the two ids → `'qa.inbox'`
- `src/components/Sidebar/Sidebar.tsx` — `badge?: 'disputes' | 'inbox'`; inbox count branch in `SidebarLinkItem`; add Inbox entries to `supervisor` and `qaManager` nav arrays; `badge: 'inbox'` on the agent Inbox entry

### Reference files (read-only)

- `src/modules/qa/dashboard/pages/InboxPage.tsx`, `src/modules/qa/agent/inbox/InboxFilters.tsx`, `AgentInboxTable.tsx` — structure, filters, dayjs relative dates, category badge `data-category` pattern
- `src/models/qa/notifications.ts` — `AgentNotification` (shape pushed to the agent inbox on compose/reply)
- `src/stores/qa/notificationStore.ts` — agent inbox store (`getUnreadCount`)
- `src/components/Sidebar/Sidebar.tsx:88-95` (`SidebarNavItem.badge`), `:1171-1256` (`SidebarLinkItem` disputes badge), `:563-620` / `:672-735` (supervisor / qaManager nav arrays)
- `src/modules/qa/evaluations/DisputeDrawer/DisputeDrawer.tsx` (+ `.module.css`) — drawer body/footer pattern

---

## Task 1: Model, constants, mock data, store, agent-store additions

**Files:** `src/models/qa/managerInbox.ts`, `src/models/qa/index.ts`, `src/modules/qa/inbox/constants.ts`, `mockData.ts`, `src/stores/qa/managerInboxStore.ts`, `src/stores/qa/notificationStore.ts`

- [ ] **Step 1: `src/models/qa/managerInbox.ts`** (paste)

```typescript
export type ManagerRole = 'SUPERVISOR' | 'QA_MANAGER';

export type ManagerInboxCategory =
	| 'DIRECT_MESSAGE'        // agent → manager, or a thread the manager started
	| 'METRIC_ALERT'          // score / nominal alert the manager configured for themselves
	| 'TREND_WARNING'         // percentage decline / consecutive bad calls
	| 'POSITIVE_RECOGNITION'  // recognition sent to an agent, copied to the manager
	| 'WEEKLY_SUMMARY'        // team / platform digest
	| 'BURNOUT_RISK'          // burnout rule matched an agent
	| 'ESCALATION'            // alert not acknowledged by a supervisor in time (QA Manager)
	| 'DISPUTE_SUBMITTED';    // an agent disputed an evaluation

export type ManagerInboxPriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
export type InboxSenderRole = 'AGENT' | 'SUPERVISOR' | 'QA_MANAGER' | 'SYSTEM';
export type InboxMetric = 'QUALITY_ASSURANCE' | 'SENTIMENT_EMOTION' | 'COMPLIANCE' | 'BUSINESS_INSIGHTS' | 'BURNOUT';

export interface InboxParticipant { role: InboxSenderRole; id: string; name: string }

export interface InboxAgentRef {
	id: string;
	name: string;
	team: string;
	supervisorId: string;
	supervisorName: string;
}

export interface InboxReply {
	id: string;
	from: InboxParticipant;
	message: string;
	createdAt: string;
}

export interface InboxActionLink {
	/** i18n key under qa.inbox actions.links.* */
	labelKey: string;
	url: string;
}

export interface ManagerInboxMessage {
	id: string;
	recipientRole: ManagerRole;
	recipientId: string;           // 'SUP-001' | 'QAM-001'
	category: ManagerInboxCategory;
	priority: ManagerInboxPriority;
	title: string;
	message: string;
	sender: InboxParticipant;
	/** the agent the message is about (null for platform-wide summaries) */
	agent: InboxAgentRef | null;
	metric: InboxMetric | null;
	metricValue: string | null;    // formatted, e.g. '78%'
	threshold: string | null;      // formatted, e.g. '< 80%'
	ruleId: string | null;
	ruleName: string | null;
	read: boolean;
	archived: boolean;
	starred: boolean;
	acknowledged: boolean;
	/** true when the manager authored the thread (compose) */
	sentByMe: boolean;
	threadId: string | null;
	replies: InboxReply[];
	links: InboxActionLink[];
	createdAt: string;
	readAt: string | null;
}

export type InboxStatusFilter = 'ALL' | 'UNREAD' | 'READ' | 'ARCHIVED' | 'SENT';

export interface ManagerInboxFilters {
	search: string;
	category: ManagerInboxCategory | 'ALL';
	status: InboxStatusFilter;
	priority: ManagerInboxPriority | null;
	agentId: string | null;
	supervisorId: string | null;
	from: Date | null;
	to: Date | null;
}
```

- [ ] **Step 2:** append `export * from './managerInbox';` to `src/models/qa/index.ts`.

- [ ] **Step 3: `src/modules/qa/inbox/constants.ts`**

```typescript
import {
	IconAlertTriangle, IconArrowUpRight, IconCalendarStats, IconFlame, IconGavel,
	IconMessage, IconSparkles, IconTrendingDown, type TablerIcon,
} from '@tabler/icons-react';
import type { InboxStatusFilter, ManagerInboxCategory, ManagerInboxPriority } from '~/models/qa';

export const INBOX_CATEGORIES: ManagerInboxCategory[] = [
	'DIRECT_MESSAGE', 'METRIC_ALERT', 'TREND_WARNING', 'BURNOUT_RISK', 'ESCALATION',
	'POSITIVE_RECOGNITION', 'WEEKLY_SUMMARY', 'DISPUTE_SUBMITTED',
];
export const CATEGORY_META: Record<ManagerInboxCategory, { icon: TablerIcon; color: string }> = {
	DIRECT_MESSAGE: { icon: IconMessage, color: 'blue' },
	METRIC_ALERT: { icon: IconAlertTriangle, color: 'orange' },
	TREND_WARNING: { icon: IconTrendingDown, color: 'yellow' },
	BURNOUT_RISK: { icon: IconFlame, color: 'red' },
	ESCALATION: { icon: IconArrowUpRight, color: 'grape' },
	POSITIVE_RECOGNITION: { icon: IconSparkles, color: 'green' },
	WEEKLY_SUMMARY: { icon: IconCalendarStats, color: 'cyan' },
	DISPUTE_SUBMITTED: { icon: IconGavel, color: 'indigo' },
};
export const PRIORITY_COLORS: Record<ManagerInboxPriority, string> = { CRITICAL: 'red', HIGH: 'orange', NORMAL: 'blue', LOW: 'gray' };
export const STATUS_FILTERS: InboxStatusFilter[] = ['ALL', 'UNREAD', 'READ', 'ARCHIVED', 'SENT'];
/** Categories that support a reply thread */
export const THREADED_CATEGORIES: ManagerInboxCategory[] = ['DIRECT_MESSAGE', 'DISPUTE_SUBMITTED'];
export const QUICK_TEMPLATES = ['CHECK_IN', 'COACHING_INVITE', 'GREAT_JOB', 'CALL_REVIEW'] as const;
export type QuickTemplate = (typeof QUICK_TEMPLATES)[number];
export const PAGE_SIZE = '10';
```

- [ ] **Step 4: `mockData.ts`** — exports `INBOX_SUPERVISORS` (3 options), `INBOX_AGENTS: InboxAgentRef[]` (the roster above: 7 Team 1 + 4 Team 2 + 2 Team 3 = 13), `SUPERVISOR_INBOX: ManagerInboxMessage[]` (recipient `SUP-001`, **22 messages**) and `QA_MANAGER_INBOX: ManagerInboxMessage[]` (recipient `QAM-001`, **26 messages**). Use a `message(partial)` factory with defaults `{ priority: 'NORMAL', metric: null, metricValue: null, threshold: null, ruleId: null, ruleName: null, read: false, archived: false, starred: false, acknowledged: false, sentByMe: false, threadId: null, replies: [], links: [], readAt: null }` and `agentRef(id)` looking up `INBOX_AGENTS`. Timestamps from `2026-09-10T14:30:00Z` backwards over 12 days. Content requirements (supervisor set; the QA manager set contains the equivalent platform-wide items plus supervisor-level ones):

| id | category | priority | sender | agent | title / message gist | extras |
|---|---|---|---|---|---|---|
| MSG-S-001 | DIRECT_MESSAGE | NORMAL | AGENT David Brown | AGT-006 | "Can we talk about my queue this week?" — asks for a 1:1, mentions after-hours calls | unread; threadId THR-001; 0 replies; links: analytics burnout for AGT-006 |
| MSG-S-002 | DIRECT_MESSAGE | NORMAL | AGENT Sarah Johnson | AGT-001 | reply thread "Re: Coaching for objection handling" | read; replies: 2 (agent → me → agent); sentByMe true (I started it) |
| MSG-S-003 | METRIC_ALERT | CRITICAL | SYSTEM | AGT-007 Lisa Wong | "Compliance score below 80%" — 78% over last 7 days | metric COMPLIANCE, metricValue '78%', threshold '< 80%', ruleId ALR-001, ruleName 'Compliance score below 80%'; links: rule, agent analytics, call `/qa/call/CALL-2026-09-0533` |
| MSG-S-004 | METRIC_ALERT | CRITICAL | SYSTEM | AGT-006 | "Critical compliance error (ECC) on call CALL-2026-09-0812" | metric QUALITY_ASSURANCE, '1 ECC', '≥ 1 per call', ALR-002; acknowledged true; read |
| MSG-S-005 | TREND_WARNING | HIGH | SYSTEM | AGT-012 Diego Ramírez | "Customer sentiment dropped 17% vs previous 14 days" | metric SENTIMENT_EMOTION, '3.1', '↓ ≥ 15%', ALR-003 |
| MSG-S-006 | TREND_WARNING | HIGH | SYSTEM | AGT-007 | "3 consecutive very negative calls" | ALR-004; unread |
| MSG-S-007 | BURNOUT_RISK | CRITICAL | SYSTEM | AGT-006 | "David Brown classified as HIGH burnout risk" — drivers summary | metric BURNOUT, '82%', 'HIGH', ALR-008; links: analytics burnout |
| MSG-S-008 | BURNOUT_RISK | HIGH | SYSTEM | AGT-005 Emma Davis | "Emma Davis classified as MEDIUM burnout risk" | ALR-009; read |
| MSG-S-009 | POSITIVE_RECOGNITION | LOW | SYSTEM | AGT-001 | "Sarah Johnson earned Sentiment & Emotion Master" | metric SENTIMENT_EMOTION; REC-001; read |
| MSG-S-010 | POSITIVE_RECOGNITION | LOW | SYSTEM | AGT-002 Mike Chen | "Mike Chen reached Compliance Master (10 calls at 100%)" | REC-002 |
| MSG-S-011 | WEEKLY_SUMMARY | NORMAL | SYSTEM | null | "Weekly team summary · Sep 1–7" — QA 87%, compliance 89%, sentiment 4.0, 3 alerts, 2 recognitions | ALR-005; read; links: dashboard |
| MSG-S-012 | DISPUTE_SUBMITTED | NORMAL | AGENT Lisa Wong | AGT-007 | "Dispute submitted on evaluation #1003" — disagrees with ECC on question 2 | threadId THR-003; links: `/qa/disputes/1003` |
| MSG-S-013 | DISPUTE_SUBMITTED | NORMAL | AGENT John Smith | AGT-004 | "Dispute submitted on evaluation #1006" | read; acknowledged |
| MSG-S-014 | DIRECT_MESSAGE | LOW | AGENT Emma Davis | AGT-005 | "Thanks for the LMS material" | read; threadId THR-004; 1 reply from me |
| MSG-S-015 | METRIC_ALERT | HIGH | SYSTEM | AGT-006 | "QA score below 75% (62%)" | ALR-006; unread |
| MSG-S-016 | TREND_WARNING | NORMAL | SYSTEM | AGT-004 | "QA score improving +11% — trend reversed" (informational) | read; archived true |
| MSG-S-017 | POSITIVE_RECOGNITION | LOW | SYSTEM | AGT-011 Lucía Torres | "Mood Booster badge awarded" | archived true |
| MSG-S-018 | DIRECT_MESSAGE | NORMAL | AGENT Mike Chen | AGT-002 | "Question about the new disclosure script" | unread; threadId THR-005 |
| MSG-S-019 | WEEKLY_SUMMARY | NORMAL | SYSTEM | null | "Weekly team summary · Aug 25–31" | read; archived |
| MSG-S-020 | METRIC_ALERT | CRITICAL | SYSTEM | AGT-010 Carlos Vega | (QA-manager-only in the QAM set; in the supervisor set replace with) "Data-protection violation on CALL-2026-09-0301" for AGT-006 | ALR-010 draft rule → ruleName null, metric COMPLIANCE |
| MSG-S-021 | DIRECT_MESSAGE | NORMAL | me → AGT-006 | AGT-006 | "Let's schedule a 1:1 this week" | sentByMe true, read true, threadId THR-006, replies: 1 from David Brown "Thursday 3pm works" |
| MSG-S-022 | ESCALATION | HIGH | SYSTEM | AGT-007 | "Reminder: alert MSG-S-003 not acknowledged for 24h — escalated to QA Manager" | ruleId ALR-001; links: rule |

`QA_MANAGER_INBOX` = the same 22 with `recipientRole 'QA_MANAGER'`, `recipientId 'QAM-001'`, ids `MSG-Q-…` (supervisor-only items like MSG-S-014 become messages from supervisors: e.g. "Maria García: coaching plan for Team 1"), **plus** 4 more: `MSG-Q-023` ESCALATION CRITICAL "Alert on Lisa Wong not acknowledged by Maria García (24h)" (agent AGT-007, links rule + supervisor); `MSG-Q-024` METRIC_ALERT CRITICAL "Compliance violations (2) — Carlos Vega" (AGT-010, Team 2); `MSG-Q-025` BURNOUT_RISK HIGH "Nina Patel classified as MEDIUM burnout risk" (AGT-017, Team 3); `MSG-Q-026` WEEKLY_SUMMARY "Weekly platform summary · Sep 1–7" (null agent, 3 teams). Unread counts must end up **7** for the supervisor set and **9** for the QA manager set.

Deep link helpers (in `helpers.ts`, Task 2): `analyticsBurnoutLink(role, agentId)`, `analyticsAgentLink(role)`, `triggersLink(role)`, `disputeLink(id)`, `callLink(id)`; mock `links` use `labelKey` values `openRule`, `openAnalytics`, `openCall`, `openDispute`, `openDashboard`, `openBurnout`.

- [ ] **Step 5: `src/stores/qa/notificationStore.ts`** — add (if missing) `addNotification` and add `addReply(notificationId: string, reply: NonNullable<AgentNotification['replies']>[number])` that appends to `replies` and sets `read: false`.

- [ ] **Step 6: `src/stores/qa/managerInboxStore.ts`**

```typescript
import { create } from 'zustand';
import type { InboxReply, ManagerInboxMessage, ManagerRole } from '~/models/qa';
import { QA_MANAGER_INBOX, SUPERVISOR_INBOX } from '~/modules/qa/inbox/mockData';

let counter = 100;
export const nextInboxId = (prefix: string) => `${prefix}-${String(++counter).padStart(3, '0')}`;

interface ManagerInboxState {
	messages: ManagerInboxMessage[];
	markRead: (ids: string[]) => void;
	markUnread: (ids: string[]) => void;
	archive: (ids: string[]) => void;
	unarchive: (ids: string[]) => void;
	toggleStar: (id: string) => void;
	acknowledge: (id: string) => void;
	addMessage: (message: ManagerInboxMessage) => void;
	addReply: (id: string, reply: InboxReply) => void;
	markAllRead: (role: ManagerRole) => void;
	unreadCount: (role: ManagerRole) => number;
}

const NOW = () => new Date().toISOString();

export const useManagerInboxStore = create<ManagerInboxState>((set, get) => ({
	messages: [...SUPERVISOR_INBOX, ...QA_MANAGER_INBOX],
	markRead: (ids) => set((s) => ({ messages: s.messages.map((m) => (ids.includes(m.id) ? { ...m, read: true, readAt: m.readAt ?? NOW() } : m)) })),
	markUnread: (ids) => set((s) => ({ messages: s.messages.map((m) => (ids.includes(m.id) ? { ...m, read: false, readAt: null } : m)) })),
	archive: (ids) => set((s) => ({ messages: s.messages.map((m) => (ids.includes(m.id) ? { ...m, archived: true } : m)) })),
	unarchive: (ids) => set((s) => ({ messages: s.messages.map((m) => (ids.includes(m.id) ? { ...m, archived: false } : m)) })),
	toggleStar: (id) => set((s) => ({ messages: s.messages.map((m) => (m.id === id ? { ...m, starred: !m.starred } : m)) })),
	acknowledge: (id) => set((s) => ({ messages: s.messages.map((m) => (m.id === id ? { ...m, acknowledged: true, read: true, readAt: m.readAt ?? NOW() } : m)) })),
	addMessage: (message) => set((s) => ({ messages: [message, ...s.messages] })),
	addReply: (id, reply) => set((s) => ({ messages: s.messages.map((m) => (m.id === id ? { ...m, replies: [...m.replies, reply] } : m)) })),
	markAllRead: (role) => set((s) => ({ messages: s.messages.map((m) => (m.recipientRole === role && !m.archived ? { ...m, read: true, readAt: m.readAt ?? NOW() } : m)) })),
	unreadCount: (role) => get().messages.filter((m) => m.recipientRole === role && !m.read && !m.archived).length,
}));
```

- [ ] **Step 7: Typecheck**; **Step 8: Commit** *(if authorized)* — `feat(qa-inbox): manager inbox model, mock data and store`

---

## Task 2: Helpers, i18n, routes, namespace, sidebar counters

**Files:** `helpers.ts`, `hooks/useInboxUnreadCount.ts`, `src/locales/{en,es}/qa.inbox.json`, `qaNamespaces.ts`, `routes.tsx`, `Sidebar.tsx`, placeholder `ManagerInboxPage`

- [ ] **Step 1: `helpers.ts`**

```typescript
export function roleFromPath(pathname: string): { role: ManagerRole; recipientId: string; basePath: '/qa/supervisor' | '/qa/qa-manager' }
export const DEFAULT_FILTERS: ManagerInboxFilters = { search: '', category: 'ALL', status: 'ALL', priority: null, agentId: null, supervisorId: null, from: null, to: null };
export function filterMessages(messages: ManagerInboxMessage[], role: ManagerRole, f: ManagerInboxFilters): ManagerInboxMessage[]
// recipientRole === role; status: ALL → !archived; UNREAD → !read && !archived; READ → read && !archived; ARCHIVED → archived; SENT → sentByMe && !archived;
// category; priority; agentId → message.agent?.id; supervisorId → message.agent?.supervisorId === id OR (sender.role === 'SUPERVISOR' && sender.id === id);
// from/to inclusive on createdAt (to = end of day); search over title, message, sender.name, agent?.name; sort createdAt desc, unread first inside the same day? → keep pure createdAt desc.
export function categoryCounts(messages: ManagerInboxMessage[], role: ManagerRole): Record<ManagerInboxCategory | 'ALL', number>   // non-archived
export function initials(name: string): string
export function analyticsBurnoutLink(basePath, agentId): string   // `${basePath}/analytics?view=burnout&agentId=${agentId}`
export function triggersLink(basePath): string                     // `${basePath}/triggers?tab=alerts`
export function quickTemplateBody(t: TFunction, template: QuickTemplate, agentFirstName: string): string   // t(`compose.templates.${template}.body`, { agent })
export function toAgentNotification(message: ManagerInboxMessage, agentId: string, sourceRole: 'SUPERVISOR' | 'QA_MANAGER'): AgentNotification
// { id: nextInboxId('NTF'), agentId, category: 'DIRECT_MESSAGE', priority, title, message, icon: 'IconMessage', sourceRole, sourceId: recipientId, read: false, archived: false, actioned: false, threadId, createdAt }
```

- [ ] **Step 2: `hooks/useInboxUnreadCount.ts`** — called unconditionally by `SidebarLinkItem`:

```typescript
import { useManagerInboxStore } from '~/stores/qa/managerInboxStore';
import { useNotificationStore } from '~/stores/qa/notificationStore';

/** Unread count for an inbox sidebar link, or 0 when the link is not an inbox. */
export function useInboxUnreadCount(to: string, enabled: boolean): number {
	const agentUnread = useNotificationStore((s) => s.notifications.filter((n) => !n.read && !n.archived).length);
	const supervisorUnread = useManagerInboxStore((s) => s.messages.filter((m) => m.recipientRole === 'SUPERVISOR' && !m.read && !m.archived).length);
	const qaManagerUnread = useManagerInboxStore((s) => s.messages.filter((m) => m.recipientRole === 'QA_MANAGER' && !m.read && !m.archived).length);
	if (!enabled) return 0;
	if (to.startsWith('/qa/agent/inbox')) return agentUnread;
	if (to.startsWith('/qa/supervisor/inbox')) return supervisorUnread;
	if (to.startsWith('/qa/qa-manager/inbox')) return qaManagerUnread;
	return 0;
}
```

- [ ] **Step 3: `src/locales/en/qa.inbox.json`** (paste; es mirrors keys)

```json
{
	"page": {
		"title": "Inbox",
		"subtitle": { "SUPERVISOR": "Alerts you configured, messages and replies from your team", "QA_MANAGER": "Alerts, escalations and messages from every team" },
		"unread_one": "{{count}} unread", "unread_other": "{{count}} unread",
		"compose": "New message",
		"markAllRead": "Mark all as read",
		"listTitle": "Messages",
		"listDescription": "Everything routed to you, newest first"
	},
	"categories": {
		"ALL": "All",
		"DIRECT_MESSAGE": "Direct message", "METRIC_ALERT": "Metric alert", "TREND_WARNING": "Trend warning",
		"BURNOUT_RISK": "Burnout risk", "ESCALATION": "Escalation", "POSITIVE_RECOGNITION": "Recognition",
		"WEEKLY_SUMMARY": "Weekly summary", "DISPUTE_SUBMITTED": "Dispute submitted"
	},
	"priority": { "CRITICAL": "Critical", "HIGH": "High", "NORMAL": "Normal", "LOW": "Low" },
	"roles": { "AGENT": "Agent", "SUPERVISOR": "Supervisor", "QA_MANAGER": "QA Manager", "SYSTEM": "System" },
	"status": { "ALL": "All", "UNREAD": "Unread", "READ": "Read", "ARCHIVED": "Archived", "SENT": "Sent" },
	"filters": {
		"search": "Search messages...", "status": "Status", "priority": "Priority", "allPriorities": "All priorities",
		"agent": "Agent", "allAgents": "All agents", "supervisor": "Supervisor", "allSupervisors": "All supervisors",
		"from": "From date", "to": "To date", "clear": "Clear filters"
	},
	"table": {
		"columns": { "from": "From", "subject": "Subject", "about": "About", "priority": "Priority", "date": "Date" },
		"replies_one": "{{count}} reply", "replies_other": "{{count}} replies",
		"you": "You",
		"acknowledged": "Acknowledged",
		"markRead": "Mark as read", "markUnread": "Mark as unread", "star": "Star", "unstar": "Unstar",
		"archive": "Archive", "unarchive": "Unarchive", "view": "View", "acknowledge": "Acknowledge",
		"selected_one": "{{count}} selected", "selected_other": "{{count}} selected",
		"bulkRead": "Mark read", "bulkArchive": "Archive", "clearSelection": "Clear"
	},
	"empty": { "title": "Your inbox is empty", "description": "Alerts and messages from your team will show up here.", "noMatches": "No messages match the current filters" },
	"detail": {
		"from": "From", "about": "About", "received": "Received", "rule": "Rule", "metric": "Metric",
		"observed": "Observed {{value}} · condition {{threshold}}",
		"thread": "Conversation",
		"replyPlaceholder": "Write a reply...",
		"send": "Send",
		"noThread": "Replies are not available for this message type",
		"acknowledge": "Acknowledge",
		"acknowledgedAt": "Acknowledged",
		"messageAgent": "Message agent",
		"archive": "Archive", "unarchive": "Unarchive",
		"links": { "openRule": "Open rule", "openAnalytics": "Open analytics", "openCall": "Open call", "openDispute": "Open dispute", "openDashboard": "Open dashboard", "openBurnout": "Open burnout detail" }
	},
	"compose": {
		"title": "New message",
		"to": "To", "toPlaceholder": "Choose an agent", "subject": "Subject", "message": "Message", "priority": "Priority",
		"template": "Quick template", "templatePlaceholder": "Start from a template...",
		"templates": {
			"CHECK_IN": { "label": "Check-in", "subject": "Quick check-in", "body": "Hi {{agent}}, how is your week going? Anything I can help with?" },
			"COACHING_INVITE": { "label": "Coaching invite", "subject": "Coaching session this week", "body": "Hi {{agent}}, let's schedule a short coaching session this week. Which day works best for you?" },
			"GREAT_JOB": { "label": "Great job", "subject": "Great job on your recent calls", "body": "{{agent}}, your recent calls were excellent — customers noticed and so did I. Keep it up!" },
			"CALL_REVIEW": { "label": "Call review", "subject": "Let's review a call together", "body": "Hi {{agent}}, I'd like to review one of your calls with you. I'll share the recording before we meet." }
		},
		"send": "Send message", "cancel": "Cancel",
		"validation": { "toRequired": "Choose a recipient", "subjectRequired": "Subject is required", "messageRequired": "Message is required" }
	},
	"notifications": {
		"sent": "Message sent to {{agent}}", "replied": "Reply sent", "acknowledged": "Alert acknowledged",
		"archived_one": "{{count}} message archived", "archived_other": "{{count}} messages archived",
		"markedRead_one": "{{count}} message marked as read", "markedRead_other": "{{count}} messages marked as read",
		"allRead": "All messages marked as read"
	}
}
```

- [ ] **Step 4:** `qaNamespaces.ts` → `'qa.supervisor.inbox': 'qa.inbox', 'qa.qa-manager.inbox': 'qa.inbox'`. Placeholder `ManagerInboxPage` (`ContentContainer` + `Title`), `index.ts`.
- [ ] **Step 5: `routes.tsx`** — `const QaManagerInboxPage = React.lazy(() => import('./modules/qa/inbox/ManagerInboxPage'));` and swap the element in the `supervisor/inbox` (~line 933) and `qa-manager/inbox` (~line 944) routes to `<QaManagerInboxPage />`. `agent/inbox` and `operation-manager/inbox` keep `QaInboxPage`.
- [ ] **Step 6: `Sidebar.tsx`**
  1. `badge?: 'disputes' | 'inbox';` on `SidebarNavItem`.
  2. In `SidebarLinkItem` (after `useDisputesQuery`): `const inboxUnread = useInboxUnreadCount(item.to, item.badge === 'inbox');` and `const badgeCount = item.badge === 'disputes' ? openDisputesCount : item.badge === 'inbox' ? inboxUnread : 0;` then replace the badge JSX with `{badgeCount > 0 && (<Badge size='sm' variant='filled' color={item.badge === 'inbox' ? 'blue' : undefined} circle={badgeCount < 10}>{badgeCount}</Badge>)}` (nominal count in a circle for single digits, pill beyond). Also render the count as a small dot when `collapsed` (`Indicator` around the icon, `disabled={badgeCount === 0}`).
  3. Agent nav: add `badge: 'inbox'` to `role-preview-inbox`.
  4. Supervisor nav: insert after `role-preview-team` → `{ key: 'role-preview-inbox', label: 'sidebar.rolePreview.items.inbox', icon: <IconInbox size={20} className={styles.menuIcon} />, to: '/qa/supervisor/inbox', badge: 'inbox', i18nNamespace: 'qa.inbox' }`.
  5. QA Manager nav: insert after `role-preview-teams` → same with `to: '/qa/qa-manager/inbox'`.
- [ ] **Step 7: Typecheck**; **Step 8: Commit** *(if authorized)* — `feat(qa-inbox): helpers, i18n, routes and sidebar unread counters`

---

## Task 3: Page, category chips, filters, table, bulk bar

**Files:** `ManagerInboxPage.tsx` (+ `.module.css`), `components/InboxCategoryChips.tsx`, `components/InboxFilters/`, `components/InboxTable/`, `components/InboxBulkBar.tsx`

**Page**
| Element | Behaviour |
|---|---|
| Role | `roleFromPath(pathname)` → `{ role, recipientId, basePath }`; context `InboxContext` `{ role, recipientId, basePath, agents (scoped: supervisor → Team 1 only), supervisors }`. |
| Header | `ContentContainer contentWidth='full'` → `Group justify='space-between' align='flex-start'`: left `Title order={1}` `page.title` + `Text c='dimmed'` `page.subtitle.<role>` + `Badge color='blue' variant='filled' size='lg'` `page.unread` (hidden at 0); right `Group`: `Button variant='light' leftSection={<IconChecks/>}` mark all read (disabled at 0; confirm modal), `Button leftSection={<IconPencilPlus/>}` compose (Task 5). |
| Chips | `InboxCategoryChips` props `{ counts, value, onChange }` — Mantine `Chip.Group` (single) of `Chip variant='light' size='sm'` per `['ALL', ...INBOX_CATEGORIES]` with icon + label + count `Badge size='xs' variant='transparent'`; `ScrollArea` horizontal on small screens. |
| Filters | `InboxFilters` inside `SectionCard` (with table). State `filters: ManagerInboxFilters` in the page (`useState`, default `DEFAULT_FILTERS`); category chip writes `filters.category`. |
| Data | `visible = useMemo(filterMessages(messages, role, filters))`; client pagination `useListPageState({ initialPageSize: PAGE_SIZE })` + `PaginationControls`. |
| Selection | `selectedIds: string[]`; `InboxBulkBar` shown when > 0. |
| Detail | `openId` state → `MessageDetailDrawer` (Task 4); opening marks read. `?messageId=` search param also opens (deep link from toasts/other sections). |

**`InboxFilters`** props `{ values; onChange; agents; supervisors; showSupervisor: boolean }` — `FilterContainer`: row 1 `TextInput` search (IconSearch, clear X) full width; row 2 `Group grow`: `SegmentedControl` status (`STATUS_FILTERS`, labels `status.*`), `Select` priority (clearable), `Select` agent (searchable, clearable, options = scoped agents `name · team`), `Select` supervisor (QA manager only, clearable); row 3 `Group grow`: `DateInput` from / to (`@mantine/dates`, clearable), `Button variant='light' leftSection={<IconX/>}` clear (visible only when any filter ≠ default). All `size='sm'`.

**`InboxTable`** props `{ messages; selectedIds; onSelectedChange; onOpen(id); onMarkRead(id); onMarkUnread(id); onToggleStar(id); onArchive(id); onUnarchive(id); onAcknowledge(id) }` — `BaseTable<ManagerInboxMessage>` `enableRowSelection selectedRowIds onSelectedRowIdsChange getRowId onRowClick={(m) => onOpen(m.id)} density='compact' getRowClassName={(row) => row.original.read ? undefined : styles.unreadRow}` (`.unreadRow { background: light-dark(var(--mantine-color-blue-0), var(--mantine-color-dark-6)); font-weight: 600 }`). Columns:
1. state (40px): `ActionIcon variant='subtle'` star (`IconStar`/`IconStarFilled` yellow) + unread dot `IconCircleFilled size={10}` blue when unread (both `stopPropagation`).
2. category: `Badge variant='light' color={meta.color} leftSection={<meta.icon size={12}/>}` label.
3. from: `Group gap='xs'`: `Avatar size='sm' radius='xl' color={sender.role === 'SYSTEM' ? 'gray' : 'blue'}` (initials or `IconRobot` for SYSTEM) + `Stack gap={0}`: `Text size='sm' fw={500}` `sentByMe ? table.you : sender.name`, `Text size='xs' c='dimmed'` `roles.<role>`.
4. subject: `Stack gap={0}`: `Text size='sm'` title (`lineClamp 1`) + `Text size='xs' c='dimmed' lineClamp={1}` message preview; when `replies.length` → `Badge size='xs' variant='outline' leftSection={<IconMessages size={10}/>}` replies count; when `acknowledged` → `Badge size='xs' color='green' variant='light'` acknowledged.
5. about: agent chip `Badge variant='default' leftSection={<Avatar size={14}/>}` `agent.name` + `Text size='xs' c='dimmed'` team (or `—`).
6. priority: `Badge variant='filled' size='sm' color={PRIORITY_COLORS}`.
7. date: dayjs `fromNow()` with `Tooltip` full date (copy the pattern from `AgentInboxTable.tsx:170-176`).
8. actions: `Menu` (`IconDotsVertical`, stopPropagation): View, Mark read/unread, Acknowledge (only alert-like categories and not yet acknowledged), Archive/Unarchive.
`initialSort={[{ id: 'createdAt', desc: true }]}`.

**`InboxBulkBar`** props `{ count; onMarkRead; onArchive; onClear }` — `Paper withBorder p='xs' radius='md'` sticky above the table: `Group justify='space-between'`: `Text size='sm' fw={600}` selected count; `Group gap='xs'`: `Button size='xs' variant='light'` mark read, archive, `Button size='xs' variant='subtle'` clear.

Empty states: no messages for role → `EmptyState icon={<IconInbox size={40}/>}` `empty.title/description`; filters hide all → `empty.noMatches` + clear button.

- [ ] Steps: chips → filters → table (+ css) → bulk bar → page wiring (mark-all-read confirm via `modals.openConfirmModal`, toasts via `notifySuccess`) → typecheck → commit *(if authorized)* `feat(qa-inbox): manager inbox page with category chips, filters, table and bulk actions`

---

## Task 4: Message detail drawer with thread and reply

**Files:** `components/MessageDetailDrawer/MessageDetailDrawer.tsx` (+ `.module.css`), `components/MessageThread.tsx`

**`MessageDetailDrawer`** props `{ message | null; opened; onClose; onMessageAgent(agent: InboxAgentRef) }` — `AppDrawer size='lg' classNames={{ body: classes.body }} icon={<meta.icon size={18}/>} iconColor={meta.color} title={message.title} description={dayjs(createdAt).format('DD MMM YYYY · HH:mm')} headerActions={<Group gap='xs'><ActionIcon variant='subtle' onClick={toggleStar}>{star}</ActionIcon><Menu>…Mark unread / Archive|Unarchive…</Menu></Group>}`.
Body `Stack gap='md'`:
1. Badges row: category, priority, `acknowledged` green badge when set.
2. Meta `SimpleGrid cols={2}` of label/value pairs (`Text size='xs' c='dimmed' tt='uppercase'` + `Text size='sm'`): From (avatar + name + role), About (agent chip → click navigates to `/qa/profiles/agent/${agent.id}`), Received, Rule (`ruleName` as `Anchor` → `triggersLink(basePath)`; hidden when null).
3. Alert-type messages (`metric !== null`): `InlineNotice color={priority === 'CRITICAL' ? 'red' : 'orange'} icon={<IconAlertTriangle size={16}/>} title={t(`categories.${category}`)} description={t('detail.observed', { value: metricValue, threshold })}`.
4. `Paper withBorder p='md' radius='md'` message body (`Text size='sm'` with `white-space: pre-line` class).
5. Links row: one `Button size='xs' variant='light'` per `links` item (`detail.links.<labelKey>`, `navigate(url)`).
6. Thread (`MessageThread`) when `THREADED_CATEGORIES.includes(category)`; otherwise `Text size='xs' c='dimmed'` `detail.noThread`.
7. Sticky footer (`classes.footer`, same pattern as `DisputeDrawer.module.css` body + footer): `Group justify='space-between'`: left `Button variant='subtle' leftSection={<IconArchive/>}` archive/unarchive; right `Group gap='xs'`: `Button variant='light' leftSection={<IconMessage/>}` `detail.messageAgent` (hidden when `agent === null`; calls `onMessageAgent(agent)` → opens compose prefilled, Task 5) and `Button leftSection={<IconCheck/>}` `detail.acknowledge` for alert-like categories (`METRIC_ALERT`, `TREND_WARNING`, `BURNOUT_RISK`, `ESCALATION`) when not acknowledged → `acknowledge(id)` + `notifySuccess`.

**`MessageThread`** props `{ message; meName: string; meRole: 'SUPERVISOR' | 'QA_MANAGER'; onReply(text) }` — `Stack gap='sm'`: `Text fw={600} size='sm'` `detail.thread`; bubbles: the original message first (from sender) then `replies` in order; each bubble `Paper p='sm' radius='md'` aligned right + `classes.mine` (`background: light-dark(var(--mantine-color-blue-0), var(--mantine-color-blue-9))`) when `from.role === meRole`, else left `classes.theirs` (`light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-6))`); inside: `Group gap='xs'`: `Avatar size='xs'` initials + `Text size='xs' fw={600}` name + `Text size='xs' c='dimmed'` `fromNow()`; `Text size='sm'` text. Composer: `Textarea autosize minRows={2} placeholder={t('detail.replyPlaceholder')}` + `Button size='sm' leftSection={<IconSend/>}` send (disabled when empty; Ctrl/Cmd+Enter sends). `onReply` in the page: `addReply(message.id, { id: nextInboxId('RPL'), from: { role, id: recipientId, name: meName }, message, createdAt })`, and mirror into the agent inbox: find the agent notification with the same `threadId` in `useNotificationStore` and `addReply(...)`; if none, `addNotification(toAgentNotification(...))`. `notifySuccess(t('notifications.replied'))`.

Persona names: `meName = role === 'SUPERVISOR' ? 'Maria García' : 'Elena Ruiz'` (constant in `constants.ts`: `ME_BY_ROLE`).

- [ ] Steps: `MessageThread` → drawer (+ css) → page wiring (open marks read via `markRead([id])`; `?messageId` param) → typecheck → commit *(if authorized)* `feat(qa-inbox): message detail drawer with conversation thread`

---

## Task 5: Compose message modal

**Files:** `components/ComposeMessageModal/ComposeMessageModal.tsx` (+ `index.ts`)

Props `{ opened; onClose; agents: InboxAgentRef[]; presetAgentId?: string | null; onSent(message: ManagerInboxMessage) }`. Mantine `Modal size='lg' title={t('compose.title')}`; `useForm<{ agentId: string | null; subject: string; body: string; priority: ManagerInboxPriority; template: QuickTemplate | null }>` (`initialValues` reset on open with `presetAgentId`).
Fields: `Select` to (searchable, options `name · team`, required), `Select` template (clearable; on change → `subject` = `compose.templates.<t>.subject`, `body` = `quickTemplateBody(t, template, firstName)` — only fills when subject/body are empty or the user confirms via `modals.openConfirmModal`), `TextInput` subject, `Textarea` body (autosize minRows 5), `Select` priority (default NORMAL). Footer Cancel / `Button leftSection={<IconSend/>}` send.
On submit: build `ManagerInboxMessage` `{ id: nextInboxId(role === 'SUPERVISOR' ? 'MSG-S' : 'MSG-Q'), recipientRole: role, recipientId, category: 'DIRECT_MESSAGE', priority, title: subject, message: body, sender: { role, id: recipientId, name: meName }, agent, metric: null…, read: true, readAt: now, sentByMe: true, threadId: nextInboxId('THR'), replies: [], links: [], createdAt: now }` → `addMessage`; push `toAgentNotification(message, agent.id, role)` into `useNotificationStore.getState().addNotification`; `notifySuccess(t('notifications.sent', { agent: agent.name }))`; `onSent` → page selects status filter `SENT`? No — keep filters; just close and open the new message in the drawer.
Page wiring: header Compose button → open with no preset; `MessageDetailDrawer.onMessageAgent(agent)` → close drawer, open compose with `presetAgentId`.

- [ ] Steps: modal → wiring → typecheck → commit *(if authorized)* `feat(qa-inbox): compose message to agent`

---

## Task 6: Final audit

- [ ] All `t('…')` keys exist in en + es `qa.inbox.json`; sidebar label key `sidebar.rolePreview.items.inbox` exists (it does).
- [ ] No hex colors / inline styles / `any`.
- [ ] `npm run typecheck` clean for touched files.
- [ ] *(Only if the user asks to run the app)* Manual checklist: Supervisor preview → sidebar shows **Inbox (7)**; QA Manager → **Inbox (9)**; Agent → Inbox with its unread count; opening a message decrements the counter live; category chips filter and show counts; supervisor filter hidden for supervisor, works for QA manager (choose Maria García → only Team 1 messages and her own messages); agent filter; status SENT shows composed threads; reply in a DIRECT_MESSAGE thread appears immediately and the agent inbox (`/qa/agent/inbox`) shows the reply/notification; acknowledge an alert → badge + counter; bulk archive; compose → toast, message under SENT and in agent inbox; deep links open Triggers / Analytics / call / dispute; dark mode; ES locale.

---

## Spec Coverage Check

- ✅ Supervisor and QA Manager receive alerts configured for themselves (metric, trend, burnout, weekly summary, escalation, recognition copies, disputes) — Task 1 mock + categories
- ✅ Direct messages and direct replies from agents — Task 1 (DIRECT_MESSAGE threads), Task 4 (thread + reply)
- ✅ Sidebar counter with nominal unread count in a circle, like Disputes, on the inbox entry (Agent, Supervisor, QA Manager) — Task 2
- ✅ Same structure and message types as the agent inbox (direct message, trend alert, score alert, negative range → `TREND_WARNING` with consecutive-negative content) — Tasks 1, 3
- ✅ Filter by agent; filter by supervisor = messages from people under that supervisor — Task 2 (`filterMessages`), Task 3
- ✅ Compose / reply demonstrably reach the agent inbox — Tasks 4, 5
- ✅ Dark/light, i18n en+es, shared primitives — all tasks

## Execution Choice

1. **Subagent-Driven (recommended for Haiku):** one subagent per task in order 1→6.
2. **Inline execution:** sequential in one session.
