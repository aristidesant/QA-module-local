# Burnout Risk card: clickable agent → Burnout evidence tab in the Agent Profile

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development or superpowers:executing-plans.
> No tests (`CLAUDE.md`), no dev server (`DESIGN_ROLE.md`). Each task is verified with `npm run typecheck`.
> **When executing:** copy this file to `docs/superpowers/plans/2026-10-06-burnout-evidence-tab.md` first. Commit one task at a time
> and **never run two `git commit` at once** (the pre-commit hook takes >2 min; run it in the background and wait for it).
> Commit trailer: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.

## Context (answers the user's question)

**What happens today when the user clicks an agent in the Burnout Risk card:** nothing. The agent name
(`TeamBurnoutRiskCard.tsx`, `src/modules/qa/dashboard/components/`) is plain text. The only action is the
"Schedule Coaching" button → `/qa/{role}/coaching?schedule=<agentId>`, which opens the session editor. The card is used only
by the Supervisor dashboard (`NewSupervisorDashboard.tsx:263`, `role='supervisor'`).

**Where the proof is today (and why the user can't reach it):** the percentage and level come from `assessBurnout()`
(`src/modules/qa/analytics/helpers.ts`), which evaluates the conditions of the ACTIVE `BURNOUT_RISK` rules of Triggers & Recognition
against the agent's calls. Its output (`BurnoutAssessment`) already contains the proof — `drivers[]` (each condition with
status BREACHED / NEAR / OK and `currentValue`), `matchedRuleIds`, `breached`, `near` — but it is only rendered in
**Team Analytics → Burnout** (`BurnoutView.tsx`, a table of badges for ALL agents, no link from the card, no per-agent view).
The Agent Profile Overview shows only level + % + trend (`BurnoutRiskWidget`) with no reasons. `computeWorkload()` (calls/day,
AHT vs team, after-hours share, consecutive days, negative-emotion share, recovery rate) and the burnout action history
(`buildActionHistory`, `teamAnalyticsStore.burnoutActions`) exist in the data layer with no UI.

**Decision (confirmed with the user):** clicking the agent opens a new **Burnout** tab in the Agent Profile
(`?tab=burnout`) that shows: rule drivers, workload vs team, supporting calls, trend and actions taken.

## Global Constraints

- Mantine CSS variables only, both themes; no new inline `style={{}}` (pre-commit hook; use props like `flex`, `color`, `c`, CSS modules).
- Strings through i18n `qa.team` (en + es, both files). Reuse `SectionCard`, `BaseTable`, `StatCard`, `Badge`, `Progress`.
- Reuse (do not reimplement): `assessBurnout`, `computeWorkload`, `buildActionHistory`, `describeCondition`
  (`~/modules/qa/triggers/helpers`), `BURNOUT_ACTIONS_SEED`/`teamAnalyticsStore`, `agentProfilePath` (`team/helpers.ts`),
  `SessionEditorDrawer` already mounted in `AgentProfilePage`.
- The agent never sees this tab (only Supervisor/QA Manager reach `AgentProfilePage`; verified — routes are `supervisor/your-team/:agentId` and `qa-manager/teams/:supervisorId/agents/:agentId`).

## File Structure

New: `src/modules/qa/team/AgentProfilePage/tabs/BurnoutTab.tsx`
Modified: `TeamBurnoutRiskCard.tsx`, `team/constants.ts` (`ProfileTab`, `PROFILE_TABS`), `AgentProfilePage.tsx`,
`analytics/helpers.ts` (one helper), `locales/{en,es}/qa.team.json`.

---

## Task 1 — Make the agent clickable in the card

**File:** `src/modules/qa/dashboard/components/TeamBurnoutRiskCard.tsx`

- [ ] **1.1** Import `agentProfilePath` from `~/modules/qa/team/helpers` and `TEAM_AGENTS` from `~/modules/qa/team/mockData`.
- [ ] **1.2** Make the name an `Anchor` (Mantine) instead of `Text`:
  ```tsx
  <Anchor
  	size='sm'
  	fw={500}
  	c='inherit'
  	onClick={() => openEvidence(entry.agentId)}
  >
  	{entry.agentName}
  </Anchor>
  ```
  with
  ```ts
  const openEvidence = (agentId: string) => {
  	const agent = TEAM_AGENTS.find((a) => a.id === agentId);
  	if (agent) navigate(`${agentProfilePath(role, agent)}?tab=burnout`);
  };
  ```
  Add a `Tooltip`/`title` text key `burnout.viewEvidence` ("See why") in `qa.dashboard`? — keep it simple: wrap the whole risk row
  (name + bar) in a `Tooltip label={t('burnout.viewEvidence')}`. Keys: `qa.dashboard.json` en `"viewEvidence": "See the evidence behind this score"`,
  es `"Ver la evidencia detrás de este puntaje"` (inside the existing `burnout` object).
- [ ] **1.3** Update the card's doc comment: "read-only" → "read-only; the agent name opens the Burnout tab of their profile".
- [ ] **1.4** `npm run typecheck`; commit `feat(qa-dashboard): open the burnout evidence from the agent name in the Burnout Risk card`.

## Task 2 — Supporting-calls helper

**File:** `src/modules/qa/analytics/helpers.ts` (next to `computeWorkload`)

- [ ] **2.1** Add:

  ```ts
  export interface BurnoutEvidenceCall {
  	call: TeamCallMetric;
  	/** Why the call counts: keys of qa.team `burnout.callReason.*`. */
  	reasons: (
  		| 'afterHours'
  		| 'negativeEmotion'
  		| 'longHandle'
  		| 'lowSentiment'
  	)[];
  }

  /** Recent calls (last 30 days) of one agent that carry a fatigue/strain signal, newest first. */
  export function burnoutEvidenceCalls(
  	agentId: string,
  	limit = 8
  ): BurnoutEvidenceCall[] {
  	const thresholds = useSettingsStore.getState().thresholds;
  	const negative = negativeEmotionsOf(thresholds.sentiment);
  	const last30 = daysWindow(0, 30);
  	const mine = within(
  		TEAM_CALLS.filter((c) => c.agentId === agentId),
  		last30
  	);
  	const teamAht =
  		mean(within(TEAM_CALLS, last30).map((c) => c.handleTimeSeconds)) ?? 0;
  	return mine
  		.map((call) => {
  			const reasons: BurnoutEvidenceCall['reasons'] = [];
  			if (call.afterHours) reasons.push('afterHours');
  			if (isNegativeEmotion(call.agentEmotion, negative))
  				reasons.push('negativeEmotion');
  			if (teamAht > 0 && call.handleTimeSeconds > teamAht * 1.3)
  				reasons.push('longHandle');
  			if (call.agentSentiment < 3) reasons.push('lowSentiment');
  			return { call, reasons };
  		})
  		.filter((e) => e.reasons.length > 0)
  		.sort((a, b) => b.call.date.localeCompare(a.call.date))
  		.slice(0, limit);
  }
  ```

  (`daysWindow`, `within`, `mean`, `negativeEmotionsOf`, `isNegativeEmotion`, `useSettingsStore`, `TEAM_CALLS` are all already used in this file — verified.)

- [ ] **2.2** `npm run typecheck`; commit with Task 3.

## Task 3 — Burnout tab

**Files:** `team/constants.ts`, `AgentProfilePage.tsx`, new `tabs/BurnoutTab.tsx`, locales.

- [ ] **3.1** `constants.ts`: add `'burnout'` to `ProfileTab` and a `PROFILE_TABS` entry after `operations`:
      `{ value: 'burnout', labelKey: 'tabs.burnout', icon: IconFlame }` (import `IconFlame`).
- [ ] **3.2** `AgentProfilePage.tsx`: import `BurnoutTab`; add
  ```tsx
  <Tabs.Panel value='burnout' pt='md'>
  	<BurnoutTab
  		profile={profile}
  		role={role}
  		onScheduleCoaching={() => setCoachingOpen(true)}
  	/>
  </Tabs.Panel>
  ```
- [ ] **3.3** `BurnoutTab.tsx` (props `{ profile: AgentProfile; role: TeamRole; onScheduleCoaching: () => void }`). Data (all `useMemo`):
  - `rules = useTriggerRulesStore(selectTriggerRules)`; `assessment = assessBurnout(profile.agent.id, rules)`.
  - `workload = computeWorkload(profile.agent.id, TEAM_CALLS, scopeTeamCalls)` where `scopeTeamCalls = TEAM_CALLS.filter(c => c.team === profile.agent.team)`.
  - `evidenceCalls = burnoutEvidenceCalls(profile.agent.id)`.
  - `history = buildActionHistory(burnoutActions.filter(a => a.agentId === id), coachingSessions.filter(s => s.agentId === id), lmsAssignments.filter(a => a.agentId === id), since, labels)` with `since = day(TODAY, -90)`; `labels` from i18n keys `burnout.history.coaching|lms`, `contentTitle` from `useLmsStore(selectContent)`.
    Layout (`<Stack gap='md'>`), each block a `SectionCard`:
  1. **Header summary**: level `Badge` (green/yellow/red like `TeamBurnoutRiskCard.LEVEL_COLOR`), `Progress` + `assessment.percentage`%, trend icon/label (`profile.risk.burnout.trend`), text `burnout.summary` = "{{breached}} breached · {{near}} near of {{total}} conditions" from `assessment`. Button "Schedule coaching" → `onScheduleCoaching`.
  2. **Why this score — rule drivers** (`BaseTable`, rows = `assessment.drivers`): columns Rule (`driver.ruleName`; a `Badge` "Matched" when `assessment.matchedRuleIds.includes(driver.ruleId)`), Condition (`describeCondition(tTriggers, driver.condition)`), Current value (`driver.currentValue ?? '—'`), Status (Badge: BREACHED red / NEAR yellow / OK gray). Footer link "Manage burnout rules" → `/qa/{role}/triggers`.
  3. **Workload vs team** (`SimpleGrid` of `StatCard variant='compact'`): calls/day (`workload.callsPerDay` vs `teamCallsPerDay`), AHT (formatSeconds, vs team), after-hours share %, consecutive days, negative-emotion share %, recovery rate %. Each card shows a secondary line "Team: X"; color the value red (`var(--mantine-color-red-text)`) only when worse than team by >20%.
  4. **Calls behind the signal** (`BaseTable`, rows = `evidenceCalls`): Date, Call (id), Reasons (badges from `burnout.callReason.<key>`), action icon button → `navigate(\`/qa/campaigns/${call.campaignId}/calls/${call.id}\`)`(route`campaigns/:campaignId/calls/:callId`exists,`routes.tsx:1559`). Empty state `burnout.noCalls`.
  5. **Trend** (`AreaChart`, same props as `OverviewTab` lines 192-200: `data={profile.risk.burnoutTrend} dataKey='label' series={[{ name: 'percentage', color: 'gray.6' }]}`), title `burnout.trend`.
  6. **Actions taken** (`Timeline` or `BaseTable`, rows = `history`): date, kind label, title, by, status badge (PLANNED/IN_PROGRESS/DONE). Empty `burnout.noActions`.
- [ ] **3.3b** i18n `qa.team.json` (en + es): `tabs.burnout` ("Burnout"/"Burnout"); block `burnout`:
      `summary`, `scheduleCoaching`, `drivers.title|description|columns{rule,condition,value,status}|matched|manageRules`,
      `driverStatus{BREACHED,NEAR,OK}`, `workload.title|callsPerDay|aht|afterHours|consecutiveDays|negativeEmotion|recovery|team`,
      `calls.title|description|columns{date,call,reasons}|empty`, `callReason{afterHours,negativeEmotion,longHandle,lowSentiment}`,
      `trend`, `history{title,coaching,lms,empty}`. Write the Spanish in the same commit. (Existing keys `burnout`/`overview.burnout`
      in `qa.team.json` stay; place the new object under a new key `burnoutTab` to avoid clashing with the existing `"burnout": {low,medium,high}` at line 98.)
- [ ] **3.4** `npm run typecheck`; commit `feat(qa-team): add a Burnout tab to the agent profile with the evidence behind the risk score`.

## Verification

1. `npm run typecheck` clean.
2. Read-through: `TeamBurnoutRiskCard` name is an `Anchor` navigating to `…?tab=burnout`; `ProfileTab` includes `burnout`;
   `PROFILE_TABS` has the entry; `AgentProfilePage` renders the panel; every `t('burnoutTab.*')` key exists in en and es.
3. If the user runs the app: Supervisor dashboard → Burnout Risk → click "David Brown" → Agent Profile, Burnout tab shows HIGH 95%,
   the breached rule conditions, workload cards, flagged calls linking to call detail, trend and actions; Schedule coaching opens the session editor.
