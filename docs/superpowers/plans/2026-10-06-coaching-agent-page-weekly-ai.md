# Coaching: Agent Page, Weekly Rule, AI Message Sessions, Modality — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Project override on testing:** per `CLAUDE.md` ("Do not create tests unless explicitly requested") and
> `DESIGN_ROLE.md` (stakeholder-mockup session), **no test-writing steps**. Each task's verification is
> `npm run typecheck` (must stay clean). Do not run the dev server.
>
> **When executing:** first copy this file to `docs/superpowers/plans/2026-10-06-coaching-agent-page-weekly-ai.md`,
> then follow tasks in order. One commit per task. Commit trailer:
> `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

## Context

Analysis of the Coaching section (2026-10-06) against the user's expectations found these gaps:

| Expectation                                                           | Today                                                                                               |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Clicking an agent opens a full page                                   | Opens `AgentCoachingDrawer` (AppDrawer xl)                                                          |
| Default **weekly** rule exists                                        | 7 metric-threshold seeds over `LAST_14_DAYS`, none weekly; no cadence concept                       |
| Automated sessions from each agent's weekly results                   | None; a rule only fires via manual "Run now" and creates a 1:1 at +3 days                           |
| Some sessions are **AI-generated messages** from the analysed results | No such session type                                                                                |
| Supervisor / QA Manager schedule **in-person** sessions               | Sessions exist (1:1, side-by-side, group, micro) but no in-person/remote field                      |
| Weekly QA session lands in the agent inbox                            | Any scheduled/completed session already creates an inbox `COACHING_SESSION` message; nothing weekly |
| Automated session carries LMS material                                | Already true via `linkedAssignmentIds`                                                              |

Decisions confirmed with the user: build all four items; automated sessions are **seed + "Run now"** (no scheduler).

**Goal:**

1. Agent click → full page `/qa/{role}/coaching/agents/:agentId`, same content as the drawer; drawer removed.
2. Rules get a **cadence** (`ON_MATCH` | `WEEKLY`); a default **"Weekly QA review"** rule seeded ACTIVE on `LAST_7_DAYS`.
3. New session type **`AI_MESSAGE`**: a text generated from the agent's scores + linked LMS material, delivered to the
   agent inbox. Rules choose whether their session is a 1:1 or an AI message. Seeded for last week's weekly run.
4. Sessions get a **modality** (`IN_PERSON` | `REMOTE`) chosen in the editor, shown in tables and detail.

**Architecture (reuse-first):**

- Page body = the drawer's body extracted into `AgentCoachingPanel`; the page adds breadcrumb, header actions and the
  three drawers the body triggers (`AssignContentDrawer`, `SessionEditorDrawer`, `SessionDetailDrawer`).
- Cadence is a new field on `CoachingRule` + a Select in `CoachingRuleEditorDrawer` Basics; `WEEKLY` forces every
  condition's `window` to `LAST_7_DAYS`.
- `AI_MESSAGE` is a new `CoachingSessionType` value; the record gets `aiMessage: string | null`. A helper
  `buildAiCoachingMessage` (coaching/helpers.ts) writes the text from `AgentProfile.dimensions` and the linked content
  titles. `runRuleNow` creates it (status `COMPLETED`, since a message is delivered on creation) and notifies the agent
  through the existing `notifySession`.
- Modality is a new field `modality: CoachingSessionModality | null` (null for `AI_MESSAGE` and `MICRO`).

## Global Constraints

- Mantine CSS variables / `light-dark()` only; no hardcoded hex. New UI must work in dark and light.
- No new inline `style={{}}` (pre-commit hook). Use existing CSS modules (`~/modules/qa/lms/components/Cards.module.css`
  `.pointer`, `.clickable`) when a cursor is needed.
- Every string through i18n, namespace `qa.coaching` (and `qa.lms` for the agent-side tab); write **both**
  `src/locales/en/*.json` and `src/locales/es/*.json`.
- Reuse `SectionCard`, `AppDrawer`, `BaseTable`, `ContentContainer`, `StatCard`, `DimensionScoreCard`.
- `npm run typecheck` clean after every task; finish a task's edits before committing.
- Commit style: `feat(qa-coaching): …` / `refactor(qa-coaching): …`.

---

## File Structure

**New files**

- `src/modules/qa/coaching/components/AgentCoachingPanel.tsx` — body extracted from `AgentCoachingDrawer`.
- `src/modules/qa/coaching/CoachingAgentPage/CoachingAgentPage.tsx` — full page.
- `src/modules/qa/coaching/CoachingAgentPage/index.ts` — `export { default } from './CoachingAgentPage';`

**Deleted**

- `src/modules/qa/coaching/components/AgentCoachingDrawer.tsx`

**Modified**

- `src/routes.tsx`, `src/modules/qa/coaching/constants.ts`, `src/modules/qa/coaching/CoachingPage/CoachingPage.tsx`
- `src/models/qa/coaching.ts`, `src/stores/qa/coachingStore.ts`, `src/modules/qa/coaching/helpers.ts`,
  `src/modules/qa/coaching/mockData.ts`
- `src/modules/qa/coaching/components/CoachingRuleEditorDrawer.tsx`, `SessionEditorDrawer.tsx`,
  `SessionDetailDrawer.tsx`, `AgentSessionDetailDrawer.tsx`
- `src/modules/qa/coaching/CoachingPage/tabs/RulesTab.tsx`, `SessionsTab.tsx`
- `src/modules/qa/lms/AgentLmsPage/tabs/AgentCoachingTab.tsx`
- `src/locales/{en,es}/qa.coaching.json`, `src/locales/{en,es}/qa.lms.json`

---

## Task 1 — Agent click opens a full page

**Verified facts:** `AgentCoachingDrawer` (`coaching/components/AgentCoachingDrawer.tsx`) receives `profile, assignments,
sessions, contentById, initialTab, onAssign, onSchedule, onProfile, onOpenSession`. `CoachingPage.tsx` holds
`agentDrawerId`/`agentDrawerTab` state (lines 115-116), opens it from `AgentsTab onOpen` (394-397) and
`ImpactTab onOpenAgent` (465-468), and renders it at 521-553. Routes for coaching are `supervisor/coaching` and
`qa-manager/coaching` (`routes.tsx:1237-1257`), lazy `CoachingPage` at `routes.tsx:158`. `AgentProfilePage.tsx` is the
reference for a role-aware detail page (`roleFromPath`, `useParams`, `?tab=`, `ContentContainer`, `Breadcrumbs`).

- [ ] **1.1** `coaching/constants.ts` — after `coachingBasePath` add:
  ```ts
  export const coachingAgentPath = (role: TeamRole, agentId: string) =>
  	`${coachingBasePath(role)}/agents/${agentId}`;
  ```
- [ ] **1.2** Create `components/AgentCoachingPanel.tsx` from the drawer body:
  - Props:
    ```ts
    interface AgentCoachingPanelProps {
    	profile: AgentProfile;
    	assignments: LmsAssignment[];
    	sessions: CoachingSessionRecord[];
    	contentById: Record<string, LmsContent>;
    	tab: string;
    	onTabChange: (tab: string | null) => void;
    	onOpenSession: (sessionId: string) => void;
    }
    ```
  - Move everything from `AgentCoachingDrawer` **inside** `<AppDrawer>` (the `DimensionScoreCard` grid and the
    `<Tabs>` with timeline / assignments / sessions / impact panels) plus the `useMemo`s (`mine`, `mySessions`,
    `measured`, `timeline`, `performance`) and `assignmentColumns`. Replace `<Tabs defaultValue={initialTab}>` with
    `<Tabs value={tab} onChange={onTabChange} keepMounted={false}>`. Keep all i18n keys (`agents.drawer.*`) unchanged.
    Return `<Stack gap='md'>…</Stack>` (no drawer).
- [ ] **1.3** Create `CoachingAgentPage/CoachingAgentPage.tsx`:
  - Hooks: `useParams<{ agentId: string }>()`, `useLocation`, `useNavigate`, `useSearchParams`,
    `roleFromPath(location.pathname)`, `managerPersona(role)`, `useTeamStore((s) => s.profiles)`,
    `useLmsStore(selectAssignments|selectContent)`, `useCoachingStore(selectSessions|selectCohorts)`,
    `useTriggerRulesStore(selectTriggerRules)`.
  - `const profile = agentId ? profilesMap[agentId] : undefined;` then `withRuleBurnout(profile, triggerRules)` as
    `CoachingPage` does. If missing → `<EmptyState message={t('agents.page.notFound')} />` inside `ContentContainer`.
  - Scope guard like `AgentProfilePage`: supervisor can only see `profile.agent.supervisorId === SUPERVISOR_PERSONA.id`;
    otherwise the same not-found state.
  - `tab` from `?tab=` default `'timeline'`; `setTab` writes it with `{ replace: true }` (copy the pattern from
    `CoachingPage.setTab`).
  - Layout (`<ContentContainer contentWidth='full'><Stack gap='lg'>`):
    1. `<Breadcrumbs>`: `<Anchor onClick={() => navigate(coachingBasePath(role))}>{t('title')}</Anchor>` then
       `<Text size='sm' c='dimmed'>{profile.agent.name}</Text>`.
    2. Header `<Group justify='space-between' align='flex-start'>`: left `<Stack gap={0}>` with
       `<Title order={1}>{profile.agent.name}</Title>` and `<Text c='dimmed' size='sm'>{team} · {supervisorName}</Text>`;
       right `<Group gap='xs'>` with the three buttons (same labels/icons as the drawer header): Assign
       (`agents.drawer.assign`, `IconBook`, `variant='default'`), Schedule (`agents.drawer.schedule`,
       `IconCalendarEvent`, `variant='default'`), Open profile (`agents.drawer.profile`, `variant='subtle'`, navigates
       to `${agentProfilePath(role, profile.agent)}?tab=coaching`).
    3. `<AgentCoachingPanel … tab={tab} onTabChange={setTab} onOpenSession={setSessionId} />`.
  - Local state + drawers (copy prop wiring from `CoachingPage.tsx` lines 474-491 and 608-624):
    `AssignContentDrawer` (preset `{ agentIds: [agentId] }`, `cohorts` = cohorts containing the agent),
    `SessionEditorDrawer` (preset `{ agentId }`), `SessionDetailDrawer` (`onOpenCall` navigates to
    `/qa/campaigns/1/calls/${callId}`).
  - `index.ts` barrel.
- [ ] **1.4** `routes.tsx`: add lazy `const CoachingAgentPage = React.lazy(() => import('./modules/qa/coaching/CoachingAgentPage'));`
      next to `CoachingPage`, and two routes right after each coaching route, same wrapper
      (`I18nNamespaceLoader` + `Suspense`):
  - `path: 'qa-manager/coaching/agents/:agentId', id: 'qa.qa-manager.coaching.agent'`
  - `path: 'supervisor/coaching/agents/:agentId', id: 'qa.supervisor.coaching.agent'`
- [ ] **1.5** `CoachingPage.tsx`: remove `agentDrawerId`/`agentDrawerTab` state, the `AgentCoachingDrawer` import and
      JSX block (521-553). `AgentsTab onOpen={(agentId) => navigate(coachingAgentPath(role, agentId))}`;
      `ImpactTab onOpenAgent={(agentId) => navigate(\`${coachingAgentPath(role, agentId)}?tab=impact\`)}`. Import
`coachingAgentPath`from`'../constants'`. Remove now-unused imports (`TEAM_AGENTS`, `agentProfilePath`) if the
      typecheck flags them.
- [ ] **1.6** Delete `components/AgentCoachingDrawer.tsx`. i18n (both locales) add under `agents`:
      `"page": { "notFound": "Agent not found in your scope." }` / es `"Agente fuera de tu alcance."`.
- [ ] **1.7** `npm run typecheck` → commit `feat(qa-coaching): open the agent coaching view as a full page instead of a drawer`.

---

## Task 2 — Model: cadence, AI message session type, modality

**Files:** `src/models/qa/coaching.ts`, `src/modules/qa/coaching/constants.ts`.

- [ ] **2.1** `models/qa/coaching.ts`:
  - After `CoachRole`:
    ```ts
    /** ON_MATCH fires when the conditions match ("Run now" today); WEEKLY reviews every agent each Monday over the last 7 days. */
    export type CoachingRuleCadence = 'ON_MATCH' | 'WEEKLY';
    ```
  - `CoachingRuleAction`: after `scheduleSession: boolean;` add
    ```ts
    /** What `scheduleSession` creates: a coach-led session or an AI-written message. */
    sessionType: CoachingSessionType;
    ```
    (move the `CoachingSessionType` declaration above `CoachingRuleAction` so it is declared before use.)
  - `CoachingRule`: after `cooldownDays: number;` add `cadence: CoachingRuleCadence;`.
  - `CoachingSessionType` becomes `'ONE_ON_ONE' | 'SIDE_BY_SIDE' | 'GROUP' | 'MICRO' | 'AI_MESSAGE'`.
  - After `CoachingSessionStatus`:
    ```ts
    export type CoachingSessionModality = 'IN_PERSON' | 'REMOTE';
    ```
  - `CoachingSessionRecord`: after `type` add `/** null for AI_MESSAGE and MICRO. */ modality: CoachingSessionModality | null;`
    and after `notes: string;` add `/** Generated text of an AI_MESSAGE session; null otherwise. */ aiMessage: string | null;`.
- [ ] **2.2** `coaching/constants.ts`:
  - `SESSION_TYPES` stays as the 4 coach-led types (used by the manual editor). Add:
    ```ts
    /** Types a rule can produce; the manual editor never creates AI messages. */
    export const RULE_SESSION_TYPES: CoachingSessionType[] = [
    	'ONE_ON_ONE',
    	'AI_MESSAGE',
    ];
    export const SESSION_MODALITIES: CoachingSessionModality[] = [
    	'IN_PERSON',
    	'REMOTE',
    ];
    export const RULE_CADENCES: CoachingRuleCadence[] = ['ON_MATCH', 'WEEKLY'];
    /** Types that have no physical/remote modality. */
    export const MODALITY_FREE_TYPES: CoachingSessionType[] = [
    	'MICRO',
    	'AI_MESSAGE',
    ];
    ```
    Import the two new types from `~/models/qa`.
- [ ] **2.3** Typecheck will now fail in mockData/store/editor — that is expected; **do not commit yet**. Continue with
      Task 3 and commit both together as `feat(qa-coaching): add rule cadence, AI message sessions and session modality to the model and seeds`.

---

## Task 3 — Seeds, store and AI message helper

**Files:** `src/modules/qa/coaching/helpers.ts`, `src/modules/qa/coaching/mockData.ts`, `src/stores/qa/coachingStore.ts`.

**Verified facts:** `mockData.ts` builds sessions in `buildRosterSessions()` (366-440, uses `rand = seeded(...)`),
`buildAgentHistoryAGT004()` (442-562) and `CURATED_SESSIONS` (563-713). Rules `cr-001..cr-007` (49-359) all share the
`action` shape. `coachingStore.runRuleNow` (181-299) assigns LMS then, if `scheduleSession`, calls `scheduleSession`
with `type: 'ONE_ON_ONE'`. `notifySession` (99-132) builds the inbox `COACHING_SESSION` notification. Profiles are
`TEAM_PROFILES` (`~/modules/qa/team/mockData`), `AgentProfile.dimensions: DimensionScore[]` with
`{ key, score, delta, trend }`; `DIMENSION_META[key].unit` is `'%' | '/5'` (`team/constants.ts:84`). LMS content ids
used by rules: `lms-c08`, `lms-c11` (compliance), `lms-c15`, `lms-c14` (sentiment); `lms-c01` is QA path content.

- [ ] **3.1** `coaching/helpers.ts` — add (English-only mock copy, like `COACHING_TOPICS`):
  ```ts
  /**
   * The text of an AI_MESSAGE session: last week's scores per dimension, the
   * weakest one, and the material the rule attached. Mock-only wording.
   */
  export const buildAiCoachingMessage = (
  	profile: AgentProfile,
  	ruleName: string,
  	contentTitles: string[]
  ): string => {
  	const lines = profile.dimensions.map((d) => {
  		const unit = DIMENSION_META[d.key].unit;
  		const delta =
  			d.delta === 0 ? 'stable' : `${d.delta > 0 ? '+' : ''}${d.delta}${unit}`;
  		return `• ${DIMENSION_LABEL[d.key]}: ${d.score}${unit} (${delta} vs last week)`;
  	});
  	const weakest = [...profile.dimensions].sort(
  		(a, b) =>
  			a.score / DIMENSION_META[a.key].max -
  			b.score / DIMENSION_META[b.key].max
  	)[0];
  	const focus = weakest ? DIMENSION_LABEL[weakest.key] : 'quality';
  	const material = contentTitles.length
  		? `\n\nTo work on it this week I attached: ${contentTitles.join(', ')}.`
  		: '';
  	return `Hi ${profile.agent.name.split(' ')[0]}, here is your weekly review (${ruleName}).\n\n${lines.join('\n')}\n\nYour focus for the week is ${focus}. Pick one call from last week where it slipped and note what you would do differently.${material}`;
  };
  ```
  with `const DIMENSION_LABEL: Record<DimensionKey, string> = { qa: 'QA', sentiment: 'Customer sentiment', compliance: 'Compliance', business: 'Business' };`
  Imports: `DIMENSION_META` from `~/modules/qa/team/constants`, `AgentProfile`, `DimensionKey` from `~/modules/qa/team/types`.
- [ ] **3.2** `mockData.ts` rules:
  - Add `cadence: 'ON_MATCH',` after `cooldownDays` and `sessionType: 'ONE_ON_ONE',` after `scheduleSession` in **all 7**
    existing seeds.
  - Prepend a new first rule:
    ```ts
    	{
    		id: 'cr-000',
    		name: 'Weekly QA review',
    		description:
    			'Every Monday, each agent under 90% QA over the last 7 days receives an AI-written review of their week with the critical-errors video attached.',
    		status: 'ACTIVE',
    		area: 'QUALITY_ASSURANCE',
    		conditions: [
    			condition({
    				id: 'cr-000-c1',
    				metricId: 'QA_OVERALL_SCORE',
    				operator: 'LT',
    				value: 90,
    				window: 'LAST_7_DAYS',
    			}),
    		],
    		conditionLogic: 'ALL',
    		scope: emptyScope(),
    		action: {
    			kind: 'ASSIGN_CONTENT',
    			contentIds: ['lms-c01'],
    			pathId: null,
    			mandatory: false,
    			dueInDays: 7,
    			requireAcceptance: false,
    			scheduleSession: true,
    			sessionType: 'AI_MESSAGE',
    			sessionTopic: 'Weekly QA review',
    			sessionCoach: 'QA_MANAGER',
    			notifySupervisor: true,
    		},
    		followUp: { ...DEFAULT_FOLLOW_UP, windowDays: 7, checkpointDays: [7] },
    		cooldownDays: 7,
    		cadence: 'WEEKLY',
    		stats: {
    			triggeredLast30Days: 14,
    			agentsAffected: 9,
    			improvedRate: 55,
    			lastTriggeredAt: '2026-09-07T08:00:00Z',
    		},
    		createdBy: 'Elena Ruiz',
    		createdByRole: 'QA_MANAGER',
    		createdAt: CREATED_AT,
    		updatedAt: UPDATED_AT,
    	},
    ```
- [ ] **3.3** `mockData.ts` sessions:
  - `buildRosterSessions`: add `modality: rand() < 0.6 ? 'IN_PERSON' : 'REMOTE',` after `type: 'ONE_ON_ONE',` and
    `aiMessage: null,` after `notes: ''`.
  - `buildAgentHistoryAGT004` and every object in `CURATED_SESSIONS`: add `aiMessage: null` and `modality`
    (`'IN_PERSON'` for `coa-a04-rule` and `coa-a06-1`; `'REMOTE'` for the GROUP session; `null` wherever `type` is
    `MICRO`). Grep `type: '` in the file to find every literal.
  - Append to `CURATED_SESSIONS` three AI message sessions from last Monday's weekly run (import `TEAM_PROFILES` is
    already there; import `buildAiCoachingMessage` from `'./helpers'` and `LMS_CONTENT`—check the export name in
    `~/modules/qa/lms/mockData`—to resolve `lms-c01`'s title; if no such export exists, hardcode the title
    `'Critical errors: what they are and how to avoid them'`):
    ```ts
    const WEEKLY_RUN_AT = '2026-09-07T08:00:00Z';
    const weeklyAiMessage = (
    	agentId: string,
    	id: string
    ): CoachingSessionRecord => {
    	const profile = TEAM_PROFILES[agentId];
    	return {
    		id,
    		agentId,
    		agentName: profile.agent.name,
    		coachId: 'QAM-001',
    		coachName: 'Elena Ruiz',
    		coachRole: 'QA_MANAGER',
    		type: 'AI_MESSAGE',
    		modality: null,
    		date: WEEKLY_RUN_AT,
    		durationMin: 0,
    		topic: 'Weekly QA review',
    		area: 'QUALITY_ASSURANCE',
    		subItem: null,
    		evidenceCallIds: [],
    		talkingPoints: [],
    		notes: '',
    		aiMessage: buildAiCoachingMessage(profile, 'Weekly QA review', [
    			CRITICAL_ERRORS_TITLE,
    		]),
    		actionItems: [],
    		agentCommitment: {
    			acknowledged: false,
    			acknowledgedAt: null,
    			comment: null,
    		},
    		status: 'COMPLETED',
    		outcome: null,
    		followUpDate: null,
    		linkedAssignmentIds: [],
    		ruleId: 'cr-000',
    		cohortId: null,
    	};
    };
    ```
    and push `weeklyAiMessage('AGT-004', 'coa-a04-weekly'), weeklyAiMessage('AGT-006', 'coa-a06-weekly'),
weeklyAiMessage('AGT-013', 'coa-a13-weekly')` into `CURATED_SESSIONS`. Add an activity seed entry
    `{ id: 'cact-weekly', type: 'RULE_FIRED', agentId: null, agentName: null, title: 'Weekly QA review', description: 'QA_OVERALL_SCORE < 90 over the last 7 days · 3 agents', date: WEEKLY_RUN_AT, area: 'QUALITY_ASSURANCE', link: '?tab=rules' }`
    at the top of `COACHING_ACTIVITY_SEEDS`.
- [ ] **3.4** `coachingStore.ts`:
  - `ScheduleSessionInput`: add `modality: CoachingSessionModality | null;` and `aiMessage?: string | null;`.
  - `scheduleSession`: set `modality: input.modality`, `aiMessage: input.aiMessage ?? null`, and
    `status: input.type === 'AI_MESSAGE' ? 'COMPLETED' : 'SCHEDULED'`. Activity + notification copy branch on type:
    for `AI_MESSAGE` log `type: 'SESSION_COMPLETED'`, title `` `Coaching message sent: ${session.topic}` ``, and call
    `notifySession(session, \`Weekly coaching message: ${session.topic}\`, session.aiMessage ?? '')`; else keep the
    current text.
  - `runRuleNow`: replace the hardcoded `type: 'ONE_ON_ONE'` block with
    ```ts
    const isAi = rule.action.sessionType === 'AI_MESSAGE';
    const profile = useTeamStore.getState().profiles[agentId];
    const titles = createdIds
    	.map((id) => lms.assignments.find((a) => a.id === id))
    	.map((a) => (a ? lms.content.find((c) => c.id === a.contentId)?.title : undefined))
    	.filter((x): x is string => Boolean(x));
    get().scheduleSession(
    	{
    		agentId,
    		agentName: agent?.name ?? agentId,
    		date: isAi ? NOW_ISO : `${day(today(), 3)}T10:00:00Z`,
    		durationMin: isAi ? 0 : 30,
    		type: rule.action.sessionType,
    		modality: isAi ? null : 'REMOTE',
    		topic: rule.action.sessionTopic,
    		area: rule.area,
    		subItem: null,
    		evidenceCallIds: [],
    		talkingPoints: [],
    		notes: '',
    		aiMessage: isAi && profile ? buildAiCoachingMessage(profile, rule.name, titles) : null,
    		linkedAssignmentIds: createdIds,
    		ruleId: rule.id,
    	},
    	{ … unchanged coach … }
    );
    ```
    Import `useTeamStore` from `~/stores/qa/teamStore` and `buildAiCoachingMessage` from `~/modules/qa/coaching/helpers`.
    (Check `lmsStore` state names: `assignments`, `content` — they are selected as `selectAssignments`/`selectContent`
    in `CoachingPage`; use the same state keys.)
  - `duplicateRule` copies `cadence` automatically via spread — nothing to do.
- [ ] **3.5** `npm run typecheck` clean (editor still passes because `CoachingRuleFormValues.action` is the full
      `CoachingRuleAction`, but its default literals need `sessionType: 'ONE_ON_ONE'` — add it in the two `initialValues`
      blocks of `CoachingRuleEditorDrawer.tsx` lines ~128-140 and ~176-190, and `cadence: 'ON_MATCH'` is added in Task 4; if
      the typecheck demands `cadence` now in `buildRule`, add `cadence: rule?.cadence ?? 'ON_MATCH'` temporarily).
      Commit `feat(qa-coaching): add rule cadence, AI message sessions and session modality to the model and seeds`.

---

## Task 4 — Rules UI: cadence + session kind

**Files:** `CoachingRuleEditorDrawer.tsx`, `RulesTab.tsx`, `CoachingRuleDetailDrawer.tsx` (label only), locales.

**Verified facts:** editor form type `CoachingRuleFormValues` (52-64), Basics section (313-337), the
`scheduleSession` switch + topic/coach `Group grow` (450-475), `buildRule` (236-256), `buildCondition` defaults to
`LAST_14_DAYS`. RulesTab name column (87-97) shows name + `AreaBadge`; action summary column (116-135) appends
`rules.actionSummary.withSession`.

- [ ] **4.1** Editor:
  - Add `cadence: CoachingRuleCadence;` to `CoachingRuleFormValues`; default `'ON_MATCH'` in both init blocks, and
    `cadence: rule.cadence` in the edit branch; `cadence: form.values.cadence` in `buildRule`.
  - Basics section, after the Aspect `Select`:
    ```tsx
    <Select
    	label={t('rules.editor.fields.cadence')}
    	description={t(`rules.editor.cadenceHint.${form.values.cadence}`)}
    	data={RULE_CADENCES.map((c) => ({
    		value: c,
    		label: t(`rules.cadence.${c}`),
    	}))}
    	value={form.values.cadence}
    	onChange={(v) => v && handleCadenceChange(v as CoachingRuleCadence)}
    />
    ```
    with
    ```ts
    const handleCadenceChange = (next: CoachingRuleCadence) => {
    	form.setFieldValue('cadence', next);
    	if (next === 'WEEKLY')
    		form.setFieldValue(
    			'conditions',
    			form.values.conditions.map((c) => ({
    				...c,
    				window: 'LAST_7_DAYS' as const,
    			}))
    		);
    };
    ```
    When `cadence === 'WEEKLY'`, the per-condition window `Select` in the condition builder must be `disabled` (find
    where `window` is edited in the drawer and pass `disabled={form.values.cadence === 'WEEKLY'}`).
  - Session block: replace the `Group grow` with topic + coach by a `Stack gap='sm'` containing first a `Select`
    `label={t('rules.editor.fields.sessionType')}` over `RULE_SESSION_TYPES` (labels `sessions.types.${type}`), bound
    to `action.sessionType`, then the existing topic/coach `Group grow`. Under it, when `sessionType === 'AI_MESSAGE'`,
    a `<Text size='xs' c='dimmed'>{t('rules.editor.aiMessageHint')}</Text>`.
- [ ] **4.2** `RulesTab.tsx` name column: after `<AreaBadge …/>` wrap both in `<Group gap={4}>` and add
      `{info.row.original.cadence === 'WEEKLY' && <Badge size='xs' variant='light' color='blue'>{t('rules.cadence.WEEKLY')}</Badge>}`.
      Action summary: replace the `withSession` text with
      `t(rule.action.sessionType === 'AI_MESSAGE' ? 'rules.actionSummary.withAiMessage' : 'rules.actionSummary.withSession')`.
- [ ] **4.3** i18n `qa.coaching.json` (both):
  - `rules.cadence`: en `{ "ON_MATCH": "When conditions match", "WEEKLY": "Weekly review" }`;
    es `{ "ON_MATCH": "Cuando se cumplan las condiciones", "WEEKLY": "Revisión semanal" }`.
  - `rules.editor.fields.cadence`: en `"Cadence"`, es `"Cadencia"`; `rules.editor.fields.sessionType`: en
    `"Session kind"`, es `"Tipo de sesión"`.
  - `rules.editor.cadenceHint`: en `{ "ON_MATCH": "Fires for each agent as soon as the conditions match.", "WEEKLY": "Runs every Monday over the last 7 days for every agent in scope." }`;
    es `{ "ON_MATCH": "Se dispara por agente en cuanto se cumplen las condiciones.", "WEEKLY": "Corre cada lunes sobre los últimos 7 días para todos los agentes del alcance." }`.
  - `rules.editor.aiMessageHint`: en `"The agent receives an AI-written summary of their week with the material attached, in their inbox."`;
    es `"El agente recibe en su inbox un resumen de su semana escrito por IA, con el material adjunto."`.
  - `rules.actionSummary.withAiMessage`: en `"+ AI message"`, es `"+ mensaje IA"`.
  - `sessions.types.AI_MESSAGE`: en `"AI message"`, es `"Mensaje IA"`.
- [ ] **4.4** `npm run typecheck` → commit `feat(qa-coaching): choose a rule cadence and whether it sends a 1:1 or an AI message`.

---

## Task 5 — Sessions UI: modality and AI message rendering

**Files:** `SessionEditorDrawer.tsx`, `SessionsTab.tsx`, `SessionDetailDrawer.tsx`, `AgentSessionDetailDrawer.tsx`,
`AgentCoachingTab.tsx`, `AgentCoachingPanel.tsx`, locales.

**Verified facts:** editor `FormValues` (50-62) and the type `Select` (202-207); `handleSubmit` builds the
`scheduleSession` input (167-184). SessionsTab columns (66-156): `type` renders `Badge variant='outline'`. Manager
detail drawer shows a badges row (116-127) and, for `SCHEDULED`, the outcome/complete block (259-286). Agent detail
drawer (`AgentSessionDetailDrawer.tsx`) shows talking points / evidence / action items / outcome with `qa.lms`
`agent.coaching.detail.*` keys. `AgentCoachingTab.tsx` "Upcoming session" card (234-282) takes the soonest SCHEDULED;
past table (174-230) has columns date/topic/coach/area/status/outcome.

- [ ] **5.1** `SessionEditorDrawer.tsx`:
  - `FormValues.modality: CoachingSessionModality;` default `'IN_PERSON'` (both init blocks).
  - After the type `Select`, add
    ```tsx
    {
    	!MODALITY_FREE_TYPES.includes(form.values.type) && (
    		<SegmentedControl
    			data={SESSION_MODALITIES.map((m) => ({
    				value: m,
    				label: t(`sessions.modality.${m}`),
    			}))}
    			value={form.values.modality}
    			onChange={(v) =>
    				form.setFieldValue('modality', v as CoachingSessionModality)
    			}
    		/>
    	);
    }
    ```
    (use `AppSegmentedControl` from `~/components/ui/AppSegmentedControl` as `SessionsTab` does, size `sm`.)
  - `handleSubmit`: pass `modality: MODALITY_FREE_TYPES.includes(form.values.type) ? null : form.values.modality`.
- [ ] **5.2** `SessionsTab.tsx`: type column cell becomes
  ```tsx
  <Group gap={4} wrap='nowrap'>
  	<Badge size='xs' variant='outline'>
  		{t(`sessions.types.${s.type}`)}
  	</Badge>
  	{s.modality && (
  		<Badge size='xs' variant='light' color='gray'>
  			{t(`sessions.modality.${s.modality}`)}
  		</Badge>
  	)}
  </Group>
  ```
  Add `AI_MESSAGE` to the type filter data (`[...SESSION_TYPES, 'AI_MESSAGE']`). Add a modality filter `Select`
  (`sessions.filters.modality`, data `SESSION_MODALITIES`) next to the type filter and apply it in `filtered`.
  Description key `sessions.description` → en `"1:1, side-by-side, micro, group sessions and AI messages."` /
  es `"Sesiones 1:1, lado a lado, micro, grupales y mensajes IA."`.
- [ ] **5.3** `SessionDetailDrawer.tsx`: in the badges row add `{session.modality && <Badge size='xs' variant='light' color='gray'>{t(`sessions.modality.${session.modality}`)}</Badge>}`.
      When `session.type === 'AI_MESSAGE'` render, **instead of** Evidence/Talking points/Action items/Commitment/Outcome
      cards, a single `<SectionCard title={t('sessions.detail.aiMessage')} padding='md'><Text size='sm' style={undefined} className={styles.preWrap}>{session.aiMessage}</Text></SectionCard>` followed by the existing
      "Linked material" card. For the line breaks use a CSS module class `.preWrap { white-space: pre-wrap; }` — add it to
      `src/modules/qa/coaching/components/Queue.module.css` (existing file) as `.preWrap` and import it.
- [ ] **5.4** `AgentSessionDetailDrawer.tsx`: same AI branch — when `AI_MESSAGE`, show one card
      `t('agent.coaching.detail.aiMessage')` with the pre-wrapped text, then linked material; hide talking points /
      evidence / action items. Add modality badge in the header row when present (`t(`agent.coaching.modality.${m}`)`).
- [ ] **5.5** `AgentCoachingTab.tsx`:
  - Upcoming card: it already picks the soonest SCHEDULED, so AI messages (COMPLETED) never appear there — correct.
  - Add a new `SectionCard` **above** the "Upcoming / Commitments" grid, titled `t('agent.coaching.latestMessage')`,
    description `t('agent.coaching.latestMessageDescription')`, icon `IconSparkles`, shown only when
    `const latestAi = sessions.filter((s) => s.type === 'AI_MESSAGE').sort((a,b) => b.date.localeCompare(a.date))[0]`
    exists. Content: `<Text size='xs' c='dimmed'>{dayjs(latestAi.date).format('D MMM YYYY')} · {latestAi.coachName}</Text>`
    and the first 280 chars of `latestAi.aiMessage` + "…", whole card `className={cardStyles.clickable}` opening
    `setDetailSession(latestAi)`.
  - Past table: add a `type` column (`agent.coaching.columns.type`) rendering `t(`agent.coaching.types.${type}`)` as
    an outline badge, after `topic`.
- [ ] **5.6** `AgentCoachingPanel.tsx` (manager page) sessions tab cards: next to the type text append
      `{s.modality ? ` · ${t(`sessions.modality.${s.modality}`)}` : ''}`.
- [ ] **5.7** i18n:
  - `qa.coaching.json` (both): `sessions.modality`: en `{ "IN_PERSON": "In person", "REMOTE": "Remote" }` /
    es `{ "IN_PERSON": "Presencial", "REMOTE": "Remota" }`; `sessions.filters.modality`: en `"Modality"` / es
    `"Modalidad"`; `sessions.detail.aiMessage`: en `"AI message"` / es `"Mensaje IA"`.
  - `qa.lms.json` (both) under `agent.coaching`: `latestMessage`: en `"Your weekly review"` / es `"Tu revisión semanal"`;
    `latestMessageDescription`: en `"Written from your results by the QA assistant. Open it to read the full message."`
    / es `"Escrita a partir de tus resultados por el asistente de QA. Ábrela para leer el mensaje completo."`;
    `detail.aiMessage`: en `"Message"` / es `"Mensaje"`; `columns.type`: en `"Type"` / es `"Tipo"`;
    `types`: en `{ "ONE_ON_ONE": "1:1", "SIDE_BY_SIDE": "Side-by-side", "GROUP": "Group", "MICRO": "Micro", "AI_MESSAGE": "AI message" }`
    / es `{ "ONE_ON_ONE": "1:1", "SIDE_BY_SIDE": "Lado a lado", "GROUP": "Grupal", "MICRO": "Micro", "AI_MESSAGE": "Mensaje IA" }`;
    `modality`: same values as `sessions.modality` above.
- [ ] **5.8** `npm run typecheck` → commit `feat(qa-coaching): session modality and AI message rendering for coaches and agents`.

---

## Verification (after Task 5)

1. `npm run typecheck` clean; `git diff --stat` shows no files under `src/modules/qa/disputes`, `src/modules/qa/triggers`.
2. Read-through:
   - `routes.tsx` has `qa.supervisor.coaching.agent` and `qa.qa-manager.coaching.agent`; `CoachingPage.tsx` no longer
     imports `AgentCoachingDrawer` (file deleted) and navigates with `coachingAgentPath`.
   - `COACHING_RULE_SEEDS[0].id === 'cr-000'`, `cadence: 'WEEKLY'`, `window: 'LAST_7_DAYS'`, `sessionType: 'AI_MESSAGE'`.
   - Three `AI_MESSAGE` sessions (`coa-a04-weekly`, `coa-a06-weekly`, `coa-a13-weekly`) with `status: 'COMPLETED'`,
     `ruleId: 'cr-000'`, non-null `aiMessage`.
   - Every session literal has `modality` and `aiMessage`; `scheduleSession` sets `COMPLETED` for AI messages and
     notifies the agent.
   - All new keys exist in **both** locales for `qa.coaching` and `qa.lms`.
3. If the user later runs the app: Supervisor → Coaching → click any agent → full page with breadcrumb and 4 tabs;
   Rules tab shows "Weekly review" badge on "Weekly QA review", its editor shows Cadence + Session kind; Rules →
   "Weekly QA review" → Run now creates AI messages (Sessions tab, type "AI message") and an inbox item for the agent;
   Agent role → Coaching shows "Your weekly review" card; New session shows In person / Remote.
