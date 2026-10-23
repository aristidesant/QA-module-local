# Agent · Coaching page as the agent's session and commitment tracker

> On execution: copy this file to `docs/superpowers/plans/2026-10-23-agent-coaching-tracker.md` and follow the tasks in order. `npm run typecheck` after every task. No dev server, no tests, no commit unless asked. Prettier on touched files only. Strings in `qa.lms` (`agent.coaching.*`) en + es. Mock "today" is 2026-09-12.

## Context

The agent's Coaching page (`/qa/agent/coaching`, `src/modules/qa/coaching/AgentCoachingPage/AgentCoachingPage.tsx` → `src/modules/qa/lms/AgentLmsPage/tabs/AgentCoachingTab.tsx`) shows one card: the latest AI weekly review cut to 280 characters, opening a read-only drawer. The inbox already shows that review in full, with scores and material, and the dashboard shows the last completed 1:1. The page's subtitle still promises "scheduled sessions, past sessions and the commitments you've made", none of which it shows.

Decision with the user (2026-10-23): My Learning keeps all educational material; **Coaching becomes the place where the agent tracks their coaching sessions and what they committed to**. Four blocks: next session and preparation, commitments and action items (with acknowledgement), impact of past sessions, history table. No material on this page: a session with assignments only links to My Learning. The weekly AI review leaves this page (it lives in the inbox).

What exists and is unused today: `acknowledgeActionItem` / `acknowledgeCommitment` in `src/stores/qa/coachingStore.ts:662-696` (no callers); `sessionImpacts` in `src/modules/qa/coaching/postCoaching.ts:283` (before / after / verdict per completed session, agent views never read it); the seed gives John Smith (AGT-004) one scheduled session (`coa-a04-rule`, 16 Sep, talking points, two evidence calls, one linked assignment) and 12 historical 1:1s, the latest of which has an open action item and an unacknowledged commitment on purpose (`mockData.ts:588-591`).

Decided by me: the page keeps the `qa.lms` namespace and the existing `AgentSessionDetailDrawer` (extended with the acknowledge controls so the drawer and the page agree); the agent can acknowledge but never edit, complete or cancel (that stays with the coach); sessions are grouped by what the agent has to do, not by status.

---

## Layout

```
Title "Coaching"  ·  subtitle "Your sessions with your coach, what you committed to, and what changed after each one."

┌ Next session ───────────────────────────────────────────┐ ┌ Open commitments ─────────────────────┐
│ 16 Sep · 14:00 · 30 min · Maria García · In person      │ │ ◻ Walked through the objection script… │
│ Handling frustrated customers · Sentiment               │ │   from "Objection handling" · due 2 Jul │
│ Talking points (3)                                      │ │   [ I commit to this ]                  │
│ Evidence: call-001, call-104 (links)                    │ │ (empty: "Nothing open. Nice.")          │
│ "Material for this session is in My Learning →"         │ └───────────────────────────────────────┘
│ [ Open session ]                                        │
└─────────────────────────────────────────────────────────┘
┌ Impact of your sessions ────────────────────────────────────────────────────────────────────────┐
│ 4 improved · 1 held · 0 declined   (of 5 measured)                                                │
│ Objection handling · QA 76 → 84 · Improved      Needs assessment · QA 80 → 81 · Held   …          │
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
┌ History ─────────────────────────────────────────────────────────────────────────────────────────┐
│ BaseTable: Date · Topic · Type · Coach · Outcome · Impact   (row → drawer)                        │
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
```

`Grid` 7/5 for the first row, full width below. Monochrome like the other agent pages: status badges keep `SESSION_STATUS_COLOR` (already used in the drawer), verdict badges use green / gray / red light with an icon so colour is never alone.

---

## Files

New:

- `src/modules/qa/coaching/AgentCoachingPage/useAgentSessions.ts`
- `src/modules/qa/coaching/AgentCoachingPage/NextSessionCard.tsx`
- `src/modules/qa/coaching/AgentCoachingPage/OpenCommitmentsCard.tsx`
- `src/modules/qa/coaching/AgentCoachingPage/SessionImpactCard.tsx`
- `src/modules/qa/coaching/AgentCoachingPage/SessionHistoryTable.tsx`
- `src/modules/qa/coaching/components/ImpactBadge.tsx` (shared verdict badge)

Modified:

- `src/modules/qa/coaching/AgentCoachingPage/AgentCoachingPage.tsx` (assembles the four blocks)
- `src/modules/qa/coaching/components/AgentSessionDetailDrawer.tsx` (acknowledge controls, "Material in My Learning" link)
- `src/locales/{en,es}/qa.lms.json` (`agent.coaching.*`)

Deleted: `src/modules/qa/lms/AgentLmsPage/tabs/AgentCoachingTab.tsx` (its only consumer was this page).

---

## Task 1 · Data hook and shared badge

### `useAgentSessions.ts`

```ts
export interface AgentSessions {
	/** Every session the agent is part of (own, group, cohort), newest first, PROPOSED excluded. */
	all: CoachingSessionRecord[];
	/** The soonest SCHEDULED session from today on, or null. */
	next: CoachingSessionRecord | null;
	/** Action items not yet acknowledged, with their session, oldest due first. */
	openItems: { session: CoachingSessionRecord; item: CoachingActionItem }[];
	/** Completed coach-led sessions whose commitment is not acknowledged yet. */
	openCommitments: CoachingSessionRecord[];
	/** Impact rows of the agent's completed sessions, newest first. */
	impacts: SessionImpactRow[];
	/** Coach-led sessions that happened or were missed, newest first (the table). */
	history: CoachingSessionRecord[];
}
export const useAgentSessions = (agentId = AGENT_PERSONA.id): AgentSessions
```

- Reads `useCoachingStore(selectSessions)` and `selectCohorts`; the membership filter is the one in `AgentCoachingTab.tsx:25-36` (own id, `agentIds`, cohort).
- `next`: `status === 'SCHEDULED' && date.slice(0,10) >= TODAY`, sorted ascending, first.
- `openItems`: from `COMPLETED` sessions, `actionItems.filter(i => !i.acknowledgedByAgent)`, sorted by `dueDate`.
- `openCommitments`: `COMPLETED`, type not `AI_MESSAGE`, `!agentCommitment.acknowledged`.
- `impacts`: `sessionImpacts(all, TEAM_AGENTS).filter(r => r.agentId === agentId && r.kind === 'COACH_LED')` sorted by `day` desc (`TEAM_AGENTS` from `~/modules/qa/team/mockData`).
- `history`: type not `AI_MESSAGE`, status `COMPLETED | MISSED | CANCELLED`, newest first.
- All in one `useMemo` on `[sessions, cohorts, agentId]`.

### `components/ImpactBadge.tsx`

Props `{ verdict: ScorecardTrendVerdict | 'PENDING'; size?: 'xs' | 'sm' }`. `Badge variant='light'` with icon + text: IMPROVED green `IconTrendingUp`, SAME gray `IconMinus`, DECLINED red `IconTrendingDown`, PENDING gray outline `IconClock`. Labels `agent.coaching.impact.verdict.{IMPROVED,SAME,DECLINED,PENDING}`.

**Typecheck.**

---

## Task 2 · The four blocks

### `NextSessionCard.tsx` — props `{ session: CoachingSessionRecord | null; onOpen: (s) => void }`

`SectionCard` title `agent.coaching.next.title`, icon `IconCalendarEvent`. Empty: `agent.coaching.next.empty` ("No session scheduled. Your coach will book one when needed."). With a session:

- Line 1: `dayjs(date).format('ddd D MMM · HH:mm')` · `{durationMin} min` · coach name · modality badge (reuse `agent.coaching.modality.*`); `location` or meeting link as in the drawer.
- Line 2: topic (fw 600) + `AreaBadge` (already imported by the drawer, `~/modules/qa/triggers/components/AreaBadge` or wherever the drawer gets it: copy its import).
- Talking points list (first 3, "+N more" dimmed).
- Evidence calls as the drawer's badges (navigate `/qa/campaigns/2/calls/<id>`), only when any.
- If `linkedAssignmentIds.length > 0`: `Anchor` to `AGENT_LMS_PATH` with `agent.coaching.next.material` ("Material for this session is in My Learning").
- Footer `Button variant='default' size='xs'` `agent.coaching.next.open` → `onOpen(session)`.

### `OpenCommitmentsCard.tsx` — props `{ items; commitments; onAcknowledgeItem(sessionId, itemId); onCommit(sessionId) }`

`SectionCard` title `agent.coaching.commitments.title`, `headerActions` = count badge (items + commitments). Body:

- One `Paper withBorder p='xs'` per open action item: `Checkbox` (label = item text, `checked={false}`, `onChange` → `onAcknowledgeItem`), under it dimmed `agent.coaching.commitments.from {{topic}} · due {{date}}`. Checking it removes the row (state comes from the store).
- Then one row per open commitment: topic + date dimmed + `Button size='xs' variant='light'` `agent.coaching.acknowledge` ("I commit to this") → `onCommit(session.id)`; on success `notifySuccess(t('agent.coaching.committed'))`.
- Empty: `agent.coaching.commitments.empty` ("Nothing open. Everything you agreed to is acknowledged.").

### `SessionImpactCard.tsx` — props `{ rows: SessionImpactRow[]; onOpen(sessionId) }`

`SectionCard` title `agent.coaching.impact.title`, description `agent.coaching.impact.description` ("Your score on the session's aspect, the week after against the week before"). Header line: `summarizeSessionImpacts(rows)[0]` (COACH_LED) → `Group` of three small `Text`: `{{improved}} improved · {{same}} held · {{declined}} declined` with `agent.coaching.impact.measured {{count}}` dimmed. Then up to 5 rows (`Group justify='space-between'`): topic (fw 500) + day dimmed; `{{before}} → {{after}}` tabular with the dimension label (`DIMENSION_META` from `~/modules/qa/team/constants`, key `row.dimension`, or "Overall" when null); `ImpactBadge`. Row click → `onOpen`. Empty: `agent.coaching.impact.empty`.

### `SessionHistoryTable.tsx` — props `{ sessions; impacts; onOpen(session) }`

`BaseTable<CoachingSessionRecord>` (`density='compact'`, `enablePagination`, `pageSize={8}`, `getRowId`, `onRowClick`), columns via `createColumnHelper`: Date (`D MMM YYYY`), Topic (+ `AreaBadge` xs), Type (`agent.coaching.type.{ONE_ON_ONE,SIDE_BY_SIDE,GROUP,MICRO}`), Coach, Status (`SESSION_STATUS_COLOR` badge, `agent.coaching.status.*`), Outcome (dimmed, `lineClamp 1`), Impact (`ImpactBadge` from `impacts.find(r => r.sessionId === s.id)` or "—"). `initialSort` date desc.

### `AgentSessionDetailDrawer.tsx`

- New optional props `onAcknowledgeItem?: (itemId: string) => void; onCommit?: () => void`.
- Action items: when `!item.acknowledgedByAgent && onAcknowledgeItem`, the right side is a `Checkbox` instead of the clock icon.
- Commitment card: when not acknowledged and `onCommit`, show the `agent.coaching.acknowledge` button instead of the "Not committed yet" text.
- After the evidence card, when `linkedAssignmentIds.length > 0`: `Anchor` to `AGENT_LMS_PATH`, `agent.coaching.next.material`.

**Typecheck.**

---

## Task 3 · Page, cleanup, locale

### `AgentCoachingPage.tsx`

```tsx
const { next, openItems, openCommitments, impacts, history } = useAgentSessions();
const acknowledgeActionItem = useCoachingStore((s) => s.acknowledgeActionItem);
const acknowledgeCommitment = useCoachingStore((s) => s.acknowledgeCommitment);
const [detail, setDetail] = useState<CoachingSessionRecord | null>(null);
const open = (session) => setDetail(session);
const openById = (id) => setDetail(all.find(...) ?? null);
```

Render: `ContentContainer` title/description → `Grid` (`Grid.Col span={{ base: 12, md: 7 }}` NextSessionCard, `span 5` OpenCommitmentsCard) → `SessionImpactCard` → `SessionHistoryTable` → `AgentSessionDetailDrawer` with `onAcknowledgeItem={(itemId) => detail && acknowledgeActionItem(detail.id, itemId)}` and `onCommit={() => { if (detail) { acknowledgeCommitment(detail.id, null); notifySuccess(...) } }}`. The drawer reads the live session from the store (`all.find(s => s.id === detail.id)`) so a checkbox ticked inside it updates at once. If `all` is empty: single `EmptyState` `agent.coaching.empty`.

### Cleanup

- Delete `src/modules/qa/lms/AgentLmsPage/tabs/AgentCoachingTab.tsx`; `grep -rn AgentCoachingTab src` must be empty.
- Remove the unused locale keys `agent.coaching.latestMessage`, `latestMessageDescription`, `linkedMaterial`.

### Locale `qa.lms.json` → `agent.coaching` (en; es equivalents)

- `description`: "Your sessions with your coach, what you committed to, and what changed after each one."
- `next: { title: "Next session", empty: "No session scheduled. Your coach will book one when needed.", material: "Material for this session is in My Learning", open: "Open session", morePoints_one: "+{{count}} more point", morePoints_other: "+{{count}} more points" }`
- `commitments: { title: "Open commitments", empty: "Nothing open. Everything you agreed to is acknowledged.", from: "From {{topic}} · due {{date}}", commitTo: "Commit to what you agreed in {{topic}}" }`
- `committed: "Commitment saved"`, `itemAcknowledged: "Action item acknowledged"`
- `impact: { title: "Impact of your sessions", description: "Your score on the session's aspect, the week after against the week before.", summary: "{{improved}} improved · {{same}} held · {{declined}} declined", measured_one/_other: "of {{count}} measured", empty: "No completed session to measure yet.", overall: "Overall", verdict: { IMPROVED: "Improved", SAME: "Held", DECLINED: "Declined", PENDING: "Too soon" } }`
- `history: { title: "History", columns: { date, topic, type, coach, status, outcome, impact } }`
- `type: { ONE_ON_ONE: "1:1", SIDE_BY_SIDE: "Side by side", GROUP: "Group", MICRO: "Micro" }`
- es: "Tus sesiones con tu coach, lo que te comprometiste a hacer y qué cambió después de cada una." / "Próxima sesión", "No hay sesión programada. Tu coach agendará una cuando haga falta.", "El material de esta sesión está en Mi aprendizaje", "Abrir sesión", "+{{count}} punto más" / "+{{count}} puntos más" / "Compromisos abiertos", "Nada pendiente. Todo lo que acordaste está confirmado.", "De {{topic}} · vence {{date}}", "Confirma lo acordado en {{topic}}" / "Compromiso guardado", "Acción confirmada" / "Impacto de tus sesiones", "Tu puntaje en el aspecto de la sesión, la semana siguiente frente a la anterior.", "{{improved}} mejoraron · {{same}} se mantuvieron · {{declined}} bajaron", "de {{count}} medida(s)", "Aún no hay una sesión completada que medir.", "General", { "Mejoró", "Se mantuvo", "Bajó", "Muy pronto" } / "Historial", columnas "Fecha", "Tema", "Tipo", "Coach", "Estado", "Resultado", "Impacto" / tipos "1:1", "Lado a lado", "Grupal", "Micro".

**Typecheck**, locale parity for `qa.lms`.

---

## Verification

1. `npm run typecheck` clean; en/es parity for `qa.lms`; `grep -rn "AgentCoachingTab\|latestMessage" src` empty.
2. Vite SSR script (own `cacheDir` in the scratchpad, never the project's `node_modules/.vite`): load `useAgentSessions`-equivalent logic against the store: for AGT-004 expect `next` = `coa-a04-rule` (16 Sep), one open action item and one open commitment (both from `coa-a04-hist-1`), `history` ≈ 12 rows (completed + missed), `impacts` > 0 rows with before/after numbers. Call `acknowledgeActionItem` then `acknowledgeCommitment` on `coa-a04-hist-1` and confirm both lists go to 0.
3. Code review: the agent can acknowledge but not edit / complete / cancel; no material rendered on the page, only the link; colours only through Mantine props and `SESSION_STATUS_COLOR`; the drawer and the page read the same store so they never disagree.
