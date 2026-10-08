# Coaching: Agent Page — Post-Coaching Performance Strip, Assignment History, Material Impact Ranking

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Project override on testing:** per `CLAUDE.md` ("Do not create tests unless explicitly requested") and
> `DESIGN_ROLE.md` (stakeholder-mockup session), **no test-writing steps**. Each task's verification is
> `npm run typecheck` (must stay clean). Do not run the dev server.
>
> **When executing:** first copy this file to `docs/superpowers/plans/2026-10-08-coaching-agent-post-coaching.md`,
> then follow tasks in order. One commit per task; finish every edit of a task before staging (husky runs `tsc` over
> the whole project). Commit trailer: `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

## Context

When a supervisor / QA manager clicks an agent in Coaching → Agents, the page
`/qa/{role}/coaching/agents/:agentId` (`CoachingAgentPage` → `AgentCoachingPanel`) opens. Today its top strip is the
four **profile dimension cards** (`DimensionScoreCard`: QA / Sentiment / Compliance / Business, period scores) — the
same cards the agent profile already shows, unrelated to coaching. The Impact tab lists every measured assignment as
one card each, in assignment order, with no ranking.

The user (product designer, stakeholder mockup) wants the page to answer **"how has the agent done since their last
coaching session and the material they consumed?"**:

| Area            | Today                                                | Target                                                                                                                                   |
| --------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Top cards       | Profile dimensions (period scores)                   | **Coaching scorecard since the last completed coach-led session**: composite + 4 aspects, each "after" vs "before", plus a Learning card |
| Assignments tab | All assignments, unsorted, 5 columns                 | Keep as **history**: add Assigned / Completed dates, newest first, paginated                                                             |
| Sessions tab    | `AgentSessionsTable`                                 | Unchanged                                                                                                                                |
| Impact tab      | Performance chart + one card per measured assignment | Performance chart + **materials ranked by impact** (top 3 with sparklines, then a full table)                                            |

Decisions confirmed with the user (2026-10-08):

1. **Anchor** = the agent's latest session with `status === 'COMPLETED'` and `type !== 'AI_MESSAGE'` (1:1,
   side-by-side, group, micro). "After" window = anchor day → `TODAY`; "before" = equal-length window ending the day
   before the anchor. Without any completed session, fall back to the weekly scorecard (last 7 days vs previous 7).
2. **Metrics** = the Coaching weekly scorecard (`buildWeeklyScorecard`: QA 35 / Compliance 30 / Operational 20 /
   Business 15) computed over the real `TEAM_CALLS` of each window — the same numbers the Agents tab shows.
3. A sixth **Learning** card: materials completed since the anchor + the impact verdict of the latest one.
4. Impact tab **keeps** "Performance over time" above the new ranking.

**Mock-clock facts (verified):** `TODAY = '2026-09-12'` (`analytics/constants.ts:24`, from `team/constants.ts`
`NOW_ISO`). Every roster agent has sessions on 2026-06-18 (completed), 2026-08-07 (completed, or MISSED when
`base.qa < 0.7`) and 2026-09-18 (scheduled) from `team/mockData.ts:912-951`; AGT-004 adds 12 history sessions ending
2026-05-28 and the Sep-7 AI message. So the anchor is Aug 7 for most agents (after = 37 days) or Jun 18 (after = 87
days); `TEAM_CALLS` holds 180 days, so the "before" window always has calls. Roster agents have 2 completed LMS
assignments (completed 2026-06-02 and 2026-03-28, `team/mockData.ts:984-987`) with impact when the content has an
`impactMetricId`; AGT-004 has curated ones completed 2026-07-29 / 07-10 / 06-30 / 06-14 (`lms/mockData.ts:260-351`).

## Architecture (reuse-first)

- **Helpers** in a new `src/modules/qa/coaching/postCoaching.ts`: `lastCompletedSession`, `buildPostCoachingSummary`
  (reuses `buildWeeklyScorecard`, `scorecardTrend`, `tierFor` from `scorecard.ts`) and `rankMaterialImpact` (reuses
  `METRIC_BY_ID[...].higherIsBetter`, same delta rule as `ImpactTab.tsx:97-115`).
- One new primitive-level function `agentCallsBetween(agentId, from, to)` in `calls/agentMetrics.ts`, which
  `agentCallsInWindow` then delegates to.
- **UI**: `PostCoachingCards` (SectionCard + 6 `StatCard`s, reusing `TierBadge`, `ScorecardTrendBadge`, `ImpactBadge`)
  and `MaterialImpactRanking` (top-3 `Paper`s with `ImpactSparkline` + `BaseTable`). `AgentCoachingPanel` swaps the
  `DimensionScoreCard` grid for `PostCoachingCards`, extends the assignments table and replaces the Impact list.
- `ScorecardTrendBadge` gains an optional `tooltipKey` so the tooltip can read "before the session → since the session".

## Global Constraints

- Mantine CSS variables / `light-dark()` only; no hardcoded hex. New UI must work in dark and light (only Mantine
  color names and `var(--mantine-color-*-7)` are used below, same as `ImpactTab.tsx` / `AgentsTab.tsx`).
- No new inline `style={{}}` (pre-commit hook). `StatCard`'s `color` prop is fine (the style lives inside StatCard).
- Every string through i18n, namespace `qa.coaching`; write **both** `src/locales/en/qa.coaching.json` and
  `src/locales/es/qa.coaching.json`. Metric names reuse `qa.triggers` `metrics.<id>`; verdicts reuse `qa.lms` via
  `ImpactBadge`.
- Reuse `SectionCard`, `StatCard`, `BaseTable`, existing badges; no new CSS modules needed.
- `npm run typecheck` clean after every task. `tsconfig` has `noUnusedLocals` — remove imports that become unused.
- Commit style: `feat(qa-coaching): …`.

---

## File Structure

**New**

- `src/modules/qa/coaching/postCoaching.ts` — anchor, windows, summary, material ranking.
- `src/modules/qa/coaching/components/PostCoachingCards.tsx` — top strip.
- `src/modules/qa/coaching/components/MaterialImpactRanking.tsx` — Impact tab body.

**Modified**

- `src/modules/qa/calls/agentMetrics.ts` — add `agentCallsBetween`.
- `src/modules/qa/coaching/components/ScorecardBadges.tsx` — `tooltipKey` prop on `ScorecardTrendBadge`.
- `src/modules/qa/coaching/components/AgentCoachingPanel.tsx` — wire the three changes.
- `src/locales/en/qa.coaching.json`, `src/locales/es/qa.coaching.json` — new keys under `agents`.

**Untouched:** `CoachingAgentPage.tsx` (page shell, tabs list, drawers), `AgentSessionsTable.tsx`,
`DimensionScoreCard.tsx` (still used by the agent profile), `scorecard.ts`.

---

## Task 1 — Helpers: call window by dates + post-coaching summary + material ranking

**Files:** `src/modules/qa/calls/agentMetrics.ts`, `src/modules/qa/coaching/postCoaching.ts` (new).

**Verified facts:** `agentCallsInWindow` (`agentMetrics.ts:128-141`) filters `TEAM_CALLS` by `c.date.slice(0, 10)`
between two `'YYYY-MM-DD'` days; `TODAY` / `addDays` come from `~/modules/qa/analytics/constants`.
`scorecard.ts` exports `buildWeeklyScorecard(calls)`, `scorecardTrend(current, previous)`, `tierFor(score)`,
`SCORECARD_DIMENSION_ORDER`, `SCORECARD_WINDOW_DAYS`, types `WeeklyScorecard`, `ScorecardTrend`,
`ScorecardTrendVerdict`, `ScorecardDimension`, `PerformanceTier`. `IMPACT_THRESHOLD = 3` in `lms/constants.ts`.
`METRIC_BY_ID` (`triggers/constants.ts`) entries have `higherIsBetter`. `CoachingSessionRecord` has `agentIds?`
for group sessions; `LmsAssignment.completedAt: string | null`, `impact: LmsImpact | null` with
`baseline`, `checkpoint30: number | null`, `verdict`.

- [ ] **1.1** `agentMetrics.ts` — right **before** `agentCallsInWindow` add:

  ```ts
  /** Every call of one agent between two 'YYYY-MM-DD' days, both inclusive. */
  export const agentCallsBetween = (
  	agentId: string,
  	from: string,
  	to: string
  ): TeamCallMetric[] =>
  	TEAM_CALLS.filter(
  		(c) =>
  			c.agentId === agentId &&
  			c.date.slice(0, 10) >= from &&
  			c.date.slice(0, 10) <= to
  	);
  ```

  and make `agentCallsInWindow` delegate: replace its body (`return TEAM_CALLS.filter(...)`) with
  `return agentCallsBetween(agentId, from, to);` (keep the `to` / `from` lines above it).

- [ ] **1.2** Create `src/modules/qa/coaching/postCoaching.ts`:

  ```ts
  import type {
  	CoachingSessionRecord,
  	LmsAssignment,
  	LmsContent,
  } from '~/models/qa';
  import { TODAY, addDays } from '~/modules/qa/analytics/constants';
  import {
  	agentCallsBetween,
  	agentCallsInWindow,
  } from '~/modules/qa/calls/agentMetrics';
  import { IMPACT_THRESHOLD } from '~/modules/qa/lms/constants';
  import { METRIC_BY_ID } from '~/modules/qa/triggers/constants';
  import {
  	SCORECARD_DIMENSION_ORDER,
  	SCORECARD_WINDOW_DAYS,
  	buildWeeklyScorecard,
  	scorecardTrend,
  	tierFor,
  	type PerformanceTier,
  	type ScorecardDimension,
  	type ScorecardTrend,
  	type ScorecardTrendVerdict,
  	type WeeklyScorecard,
  } from './scorecard';

  /** Same ±IMPACT_THRESHOLD band the scorecard trend uses, for any signed delta. */
  export const verdictForDelta = (delta: number): ScorecardTrendVerdict =>
  	delta >= IMPACT_THRESHOLD
  		? 'IMPROVED'
  		: delta <= -IMPACT_THRESHOLD
  			? 'DECLINED'
  			: 'SAME';

  const dayOf = (iso: string) => iso.slice(0, 10);

  const daysBetween = (from: string, to: string) =>
  	Math.round(
  		(new Date(`${to}T00:00:00Z`).getTime() -
  			new Date(`${from}T00:00:00Z`).getTime()) /
  			86_400_000
  	);

  /** A coach-led session that happened: AI messages are delivered, not held. */
  export const isCoachLedCompleted = (s: CoachingSessionRecord) =>
  	s.status === 'COMPLETED' && s.type !== 'AI_MESSAGE';

  const involves = (s: CoachingSessionRecord, agentId: string) =>
  	s.agentId === agentId || Boolean(s.agentIds?.includes(agentId));

  /** The agent's most recent completed coach-led session, or null. */
  export const lastCompletedSession = (
  	sessions: CoachingSessionRecord[],
  	agentId: string
  ): CoachingSessionRecord | null =>
  	sessions
  		.filter((s) => involves(s, agentId) && isCoachLedCompleted(s))
  		.sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;

  export interface PostCoachingAnchor {
  	session: CoachingSessionRecord;
  	/** 'YYYY-MM-DD' of the session. */
  	day: string;
  	/** Days from the session day to TODAY. */
  	daysAgo: number;
  }

  export interface AspectComparison {
  	dimension: ScorecardDimension;
  	after: number | null;
  	before: number | null;
  	/** after − before; null when either window has no calls. */
  	delta: number | null;
  	verdict: ScorecardTrendVerdict | null;
  }

  export interface PostCoachingSummary {
  	/** null → no completed coach-led session; the weekly scorecard is shown instead. */
  	anchor: PostCoachingAnchor | null;
  	/** Length in days of each window (after = anchor day → TODAY). */
  	windowDays: number;
  	/** Scorecard over the calls since the anchor (or the last 7 days). */
  	after: WeeklyScorecard | null;
  	/** Scorecard over the equal-length window right before the anchor. */
  	before: WeeklyScorecard | null;
  	trend: ScorecardTrend | null;
  	tier: PerformanceTier | null;
  	aspects: AspectComparison[];
  	/** Completed on or after the anchor day, newest first. */
  	materialsCompleted: LmsAssignment[];
  	latestMaterial: LmsAssignment | null;
  }

  /**
   * "After" = calls from the last completed coach-led session to TODAY;
   * "before" = the equal-length window ending the day before it. Without a
   * completed session the weekly scorecard (7 vs previous 7 days) stands in.
   */
  export const buildPostCoachingSummary = (
  	agentId: string,
  	sessions: CoachingSessionRecord[],
  	assignments: LmsAssignment[]
  ): PostCoachingSummary => {
  	const session = lastCompletedSession(sessions, agentId);

  	let anchor: PostCoachingAnchor | null = null;
  	let windowDays = SCORECARD_WINDOW_DAYS;
  	let fromDay = addDays(TODAY, -(windowDays - 1));
  	let after: WeeklyScorecard | null;
  	let before: WeeklyScorecard | null;

  	if (session) {
  		const day = dayOf(session.date);
  		const daysAgo = daysBetween(day, TODAY);
  		windowDays = daysAgo + 1;
  		fromDay = day;
  		anchor = { session, day, daysAgo };
  		after = buildWeeklyScorecard(agentCallsBetween(agentId, day, TODAY));
  		before = buildWeeklyScorecard(
  			agentCallsBetween(agentId, addDays(day, -windowDays), addDays(day, -1))
  		);
  	} else {
  		after = buildWeeklyScorecard(agentCallsInWindow(agentId, windowDays));
  		before = buildWeeklyScorecard(
  			agentCallsInWindow(agentId, windowDays, windowDays)
  		);
  	}

  	const aspects: AspectComparison[] = SCORECARD_DIMENSION_ORDER.map(
  		(dimension) => {
  			const a = after?.dimensions[dimension] ?? null;
  			const b = before?.dimensions[dimension] ?? null;
  			const delta = a !== null && b !== null ? a - b : null;
  			return {
  				dimension,
  				after: a,
  				before: b,
  				delta,
  				verdict: delta === null ? null : verdictForDelta(delta),
  			};
  		}
  	);

  	const materialsCompleted = assignments
  		.filter(
  			(x) =>
  				x.agentId === agentId &&
  				x.status === 'COMPLETED' &&
  				x.completedAt !== null &&
  				x.completedAt >= fromDay
  		)
  		.sort((x, y) => (y.completedAt ?? '').localeCompare(x.completedAt ?? ''));

  	return {
  		anchor,
  		windowDays,
  		after,
  		before,
  		trend: scorecardTrend(after, before),
  		tier: after ? tierFor(after.score) : null,
  		aspects,
  		materialsCompleted,
  		latestMaterial: materialsCompleted[0] ?? null,
  	};
  };

  export interface MaterialImpactRow {
  	assignment: LmsAssignment;
  	content: LmsContent | undefined;
  	/** checkpoint30 − baseline, sign flipped for lower-is-better metrics; null while measuring. */
  	delta: number | null;
  	measured: boolean;
  }

  /** Assignments with an impact record, best delta first; still-measuring ones last. */
  export const rankMaterialImpact = (
  	assignments: LmsAssignment[],
  	contentById: Record<string, LmsContent>
  ): MaterialImpactRow[] =>
  	assignments
  		.filter((a) => a.impact !== null)
  		.map((a) => {
  			const impact = a.impact!;
  			const def = METRIC_BY_ID[impact.metricId];
  			const measured =
  				impact.verdict !== 'PENDING' && impact.checkpoint30 !== null;
  			const raw = measured
  				? (impact.checkpoint30 as number) - impact.baseline
  				: null;
  			const delta =
  				raw === null
  					? null
  					: Math.round((def.higherIsBetter ? raw : -raw) * 10) / 10;
  			return {
  				assignment: a,
  				content: contentById[a.contentId],
  				delta,
  				measured,
  			};
  		})
  		.sort(
  			(x, y) =>
  				(y.delta ?? Number.NEGATIVE_INFINITY) -
  				(x.delta ?? Number.NEGATIVE_INFINITY)
  		);
  ```

- [ ] **1.3** `npm run typecheck` clean → commit
      `feat(qa-coaching): post-coaching scorecard windows and material impact ranking helpers`.

---

## Task 2 — Top strip: performance since the last coaching session

**Files:** `components/ScorecardBadges.tsx`, `components/PostCoachingCards.tsx` (new),
`components/AgentCoachingPanel.tsx`, both `qa.coaching.json`.

**Verified facts:** `StatCard` props `{ title, value, subtitle?: ReactNode, color?, icon?, badge?, variant }`
(`components/StatCard/StatCard.tsx`). `SectionCard` props include `title`, `description?: ReactNode`, `icon`,
`headerActions`, `padding`. `TierBadge({ tier, size })`, `ScorecardTrendBadge({ trend, size })` in
`ScorecardBadges.tsx` (the latter's tooltip is `t('agents.trend.tooltip', { previous, current, delta })`).
`SCORECARD_DIMENSION_META[d].labelKey` gives the aspect name. `getScoreBandColor(v)` returns a Mantine color name
(`AgentsTab.tsx:223` uses ``c={`${getScoreBandColor(v)}.7`}``). `VERDICT_COLOR` maps verdict → color name.
`TIER_META[tier].color` is `'green' | 'blue' | 'yellow' | 'red'`. `ImpactBadge({ impact, size })` renders "—" for
null. The panel currently renders `<SimpleGrid cols={{ base: 2, md: 4 }}>` of `DimensionScoreCard` (lines 123-127).

- [ ] **2.1** `ScorecardBadges.tsx` — `ScorecardTrendBadge`: add prop `tooltipKey?: string` (default
      `'agents.trend.tooltip'`) and use it in the `Tooltip` `label` call instead of the literal key:

  ```tsx
  export function ScorecardTrendBadge({
  	trend,
  	size = 'sm',
  	tooltipKey = 'agents.trend.tooltip',
  }: {
  	trend: ScorecardTrend | null;
  	size?: BadgeSize;
  	/** i18n key with {{previous}}, {{current}}, {{delta}} placeholders. */
  	tooltipKey?: string;
  }) {
  	…
  	label={t(tooltipKey, { previous: trend.previous, current: trend.current, delta: signed })}
  ```

- [ ] **2.2** Create `components/PostCoachingCards.tsx`:

  ```tsx
  import { Badge, Group, SimpleGrid, Stack, Text } from '@mantine/core';
  import { IconSchool } from '@tabler/icons-react';
  import dayjs from 'dayjs';
  import { useTranslation } from 'react-i18next';
  import { SectionCard } from '~/components/SectionCard';
  import { StatCard } from '~/components/StatCard';
  import type { LmsContent } from '~/models/qa';
  import { getScoreBandColor } from '~/modules/qa/constants/badgeColors';
  import { ImpactBadge } from '~/modules/qa/lms/components/Badges';
  import { VERDICT_COLOR } from '~/modules/qa/lms/constants';
  import type { PostCoachingSummary } from '../postCoaching';
  import {
  	SCORECARD_DIMENSION_META,
  	TIER_META,
  	type ScorecardTrendVerdict,
  } from '../scorecard';
  import { ScorecardTrendBadge, TierBadge } from './ScorecardBadges';

  /** Signed change against the "before" window, coloured by the ±3 verdict band. */
  function DeltaBadge({
  	delta,
  	verdict,
  }: {
  	delta: number | null;
  	verdict: ScorecardTrendVerdict | null;
  }) {
  	if (delta === null || verdict === null) return null;
  	return (
  		<Badge size='xs' variant='light' color={VERDICT_COLOR[verdict]}>
  			{delta > 0 ? '+' : ''}
  			{delta}
  		</Badge>
  	);
  }

  interface PostCoachingCardsProps {
  	summary: PostCoachingSummary;
  	contentById: Record<string, LmsContent>;
  }

  /**
   * Six cards: the coaching scorecard since the last completed coach-led
   * session, its four aspects, and the material completed since then — each
   * against the equal-length window before the session.
   */
  export function PostCoachingCards({
  	summary,
  	contentById,
  }: PostCoachingCardsProps) {
  	const { t } = useTranslation('qa.coaching');
  	const {
  		anchor,
  		windowDays,
  		after,
  		before,
  		trend,
  		tier,
  		aspects,
  		materialsCompleted,
  		latestMaterial,
  	} = summary;
  	const latestContent = latestMaterial
  		? contentById[latestMaterial.contentId]
  		: undefined;

  	const beforeText = (value: number | null) =>
  		value === null
  			? t('agents.postCoaching.noBefore')
  			: t('agents.postCoaching.before', { value });

  	const description = anchor ? (
  		<Stack gap={2}>
  			<Text size='sm'>
  				{t('agents.postCoaching.anchor', {
  					topic: anchor.session.topic,
  					date: dayjs(anchor.session.date).format('D MMM YYYY'),
  					coach: anchor.session.coachName,
  				})}
  				{' · '}
  				{t('agents.postCoaching.daysAgo', { count: anchor.daysAgo })}
  			</Text>
  			<Text size='xs' c='dimmed'>
  				{t('agents.postCoaching.windows', {
  					after: after?.calls ?? 0,
  					before: before?.calls ?? 0,
  					days: windowDays,
  				})}
  			</Text>
  		</Stack>
  	) : (
  		t('agents.postCoaching.noSession')
  	);

  	return (
  		<SectionCard
  			icon={IconSchool}
  			title={t('agents.postCoaching.title')}
  			description={description}
  			headerActions={
  				<Group gap='xs'>
  					{tier && <TierBadge tier={tier} />}
  					<ScorecardTrendBadge
  						trend={trend}
  						tooltipKey='agents.postCoaching.trendTooltip'
  					/>
  				</Group>
  			}
  		>
  			<SimpleGrid cols={{ base: 2, md: 3, xl: 6 }} spacing='sm'>
  				<StatCard
  					variant='compact'
  					title={t('agents.postCoaching.cards.scorecard')}
  					value={after ? after.score : '—'}
  					color={
  						tier
  							? `var(--mantine-color-${TIER_META[tier].color}-7)`
  							: undefined
  					}
  					badge={
  						after && (
  							<Badge size='xs' variant='light' color='gray'>
  								{t('agents.postCoaching.calls', { count: after.calls })}
  							</Badge>
  						)
  					}
  					subtitle={
  						<Group gap={6} wrap='nowrap'>
  							<Text size='xs' c='dimmed'>
  								{beforeText(before?.score ?? null)}
  							</Text>
  							<DeltaBadge
  								delta={trend?.delta ?? null}
  								verdict={trend?.verdict ?? null}
  							/>
  						</Group>
  					}
  				/>

  				{aspects.map((a) => (
  					<StatCard
  						key={a.dimension}
  						variant='compact'
  						title={t(SCORECARD_DIMENSION_META[a.dimension].labelKey)}
  						value={a.after ?? '—'}
  						color={
  							a.after === null
  								? undefined
  								: `var(--mantine-color-${getScoreBandColor(a.after)}-7)`
  						}
  						subtitle={
  							<Group gap={6} wrap='nowrap'>
  								<Text size='xs' c='dimmed'>
  									{beforeText(a.before)}
  								</Text>
  								<DeltaBadge delta={a.delta} verdict={a.verdict} />
  							</Group>
  						}
  					/>
  				))}

  				<StatCard
  					variant='compact'
  					title={t('agents.postCoaching.cards.materials')}
  					value={materialsCompleted.length}
  					badge={
  						latestMaterial && (
  							<ImpactBadge impact={latestMaterial.impact} size='xs' />
  						)
  					}
  					subtitle={
  						<Text size='xs' c='dimmed' lineClamp={1}>
  							{latestContent
  								? t('agents.postCoaching.latestMaterial', {
  										title: latestContent.title,
  									})
  								: t('agents.postCoaching.noMaterials')}
  						</Text>
  					}
  				/>
  			</SimpleGrid>
  		</SectionCard>
  	);
  }
  ```

- [ ] **2.3** `AgentCoachingPanel.tsx`:
  - Imports: remove `SimpleGrid` from the `@mantine/core` import and remove the `DimensionScoreCard` import; add
    `import { buildPostCoachingSummary } from '../postCoaching';` and
    `import { PostCoachingCards } from './PostCoachingCards';`.
  - After the `mySessions` memo add:
    ```ts
    const summary = useMemo(
    	() => buildPostCoachingSummary(profile.agent.id, sessions, assignments),
    	[profile, sessions, assignments]
    );
    ```
  - Replace the `<SimpleGrid cols={{ base: 2, md: 4 }} …>…</SimpleGrid>` block (lines 123-127) with
    `<PostCoachingCards summary={summary} contentById={contentById} />`.
- [ ] **2.4** i18n — `qa.coaching.json`, inside `"agents"` after the `"trend"` block (both locales):

  **en**

  ```json
  "postCoaching": {
  	"title": "Since the last coaching session",
  	"anchor": "{{topic}} · {{date}} · {{coach}}",
  	"daysAgo_one": "{{count}} day ago",
  	"daysAgo_other": "{{count}} days ago",
  	"windows": "{{after}} calls since the session · {{before}} calls in the {{days}} days before",
  	"noSession": "No completed coaching session yet — showing the last 7 days against the previous 7.",
  	"trendTooltip": "Before the session {{previous}} → since the session {{current}} ({{delta}})",
  	"calls_one": "{{count}} call",
  	"calls_other": "{{count}} calls",
  	"cards": {
  		"scorecard": "Coaching scorecard",
  		"materials": "Materials completed"
  	},
  	"before": "Before {{value}}",
  	"noBefore": "No calls before",
  	"latestMaterial": "Latest: {{title}}",
  	"noMaterials": "None completed since the session"
  }
  ```

  **es**

  ```json
  "postCoaching": {
  	"title": "Desde la última sesión de coaching",
  	"anchor": "{{topic}} · {{date}} · {{coach}}",
  	"daysAgo_one": "hace {{count}} día",
  	"daysAgo_other": "hace {{count}} días",
  	"windows": "{{after}} llamadas desde la sesión · {{before}} llamadas en los {{days}} días anteriores",
  	"noSession": "Todavía no hay una sesión de coaching completada: se muestran los últimos 7 días frente a los 7 anteriores.",
  	"trendTooltip": "Antes de la sesión {{previous}} → desde la sesión {{current}} ({{delta}})",
  	"calls_one": "{{count}} llamada",
  	"calls_other": "{{count}} llamadas",
  	"cards": {
  		"scorecard": "Scorecard de coaching",
  		"materials": "Materiales completados"
  	},
  	"before": "Antes {{value}}",
  	"noBefore": "Sin llamadas antes",
  	"latestMaterial": "Último: {{title}}",
  	"noMaterials": "Ninguno completado desde la sesión"
  }
  ```

- [ ] **2.5** `npm run typecheck` clean → commit
      `feat(qa-coaching): show the agent's scorecard since the last coaching session instead of profile dimensions`.

---

## Task 3 — Assignments as history + materials ranked by impact

**Files:** `components/MaterialImpactRanking.tsx` (new), `components/AgentCoachingPanel.tsx`, both
`qa.coaching.json`.

**Verified facts:** panel assignments table (lines 142-150) is `BaseTable` with `data={mine}`, `density='compact'`,
no sort/pagination; `AgentSessionsTable` uses `enablePagination pageSize={10} showPaginationControls`. Impact panel
(lines 160-208) = performance `SectionCard` + `measured.map(...)` cards. `ImpactSparkline({ impact, height,
withCheckpoints })`. `FormatBadge({ format, size })`, `AreaBadge({ area, size })`. `DimensionScoreCard` uses
`<Paper withBorder p='md' radius='md'>` — reuse that look for the top-3 cards. Existing keys:
`agents.drawer.noImpact`, `rules.detail.columns.{material,status,impact}`, `qa.lms` `columns.due`.

- [ ] **3.1** Create `components/MaterialImpactRanking.tsx`:

  ```tsx
  import { Badge, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
  import { createColumnHelper } from '@tanstack/react-table';
  import { IconTrophy } from '@tabler/icons-react';
  import dayjs from 'dayjs';
  import { useTranslation } from 'react-i18next';
  import { SectionCard } from '~/components/SectionCard';
  import BaseTable, {
  	type BaseTableColumnDef,
  } from '~/components/BaseTable/BaseTable';
  import {
  	AreaBadge,
  	FormatBadge,
  	ImpactBadge,
  } from '~/modules/qa/lms/components/Badges';
  import { ImpactSparkline } from '~/modules/qa/lms/components/ImpactSparkline';
  import type { MaterialImpactRow } from '../postCoaching';

  const helper = createColumnHelper<MaterialImpactRow>();

  const signed = (delta: number) => `${delta > 0 ? '+' : ''}${delta}`;
  const deltaColor = (delta: number) =>
  	delta > 0 ? 'green' : delta < 0 ? 'red' : undefined;

  interface MaterialImpactRankingProps {
  	rows: MaterialImpactRow[];
  }

  /** The agent's measured materials, best delta first: top 3 with sparklines, then every row. */
  export function MaterialImpactRanking({ rows }: MaterialImpactRankingProps) {
  	const { t } = useTranslation(['qa.coaching', 'qa.triggers']);
  	const top = rows.filter((r) => r.measured).slice(0, 3);

  	if (rows.length === 0) {
  		return (
  			<Text size='sm' c='dimmed'>
  				{t('agents.drawer.noImpact')}
  			</Text>
  		);
  	}

  	const columns: BaseTableColumnDef<MaterialImpactRow>[] = [
  		helper.accessor((r) => r.content?.title ?? r.assignment.contentId, {
  			id: 'material',
  			header: t('agents.impactRanking.columns.material'),
  			cell: (info) => (
  				<Group gap='xs' wrap='nowrap'>
  					<Text size='sm'>{info.getValue()}</Text>
  					{info.row.original.content && (
  						<FormatBadge
  							format={info.row.original.content.format}
  							size='xs'
  						/>
  					)}
  				</Group>
  			),
  		}) as BaseTableColumnDef<MaterialImpactRow>,
  		helper.accessor((r) => r.assignment.completedAt ?? '', {
  			id: 'completed',
  			header: t('agents.impactRanking.columns.completed'),
  			cell: (info) => (
  				<Text size='sm'>
  					{info.getValue()
  						? dayjs(info.getValue()).format('D MMM YYYY')
  						: '—'}
  				</Text>
  			),
  		}) as BaseTableColumnDef<MaterialImpactRow>,
  		helper.display({
  			id: 'metric',
  			header: t('agents.impactRanking.columns.metric'),
  			cell: (info) => (
  				<Text size='xs' c='dimmed'>
  					{t(`metrics.${info.row.original.assignment.impact!.metricId}`, {
  						ns: 'qa.triggers',
  					})}
  				</Text>
  			),
  		}) as BaseTableColumnDef<MaterialImpactRow>,
  		helper.display({
  			id: 'before',
  			header: t('agents.impactRanking.columns.before'),
  			cell: (info) => (
  				<Text size='sm'>{info.row.original.assignment.impact!.baseline}</Text>
  			),
  		}) as BaseTableColumnDef<MaterialImpactRow>,
  		helper.display({
  			id: 'after',
  			header: t('agents.impactRanking.columns.after'),
  			cell: (info) => (
  				<Text size='sm'>
  					{info.row.original.assignment.impact!.checkpoint30 ?? '—'}
  				</Text>
  			),
  		}) as BaseTableColumnDef<MaterialImpactRow>,
  		helper.accessor((r) => r.delta ?? Number.NEGATIVE_INFINITY, {
  			id: 'delta',
  			header: t('agents.impactRanking.columns.delta'),
  			cell: (info) => {
  				const d = info.row.original.delta;
  				return d === null ? (
  					<Text size='xs' c='dimmed'>
  						{t('agents.impactRanking.pending')}
  					</Text>
  				) : (
  					<Text size='sm' fw={600} c={deltaColor(d)}>
  						{signed(d)}
  					</Text>
  				);
  			},
  		}) as BaseTableColumnDef<MaterialImpactRow>,
  		helper.display({
  			id: 'verdict',
  			header: t('agents.impactRanking.columns.verdict'),
  			cell: (info) => (
  				<ImpactBadge impact={info.row.original.assignment.impact} size='xs' />
  			),
  		}) as BaseTableColumnDef<MaterialImpactRow>,
  	];

  	return (
  		<SectionCard
  			icon={IconTrophy}
  			title={t('agents.impactRanking.title')}
  			description={t('agents.impactRanking.description')}
  		>
  			<Stack gap='md'>
  				{top.length > 0 && (
  					<SimpleGrid cols={{ base: 1, md: 3 }} spacing='sm'>
  						{top.map((r, i) => (
  							<Paper key={r.assignment.id} withBorder p='md' radius='md'>
  								<Stack gap='xs'>
  									<Group justify='space-between' wrap='nowrap'>
  										<Badge size='sm' variant='light' color='blue'>
  											{t('agents.impactRanking.rank', { rank: i + 1 })}
  										</Badge>
  										<ImpactBadge impact={r.assignment.impact} size='xs' />
  									</Group>
  									<Text size='sm' fw={600} lineClamp={2}>
  										{r.content?.title ?? r.assignment.contentId}
  									</Text>
  									{r.content && (
  										<Group gap={4}>
  											<FormatBadge format={r.content.format} size='xs' />
  											<AreaBadge area={r.content.area} size='xs' />
  										</Group>
  									)}
  									<Text size='xs' c='dimmed'>
  										{t(`metrics.${r.assignment.impact!.metricId}`, {
  											ns: 'qa.triggers',
  										})}
  									</Text>
  									<Text size='xl' fw={700} c={deltaColor(r.delta ?? 0)}>
  										{signed(r.delta ?? 0)}
  									</Text>
  									<ImpactSparkline
  										impact={r.assignment.impact!}
  										height={70}
  										withCheckpoints={false}
  									/>
  								</Stack>
  							</Paper>
  						))}
  					</SimpleGrid>
  				)}
  				<BaseTable<MaterialImpactRow>
  					data={rows}
  					columns={columns}
  					getRowId={(r) => r.assignment.id}
  					density='compact'
  					emptyMessage={t('agents.drawer.noImpact')}
  				/>
  			</Stack>
  		</SectionCard>
  	);
  }
  ```

- [ ] **3.2** `AgentCoachingPanel.tsx`:
  - Imports: add `import dayjs from 'dayjs';`, `import { MaterialImpactRanking } from './MaterialImpactRanking';`,
    and extend the postCoaching import to `{ buildPostCoachingSummary, rankMaterialImpact }`. Remove the
    `ImpactSparkline` import (no longer used here). Keep `ImpactBadge` (assignments column).
  - Replace the `measured` memo with:
    ```ts
    const history = useMemo(
    	() => [...mine].sort((a, b) => b.assignedAt.localeCompare(a.assignedAt)),
    	[mine]
    );
    const ranked = useMemo(
    	() => rankMaterialImpact(mine, contentById),
    	[mine, contentById]
    );
    ```
  - `assignmentColumns`: insert after the `material` column
    ```tsx
    assignmentHelper.accessor('assignedAt', {
    	header: t('agents.assignmentsHistory.assigned'),
    	cell: (info) => (
    		<Text size='sm'>{dayjs(info.getValue()).format('D MMM YYYY')}</Text>
    	),
    }) as BaseTableColumnDef<LmsAssignment>,
    ```
    and after the `status` column
    ```tsx
    assignmentHelper.accessor('completedAt', {
    	header: t('agents.assignmentsHistory.completed'),
    	cell: (info) => (
    		<Text size='sm'>
    			{info.getValue() ? dayjs(info.getValue()).format('D MMM YYYY') : '—'}
    		</Text>
    	),
    }) as BaseTableColumnDef<LmsAssignment>,
    ```
  - Assignments `BaseTable`: `data={history}` and add `enablePagination pageSize={10} showPaginationControls`.
  - Impact panel: keep the `SectionCard title={t('agents.drawer.performance')}` + `AreaChart` block unchanged;
    replace everything after it inside the `<Stack gap='md'>` (the `measured.length === 0 ? … : measured.map(…)`
    expression) with `<MaterialImpactRanking rows={ranked} />`.
- [ ] **3.3** i18n — `qa.coaching.json`, inside `"agents"` right after `"postCoaching"` (both locales):

  **en**

  ```json
  "assignmentsHistory": {
  	"assigned": "Assigned",
  	"completed": "Completed"
  },
  "impactRanking": {
  	"title": "Materials with the greatest impact",
  	"description": "Completed materials ranked by how much their metric moved 30 days after completion.",
  	"rank": "#{{rank}}",
  	"pending": "Still measuring",
  	"columns": {
  		"material": "Material",
  		"completed": "Completed",
  		"metric": "Metric",
  		"before": "Before",
  		"after": "After 30 days",
  		"delta": "Change",
  		"verdict": "Verdict"
  	}
  }
  ```

  **es**

  ```json
  "assignmentsHistory": {
  	"assigned": "Asignado",
  	"completed": "Completado"
  },
  "impactRanking": {
  	"title": "Materiales con mayor impacto",
  	"description": "Materiales completados ordenados por cuánto se movió su métrica 30 días después de completarlos.",
  	"rank": "#{{rank}}",
  	"pending": "Aún midiendo",
  	"columns": {
  		"material": "Material",
  		"completed": "Completado",
  		"metric": "Métrica",
  		"before": "Antes",
  		"after": "A los 30 días",
  		"delta": "Cambio",
  		"verdict": "Veredicto"
  	}
  }
  ```

- [ ] **3.4** `npm run typecheck` clean → commit
      `feat(qa-coaching): assignment history dates and materials ranked by impact in the agent coaching page`.

---

## Verification (after Task 3)

1. `npm run typecheck` clean; `git diff --stat` touches only the files listed in **File Structure**.
2. Read-through:
   - `AgentCoachingPanel.tsx` no longer imports `DimensionScoreCard`, `ImpactSparkline` or `SimpleGrid`; it
     renders `PostCoachingCards` above the `Tabs`, `history` (newest first, paginated, 7 columns) in Assignments,
     and the performance chart followed by `MaterialImpactRanking` in Impact. Sessions tab untouched.
   - `postCoaching.ts`: `lastCompletedSession` ignores `AI_MESSAGE` and non-COMPLETED; `after` window =
     anchor day → TODAY; `before` = `[anchor − windowDays, anchor − 1]`; fallback to 7 vs 7 when no anchor.
   - `rankMaterialImpact` flips the sign for `higherIsBetter === false` metrics and puts `PENDING` rows last.
   - `ScorecardTrendBadge` default tooltip key unchanged (`AgentsTab` still reads "Previous week → this week").
   - All new keys exist in **both** locales (`agents.postCoaching.*`, `agents.assignmentsHistory.*`,
     `agents.impactRanking.*`), including the `_one` / `_other` plurals.
3. Mock sanity (mental, no dev server): Supervisor → Coaching → Agents → any Team 1 agent: the strip reads
   "Since the last coaching session · <topic> · 7 Aug 2026 · <supervisor> · 36 days ago" (or 18 Jun when the Aug
   session was missed) with six cards; the composite card shows a tier badge and a signed delta; Impact shows the
   chart, then the ranking with up to 3 sparkline cards and the table. AGT-004 (John Smith) has four measured
   materials, so the top 3 and the table are populated.
4. If the user later runs the app: check both themes — only Mantine color names and `--mantine-color-*-7`
   variables are used, matching the existing Impact tab.
