# QA Manager dashboard: disputes summary card

## Context

The QA Manager dashboard (`src/modules/qa/dashboard/pages/NewQAManagerDashboard.tsx`) shows "Open Disputes" as a table: agent, type, status badge and age for every open dispute, plus a count badge and a "Manage →" button. That is case-level detail; a QA Manager wants the general picture: how many disputes are open right now, how many were handled this week, how they were decided, and whether the week is busier than the last one.

The table also reads a local hard-coded list (`ALL_DISPUTES`, 14 rows with their own ids and a "pending" status that does not exist in the dispute model), so its count (8) disagrees with the sidebar badge (7, from the store) and most row clicks land on "not found". The new card reads the real disputes store.

Decisions made with the user (2026-10-19):

- **One card: headline + split bar.** Big number of open disputes with "oldest waiting N days"; below, "Managed this week" with the count and the delta vs last week, and a two-tone bar Accepted · Rejected with the acceptance rate. "Manage →" stays in the header.
- **Week = calendar week, Monday to Sunday.** This week is Monday to today; last week is the previous Monday to Sunday.
- **Adjust the seed** so the demo shows managed disputes this week and last week (today's seed has none this week).
- **Links:** "Manage →" opens the disputes list; the open number opens it pre-filtered to Open. The list page learns to read `?status=` from the URL.

Mode: mockup. Mantine v9, CSS modules, no inline styles, strings in `en` and `es`. No tests, no dev server. Prettier on touched files only. Do not commit unless asked.

Plan copy convention: Task 0 copies this file to `docs/superpowers/plans/2026-10-19-qa-manager-disputes-summary.md`.

---

## Verified facts (do not re-explore)

**Page today** (`NewQAManagerDashboard.tsx`, LF): imports L1-44 (`Badge, Group, Button` from Mantine; `BaseTable, { type BaseTableColumnDef }`; `TODAY` from analytics constants; `useNavigate` is also used by `openConversations`, keep it). Local disputes code to delete: `interface DisputeRow` + `ALL_DISPUTES` L55-162; `DAY_MS`, `disputeAgeDays`, `DISPUTE_STATUS_COLORS`, `disputeColumns` L227-281; `openDisputes` / `openDisputeCount` L306-311; the disputes `SectionCard` L415-444 inside `<SimpleGrid cols={{ base: 1, md: 2 }} spacing='lg'>` next to `<CampaignPerformanceCard entries={ACTIVE_CAMPAIGNS} />`. `ACTIVE_CAMPAIGNS` (L164-225) stays.

**Model** (`src/models/qa/disputeCases.ts`): `DisputeStatus = 'open' | 'accepted' | 'partially-accepted' | 'rejected'`; `DisputeCase` has `id, agentName, status, createdAt, resolvedAt: string | null, resolvedBy, …`. No pending status.

**Store** (`src/stores/qa/disputesStore.ts`): `useDisputesStore`, `selectCases`; `acceptDispute` / `rejectDispute` stamp `resolvedAt = NOW_ISO`, so decisions made in the demo count as "this week".

**Helpers** (`src/modules/qa/disputes/cases/helpers.ts`, **CRLF**): `casesForRole(cases, role: InboxRole)` (QA Manager = all cases), `openCount(cases)`, `daysOpen(dispute)` (dayjs diff in days from `createdAt` to `resolvedAt ?? NOW_ISO`), `acceptanceRate(cases)` (accepted + partially-accepted over resolved, rounded, `null` when none). `STATUS_COLOR` in `disputes/cases/constants.ts`: open blue, accepted green, partially-accepted yellow, rejected red. `InboxRole` type comes from `~/modules/qa/inbox/constants`, which also exports `disputesListPath(role)` (`/qa/qa-manager/disputes`).

**Clock**: `NOW_ISO = '2026-09-12T15:00:00Z'` (`src/modules/qa/team/constants.ts`), `TODAY = '2026-09-12'` (a Saturday). Monday-start weeks: this week = 2026-09-07 … 2026-09-13, last week = 2026-08-31 … 2026-09-06. `dayjs` is already a dependency (no isoWeek plugin configured; compute Monday by hand: `(d.day() + 6) % 7` days back).

**Seed** (`src/modules/qa/disputes/cases/mockData.ts`, **CRLF**): `DISPUTE_CASES_SEED` entries have `createdAt` and optional `resolvedAt` (`resolvedBy` is derived from `resolvedAt`). Resolved entries today, by file order (n = position in the array, 1-based):

| n   | id       | status             | createdAt        | resolvedAt       |
| --- | -------- | ------------------ | ---------------- | ---------------- |
| 3   | DSP-1003 | accepted           | 2026-09-03T11:00 | 2026-09-05T13:45 |
| 4   | DSP-1004 | rejected           | 2026-09-02T10:15 | 2026-09-04T09:00 |
| 6   | DSP-1006 | accepted           | 2026-08-28T08:40 | 2026-08-30T15:10 |
| 8   | DSP-1008 | accepted           | 2026-08-25T09:30 | 2026-08-27T11:20 |
| 9   | DSP-1009 | rejected           | 2026-08-22T15:45 | 2026-08-24T10:00 |
| 10  | DSP-1010 | accepted           | 2026-08-20T13:10 | 2026-08-21T16:30 |
| 12  | DSP-1012 | rejected           | 2026-08-18T11:25 | 2026-08-19T14:00 |
| 14  | DSP-1014 | partially-accepted | 2026-08-15T10:05 | 2026-08-16T12:40 |

Seven cases are open; the oldest open one is DSP-1013 (`createdAt 2026-09-06T17:00`), 6 days.

**List page** (`src/modules/qa/disputes/cases/DisputeCasesPage/DisputeCasesContent.tsx`, **CRLF**): `const [status, setStatus] = useState<StatusFilter>('all')` (L51); status values `'all' | 'open' | 'accepted' | 'partially-accepted' | 'rejected'`; no `useSearchParams` yet. `useSearchParams` from `react-router` is used elsewhere in the QA module (e.g. `src/modules/qa/agent/calls/MyCallsPage.tsx`).

**Template**: `src/modules/qa/dashboard/components/WeekCoachingSessionsCard.tsx` (reads a store, `TODAY` window, own `SectionCard`, `useTranslation('qa.dashboard')`, header `Button` with `IconArrowRight`, navigates with a query param). Split bar pattern: `Progress.Root` + `Progress.Section` in `PlatformBurnoutCard.tsx`. `Dashboard.module.css` has `scoreValue` (1.5rem, 700).

**i18n**: `qa.dashboard.json` (en/es, LF) already has `roleDashboard.attention.disputes.hint` = "Oldest waiting {{days}} days" / "La más antigua espera {{days}} días" (unused today, reuse it) and `roleDashboard.disputes.{age, ageDays}` (used by the table only; leave them). Route `qa.dashboards.qa-manager` loads `['qa.dashboard', 'qa.rankings', 'qa.teamAnalytics']` (`qaNamespaces.ts` L67-71); new strings go under `qa.dashboard`, so nothing changes there.

---

## Direction

```
┌ Disputes ──────────────────────────────────────────── [Manage →] ┐
│ Evaluations contested across the platform                        │
│                                                                  │
│  7  open now                 ← click → disputes list, status=open│
│  Oldest waiting 6 days                                           │
│ ───────────────────────────────────────────────────────────────  │
│  Managed this week                              4   ↗ +1 vs last week
│  ████████████████████████████░░░░░░░░░                           │
│  Accepted 3 · Rejected 1 · 75% acceptance · incl. 1 partial      │
└──────────────────────────────────────────────────────────────────┘
```

With the seed adjusted in Task 1 the card reads: 7 open, oldest 6 days, managed this week 4 (accepted 3 incl. 1 partial, rejected 1), last week 3 (accepted 2, rejected 1), delta +1, acceptance 75%.

---

## Implementation plan

Execute in order; `npm run typecheck` after each task. Files marked CRLF must be edited preserving CRLF (read, replace on LF-normalised text, write back with the original EOL).

### Task 0 — Plan copy

Copy this file to `docs/superpowers/plans/2026-10-19-qa-manager-disputes-summary.md`.

### Task 1 — Seed dates (`src/modules/qa/disputes/cases/mockData.ts`, CRLF)

Only `createdAt` / `resolvedAt` strings change; keep times, ids, statuses and everything else. Each `createdAt` stays before its `resolvedAt`.

| id                            | new createdAt                    | new resolvedAt           | lands in  |
| ----------------------------- | -------------------------------- | ------------------------ | --------- |
| DSP-1003 (accepted)           | unchanged `2026-09-03T11:00:00Z` | `2026-09-08T10:30:00Z`   | this week |
| DSP-1004 (rejected)           | unchanged `2026-09-02T10:15:00Z` | `2026-09-09T09:00:00Z`   | this week |
| DSP-1006 (accepted)           | `2026-09-04T08:40:00Z`           | `2026-09-10T15:10:00Z`   | this week |
| DSP-1014 (partially-accepted) | `2026-09-05T10:05:00Z`           | `2026-09-11T12:40:00Z`   | this week |
| DSP-1008 (accepted)           | `2026-08-31T09:30:00Z`           | `2026-09-02T11:20:00Z`   | last week |
| DSP-1009 (rejected)           | `2026-09-01T15:45:00Z`           | `2026-09-03T10:00:00Z`   | last week |
| DSP-1010 (accepted)           | `2026-09-03T13:10:00Z`           | `2026-09-05T16:30:00Z`   | last week |
| DSP-1012 (rejected)           | unchanged                        | unchanged (`2026-08-19`) | older     |

Locate each entry by its `id: 'DSP-10xx'` line and replace the two date lines that follow within that object (a script with per-id exact `from → to` strings, failing if any `from` is missing or not unique).

### Task 2 — Week summary helper

New file `src/modules/qa/disputes/cases/weekSummary.ts` (LF), pure functions:

```ts
import dayjs from 'dayjs';
import type { DisputeCase } from '~/models/qa/disputeCases';
import { TODAY } from '~/modules/qa/analytics/constants';

/** Monday-to-Sunday week that contains `day`, shifted by `offsetWeeks` (0 = this week, -1 = last week). ISO day strings. */
export const weekBounds = (day: string, offsetWeeks = 0): { from: string; to: string } => {
	const d = dayjs(day);
	const monday = d.subtract((d.day() + 6) % 7, 'day').add(offsetWeeks, 'week');
	return { from: monday.format('YYYY-MM-DD'), to: monday.add(6, 'day').format('YYYY-MM-DD') };
};

export interface DisputesWeekCounts { managed: number; accepted: number; partial: number; rejected: number }

/** Cases decided inside the window, by outcome. Partially accepted counts as accepted (same reading as the disputes KPI row) and is also reported on its own. */
export const resolvedInWindow = (cases: DisputeCase[], from: string, to: string): DisputesWeekCounts
// resolvedAt !== null && resolvedAt.slice(0, 10) between from and to inclusive;
// accepted = status accepted + partially-accepted; partial = partially-accepted; rejected = rejected; managed = accepted + rejected.

export interface DisputesSummary {
	open: number;
	/** Days since the oldest open dispute was raised; null when nothing is open. */
	oldestOpenDays: number | null;
	thisWeek: DisputesWeekCounts;
	lastWeek: DisputesWeekCounts;
	/** managed this week minus managed last week */
	delta: number;
	/** accepted / managed this week, rounded; null when nothing was managed */
	acceptanceRate: number | null;
}

export const buildDisputesSummary = (cases: DisputeCase[], today = TODAY): DisputesSummary
// open = cases with status 'open'; oldestOpenDays = max over open of dayjs(today).diff(createdAt.slice(0,10), 'day');
// thisWeek = resolvedInWindow(cases, ...weekBounds(today, 0)); lastWeek = resolvedInWindow(cases, ...weekBounds(today, -1)).
```

Keep `openCount` from `helpers.ts` for the open number if preferred; do not edit `helpers.ts`.

### Task 3 — `DisputesSummaryCard` (`src/modules/qa/dashboard/components/DisputesSummaryCard.tsx`, export from `index.ts`)

Props: `{ role: InboxRole }`. Reads `useDisputesStore(selectCases)`, scopes with `casesForRole(cases, role)`, builds `summary` with `useMemo(() => buildDisputesSummary(scoped), [scoped])`. Renders its own `SectionCard` (like `WeekCoachingSessionsCard`), `fullHeight`:

- `title={t('roleDashboard.disputesSummary.title')}`, `description={t('roleDashboard.disputesSummary.description')}`, `headerActions={<Button variant='subtle' size='xs' rightSection={<IconArrowRight size={14} />} onClick={() => navigate(disputesListPath(role))}>{t('…manage')}</Button>}`.
- **Headline**: `UnstyledButton` (only when `open > 0`; a plain `div` otherwise) wrapping `Group gap='xs' align='baseline'` with `Text className={styles.scoreValue}` showing `summary.open` and dimmed `Text size='sm'` "open now". Click → `navigate(\`${disputesListPath(role)}?status=open\`)`. Reuse the hover/cursor look of `styles.drillRow`from`Dashboard.module.css`(it already uses`light-dark()`); `title={t('drill.hint')}`for the tooltip. Under it,`Text size='xs' c='dimmed'`: `t('roleDashboard.attention.disputes.hint', { days: oldestOpenDays })`when open > 0, else`t('…noneOpen')`.
- `Divider`.
- **Managed this week** row: `Group justify='space-between'` with `Text size='sm' fw={500}` label and a right `Group gap={6}`: `Text size='sm' fw={600}` `thisWeek.managed`, then a dimmed `Text size='xs'` with an icon (`IconTrendingUp` / `IconTrendingDown` / `IconMinus`, size 14) and `t('…vsLastWeek', { delta: signed })` where `signed` is `+1` / `−2`, or `t('…sameAsLastWeek')` when `delta === 0`. Dimmed in every case (a count, not a judgement).
- **Split bar**: when `managed > 0`, `Progress.Root size='sm'` with two `Progress.Section`s: accepted (`color='green'`, value `accepted / managed * 100`) and rejected (`color='red'`). Colors follow `STATUS_COLOR` of the disputes module so the card matches the list page. Under it a dimmed `Text size='xs'`: "Accepted 3 · Rejected 1 · 75% acceptance" built from `t('…accepted')`, `t('…rejected')`, `t('…acceptance', { rate })`, plus `· ` + `t('…partial', { count })` when `partial > 0`. When `managed === 0`: a single dimmed `Text size='sm'` `t('…noneManaged')`, no bar.

Dark/light: Mantine colour tokens only; no inline styles.

### Task 4 — Copy (`src/locales/{en,es}/qa.dashboard.json`, LF)

Add `roleDashboard.disputesSummary` (new sibling of `roleDashboard.disputes`; insert right after that block):

| key               | en                                        | es                                            |
| ----------------- | ----------------------------------------- | --------------------------------------------- |
| `title`           | Disputes                                  | Disputas                                      |
| `description`     | Evaluations contested across the platform | Evaluaciones impugnadas en toda la plataforma |
| `manage`          | Manage                                    | Gestionar                                     |
| `openNow`         | open now                                  | abiertas ahora                                |
| `noneOpen`        | No open disputes                          | Sin disputas abiertas                         |
| `managedThisWeek` | Managed this week                         | Gestionadas esta semana                       |
| `vsLastWeek`      | {{delta}} vs last week                    | {{delta}} vs la semana pasada                 |
| `sameAsLastWeek`  | Same as last week                         | Igual que la semana pasada                    |
| `accepted`        | Accepted {{count}}                        | Aceptadas {{count}}                           |
| `rejected`        | Rejected {{count}}                        | Rechazadas {{count}}                          |
| `acceptance`      | {{rate}}% acceptance                      | {{rate}} % de aceptación                      |
| `partial_one`     | incl. {{count}} partially accepted        | incl. {{count}} aceptada parcialmente         |
| `partial_other`   | incl. {{count}} partially accepted        | incl. {{count}} aceptadas parcialmente        |
| `noneManaged`     | Nothing managed yet this week             | Nada gestionado todavía esta semana           |

`JSON.parse` both files after the edit.

### Task 5 — Deep link on the list page (`DisputeCasesContent.tsx`, CRLF)

- `import { useSearchParams } from 'react-router';`
- Initialise the status filter from the URL once:
  ```ts
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status');
  const [status, setStatus] = useState<StatusFilter>(
  	isStatusFilter(initialStatus) ? initialStatus : 'all'
  );
  ```
  with a local `const STATUS_FILTERS: StatusFilter[] = ['all', 'open', 'accepted', 'partially-accepted', 'rejected']` and `isStatusFilter = (v: string | null): v is StatusFilter => STATUS_FILTERS.includes(v as StatusFilter)` (reuse the array the SegmentedControl already maps over if one exists in the file; otherwise declare it next to the `StatusFilter` type). No URL syncing afterwards; the control keeps working as today.

### Task 6 — QA Manager page (`NewQAManagerDashboard.tsx`)

- Delete the blocks listed in Verified facts (`DisputeRow`, `ALL_DISPUTES`, `DAY_MS`, `disputeAgeDays`, `DISPUTE_STATUS_COLORS`, `disputeColumns`, `openDisputes`, `openDisputeCount`).
- Replace the disputes `SectionCard` (L415-444) with `<DisputesSummaryCard role='qa-manager' />`; the `SimpleGrid` and `CampaignPerformanceCard` stay.
- Imports: remove `Badge, Group, Button` from the Mantine import (keep `Stack, Title, Text, SimpleGrid`), remove the `BaseTable` import line and the `TODAY` import; add `DisputesSummaryCard` to the `'../components'` import. `useNavigate` stays (used by `openConversations`).
- `grep -n "ALL_DISPUTES\|DisputeRow\|disputeAgeDays\|disputeColumns\|openDisputeCount\|TODAY\|BaseTable\|Badge\b\|Button\b" src/modules/qa/dashboard/pages/NewQAManagerDashboard.tsx` → nothing.

### Task 7 — Checks

- `npm run typecheck` clean.
- `JSON.parse` both locale files; a key script asserting every `roleDashboard.disputesSummary.*` key used by `DisputesSummaryCard` (plus `roleDashboard.attention.disputes.hint`, `drill.hint`) exists in en and es (`partial` resolves through `partial_one` / `partial_other`).
- Seed sanity: a node script that regex-extracts `status`, `createdAt`, `resolvedAt` from `mockData.ts`, applies the Monday-week logic for `2026-09-12` and prints open / this week (managed, accepted, partial, rejected) / last week; expected 7 / 4 (3, 1, 1) / 3 (2, 0, 1); also asserts `createdAt < resolvedAt` for every resolved entry.
- `git ls-files --eol` shows `mockData.ts` and `DisputeCasesContent.tsx` still `w/crlf`.
- `npx prettier --write` on: the card, `index.ts`, `weekSummary.ts`, the QA Manager page, both locale files (skip the two CRLF files, or run prettier and verify the EOL did not change).

---

## Behaviour summary (demo script)

| Where                         | Action                           | Result                                                                                                                                                                                              |
| ----------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| QA Manager dashboard          | Open                             | "Disputes" card: 7 open now · Oldest waiting 6 days · Managed this week 4 ↗ +1 vs last week · bar 3 accepted / 1 rejected · "Accepted 3 · Rejected 1 · 75% acceptance · incl. 1 partially accepted" |
| Card header                   | Manage →                         | Disputes list, all statuses                                                                                                                                                                         |
| Card headline                 | Click "7 open now"               | Disputes list with the Status control on Open                                                                                                                                                       |
| Disputes list                 | Accept one open dispute, go back | 6 open · Managed this week 5 ↗ +2 vs last week · bar updates                                                                                                                                        |
| Sidebar                       | Disputes badge                   | Same 7 (and 6 after the decision), both read the store                                                                                                                                              |
| Supervisor / Agent dashboards | Open                             | Unchanged (no disputes card there)                                                                                                                                                                  |

## Verification

No dev server and no tests. `npm run typecheck`, the JSON parse, the key script and the seed sanity script in Task 7. Visual check by the user in their dev server at `/qa/dashboards/qa-manager`, light and dark; then the deep link from the headline and the "Manage →" button.

## Out of scope

- A disputes card on the Supervisor dashboard (the component takes `role`, so adding `<DisputesSummaryCard role='supervisor' />` later is a one-liner).
- Syncing the list page's filters back into the URL.
- Removing the legacy `DisputesStats` component and the legacy dashboard pages that still use the old "approved" naming.
