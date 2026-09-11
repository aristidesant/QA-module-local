# Manager Rankings (Supervisor / QA Manager) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Execute tasks **in order**; every task compiles on its own.

**Goal:** Let Supervisors and QA Managers **create and run rankings** for their teams: pick the evaluation method the ranking is scored on (Sentiment & Emotion, QA, Compliance, Business Insights or a weighted composite), set a start and an end date, attach the badges agents can earn during the ranking (from the shared badge catalog) and a winner badge, watch live standings, and let the period close with the #1 agent as the winner. The agent-side Team Rankings page reads the active ranking so both roles look at the same competition.

**Architecture:** New module `src/modules/qa/rankings/` (manager side) at `/qa/supervisor/rankings` and `/qa/qa-manager/rankings`, one model file `src/models/qa/rankingPrograms.ts`, one Zustand store `src/stores/qa/rankingProgramsStore.ts` seeded from `src/modules/qa/rankings/mockData.ts`. Badges come from the Triggers plan catalog (`useTriggerRulesStore.badges`, `BadgeEditorDrawer`) — the 10 seeded badges there already cover the user's requested set (QA Master, Compliance Master, Sentiment & Emotion Master, Mood Booster for angry→happy recoveries, Objection Handler, Zero Critical Errors, Consistency Streak, Rising Star, Perfect Week, Security Sentinel). The agent page's `useLeaderboardMetadata` switches from the hardcoded `currentLeaderboard` to the active Team-1 program. i18n extends the `qa.rankings` namespace created by the drawer-refinement plan.

**Tech Stack:** React 19, React Router v7, Mantine v9.2 (`core`, `dates`, `form`, `modals`), Zustand v5, react-i18next.

**Spec (user):** Rankings let the supervisor and QA manager create rankings for their teams based on any evaluation method they choose (e.g. Sentiment & Emotion of the customer). They set a start date (when calls start counting) and an end date, so there is a winner when it ends (the #1 at that date). Rankings can define badges based on actions (e.g. 3 consecutive very positive calls → Sentiment & Emotion Master; 10+ calls at 100% compliance → Compliance Master). Provide 8–10 sample badges across everything evaluated: QA, Compliance, objection management, sentiment/emotion booster (angry customer turned happy).

**Dependencies (execute first):** *Triggers & Auto-driven Recognition* (badge catalog + `BadgeEditorDrawer` + `triggerRulesStore`), *Agent Rankings Drawer Refinement* (`qa.rankings` namespace, reactive `useLeaderboardMetadata`). Optional: *Team Analytics* roster names (this plan carries its own copy of the roster).

---

## Global Constraints

- **Design-session rules (DESIGN_ROLE.md):** mock only; no `npm run dev`, tests or `git commit` unless the user explicitly asks in the execution session. `npm run typecheck` after each task.
- Mantine v9, CSS Modules, tokens/`light-dark()`, dark & light mode, no inline styles.
- Reuse: `SectionCard`, `AppDrawer`, `BaseTable`, `EmptyState`, `FilterContainer`, `StatCard`, `InlineNotice`, `ContentContainer`, `AppSegmentedControl`, `PaginationControls`; from Triggers: `BadgeEditorDrawer`, `ConditionSummaryList`; from agent rankings: `LeaderboardHeader`, `WinnerBadge`.
- Strings via `useTranslation('qa.rankings')` under a new `manager.*` block (en + es).
- Do not modify `src/modules/qa/dashboard/mockData.ts`, the legacy config panels (`SupervisorRankingsConfigPanel`, `RankingsConfigPanel`) or `leaderboardConfigurations*` API files.
- TypeScript strict, no `any`, tabs, `~/` imports.

---

## Roster (shared)

Team 1 / Maria García (`SUP-001`): AGT-001 Sarah Johnson, AGT-002 Mike Chen, AGT-003 Jessica Martinez, AGT-004 John Smith, AGT-005 Emma Davis, AGT-006 David Brown, AGT-007 Lisa Wong · Team 2 / Juan Pérez (`SUP-002`): AGT-008 Sofia Rodríguez, AGT-009 Miguel Fernández, AGT-010 Carlos Vega, AGT-011 Lucía Torres, AGT-012 Diego Ramírez, AGT-013 Valentina Cruz, AGT-014 Andrés Mora · Team 3 / Laura Gómez (`SUP-003`): AGT-015 Camila Herrera, AGT-016 Javier Ortiz, AGT-017 Nina Patel, AGT-018 Paula Castillo, AGT-019 Tomás Ríos, AGT-020 Isabel Navarro, AGT-021 Bruno Salas. QA Manager Elena Ruiz (`QAM-001`).

---

## File Structure

### New files
```
src/models/qa/rankingPrograms.ts
src/stores/qa/rankingProgramsStore.ts
src/modules/qa/rankings/
  constants.ts                                  — metric sources, status meta, scope meta
  mockData.ts                                   — roster, 5 programs with standings, activity
  helpers.ts                                    — status derivation, progress %, standings builder, program ↔ LeaderboardMetadata
  ManagerRankingsPage/ManagerRankingsPage.tsx (+ .module.css, index.ts)
  components/RankingsKpiStrip.tsx
  components/RankingsFilters.tsx
  components/RankingProgramCard/RankingProgramCard.tsx (+ .module.css, index.ts)
  components/RankingDetailDrawer/RankingDetailDrawer.tsx (+ .module.css, index.ts)   — manager detail (standings, badges, settings, activity)
  components/RankingDetailDrawer/StandingsTable.tsx
  components/RankingDetailDrawer/ProgramBadgesTab.tsx
  components/RankingDetailDrawer/ProgramSettingsTab.tsx
  components/RankingDetailDrawer/ProgramActivityTab.tsx
  components/RankingEditorDrawer/RankingEditorDrawer.tsx (+ .module.css, index.ts)
  components/RankingEditorDrawer/RankingEditorDrawer.types.ts
  components/RankingEditorDrawer/sections/BasicsSection.tsx
  components/RankingEditorDrawer/sections/MetricSection.tsx
  components/RankingEditorDrawer/sections/PeriodSection.tsx
  components/RankingEditorDrawer/sections/BadgesSection.tsx
  components/RankingEditorDrawer/sections/VisibilitySection.tsx
  components/RankingEditorDrawer/ProjectedStandings.tsx
```

### Modified files
- `src/models/qa/index.ts` — `export * from './rankingPrograms';`
- `src/stores/qa/triggerRulesStore.ts` — add `awardBadge(badgeId, holder)` (if missing)
- `src/routes.tsx` — 2 routes + legacy redirect `qamanager/rankings` → `/qa/qa-manager/rankings`
- `src/modules/qa/qaNamespaces.ts` — 2 ids → `'qa.rankings'`
- `src/components/Sidebar/Sidebar.tsx` — supervisor `role-preview-team-rankings-config` → `/qa/supervisor/rankings` (label `sidebar.rolePreview.items.rankings`); add qaManager `role-preview-rankings` → `/qa/qa-manager/rankings`
- `src/locales/{en,es}/qa.rankings.json` — `manager.*` block
- `src/modules/qa/agent/rankings/hooks/useLeaderboardMetadata.ts` — read the active program from the store; support `?programId=`
- `src/modules/qa/dashboard/pages/NewQAManagerDashboard.tsx` — `onViewAll` → `/qa/qa-manager/rankings` (path typo fix)

### Reference files (read-only)
- `src/modules/qa/agent/rankings/types/leaderboard.ts` (`LeaderboardMetadata`), `components/LeaderboardHeader.tsx`, `hooks/useLeaderboardMetadata.ts`
- `src/modules/qa/triggers/components/BadgeEditorDrawer`, `ConditionSummaryList`, `src/stores/qa/triggerRulesStore.ts`, `src/models/qa/triggerRules.ts` (`BadgeDefinition`)
- `src/modules/qa/triggers/components/RuleEditorDrawer` — sectioned drawer + sticky footer pattern
- `src/modules/qa/operationmanager/configuration/SupervisorRankingsConfigPanel.tsx` — legacy form fields for reference only

---

## Task 1: Model, constants, mock data, store

**Files:** `src/models/qa/rankingPrograms.ts`, `index.ts`, `constants.ts`, `mockData.ts`, `src/stores/qa/rankingProgramsStore.ts`, `triggerRulesStore.ts`

- [ ] **Step 1: `src/models/qa/rankingPrograms.ts`** (paste)

```typescript
export type RankingScope = 'TEAM' | 'ALL_TEAMS' | 'SUPERVISORS';
export type RankingStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
export type RankingMetricSource =
	| 'CUSTOMER_SENTIMENT'      // Sentiment & Emotion of the customer (1-5 → 0-100)
	| 'AGENT_SENTIMENT'
	| 'SENTIMENT_RECOVERY'      // % of negative-start calls turned positive
	| 'QA_SCORE'
	| 'COMPLIANCE_SCORE'
	| 'OBJECTION_HANDLING'      // 100 - unhandled objection rate
	| 'CONVERSION_RATE'
	| 'AUTO_FAILS';             // inverted count
export type RankingMetricArea = 'SENTIMENT_EMOTION' | 'QUALITY_ASSURANCE' | 'COMPLIANCE' | 'BUSINESS_INSIGHTS';
export type RankingVisibility = 'AGENTS_AND_MANAGERS' | 'MANAGERS_ONLY';

export interface RankingMetricWeight { source: RankingMetricSource; weight: number /* 0-100, weights sum to 100 */ }

export interface RankingStanding {
	rank: number;
	agentId: string;
	agentName: string;
	team: string;
	supervisorName: string;
	score: number;               // 0-100
	previousRank: number | null;
	streakWeeks: number;
	callsCounted: number;
	badgeIds: string[];          // badges earned during this ranking
	reactions: number;
}

export type RankingActivityKind = 'CREATED' | 'STARTED' | 'BADGE_EARNED' | 'LEAD_CHANGE' | 'COMPLETED' | 'EDITED';
export interface RankingActivity { id: string; kind: RankingActivityKind; at: string; agentId: string | null; agentName: string | null; badgeId: string | null; note: string }

export interface RankingProgram {
	id: string;
	name: string;
	description: string;
	scope: RankingScope;
	supervisorIds: string[];     // TEAM → ['SUP-001']; ALL_TEAMS → []; SUPERVISORS → ranks supervisors themselves
	campaignIds: string[];       // empty = all campaigns
	metrics: RankingMetricWeight[];
	minCalls: number;            // calls an agent needs before appearing in standings
	startDate: string;           // ISO date
	endDate: string;
	status: RankingStatus;
	badgeIds: string[];          // earnable during the ranking (from the shared badge catalog)
	winnerBadgeId: string | null;
	prizeNote: string;
	visibility: RankingVisibility;
	showScoresToAgents: boolean;
	reactionsEnabled: boolean;
	winnerId: string | null;
	standings: RankingStanding[];
	activity: RankingActivity[];
	createdBy: string;
	createdByRole: 'SUPERVISOR' | 'QA_MANAGER';
	createdAt: string;
	updatedAt: string;
}
```

- [ ] **Step 2: `constants.ts`**

```typescript
export const METRIC_SOURCES: { id: RankingMetricSource; area: RankingMetricArea }[] = [
	{ id: 'CUSTOMER_SENTIMENT', area: 'SENTIMENT_EMOTION' }, { id: 'AGENT_SENTIMENT', area: 'SENTIMENT_EMOTION' }, { id: 'SENTIMENT_RECOVERY', area: 'SENTIMENT_EMOTION' },
	{ id: 'QA_SCORE', area: 'QUALITY_ASSURANCE' }, { id: 'AUTO_FAILS', area: 'QUALITY_ASSURANCE' },
	{ id: 'COMPLIANCE_SCORE', area: 'COMPLIANCE' },
	{ id: 'OBJECTION_HANDLING', area: 'BUSINESS_INSIGHTS' }, { id: 'CONVERSION_RATE', area: 'BUSINESS_INSIGHTS' },
];
export const AREA_COLORS: Record<RankingMetricArea, string> = { SENTIMENT_EMOTION: 'teal', QUALITY_ASSURANCE: 'cyan', COMPLIANCE: 'grape', BUSINESS_INSIGHTS: 'indigo' };
export const STATUS_META: Record<RankingStatus, { color: string; order: number }> = {
	ACTIVE: { color: 'green', order: 0 }, SCHEDULED: { color: 'blue', order: 1 }, DRAFT: { color: 'gray', order: 2 }, COMPLETED: { color: 'yellow', order: 3 }, ARCHIVED: { color: 'gray', order: 4 },
};
export const SCOPES: RankingScope[] = ['TEAM', 'ALL_TEAMS', 'SUPERVISORS'];
export const VIEW_PARAM = 'status';
export const TODAY = '2026-09-10';
```

- [ ] **Step 3: `mockData.ts`** — `RANKING_SUPERVISORS`, `RANKING_AGENTS` (21, `{ id, name, team, supervisorId, supervisorName, baseScores: Record<RankingMetricSource, number> }` with the strong/weak profiles used elsewhere: Sarah Johnson/Mike Chen/Camila Herrera high; David Brown/Lisa Wong low; Lucía Torres top SENTIMENT_RECOVERY; Valentina Cruz COMPLIANCE 100; Tomás Ríos top CONVERSION), `buildStandings(program, agents, seed)` (score = Σ weight·baseScore/100 ± jitter, sorted, ranks, `previousRank` = rank ± small, `streakWeeks`, `callsCounted` 18–60, `badgeIds` sampled from `program.badgeIds` for the top third, reactions), and **5 programs**:

| id | name | scope / supervisors | metrics | period | status | badges | winner |
|---|---|---|---|---|---|---|---|
| RNK-001 | September Sentiment & Emotion | TEAM / SUP-001 | CUSTOMER_SENTIMENT 70 · SENTIMENT_RECOVERY 30 | 2026-09-01 → 2026-09-30 | ACTIVE | BDG-003, BDG-004, BDG-007; winner BDG-003 | null |
| RNK-002 | Q3 Quality Cup — all teams | ALL_TEAMS / [] | QA_SCORE 50 · COMPLIANCE_SCORE 30 · OBJECTION_HANDLING 20 | 2026-08-15 → 2026-10-15 | ACTIVE | BDG-001, BDG-002, BDG-005, BDG-006; winner BDG-001 | null |
| RNK-003 | Q4 Compliance Masters | TEAM / SUP-001 | COMPLIANCE_SCORE 100 | 2026-10-01 → 2026-12-15 | SCHEDULED | BDG-002, BDG-010; winner BDG-002 | null |
| RNK-004 | August QA Excellence | TEAM / SUP-001 | QA_SCORE 100 | 2026-08-01 → 2026-08-31 | COMPLETED | BDG-001, BDG-009, BDG-006; winner BDG-001 | AGT-002 Mike Chen |
| RNK-005 | July Objection Handling Sprint | ALL_TEAMS / [] | OBJECTION_HANDLING 60 · CONVERSION_RATE 40 | 2026-07-01 → 2026-07-31 | COMPLETED | BDG-005, BDG-008 | AGT-019 Tomás Ríos |

Each program gets `activity` (CREATED, STARTED, 2–3 BADGE_EARNED, LEAD_CHANGE; COMPLETED for the finished ones), `createdBy` Maria García (TEAM) / Elena Ruiz (ALL_TEAMS), `prizeNote` (e.g. "Winner gets the Sentiment & Emotion Master badge and a team shout-out"), `visibility 'AGENTS_AND_MANAGERS'`, `showScoresToAgents true`, `reactionsEnabled true`, `minCalls 10`.

- [ ] **Step 4: `src/stores/qa/rankingProgramsStore.ts`** — `{ programs; addProgram; updateProgram; deleteProgram; duplicateProgram(id) → copy as DRAFT named "(copy)"; setStatus(id, status); completeProgram(id) → status COMPLETED, winnerId = standings[0].agentId, push COMPLETED activity, and if `winnerBadgeId` call `useTriggerRulesStore.getState().awardBadge(winnerBadgeId, { agentId, agentName, team, earnedAt })`; activeProgramFor(supervisorId | null) → first ACTIVE program with scope TEAM & that supervisor, else first ACTIVE ALL_TEAMS }`. `nextProgramId()` helper `RNK-0xx`.
- [ ] **Step 5: `triggerRulesStore.ts`** — add `awardBadge: (badgeId: string, holder: BadgeHolder) => void` appending the holder if not already present (guard: only if the action does not exist).
- [ ] **Step 6: Typecheck**; **Step 7: Commit** *(if authorized)* — `feat(qa-rankings): ranking programs model, mock programs and store`

---

## Task 2: Helpers, i18n, routes, sidebar, placeholder page

- [ ] **Step 1: `helpers.ts`**

```typescript
export function deriveStatus(p: RankingProgram, today = TODAY): RankingStatus   // DRAFT/ARCHIVED/COMPLETED stay; else SCHEDULED if start > today, ACTIVE if start <= today <= end, COMPLETED if end < today
export function progressPct(p: RankingProgram, today = TODAY): number
export function daysRemaining(p: RankingProgram, today = TODAY): number
export function metricSummary(t: TFunction, p: RankingProgram): string       // "Customer sentiment 70% · Sentiment recovery 30%" or single label
export function primaryArea(p: RankingProgram): RankingMetricArea
export function toLeaderboardMetadata(p: RankingProgram, t: TFunction): LeaderboardMetadata   // { id, name, description, startDate: `${start}T00:00:00Z`, endDate: `${end}T23:59:59Z`, scoreType: metricSummary, winnerId, createdBy, status: 'active' | 'completed' }
export function roleFromPath(pathname): { role: 'supervisor' | 'qaManager'; basePath; supervisorId: string | null; me: { name; role } }
export function filterPrograms(programs, role, supervisorId, status: RankingStatus | 'ALL', search): RankingProgram[]   // supervisor sees TEAM programs of SUP-001 + ALL_TEAMS programs (read-only badge); QA manager sees all
export function canEdit(p, role): boolean   // supervisor can edit own TEAM programs; QA manager edits everything
```

- [ ] **Step 2: i18n** — add to `qa.rankings.json` (en; es mirrors) a `manager` block:

```json
"manager": {
	"page": { "title": "Rankings", "subtitle": { "supervisor": "Create and run rankings for Team 1", "qaManager": "Create and run rankings across all teams" }, "new": "New ranking" },
	"kpis": { "active": "Active", "scheduled": "Scheduled", "completed": "Completed", "badgesAwarded": "Badges awarded" },
	"status": { "ALL": "All", "DRAFT": "Draft", "SCHEDULED": "Scheduled", "ACTIVE": "Active", "COMPLETED": "Completed", "ARCHIVED": "Archived" },
	"scope": { "TEAM": "My team", "ALL_TEAMS": "All teams", "SUPERVISORS": "Supervisors" },
	"areas": { "SENTIMENT_EMOTION": "Sentiment & Emotion", "QUALITY_ASSURANCE": "Quality Assurance", "COMPLIANCE": "Compliance", "BUSINESS_INSIGHTS": "Business Insights" },
	"metrics": { "CUSTOMER_SENTIMENT": "Customer sentiment", "AGENT_SENTIMENT": "Agent sentiment", "SENTIMENT_RECOVERY": "Sentiment recovery", "QA_SCORE": "QA score", "AUTO_FAILS": "Auto-fails (fewer is better)", "COMPLIANCE_SCORE": "Compliance score", "OBJECTION_HANDLING": "Objection handling", "CONVERSION_RATE": "Conversion rate" },
	"filters": { "search": "Search rankings...", "clear": "Clear" },
	"card": { "daysLeft_one": "{{count}} day left", "daysLeft_other": "{{count}} days left", "startsIn_one": "Starts in {{count}} day", "startsIn_other": "Starts in {{count}} days", "ended": "Ended {{date}}", "leader": "Leader", "winner": "Winner", "participants_one": "{{count}} agent", "participants_other": "{{count}} agents", "badges_one": "{{count}} badge", "badges_other": "{{count}} badges", "readOnly": "Managed by QA Manager" },
	"actions": { "view": "View", "edit": "Edit", "duplicate": "Duplicate", "start": "Start now", "endNow": "End now & pick winner", "archive": "Archive", "restore": "Restore", "delete": "Delete", "previewAsAgent": "Preview as agent" },
	"confirm": { "endTitle": "End ranking now?", "endMessage": "{{leader}} is currently #1 and will be declared the winner. Agents will be notified.", "deleteTitle": "Delete ranking", "deleteMessage": "\"{{name}}\" and its standings will be removed.", "confirm": "Confirm", "cancel": "Cancel" },
	"notifications": { "created": "Ranking created", "updated": "Ranking updated", "started": "Ranking started", "completed": "Ranking ended — {{winner}} is the winner", "duplicated": "Ranking duplicated as draft", "archived": "Ranking archived", "deleted": "Ranking deleted" },
	"empty": { "title": "No rankings yet", "description": "Create a ranking to motivate your team around a metric and a deadline.", "noMatches": "No rankings match the current filters" },
	"detail": {
		"tabs": { "standings": "Standings", "badges": "Badges", "settings": "Settings", "activity": "Activity" },
		"columns": { "rank": "Rank", "agent": "Agent", "score": "Score", "movement": "Movement", "streak": "Streak", "calls": "Calls", "badges": "Badges", "reactions": "Reactions" },
		"belowMin": "Below minimum calls ({{min}})",
		"badgesDescription": "Badges agents can earn while this ranking runs, and who earned them",
		"winnerBadge": "Winner badge", "noWinnerBadge": "No winner badge", "earnedBy_one": "Earned by {{count}} agent", "earnedBy_other": "Earned by {{count}} agents", "notEarned": "Not earned yet",
		"settings": { "scope": "Scope", "campaigns": "Campaigns", "allCampaigns": "All campaigns", "metric": "Scored on", "period": "Period", "minCalls": "Minimum calls", "visibility": "Visibility", "showScores": "Scores visible to agents", "reactions": "Peer reactions", "prize": "Prize", "createdBy": "Created by" },
		"visibility": { "AGENTS_AND_MANAGERS": "Agents and managers", "MANAGERS_ONLY": "Managers only" },
		"activityKinds": { "CREATED": "Ranking created", "STARTED": "Ranking started", "BADGE_EARNED": "{{agent}} earned {{badge}}", "LEAD_CHANGE": "{{agent}} took the lead", "COMPLETED": "Ranking ended — winner {{agent}}", "EDITED": "Settings updated" },
		"activityEmpty": "No activity yet"
	},
	"editor": {
		"createTitle": "New ranking", "editTitle": "Edit ranking",
		"sections": { "basics": "Basics", "metric": "Evaluation method", "metricDescription": "Choose what the ranking is scored on. Combine several metrics with weights that add up to 100%.", "period": "Period", "periodDescription": "Only calls evaluated between these dates count.", "badges": "Badges", "badgesDescription": "Pick badges agents can earn during the ranking and the badge the winner receives.", "visibility": "Visibility & engagement" },
		"fields": { "name": "Name", "namePlaceholder": "e.g. September Sentiment & Emotion", "description": "Description", "scope": "Scope", "supervisors": "Teams", "campaigns": "Campaigns", "campaignsPlaceholder": "All campaigns", "mode": "Scoring", "single": "Single metric", "composite": "Composite (weighted)", "metric": "Metric", "weight": "Weight", "addMetric": "Add metric", "minCalls": "Minimum calls to be ranked", "startDate": "Start date", "endDate": "End date", "badges": "Earnable badges", "badgesPlaceholder": "Choose badges...", "createBadge": "Create badge", "winnerBadge": "Winner badge", "winnerBadgePlaceholder": "No winner badge", "prize": "Prize / shout-out note", "visibility": "Who can see it", "showScores": "Show scores to agents", "reactions": "Enable peer reactions" },
		"weightsTotal": "Total {{total}}%", "weightsInvalid": "Weights must add up to 100%",
		"validation": { "nameRequired": "Name is required", "metricRequired": "Choose at least one metric", "datesRequired": "Start and end dates are required", "endAfterStart": "End date must be after the start date" },
		"projected": { "title": "Projected standings", "description": "Based on the last 30 days of evaluated calls", "empty": "No agents in scope" },
		"footer": { "cancel": "Cancel", "saveDraft": "Save as draft", "schedule": "Schedule", "startNow": "Start now", "save": "Save changes" }
	}
}
```

- [ ] **Step 3:** `qaNamespaces.ts` → `'qa.supervisor.rankings': 'qa.rankings', 'qa.qa-manager.rankings': 'qa.rankings'`. Placeholder `ManagerRankingsPage` + `index.ts`.
- [ ] **Step 4: `routes.tsx`** — `const QaManagerRankingsPage = React.lazy(() => import('./modules/qa/rankings/ManagerRankingsPage'));` routes `supervisor/rankings` (`qa.supervisor.rankings`) and `qa-manager/rankings` (`qa.qa-manager.rankings`); add `{ path: 'qamanager/rankings', element: <Navigate to='/qa/qa-manager/rankings' replace /> }` (the QA Manager dashboard already links there); in `NewQAManagerDashboard.tsx` change `onViewAll` to `/qa/qa-manager/rankings`.
- [ ] **Step 5: `Sidebar.tsx`** — supervisor entry `role-preview-team-rankings-config`: `label: 'sidebar.rolePreview.items.rankings'`, `to: '/qa/supervisor/rankings'`, `i18nNamespace: 'qa.rankings'`; qaManager: insert `{ key: 'role-preview-rankings', label: 'sidebar.rolePreview.items.rankings', icon: <IconTrendingUp size={20} className={styles.menuIcon} />, to: '/qa/qa-manager/rankings', i18nNamespace: 'qa.rankings' }` after `role-preview-teams`.
- [ ] **Step 6: Typecheck**; **Step 7: Commit** *(if authorized)* — `feat(qa-rankings): manager rankings routes, navigation and i18n`

---

## Task 3: Page — KPI strip, filters, program cards

**Files:** `ManagerRankingsPage.tsx` (+ `.module.css`), `RankingsKpiStrip.tsx`, `RankingsFilters.tsx`, `RankingProgramCard/`

| Element | Behaviour |
|---|---|
| Header | `ContentContainer contentWidth='full' title={t('manager.page.title')} description={t('manager.page.subtitle.<role>')}`; right `Button leftSection={<IconPlus/>}` new → editor (Task 5). |
| KPI strip | 4 `StatCard`: active count, scheduled count, completed count, badges awarded (sum of `standings[].badgeIds.length` across programs) — icons `IconTrophy`, `IconCalendarEvent`, `IconFlagCheckered`, `IconAward`. |
| Filters | `AppSegmentedControl` status (`ALL · ACTIVE · SCHEDULED · DRAFT · COMPLETED · ARCHIVED`, bound to `?status=`) + `TextInput` search. |
| Grid | `SimpleGrid cols={{ base: 1, md: 2, xl: 3 }}` of `RankingProgramCard`, sorted by `STATUS_META.order` then `startDate` desc. Empty states per rules. |

**`RankingProgramCard`** props `{ program; badges: BadgeDefinition[]; editable: boolean; onOpen; onEdit; onDuplicate; onStart; onEnd; onArchive; onRestore; onDelete; onPreviewAsAgent }` — `Paper withBorder p='md' radius='md'` (`.card` hover, click → `onOpen`):
- Top: `Group justify='space-between' align='flex-start'`: `Stack gap={2}`: `Text fw={600}` name, `Text size='xs' c='dimmed' lineClamp={2}` description; `Group gap={4}`: `Badge variant='filled' color={STATUS_META[status].color}` status, `Badge variant='outline'` scope; `Menu` (stopPropagation) with role-aware items (`editable` false → only View / Preview as agent; ACTIVE → Edit, Duplicate, End now, Archive; SCHEDULED/DRAFT → Edit, Duplicate, Start now, Delete; COMPLETED → Duplicate, Archive; ARCHIVED → Restore, Delete).
- Metrics row: `Group gap={4}` of `Badge size='xs' variant='light' color={AREA_COLORS[area]}` per metric with weight (`Customer sentiment · 70%`).
- Period: `Group justify='space-between'`: `Text size='xs' c='dimmed'` `start – end` and `Text size='xs' fw={600}` days left / starts in / ended; `Progress size='xs' value={progressPct} color={status === 'COMPLETED' ? 'yellow' : 'blue'}`.
- Footer: `Group justify='space-between'`: leader/winner — `Avatar.Group` top 3 standings avatars + `Text size='xs'` `{{leader}} · {{score}} pts` (`card.leader` or `card.winner` with `WinnerBadge` when COMPLETED); right `Group gap='xs'`: badge emojis of `badgeIds` (up to 4, `Tooltip` names) + `Text size='xs' c='dimmed'` participants count. When not editable show `Badge size='xs' variant='dot'` `card.readOnly`.

Actions in the page: start → `setStatus(ACTIVE)` + STARTED activity + toast; end → `modals.openConfirmModal` (`confirm.endMessage` with the leader) → `completeProgram(id)` + toast `notifications.completed`; archive/restore/delete (confirm) ; duplicate → editor opens on the copy; preview as agent → `navigate(`/qa/agent/rankings?programId=${id}`)`.

- [ ] Steps: KPI strip → filters → card (+ css) → page → typecheck → commit *(if authorized)* `feat(qa-rankings): manager rankings page with program cards and lifecycle actions`

---

## Task 4: Manager detail drawer — standings, badges, settings, activity

**Files:** `RankingDetailDrawer/RankingDetailDrawer.tsx` (+ `.module.css`, `index.ts`), `StandingsTable.tsx`, `ProgramBadgesTab.tsx`, `ProgramSettingsTab.tsx`, `ProgramActivityTab.tsx`

`AppDrawer size='xl' title={program.name} description={metricSummary} headerActions={<Group gap='xs'>{editable && <Button size='xs' leftSection={<IconEdit/>}>edit</Button>}<Button size='xs' variant='light' leftSection={<IconEye/>}>previewAsAgent</Button></Group>}`. Body: `LeaderboardHeader metadata={toLeaderboardMetadata(program, t)} daysRemaining winnerName` (reused from the agent module) → `Tabs defaultValue='standings'`:
- **Standings** → `StandingsTable rows={program.standings} minCalls badges` — `BaseTable<RankingStanding>` `density='compact'` `initialSort rank asc`: rank (`Badge` gold/silver/bronze for 1–3, default otherwise + `WinnerBadge` when COMPLETED and rank 1), agent (Avatar + name + team/supervisor for ALL_TEAMS), score (`Text fw={700}` + `Progress size='xs' w={60}`), movement (`previousRank` diff → `IconTrendingUp/Down/Minus` green/red/gray + label), streak (`{{n}} wk`), calls (`Text`; when `< minCalls` show `Badge color='gray' variant='light'` `detail.belowMin` and dim the row), badges (emoji chips from `badgeIds`), reactions. Row click → `navigate(`/qa/profiles/agent/${agentId}`)`.
- **Badges** → `ProgramBadgesTab` — `Text size='sm' c='dimmed'` description; winner badge card (`Paper` with emoji, name, tier, `detail.winnerBadge`) or `detail.noWinnerBadge`; `SimpleGrid cols={{ base: 1, sm: 2 }}` of earnable badge cards: emoji `ThemeIcon`, name, tier badge, `ConditionSummaryList conditions logic` (from Triggers), `Text size='xs'` earned-by count within this ranking (standings whose `badgeIds` include it) + avatars.
- **Settings** → `ProgramSettingsTab` — `SimpleGrid cols={2}` of label/value rows (scope, teams, campaigns, scored on (metric chips), period, min calls, visibility, show scores, reactions, prize, created by).
- **Activity** → `ProgramActivityTab` — Mantine `Timeline` from `program.activity` newest first (icons per kind: `IconPlus`, `IconPlayerPlay`, `IconAward`, `IconArrowsExchange`, `IconTrophy`, `IconEdit`), text from `detail.activityKinds.*` with badge names resolved from the catalog.

- [ ] Steps: standings → badges → settings → activity → drawer + page wiring (card click / View) → typecheck → commit *(if authorized)* `feat(qa-rankings): ranking detail drawer with standings, badges, settings and activity`

---

## Task 5: Ranking editor drawer (create / edit / duplicate)

**Files:** `RankingEditorDrawer/` (drawer, types, five sections, `ProjectedStandings.tsx`)

**Form values** (`RankingEditorDrawer.types.ts`): `{ name; description; scope; supervisorIds; campaignIds; mode: 'SINGLE' | 'COMPOSITE'; metrics: RankingMetricWeight[]; minCalls; startDate: Date | null; endDate: Date | null; badgeIds; winnerBadgeId; prizeNote; visibility; showScoresToAgents; reactionsEnabled }`. Helpers in `helpers.ts`: `buildFormValues(existing | null, role)` (defaults: scope TEAM for supervisor (`supervisorIds ['SUP-001']`) / ALL_TEAMS for QA manager, `mode 'SINGLE'`, metrics `[{ CUSTOMER_SENTIMENT, 100 }]`, minCalls 10, start = today, end = today + 30, visibility AGENTS_AND_MANAGERS, showScores true, reactions true) and `formValuesToProgram(values, existing, me)` (status = caller decides; `standings = buildStandings(program, RANKING_AGENTS, seed)` recomputed on create/edit; activity CREATED/EDITED appended).

`RankingEditorDrawer` props `{ opened; mode: 'create' | 'edit'; program: RankingProgram | null; onClose; onSaved(program) }` — `AppDrawer size='xl'`, `useForm`, sections as `SectionCard padding='md'` in this order, sticky footer (Cancel · create: Save as draft / Schedule (start > today) or Start now (start ≤ today) · edit: Save changes). Validation: name; ≥1 metric; COMPOSITE weights sum 100 (`editor.weightsInvalid`); dates required, end > start.
1. **BasicsSection** — `TextInput` name, `Textarea` description, `Select` scope (`SCOPES`; supervisor role locked to TEAM and the control hidden), `MultiSelect` supervisors (`RANKING_SUPERVISORS`; hidden for supervisor role and for ALL_TEAMS/SUPERVISORS), `MultiSelect` campaigns (`ANALYTICS_CAMPAIGNS`), `NumberInput` minCalls (1–100).
2. **MetricSection** — `SegmentedControl` mode; SINGLE → one `Select` metric grouped by area (`renderOption` with area color dot); COMPOSITE → list rows (`Select` metric + `NumberInput` weight 0–100 with `%` suffix + remove `ActionIcon`), `Button variant='light' size='xs'` add (max 4), a `Progress.Root` with one section per metric (area colors) and `Text size='xs'` `editor.weightsTotal` (red when ≠ 100).
3. **PeriodSection** — two `DateInput` (`@mantine/dates`, `minDate` today for start on create), `InlineNotice color='blue'` `editor.sections.periodDescription`, computed `Text size='xs' c='dimmed'` `{{days}} days`.
4. **BadgesSection** — `MultiSelect` earnable badges (options from `useTriggerRulesStore.badges` with status ACTIVE; `renderOption` emoji + name + tier), `Button variant='subtle' size='xs' leftSection={<IconPlus/>}` `createBadge` → opens the Triggers `BadgeEditorDrawer` (`onSaved` → adds the new badge id to the selection), `Select` winnerBadge (same options, clearable), `Textarea` prizeNote; preview row of selected badge emojis.
5. **VisibilitySection** — `SegmentedControl` visibility, `Switch` showScoresToAgents, `Switch` reactionsEnabled.
6. **`ProjectedStandings`** (sticky top panel like the Triggers `PreviewPanel`): `buildStandings(previewProgram, RANKING_AGENTS, seed)` recomputed from the live form values (scope/supervisors/metrics/minCalls) → `Text fw={600}` `editor.projected.title` + `Text xs dimmed` description + collapsible top-5 list (`#rank · name · score pts`).

Save: `addProgram` / `updateProgram`; status per footer button (`DRAFT`, `SCHEDULED`, `ACTIVE`) with STARTED activity when ACTIVE; toast; `onSaved` → page opens the detail drawer for the saved program.

- [ ] Steps: types + helpers → sections → `ProjectedStandings` → drawer → page wiring (new / edit / duplicate) → typecheck → commit *(if authorized)* `feat(qa-rankings): ranking editor with weighted metrics, period, badges and projected standings`

---

## Task 6: Agent page reads the active ranking

**Files:** `src/modules/qa/agent/rankings/hooks/useLeaderboardMetadata.ts`, `TeamRankingsPage.tsx`

- `useLeaderboardMetadata()` → `const programs = useRankingProgramsStore((s) => s.programs); const [params] = useSearchParams(); const program = params.get('programId') ? programs.find(id) : activeProgramFor('SUP-001') ?? null; const metadata = program ? toLeaderboardMetadata(program, t) : currentLeaderboard;` — keep the rest of the hook's derived values. Also expose `program` so `TeamRankingsPage` can show an `InlineNotice` with the prize note (`manager.detail.settings.prize`) and the earnable badge emojis under the `LeaderboardHeader`.
- `TeamRankingsPage`: when `program` is null render `EmptyState` (`page.emptyTitle/Description`) instead of the table.
- Standings on the agent page keep using `AGENT_RANKINGS` (120 rows) — out of scope to replace; note in the plan's Known limitations.

- [ ] Steps: hook → page → typecheck → commit *(if authorized)* `feat(qa-rankings): agent leaderboard follows the active ranking program`

---

## Task 7: Final audit

- [ ] Every `manager.*` key exists in en and es; no hardcoded strings in `src/modules/qa/rankings/**`.
- [ ] No hex colors / inline styles / `any`; tabs + `~/` imports.
- [ ] `npm run typecheck` clean for touched files.
- [ ] *(Only if the user asks to run the app)* Manual: Supervisor → sidebar Rankings → 3 cards (2 own + Q3 cup read-only); New ranking → composite 70/30 → projected standings update live → Start now → card ACTIVE; End now → confirm names the leader → COMPLETED with winner, winner badge holder appears in Triggers › Badges; QA Manager → 5 cards, scope selector visible; detail drawer tabs; `/qa/agent/rankings?programId=RNK-002` shows that ranking's header; legacy `/qa/qamanager/rankings` redirects; dark mode; ES.

---

## Spec Coverage Check

- ✅ Supervisor and QA Manager create rankings for their teams (scope, teams, campaigns) — Tasks 3, 5
- ✅ Scored on any evaluation method (Sentiment & Emotion, QA, Compliance, Business Insights, or weighted composite) — Task 5 (`MetricSection`)
- ✅ Start date (calls start counting) and end date; the #1 at the end is the winner; explicit "End now & pick winner" — Tasks 1, 3, 5
- ✅ Rankings define badges based on actions/consistency (from the shared catalog with condition criteria; inline badge creation) and a winner badge — Task 5 (`BadgesSection`), Task 4 (`ProgramBadgesTab`)
- ✅ 8–10 sample badges across QA, Compliance, objection management, sentiment/emotion booster (angry → happy) — provided by the Triggers plan catalog (10 badges), surfaced here
- ✅ Agent-side Team Rankings shows the same ranking the manager created — Task 6
- ✅ Dark/light, i18n en+es, shared primitives — all tasks

## Known limitations (by design for the mockup)
- Standings are generated from static agent profiles, not from evaluated calls; the agent page still lists the 120-row mock roster for its table.

## Execution Choice

1. **Subagent-Driven (recommended for Haiku):** one subagent per task in order 1→7, after the Triggers and Drawer Refinement plans.
2. **Inline execution:** sequential in one session.
