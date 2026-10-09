# Session detail: one decision control, one weakest aspect, and the context a coach actually needs

## Context

The session page (`src/modules/qa/coaching/CoachingSessionDetailPage/CoachingSessionDetailPage.tsx`) handles a weekly-batch proposal with three stacked buttons: "Schedule 1:1", "Switch to AI message" and "Dismiss". The user's model is different: the platform analysed the week and **decided** 1:1 or AI message; the supervisor can keep or flip that decision, exactly as the `1:1 | AI message` toggle in the weekly batch table already lets them. Buttons that read as separate actions, plus a "Dismiss" that quietly cancels, do not express that. Once a session has been switched to an AI message the page also shows no way back, because every right-column card is gated on `!isAi`.

The page also lacks what a supervisor needs before a 1:1: the agent's learning in progress (nothing is shown), what was agreed and committed in the previous session (the current "Since the previous session" card shows only a before → after score), and the supervisor's own private notes from that session (`notes` is typed in the form and never displayed anywhere). And the "Weakest aspect this week" block, renamed to singular earlier today, still renders up to two findings because `MAX_FINDINGS = 2`.

User asks (2026-10-09): make the decision exclusive (1:1 or AI message, platform's choice pre-selected), drop Dismiss; show the materials the agent is enrolled in; one weakest aspect only; the previous session's commitment; the supervisor's notes from the previous session.

Mode: Operate. Mockup-level; store already has `setBatchDecision`, `scheduleProposed`, the brief, assignments, enrollments.

---

## Critique summary

| Finding                                                                                                                         | Severity | Evidence                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| Three buttons for one binary decision; no way to switch an AI message back to a 1:1                                             | 🔴       | page `:485-543`; every right-column card gated on `!isAi`                                          |
| "Dismiss" cancels a session the platform proposed, leaving the batch row locked at CANCELLED                                    | 🟡       | `handleDismiss` → `dismissProposed` (store `:599`), batch item untouched                           |
| Supervisor notes are entered but never shown                                                                                    | 🟡       | `SessionForm.tsx:503-508`; no `sessions.detail.notes` key                                          |
| Previous session card shows a score delta only; action items, outcome, commitment and notes of that session are not surfaced    | 🟡       | `SessionBriefAside.tsx:97-130`                                                                     |
| Agent's open assignments and path enrolment are absent from the page                                                            | 🟡       | page loads `assignments` only for the session's own links                                          |
| Label says one weakest aspect, data carries two                                                                                 | 🟡       | `weeklyBatch.ts:37` `MAX_FINDINGS = 2`; `SessionBrief.tsx:106-150`; `WeeklyBatchPanel.tsx:155-198` |
| Commitment comment never shown; "Score since session" chart plots the last three monthly points, not the time since the session | 🟢       | page `:625-649`, `:156-161` (chart left as is)                                                     |

What works: `setBatchDecision` already flips a session both ways and keeps the batch row in step; the batch table's decision cell is the pattern to reuse; `scheduleProposed` now stores place and link; `isCoachLedCompleted` / `lastCompletedSession` already define "the previous session"; `effectiveStatus`, `dueLabel`, `pathProgress` and the LMS badges cover the learning card.

---

## Direction

1. **One decision, one control.** A "Coaching decision" card at the top of the right column for every batch session: `1:1 | AI message` segmented control with the platform's reason under it. 1:1 and still proposed → date, place and a single "Confirm 1:1" button in the same card. AI message → one line saying when it goes out. Locked once held, sent, missed or cancelled. No Dismiss.
2. **One weakest aspect.** The batch keeps only the most frequent incident; brief, table and evidence follow.
3. **Previous session, in full.** Topic and date, what was agreed, the action items with their done state, the agent's response (committed on / comment / not yet), and the supervisor's private notes. Shown for every coach-led session, whether or not it has a brief.
4. **Learning in progress.** The agent's open materials with status and due, and their path progress, with a link to the full assignments tab.

---

## Implementation plan

Execute in order; `npm run typecheck` after each phase.

### Phase 1 — One weakest aspect

- `src/modules/qa/coaching/weeklyBatch.ts:37`: `const MAX_FINDINGS = 1;`. Update the `buildFindings` doc comment (`:88`) to "The most frequent incident of the week, with the worst calls as evidence."
- `src/modules/qa/coaching/components/SessionBrief.tsx:106-150`: keep the block but render only the first finding:
  ```tsx
  const finding = brief.findings[0];
  …
  {!finding ? (<Text size='sm' c='dimmed'>{t('sessions.brief.noFindings')}</Text>) : (
  	<Group gap='md' wrap='nowrap' justify='space-between'> …same row as today, using `finding`… </Group>
  )}
  ```
- `src/modules/qa/coaching/components/WeeklyBatchPanel.tsx:155-198`: the column shows one badge: `const finding = info.row.original.session?.brief?.findings[0]; return finding ? <Badge …>{label(finding.issue)}</Badge> : <Text size='sm' c='dimmed'>{t('sessions.batch.clean')}</Text>;`. Delete `MAX_VISIBLE_FINDINGS` (`:46`), the `rest` / `Tooltip` branch and the `Tooltip` import if nothing else uses it. Remove `sessions.batch.more` from both locale files (grep confirms it is only used there).
- Seeds regenerate from `buildWeeklyBatch`, so no seed edit is needed.

### Phase 2 — Decision card on the session page

**2a. New `src/modules/qa/coaching/components/SessionDecisionCard.tsx`**

```tsx
interface SessionDecisionCardProps {
	session: CoachingSessionRecord;
	/** The batch row behind this session; null when the session did not come from a batch. */
	item: CoachingBatchItem | null;
	onDecisionChange: (decision: CoachingBatchDecision) => void;
	/** The 1:1 confirmation form (date, place, button) while the 1:1 is still proposed. */
	children?: ReactNode;
}
```

- `const decision: CoachingBatchDecision = item?.decision ?? (session.type === 'AI_MESSAGE' ? 'AI_MESSAGE' : 'ONE_ON_ONE');`
- `const locked = session.status === 'COMPLETED' || session.status === 'MISSED' || session.status === 'CANCELLED';`
- `SectionCard title={t('sessions.decision.title')} description={t('sessions.decision.hint')} padding='md'`, body `Stack gap='sm'`:
  1. Mantine `SegmentedControl size='sm' fullWidth value={decision} disabled={locked} data=[{ value: 'ONE_ON_ONE', label: t('sessions.batch.decisionShort.ONE_ON_ONE') }, { value: 'AI_MESSAGE', label: t('sessions.batch.decisionShort.AI_MESSAGE') }] onChange={(v) => onDecisionChange(v as CoachingBatchDecision)}`, wrapped in `Tooltip label={t('sessions.batch.locked')}` when locked (same as `WeeklyBatchPanel.tsx:199-245`).
  2. `item && <Text size='xs' c='dimmed'>{t('sessions.decision.reason', { reason: t(\`sessions.batch.reason.${item.reason}\`) })}</Text>` → "Platform's call: Critical this week".
  3. When `decision === 'AI_MESSAGE'`: one dimmed line, `session.status === 'COMPLETED' ? t('sessions.batch.sentOn', { date }) : t('sessions.decision.sendsOn', { date })` with `date = dayjs(session.date).format('ddd D MMM')`.
  4. When `decision === 'ONE_ON_ONE'`: `children` (the page passes the confirm form only while `status === 'PROPOSED'`; when SCHEDULED it passes a dimmed line `t('sessions.decision.confirmedFor', { date: dayjs(session.date).format('ddd D MMM, HH:mm') })`).

**2b. Page wiring (`CoachingSessionDetailPage.tsx`)**

- Load `const batches = useCoachingStore(selectBatches);` and `const batchItem = useMemo(() => batches.flatMap((b) => b.items).find((i) => i.sessionId === session?.id) ?? null, [batches, session?.id]);` (place the memo before the `if (!session)` return; use `session?.id`).
- New handler:
  ```ts
  const handleDecision = (decision: CoachingBatchDecision) => {
  	if (!batchItem || batchItem.decision === decision) return;
  	useCoachingStore.getState().setBatchDecision(session.id, decision);
  	const updated = useCoachingStore
  		.getState()
  		.sessions.find((s) => s.id === session.id);
  	notifySuccess(
  		decision === 'AI_MESSAGE'
  			? t('sessions.batch.queued', {
  					date: dayjs(updated?.date).format('ddd D MMM'),
  				})
  			: t('sessions.batch.proposedAgain')
  	);
  };
  ```
  Stay on the page (the session keeps its id, so the page re-renders with the new type).
- Delete `handleSendAi` and `handleDismiss`.
- Replace the PROPOSED card (`:485-543`) with:
  ```tsx
  {batchItem && (
  	<SessionDecisionCard session={session} item={batchItem} onDecisionChange={handleDecision}>
  		{session.status === 'PROPOSED' ? (
  			<Stack gap='sm'>
  				<DateTimePicker … as today … />
  				<SessionPlaceFields … as today … />
  				<Button fullWidth onClick={handleSchedule} disabled={!proposedDate}>{t('sessions.decision.confirm')}</Button>
  			</Stack>
  		) : session.status === 'SCHEDULED' ? (
  			<Text size='xs' c='dimmed'>{t('sessions.decision.confirmedFor', { date: dayjs(session.date).format('ddd D MMM, HH:mm') })}</Text>
  		) : null}
  	</SessionDecisionCard>
  )}
  ```
  `handleSchedule` keeps its toast `sessions.detail.proposed.scheduled` (key kept, renamed below) and still navigates back.
- Keep the SCHEDULED outcome card, read-only outcome card, commitment card, linked material and chart as they are (their `!isAi` gates are correct: they are about a held 1:1).

**2c. Store, `src/stores/qa/coachingStore.ts`**: remove `dismissProposed` (interface `:121`, impl `:599-606`) and `sendProposedAsAiMessage` (interface `:117`, impl `:575-597`); after 2b neither has a caller (grep to confirm). `setBatchDecision` and `scheduleProposed` stay.

### Phase 3 — Previous session, in full (`SessionBriefAside.tsx`)

Replace `PreviousSessionCard` with:

```tsx
export function PreviousSessionCard({
	previous,
	comparison,
}: {
	/** The agent's last completed coach-led session before this one; null when there is none. */
	previous: CoachingSessionRecord | null;
	/** How the aspect worked on then has moved since, when the brief measured it. */
	comparison: CoachingBriefPrevious | null;
});
```

Card `title={t('sessions.previous.title')}` ("Previous session"), `padding='md'`. When `previous` is null: `t('sessions.brief.noPrevious')`. Otherwise `Stack gap='md'`:

1. `Text size='sm' fw={600}`: `previous.topic`; `Text size='xs' c='dimmed'`: `dayjs(previous.date).format('D MMM YYYY')` · `previous.coachName`.
2. If `comparison`: the existing before → after line and verdict (unchanged markup).
3. **What was agreed** (`Caption` = `t('sessions.previous.agreed')`): `previous.outcome` or dimmed `t('sessions.previous.noOutcome')`.
4. **Commitments** (`Caption` `t('sessions.previous.commitments')`): `previous.actionItems.map` → `Group gap='xs' wrap='nowrap'` with `IconCheck size={14}` when `done`, else `IconClock size={14}` dimmed, then `Text size='sm'` item text and `Text size='xs' c='dimmed'` `dayjs(dueDate).format('D MMM')`. Empty → dimmed `t('sessions.previous.noCommitments')`.
5. **Agent's response** (`Caption` `t('sessions.previous.agentResponse')`): `agentCommitment.acknowledged ? t('sessions.detail.committedOn', { date: dayjs(acknowledgedAt).format('D MMM YYYY') }) : t('sessions.detail.notCommitted')`, plus `agentCommitment.comment` in a gray `Blockquote` when present.
6. **Supervisor notes** (`Caption` `t('sessions.previous.notes')`): `previous.notes` (pre-wrap) or dimmed `t('sessions.previous.noNotes')`.
   Import `Caption` from `./SessionBrief` (already exported, `SessionBrief.tsx:21`).

**Page**: compute once, before the return:

```ts
// The last completed coach-led session of this agent before this one, with or without a brief.
const previousSession = useMemo(() => {
	if (!session) return null;
	if (session.brief?.previous)
		return (
			sessions.find((s) => s.id === session.brief!.previous!.sessionId) ?? null
		);
	return lastCompletedSession(
		sessions.filter((s) => s.id !== session.id && s.date < session.date),
		session.agentId
	);
}, [sessions, session]);
```

(`lastCompletedSession` from `../postCoaching`.) Render `<PreviousSessionCard previous={previousSession} comparison={session.brief?.previous ?? null} />` for every `!isAi` session, not only when `session.brief` exists.

### Phase 4 — Learning in progress

New `src/modules/qa/coaching/components/AgentLearningCard.tsx`:

```tsx
interface AgentLearningCardProps {
	agentId: string;
	assignments: LmsAssignment[];
	enrollments: LmsPathEnrollment[];
	paths: LmsLearningPath[];
	contentById: Record<string, LmsContent>;
	onViewAll: () => void;
}
```

- `open = assignments.filter((a) => a.agentId === agentId && a.status !== 'COMPLETED').sort((a, b) => a.dueDate.localeCompare(b.dueDate))`; `const MAX_OPEN = 5`.
- `enrolled = enrollments.filter((e) => e.agentId === agentId).map((e) => ({ path: paths.find((p) => p.id === e.pathId), progress: pathProgress(path, e) })).filter(path)`.
- `SectionCard title={t('sessions.learning.title')} padding='md' headerActions={<Button size='xs' variant='subtle' onClick={onViewAll}>{t('sessions.learning.viewAll')}</Button>}`.
- Body: for each enrolled path: `Text size='sm'` title, `Text size='xs' c='dimmed'` `t('sessions.learning.modules', { done, total })`, `Progress size='xs' color='gray' value={percent} aria-label`. Then each open assignment (first `MAX_OPEN`): `Group justify='space-between' wrap='nowrap'` → left `Stack gap={0}`: title (`lineClamp={1}`), `Text size='xs' c='dimmed'` `t(LMS_FORMAT_META[format].labelKey, { ns: 'qa.lms' })` · `dueLabel(tLms, a)`; right `<AssignmentStatusBadge assignment={a} size='xs' />`. If more than `MAX_OPEN`: dimmed `t('sessions.learning.more', { count })`. Nothing at all → dimmed `t('sessions.learning.empty')`.
- `useTranslation(['qa.coaching', 'qa.lms'])`; `dueLabel` needs the `qa.lms`-scoped `t`: `const { t: tLms } = useTranslation('qa.lms');`.

**Page**: load `selectPaths` and `selectEnrollments` from `~/stores/qa/lmsStore`; render for `session.type !== 'GROUP'` (group sessions have several agents): `<AgentLearningCard agentId={session.agentId} … onViewAll={() => navigate(\`${coachingAgentPath(role, session.agentId)}?tab=assignments\`)} />` (`coachingAgentPath`from`../constants`).

### Phase 5 — Right column order

```
SessionDecisionCard            (batch sessions, any status)
SCHEDULED outcome card         (!isAi && SCHEDULED)          unchanged
read-only outcome card         (!isAi && held/missed/…)      unchanged
PreviousSessionCard            (!isAi)
AgentLearningCard              (type !== 'GROUP')
SuggestedMaterialCard          (session.brief)
Agent commitment               (!isAi && COMPLETED)          unchanged
Linked material                (linked.length)               unchanged
Score since session            (unchanged)
```

### Phase 6 — Seed notes so the demo shows them

`src/modules/qa/coaching/mockData.ts`, in `buildAgentHistoryAGT004` (the generated AGT-004 history, `notes: ''` at `:604`): add a `notes` array of three short supervisor notes and set `notes: missed ? '' : notes[i % notes.length]`, e.g. "Responds well to listening back to his own calls. Keep the next session hands-on.", "Tends to agree quickly, then slip. Check the commitment mid-week.", "Asked for the objection script in writing; sent after the session." The weekly batch keeps `notes: ''` (the supervisor writes notes when the session is held).

### Phase 7 — Copy (`src/locales/{en,es}/qa.coaching.json`, under `sessions`)

Remove `detail.proposed.{hint,schedule,sendAi,dismiss,sent,dismissed}` and `detail.proposed.title` (no caller after Phase 2; grep first), keep `detail.proposed.date` and `.scheduled`. Remove `batch.more`.

en additions:

```json
"decision": {
	"title": "Coaching decision",
	"hint": "The platform analysed the week and chose. Keep it, or switch it.",
	"reason": "Platform's call: {{reason}}",
	"confirm": "Confirm 1:1",
	"confirmedFor": "Confirmed for {{date}}",
	"sendsOn": "Goes to the agent's inbox {{date}}"
},
"previous": {
	"title": "Previous session",
	"agreed": "What was agreed",
	"noOutcome": "No outcome recorded.",
	"commitments": "Commitments",
	"noCommitments": "No action items were set.",
	"agentResponse": "Agent's response",
	"notes": "Supervisor notes",
	"noNotes": "No private notes from that session."
},
"learning": {
	"title": "Learning in progress",
	"viewAll": "View all",
	"modules": "{{done}} of {{total}} modules",
	"more_one": "+{{count}} more material",
	"more_other": "+{{count}} more materials",
	"empty": "Nothing in progress."
}
```

es:

```json
"decision": {
	"title": "Decisión de coaching",
	"hint": "La plataforma analizó la semana y decidió. Mantenlo o cámbialo.",
	"reason": "Criterio de la plataforma: {{reason}}",
	"confirm": "Confirmar 1:1",
	"confirmedFor": "Confirmada para el {{date}}",
	"sendsOn": "Llega a la bandeja del agente el {{date}}"
},
"previous": {
	"title": "Sesión anterior",
	"agreed": "Qué se acordó",
	"noOutcome": "Sin resultado registrado.",
	"commitments": "Compromisos",
	"noCommitments": "No se fijaron acciones.",
	"agentResponse": "Respuesta del agente",
	"notes": "Notas del supervisor",
	"noNotes": "Sin notas privadas de esa sesión."
},
"learning": {
	"title": "Aprendizaje en curso",
	"viewAll": "Ver todo",
	"modules": "{{done}} de {{total}} módulos",
	"more_one": "+{{count}} material más",
	"more_other": "+{{count}} materiales más",
	"empty": "Nada en curso."
}
```

`sessions.brief.previous` ("Since the previous session") becomes unused once the card is retitled; remove it too.

---

## Files touched

- `src/modules/qa/coaching/weeklyBatch.ts`, `components/SessionBrief.tsx`, `components/WeeklyBatchPanel.tsx` (1)
- New `components/SessionDecisionCard.tsx`; `CoachingSessionDetailPage/CoachingSessionDetailPage.tsx`; `src/stores/qa/coachingStore.ts` (2)
- `components/SessionBriefAside.tsx` (3)
- New `components/AgentLearningCard.tsx` (4)
- `src/modules/qa/coaching/mockData.ts` (6)
- `src/locales/{en,es}/qa.coaching.json` (7)

Do not touch: `SessionPlaceFields`, `MeetingLocationModal`, `SessionForm`, `setBatchDecision`, `scheduleProposed`, the agent-facing drawer.

## Out of scope (noted)

- "Score since session" still plots the last three monthly points; a true since-session series is a follow-up.
- Action items remain editable on any status but only saved by "Mark completed".
- Manually scheduled (non-batch) sessions show no decision card: the platform made no call on them.

## Verification

Per DESIGN_ROLE.md the dev server runs only if asked.

1. `npm run typecheck` passes.
2. Open a proposed batch session: the right column starts with "Coaching decision", the toggle on 1:1, "Platform's call: Critical this week", then date, In person / Virtual with its field, and one "Confirm 1:1" button. No Dismiss.
3. Flip to AI message: a toast says when it is queued, the page stays, the card now shows "Goes to the agent's inbox Tue 15 Sep", the left column shows the AI message. Flip back: the 1:1 form returns.
4. Open a completed 1:1: the toggle is disabled with the locked tooltip.
5. "Previous session" shows topic, date, coach, before → after (when the brief has it), what was agreed, commitments with done / pending marks, the agent's response and the supervisor notes (AGT-004 shows one of the seeded notes).
6. "Learning in progress" lists the agent's open materials with status and due, their path progress, and "View all" opens the agent's Assignments tab.
7. The brief shows exactly one weakest aspect; the batch table shows one badge per row.
8. Dark mode and narrow viewport: the right column stacks under the left; no horizontal scroll.
