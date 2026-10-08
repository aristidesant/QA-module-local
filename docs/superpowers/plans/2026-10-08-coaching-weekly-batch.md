# Coaching Sessions: Weekly Pre-loaded Coaching Batch (1:1 vs AI), Session Brief, History — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Project override on testing:** per `CLAUDE.md` ("Do not create tests unless explicitly requested") and
> `DESIGN_ROLE.md` (stakeholder-mockup session), **no test-writing steps**. Each task's verification is
> `npm run typecheck` (must stay clean). Do not run the dev server.
>
> **When executing:** first copy this file to `docs/superpowers/plans/2026-10-08-coaching-weekly-batch.md`, then
> follow tasks in order on the current branch `feature/coaching-agent-post-coaching` (it already holds the
> post-coaching agent page work). One commit per task; finish every edit of a task before staging (husky runs `tsc`
> over the whole project). Commit trailer: `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

## Context

Supervisors prepare each coaching session by hand: they pick the agent, dig through last week's calls, decide what
to say and which material to assign. The user (product designer, stakeholder mockup) wants the platform to do that
work every week and hand the supervisor **pre-loaded sessions** that reduce effort and cognitive load:

- Every week the platform generates a **batch** for the supervisor's team. For each agent it decides whether they
  get a **1:1 with the supervisor** or only the **automatic coaching message** in their inbox.
- A pre-loaded 1:1 carries a **brief** built from the agent's calls of the week: weak aspects, evidence calls, a
  paragraph suggesting how the supervisor should approach it, a conceptual solution, a real example, the didactic
  material to propose, and what improved (or not) since the previous session.
- The Sessions tab also needs a **history** where the supervisor opens past sessions and past coaching of any of
  their agents.

Decisions confirmed with the user (2026-10-08):

| Decision        | Choice                                                                                                                                                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1:1 vs AI       | **Weekly tier + trend**: Critical and Needs improvement → 1:1; Good that **declined** vs the previous week → 1:1; Excellent and stable Good → AI message only. Reuses `scorecard.ts` (tiers, ±3 trend band).               |
| Initial state   | 1:1s are born **Proposed**: pre-loaded brief, the supervisor **schedules** (picks date/modality), **sends as AI message** instead, or **dismisses**. Nothing reaches the agent until scheduled.                            |
| Trigger         | Generated **automatically one day before the coaching day** (configurable weekday, default Tuesday → batch every Monday 08:00). No manual button; the UI shows the coaching-day setting and when the next batch generates. |
| Sessions layout | Segmented control with three views: **Weekly batch · Agenda · History**.                                                                                                                                                   |

Claude's decisions (redirectable): the batch is the weekly run of the existing rule `cr-000` "Weekly QA review"
(cadence WEEKLY, `lastTriggeredAt 2026-09-07T08:00Z`), so every batch session carries `ruleId: 'cr-000'` and the two
Team 1 AI messages already seeded for that run (`coa-a04-weekly`, `coa-a06-weekly`) are **reused** as the batch's AI
items instead of duplicated. If no agent qualifies for a 1:1, the weakest agent of the week still gets one
(`WEAKEST_OF_WEEK`) so the supervisor always has at least one prepared session. Findings use the existing
call-issue taxonomy (`calls/issues.ts`, labels in `qa.calls` `issues.<key>`); guidance copy comes from a mock
**playbook** keyed by issue (English, like `COACHING_TOPICS`).

**Mock-clock facts (verified):** `NOW_ISO = 2026-09-12T15:00Z` (Saturday), `TODAY = '2026-09-12'`. Seeded batch:
generated Mon **2026-09-07 08:00** (`WEEKLY_RUN_AT`) for coaching day Tue 2026-09-08, analysing calls **Aug 31 →
Sep 6**. Next batch shown in the UI: Mon 14 Sep 08:00 (coaching Tue 15 Sep). Team 1 (SUP-001 Maria García) =
AGT-001..AGT-007. `TEAM_CALLS` has 180 days with "rough patch" calls for some agents, so tiers vary.

## Architecture (reuse-first)

- **Model** (`models/qa/coaching.ts`): new status `PROPOSED`; `CoachingBrief` (+ finding / previous types);
  `CoachingWeeklyBatch` / `CoachingBatchItem`; `CoachingSessionRecord` gets optional `brief` and `batchId`.
- **Generator** (`coaching/weeklyBatch.ts`): pure functions `decideBatchItem`, `buildFindings`,
  `buildCoachingBrief`, `buildWeeklyBatch`, `nextBatchAt`. Reuses `buildWeeklyScorecard` / `scorecardTrend` /
  `tierFor` (`scorecard.ts`), `agentCallsBetween` (`calls/agentMetrics.ts`), `callIssues` / `CALL_ISSUE_BY_KEY`
  (`calls/issues.ts`), `lastCompletedSession` / `verdictForDelta` (`postCoaching.ts`), `buildAiCoachingMessage`
  (`helpers.ts`).
- **Playbook** (`coaching/playbook.ts`): per issue → topic, evaluation area, suggested LMS content ids, approach,
  solution, example.
- **Seeds + store**: `mockData.ts` builds the Sep-7 batch with the generator; `coachingStore.ts` gets `batches`,
  `coachingDay`, `setCoachingDay`, `scheduleProposed`, `sendProposedAsAiMessage`, `dismissProposed`.
- **UI**: `WeeklyBatchPanel` (batch view), `SessionBrief` (brief sections inside `SessionDetailDrawer`), proposed
  actions in the drawer, `SessionsTab` re-organised into batch / agenda / history. Agents never see PROPOSED
  sessions (`AgentCoachingTab` filter) and the calendar hides them.

## Global Constraints

- Mantine CSS variables / color names only; no hardcoded hex; dark + light must both work.
- No new inline `style={{}}` (pre-commit hook). Pre-wrapped text uses the existing `queueStyles.preWrap` class
  (`coaching/components/Queue.module.css`).
- Every string through i18n: `qa.coaching` (new keys below, **both** `src/locales/en` and `src/locales/es`), issue
  labels from `qa.calls` `issues.<key>` (namespace added to the coaching routes), verdicts from `qa.lms`.
- Reuse `SectionCard`, `AppDrawer` (already used by the drawer), `BaseTable`, `StatCard`, `EmptyState`,
  `AppSegmentedControl`, existing badges (`ScorecardBadges.tsx`, `lms/components/Badges.tsx`).
- `npm run typecheck` clean after every task; `noUnusedLocals` is on.
- Commit style: `feat(qa-coaching): …`.

---

## File Structure

**New**

- `src/modules/qa/coaching/playbook.ts` — `COACHING_PLAYBOOK`, `CLEAN_WEEK_PLAYBOOK`.
- `src/modules/qa/coaching/weeklyBatch.ts` — brief + batch generator, `nextBatchAt`, `mondayOf`.
- `src/modules/qa/coaching/components/SessionBrief.tsx` — brief sections for the detail drawer.
- `src/modules/qa/coaching/components/WeeklyBatchPanel.tsx` — "Weekly batch" view of the Sessions tab.

**Modified**

- `src/models/qa/coaching.ts`, `src/modules/qa/coaching/constants.ts`, `src/modules/qa/qaNamespaces.ts`
- `src/modules/qa/coaching/mockData.ts`, `src/stores/qa/coachingStore.ts`
- `src/modules/qa/coaching/components/SessionDetailDrawer.tsx`
- `src/modules/qa/coaching/CoachingPage/CoachingPage.tsx`, `src/modules/qa/coaching/CoachingAgentPage/CoachingAgentPage.tsx`
  (pass `role` to the drawer)
- `src/modules/qa/coaching/CoachingPage/tabs/SessionsTab.tsx`
- `src/modules/qa/lms/AgentLmsPage/tabs/AgentCoachingTab.tsx` (hide PROPOSED from agents)
- `src/locales/en/qa.coaching.json`, `src/locales/es/qa.coaching.json`

**Untouched:** `SessionForm.tsx`, `EvidenceCallsModal.tsx`, `SessionsCalendar.tsx`, `AgentSessionsTable.tsx`,
`RulesTab.tsx`, `scorecard.ts`, `postCoaching.ts`.

---

## Task 1 — Model, constants, namespaces

**Files:** `src/models/qa/coaching.ts`, `src/modules/qa/coaching/constants.ts`, `src/modules/qa/qaNamespaces.ts`.

**Verified facts:** `CoachingSessionStatus` is at `models/qa/coaching.ts:76-80`; `CoachingSessionRecord` at 92-130
ends with `ruleId: string | null; cohortId: string | null;`. `SESSION_STATUSES` / `SESSION_STATUS_COLOR` at
`constants.ts:97-108`. `qaNamespaces.ts:149-150` and `211-222` list the coaching page / agent page namespaces
(`qa.coaching`, `qa.lms`, `qa.triggers`, `qa.team`); `qa.calls` is **not** loaded there today.

- [ ] **1.1** `models/qa/coaching.ts`:
  - `CoachingSessionStatus` → `'PROPOSED' | 'SCHEDULED' | 'COMPLETED' | 'MISSED' | 'CANCELLED'` with the comment
    `/** PROPOSED = pre-loaded by the weekly batch, waiting for the supervisor to schedule it. */`.
  - After `CoachingActionItem` add:

    ```ts
    /** Why the weekly batch chose a 1:1 or an AI message for an agent. */
    export type CoachingBatchReason =
    	| 'TIER_CRITICAL'
    	| 'TIER_NEEDS_IMPROVEMENT'
    	| 'GOOD_DECLINED'
    	| 'WEAKEST_OF_WEEK'
    	| 'STABLE';

    export type CoachingBatchDecision = 'ONE_ON_ONE' | 'AI_MESSAGE';

    /** One weak aspect found in the agent's calls of the week. */
    export interface CoachingBriefFinding {
    	/** `CallIssueKey` from calls/issues.ts; label = qa.calls `issues.<key>`. */
    	issue: string;
    	aspect: 'qa' | 'compliance' | 'sentiment' | 'operational';
    	/** Calls of the week with this issue. */
    	calls: number;
    	/** Share of the week's calls, 0-100. */
    	share: number;
    	/** Up to 3 call ids that show it, worst QA score first. */
    	evidenceCallIds: string[];
    }

    /** How the aspect worked on in the previous coach-led session moved since then. */
    export interface CoachingBriefPrevious {
    	sessionId: string;
    	topic: string;
    	date: string;
    	/** Scorecard aspect of that session's area; null → the composite score. */
    	dimension: 'qa' | 'compliance' | 'operational' | 'business' | null;
    	before: number;
    	after: number;
    	verdict: 'IMPROVED' | 'SAME' | 'DECLINED';
    }

    /** Everything the platform pre-loads into a weekly session. Mock copy is English-only. */
    export interface CoachingBrief {
    	/** Analysed week, 'YYYY-MM-DD' inclusive. */
    	weekFrom: string;
    	weekTo: string;
    	calls: number;
    	/** Weekly composite scorecard 0-100 and the previous week's. */
    	score: number;
    	previousScore: number | null;
    	tier: 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT' | 'CRITICAL';
    	trend: 'IMPROVED' | 'SAME' | 'DECLINED' | null;
    	reason: CoachingBatchReason;
    	findings: CoachingBriefFinding[];
    	/** How the supervisor should bring it up with the agent. */
    	approach: string;
    	/** Conceptual fix for the weak aspect. */
    	solution: string;
    	/** A concrete script / real example. */
    	example: string;
    	suggestedContentIds: string[];
    	previous: CoachingBriefPrevious | null;
    }

    export interface CoachingBatchItem {
    	agentId: string;
    	agentName: string;
    	decision: CoachingBatchDecision;
    	reason: CoachingBatchReason;
    	/** The proposed 1:1 or the AI message created (or reused) for the agent. */
    	sessionId: string;
    }

    /** One weekly run for one supervisor's team, generated the day before the coaching day. */
    export interface CoachingWeeklyBatch {
    	id: string;
    	supervisorId: string;
    	generatedAt: string;
    	/** 'YYYY-MM-DD' coaching day the batch was prepared for. */
    	coachingDate: string;
    	weekFrom: string;
    	weekTo: string;
    	items: CoachingBatchItem[];
    }
    ```

  - `CoachingSessionRecord`: after `cohortId: string | null;` add
    ```ts
    /** Pre-loaded content when the session comes from a weekly batch. */
    brief?: CoachingBrief | null;
    batchId?: string | null;
    ```
    (optional on purpose so the many existing literals in `mockData.ts` stay untouched).

- [ ] **1.2** `coaching/constants.ts`: `SESSION_STATUSES` → `['PROPOSED', 'SCHEDULED', 'COMPLETED', 'MISSED', 'CANCELLED']`;
      `SESSION_STATUS_COLOR` add `PROPOSED: 'violet',` first. Add after `SESSION_STATUS_COLOR`:
  ```ts
  /** JS weekday (0 = Sunday) the supervisor holds coaching; the batch generates the day before at 08:00. */
  export const DEFAULT_COACHING_DAY = 2;
  export const BATCH_GENERATION_HOUR = '08:00:00Z';
  export const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const;
  ```
- [ ] **1.3** `qaNamespaces.ts`: append `'qa.calls'` to the arrays of `qa.supervisor.coaching`, `qa.qa-manager.coaching`,
      `qa.supervisor.coaching.agent`, `qa.qa-manager.coaching.agent` (issue labels in the brief).
- [ ] **1.4** `npm run typecheck` (clean: only optional fields and a wider union were added) → commit
      `feat(qa-coaching): proposed session status and weekly batch / brief model`.

---

## Task 2 — Playbook and weekly batch generator

**Files:** `src/modules/qa/coaching/playbook.ts` (new), `src/modules/qa/coaching/weeklyBatch.ts` (new).

**Verified facts:** `CallIssueKey` (14 keys), `CALL_ISSUE_ASPECTS`, `CALL_ISSUE_BY_KEY[key].aspect/color`,
`callIssues(call): CallIssueKey[]` in `calls/issues.ts`. `TeamCallMetric` has `id`, `date`, `qaScore`.
`EvaluationArea` = QUALITY_ASSURANCE | COMPLIANCE | SENTIMENT_EMOTION | BUSINESS_INSIGHTS (`models/qa/triggerRules.ts`).
`LMS_CONTENT` ids/areas: c01 opening, c02 needs assessment, c03 objection handling, c04 closing, c05 QA quiz, c07
auto-fail video, c08 regulatory disclosures, c09 data protection, c10 transparency & consent, c12 practice: skip the
disclosure, c13 do-not-call, c14 active listening & empathy, c15 de-escalation, c16 empathy statements, c17 practice:
turning a negative call around, c19 managing your own stress, c22 practice: the early objection.
`buildWeeklyScorecard(calls)`, `scorecardTrend(current, previous)`, `tierFor(score)`, `SCORECARD_DIMENSION_ORDER`,
`type ScorecardDimension`, `type WeeklyScorecard` in `scorecard.ts`; `lastCompletedSession(sessions, agentId)`,
`verdictForDelta(delta)` in `postCoaching.ts`; `agentCallsBetween(agentId, from, to)`; `TODAY`, `addDays` in
`analytics/constants.ts`; `buildAiCoachingMessage(profile, ruleName, titles)` in `coaching/helpers.ts`;
`RosterAgent { id, name, supervisorId, supervisorName, team, … }`, `AgentProfile` in `team/types.ts`.

- [ ] **2.1** Create `playbook.ts`:

  ```ts
  import type { EvaluationArea } from '~/models/qa';
  import type { CallIssueKey } from '~/modules/qa/calls/issues';

  export interface PlaybookEntry {
  	/** Session topic (also the mock talking-point wording). */
  	topic: string;
  	area: EvaluationArea;
  	/** LMS content ids to suggest, best first. */
  	contentIds: string[];
  	/** How the supervisor should bring it up with the agent. */
  	approach: string;
  	/** Conceptual fix. */
  	solution: string;
  	/** A concrete script or real example. */
  	example: string;
  }

  /** Mock guidance per call issue — English-only, like COACHING_TOPICS. */
  export const COACHING_PLAYBOOK: Record<CallIssueKey, PlaybookEntry> = {
  	'auto-fail': {
  		topic: 'Auto-fail prevention',
  		area: 'QUALITY_ASSURANCE',
  		contentIds: ['lms-c07', 'lms-c05'],
  		approach:
  			'Open with the fact, not the verdict: play the exact moment of the auto-fail and ask the agent what they would do differently. Auto-fails feel like a judgement on the person, so keep the focus on the one step that was skipped, and make clear the goal is zero repeats, not blame.',
  		solution:
  			'Turn the critical steps into a non-negotiable checklist the agent runs before moving on: identity confirmed, mandatory disclosure read, consent captured. The step is done when it is said out loud, not when it is "known".',
  		example:
  			'Call TCALL-… last Thursday: the customer interrupted during identification and the agent moved to the pitch without finishing it. Script: "Before I continue, I just need to confirm two details with you — your date of birth and the postcode on the account."',
  	},
  	'qa-ecn': {
  		topic: 'Critical business errors',
  		area: 'QUALITY_ASSURANCE',
  		contentIds: ['lms-c07', 'lms-c03'],
  		approach:
  			'Show the agent the business consequence of the error (a wrong plan, a missed cancellation) rather than the scoring rule. Ask them to narrate the call back to you — most ECN errors come from assuming instead of confirming.',
  		solution:
  			'Introduce a "confirm before commit" habit: every change to the account is read back to the customer and acknowledged before it is saved.',
  		example:
  			'"So just to confirm: you want to move to the 50 GB plan from the 1st of next month and keep the same number — is that right?" Then wait for the yes.',
  	},
  	'qa-enc': {
  		topic: 'Non-critical errors',
  		area: 'QUALITY_ASSURANCE',
  		contentIds: ['lms-c03', 'lms-c04'],
  		approach:
  			'These are the errors that add up: skipped recap, no next step, closing too fast. Pick two calls and go through the last 60 seconds of each with the agent; the pattern is usually the same.',
  		solution:
  			'Standardise the close: summarise what was done, state the next step and when, and ask if anything is unclear. Three sentences, every call.',
  		example:
  			'"Today we fixed the billing address and I have raised the refund — you will see it within five working days. Is there anything else you would like me to check before we end?"',
  	},
  	'qa-ecc': {
  		topic: 'Critical compliance errors',
  		area: 'COMPLIANCE',
  		contentIds: ['lms-c12', 'lms-c08'],
  		approach:
  			'Treat it as a process gap, not a knowledge gap: the agent knows the disclosure, they skipped it under pressure. Ask when in the call they feel the pressure and anchor the disclosure before that moment.',
  		solution:
  			'Move the disclosure to the start of the relevant block, before the customer can interrupt, and read it from the script word for word.',
  		example:
  			'Before the offer: "This call is recorded for quality purposes and the plan I am about to describe has a 24-month term with an early-exit fee — I will send the details in writing." Then the pitch.',
  	},
  	'qa-ecuf': {
  		topic: 'End-user critical errors',
  		area: 'QUALITY_ASSURANCE',
  		contentIds: ['lms-c01', 'lms-c02'],
  		approach:
  			'The customer left the call worse off (wrong information, unmet need). Listen to one call together and stop at the moment the need was misunderstood; ask the agent what question would have surfaced it.',
  		solution:
  			'Two discovery questions before any answer, and a one-line restatement of the need: "So what you need is…". Answer only after the restatement is confirmed.',
  		example:
  			'"Just so I get this right: the issue is not the price of the plan, it is that the second line stopped working after the change — correct?"',
  	},
  	'low-qa-score': {
  		topic: 'QA fundamentals',
  		area: 'QUALITY_ASSURANCE',
  		contentIds: ['lms-c05', 'lms-c02'],
  		approach:
  			'Several small things rather than one big one. Share the scorecard breakdown and let the agent choose the single aspect they want to fix this week — ownership beats a list of ten corrections.',
  		solution:
  			"One behaviour per week, measured on next week's scorecard. Keep the rest of the evaluation as context, not as targets.",
  		example:
  			'Agreed behaviour for the week: "Open every call with the identification script in full." Check it on three calls on Friday together.',
  	},
  	'compliance-security': {
  		topic: 'Security protocol & data protection',
  		area: 'COMPLIANCE',
  		contentIds: ['lms-c09'],
  		approach:
  			'Be direct: identity checks and data handling are not negotiable. Replay a call where the check was partial and ask the agent what a fraudster could have done with what was shared.',
  		solution:
  			'Full identity verification before any account detail is read out, no exceptions for "regular" customers, and never repeat card or ID numbers back on the line.',
  		example:
  			'"I can see the account, but before I share anything I need to verify you — can you confirm the security answer you set up?" If it fails twice, offer the written route instead.',
  	},
  	'compliance-regulatory': {
  		topic: 'Mandatory disclosures',
  		area: 'COMPLIANCE',
  		contentIds: ['lms-c08', 'lms-c10'],
  		approach:
  			'Ask the agent to recite the disclosure from memory; most gaps are a paraphrase that drops a required clause. Compare it with the approved text side by side.',
  		solution:
  			'Read the disclosure from the script, in full, at the point the process defines — and confirm the customer heard it ("Is that clear?").',
  		example:
  			'"The price is 29.90 a month for 12 months, then 34.90. You can cancel within 14 days without any charge. Shall I go ahead?"',
  	},
  	'compliance-legal': {
  		topic: 'Consent & terms acknowledgment',
  		area: 'COMPLIANCE',
  		contentIds: ['lms-c13', 'lms-c10'],
  		approach:
  			'Explain why an implicit yes is not consent: the recording must contain the explicit agreement. Play the call and point to where the agent moved on without it.',
  		solution:
  			'Always close the legal block with a yes/no question and wait for the answer before any change is made.',
  		example:
  			'"Do you agree to the terms I have just read and authorise the change today?" — and a pause until the customer says yes.',
  	},
  	'negative-customer-emotion': {
  		topic: 'De-escalation',
  		area: 'SENTIMENT_EMOTION',
  		contentIds: ['lms-c15', 'lms-c17'],
  		approach:
  			'Start by acknowledging that angry calls are hard, then listen to one together and mark the moment the tone shifted. Usually the agent defended the process instead of acknowledging the frustration.',
  		solution:
  			'Acknowledge first, solve second: name the emotion, apologise for the experience (not the policy), and only then move to the next step.',
  		example:
  			'"I can hear this has been really frustrating, and you have been patient for far too long. Let me fix it now: here is what I am going to do…"',
  	},
  	'negative-agent-emotion': {
  		topic: 'Keeping your own tone steady',
  		area: 'SENTIMENT_EMOTION',
  		contentIds: ['lms-c19'],
  		approach:
  			"This is about the agent's wellbeing as much as the customer's. Ask how the week felt before you show any call, and check for queue pressure or back-to-back escalations.",
  		solution:
  			'Micro-recovery between calls (a breath, a note, a reset of the greeting) and an agreed signal to take a five-minute break after a hard call.',
  		example:
  			'After an escalation: 30 seconds of wrap-up before the next call, greeting re-read aloud. Agreed: the agent can flag "I need five" in the team chat without explanation.',
  	},
  	'low-customer-sentiment': {
  		topic: 'Empathy & active listening',
  		area: 'SENTIMENT_EMOTION',
  		contentIds: ['lms-c14', 'lms-c16'],
  		approach:
  			'Customers are leaving neutral-to-cold rather than angry. Listen to a call and count the empathy statements; often there are none, only process. Ask the agent what the customer felt.',
  		solution:
  			'One acknowledgement per customer statement before moving on, and a warmer close that names what was done for them.',
  		example:
  			'"That makes sense — nobody wants to be charged twice. I have removed it and I will make sure it does not happen again next month."',
  	},
  	'low-agent-sentiment': {
  		topic: 'Agent tone & energy',
  		area: 'SENTIMENT_EMOTION',
  		contentIds: ['lms-c19', 'lms-c16'],
  		approach:
  			'Flat tone reads as disinterest to the customer. Share one call and ask the agent to rate their own energy; then ask what would make the next shift easier.',
  		solution:
  			'A short tonal reset at the start of each call (smile, name, pace) and shorter blocks of back-to-back calls where the schedule allows.',
  		example:
  			'Greeting re-recorded together: "Good morning, this is John from NewTech — how can I help you today?" at a slightly faster pace and with the customer\'s name used once early.',
  	},
  	'non-effective-contact': {
  		topic: 'Effective contacts',
  		area: 'BUSINESS_INSIGHTS',
  		contentIds: ['lms-c02', 'lms-c22'],
  		approach:
  			'Many calls end without reaching the person or the goal. Review the opening of three calls: the agent often loses the contact in the first 15 seconds by starting with the pitch.',
  		solution:
  			'Confirm the right person and a reason to stay on the line before anything else; if it is not the right time, agree a callback instead of pushing.',
  		example:
  			'"Am I speaking with Ms Martínez? Great — I am calling about the line you asked us to look at last week; do you have two minutes now or shall I call back at six?"',
  	},
  };

  /** Used when the week had no incident at all. */
  export const CLEAN_WEEK_PLAYBOOK: PlaybookEntry = {
  	topic: 'Weekly coaching review',
  	area: 'QUALITY_ASSURANCE',
  	contentIds: [],
  	approach:
  		'A clean week: no incident was detected in the evaluated calls. Use the session to recognise what went well and to agree the one skill the agent wants to stretch next.',
  	solution:
  		'Keep the current routine and pick a development goal (mentoring a newer colleague, handling a harder queue) rather than a correction.',
  	example:
  		'"Your calls this week were spotless — which part of the job would you like to get better at next?"',
  };
  ```

- [ ] **2.2** Create `weeklyBatch.ts`:

  ```ts
  import type {
  	CoachingBatchDecision,
  	CoachingBatchReason,
  	CoachingBrief,
  	CoachingBriefFinding,
  	CoachingBriefPrevious,
  	CoachingSessionRecord,
  	CoachingWeeklyBatch,
  	EvaluationArea,
  	LmsAssignment,
  	LmsContent,
  } from '~/models/qa';
  import { TODAY, addDays } from '~/modules/qa/analytics/constants';
  import type { TeamCallMetric } from '~/modules/qa/analytics/types';
  import { agentCallsBetween } from '~/modules/qa/calls/agentMetrics';
  import {
  	CALL_ISSUE_ASPECTS,
  	CALL_ISSUE_BY_KEY,
  	callIssues,
  	type CallIssueKey,
  } from '~/modules/qa/calls/issues';
  import type { AgentProfile, RosterAgent } from '~/modules/qa/team/types';
  import { BATCH_GENERATION_HOUR } from './constants';
  import { buildAiCoachingMessage } from './helpers';
  import { CLEAN_WEEK_PLAYBOOK, COACHING_PLAYBOOK } from './playbook';
  import { lastCompletedSession, verdictForDelta } from './postCoaching';
  import {
  	buildWeeklyScorecard,
  	scorecardTrend,
  	tierFor,
  	type ScorecardDimension,
  	type WeeklyScorecard,
  } from './scorecard';

  export const WEEKLY_RULE_ID = 'cr-000';
  const MAX_FINDINGS = 2;
  const MAX_EVIDENCE = 3;
  const MAX_SUGGESTED = 3;

  /** Monday of the week that contains `day` ('YYYY-MM-DD'). */
  export const mondayOf = (day: string): string => {
  	const offset = (new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7;
  	return addDays(day, -offset);
  };

  /** Next coaching day strictly after `from`, and the generation moment the day before at 08:00. */
  export const nextBatchAt = (
  	coachingDay: number,
  	from: string = TODAY
  ): { coachingDate: string; generatedAt: string } => {
  	let coachingDate = addDays(from, 1);
  	while (new Date(`${coachingDate}T00:00:00Z`).getUTCDay() !== coachingDay)
  		coachingDate = addDays(coachingDate, 1);
  	return {
  		coachingDate,
  		generatedAt: `${addDays(coachingDate, -1)}T${BATCH_GENERATION_HOUR}`,
  	};
  };

  /** Tier + trend rule agreed with the user: Critical / Needs improvement / declining Good → 1:1. */
  export const decideBatchItem = (
  	current: WeeklyScorecard | null,
  	previous: WeeklyScorecard | null
  ): { decision: CoachingBatchDecision; reason: CoachingBatchReason } => {
  	if (!current) return { decision: 'AI_MESSAGE', reason: 'STABLE' };
  	const tier = tierFor(current.score);
  	if (tier === 'CRITICAL')
  		return { decision: 'ONE_ON_ONE', reason: 'TIER_CRITICAL' };
  	if (tier === 'NEEDS_IMPROVEMENT')
  		return { decision: 'ONE_ON_ONE', reason: 'TIER_NEEDS_IMPROVEMENT' };
  	if (
  		tier === 'GOOD' &&
  		scorecardTrend(current, previous)?.verdict === 'DECLINED'
  	)
  		return { decision: 'ONE_ON_ONE', reason: 'GOOD_DECLINED' };
  	return { decision: 'AI_MESSAGE', reason: 'STABLE' };
  };

  /** The two most frequent incidents of the week, with the worst calls as evidence. */
  export const buildFindings = (
  	calls: TeamCallMetric[]
  ): CoachingBriefFinding[] => {
  	const byIssue = new Map<CallIssueKey, TeamCallMetric[]>();
  	for (const call of calls)
  		for (const key of callIssues(call))
  			byIssue.set(key, [...(byIssue.get(key) ?? []), call]);
  	const aspectRank = (key: CallIssueKey) =>
  		CALL_ISSUE_ASPECTS.indexOf(CALL_ISSUE_BY_KEY[key].aspect);
  	return [...byIssue.entries()]
  		.sort(
  			(a, b) =>
  				b[1].length - a[1].length || aspectRank(a[0]) - aspectRank(b[0])
  		)
  		.slice(0, MAX_FINDINGS)
  		.map(([issue, list]) => ({
  			issue,
  			aspect: CALL_ISSUE_BY_KEY[issue].aspect,
  			calls: list.length,
  			share: Math.round((list.length / calls.length) * 100),
  			evidenceCallIds: [...list]
  				.sort((x, y) => x.qaScore - y.qaScore)
  				.slice(0, MAX_EVIDENCE)
  				.map((c) => c.id),
  		}));
  };

  const AREA_TO_SCORECARD: Record<EvaluationArea, ScorecardDimension | null> = {
  	QUALITY_ASSURANCE: 'qa',
  	COMPLIANCE: 'compliance',
  	BUSINESS_INSIGHTS: 'business',
  	SENTIMENT_EMOTION: null,
  };

  const buildPrevious = (
  	agentId: string,
  	sessions: CoachingSessionRecord[],
  	weekFrom: string,
  	current: WeeklyScorecard | null
  ): CoachingBriefPrevious | null => {
  	const prev = lastCompletedSession(
  		sessions.filter((s) => s.date.slice(0, 10) < weekFrom),
  		agentId
  	);
  	if (!prev || !current) return null;
  	const monday = mondayOf(prev.date.slice(0, 10));
  	const then = buildWeeklyScorecard(
  		agentCallsBetween(agentId, monday, addDays(monday, 6))
  	);
  	if (!then) return null;
  	const dimension = prev.area ? AREA_TO_SCORECARD[prev.area] : null;
  	const before = dimension ? then.dimensions[dimension] : then.score;
  	const after = dimension ? current.dimensions[dimension] : current.score;
  	return {
  		sessionId: prev.id,
  		topic: prev.topic,
  		date: prev.date,
  		dimension,
  		before,
  		after,
  		verdict: verdictForDelta(after - before),
  	};
  };

  const playbookFor = (findings: CoachingBriefFinding[]) =>
  	findings.length
  		? COACHING_PLAYBOOK[findings[0].issue as CallIssueKey]
  		: CLEAN_WEEK_PLAYBOOK;

  export interface BriefInput {
  	agentId: string;
  	weekFrom: string;
  	weekTo: string;
  	sessions: CoachingSessionRecord[];
  	assignments: LmsAssignment[];
  }

  /** The brief plus the session fields derived from it (topic, area, evidence, talking points). */
  export const buildCoachingBrief = ({
  	agentId,
  	weekFrom,
  	weekTo,
  	sessions,
  	assignments,
  }: BriefInput): {
  	brief: CoachingBrief;
  	topic: string;
  	area: EvaluationArea;
  	evidenceCallIds: string[];
  	talkingPoints: string[];
  } => {
  	const calls = agentCallsBetween(agentId, weekFrom, weekTo);
  	const current = buildWeeklyScorecard(calls);
  	const previous = buildWeeklyScorecard(
  		agentCallsBetween(agentId, addDays(weekFrom, -7), addDays(weekFrom, -1))
  	);
  	const { reason } = decideBatchItem(current, previous);
  	const findings = buildFindings(calls);
  	const playbook = playbookFor(findings);
  	const secondary = findings[1]
  		? COACHING_PLAYBOOK[findings[1].issue as CallIssueKey]
  		: null;
  	const open = new Set(
  		assignments
  			.filter((a) => a.agentId === agentId && a.status !== 'COMPLETED')
  			.map((a) => a.contentId)
  	);
  	const suggestedContentIds = [
  		...new Set(
  			findings.flatMap(
  				(f) => COACHING_PLAYBOOK[f.issue as CallIssueKey].contentIds
  			)
  		),
  	]
  		.filter((id) => !open.has(id))
  		.slice(0, MAX_SUGGESTED);
  	const prev = buildPrevious(agentId, sessions, weekFrom, current);
  	const trend = scorecardTrend(current, previous);

  	const brief: CoachingBrief = {
  		weekFrom,
  		weekTo,
  		calls: calls.length,
  		score: current?.score ?? 0,
  		previousScore: previous?.score ?? null,
  		tier: current ? tierFor(current.score) : 'CRITICAL',
  		trend: trend?.verdict ?? null,
  		reason,
  		findings,
  		approach: secondary
  			? `${playbook.approach} ${secondary.approach}`
  			: playbook.approach,
  		solution: playbook.solution,
  		example: playbook.example,
  		suggestedContentIds,
  		previous: prev,
  	};

  	const talkingPoints = [
  		...findings.map(
  			(f) =>
  				`Listen together to ${f.evidenceCallIds.length} calls with ${COACHING_PLAYBOOK[f.issue as CallIssueKey].topic.toLowerCase()} (${f.calls} of ${calls.length} calls last week)`
  		),
  		...(prev
  			? [
  					`Check in on "${prev.topic}": ${prev.before} → ${prev.after} since that session`,
  				]
  			: []),
  		'Agree one behaviour to practise before next week',
  	];

  	return {
  		brief,
  		topic: playbook.topic,
  		area: playbook.area,
  		evidenceCallIds: [...new Set(findings.flatMap((f) => f.evidenceCallIds))],
  		talkingPoints,
  	};
  };

  export interface WeeklyBatchInput {
  	id: string;
  	supervisorId: string;
  	supervisorName: string;
  	generatedAt: string;
  	coachingDate: string;
  	agents: RosterAgent[];
  	sessions: CoachingSessionRecord[];
  	assignments: LmsAssignment[];
  	profiles: Record<string, AgentProfile>;
  	contentById: Record<string, LmsContent>;
  }

  export interface WeeklyBatchResult {
  	batch: CoachingWeeklyBatch;
  	/** New PROPOSED 1:1s and new AI messages. */
  	created: CoachingSessionRecord[];
  	/** AI messages that already existed for this run, now carrying the brief and batch id. */
  	patched: CoachingSessionRecord[];
  }

  /**
   * One weekly run for a supervisor: analyses the week before `generatedAt`,
   * decides 1:1 vs AI message per agent and pre-loads each session.
   */
  export const buildWeeklyBatch = (
  	input: WeeklyBatchInput
  ): WeeklyBatchResult => {
  	const weekTo = addDays(input.generatedAt.slice(0, 10), -1);
  	const weekFrom = addDays(weekTo, -6);
  	const blank = () => ({
  		acknowledged: false,
  		acknowledgedAt: null,
  		comment: null,
  	});

  	const prepared = input.agents.map((agent) => {
  		const calls = agentCallsBetween(agent.id, weekFrom, weekTo);
  		const current = buildWeeklyScorecard(calls);
  		const previous = buildWeeklyScorecard(
  			agentCallsBetween(
  				agent.id,
  				addDays(weekFrom, -7),
  				addDays(weekFrom, -1)
  			)
  		);
  		return { agent, current, ...decideBatchItem(current, previous) };
  	});
  	// The supervisor always gets at least one prepared 1:1: the weakest agent of the week.
  	if (!prepared.some((p) => p.decision === 'ONE_ON_ONE')) {
  		const weakest = [...prepared]
  			.filter((p) => p.current)
  			.sort((a, b) => a.current!.score - b.current!.score)[0];
  		if (weakest) {
  			weakest.decision = 'ONE_ON_ONE';
  			weakest.reason = 'WEAKEST_OF_WEEK';
  		}
  	}

  	const created: CoachingSessionRecord[] = [];
  	const patched: CoachingSessionRecord[] = [];
  	const items = prepared.map(({ agent, decision, reason }) => {
  		const built = buildCoachingBrief({
  			agentId: agent.id,
  			weekFrom,
  			weekTo,
  			sessions: input.sessions,
  			assignments: input.assignments,
  		});
  		const brief = { ...built.brief, reason };

  		if (decision === 'ONE_ON_ONE') {
  			const session: CoachingSessionRecord = {
  				id: `${input.id}-${agent.id}`,
  				agentId: agent.id,
  				agentName: agent.name,
  				coachId: input.supervisorId,
  				coachName: input.supervisorName,
  				coachRole: 'SUPERVISOR',
  				type: 'ONE_ON_ONE',
  				modality: 'IN_PERSON',
  				date: `${input.coachingDate}T10:00:00Z`,
  				durationMin: 30,
  				topic: built.topic,
  				area: built.area,
  				subItem: null,
  				evidenceCallIds: built.evidenceCallIds,
  				talkingPoints: built.talkingPoints,
  				notes: '',
  				aiMessage: null,
  				actionItems: [],
  				agentCommitment: blank(),
  				status: 'PROPOSED',
  				outcome: null,
  				followUpDate: null,
  				linkedAssignmentIds: [],
  				ruleId: WEEKLY_RULE_ID,
  				cohortId: null,
  				brief,
  				batchId: input.id,
  			};
  			created.push(session);
  			return {
  				agentId: agent.id,
  				agentName: agent.name,
  				decision,
  				reason,
  				sessionId: session.id,
  			};
  		}

  		const existing = input.sessions.find(
  			(s) =>
  				s.type === 'AI_MESSAGE' &&
  				s.agentId === agent.id &&
  				s.date === input.generatedAt
  		);
  		if (existing) {
  			patched.push({ ...existing, brief, batchId: input.id });
  			return {
  				agentId: agent.id,
  				agentName: agent.name,
  				decision,
  				reason,
  				sessionId: existing.id,
  			};
  		}

  		const profile = input.profiles[agent.id];
  		const titles = brief.suggestedContentIds
  			.map((id) => input.contentById[id]?.title)
  			.filter((x): x is string => Boolean(x));
  		const session: CoachingSessionRecord = {
  			id: `${input.id}-${agent.id}`,
  			agentId: agent.id,
  			agentName: agent.name,
  			coachId: 'QAM-001',
  			coachName: 'Elena Ruiz',
  			coachRole: 'QA_MANAGER',
  			type: 'AI_MESSAGE',
  			modality: null,
  			date: input.generatedAt,
  			durationMin: 0,
  			topic: 'Weekly QA review',
  			area: built.area,
  			subItem: null,
  			evidenceCallIds: built.evidenceCallIds,
  			talkingPoints: [],
  			notes: '',
  			aiMessage: profile
  				? buildAiCoachingMessage(profile, 'Weekly QA review', titles)
  				: brief.approach,
  			actionItems: [],
  			agentCommitment: blank(),
  			status: 'COMPLETED',
  			outcome: null,
  			followUpDate: null,
  			linkedAssignmentIds: [],
  			ruleId: WEEKLY_RULE_ID,
  			cohortId: null,
  			brief,
  			batchId: input.id,
  		};
  		created.push(session);
  		return {
  			agentId: agent.id,
  			agentName: agent.name,
  			decision,
  			reason,
  			sessionId: session.id,
  		};
  	});

  	return {
  		batch: {
  			id: input.id,
  			supervisorId: input.supervisorId,
  			generatedAt: input.generatedAt,
  			coachingDate: input.coachingDate,
  			weekFrom,
  			weekTo,
  			items,
  		},
  		created,
  		patched,
  	};
  };
  ```

- [ ] **2.3** `npm run typecheck` → commit `feat(qa-coaching): weekly batch generator with pre-loaded coaching briefs and playbook`.

---

## Task 3 — Seeds and store

**Files:** `src/modules/qa/coaching/mockData.ts`, `src/stores/qa/coachingStore.ts`.

**Verified facts:** `mockData.ts` imports `TEAM_PROFILES` (team/mockData), `day, seeded, LMS_CONTENT` (lms/mockData),
`buildAiCoachingMessage`; `WEEKLY_RUN_AT = '2026-09-07T08:00:00Z'` (L627); `CURATED_SESSIONS` (L673) includes
`weeklyAiMessage('AGT-004', 'coa-a04-weekly')`, `('AGT-006', 'coa-a06-weekly')`, `('AGT-013', 'coa-a13-weekly')`;
`COACHING_SESSION_SEEDS = [...CURATED_SESSIONS, ...buildRosterSessions()]` (L835-838); activity seed `cact-weekly`
(L885-895). `lms/mockData.ts` exports `LMS_ASSIGNMENT_SEEDS`; `team/mockData.ts` exports `TEAM_AGENTS`;
`team/constants.ts` exports `SUPERVISOR_PERSONA { id: 'SUP-001', name: 'Maria García' }`.
`coachingStore.ts` already imports `useLmsStore`, `useTeamStore`, `buildAiCoachingMessage`, `NOW_ISO`,
`QA_MANAGER_PERSONA`, `SUPERVISOR_PERSONA`, `day`, `today`; `notifySession(session, title, message)` at L106-139;
`scheduleSession` builds the record at L324-357; `logActivity` at L498-504; selectors at L507-511.

- [ ] **3.1** `mockData.ts`:
  - Imports: add `TEAM_AGENTS` to the `~/modules/qa/team/mockData` import; `LMS_ASSIGNMENT_SEEDS` to the
    `~/modules/qa/lms/mockData` import; `import { SUPERVISOR_PERSONA } from '~/modules/qa/team/constants';`;
    `import type { CoachingWeeklyBatch, LmsContent } from '~/models/qa';` (merge into the existing type import);
    `import { buildWeeklyBatch } from './weeklyBatch';`.
  - Replace `COACHING_SESSION_SEEDS` (L835-838) with:

    ```ts
    const ROSTER_SESSIONS = buildRosterSessions();
    const CONTENT_BY_ID = Object.fromEntries(
    	LMS_CONTENT.map((c) => [c.id, c])
    ) as Record<string, LmsContent>;

    /** Last Monday's weekly run for Team 1: proposed 1:1s + the AI messages of cr-000, all pre-loaded. */
    const WEEKLY_BATCH = buildWeeklyBatch({
    	id: 'cwb-2026-09-07',
    	supervisorId: SUPERVISOR_PERSONA.id,
    	supervisorName: SUPERVISOR_PERSONA.name,
    	generatedAt: WEEKLY_RUN_AT,
    	coachingDate: '2026-09-08',
    	agents: TEAM_AGENTS.filter(
    		(a) => a.supervisorId === SUPERVISOR_PERSONA.id
    	),
    	sessions: [...CURATED_SESSIONS, ...ROSTER_SESSIONS],
    	assignments: LMS_ASSIGNMENT_SEEDS,
    	profiles: TEAM_PROFILES,
    	contentById: CONTENT_BY_ID,
    });

    // Demo state on 12 Sep: the supervisor already scheduled the first proposal for next coaching day.
    const BATCH_SESSIONS = WEEKLY_BATCH.created.map((s, i) =>
    	i === 0 && s.status === 'PROPOSED'
    		? { ...s, status: 'SCHEDULED' as const, date: '2026-09-15T10:00:00Z' }
    		: s
    );
    const patchedById = new Map(WEEKLY_BATCH.patched.map((s) => [s.id, s]));

    export const COACHING_SESSION_SEEDS: CoachingSessionRecord[] = [
    	...BATCH_SESSIONS,
    	...CURATED_SESSIONS.map((s) => patchedById.get(s.id) ?? s),
    	...ROSTER_SESSIONS,
    ];

    export const COACHING_BATCH_SEEDS: CoachingWeeklyBatch[] = [
    	WEEKLY_BATCH.batch,
    ];
    ```

    (`created` is ordered by `TEAM_AGENTS` order, so "first" is the lowest-id agent with a proposal; if the first
    created record is an AI message the map leaves it untouched — acceptable, the `i === 0 &&` guard handles it.)
    Make the "first PROPOSED" robust instead: compute `const firstProposal = WEEKLY_BATCH.created.findIndex((s) => s.status === 'PROPOSED');`
    and use `i === firstProposal` in the map.

  - Activity seed `cact-weekly`: `title: 'Weekly coaching batch generated'`,
    `description: \`${WEEKLY_BATCH.batch.items.filter((i) => i.decision === 'ONE_ON_ONE').length} 1:1 proposed · ${WEEKLY_BATCH.batch.items.filter((i) => i.decision === 'AI_MESSAGE').length} AI messages · Team 1\``,
`link: '?tab=sessions'`. (It must be declared **after** `WEEKLY_BATCH`; the activity seeds already sit below
    the sessions block.)

- [ ] **3.2** `coachingStore.ts`:
  - Imports: add `CoachingSessionModality`, `CoachingWeeklyBatch` to the `~/models/qa` type import;
    `COACHING_BATCH_SEEDS` to the `./mockData`/`~/modules/qa/coaching/mockData` import (same specifier the file
    already uses for `COACHING_SESSION_SEEDS`); `DEFAULT_COACHING_DAY` from `~/modules/qa/coaching/constants`.
  - `ScheduleSessionInput`: add `brief?: CoachingBrief | null; batchId?: string | null;` (import `CoachingBrief`).
  - `CoachingState`: add
    ```ts
    batches: CoachingWeeklyBatch[];
    /** JS weekday (0 = Sunday) the supervisor holds coaching; the batch generates the day before. */
    coachingDay: number;
    setCoachingDay: (day: number) => void;
    /** Supervisor confirms a PROPOSED 1:1: it becomes SCHEDULED and the agent is notified. */
    scheduleProposed: (
    	id: string,
    	date: string,
    	modality: CoachingSessionModality
    ) => void;
    /** Supervisor sends the proposal as an AI message instead of holding the 1:1. */
    sendProposedAsAiMessage: (id: string) => void;
    dismissProposed: (id: string) => void;
    ```
  - Initial state: `batches: COACHING_BATCH_SEEDS, coachingDay: DEFAULT_COACHING_DAY,`.
  - `scheduleSession` record: after `cohortId: input.cohortId ?? null,` add `brief: input.brief ?? null, batchId: input.batchId ?? null,`.
  - Actions (place after `setSessionStatus`):

    ```ts
    setCoachingDay: (coachingDay) => set({ coachingDay }),

    scheduleProposed: (id, date, modality) => {
    	const session = get().sessions.find((s) => s.id === id);
    	if (!session || session.status !== 'PROPOSED') return;
    	const next: CoachingSessionRecord = {
    		...session,
    		status: 'SCHEDULED',
    		date,
    		modality,
    	};
    	set((s) => ({ sessions: s.sessions.map((x) => (x.id === id ? next : x)) }));
    	get().logActivity({
    		type: 'SESSION_SCHEDULED',
    		agentId: next.agentId,
    		agentName: next.agentName,
    		title: `Coaching scheduled: ${next.topic}`,
    		description: `${next.coachName} · ${new Date(next.date).toLocaleString()} · from the weekly batch`,
    		area: next.area,
    		link: '?tab=sessions',
    	});
    	notifySession(
    		next,
    		`Coaching session scheduled: ${next.topic}`,
    		`${next.coachName} scheduled a coaching session for ${new Date(next.date).toLocaleString()}.`
    	);
    },

    sendProposedAsAiMessage: (id) => {
    	const session = get().sessions.find((s) => s.id === id);
    	if (!session || session.status !== 'PROPOSED') return;
    	const profile = useTeamStore.getState().profiles[session.agentId];
    	const content = useLmsStore.getState().content;
    	const titles = (session.brief?.suggestedContentIds ?? [])
    		.map((cid) => content.find((c) => c.id === cid)?.title)
    		.filter((x): x is string => Boolean(x));
    	const next: CoachingSessionRecord = {
    		...session,
    		type: 'AI_MESSAGE',
    		modality: null,
    		durationMin: 0,
    		date: NOW_ISO,
    		status: 'COMPLETED',
    		talkingPoints: [],
    		aiMessage: profile
    			? buildAiCoachingMessage(profile, 'Weekly coaching review', titles)
    			: (session.brief?.approach ?? ''),
    	};
    	set((s) => ({ sessions: s.sessions.map((x) => (x.id === id ? next : x)) }));
    	get().logActivity({
    		type: 'SESSION_COMPLETED',
    		agentId: next.agentId,
    		agentName: next.agentName,
    		title: `Coaching message sent: ${next.topic}`,
    		description: `${next.coachName} · AI message instead of a 1:1`,
    		area: next.area,
    		link: '?tab=sessions',
    	});
    	notifySession(
    		next,
    		`Weekly coaching message: ${next.topic}`,
    		next.aiMessage ?? ''
    	);
    },

    dismissProposed: (id) =>
    	set((s) => ({
    		sessions: s.sessions.map((x) =>
    			x.id === id && x.status === 'PROPOSED'
    				? { ...x, status: 'CANCELLED' as const }
    				: x
    		),
    	})),
    ```

    (`useLmsStore` state key for the catalogue is `content` — the same key `selectContent` reads in
    `CoachingAgentPage`; confirm the name in `lmsStore.ts` and adjust if it differs.)

  - Selectors: add `export const selectBatches = (s: CoachingState) => s.batches;` and
    `export const selectCoachingDay = (s: CoachingState) => s.coachingDay;`.

- [ ] **3.3** `npm run typecheck` → commit `feat(qa-coaching): seed last Monday's weekly batch and add proposed-session actions to the store`.

**Runtime note for the executor:** `mockData.ts` now imports `weeklyBatch.ts` → `postCoaching.ts` → `scorecard.ts` →
`calls/agentMetrics.ts` → `analytics/mockData.ts`, and `calls/issues.ts` → `settingsStore`. None of those import
`coaching/mockData.ts`, so there is no cycle; if `grep -l "coaching/mockData" src/modules/qa/{analytics,calls,settings}`
ever returns a file, stop and report.

---

## Task 4 — Session brief and proposed actions in the detail drawer

**Files:** `components/SessionBrief.tsx` (new), `components/SessionDetailDrawer.tsx`, `CoachingPage.tsx`,
`CoachingAgentPage.tsx`, `lms/AgentLmsPage/tabs/AgentCoachingTab.tsx`, both `qa.coaching.json`.

**Verified facts:** drawer props at L47-55 (`session, profile, assignments, contentById, opened, onClose, onOpenCall`),
`useTranslation('qa.coaching')` L66, `isAi` L82, AI-message card L184-190, evidence card L194-214, status form
`session.status === 'SCHEDULED' ? (…) : (…)` at L355-415. It imports `AppDrawer`, `SectionCard`, `AreaBadge`,
`FormatBadge`, `notifySuccess`, `useCoachingStore`, `day`, `today`, `SESSION_STATUS_COLOR`, `queueStyles`
(`.preWrap`), `pointerStyles`. `DateTimePicker` is used in `SessionForm.tsx:355-361`
(`value`, `onChange={(v) => …}`, `valueFormat='MMM D, YYYY HH:mm'`, `minDate`). `AppSegmentedControl` default export
(`~/components/ui/AppSegmentedControl`, props `size`, `value`, `onChange`, `data`). `managerPersona(role)` →
`{ id, name, role: 'SUPERVISOR' | 'QA_MANAGER' }` (`lms/helpers.ts:85`); `useLmsStore.getState().assign(AssignInput)`
with `{ agentIds, contentIds, dueDate, mandatory, requireAcceptance, reason, source?, assignedBy, assignedByRole }`.
`ScorecardTrendBadge({ trend, size, tooltipKey })`, `TierBadge({ tier, size })`; `TIER_META[tier].color`;
`VERDICT_COLOR` (lms/constants); `SCORECARD_DIMENSION_META[d].labelKey`. Drawer mounts: `CoachingPage.tsx:466-482`,
`CoachingAgentPage.tsx:188-198`. `AgentCoachingTab.tsx:98-108` builds the agent's `sessions`.

- [ ] **4.1** Create `components/SessionBrief.tsx`:

  ```tsx
  import { Badge, Button, Group, List, Stack, Text } from '@mantine/core';
  import { IconBook, IconPhone, IconSparkles } from '@tabler/icons-react';
  import dayjs from 'dayjs';
  import { useTranslation } from 'react-i18next';
  import { SectionCard } from '~/components/SectionCard';
  import type { CoachingBrief, LmsAssignment, LmsContent } from '~/models/qa';
  import {
  	CALL_ISSUE_BY_KEY,
  	type CallIssueKey,
  } from '~/modules/qa/calls/issues';
  import { AreaBadge, FormatBadge } from '~/modules/qa/lms/components/Badges';
  import { VERDICT_COLOR } from '~/modules/qa/lms/constants';
  import { managerPersona, today } from '~/modules/qa/lms/helpers';
  import { day } from '~/modules/qa/lms/mockData';
  import type { TeamRole } from '~/modules/qa/team/types';
  import { notifySuccess } from '~/modules/qa/utils/notifications';
  import { useLmsStore } from '~/stores/qa/lmsStore';
  import { SCORECARD_DIMENSION_META, TIER_META } from '../scorecard';
  import { ScorecardTrendBadge, TierBadge } from './ScorecardBadges';
  import pointerStyles from '~/modules/qa/lms/components/Cards.module.css';
  import queueStyles from './Queue.module.css';

  interface SessionBriefProps {
  	brief: CoachingBrief;
  	agentId: string;
  	role: TeamRole;
  	assignments: LmsAssignment[];
  	contentById: Record<string, LmsContent>;
  	onOpenCall: (callId: string) => void;
  }

  /** The pre-loaded content of a weekly-batch session, as cards inside the detail drawer. */
  export function SessionBrief({
  	brief,
  	agentId,
  	role,
  	assignments,
  	contentById,
  	onOpenCall,
  }: SessionBriefProps) {
  	const { t } = useTranslation(['qa.coaching', 'qa.calls', 'qa.lms']);
  	const trend =
  		brief.trend && brief.previousScore !== null
  			? {
  					verdict: brief.trend,
  					current: brief.score,
  					previous: brief.previousScore,
  					delta: brief.score - brief.previousScore,
  				}
  			: null;
  	const suggested = brief.suggestedContentIds
  		.map((id) => contentById[id])
  		.filter((c): c is LmsContent => Boolean(c));
  	const alreadyOpen = suggested.filter((c) =>
  		assignments.some(
  			(a) =>
  				a.agentId === agentId &&
  				a.contentId === c.id &&
  				a.status !== 'COMPLETED'
  		)
  	);
  	const assignable = suggested.filter((c) => !alreadyOpen.includes(c));

  	const assignSuggested = () => {
  		const persona = managerPersona(role);
  		useLmsStore.getState().assign({
  			agentIds: [agentId],
  			contentIds: assignable.map((c) => c.id),
  			dueDate: day(today(), 14),
  			mandatory: false,
  			requireAcceptance: false,
  			reason: 'Suggested in the weekly coaching brief',
  			source: 'MANUAL',
  			assignedBy: persona.name,
  			assignedByRole: persona.role,
  		});
  		notifySuccess(t('sessions.brief.assigned', { count: assignable.length }));
  	};

  	return (
  		<>
  			<SectionCard
  				icon={IconSparkles}
  				title={t('sessions.brief.title')}
  				description={t('sessions.brief.week', {
  					from: dayjs(brief.weekFrom).format('D MMM'),
  					to: dayjs(brief.weekTo).format('D MMM'),
  					count: brief.calls,
  				})}
  				padding='md'
  			>
  				<Group gap='xs'>
  					<Badge variant='filled' color={TIER_META[brief.tier].color}>
  						{brief.score}
  					</Badge>
  					<TierBadge tier={brief.tier} size='sm' />
  					<ScorecardTrendBadge trend={trend} size='sm' />
  					<Badge size='sm' variant='outline' color='violet'>
  						{t(`sessions.batch.reason.${brief.reason}`)}
  					</Badge>
  				</Group>
  			</SectionCard>

  			<SectionCard title={t('sessions.brief.findings')} padding='md'>
  				{brief.findings.length === 0 ? (
  					<Text size='sm' c='dimmed'>
  						{t('sessions.brief.noFindings')}
  					</Text>
  				) : (
  					<Stack gap='sm'>
  						{brief.findings.map((f) => (
  							<Stack key={f.issue} gap={4}>
  								<Group gap='xs'>
  									<Badge
  										size='sm'
  										variant='light'
  										color={CALL_ISSUE_BY_KEY[f.issue as CallIssueKey].color}
  									>
  										{t(`issues.${f.issue}`, { ns: 'qa.calls' })}
  									</Badge>
  									<Text size='xs' c='dimmed'>
  										{t('sessions.brief.findingCalls', {
  											count: f.calls,
  											share: f.share,
  										})}
  									</Text>
  								</Group>
  								<Group gap={6}>
  									{f.evidenceCallIds.map((id) => (
  										<Badge
  											key={id}
  											size='xs'
  											variant='outline'
  											leftSection={<IconPhone size={10} />}
  											className={pointerStyles.pointer}
  											onClick={() => onOpenCall(id)}
  										>
  											{id}
  										</Badge>
  									))}
  								</Group>
  							</Stack>
  						))}
  					</Stack>
  				)}
  			</SectionCard>

  			<SectionCard title={t('sessions.brief.approach')} padding='md'>
  				<Text size='sm'>{brief.approach}</Text>
  			</SectionCard>
  			<SectionCard title={t('sessions.brief.solution')} padding='md'>
  				<Text size='sm'>{brief.solution}</Text>
  			</SectionCard>
  			<SectionCard title={t('sessions.brief.example')} padding='md'>
  				<Text size='sm' className={queueStyles.preWrap}>
  					{brief.example}
  				</Text>
  			</SectionCard>

  			<SectionCard
  				icon={IconBook}
  				title={t('sessions.brief.suggested')}
  				padding='md'
  				headerActions={
  					assignable.length > 0 && (
  						<Button size='xs' variant='default' onClick={assignSuggested}>
  							{t('sessions.brief.assignSuggested', {
  								count: assignable.length,
  							})}
  						</Button>
  					)
  				}
  			>
  				{suggested.length === 0 ? (
  					<Text size='sm' c='dimmed'>
  						{t('sessions.brief.noSuggested')}
  					</Text>
  				) : (
  					<List spacing='xs' size='sm'>
  						{suggested.map((c) => (
  							<List.Item key={c.id}>
  								<Group gap='xs' wrap='nowrap'>
  									<Text size='sm'>{c.title}</Text>
  									<FormatBadge format={c.format} size='xs' />
  									{c.area !== 'GENERAL' && (
  										<AreaBadge area={c.area} size='xs' />
  									)}
  									{alreadyOpen.includes(c) && (
  										<Badge size='xs' variant='light' color='gray'>
  											{t('sessions.brief.alreadyAssigned')}
  										</Badge>
  									)}
  								</Group>
  							</List.Item>
  						))}
  					</List>
  				)}
  			</SectionCard>

  			<SectionCard title={t('sessions.brief.previous')} padding='md'>
  				{brief.previous ? (
  					<Stack gap={4}>
  						<Text size='sm' fw={500}>
  							{brief.previous.topic} ·{' '}
  							{dayjs(brief.previous.date).format('D MMM YYYY')}
  						</Text>
  						<Group gap='xs'>
  							<Text size='xs' c='dimmed'>
  								{brief.previous.dimension
  									? t(
  											SCORECARD_DIMENSION_META[brief.previous.dimension]
  												.labelKey
  										)
  									: t('sessions.brief.composite')}
  								: {brief.previous.before} → {brief.previous.after}
  							</Text>
  							<Badge
  								size='xs'
  								variant='light'
  								color={VERDICT_COLOR[brief.previous.verdict]}
  							>
  								{t(`verdict.${brief.previous.verdict}`, { ns: 'qa.lms' })}
  							</Badge>
  						</Group>
  					</Stack>
  				) : (
  					<Text size='sm' c='dimmed'>
  						{t('sessions.brief.noPrevious')}
  					</Text>
  				)}
  			</SectionCard>
  		</>
  	);
  }
  ```

  `Queue.module.css` provides `.preWrap` and `Cards.module.css` provides `.pointer` (both already imported by
  `SessionDetailDrawer.tsx`). `AreaBadge` takes the content's `area` as `ImpactTab.tsx` already does.

- [ ] **4.2** `SessionDetailDrawer.tsx`:
  - Props: add `role: TeamRole;` (import type from `~/modules/qa/team/types`). Update both mounts:
    `CoachingPage.tsx:466` and `CoachingAgentPage.tsx:188` add `role={role}`.
  - Imports: `SessionBrief` from `./SessionBrief`; `DateTimePicker` from `@mantine/dates` (add to the existing
    import); `AppSegmentedControl` default from `~/components/ui/AppSegmentedControl`; `SESSION_MODALITIES` from
    `../constants`; `nextBatchAt` from `../weeklyBatch`; `selectCoachingDay` from the store import; type
    `CoachingSessionModality` from `~/models/qa`.
  - State: `const coachingDay = useCoachingStore(selectCoachingDay);` plus
    `const [proposedDate, setProposedDate] = useState<Date | null>(null);` and
    `const [proposedModality, setProposedModality] = useState<CoachingSessionModality>('IN_PERSON');`. In the
    existing `useEffect` add `setProposedDate(new Date(\`${nextBatchAt(coachingDay).coachingDate}T10:00:00Z\`)); setProposedModality(session.modality ?? 'IN_PERSON');`(add`coachingDay` to the deps).
  - Handlers:
    ```ts
    const handleSchedule = () => {
    	if (!proposedDate) return;
    	useCoachingStore
    		.getState()
    		.scheduleProposed(
    			session.id,
    			proposedDate.toISOString(),
    			proposedModality
    		);
    	notifySuccess(t('sessions.detail.proposed.scheduled'));
    	onClose();
    };
    const handleSendAi = () => {
    	useCoachingStore.getState().sendProposedAsAiMessage(session.id);
    	notifySuccess(t('sessions.detail.proposed.sent'));
    	onClose();
    };
    const handleDismiss = () => {
    	useCoachingStore.getState().dismissProposed(session.id);
    	notifySuccess(t('sessions.detail.proposed.dismissed'));
    	onClose();
    };
    ```
  - Render: right **after** the meeting-link block (L169-182) and **before** the `isAi` AI-message card, add
    ```tsx
    {
    	session.brief && (
    		<SessionBrief
    			brief={session.brief}
    			agentId={session.agentId}
    			role={role}
    			assignments={assignments}
    			contentById={contentById}
    			onOpenCall={onOpenCall}
    		/>
    	);
    }
    ```
    If the brief is rendered, the existing "Evidence" card (L194-214) duplicates the finding evidence — keep it
    (it is the full union and already has the open-call behaviour).
  - Status block: change `{session.status === 'SCHEDULED' ? (` to
    ```tsx
    {session.status === 'PROPOSED' ? (
    	<SectionCard
    		title={t('sessions.detail.proposed.title')}
    		description={t('sessions.detail.proposed.hint')}
    		headerAccent='blue'
    		padding='md'
    	>
    		<Stack gap='sm'>
    			<DateTimePicker
    				label={t('sessions.detail.proposed.date')}
    				value={proposedDate}
    				onChange={(v) => setProposedDate(v ? new Date(v) : null)}
    				valueFormat='MMM D, YYYY HH:mm'
    			/>
    			<AppSegmentedControl
    				size='sm'
    				value={proposedModality}
    				onChange={(v) => setProposedModality(v as CoachingSessionModality)}
    				data={SESSION_MODALITIES.map((m) => ({
    					value: m,
    					label: t(`sessions.modality.${m}`),
    				}))}
    			/>
    			<Group justify='flex-end' gap='xs'>
    				<Button size='xs' variant='subtle' color='gray' onClick={handleDismiss}>
    					{t('sessions.detail.proposed.dismiss')}
    				</Button>
    				<Button size='xs' variant='default' onClick={handleSendAi}>
    					{t('sessions.detail.proposed.sendAi')}
    				</Button>
    				<Button size='xs' onClick={handleSchedule} disabled={!proposedDate}>
    					{t('sessions.detail.proposed.schedule')}
    				</Button>
    			</Group>
    		</Stack>
    	</SectionCard>
    ) : session.status === 'SCHEDULED' ? (
    ```
    (the rest of the ternary is unchanged). Check how `SessionForm` types the `DateTimePicker` `onChange` value
    (string in Mantine 9 dates) and mirror it: `form.setFieldValue('date', v)` stores whatever `v` is, so
    `new Date(v)` on a non-null `v` is safe.
- [ ] **4.3** `AgentCoachingTab.tsx` L102-107: the filter becomes
      `(s) => s.status !== 'PROPOSED' && (s.agentId === AGENT_PERSONA.id || …)` so agents never see proposals.
- [ ] **4.4** i18n `qa.coaching.json` (both) under `sessions`:
  - `status`: add `"PROPOSED": "Proposed"` / es `"Propuesta"` (first).
  - `detail.proposed`:
    en `{ "title": "Pre-loaded by the weekly batch", "hint": "Confirm a date to schedule the 1:1, send the coaching as an AI message instead, or dismiss it.", "date": "Session date", "schedule": "Schedule 1:1", "sendAi": "Send as AI message", "dismiss": "Dismiss", "scheduled": "Session scheduled and the agent notified", "sent": "Coaching message sent to the agent's inbox", "dismissed": "Proposal dismissed" }`
    es `{ "title": "Precargada por el lote semanal", "hint": "Confirma una fecha para agendar el 1:1, envía el coaching como mensaje IA o descártala.", "date": "Fecha de la sesión", "schedule": "Agendar 1:1", "sendAi": "Enviar como mensaje IA", "dismiss": "Descartar", "scheduled": "Sesión agendada y agente notificado", "sent": "Mensaje de coaching enviado al inbox del agente", "dismissed": "Propuesta descartada" }`
  - `brief`:
    en `{ "title": "Weekly brief", "week": "Calls from {{from}} to {{to}} · {{count}} evaluated", "findings": "Weak aspects this week", "noFindings": "No incident detected in last week's calls.", "findingCalls_one": "{{count}} call · {{share}}% of the week", "findingCalls_other": "{{count}} calls · {{share}}% of the week", "approach": "How to approach it with the agent", "solution": "Conceptual solution", "example": "Real example", "suggested": "Suggested material", "noSuggested": "Nothing to suggest — the agent already has material open for these aspects.", "alreadyAssigned": "Already assigned", "assignSuggested_one": "Assign {{count}} material", "assignSuggested_other": "Assign {{count}} materials", "assigned_one": "{{count}} material assigned", "assigned_other": "{{count}} materials assigned", "previous": "Since the previous session", "noPrevious": "No previous coach-led session to compare with.", "composite": "Scorecard" }`
    es `{ "title": "Brief semanal", "week": "Llamadas del {{from}} al {{to}} · {{count}} evaluadas", "findings": "Aspectos débiles de la semana", "noFindings": "Sin incidencias en las llamadas de la semana pasada.", "findingCalls_one": "{{count}} llamada · {{share}}% de la semana", "findingCalls_other": "{{count}} llamadas · {{share}}% de la semana", "approach": "Cómo abordarlo con el agente", "solution": "Solución conceptual", "example": "Ejemplo real", "suggested": "Material sugerido", "noSuggested": "Nada que sugerir: el agente ya tiene material abierto para estos aspectos.", "alreadyAssigned": "Ya asignado", "assignSuggested_one": "Asignar {{count}} material", "assignSuggested_other": "Asignar {{count}} materiales", "assigned_one": "{{count}} material asignado", "assigned_other": "{{count}} materiales asignados", "previous": "Desde la sesión anterior", "noPrevious": "No hay una sesión previa con coach para comparar.", "composite": "Scorecard" }`
  - `batch.reason` (used by the brief badge and Task 5):
    en `{ "TIER_CRITICAL": "Critical this week", "TIER_NEEDS_IMPROVEMENT": "Needs improvement", "GOOD_DECLINED": "Good but declining", "WEAKEST_OF_WEEK": "Weakest of the week", "STABLE": "Stable — AI message" }`
    es `{ "TIER_CRITICAL": "Crítico esta semana", "TIER_NEEDS_IMPROVEMENT": "Necesita mejorar", "GOOD_DECLINED": "Bien pero empeorando", "WEAKEST_OF_WEEK": "El más bajo de la semana", "STABLE": "Estable: mensaje IA" }`
- [ ] **4.5** `npm run typecheck` → commit `feat(qa-coaching): pre-loaded session brief and schedule / send / dismiss actions for proposed sessions`.

---

## Task 5 — Sessions tab: Weekly batch · Agenda · History

**Files:** `components/WeeklyBatchPanel.tsx` (new), `CoachingPage/tabs/SessionsTab.tsx`, both `qa.coaching.json`.

**Verified facts:** `SessionsTab` state `view: 'today' | 'upcoming' | 'past'` (L63), `filtered` (L85-110), `todays` /
`upcoming` / `thisWeek` / `later` / `past` (L112-136), filter bar `filters` (L261-354) with the segmented control
(L263-272), render (L356-431): header `SectionCard` with the New session button, the per-view cards, and the
calendar card (`<SessionsCalendar sessions={filtered} onOpen={onOpen} />`). Props include `role`, `agentTeam`,
`onOpen`. `StatCard` compact pattern and `EmptyState` default export as in `AgentsTab.tsx`.

- [ ] **5.1** Create `components/WeeklyBatchPanel.tsx`:

  ```tsx
  import { useMemo } from 'react';
  import { Badge, Group, Select, SimpleGrid, Stack, Text } from '@mantine/core';
  import { createColumnHelper } from '@tanstack/react-table';
  import { IconMessage, IconSparkles, IconUser } from '@tabler/icons-react';
  import dayjs from 'dayjs';
  import { useTranslation } from 'react-i18next';
  import { SectionCard } from '~/components/SectionCard';
  import { StatCard } from '~/components/StatCard';
  import BaseTable, {
  	type BaseTableColumnDef,
  } from '~/components/BaseTable/BaseTable';
  import EmptyState from '~/components/EmptyState';
  import type {
  	CoachingBatchItem,
  	CoachingSessionRecord,
  	CoachingWeeklyBatch,
  } from '~/models/qa';
  import {
  	CALL_ISSUE_BY_KEY,
  	type CallIssueKey,
  } from '~/modules/qa/calls/issues';
  import { SUPERVISOR_PERSONA } from '~/modules/qa/team/constants';
  import type { TeamRole } from '~/modules/qa/team/types';
  import {
  	useCoachingStore,
  	selectBatches,
  	selectCoachingDay,
  } from '~/stores/qa/coachingStore';
  import { SESSION_STATUS_COLOR, WEEKDAYS } from '../constants';
  import { TIER_META } from '../scorecard';
  import { nextBatchAt } from '../weeklyBatch';
  import { ScorecardTrendBadge, TierBadge } from './ScorecardBadges';

  interface BatchRow extends CoachingBatchItem {
  	session: CoachingSessionRecord | undefined;
  }

  const helper = createColumnHelper<BatchRow>();

  interface WeeklyBatchPanelProps {
  	role: TeamRole;
  	sessions: CoachingSessionRecord[];
  	agentTeam: Record<string, string>;
  	onOpen: (sessionId: string) => void;
  }

  /** The latest weekly run for the viewer's scope: who gets a 1:1, who gets the AI message, and where each stands. */
  export function WeeklyBatchPanel({
  	role,
  	sessions,
  	agentTeam,
  	onOpen,
  }: WeeklyBatchPanelProps) {
  	const { t } = useTranslation(['qa.coaching', 'qa.calls']);
  	const batches = useCoachingStore(selectBatches);
  	const coachingDay = useCoachingStore(selectCoachingDay);
  	const setCoachingDay = useCoachingStore((s) => s.setCoachingDay);

  	const latest: CoachingWeeklyBatch | undefined = useMemo(
  		() =>
  			[...batches]
  				.filter(
  					(b) =>
  						role === 'qa-manager' || b.supervisorId === SUPERVISOR_PERSONA.id
  				)
  				.sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))[0],
  		[batches, role]
  	);
  	const next = nextBatchAt(coachingDay);

  	const rows = useMemo<BatchRow[]>(
  		() =>
  			(latest?.items ?? []).map((item) => ({
  				...item,
  				session: sessions.find((s) => s.id === item.sessionId),
  			})),
  		[latest, sessions]
  	);
  	const kpi = {
  		analysed: rows.length,
  		proposed: rows.filter((r) => r.session?.status === 'PROPOSED').length,
  		scheduled: rows.filter(
  			(r) =>
  				r.decision === 'ONE_ON_ONE' &&
  				(r.session?.status === 'SCHEDULED' ||
  					r.session?.status === 'COMPLETED')
  		).length,
  		ai: rows.filter((r) => r.session?.type === 'AI_MESSAGE').length,
  	};

  	const columns: BaseTableColumnDef<BatchRow>[] = [
  		helper.accessor('agentName', {
  			header: t('sessions.columns.agent'),
  			cell: (info) => (
  				<Stack gap={0}>
  					<Text size='sm' fw={500}>
  						{info.getValue()}
  					</Text>
  					<Text size='xs' c='dimmed'>
  						{agentTeam[info.row.original.agentId] ?? ''}
  					</Text>
  				</Stack>
  			),
  		}) as BaseTableColumnDef<BatchRow>,
  		helper.accessor((r) => r.session?.brief?.score ?? -1, {
  			id: 'scorecard',
  			header: t('agents.columns.scorecard'),
  			cell: (info) => {
  				const brief = info.row.original.session?.brief;
  				return brief ? (
  					<Group gap={6} wrap='nowrap'>
  						<Badge
  							size='sm'
  							variant='filled'
  							color={TIER_META[brief.tier].color}
  						>
  							{brief.score}
  						</Badge>
  						<TierBadge tier={brief.tier} size='xs' />
  					</Group>
  				) : (
  					<Text size='sm' c='dimmed'>
  						—
  					</Text>
  				);
  			},
  		}) as BaseTableColumnDef<BatchRow>,
  		helper.display({
  			id: 'trend',
  			header: t('agents.columns.lastImpact'),
  			cell: (info) => {
  				const brief = info.row.original.session?.brief;
  				const trend =
  					brief && brief.trend && brief.previousScore !== null
  						? {
  								verdict: brief.trend,
  								current: brief.score,
  								previous: brief.previousScore,
  								delta: brief.score - brief.previousScore,
  							}
  						: null;
  				return <ScorecardTrendBadge trend={trend} size='xs' />;
  			},
  		}) as BaseTableColumnDef<BatchRow>,
  		helper.display({
  			id: 'findings',
  			header: t('sessions.batch.columns.findings'),
  			cell: (info) => {
  				const findings = info.row.original.session?.brief?.findings ?? [];
  				return findings.length === 0 ? (
  					<Text size='sm' c='dimmed'>
  						{t('sessions.batch.clean')}
  					</Text>
  				) : (
  					<Group gap={4} wrap='nowrap'>
  						{findings.map((f) => (
  							<Badge
  								key={f.issue}
  								size='xs'
  								variant='light'
  								color={CALL_ISSUE_BY_KEY[f.issue as CallIssueKey].color}
  							>
  								{t(`issues.${f.issue}`, { ns: 'qa.calls' })}
  							</Badge>
  						))}
  					</Group>
  				);
  			},
  		}) as BaseTableColumnDef<BatchRow>,
  		helper.accessor('decision', {
  			header: t('sessions.batch.columns.decision'),
  			cell: (info) => (
  				<Stack gap={2}>
  					<Badge
  						size='xs'
  						variant={info.getValue() === 'ONE_ON_ONE' ? 'filled' : 'light'}
  						color={info.getValue() === 'ONE_ON_ONE' ? 'blue' : 'gray'}
  						leftSection={
  							info.getValue() === 'ONE_ON_ONE' ? (
  								<IconUser size={10} />
  							) : (
  								<IconMessage size={10} />
  							)
  						}
  					>
  						{t(`sessions.batch.decision.${info.getValue()}`)}
  					</Badge>
  					<Text size='xs' c='dimmed'>
  						{t(`sessions.batch.reason.${info.row.original.reason}`)}
  					</Text>
  				</Stack>
  			),
  		}) as BaseTableColumnDef<BatchRow>,
  		helper.accessor((r) => r.session?.status ?? '', {
  			id: 'status',
  			header: t('sessions.columns.status'),
  			cell: (info) => {
  				const status = info.row.original.session?.status;
  				return status ? (
  					<Badge
  						size='xs'
  						variant='light'
  						color={SESSION_STATUS_COLOR[status]}
  					>
  						{t(`sessions.status.${status}`)}
  					</Badge>
  				) : (
  					<Text size='sm' c='dimmed'>
  						—
  					</Text>
  				);
  			},
  		}) as BaseTableColumnDef<BatchRow>,
  		helper.accessor((r) => r.session?.date ?? '', {
  			id: 'date',
  			header: t('sessions.batch.columns.date'),
  			cell: (info) => {
  				const s = info.row.original.session;
  				if (!s || s.type === 'AI_MESSAGE')
  					return (
  						<Text size='sm' c='dimmed'>
  							{s
  								? t('sessions.batch.sentOn', {
  										date: dayjs(s.date).format('D MMM'),
  									})
  								: '—'}
  						</Text>
  					);
  				return (
  					<Text size='sm'>
  						{s.status === 'PROPOSED'
  							? t('sessions.batch.suggestedDate', {
  									date: dayjs(s.date).format('ddd D MMM, HH:mm'),
  								})
  							: dayjs(s.date).format('ddd D MMM, HH:mm')}
  					</Text>
  				);
  			},
  		}) as BaseTableColumnDef<BatchRow>,
  	];

  	const coachingDaySelect = (
  		<Select
  			size='xs'
  			w={170}
  			label={t('sessions.batch.coachingDay')}
  			data={WEEKDAYS.map((d) => ({
  				value: String(d),
  				label: t(`sessions.batch.weekdays.${d}`),
  			}))}
  			value={String(coachingDay)}
  			onChange={(v) => v !== null && setCoachingDay(Number(v))}
  			allowDeselect={false}
  		/>
  	);

  	if (!latest) {
  		return (
  			<SectionCard
  				icon={IconSparkles}
  				title={t('sessions.batch.title')}
  				headerActions={coachingDaySelect}
  			>
  				<EmptyState
  					message={t('sessions.batch.empty', {
  						date: dayjs(next.generatedAt).format('ddd D MMM, HH:mm'),
  					})}
  				/>
  			</SectionCard>
  		);
  	}

  	return (
  		<Stack gap='md'>
  			<SectionCard
  				icon={IconSparkles}
  				title={t('sessions.batch.title')}
  				description={t('sessions.batch.description', {
  					generated: dayjs(latest.generatedAt).format('ddd D MMM, HH:mm'),
  					from: dayjs(latest.weekFrom).format('D MMM'),
  					to: dayjs(latest.weekTo).format('D MMM'),
  					coaching: dayjs(latest.coachingDate).format('ddd D MMM'),
  				})}
  				headerActions={
  					<Group gap='sm' align='flex-end'>
  						{coachingDaySelect}
  						<Badge size='sm' variant='light' color='violet'>
  							{t('sessions.batch.next', {
  								date: dayjs(next.generatedAt).format('ddd D MMM, HH:mm'),
  							})}
  						</Badge>
  					</Group>
  				}
  			>
  				<SimpleGrid cols={{ base: 2, md: 4 }} spacing='sm'>
  					<StatCard
  						variant='compact'
  						title={t('sessions.batch.kpi.analysed')}
  						value={kpi.analysed}
  					/>
  					<StatCard
  						variant='compact'
  						title={t('sessions.batch.kpi.proposed')}
  						value={kpi.proposed}
  						color={
  							kpi.proposed > 0 ? 'var(--mantine-color-violet-7)' : undefined
  						}
  					/>
  					<StatCard
  						variant='compact'
  						title={t('sessions.batch.kpi.scheduled')}
  						value={kpi.scheduled}
  					/>
  					<StatCard
  						variant='compact'
  						title={t('sessions.batch.kpi.ai')}
  						value={kpi.ai}
  					/>
  				</SimpleGrid>
  			</SectionCard>

  			<SectionCard
  				title={t('sessions.batch.agents')}
  				description={t('sessions.batch.agentsDescription')}
  			>
  				<BaseTable<BatchRow>
  					data={rows}
  					columns={columns}
  					getRowId={(r) => r.agentId}
  					initialSort={[{ id: 'scorecard', desc: false }]}
  					density='compact'
  					emptyMessage={t('sessions.empty')}
  					onRowClick={(r) => onOpen(r.sessionId)}
  				/>
  			</SectionCard>
  		</Stack>
  	);
  }
  ```

- [ ] **5.2** `SessionsTab.tsx`:
  - Import `WeeklyBatchPanel` from `'../../components/WeeklyBatchPanel'`.
  - `view` state → `useState<'batch' | 'agenda' | 'history'>('batch')`; the segmented control data becomes
    `batch` / `agenda` / `history` with labels `sessions.filters.batch|agenda|history` (cast in `onChange` accordingly).
  - Add a topic filter: `const [topic, setTopic] = useState<string | null>(null);`,
    `const topicOptions = useMemo(() => [...new Set(sessions.map((s) => s.topic))].sort(), [sessions]);`, apply
    `if (topic && s.topic !== topic) return false;` in `filtered` (add `topic` to the deps), and a `Select`
    (`placeholder={t('sessions.filters.topic')}`, `data={topicOptions}`, `searchable`, `clearable`, `w={200}`)
    right after the agent Select.
  - `past`: `.filter((s) => s.status !== 'SCHEDULED' && s.status !== 'PROPOSED')`.
  - `const calendarSessions = useMemo(() => filtered.filter((s) => s.status !== 'PROPOSED'), [filtered]);`
  - Render:
    - Header card: keep title/description/New session button; its body becomes
      `{view === 'batch' ? segmented : filters}` — i.e. extract the `AppSegmentedControl` into a `const segmented`
      and keep `filters` as the full `Group` that **starts with** `segmented`.
    - Then:
      ```tsx
      {
      	view === 'batch' ? (
      		<WeeklyBatchPanel
      			role={role}
      			sessions={sessions}
      			agentTeam={agentTeam}
      			onOpen={onOpen}
      		/>
      	) : view === 'agenda' ? (
      		<>
      			<SectionCard title={t('sessions.todayTitle')}>
      				…todays table (unchanged)…
      			</SectionCard>
      			<SectionCard title={t('sessions.thisWeek')}>…thisWeek…</SectionCard>
      			<SectionCard title={t('sessions.later')}>…later…</SectionCard>
      			<SectionCard
      				title={t('sessions.calendar.title')}
      				description={t('sessions.calendar.description')}
      			>
      				<SessionsCalendar sessions={calendarSessions} onOpen={onOpen} />
      			</SectionCard>
      		</>
      	) : (
      		<SectionCard
      			title={t('sessions.history.title')}
      			description={t('sessions.history.description')}
      		>
      			…past table (unchanged, pageSize 12)…
      		</SectionCard>
      	);
      }
      ```
      The old standalone calendar card at the bottom is removed (it now lives inside Agenda).
- [ ] **5.3** i18n `qa.coaching.json` (both) under `sessions`:
  - `filters`: add `"batch": "Weekly batch", "agenda": "Agenda", "history": "History", "topic": "Topic"` /
    es `"batch": "Lote semanal", "agenda": "Agenda", "history": "Histórico", "topic": "Tema"`. Keep the old
    `today` / `upcoming` / `past` keys (harmless).
  - `history`: en `{ "title": "Past sessions and coaching", "description": "Every completed, missed or cancelled session and every AI message of your agents. Filter by agent, topic or period." }`
    / es `{ "title": "Sesiones y coaching pasados", "description": "Todas las sesiones completadas, perdidas o canceladas y los mensajes IA de tus agentes. Filtra por agente, tema o periodo." }`
  - `batch` (merge with the `reason` block from Task 4):
    en
    ```json
    "title": "Weekly coaching batch",
    "description": "Generated {{generated}} from the calls of {{from}} – {{to}} for coaching on {{coaching}}. The platform decided who needs a 1:1 and who receives the AI message.",
    "coachingDay": "Coaching day",
    "next": "Next batch {{date}}",
    "empty": "No batch yet — the first one generates {{date}}.",
    "agents": "Agents in this batch",
    "agentsDescription": "Click a row to open the pre-loaded session: weak aspects, evidence calls, how to approach it, suggested material and what changed since the previous session.",
    "clean": "Clean week",
    "sentOn": "Sent {{date}}",
    "suggestedDate": "Suggested {{date}}",
    "kpi": { "analysed": "Agents analysed", "proposed": "1:1 to review", "scheduled": "1:1 scheduled", "ai": "AI messages sent" },
    "columns": { "findings": "Weak aspects", "decision": "Decision", "date": "Session" },
    "decision": { "ONE_ON_ONE": "1:1 with supervisor", "AI_MESSAGE": "AI message" },
    "weekdays": { "0": "Sunday", "1": "Monday", "2": "Tuesday", "3": "Wednesday", "4": "Thursday", "5": "Friday", "6": "Saturday" }
    ```
    es
    ```json
    "title": "Lote semanal de coaching",
    "description": "Generado {{generated}} a partir de las llamadas del {{from}} al {{to}} para el coaching del {{coaching}}. La plataforma decidió quién necesita un 1:1 y quién recibe el mensaje IA.",
    "coachingDay": "Día de coaching",
    "next": "Próximo lote {{date}}",
    "empty": "Todavía no hay lote: el primero se genera {{date}}.",
    "agents": "Agentes de este lote",
    "agentsDescription": "Haz clic en una fila para abrir la sesión precargada: aspectos débiles, llamadas de evidencia, cómo abordarlo, material sugerido y qué cambió desde la sesión anterior.",
    "clean": "Semana limpia",
    "sentOn": "Enviado {{date}}",
    "suggestedDate": "Sugerida {{date}}",
    "kpi": { "analysed": "Agentes analizados", "proposed": "1:1 por revisar", "scheduled": "1:1 agendados", "ai": "Mensajes IA enviados" },
    "columns": { "findings": "Aspectos débiles", "decision": "Decisión", "date": "Sesión" },
    "decision": { "ONE_ON_ONE": "1:1 con supervisor", "AI_MESSAGE": "Mensaje IA" },
    "weekdays": { "0": "Domingo", "1": "Lunes", "2": "Martes", "3": "Miércoles", "4": "Jueves", "5": "Viernes", "6": "Sábado" }
    ```
  - `description` (the tab header): en `"Weekly batch prepared by the platform, your agenda and the history of every session and AI message."`
    / es `"Lote semanal preparado por la plataforma, tu agenda y el histórico de todas las sesiones y mensajes IA."`.
- [ ] **5.4** `npm run typecheck` → commit `feat(qa-coaching): weekly batch, agenda and history views in the Sessions tab`.

---

## Verification (after Task 5)

1. `npm run typecheck` clean; `git diff --stat main` only touches the files in **File Structure** (plus `src/version.ts`
   bumped by the hook).
2. Read-through:
   - `CoachingSessionStatus` includes `PROPOSED`; `SESSION_STATUSES` / `SESSION_STATUS_COLOR` cover it; every
     `status !== 'SCHEDULED'` split (`SessionsTab.past`, `AgentCoachingTab.past`) also excludes `PROPOSED`, and
     `AgentCoachingTab` filters proposals out entirely.
   - `COACHING_SESSION_SEEDS` starts with the batch sessions; `COACHING_BATCH_SEEDS[0].id === 'cwb-2026-09-07'`
     with `weekFrom '2026-08-31'`, `weekTo '2026-09-06'`, 7 items (AGT-001..007); `coa-a04-weekly` and
     `coa-a06-weekly` now carry `brief` and `batchId` when their agent was decided `AI_MESSAGE`.
   - Exactly one batch 1:1 is `SCHEDULED` for `2026-09-15T10:00:00Z`; the rest are `PROPOSED` with
     `date = 2026-09-08T10:00:00Z`, `ruleId 'cr-000'`, non-empty `brief.findings` unless the week was clean.
   - `nextBatchAt(2)` on TODAY (Sat 12 Sep) → `{ coachingDate: '2026-09-15', generatedAt: '2026-09-14T08:00:00Z' }`.
   - All new keys exist in **both** locales: `sessions.status.PROPOSED`, `sessions.filters.{batch,agenda,history,topic}`,
     `sessions.history.*`, `sessions.batch.*` (incl. `reason`, `decision`, `weekdays`, `kpi`, `columns`),
     `sessions.brief.*`, `sessions.detail.proposed.*`; `qa.calls` added to the four coaching route entries.
3. Mock sanity (mental, no dev server): Supervisor → Coaching → Sessions opens on **Weekly batch**: header says
   "Generated Mon 7 Sep, 08:00 from the calls of 31 Aug – 6 Sep for coaching on Tue 8 Sep", badge "Next batch Mon 14
   Sep, 08:00", coaching-day select on Tuesday; four KPI cards; a table with the 7 Team 1 agents, their score/tier,
   trend, weak-aspect badges, decision (1:1 vs AI) with its reason, status (Proposed / Scheduled / Completed) and
   the suggested or sent date. Clicking a Proposed row opens the drawer: brief cards (weekly score, weak aspects
   with evidence calls, approach, solution, example, suggested material with an Assign button, "Since the previous
   session"), then evidence / talking points, then the **Pre-loaded by the weekly batch** card with date, modality
   and Schedule / Send as AI message / Dismiss. Scheduling moves the row to Scheduled and the Agenda view; the
   agent's inbox receives the notification. **Agenda** shows today / this week / later + calendar; **History** shows
   past sessions and AI messages with agent, topic and period filters. Agent role → Coaching shows no proposed session.
4. If the user later runs the app: check both themes on the batch table and brief cards (only Mantine color names,
   `TIER_META` colors, `VERDICT_COLOR` and `CALL_ISSUE_BY_KEY[…].color` are used).
