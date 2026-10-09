# Coaching Sessions tab: one batch table with an editable decision, calendar in a drawer, less chrome

## Context

The supervisor's Coaching → Sessions tab (`src/modules/qa/coaching/CoachingPage/tabs/SessionsTab.tsx` + `src/modules/qa/coaching/components/WeeklyBatchPanel.tsx` + `tabs/SessionsCalendar.tsx`) stacks four cards under the page header and five page KPIs: a card that only holds the Weekly batch / History toggle (and a second "New session" button), a batch card with a four-date description, a coaching-day select, a "Next batch" badge and four stat tiles, a second batch card with a seven-column table, and a month calendar roughly 45rem tall. The designer finds it confusing and overloaded, and cannot act on the one decision that matters (1:1 or AI message) from the table.

Product rule confirmed by the user (2026-10-09): a weekly batch is generated automatically from 100% of the team's calls; for each agent the platform proposes **1:1 with the supervisor** or **AI message to the agent's inbox**. The supervisor can flip that decision **from the table**, and the AI message is **sent on the stipulated coaching day**, not at generation. Weekly batch and History both stay. The calendar moves behind a button. The page should be scannable.

User decisions: decision toggle both ways until the coaching day; small segmented toggle per row; calendar in a side drawer; batch stat tiles → one summary line; header card → toolbar; batch table 7 → 5 columns; history filters 8 → 4 + "More".

Mode: Operate. Refinement within the incumbent identity (SectionCard, BaseTable, AppDrawer, quiet gray status badges from `sessionStatusBadge`).

---

## Critique summary

### First impression

Nine stat tiles (five page-level, four batch-level), three section descriptions of two lines each, a toggle in its own card, then a dense table and a calendar taller than the viewport. Nothing says "here are the 14 agents and what happens to each on Tuesday". The eye lands on the big empty month grid.

### Usability

| Finding                                                                                                                                     | Severity | Evidence                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| The decision (1:1 vs AI message) is read-only in the table; the only way to change it is to open each session page, and only 1:1 → AI       | 🔴       | `WeeklyBatchPanel.tsx:156-174`; `CoachingSessionDetailPage.tsx:458-507`                             |
| Changing a decision on the session page leaves the batch item stale, so the tiles double-count                                              | 🔴       | `coachingStore.ts:483-518` never touches `batches[].items[].decision`; `WeeklyBatchPanel.tsx:74-83` |
| AI messages are "sent" at generation (status COMPLETED, `date = generatedAt`), which contradicts the product rule                           | 🔴       | `weeklyBatch.ts:369-402`                                                                            |
| A whole card exists to hold the Weekly batch / History toggle, plus a second "New session" button the page header already has               | 🟡       | `SessionsTab.tsx:371-385`; `CoachingPage.tsx:249-255`                                               |
| Calendar occupies ~45rem at the bottom of the default view; scheduled sessions created manually appear nowhere else                         | 🟡       | `SessionsTab.tsx:395-400`, `SessionsCalendar.module.css:42-51`                                      |
| Four batch tiles repeat what the table shows; "1:1 scheduled" counts held sessions too                                                      | 🟡       | `WeeklyBatchPanel.tsx:281-302`                                                                      |
| History filter row has 7-8 controls; Status offers PROPOSED and SCHEDULED, which never match because they are filtered out before the table | 🟡       | `SessionsTab.tsx:273-367`, `:123-140`                                                               |
| Trend column header reuses `agents.columns.lastImpact` ("Last impact")                                                                      | 🟢       | `WeeklyBatchPanel.tsx:116`                                                                          |
| Filter state persists invisibly while in the batch view                                                                                     | 🟢       | `SessionsTab.tsx:66-76`                                                                             |

### Visual hierarchy

- **What draws the eye first**: the month grid, because it is the largest shape. Wrong: the batch table is the work surface.
- **Reading flow**: title card → batch card (dates, select, badge, 4 tiles) → table card → calendar. Four cards with four title/description pairs before any row.
- **Emphasis**: every card has the same weight; the one action per row (confirm a 1:1 or switch) has no control at all.

### Consistency

| Element           | Issue                                                                                                                                                                           | Fix                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Status colors     | `SESSION_STATUS_COLOR` (violet/blue/green) vs `sessionStatusBadge` (quiet gray) vs a local map in `CoachingLmsTab.tsx:36` vs hardcoded red in `SessionsCalendar.module.css:119` | this tab keeps `sessionStatusBadge`; note the others as follow-up |
| AI-message coach  | hardcoded `'QAM-001' / 'Elena Ruiz'` (`weeklyBatch.ts:369-370`)                                                                                                                 | out of scope, noted                                               |
| Hardcoded English | `'Weekly QA review'`, activity strings in the store                                                                                                                             | out of scope, noted                                               |

### Accessibility

- Row click opens the session; an inline control inside the row must stop the click from bubbling and stay keyboard-reachable.
- Quiet gray status badges rely on the label, not color. Keep.
- The calendar's "+N more" and chips are buttons already; the drawer must trap focus (Mantine Drawer does).

### What works

- `sessionStatusBadge` (`constants.ts:118-128`) and `QuietIndicators` (`TierScore`, `ScoreTrendText`, `CRITICAL_ISSUES`) already encode "color only for exceptions". Reuse them unchanged.
- The batch model is sound: one `CoachingBatchItem` per agent with `decision`, `reason` and a linked session; `buildWeeklyBatch` already creates the 1:1 at `coachingDate 10:00`.
- Row click → session page with the pre-loaded brief is the right drill-down.
- `SessionBrief`'s `Caption` / `StripStat` give a one-line stat strip pattern to reuse.

### Heuristic snapshot (Operate, 0-4)

| #   | Heuristic              | Score     | Note                                                                             |
| --- | ---------------------- | --------- | -------------------------------------------------------------------------------- |
| 1   | Visibility of status   | 2         | tiles double-count; "Sent" shown for messages that per the rule are not sent yet |
| 2   | Match real world       | 2         | "Next batch Mon 14 Sep 08:00" is system talk; four dates in one sentence         |
| 3   | User control           | 1         | the one decision per row is not editable here                                    |
| 4   | Consistency            | 2         | duplicate "New session"; three status color maps                                 |
| 5   | Error prevention       | 3         | nothing destructive on the tab                                                   |
| 6   | Recognition vs recall  | 3         | labels everywhere                                                                |
| 7   | Flexibility            | 2         | no bulk confirm; history filters many but weak                                   |
| 8   | Aesthetic & minimalist | 1         | four cards, nine tiles, calendar by default                                      |
| 9   | Error recovery         | 3         | n/a mostly                                                                       |
| 10  | Help                   | 2         | long explanatory descriptions instead of help where needed                       |
|     | **Total**              | **21/40** | Acceptable, driven down by #3 and #8                                             |

---

## Direction

1. **One toolbar, not a card.** Under the tabs: `Weekly batch | History` on the left; `Calendar (3 this week)` and nothing else on the right. The page header keeps "New session".
2. **One batch card.** Title "Weekly batch · 31 Aug – 6 Sep", one line of facts, one line of counts, the coaching-day select in the header, then the table. No tiles.
3. **The row is the decision.** Columns: Agent · Scorecard (with trend) · Weak aspects (3 + N) · **Decision** (segmented `1:1 | AI message`, reason under it) · Status (badge + date line). Editable until the coaching day; locked once held, sent, missed or cancelled.
4. **AI messages are sent on the coaching day.** Generation creates them as `SCHEDULED` for `coachingDate 09:00`; the status line reads "Sends Tue 15 Sep". The store flips them to COMPLETED only through an explicit send (seed data marks last week's as sent).
5. **Calendar is a drawer.** `AppDrawer` from the toolbar button; the existing `SessionsCalendar` inside, unchanged.
6. **History is a table with four filters.** Search (agent or topic), date range, status, type; Modality / Coach / Team behind a "More filters" popover. Includes scheduled sessions (they had nowhere else to show).

---

## Implementation plan

Execute in order; `npm run typecheck` after each phase.

### Phase 1 — Model and store: the decision is editable, AI messages send on the coaching day

**1a. `src/modules/qa/coaching/weeklyBatch.ts`** (AI-message branch, `:369-402`):

- `date: input.generatedAt` → `date: \`${input.coachingDate}T09:00:00Z\``
- `status: 'COMPLETED'` → `status: 'SCHEDULED'`
- The `existing` lookup (`:351-356`) compares `s.date === input.generatedAt`; change it to `s.batchId === input.id || s.date === input.generatedAt` so previously seeded messages are still reused.

**1b. `src/stores/qa/coachingStore.ts`**

- Extract the body of `sendProposedAsAiMessage` (`:483-518`) into a module-level helper:

  ```ts
  /** Turns a proposed or scheduled 1:1 into the AI message that goes out on `sendAt`. */
  const toAiMessage = (
  	session: CoachingSessionRecord,
  	sendAt: string
  ): CoachingSessionRecord => {
  	const profile = useTeamStore.getState().profiles[session.agentId];
  	const content = useLmsStore.getState().content;
  	const titles = (session.brief?.suggestedContentIds ?? [])
  		.map((cid) => content.find((c) => c.id === cid)?.title)
  		.filter((x): x is string => Boolean(x));
  	return {
  		...session,
  		type: 'AI_MESSAGE',
  		modality: null,
  		durationMin: 0,
  		date: sendAt,
  		status: 'SCHEDULED',
  		talkingPoints: [],
  		aiMessage: profile
  			? buildAiCoachingMessage(profile, 'Weekly coaching review', titles)
  			: (session.brief?.approach ?? ''),
  	};
  };

  /** Turns an AI message that has not gone out yet back into a proposed 1:1 on the coaching day. */
  const toOneOnOne = (
  	session: CoachingSessionRecord,
  	coachingDate: string,
  	coach: { id: string; name: string }
  ): CoachingSessionRecord => ({
  	...session,
  	type: 'ONE_ON_ONE',
  	modality: 'IN_PERSON',
  	durationMin: 30,
  	date: `${coachingDate}T10:00:00Z`,
  	status: 'PROPOSED',
  	coachId: coach.id,
  	coachName: coach.name,
  	coachRole: 'SUPERVISOR',
  	talkingPoints: session.brief?.findings.map((f) => f.issue) ?? [],
  	aiMessage: null,
  });

  /** Keeps the batch item in step with its session, so the panel counts never drift. */
  const withItemDecision = (
  	batches: CoachingWeeklyBatch[],
  	sessionId: string,
  	decision: CoachingBatchDecision
  ) =>
  	batches.map((b) => ({
  		...b,
  		items: b.items.map((i) =>
  			i.sessionId === sessionId ? { ...i, decision } : i
  		),
  	}));
  ```

- New action (declare in the state interface next to `sendProposedAsAiMessage`, implement next to it):
  ```ts
  setBatchDecision: (sessionId: string, decision: CoachingBatchDecision) => void;
  ```
  ```ts
  setBatchDecision: (sessionId, decision) => {
  	const session = get().sessions.find((s) => s.id === sessionId);
  	const batch = get().batches.find((b) => b.items.some((i) => i.sessionId === sessionId));
  	if (!session || !batch) return;
  	// Only a decision that has not happened yet can change.
  	if (session.status === 'COMPLETED' || session.status === 'MISSED' || session.status === 'CANCELLED') return;
  	// Send on the batch's coaching day, or on the next one if that day has passed.
  	const coachingDate =
  		batch.coachingDate > TODAY ? batch.coachingDate : nextBatchAt(get().coachingDay).coachingDate;
  	const next =
  		decision === 'AI_MESSAGE'
  			? toAiMessage(session, `${coachingDate}T09:00:00Z`)
  			: toOneOnOne(session, coachingDate, { id: batch.supervisorId, name: session.brief ? SUPERVISOR_PERSONA.name : session.coachName });
  	set((s) => ({
  		sessions: s.sessions.map((x) => (x.id === sessionId ? next : x)),
  		batches: withItemDecision(s.batches, sessionId, decision),
  	}));
  	get().logActivity({
  		type: decision === 'AI_MESSAGE' ? 'SESSION_COMPLETED' : 'SESSION_SCHEDULED',
  		agentId: next.agentId,
  		agentName: next.agentName,
  		title: decision === 'AI_MESSAGE' ? `Coaching message queued: ${next.topic}` : `1:1 proposed: ${next.topic}`,
  		description: `${next.coachName} · decision changed from the weekly batch`,
  		area: next.area,
  		link: '?tab=sessions',
  	});
  },
  ```
  Imports needed in the store: `TODAY` from `~/modules/qa/analytics/constants`, `nextBatchAt` from `~/modules/qa/coaching/weeklyBatch`, `SUPERVISOR_PERSONA` from `~/modules/qa/team/constants`, `CoachingBatchDecision`, `CoachingWeeklyBatch` types. Check for an import cycle (`weeklyBatch.ts` must not import the store; it does not today).
- `sendProposedAsAiMessage` becomes: `const next = toAiMessage(session, NOW_ISO)` with `status: 'COMPLETED'` overridden (`{ ...toAiMessage(session, NOW_ISO), status: 'COMPLETED' }`), plus `batches: withItemDecision(s.batches, id, 'AI_MESSAGE')` in its `set`. Keep its activity/notification lines.
- `scheduleProposed` (`:457-481`): add `batches: withItemDecision(s.batches, id, 'ONE_ON_ONE')` to its `set`.

**1c. Seeds, `src/modules/qa/coaching/mockData.ts:869-876`**: last week's batch (coaching day 8 Sep, already past on the demo date 12 Sep) must show sent messages and one pending switch. Replace the `BATCH_SESSIONS` map with:

```ts
const PROPOSALS = WEEKLY_BATCH.created
	.filter((s) => s.status === 'PROPOSED')
	.map((s) => s.id);
const BATCH_SESSIONS = WEEKLY_BATCH.created.map((s) => {
	// The coaching day of this run has passed: its AI messages went out that morning.
	if (s.type === 'AI_MESSAGE') return { ...s, status: 'COMPLETED' as const };
	// Demo state on 12 Sep: the first proposal was scheduled for the next coaching day…
	if (s.id === PROPOSALS[0])
		return { ...s, status: 'SCHEDULED' as const, date: '2026-09-15T10:00:00Z' };
	// …and the second was switched to an AI message that sends on that day.
	if (s.id === PROPOSALS[1])
		return {
			...s,
			type: 'AI_MESSAGE' as const,
			modality: null,
			durationMin: 0,
			status: 'SCHEDULED' as const,
			date: '2026-09-15T09:00:00Z',
			talkingPoints: [],
			aiMessage: s.brief?.approach ?? '',
		};
	return s;
});
```

and patch the batch items so the second proposal's item reads `decision: 'AI_MESSAGE'`:

```ts
const SEED_BATCH: CoachingWeeklyBatch = {
	...WEEKLY_BATCH.batch,
	items: WEEKLY_BATCH.batch.items.map((i) =>
		i.sessionId === PROPOSALS[1] ? { ...i, decision: 'AI_MESSAGE' } : i
	),
};
export const COACHING_BATCH_SEEDS: CoachingWeeklyBatch[] = [SEED_BATCH];
```

**1d. Session page, `CoachingSessionDetailPage.tsx:210-216`**: "Send as AI message" now queues for the coaching day: call `setBatchDecision(session.id, 'AI_MESSAGE')` when `session.batchId` is set, else keep `sendProposedAsAiMessage`. Relabel `sessions.detail.proposed.sendAi` → en "Switch to AI message" / es "Cambiar a mensaje IA", and `.sent` → en "Coaching message queued for the coaching day" / es "Mensaje de coaching programado para el día de coaching".

### Phase 2 — Toolbar instead of the header card (`SessionsTab.tsx`)

Replace the first `SectionCard` (`:371-385`) with:

```tsx
<Group justify='space-between' align='center' wrap='wrap' gap='sm'>
	{segmented}
	<Button
		variant='default'
		size='sm'
		leftSection={<IconCalendarEvent size={16} />}
		onClick={() => setCalendarOpen(true)}
	>
		{t('sessions.calendar.open', { count: thisWeekCount })}
	</Button>
</Group>
```

- Remove the duplicate "New session" button and the `onCreate` prop (also drop it where `CoachingPage.tsx:385-396` passes it).
- `thisWeekCount` = scheduled sessions whose date falls in the current week of `TODAY` (`dayjs(TODAY).startOf('week')`…`endOf('week')`), computed with `useMemo` from `calendarSessions`.
- Add `const [calendarOpen, setCalendarOpen] = useState(false);`.
- The segmented control keeps its two options; the history filters move into the History card (Phase 4).

### Phase 3 — One batch card with an editable decision (`WeeklyBatchPanel.tsx`)

**3a. Card chrome.** Delete the first `SectionCard` and the `SimpleGrid` of `StatCard`s (`:261-303`). Keep one `SectionCard`:

- `icon={IconSparkles}`
- `title={t('sessions.batch.titleWeek', { from, to })}` → "Weekly batch · 31 Aug – 6 Sep"
- `description`: two short lines rendered as children of `description` (a `Stack gap={2}`):
  - `t('sessions.batch.facts', { generated: 'Mon 7 Sep 08:00', coaching: 'Tue 8 Sep', next: 'Mon 14 Sep' })` → "Generated Mon 7 Sep 08:00 · coaching Tue 8 Sep · next batch Mon 14 Sep"
  - `t('sessions.batch.summary', { analysed, oneOnOne, toConfirm, ai })` → "14 agents analysed · 4 get a 1:1 (2 to confirm) · 10 get the AI message"
    - `analysed = rows.length`; `oneOnOne = rows.filter(r => r.decision === 'ONE_ON_ONE').length`; `toConfirm = rows.filter(r => r.session?.status === 'PROPOSED').length`; `ai = rows.filter(r => r.decision === 'AI_MESSAGE').length`.
- `headerActions={coachingDaySelect}` (keep the select; drop the "Next batch" badge, which now lives in the facts line).
- Body: the table. Remove the `sessions.batch.agents` / `agentsDescription` card; move the one useful sentence of `agentsDescription` into a `title` tooltip on the Agent header? No: drop it. Row click is discoverable from the cursor.

**3b. Columns (5).**

1. **Agent** unchanged (`:86-98`).
2. **Scorecard**: `TierScore` on the first line, `ScoreTrendText` (`size='xs'`) under it. Delete the separate trend column (`:114-127`). Header `t('agents.columns.scorecard')`.
3. **Weak aspects**: as today, but `findings.slice(0, 3)` and, when more, a gray outline badge `+{n}` with a `Tooltip` listing the rest.
4. **Decision**: new cell.
   ```tsx
   helper.accessor('decision', {
   	header: t('sessions.batch.columns.decision'),
   	cell: (info) => {
   		const row = info.row.original;
   		const status = row.session?.status;
   		const locked =
   			!status ||
   			status === 'COMPLETED' ||
   			status === 'MISSED' ||
   			status === 'CANCELLED';
   		return (
   			<Stack gap={2}>
   				{/* Stop the row click: the toggle is the row's own action. */}
   				<div
   					onClick={(e) => e.stopPropagation()}
   					onKeyDown={(e) => e.stopPropagation()}
   				>
   					<Tooltip
   						label={t('sessions.batch.locked')}
   						disabled={!locked}
   						withArrow
   					>
   						<SegmentedControl
   							size='xs'
   							value={row.decision}
   							disabled={locked}
   							aria-label={t('sessions.batch.columns.decision')}
   							onChange={(v) =>
   								setBatchDecision(row.sessionId, v as CoachingBatchDecision)
   							}
   							data={[
   								{
   									value: 'ONE_ON_ONE',
   									label: t('sessions.batch.decisionShort.ONE_ON_ONE'),
   								},
   								{
   									value: 'AI_MESSAGE',
   									label: t('sessions.batch.decisionShort.AI_MESSAGE'),
   								},
   							]}
   						/>
   					</Tooltip>
   				</div>
   				<Text size='xs' c='dimmed'>
   					{t(`sessions.batch.reason.${row.reason}`)}
   				</Text>
   			</Stack>
   		);
   	},
   });
   ```
   Use Mantine `SegmentedControl` (not `AppSegmentedControl`, which has no `disabled` per item and no `aria-label` passthrough check); `const setBatchDecision = useCoachingStore((s) => s.setBatchDecision);`.
5. **Status** (merge of status + date, `:175-225`): badge on the first line, a dimmed `xs` line under it:
   - AI message + SCHEDULED → `t('sessions.batch.sendsOn', { date: 'Tue 15 Sep' })` "Sends Tue 15 Sep"
   - AI message + COMPLETED → `t('sessions.batch.sentOn', …)` "Sent Tue 8 Sep"
   - 1:1 + PROPOSED → `t('sessions.batch.suggestedDate', …)` "Suggested Tue 15 Sep, 10:00"
   - otherwise the plain `ddd D MMM, HH:mm`.

**3c. Sort.** Keep `initialSort` by scorecard ascending so the agents needing attention come first.

### Phase 4 — Calendar drawer and the History card (`SessionsTab.tsx`)

**4a. Drawer**, rendered at the end of the tab's root `Stack`:

```tsx
<AppDrawer
	opened={calendarOpen}
	onClose={() => setCalendarOpen(false)}
	size='75%'
	title={t('sessions.calendar.title')}
	description={t('sessions.calendar.description')}
	icon={<IconCalendarEvent size={18} />}
>
	<SessionsCalendar
		sessions={calendarSessions}
		onOpen={(id) => {
			setCalendarOpen(false);
			onOpen(id);
		}}
	/>
</AppDrawer>
```

`import { AppDrawer } from '~/components/AppDrawer';` (named export, as `CohortDrawer.tsx:7` does). `AppDrawerProps extends DrawerProps`, so `size='75%'` is forwarded; Mantine `Drawer` accepts any CSS width string. Below `48em` the calendar's own CSS already collapses cells.

Verified: `BaseTable` fires `onRowClick` from the `<tr>` `onClick` and from `onKeyDown` on Enter / Space (`BaseTable.tsx:391-409`), so the `stopPropagation` wrapper in 3b covers both mouse and keyboard. Remove the calendar `SectionCard` from the batch view (`:395-400`).

**4b. History card.** Keep `SectionCard title=sessions.history.title`, drop its description. Above the table, a filter row with four controls:

- `TextInput` search `w={240}` `leftSection={<IconSearch size={16}/>}` placeholder `t('sessions.filters.search')` matching `agentName` or `topic` (case-insensitive). Replaces the Agent and Topic selects.
- `DatePickerInput type='range'` as today, `w={250}`.
- Status `Select` `w={150}` with options `['SCHEDULED','COMPLETED','MISSED','CANCELLED']` only.
- Type `Select` `w={150}` as today.
- A `Popover` opened by `<Button variant='default' size='sm' leftSection={<IconAdjustments size={16}/>}>{t('sessions.filters.more')}{activeMore > 0 ? ` (${activeMore})` : ''}</Button>`; its dropdown is a `Stack gap='sm' w={220}` holding the Modality, Coach and (qa-manager only) Team selects, each `clearable`, plus a subtle "Clear" button.
- Data: `history = filtered.filter(s => s.status !== 'PROPOSED').sort(date desc)` — scheduled sessions are now included (they had nowhere else to show once the calendar moved).
- Columns 9 → 6: Date · Agent (group icon + team) · Type (modality under) · Topic (aspect + sub-item under, replacing the separate Aspect column) · Status (follow-up date under it when set, replacing the Follow-up column) · Commitment. Coach column only when `role === 'qa-manager'`.
- Reset the filter state when the view switches to `batch` (`useEffect` on `view`), so hidden filters never narrow the history silently.

### Phase 5 — Copy (`src/locales/{en,es}/qa.coaching.json`, under `sessions`)

en additions / changes:

```json
"calendar.open_one": "Calendar · {{count}} this week",
"calendar.open_other": "Calendar · {{count}} this week",
"filters.search": "Search agent or topic",
"filters.more": "More filters",
"filters.clear": "Clear",
"batch.titleWeek": "Weekly batch · {{from}} – {{to}}",
"batch.facts": "Generated {{generated}} · coaching {{coaching}} · next batch {{next}}",
"batch.summary": "{{analysed}} agents analysed · {{oneOnOne}} get a 1:1 ({{toConfirm}} to confirm) · {{ai}} get the AI message",
"batch.decisionShort": { "ONE_ON_ONE": "1:1", "AI_MESSAGE": "AI message" },
"batch.locked": "Already held or sent — the decision can't change",
"batch.sendsOn": "Sends {{date}}",
"batch.more": "+{{count}}"
```

es:

```json
"calendar.open_one": "Calendario · {{count}} esta semana",
"calendar.open_other": "Calendario · {{count}} esta semana",
"filters.search": "Buscar agente o tema",
"filters.more": "Más filtros",
"filters.clear": "Limpiar",
"batch.titleWeek": "Lote semanal · {{from}} – {{to}}",
"batch.facts": "Generado {{generated}} · coaching {{coaching}} · próximo lote {{next}}",
"batch.summary": "{{analysed}} agentes analizados · {{oneOnOne}} tendrán 1:1 ({{toConfirm}} por confirmar) · {{ai}} reciben el mensaje IA",
"batch.decisionShort": { "ONE_ON_ONE": "1:1", "AI_MESSAGE": "Mensaje IA" },
"batch.locked": "Ya realizada o enviada — la decisión no puede cambiar",
"batch.sendsOn": "Se envía {{date}}",
"batch.more": "+{{count}}"
```

Remove now-unused keys in both files: `sessions.description`, `sessions.filters.agenda|today|all|upcoming|past|agent|topic`, `sessions.todayTitle|thisWeek|later|past`, `sessions.batch.description|next|agents|agentsDescription|kpi.*`, `sessions.history.description`, `sessions.columns.area|followUp`. Update `sessions.detail.proposed.sendAi` and `.sent` per 1d.

---

## Files touched

- `src/modules/qa/coaching/weeklyBatch.ts` (1a)
- `src/stores/qa/coachingStore.ts` (1b)
- `src/modules/qa/coaching/mockData.ts` (1c)
- `src/modules/qa/coaching/CoachingSessionDetailPage/CoachingSessionDetailPage.tsx` (1d, one handler + two labels)
- `src/modules/qa/coaching/CoachingPage/tabs/SessionsTab.tsx` (2, 4)
- `src/modules/qa/coaching/components/WeeklyBatchPanel.tsx` (3)
- `src/modules/qa/coaching/CoachingPage/CoachingPage.tsx` (drop `onCreate` prop)
- `src/locales/{en,es}/qa.coaching.json` (5)

Do not touch: `SessionsCalendar.tsx` / `.module.css`, `QuietIndicators.tsx`, `sessionStatusBadge`, `BaseTable`, `SectionCard`, `AppDrawer`, the five page-level KPIs in `CoachingPage.tsx` (shared by every tab).

## Out of scope (noted)

- Three status color maps across coaching (`SESSION_STATUS_COLOR`, `sessionStatusBadge`, `CoachingLmsTab.tsx:36`) and the hardcoded red in the calendar CSS.
- Hardcoded `'QAM-001' / 'Elena Ruiz'` coach and English strings in `weeklyBatch.ts` and the store.
- A bulk "Confirm all 1:1s" action; the qa-manager seeing more than one supervisor's batch (`WeeklyBatchPanel` keeps `[0]`).
- Dead code at `CoachingPage.tsx:205-213`.

## Verification

Per DESIGN_ROLE.md the dev server runs only if asked.

1. `npm run typecheck` passes.
2. `/qa/supervisor/coaching?tab=sessions`: under the tabs there is one row with `Weekly batch | History` and a `Calendar · N this week` button; no "Coaching sessions" card; the page header still has "New session".
3. The batch is one card titled "Weekly batch · 31 Aug – 6 Sep" with two dimmed lines (facts, counts), the coaching-day select in the header, and a 5-column table. No stat tiles, no calendar below.
4. Rows: AI messages from last week read "Sent Tue 8 Sep" with the toggle disabled and a tooltip; the first proposal reads "Scheduled · Tue 15 Sep, 10:00" with the toggle enabled; the second reads "AI message · Sends Tue 15 Sep" with the toggle on AI message.
5. Flip a proposed 1:1 to "AI message": the status cell changes to "Scheduled · Sends Tue 15 Sep", the counts line updates (one fewer 1:1, one more AI message), the row does **not** navigate. Flip it back: "Proposed · Suggested Tue 15 Sep, 10:00". Click elsewhere on the row: the session page opens, and its proposed card shows "Switch to AI message".
6. Click "Calendar": a right drawer about three quarters wide shows the month grid; clicking a chip closes the drawer and opens the session.
7. History: one search box, date range, status, type and a "More filters" button; the table lists scheduled sessions too; Status never offers "Proposed"; switching back to Weekly batch and returning shows cleared filters.
8. Dark mode: drawer, toggle and badges remain legible. Narrow viewport (600px): toolbar wraps, the drawer is full width, table scrolls horizontally.

---

## Addendum: corrections from the independent review (apply while implementing the phases above)

The review verified the table and drawer mechanics against the code. Where it differs from the plan, the plan's product rule wins: the AI message goes out on the coaching day, so the review's "send now, status COMPLETED" variant of `toAiMessage` is **not** used.

**A1. Coach name when converting an AI message back to a 1:1 (Phase 1b, `toOneOnOne`).** Replace the placeholder expression with a lookup from the batch's supervisor, never the viewer, so a QA manager flipping a row still produces a supervisor-led 1:1:

```ts
coachName: TEAM_SUPERVISORS.find((s) => s.id === batch.supervisorId)?.name ?? SUPERVISOR_PERSONA.name,
```

Import `TEAM_SUPERVISORS` next to `TEAM_AGENTS` from `~/modules/qa/team/mockData`. Pass the whole `batch` into the helper (`toOneOnOne(session, coachingDate, batch)`), and also reset `outcome: null` and `followUpDate: null`.

**A2. Talking points on the way back to a 1:1.** The plan's `findings.map((f) => f.issue)` would show raw issue keys like `qa-ecn`. Use the brief's approach text instead: `talkingPoints: session.brief?.approach ? [session.brief.approach] : []`.

**A3. Ignore a no-op flip (Phase 1b, `setBatchDecision`).** First line after the lookups: `if (batch.items.find((i) => i.sessionId === sessionId)?.decision === decision) return;`.

**A4. Slot helper.** Add `export const proposedSlotAt = (coachingDate: string) => \`${coachingDate}T10:00:00Z\`;`to`weeklyBatch.ts`after`nextBatchAt`, use it at its inline `T10:00:00Z`line in`buildWeeklyBatch`and in`toOneOnOne`. The codebase stores `T10:00:00Z` and renders it in local time everywhere, so the converted 1:1 lands at the same hour as batch-created ones.

**A5. Decision cell layout (Phase 3b).** Put the toggle and the reason on one line, not stacked: `<Group gap='xs' wrap='nowrap'>{control}<Text size='xs' c='dimmed'>{reason}</Text></Group>`. A stacked cell makes compact rows about 15px taller. Keep Mantine's `SegmentedControl size='xs'`; `AppSegmentedControl` forces a 30px minimum height. If the cell gets too wide at the 5-column layout, fall back to the stacked version.

**A6. Feedback toast on a flip.** After `setBatchDecision` in the cell's `onChange`, call `notifySuccess` (`~/modules/qa/utils/notifications`): to AI message → `t('sessions.batch.queued', { date })` ("Message queued for Tue 15 Sep"); to 1:1 → `t('sessions.batch.proposedAgain')` ("1:1 proposed again. Confirm the date from the session"). Add both keys in en and es (es: "Mensaje programado para el {{date}}", "1:1 propuesto de nuevo: confirma la fecha desde la sesión"). Also add `sessions.batch.locked` is already in the plan; no extra tooltip key needed.

**A7. Drawer width on narrow screens (Phase 4a).** `size='75%'` is valid (Mantine resolves it to a percentage). Below 48em the calendar cells would be cramped, so use `const isNarrow = useMediaQuery('(max-width: 48em)')` and `size={isNarrow ? '100%' : '75%'}`.

**A8. Keyboard and click isolation (Phase 3b).** Confirmed: `BaseTable` opens the row on click and on Enter or Space with no check of the event target, so the wrapper must stop **both** `onClick` and `onKeyDown`, as written. Arrow keys still change the radio natively. A disabled toggle also swallows the click, so clicking it never opens the row; the tooltip explains why.

**A9. Known behaviours to leave as they are.**

- Flipping an already scheduled 1:1 to an AI message does not retract the earlier "session scheduled" notification; the mock inbox has no cancel notification.
- Tabs use `keepMounted={false}`, so the calendar drawer and the History filters reset on tab or page navigation; that is expected.
- There is no `SESSION_PROPOSED` activity type, so the converted 1:1 logs as `SESSION_SCHEDULED` with a "proposed" title.
