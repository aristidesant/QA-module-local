# Disputes Review (Supervisor / QA Manager) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Execute tasks **in order**; every task compiles on its own.

**Goal:** Give Supervisors and QA Managers a working Disputes section where every dispute submitted by an agent lands with status **open → approved / rejected**, and whose detail reuses the **call detail structure** (audio player, transcript with markers, and the four evaluation types: QA, Compliance, Sentiment & Emotion, Business Insights) plus the agent's dispute statement and the exact items they disagree with. Reviewers decide item by item, accept or reject with a note, and the agent is notified. The sidebar Disputes counter shows **open** disputes.

**Architecture:** Keep the real list (`DisputesListPage`) and detail (`DisputeDetailPage`) pages and their React Query layer; extend the mock API (`disputesApi.ts` + `disputesMockData.ts`) with filters, stats, a `resolveDispute` mutation and a per-dispute **call context** (transcript, markers, evaluation results by type). Re-point the three role routes (`agent/disputes`, `supervisor/disputes`, `qa-manager/disputes`) from the empty legacy `DisputesManagement` to the real list, add role-prefixed detail routes, and fix the sidebar links. The detail page is rewritten to the call-detail layout with tabs. Compliance/QA breakdown widgets are reused from the Dashboard plan.

**Tech Stack:** React 19, React Router v7, Mantine v9.2, TanStack Query v5 (existing `disputesQueries.ts`), react-i18next (`qa.disputes`).

**Spec (user):** Supervisor and QA Manager receive all disputes from agents who disagree with the AI evaluation. Statuses: open (no judgement yet), accepted, rejected. Reuse the structure we have for the call detail — player, transcript, the different evaluation types — as the dispute detail, so the reviewer can see the call, listen, read the transcript, see the evaluations, and read the agent's message: what they complain about, why, and which aspects they disagree with.

**Existing state found:** the supervisor/QA-manager routes render `DisputesManagement` with no props (three empty tabs); `DisputeDetailPage` fakes the player/transcript with hardcoded turns, ignores `disputedQuestionIds`, never persists decisions, and gates actions on `previewRole === 'operationManager'`; the `disputes-list` dashboard page navigates to ids that do not exist in the mock; `TranscriptWithMarkers` declares `onMarkerClick` but never calls it; the sidebar counter shows all disputes, not open ones.

**Dependencies:** *Dashboard Evaluation Views* plan (reuses `QaErrorBreakdownCard`, `ComplianceAreaBreakdownCard`). Optional: `notificationStore.addNotification` (added by Triggers / Analytics / Inbox plans; Task 4 adds it if missing).

---

## Global Constraints

- **Design-session rules (DESIGN_ROLE.md):** mock only; no `npm run dev`, tests or `git commit` unless the user explicitly asks in the execution session. `npm run typecheck` after each task.
- Mantine v9, CSS Modules, tokens/`light-dark()`, dark & light mode, no inline styles.
- Reuse: `SectionCard`, `BaseTable`, `EmptyState`, `PaginationControls`, `InlineNotice`, `ContentContainer`, `AppDrawer` (not needed here), dashboard `AudioPlayerWithClipping` + `TranscriptWithMarkers`, `DisputedItemCard`.
- i18n: extend `src/locales/en/qa.disputes.json` **and** `es/qa.disputes.json` (keep existing keys).
- Do not modify `DisputesManagement.tsx` or the dashboard `DisputesPage.tsx` (legacy; their routes are redirected).
- TypeScript strict, no `any`, tabs, `~/` imports.

---

## Identity & roster (shared with the other plans)

Supervisor **Maria García** (`SUP-001`, Team 1: Sarah Johnson `AGT-001`, Mike Chen `AGT-002`, Jessica Martinez `AGT-003`, John Smith `AGT-004`, Emma Davis `AGT-005`, David Brown `AGT-006`, Lisa Wong `AGT-007`); **Juan Pérez** (`SUP-002`, Team 2: Sofia Rodríguez `AGT-008`, Carlos Vega `AGT-010`, Lucía Torres `AGT-011`, Diego Ramírez `AGT-012`); **Laura Gómez** (`SUP-003`, Team 3: Camila Herrera `AGT-015`, Nina Patel `AGT-017`). QA Manager **Elena Ruiz** (`QAM-001`). Agent persona = John Smith (`AGT-004`). Campaigns: Q3 Customer Service, Sales Training, Q4 Compliance, Tech Support.

---

## File Structure

### New files

```
src/modules/qa/disputes/
  constants.ts                                  — status colors/order, roster options, evaluation tab list
  hooks/useDisputeRole.ts                       — role + basePath from URL / role preview
  DisputesListPage/DisputeStatusChips.tsx       — status quick filter with counts
  DisputeDetailPage/components/DisputeSummaryStrip.tsx
  DisputeDetailPage/components/CallPanel.tsx                    — call card + player + transcript (left column)
  DisputeDetailPage/components/DisputeTab/DisputeTab.tsx (+ .module.css, index.ts)
  DisputeDetailPage/components/DisputeTab/DisputedItemDecisionCard.tsx
  DisputeDetailPage/components/DisputeTab/ResolutionCard.tsx
  DisputeDetailPage/components/DisputeTab/DisputeTimeline.tsx
  DisputeDetailPage/components/QaEvaluationTab.tsx
  DisputeDetailPage/components/ComplianceEvaluationTab.tsx
  DisputeDetailPage/components/SentimentEvaluationTab.tsx
  DisputeDetailPage/components/BusinessEvaluationTab.tsx
```

### Modified files

- `src/models/qa/disputes.ts` — status type, disputed answers, resolution, call context, list params (`status`), stats
- `src/api/qa/disputesMockData.ts` — 12 roster-consistent disputes + call contexts + in-memory resolve
- `src/api/qa/disputesApi.ts` — filters/sort/pagination in `getDisputes`, `getDisputesStats`, `resolveDispute`, richer `getDispute`
- `src/queries/qa/disputesQueries.ts` — `useDisputesStatsQuery`, `useResolveDisputeMutation`
- `src/modules/qa/disputes/DisputesListPage/DisputesListPage.tsx`, `DisputesFilters.tsx` — role awareness, chips, roster options, columns
- `src/modules/qa/disputes/DisputeDetailPage/DisputeDetailPage.tsx` (+ `.module.css`) — rewrite to the call-detail layout
- `src/modules/qa/dashboard/components/TranscriptWithMarkers.tsx` — actually call `onMarkerClick`; accept `activeMarkerId` for highlighting
- `src/routes.tsx` — role routes → real pages; role-prefixed detail routes; legacy redirects
- `src/components/Sidebar/Sidebar.tsx` — fix supervisor/qaManager Disputes `to`; open-only counter
- `src/modules/qa/qaNamespaces.ts` — new route ids → `qa.disputes`
- `src/locales/en/qa.disputes.json`, `src/locales/es/qa.disputes.json`

### Reference files (read-only)

- `src/modules/qa/dashboard/pages/CallDetailPage.tsx` — the four-evaluation-type layout being mirrored
- `src/modules/qa/dashboard/components/AudioPlayerWithClipping.tsx` (`{ duration?, clips: AudioClip[], onClipSelect? }`, `AudioClip { id, label, startTime, endTime, description }`)
- `src/modules/qa/dashboard/components/TranscriptWithMarkers.tsx` (`Marker { id, startTime, endTime, type: 'violation'|'opportunity'|'note', label, description, evaluatorComment, suggestion }`, `TranscriptSegment { id, timestamp, speaker, text, markerId? }`)
- `src/modules/qa/disputes/DisputeDetailPage/components/DisputedItemCard/DisputedItemCard.tsx` — item card with Yes/No/N/A radios
- `src/models/qa/evaluations.ts` — `EvaluationDetail`, `EvaluationGroup`, `EvaluationQuestion`, `EvaluationAnswer`
- `src/modules/qa/evaluations/DisputeDrawer/DisputeDrawer.tsx` — how agents create disputes (reason + changed answers)
- `src/modules/qa/dashboard/components/{QaErrorBreakdownCard,ComplianceAreaBreakdownCard}.tsx` — from the Dashboards plan

---

## Task 1: Model, mock data, API, queries

**Files:** `src/models/qa/disputes.ts`, `src/api/qa/disputesMockData.ts`, `src/api/qa/disputesApi.ts`, `src/queries/qa/disputesQueries.ts`

- [ ] **Step 1: extend `src/models/qa/disputes.ts`** (add; keep existing exports)

```typescript
export type DisputeStatus = 'open' | 'approved' | 'rejected';
export type DisputeDecision = 'APPROVED' | 'PARTIALLY_APPROVED' | 'REJECTED';
export type DisputeReviewerRole = 'SUPERVISOR' | 'QA_MANAGER';

/** One item the agent contested when submitting the dispute. */
export interface DisputedAnswer {
	questionId: number;
	originalLabel: string;
	proposedLabel: string;
	agentComment: string;
}

export type ItemDecision = 'KEEP_ORIGINAL' | 'ACCEPT_PROPOSED' | 'OTHER';
export interface DisputeItemDecision { questionId: number; decision: ItemDecision; finalLabel: string }

export interface DisputeResolution {
	decision: DisputeDecision;
	note: string;
	decidedBy: string;
	decidedByRole: DisputeReviewerRole;
	decidedAt: string;
	itemDecisions: DisputeItemDecision[];
}

export type DisputeTimelineKind = 'SUBMITTED' | 'VIEWED' | 'ESCALATED' | 'DECIDED';
export interface DisputeTimelineEvent { id: string; kind: DisputeTimelineKind; actor: string; at: string; note: string | null }

export type CallSpeaker = 'agent' | 'customer';
export interface DisputeTranscriptTurn {
	id: number;
	timestamp: number;            // seconds
	speaker: CallSpeaker;
	text: string;
	emotion: string;              // e.g. 'Frustration', 'Satisfaction', 'Neutral'
	sentiment: number;            // 1-5
	markerId?: number;
}
export interface DisputeMarker {
	id: number;
	startTime: number;
	endTime: number;
	type: 'violation' | 'opportunity' | 'note';
	label: string;
	description: string;
	evaluatorComment: string;
	suggestion: string;
	/** question this marker evidences (drives cross-highlighting with the disputed items) */
	questionId: number | null;
}
export interface DisputeQaResult { method: 'COPC'; scorePct: number; errors: { ecn: number; enc: number; ecc: number; ecuf: number }; autoFails: number; summary: string }
export interface DisputeComplianceResult { scorePct: number; areas: Array<{ area: 'security' | 'regulatory' | 'legal'; score: number; items: Array<{ key: string; score: number }> }>; violations: string[] }
export interface DisputeSentimentResult { customerScore: number; agentScore: number; predominantEmotion: string; recovered: boolean; forecastNps: number; summary: string }
export interface DisputeBusinessResult { signals: Array<'EARLY_OBJECTION' | 'UNHANDLED_OBJECTION' | 'COMPETITOR_PLUS_COST' | 'MISTARGETED_OFFER'>; competitorMentioned: string | null; offeredProduct: string | null; converted: boolean; nonConversionReason: string | null; summary: string }
export interface DisputeCallContext {
	callId: string;
	durationSeconds: number;
	occurredAt: string;
	customerName: string;
	transcript: DisputeTranscriptTurn[];
	markers: DisputeMarker[];
	qa: DisputeQaResult;
	compliance: DisputeComplianceResult;
	sentiment: DisputeSentimentResult;
	business: DisputeBusinessResult;
}

export interface DisputesStats { open: number; approved: number; rejected: number; total: number }
export interface ResolveDisputePayload { decision: DisputeDecision; note: string; itemDecisions: DisputeItemDecision[] }
```
Also: `EvaluationDisputeSummary` gains `agentId: string; supervisorId: string; supervisorName: string; team: string; disputedAnswers: DisputedAnswer[]; resolution: DisputeResolution | null; timeline: DisputeTimelineEvent[];` and `status: DisputeStatus`; `EvaluationDisputeDetail` gains `callContext: DisputeCallContext`; `EvaluationDisputeListQueryParams` gains `status?: DisputeStatus[]` and `search?: string`.

- [ ] **Step 2: rewrite `disputesMockData.ts`** — 12 disputes (ids 1001–1012), all `sourceFormName 'QA'`, `sourceEvaluatorType 'AI'`, `resultingEvaluatorType 'HUMAN'`, dates 2026-08-28 → 2026-09-10:

| id | agent | supervisor | campaign | call | status | disputed items (questionId: original → proposed) | reason gist | resolution |
|---|---|---|---|---|---|---|---|---|
| 1001 | Lisa Wong AGT-007 | SUP-001 | Q4 Compliance | CALL-2026-09-0533 | open | 2: No→Yes ("I read the full disclosure at 1:42"); 5: No→N/A | AI flagged a critical compliance error but the disclosure was given | — |
| 1002 | David Brown AGT-006 | SUP-001 | Q3 Customer Service | CALL-2026-09-0812 | open | 4: No→Yes | Objection was handled; customer accepted the alternative | — |
| 1003 | John Smith AGT-004 | SUP-001 | Q3 Customer Service | CALL-2026-09-0710 | open | 1: No→Yes; 3: No→Yes | Greeting and verification were complete | — |
| 1004 | Sofia Rodríguez AGT-008 | SUP-002 | Sales Training | CALL-2026-09-0704 | open | 6: No→Yes | Closing recap was done | — |
| 1005 | Nina Patel AGT-017 | SUP-003 | Q4 Compliance | CALL-2026-09-0622 | open | 5: No→N/A | Do-not-call check not applicable for inbound | — |
| 1006 | Sarah Johnson AGT-001 | SUP-001 | Q3 Customer Service | CALL-2026-09-0301 | approved | 2: No→Yes | — | APPROVED by Maria García SUPERVISOR 2026-09-04, note "Disclosure confirmed at 1:10", item ACCEPT_PROPOSED |
| 1007 | Mike Chen AGT-002 | SUP-001 | Tech Support | CALL-2026-08-3014 | approved | 4: No→Yes | — | APPROVED by Elena Ruiz QA_MANAGER |
| 1008 | Carlos Vega AGT-010 | SUP-002 | Sales Training | CALL-2026-08-2905 | rejected | 2: No→Yes | — | REJECTED by Juan Pérez, note "Disclosure was partial; script requires full statement" |
| 1009 | Emma Davis AGT-005 | SUP-001 | Q3 Customer Service | CALL-2026-08-2811 | rejected | 3: No→Yes; 6: No→Yes | — | REJECTED by Maria García |
| 1010 | Camila Herrera AGT-015 | SUP-003 | Q4 Compliance | CALL-2026-09-0201 | approved | 1: No→Yes; 5: No→N/A | — | PARTIALLY_APPROVED by Laura Gómez (item 1 ACCEPT_PROPOSED, item 5 KEEP_ORIGINAL) |
| 1011 | Diego Ramírez AGT-012 | SUP-002 | Sales Training | CALL-2026-09-0510 | open | 4: No→Yes | Customer's objection was about timing, not price | — |
| 1012 | Jessica Martinez AGT-003 | SUP-001 | Tech Support | CALL-2026-09-0902 | rejected | 6: No→Yes | — | REJECTED by Elena Ruiz |

`before/after` scores: open → `after = before`, `scoreDelta 0`; approved → +12/+15; partially → +6; rejected → 0. `timeline`: SUBMITTED (agent) + VIEWED (supervisor) for open; + DECIDED for resolved. `disputedByUserName` = agent name.

**Shared QA form (6 questions, 2 groups)** used by `getDispute` for every dispute (replace the current 2-question mock): group "Call opening" → 1 "Was the greeting complete (name, company, offer to help)?", 2 "Was the required disclosure statement read?", 3 "Was customer identity verified?"; group "Handling & closing" → 4 "Was the customer's objection acknowledged and handled?", 5 "Was the do-not-call preference checked?", 6 "Did the agent recap next steps before closing?". Options Yes 25 / No 0 / N/A 25 (weights 1). Source answers: all Yes except the disputed question ids (No) and one extra non-disputed No for 1002 and 1009 (question 6 / question 1). Resulting answers apply the resolution's `itemDecisions`.

**Call context builder** `buildCallContext(dispute): DisputeCallContext` — two hand-written transcripts reused by campaign type:
- *Compliance script* (Q4 Compliance / Tech Support): 10 turns, 0→255 s, agent greeting (Neutral 3.5) → customer question (Neutral) → agent disclosure at 102 s (turn 5, markerId 1) → customer (Satisfaction 4.0) → identity verification 140 s (turn 7, markerId 2) → close 240 s (turn 10, markerId 3).
- *Objection script* (Q3 Customer Service / Sales Training): 11 turns, 0→272 s, customer frustration at 85 s (Frustration 2.2), agent alternative at 110 s (markerId 1, questionId 4), customer accepts at 150 s (Relief 3.8), recap at 250 s (markerId 3, questionId 6).
Markers carry `questionId` matching the disputed questions of that dispute (type `violation` for AI-flagged items, `note` otherwise). `qa`: errors derived from source answers (each No = 1 error, ECC for question 2/5, ECUF for 4, ENC otherwise), `scorePct = before.overallScorePct`. `compliance`: security 96/regulatory (82 when question 2 is No else 94)/legal 90 with the 8 sub-item keys; `violations` = labels of No answers on 2/5. `sentiment`: customer avg of turns, agent 4.0, predominant emotion by majority, `recovered` true for objection script, `forecastNps` 7 / 4. `business`: objection script → `['EARLY_OBJECTION']` (+ `'UNHANDLED_OBJECTION'` when question 4 is No), competitor 'Claro' for Sales Training, offeredProduct 'Premium Plan', `converted` true when recovered.

Exports: `mockDisputes` (mutable array), `getMockDisputes(params)`, `getMockDisputeById(id)`, `getMockCallContext(id)`, `resolveMockDispute(id, payload, reviewer)`, `getMockDisputesStats()`, `DISPUTE_SUPERVISORS`, `DISPUTE_AGENTS` (`{ value, label, supervisorId, team }`), `DISPUTE_CAMPAIGNS`.

- [ ] **Step 3: `disputesApi.ts`**
  - `getDisputes(params)`: filter `mockDisputes` by `status`, `supervisorIds` (string ids now → change `EvaluationDisputeListQueryParams.supervisorIds/agentIds/campaignIds` to `string[]`), `createdAtFrom/To`, `search` (agent, call ref, id); sort by `createdAt` or `scoreDelta` with `orderBy`; paginate with `page/limit`; return `PaginatedResponse`.
  - `getDispute(id)`: build `EvaluationDisputeDetail` with the shared 6-question form (source answers/resulting answers as above) + `callContext: getMockCallContext(id)`.
  - `getDisputesStats(): Promise<DisputesStats>`.
  - `resolveDispute(id, payload, reviewer: { name; role })`: `await new Promise(r => setTimeout(r, 400))`; `resolveMockDispute` sets `status` (`REJECTED` → 'rejected', otherwise 'approved'), `resolution`, `after` score = before + 12.5 × accepted items (cap 100), `scoreDelta`, `resultingVersion + 1`, appends DECIDED timeline event; returns the updated summary.
- [ ] **Step 4: `disputesQueries.ts`** — add `disputesStatsQueryKey = ['qa','disputes','stats']`, `useDisputesStatsQuery()`, `useResolveDisputeMutation(disputeId)` (invalidates `disputesQueryKey`, `disputeQueryKey(id)`, stats).
- [ ] **Step 5: Typecheck** (expect the list/detail pages to still compile; `supervisorIds` etc. now strings — update `DisputesListPage` state types in Task 2 if this breaks: fix minimally here by changing the `filters` state to `string[]`). **Step 6: Commit** *(if authorized)* `feat(qa-disputes): roster-consistent mock disputes with call context, stats and resolve API`

---

## Task 2: Roles, routes, sidebar, list page

**Files:** `constants.ts`, `hooks/useDisputeRole.ts`, `DisputeStatusChips.tsx`, `DisputesListPage.tsx`, `DisputesFilters.tsx`, `routes.tsx`, `Sidebar.tsx`, `qaNamespaces.ts`, locales

- [ ] **Step 1: `constants.ts`** — `STATUS_COLORS: Record<DisputeStatus, string> = { open: 'yellow', approved: 'green', rejected: 'red' }`, `DECISION_COLORS`, `STATUS_ORDER`, `EVALUATION_TABS = ['dispute','qa','compliance','sentiment','business'] as const`.
- [ ] **Step 2: `hooks/useDisputeRole.ts`**

```typescript
export type DisputeRole = 'agent' | 'supervisor' | 'qaManager';
export function useDisputeRole(): { role: DisputeRole; basePath: string; canReview: boolean; reviewer: { name: string; role: 'SUPERVISOR' | 'QA_MANAGER' } | null; supervisorId: string | null }
// pathname '/qa/agent/…' → agent; '/qa/supervisor/…' → supervisor; '/qa/qa-manager/…' | '/qa/qamanager/…' → qaManager;
// otherwise from useRoleMockStore().previewRole: 'agent' → agent, 'supervisor' → supervisor, else qaManager.
// basePath: '/qa/agent' | '/qa/supervisor' | '/qa/qa-manager'; canReview = role !== 'agent';
// reviewer: supervisor → { 'Maria García', 'SUPERVISOR' }, qaManager → { 'Elena Ruiz', 'QA_MANAGER' }; supervisorId: 'SUP-001' for supervisor else null.
```

- [ ] **Step 3: `routes.tsx`**
  - `agent/disputes`, `supervisor/disputes` → element `<QaDisputesListPage />` (already lazily imported as `QaDisputesListPage`); rename the QA manager route path to `qa-manager/disputes` (id stays `qa.qamanager.disputes`) and add a legacy `{ path: 'qamanager/disputes', element: <Navigate to='/qa/qa-manager/disputes' replace /> }`.
  - Add detail routes `agent/disputes/:disputeId` (`qa.agent.disputes.detail`), `supervisor/disputes/:disputeId` (`qa.supervisor.disputes.detail`), `qa-manager/disputes/:disputeId` (`qa.qa-manager.disputes.detail`) → `<QaDisputeDetailPage />`.
  - `disputes-list` (id `qa.disputes-list`) → `<Navigate to='/qa/qa-manager/disputes' replace />`.
  - Remove the now-unused `DisputesManagement` and `DisputesPage` lazy consts if no route uses them.
- [ ] **Step 4: `qaNamespaces.ts`** — map `qa.agent.disputes`, `qa.supervisor.disputes`, `qa.qamanager.disputes`, and the three `.detail` ids → `'qa.disputes'`.
- [ ] **Step 5: `Sidebar.tsx`** — supervisor `role-preview-disputes.to` → `/qa/supervisor/disputes`; qaManager → `/qa/qa-manager/disputes`; in `SidebarLinkItem` change the query to `useDisputesQuery({ limit: 1, status: ['open'] }, item.badge === 'disputes')` so the circle shows **open** disputes.
- [ ] **Step 6: `DisputeStatusChips`** props `{ value: DisputeStatus | 'ALL'; onChange; stats: DisputesStats | undefined }` — `Chip.Group` single: All (total) · Open (yellow) · Approved (green) · Rejected (red), each with count badge.
- [ ] **Step 7: `DisputesFilters.tsx`** — replace `MOCK_*` with `DISPUTE_SUPERVISORS` / `DISPUTE_AGENTS` / `DISPUTE_CAMPAIGNS`; props gain `showSupervisor: boolean` (QA manager only) and `showAgent: boolean` (not for agent role); agent options narrow to the selected supervisors (or to `SUP-001` for the supervisor role); add `TextInput` search (`list.filters.search`); remove the dead "Apply Filters" button (filters apply on change); keep sort select and Clear.
- [ ] **Step 8: `DisputesListPage.tsx`**
  - `const { role, basePath, supervisorId } = useDisputeRole()`; supervisor role forces `supervisorIds = ['SUP-001']`; agent role forces `agentIds = ['AGT-004']`.
  - `status` chip state → `queryParams.status` (undefined for ALL); `useDisputesStatsQuery()` feeds the chips and the header badge (`Badge color='yellow'` `list.openCount`).
  - Columns (role-aware): `#id` · Agent (`Stack`: name + `Text xs dimmed` team; hidden for agent role) · Supervisor (QA manager only) · Campaign · Call (ref + date) · Disputed items (`Badge variant='light'` count) · Score (`before% → after%` with delta badge; shows `—` when open) · Status (`Badge` `STATUS_COLORS`, label `list.status.*`) · Reviewed by (resolution?.decidedBy or `—`; hidden for agent role) · Age (`{{days}}d` for open, else decided date).
  - Row click → `navigate(`${basePath}/disputes/${id}`)`.
  - Header: `ContentContainer title={t('list.title')} description={t('list.roleDescription.<role>')}`.
- [ ] **Step 9: i18n additions** (en; es mirrors) under `list`: `roleDescription.{agent,supervisor,qaManager}`, `openCount_one/_other`, `status.{ALL,open,approved,rejected}`, `filters.search`, `columns.{agent,supervisor,campaign,call,items,score,status,reviewedBy,age}`, `age.days` (`{{count}}d`).
- [ ] **Step 10: Typecheck**; **Step 11: Commit** *(if authorized)* `feat(qa-disputes): role-aware disputes list, routes and open-disputes sidebar counter`

---

## Task 3: Detail page shell — header, summary strip, call panel, tabs

**Files:** `DisputeDetailPage.tsx` (+ `.module.css`), `components/DisputeSummaryStrip.tsx`, `components/CallPanel.tsx`, `TranscriptWithMarkers.tsx` (fix)

- [ ] **Step 1: `TranscriptWithMarkers.tsx`** — destructure `onMarkerClick` and call it when a marker is expanded; add optional `activeMarkerId?: number | null` prop that forces that marker open and adds a `data-active` attribute on the segment row (CSS: `[data-active='true'] { outline: 2px solid var(--mantine-color-blue-5) }` via its module css). Keep everything else unchanged.

- [ ] **Step 2: `DisputeDetailPage.tsx` rewrite**
  - Data: `useDisputeQuery(disputeId)`; `const { role, basePath, canReview, reviewer } = useDisputeRole()`; local `activeTab` from `?tab=` (`EVALUATION_TABS`, default `dispute`); `activeMarkerId` / `activeQuestionId` state for cross-highlighting.
  - `ContentContainer contentWidth='full' showBackButton onBackClick={() => navigate(`${basePath}/disputes`)} title={t('detail.titleWithId', { id })} description={t('detail.description')} titleRight={<Group gap='xs'><Badge color={STATUS_COLORS[status]} variant='filled'>{t(`list.status.${status}`)}</Badge>{status !== 'open' && <Badge color={delta>=0?'green':'red'} variant='light'>{t('scoreDelta', …)}</Badge>}</Group>}`.
  - Loading / error states as today.
  - `DisputeSummaryStrip dispute` then `Grid`: `Grid.Col span={{ base: 12, lg: 4 }}` → `CallPanel`; `Grid.Col span={{ base: 12, lg: 8 }}` → `Tabs value={activeTab} onChange keepMounted={false}`: `Tabs.List` with `leftSection` icons (`IconGavel` dispute · `IconClipboardCheck` qa · `IconShieldCheck` compliance · `IconMoodSmile` sentiment · `IconBriefcase` business) and a `Badge size='xs'` on the dispute tab with the disputed item count; panels → Task 4/5 components (placeholders until then).

- [ ] **Step 3: `DisputeSummaryStrip`** props `{ dispute: EvaluationDisputeDetail }` — `SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}` of `Paper withBorder p='md' radius='md'` cards: **Agent** (`Avatar` initials, name, `team · supervisorName`), **Call** (`IconMicrophone`, `callContext.callId`, campaign, `useDateFormatter('dateTime')` occurredAt, duration `m:ss`), **Evaluation** (form name, evaluator-type badge with `IconRobot`/`IconUserCheck` — reuse the existing JSX, version, `before% → after%` or `before%` when open), **Dispute** (submitted by, date, `detail.summary.items` count, age or decided date).

- [ ] **Step 4: `CallPanel`** props `{ context: DisputeCallContext; disputedQuestionIds: number[]; activeMarkerId; onMarkerClick(marker) }` — `Stack gap='md'`: `SectionCard padding='md'` call card (icon, callId, customer name, date); `AudioPlayerWithClipping duration={durationSeconds} clips={markers.map(m => ({ id: m.id, label: m.label, startTime: m.startTime, endTime: m.endTime, description: m.description }))} onClipSelect={(clip) => onMarkerClick(markerById(clip.id))}`; `SectionCard title={t('detail.transcript.title', { count: transcript.length })} headerActions={<Button variant='subtle' size='xs' leftSection={<IconDownload size={14}/>} onClick={() => notifySuccess(t('detail.transcript.downloadStarted'))}>…</Button>}` → `TranscriptWithMarkers segments={transcript.map(({ id, timestamp, speaker, text, markerId }) => ({ id, timestamp, speaker, text, markerId }))} markers={markers.map(({ questionId: _q, ...m }) => m)} activeMarkerId onMarkerClick`. Markers that belong to disputed questions get `type: 'violation'` and a `Badge` "Disputed" injected in the label (`label: `${m.label} · ${t('detail.transcript.disputed')}``).

- [ ] **Step 5: i18n** under `detail`: `tabs.{dispute,qa,compliance,sentiment,business}`, `summary.{agent,call,evaluation,dispute,items_one,items_other,age,decidedOn,duration}`, `transcript.{title,disputed,downloadStarted}`.
- [ ] **Step 6: Typecheck**; **Step 7: Commit** *(if authorized)* `feat(qa-disputes): dispute detail shell with call panel and evaluation tabs`

---

## Task 4: Dispute tab — statement, item decisions, resolution, timeline, notification

**Files:** `components/DisputeTab/DisputeTab.tsx` (+ `.module.css`, `index.ts`), `DisputedItemDecisionCard.tsx`, `ResolutionCard.tsx`, `DisputeTimeline.tsx`; `notificationStore.ts` guard

**`DisputeTab`** props `{ dispute; canReview; reviewer; activeQuestionId; onFocusQuestion(questionId) ; onResolved() }`:
1. **Agent statement** — `SectionCard icon={IconMessageReport} title={t('detail.statement.title')} headerAccent='yellow'` → `InlineNotice color='yellow' icon={<IconUser size={16}/>} title={t('detail.statement.by', { name, date })} description={dispute.reason}`; below, `Group gap='xs'` of `Badge variant='outline'` per disputed question (`Q{{n}}` short) — click → `onFocusQuestion`.
2. **Disputed items** — `SectionCard title={t('detail.items.title')} description={t('detail.items.description')}` → one `DisputedItemDecisionCard` per `disputedAnswers` entry (question looked up in `source.groups`), `data-active` highlight when `activeQuestionId` matches (scroll into view).
   - `DisputedItemDecisionCard` props `{ question; disputed: DisputedAnswer; marker: DisputeMarker | null; decision: DisputeItemDecision; editable: boolean; onChange(decision); onJumpToMarker(marker) }` — `Paper withBorder p='md' radius='md'` (`.card`, `.cardActive` accent border): header `Group justify='space-between'`: `Text fw={600} size='sm'` `Q{{n}} · {{group}}` + `Badge color='yellow' variant='light'` `detail.items.disputed`; `Text size='sm'` question text; comparison row `SimpleGrid cols={2}`: original (`Text xs dimmed` `detail.items.original` + `Badge color='red' variant='light'` originalLabel) vs proposed (`Badge color='green' variant='light'` proposedLabel); `Blockquote`-like `Paper` with the agent comment (`IconQuote`); marker link `Button variant='subtle' size='compact-xs' leftSection={<IconPlayerPlay size={12}/>}` `detail.items.listen` (`m:ss`) → `onJumpToMarker`; when `editable`: `SegmentedControl` decision (`KEEP_ORIGINAL` / `ACCEPT_PROPOSED` / `OTHER`) + `Select` finalLabel (Yes/No/N/A) visible for `OTHER`; when not editable and resolved: `Badge` with the item decision and final label.
3. **Resolution** — `ResolutionCard` props `{ dispute; canReview; reviewer; itemDecisions; onSubmit(payload); submitting }`:
   - Open + `canReview`: computed `decision` = all `ACCEPT_PROPOSED` → APPROVED; none → REJECTED; mixed → PARTIALLY_APPROVED (shown as a live `Badge`); `Textarea` note (required, `detail.resolution.notePlaceholder`); projected score `Text` `detail.resolution.projected` (before + 12.5 × accepted, cap 100); buttons `Button color='green' leftSection={<IconCheck/>}` `detail.resolution.approve` (sets all items ACCEPT_PROPOSED then submits), `Button color='red' variant='light' leftSection={<IconX/>}` `detail.resolution.reject` (all KEEP_ORIGINAL), `Button` `detail.resolution.submit` (uses current item decisions) — each opens `modals.openConfirmModal` with the decision summary before calling `onSubmit`.
   - Open + agent role: `InlineNotice color='blue'` `detail.resolution.pending`.
   - Resolved: `Group`: `Badge` decision (`DECISION_COLORS`: APPROVED green · PARTIALLY_APPROVED teal · REJECTED red), reviewer + role + date; `Paper` note; before/after score cells (reuse the existing `scoreCell` JSX); `Badge` `detail.summary.resultingVersion`.
4. **Timeline** — `DisputeTimeline events` → Mantine `Timeline` (SUBMITTED `IconSend`, VIEWED `IconEye`, ESCALATED `IconArrowUpRight`, DECIDED `IconGavel`) with actor, date, note.

Wiring in `DisputeDetailPage`: `const resolve = useResolveDisputeMutation(id)`; `onSubmit` → `resolve.mutateAsync(payload)` → `notifySuccess(t('detail.notifications.resolved.<decision>'))` → push an agent notification (guarded `addNotification` on `useNotificationStore`) `{ category: 'DIRECT_MESSAGE', priority: 'HIGH', title: t('detail.notifications.agentTitle', { id, decision }), message: note, sourceRole: reviewer.role, agentId: dispute.agentId, icon: 'IconGavel', read: false, archived: false, actioned: false, createdAt }` → detail refetches and switches to the resolved layout. Item decisions state initialised to `ACCEPT_PROPOSED` for every disputed item.

- [ ] **Step 5: i18n** under `detail`: `statement.*`, `items.*` (`title, description, disputed, original, proposed, comment, listen, decision.{KEEP_ORIGINAL,ACCEPT_PROPOSED,OTHER}, finalLabel`), `resolution.*` (`title, decision.{APPROVED,PARTIALLY_APPROVED,REJECTED}, note, notePlaceholder, noteRequired, projected, approve, reject, submit, confirmTitle, confirmMessage, pending, decidedBy`), `timeline.*` (`title, SUBMITTED, VIEWED, ESCALATED, DECIDED`), `notifications.*` (`resolved.{APPROVED,PARTIALLY_APPROVED,REJECTED}, agentTitle`).
- [ ] **Step 6: Typecheck**; **Step 7: Commit** *(if authorized)* `feat(qa-disputes): dispute tab with item decisions, resolution flow and timeline`

---

## Task 5: Evaluation tabs — QA, Compliance, Sentiment & Emotion, Business Insights

**Files:** `components/QaEvaluationTab.tsx`, `ComplianceEvaluationTab.tsx`, `SentimentEvaluationTab.tsx`, `BusinessEvaluationTab.tsx`

- **`QaEvaluationTab`** props `{ dispute; disputedQuestionIds; activeQuestionId; onFocusQuestion }` — `Stack gap='md'`: `SimpleGrid cols={{ base: 1, md: 3 }}`: score card (`Paper`: `Text xs dimmed` `qa.scoreTitle`, `Text fz={32} fw={700}` `{scorePct}%`, method badge `COPC`), `QaErrorBreakdownCard items={[{ key:'ecn', count, score: 100 - count*8, delta: 0 }, …]}` (from `callContext.qa.errors`), auto-fails card (`Text` count + `qa.autoFails`); then `SectionCard title={t('qa.fullEvaluation')}` → for each group: `Text fw={600} c='dimmed'` group name + `DisputedItemCard` per question `readOnly` `draftValue={answer.selectedLabel}` wrapped in a `div` with `data-disputed` (accent border `light-dark(var(--mantine-color-yellow-5), var(--mantine-color-yellow-7))`) and a `Badge` "Disputed" + `Button variant='subtle' size='compact-xs'` `qa.reviewInDispute` → `onFocusQuestion` (switches to the dispute tab). `InlineNotice` with `callContext.qa.summary`.
- **`ComplianceEvaluationTab`** props `{ compliance: DisputeComplianceResult }` — `SimpleGrid cols={{ base: 1, md: 3 }}`: score card, `ComplianceAreaBreakdownCard areas={compliance.areas}` (spans 2 cols via `Grid` if needed), then `SectionCard title={t('compliance.violations')}` listing `violations` as `Badge color='red' variant='light'` (or `EmptyState` `compliance.noViolations`).
- **`SentimentEvaluationTab`** props `{ sentiment: DisputeSentimentResult; transcript: DisputeTranscriptTurn[] }` — `SimpleGrid cols={{ base: 1, md: 4 }}` stat cards (customer score `toFixed(1)` colored by band, agent score, predominant emotion `Badge`, forecast NPS with `Badge` promoter/passive/detractor); `SectionCard title={t('sentiment.timeline')}` → per-turn list: `Group`: `Text xs` `m:ss`, speaker `Badge`, emotion `Badge color={emotionColor}` (map: Frustration/Anger/Rage red · Sadness/Fear/Disappointment orange · Neutral/Surprise gray · Satisfaction/Relief/Gratitude teal · Joy/Elation green), `Progress size='xs' w={80} value={sentiment*20}`; `recovered` → `InlineNotice color='teal'` `sentiment.recovered`; `summary` text.
- **`BusinessEvaluationTab`** props `{ business: DisputeBusinessResult }` — signals `Group` of `Badge variant='light'` (`business.signals.*`, colors orange/red/violet/yellow), `SimpleGrid cols={{ base: 1, md: 3 }}` cards: offered product + outcome (`converted` → green "Converted" else red "Not converted" + non-conversion reason), competitor mentioned (`—` when null), summary `InlineNotice`.
- Wire the four panels in `DisputeDetailPage`; `onFocusQuestion` sets `activeQuestionId`, switches `tab=dispute` and sets `activeMarkerId` to the marker with that `questionId`.

- [ ] **Step 5: i18n** under `detail`: `qa.*` (`scoreTitle, method, errors.{ecn,enc,ecc,ecuf}, autoFails, fullEvaluation, reviewInDispute, disputed`), `compliance.*` (`scoreTitle, areas, violations, noViolations`), `sentiment.*` (`customer, agent, predominantEmotion, forecastNps, nps.{promoter,passive,detractor}, timeline, recovered`), `business.*` (`signals.{EARLY_OBJECTION,UNHANDLED_OBJECTION,COMPETITOR_PLUS_COST,MISTARGETED_OFFER}, offered, outcome, converted, notConverted, reason, competitor, none`).
- [ ] **Step 6: Typecheck**; **Step 7: Commit** *(if authorized)* `feat(qa-disputes): evaluation tabs (QA, compliance, sentiment, business) in dispute detail`

---

## Task 6: Final audit

- [ ] All new `t('…')` keys exist in en **and** es `qa.disputes.json`; no hardcoded strings in touched components (the old page had several — replace them).
- [ ] No hex colors / inline styles / `any`; `previewRole === 'operationManager'` no longer used anywhere in `src/modules/qa/disputes/**`.
- [ ] `npm run typecheck` clean for touched files.
- [ ] *(Only if the user asks to run the app)* Manual checklist: Supervisor preview → sidebar Disputes shows **open count (Team 1 = 3)** → list shows only Team 1 disputes, chips filter by status, search by call ref; open #1001 → summary strip, player clips = 2 disputed markers, transcript marker click highlights item Q2 in the Dispute tab; item decisions → Approve → confirm → status Approved, delta badge, timeline DECIDED, agent Inbox gets the notification; QA tab highlights disputed questions; Compliance/Sentiment/Business tabs render; QA Manager preview → all teams + Supervisor column/filter + "Reviewed by"; Agent preview → own disputes only, no actions, pending notice; legacy `/qa/qamanager/disputes` and `/qa/disputes-list` redirect; dark mode; ES locale.

---

## Spec Coverage Check

- ✅ Supervisor and QA Manager receive all disputes from their agents / all agents; agent sees their own — Task 2 (role-aware list, routes, sidebar)
- ✅ Statuses open / accepted (approved) / rejected, with open-count sidebar counter — Tasks 1, 2
- ✅ Detail reuses the call-detail structure: player, transcript (with markers), the four evaluation types as tabs — Tasks 3, 5
- ✅ Agent's dispute message: what they complain about, why, and which aspects (items) they disagree with, with original vs proposed answers and per-item comments — Task 4
- ✅ Reviewer judgement: accept / reject / partial with note, persisted in mock, reflected in list/detail/timeline, agent notified — Tasks 1, 4
- ✅ Legacy empty screens retired via redirects; dead code paths fixed (`onMarkerClick`, role gate) — Tasks 2, 3
- ✅ Dark/light, i18n en+es, shared primitives — all tasks

## Execution Choice

1. **Subagent-Driven (recommended for Haiku):** one subagent per task in order 1→6, after the Dashboard Evaluation Views plan.
2. **Inline execution:** sequential in one session.
