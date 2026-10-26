# Agent Coaching page — find what is pending, what was assigned, and the next session at a glance

Target path for execution: `docs/superpowers/plans/2026-10-26-agent-coaching-page-redesign.md`

## Context

The agent Coaching page (`/qa/agent/coaching`, `src/modules/qa/coaching/AgentCoachingPage/`) is four equal cards: Next session, Open commitments, Impact of your sessions, History. It is ordered by data type, not by urgency. The design critique found:

- The **next session** card shows only day, time and topic. Coach, in-person or remote, location or meeting link, duration and talking points exist on the record but are not shown, and there is no "in 4 days".
- **Pending** has no summary. The count badge is neutral gray, action items (checkbox) and commitments (button) are mixed in one list, and the checkbox means "acknowledge" but reads as "done".
- **Assignments are invisible.** Once an action item is acknowledged it disappears from the page and only lives inside the session drawer.
- **Impact** sits above History, takes five rows, and repeats as a column in the History table. Its rows are clickable groups with no keyboard support.
- Bordered papers are nested inside cards, due dates are `xs` dimmed text, and the commitment button is `compact-xs`.

Decisions taken with the user (2026-10-26):

- **"Last assignments" = session action items.** Each recent session keeps its action items with their state after they are acknowledged. Linked learning material is not part of this block.
- **Layout: hero + two columns.** Next session as a full-width strip on top, Pending (left) and Recent sessions (right) below, History at the bottom.
- **Scope: page only.** `AgentSessionDetailDrawer` is unchanged.

Constraints from `DESIGN_ROLE.md`: mockup quality, no backend, no tests, no dev server, no commits unless asked. Both themes must work (Mantine variables, `light-dark()`). Same visual language as the new My Learning: hairline rows, no card-in-card, sentence case, area swatch (`AreaMark`), no uppercase labels, no `·` joined strings.

## Page structure

```
Coaching
Next session in 4 days. 3 things pending for you.            <- live status line (ContentContainer description)

+----------------------------------------------------------------------------------+
| In 4 days                          | Handling frustrated customers   [Sentiment]  |
| Tuesday 16 Sep, 14:00              | with Maria García (Supervisor)               |
| 45 min                             | In person, 2nd floor meeting room            |
|                                    | 4 talking points to review                   |
|                                    | [View session]  [Join call]                  |
+----------------------------------------------------------------------------------+

+------------------------------------------+  +-----------------------------------+
| Pending for you          3, 1 overdue    |  | Your last sessions                |
| Overdue by 3 days                        |  | 2 Sep  Needs assessment      >    |
|  Practise 3 open questions   [Acknowledge]|  |   2 of 3 items acknowledged       |
| Needs your commitment                    |  |   Commitment: committed 3 Sep     |
|  Frustrated customers        [I commit]  |  | 12 Aug Objection handling    >    |
| Due in 5 days                            |  |   3 of 3 items acknowledged       |
|  Review the empathy script   [Acknowledge]|  |   Commitment: pending            |
+------------------------------------------+  +-----------------------------------+

History                     Scores improved after 3 of 4 sessions     [Period]
| Date | Topic | Type | Coach | Status | Outcome | Impact (before to after + badge) |
```

Column ratio 7 / 5 on `md` and up, stacked below. No tabs.

## Data derivation (new, in `useAgentSessions.ts`)

Extend `AgentSessions` with `pending` and `recent`. Reuse `daysUntil` from `src/modules/qa/lms/helpers.ts` (it reads `NOW_ISO`, so mock "today" stays consistent) and `TODAY` from `src/modules/qa/analytics/constants.ts`.

```ts
export type PendingKind = 'ACTION_ITEM' | 'COMMITMENT';

export interface PendingItem {
	id: string; // item.id, or `commit-${session.id}`
	kind: PendingKind;
	session: CoachingSessionRecord;
	item?: CoachingActionItem; // ACTION_ITEM only
	dueDate: string | null; // null for COMMITMENT
	/** Days until due; negative = overdue; null for COMMITMENT. */
	daysLeft: number | null;
}
```

- `pending` = every entry of `openItems` as `ACTION_ITEM` plus every entry of `openCommitments` as `COMMITMENT`.
- Sort order: overdue items first (most overdue first), then commitments (newest session first), then the remaining items by due date ascending.
- `overdueCount` = number of `pending` with `daysLeft < 0`.
- `recent` = the last 3 sessions of `history` with `status === 'COMPLETED'` (already coach-led and newest first), each carrying its `actionItems` and `agentCommitment`. No new store state.
- Keep `openItems`, `openCommitments`, `impacts`, `history`, `next`, `all` as they are so nothing else breaks.

## Components

| File                                                                          | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AgentCoachingPage/AgentCoachingPage.tsx`                                     | Replace the 7/5 grid of Next + Commitments and the Impact card with: `NextSessionHero`, then `Grid` 7/5 of `PendingCard` and `RecentSessionsCard`, then `SessionHistoryTable`. Header `description` becomes the live status line (below). Keep the empty state and the drawer wiring unchanged.                                                                                                                                                                                                                                                                                                                                                                                                            |
| `AgentCoachingPage/NextSessionCard.tsx`                                       | Rewrite as the hero (keep file name and `onOpen` prop; add nothing else). Left cell: relative time as `Title order={2}` ("Today", "Tomorrow", "In 4 days"), date line, duration. Right cell, separated by a hairline: topic (`Title order={4}`) with `AreaMark` when `session.area`, coach and role, where (in person with `session.location`, or virtual), talking-point count, buttons "View session" (primary, `size='sm'`, opens the drawer) and "Join call" (`variant='default'`, `component='a'`, only when `session.meetingLink`, same https normalisation as the drawer). Empty: existing `next.empty` text inside the card, no icon.                                                              |
| `AgentCoachingPage/PendingCard.tsx` (new, replaces `OpenCommitmentsCard.tsx`) | `SectionCard` titled "Pending for you" with `headerActions` showing "3 pending, 1 overdue" as plain `Text size='sm'` (overdue part in the danger text colour, never a filled badge). Body: hairline rows built on the shared row styles from `~/modules/qa/lms/components/LearningRow.module.css` (`.row`, `.main`, `.due`). Row = status line first (overdue in danger text, "Due in 5 days", or "Needs your commitment"), then the action text or "Commit to what you agreed in {{topic}}", then "From {{topic}}, {{date}}" in `xs` dimmed. Action: `Button size='xs' variant='light'` "Acknowledge" for items, "I commit to this" for commitments (existing keys). Empty: existing `commitments.empty`. |
| `AgentCoachingPage/RecentSessionsCard.tsx` (new)                              | `SectionCard` "Your last sessions". One clickable row per `recent` session (a real `UnstyledButton`, so it is keyboard reachable) opening the drawer: date and topic, `AreaMark`, "2 of 3 items acknowledged", and the commitment line ("Committed on 3 Sep" or "Commitment pending"). Below the summary, each item as a one-line status: check icon if `acknowledgedByAgent`, clock icon with due date if not. Read only: acting happens in Pending. Empty: "No completed session yet."                                                                                                                                                                                                                   |
| `AgentCoachingPage/SessionHistoryTable.tsx`                                   | Keep the period filter already added. Add a `description` with the impact summary (`summarizeSessionImpacts(impacts)[0]`: "Scores improved after {{improved}} of {{measured}} sessions"). Impact cell shows `before → after` (dimmed, `xs`) next to `ImpactBadge`, using the matching `impacts` row. Use `AreaMark` instead of `AreaBadge` for the topic column so it matches My Learning.                                                                                                                                                                                                                                                                                                                 |
| `AgentCoachingPage/SessionImpactCard.tsx`                                     | Delete (after `rg "SessionImpactCard" src` shows no other importer).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `AgentCoachingPage/OpenCommitmentsCard.tsx`                                   | Delete after `PendingCard` is in place and imports are updated.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `AgentCoachingPage/useAgentSessions.ts`                                       | Add `pending`, `overdueCount`, `recent` as above.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

Reused as is: `SectionCard`, `BaseTable`, `ContentContainer`, `AgentSessionDetailDrawer`, `ImpactBadge` (`coaching/components`), `AreaMark` (`lms/components`), `daysUntil` / `formatDay` (`lms/helpers`), `summarizeSessionImpacts` (`coaching/postCoaching`), store actions `acknowledgeActionItem` / `acknowledgeCommitment`.

Status line (ContentContainer `description`), built from the derived data:

- With a next session: "Next session {{when}}. {{count}} pending for you." where `{{when}}` is "today", "tomorrow" or "in 4 days".
- No next session: "No session scheduled. {{count}} pending for you."
- Nothing pending: "Next session {{when}}. Nothing pending."

## i18n (namespace `qa.lms`, both `en` and `es`, under `agent.coaching`)

Add:

- `headline.withNext`, `headline.noNext`, `headline.clear`, `headline.when.today|tomorrow|inDays_one|inDays_other`
- `next.relative.today|tomorrow|inDays_one|inDays_other`, `next.with` ("with {{name}}"), `next.inPerson` ("In person, {{place}}"), `next.remote` ("Virtual"), `next.join` ("Join call"), `next.view` ("View session"), `next.points_one|points_other` ("{{count}} talking point to review"), `next.duration` ("{{count}} min")
- `pending.title`, `pending.summary` ("{{count}} pending, {{overdue}} overdue"), `pending.summaryNoOverdue` ("{{count}} pending"), `pending.overdueBy_one|_other`, `pending.dueIn_one|_other`, `pending.dueOn`, `pending.needsCommitment`, `pending.from` ("From {{topic}}, {{date}}"), `pending.acknowledge` ("Acknowledge")
- `recent.title` ("Your last sessions"), `recent.empty`, `recent.progress` ("{{done}} of {{total}} items acknowledged"), `recent.noItems`, `recent.committed` ("Committed on {{date}}"), `recent.commitmentPending` ("Commitment pending")
- `history.impactSummary` ("Scores improved after {{improved}} of {{measured}} sessions"), `history.impactSummaryNone`

Remove (dead after the rewrite): `impact.title`, `impact.description`, `impact.summary`, `impact.measured_*`, `impact.overall`, `commitments.title`, `commitments.from`, `commitments.commitTo` only if `rg` shows no remaining use. Keep `impact.verdict.*`, `commitments.empty`, `acknowledge`, `acknowledged`, `committed`, `itemAcknowledged` (the drawer and toasts use them).

Spanish copy mirrors the English structure ("Tu próxima sesión es en 4 días", "Pendiente para ti", "Tus últimas sesiones", "Reconozco este punto" is not used: keep the button text "Confirmar" for items and the existing "Me comprometo" for commitments). English and Spanish plural pairs use `_one` / `_other`; the zero case gets its own key rather than `_zero`.

## Accessibility and states

- All clickable rows are real buttons or links, not clickable groups.
- Due dates and statuses use `size='sm'`, not `xs`; overdue uses the danger text colour only, never a filled badge.
- Buttons are `size='xs'` minimum, not `compact-xs`.
- Hero stacks to one column below `62em`; the Pending and Recent columns stack below `62em`.
- Empty states: no next session, nothing pending, no completed sessions, no sessions in the chosen period (already added).

## Tasks (in order, typecheck after each)

1. `useAgentSessions.ts`: add `PendingItem`, `pending`, `overdueCount`, `recent`.
2. Locale keys in `en` and `es` `qa.lms.json` (additions first; removals last, after the `rg` check).
3. `NextSessionCard.tsx` hero + `NextSessionCard.module.css` (grid, hairline divider, small-screen stack).
4. `PendingCard.tsx` (and delete `OpenCommitmentsCard.tsx`).
5. `RecentSessionsCard.tsx`.
6. `SessionHistoryTable.tsx` (impact summary, impact cell, `AreaMark`).
7. `AgentCoachingPage.tsx` wiring and live status line; delete `SessionImpactCard.tsx`.
8. Sweep: `npm run typecheck`, `rg "tt='uppercase'"` in the folder, `rg " · "` in the new files, `rg "style={{"`, translation-key check against both locale files, no hex colours in new CSS.

## Verification

- `npm run typecheck`: no errors in `src/modules/qa/coaching` or `src/locales`. Errors in `dashboard/insights` and `src/views/Campaigns` are pre-existing and unrelated.
- Dev server is not started (DESIGN_ROLE.md). With the sample data for the agent persona (AGT-004, John Smith): the hero should read "In 4 days" for the 16 Sep 14:00 session "Handling frustrated customers"; Pending shows overdue items first, then commitments; Recent shows the last three completed sessions with item and commitment state.
- Light and dark mode: overdue text and the swatches keep contrast; hairlines use `--surface-border`.
- Interactions to check by hand: Acknowledge and "I commit to this" in Pending update the list and the status line at once; a row in Recent opens the existing drawer; the period filter still narrows History.

## Out of scope

- The session detail drawer and the agent dashboard coaching widget.
- Linked learning material on this page (it stays a link inside the drawer).
- Committing: the My Learning work is staged and the History period filter is unstaged; both wait for the user to fix the pre-existing typecheck errors.
