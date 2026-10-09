# Coaching Impact tab: KPIs first, rules → content → sessions → aspects

## Context

The Coaching → Impact tab (`src/modules/qa/coaching/CoachingPage/tabs/ImpactTab.tsx`, one 453-line file) answers "did it work?" but only for LMS material: every number comes from `LmsAssignment.impact` (a 30-day before/after on one metric). The four KPI tiles (Measured / Improved / No change / Declined) sit **second**, under the "Recently measured" table they summarise, and the two-column grid below runs By aspect → By rule → Content effectiveness → By team. Coaching sessions (1:1s and AI messages) are not measured anywhere on the tab, although the brief already measures one session per agent (`CoachingBriefPrevious`, built by `buildPrevious` in `weeklyBatch.ts:122-150`) and `buildPostCoachingSummary` (`postCoaching.ts:98-164`) does the same before/after for the last session.

User decisions (2026-10-09): the KPI strip is the first element of the tab; the tab measures **rules effectiveness** (exists), **content effectiveness** (exists) and **coaching sessions effectiveness** (new: 1:1 and automated messages); **By aspect goes last**. KPI tiles count materials and sessions together, with a sub-line splitting them. The sessions section is a per-type summary plus the recent measured sessions. "Recently measured" (materials) moves inside Content effectiveness.

Mode: Operate. Mockup-level: pure helpers over the existing mock calls and sessions, no store changes, no new state.

---

## Critique summary

| Finding                                                                                                                                        | Severity | Evidence                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| The KPI strip summarises a table that is rendered above it                                                                                     | 🟡       | `ImpactTab.tsx:328-365`                                                |
| Coaching sessions have no effectiveness view, yet the system already computes a before/after per session for the brief                         | 🔴       | `weeklyBatch.ts:122-150`, `postCoaching.ts:98-164`                     |
| "By rule" column header "Measured" shows `agentsAffected`; rule rates are static mock stats, not measurements                                  | 🟡       | `ImpactTab.tsx:278-282`, `mockData.ts:101…421`                         |
| Verdict counting is written three times in the file (`kpis`, `contentRows`, `teamRows`) and again in `impactByArea` and `contentImpactSummary` | 🟢       | `ImpactTab.tsx:69-142`, `helpers.ts:268-298`, `lms/helpers.ts:141-150` |
| Green/red used on raw counts (`c='green' fw={600}` on "Improved", red on any declined > 0) and a hard-coded 60% threshold in two places        | 🟢       | `ImpactTab.tsx:186, 197, 291, 406`                                     |
| `kpis` recomputed every render (not memoised)                                                                                                  | 🟢       | `ImpactTab.tsx:69-76`                                                  |

What works: one verdict scale (`IMPROVED / SAME / DECLINED`, ±`IMPACT_THRESHOLD`) shared by LMS impact and the scorecard trend, so sessions can be measured on the same badge (`ScorecardTrendBadge`, `ScorecardBadges.tsx:102-150`). `StatCard variant='compact'` is the right tile. `BaseTable density='compact'` everywhere.

---

## Direction

1. **KPI strip first**, counting every measurement on the tab (materials + sessions), with the split under "Measured".
2. **Three effectiveness cards in reading order**: Rules → Content (with the recent materials table inside) → Coaching sessions (per-type summary beside the recent measured sessions).
3. **By team** (QA manager only) then **By aspect** last.
4. **One verdict scale, one badge.** Sessions reuse `verdictForDelta` and `ScorecardTrendBadge`; counts reuse a single `countVerdicts` helper.

---

## Implementation plan

Execute in order; `npm run typecheck` after each phase.

### Phase 1 — Session measurement helpers

**1a. Export the area → scorecard map.** In `src/modules/qa/coaching/scorecard.ts` (after `SCORECARD_DIMENSION_ORDER`), add:

```ts
/** Scorecard aspect an evaluation area maps to; null means the composite score (no sentiment dimension). */
export const AREA_TO_SCORECARD: Record<
	EvaluationArea,
	ScorecardDimension | null
> = {
	QUALITY_ASSURANCE: 'qa',
	COMPLIANCE: 'compliance',
	BUSINESS_INSIGHTS: 'business',
	SENTIMENT_EMOTION: null,
};
```

(import `EvaluationArea` from `~/models/qa`). In `weeklyBatch.ts:115-120` delete the local copy and import it from `./scorecard` (`weeklyBatch.ts` already imports from `./scorecard`). `postCoaching.ts` must not import `weeklyBatch.ts` (cycle), which is why the map moves to `scorecard.ts`.

**1b. `src/modules/qa/coaching/postCoaching.ts`** — append:

```ts
export type SessionImpactKind = 'COACH_LED' | 'AI_MESSAGE';

/** One completed session measured on the agent's scorecard: the week after vs. the week before. */
export interface SessionImpactRow {
	sessionId: string;
	agentId: string;
	agentName: string;
	type: CoachingSessionRecord['type'];
	kind: SessionImpactKind;
	topic: string;
	area: CoachingSessionRecord['area'];
	dimension: ScorecardDimension | null;
	/** 'YYYY-MM-DD' of the session or of the message send. */
	day: string;
	before: number | null;
	after: number | null;
	delta: number | null;
	/** PENDING while the week after has not produced calls yet. */
	verdict: ScorecardTrendVerdict | 'PENDING';
}

/** Days of calls needed after a session before it counts as measured. */
const MIN_DAYS_AFTER = 2;

/** Every COMPLETED session of the agents in scope, measured as `SessionImpactRow`s (one per agent for group sessions). */
export const sessionImpacts = (
	sessions: CoachingSessionRecord[],
	agentIds: Set<string>
): SessionImpactRow[] =>
	sessions
		.filter((s) => s.status === 'COMPLETED')
		.flatMap((s) => {
			const participants = (s.agentIds ?? [s.agentId]).filter((id) =>
				agentIds.has(id)
			);
			const day = dayOf(s.date);
			const daysAfter = daysBetween(day, TODAY);
			const dimension = s.area ? AREA_TO_SCORECARD[s.area] : null;
			const kind: SessionImpactKind =
				s.type === 'AI_MESSAGE' ? 'AI_MESSAGE' : 'COACH_LED';
			return participants.map((agentId): SessionImpactRow => {
				const base = {
					sessionId: s.id,
					agentId,
					agentName: s.agentName,
					type: s.type,
					kind,
					topic: s.topic,
					area: s.area,
					dimension,
					day,
				};
				if (daysAfter < MIN_DAYS_AFTER) {
					return {
						...base,
						before: null,
						after: null,
						delta: null,
						verdict: 'PENDING',
					};
				}
				// The week after, cut at today while it is still running.
				const weekEnd = addDays(day, SCORECARD_WINDOW_DAYS - 1);
				const afterCard = buildWeeklyScorecard(
					agentCallsBetween(agentId, day, weekEnd < TODAY ? weekEnd : TODAY)
				);
				const beforeCard = buildWeeklyScorecard(
					agentCallsBetween(
						agentId,
						addDays(day, -SCORECARD_WINDOW_DAYS),
						addDays(day, -1)
					)
				);
				if (!afterCard || !beforeCard) {
					return {
						...base,
						before: null,
						after: null,
						delta: null,
						verdict: 'PENDING',
					};
				}
				const pick = (card: WeeklyScorecard) =>
					dimension ? card.dimensions[dimension] : card.score;
				const before = pick(beforeCard);
				const after = pick(afterCard);
				const delta = after - before;
				return {
					...base,
					before,
					after,
					delta,
					verdict: verdictForDelta(delta),
				};
			});
		});

export interface SessionImpactSummary {
	kind: SessionImpactKind;
	measured: number;
	improved: number;
	same: number;
	declined: number;
	pending: number;
	/** 0-100, null when nothing is measured. */
	improvedRate: number | null;
	/** Mean signed delta of the measured rows, one decimal; null when nothing is measured. */
	avgDelta: number | null;
}

/** One summary per kind, in the order the tab lists them. */
export const summarizeSessionImpacts = (
	rows: SessionImpactRow[]
): SessionImpactSummary[] =>
	(['COACH_LED', 'AI_MESSAGE'] as const).map((kind) => {
		const own = rows.filter((r) => r.kind === kind);
		const measured = own.filter((r) => r.verdict !== 'PENDING');
		const improved = measured.filter((r) => r.verdict === 'IMPROVED').length;
		const deltas = measured.map((r) => r.delta as number);
		return {
			kind,
			measured: measured.length,
			improved,
			same: measured.filter((r) => r.verdict === 'SAME').length,
			declined: measured.filter((r) => r.verdict === 'DECLINED').length,
			pending: own.length - measured.length,
			improvedRate: measured.length
				? Math.round((improved / measured.length) * 100)
				: null,
			avgDelta: deltas.length
				? Math.round((deltas.reduce((s, d) => s + d, 0) / deltas.length) * 10) /
					10
				: null,
		};
	});
```

Imports to add in `postCoaching.ts`: `AREA_TO_SCORECARD` from `./scorecard` (the file already imports `buildWeeklyScorecard`, `SCORECARD_WINDOW_DAYS`, `WeeklyScorecard`, `ScorecardDimension`, `ScorecardTrendVerdict`), `agentCallsBetween` and `addDays`/`TODAY` are already imported. The scorecard is "higher is better" on every dimension (`scorecard.ts:162-203`), so `delta` needs no sign flip.

**1c. Shared verdict counter, `src/modules/qa/coaching/helpers.ts`** (next to `impactByArea`):

```ts
export interface VerdictCounts {
	measured: number;
	improved: number;
	same: number;
	declined: number;
}
/** Counts the three verdicts of anything already measured (PENDING excluded by the caller). */
export const countVerdicts = (
	verdicts: Array<'IMPROVED' | 'SAME' | 'DECLINED'>
): VerdictCounts => ({
	measured: verdicts.length,
	improved: verdicts.filter((v) => v === 'IMPROVED').length,
	same: verdicts.filter((v) => v === 'SAME').length,
	declined: verdicts.filter((v) => v === 'DECLINED').length,
});
```

`ImpactTab` uses it for the KPI strip, `contentRows` and `teamRows`.

### Phase 2 — `CoachingPage.tsx` passes the sessions

At `CoachingPage.tsx:397-407` add `sessions={scopeSessions}` and `scopeAgentIds={scopeAgentIds}` to `<ImpactTab …>` (`scopeSessions` is already computed for the Sessions tab, `:122-130`; `scopeAgentIds` is a new `useMemo(() => new Set(scopeAgents.map((a) => a.id)), [scopeAgents])`). Add `sessions: CoachingSessionRecord[]` and `scopeAgentIds: Set<string>` to `ImpactTabProps`.

### Phase 3 — Rebuild `ImpactTab.tsx` in the new order

Keep the file as the one component; keep every existing column definition except where noted. New top-level structure (`Stack gap='md'`):

**3a. KPI strip (first).** The page passes `scopeAgentIds` (`new Set(scopeAgents.map((a) => a.id))`, memoised; `CoachingPage.tsx` already has `scopeAgents`); add prop `scopeAgentIds: Set<string>` to `ImpactTabProps`.

```ts
const sessionRows = useMemo(
	() => sessionImpacts(sessions, scopeAgentIds),
	[sessions, scopeAgentIds]
);
const measuredSessions = useMemo(
	() => sessionRows.filter((r) => r.verdict !== 'PENDING'),
	[sessionRows]
);
const kpis = useMemo(
	() =>
		countVerdicts([
			...measuredRows.map(
				(r) => r.impact!.verdict as 'IMPROVED' | 'SAME' | 'DECLINED'
			),
			...measuredSessions.map(
				(r) => r.verdict as 'IMPROVED' | 'SAME' | 'DECLINED'
			),
		]),
	[measuredRows, measuredSessions]
);
```

Tiles as today (`SimpleGrid cols={{ base: 2, md: 4 }}`), with `subtitle={t('impact.kpi.split', { materials: measuredRows.length, sessions: measuredSessions.length })}` on the Measured tile. Keep the green/red value colors on Improved / Declined (they are the tab's two signal colors; everything else goes neutral, see 3f).

The early `EmptyState` return applies only when **both** `measuredRows` and `measuredSessions` are empty.

**3b. Rules effectiveness** (full width). `SectionCard title={t('impact.byRule')} description={t('impact.byRuleDescription')}`; table unchanged except the third column header → `t('impact.columns.agents')` ("Agents affected") and the rate cell: green only when `>= IMPACT_RATE_GOOD` (`const IMPACT_RATE_GOOD = 60` at the top of the file, replacing both literals).

**3c. Content effectiveness** (full width). Same card as today, body = `Stack gap='md'`: the per-material `BaseTable`, then a `Text size='sm' fw={600}` sub-heading `t('impact.recent')` with `t('impact.recentDescription')` dimmed under it, then the recent-materials `BaseTable` (`recent`, 10 rows, row click → `onOpenAgent`). Content table cells: "Improved" loses `c='green' fw={600}` (plain `fw={600}`), "Declined" keeps red only when `> 0`, "Avg. change" keeps sign coloring.

**3d. Coaching sessions effectiveness** (new, full width). `SectionCard title={t('impact.bySession')} description={t('impact.bySessionDescription')}`, body `SimpleGrid cols={{ base: 1, lg: 2 }} spacing='md'`:

- Left `BaseTable<SessionImpactSummary>` with `data={summarizeSessionImpacts(sessionRows)}`, `getRowId={(r) => r.kind}`, columns: Type (`t(\`impact.sessionKind.${kind}\`)`with the pending count dimmed under it when`pending > 0`: `t('impact.pending', { count })`), Measured, Improved, No change, Declined (red when > 0), Improved rate (`—`when null, green when`>= IMPACT_RATE_GOOD`), Avg. change (signed, colored by sign, `—` when null).
- Right `BaseTable<SessionImpactRow>` with the 8 most recent `measuredSessions` sorted by `day` desc, `getRowId={(r) => \`${r.sessionId}-${r.agentId}\`}`, `onRowClick={(r) => onOpenAgent(r.agentId)}`, columns: Agent, Session (`t(\`sessions.types.${type}\`)` + topic dimmed under, like the History table), Aspect (`t(LMS_AREA_META[area].labelKey, { ns: 'qa.lms' })`, or `t('impact.composite')` when `dimension === null`), Before → After (`${before} → ${after}`as`size='sm'`, dimmed), Verdict: `<ScorecardTrendBadge size='xs' trend={{ verdict, current: after, previous: before, delta }} tooltipKey='impact.sessionTooltip' />`(import from`../../components/ScorecardBadges`).

**3e. By team** (QA manager only) then **By aspect** (last), both full width, bodies unchanged. The aspect card's `SimpleGrid cols={4}` rate text: green only when `>= IMPACT_RATE_GOOD` (already), keep.

**3f. Neutral by default.** Drop `fw={600} c='green'` on plain counts (content "Improved"). Keep: KPI tile value colors, declined counts red when > 0, rates green at/above the threshold, signed avg. change colored by sign, bar chart series colors. Team `Progress` stays green (it is a rate bar).

### Phase 4 — Copy (`src/locales/{en,es}/qa.coaching.json`, under `impact`)

en additions / changes:

```json
"kpi.split": "{{materials}} materials · {{sessions}} sessions",
"byRuleDescription": "How often each rule fired and how many of its agents improved.",
"bySession": "Coaching sessions effectiveness",
"bySessionDescription": "Each completed 1:1 and AI message, measured on the agent's scorecard: the week after vs. the week before.",
"sessionKind": { "COACH_LED": "1:1 with supervisor", "AI_MESSAGE": "AI message" },
"pending_one": "{{count}} pending",
"pending_other": "{{count}} pending",
"composite": "Overall score",
"sessionTooltip": "Week before {{previous}} → week after {{current}} ({{delta}})",
"columns.agents": "Agents affected",
"columns.type": "Type",
"columns.session": "Session",
"columns.beforeAfter": "Before → after",
"columns.verdict": "Verdict"
```

es:

```json
"kpi.split": "{{materials}} materiales · {{sessions}} sesiones",
"byRuleDescription": "Cuántas veces se activó cada regla y cuántos de sus agentes mejoraron.",
"bySession": "Efectividad de las sesiones de coaching",
"bySessionDescription": "Cada 1:1 y mensaje IA completado, medido en el scorecard del agente: la semana posterior frente a la anterior.",
"sessionKind": { "COACH_LED": "1:1 con supervisor", "AI_MESSAGE": "Mensaje IA" },
"pending_one": "{{count}} pendiente",
"pending_other": "{{count}} pendientes",
"composite": "Puntuación global",
"sessionTooltip": "Semana anterior {{previous}} → semana posterior {{current}} ({{delta}})",
"columns.agents": "Agentes afectados",
"columns.type": "Tipo",
"columns.session": "Sesión",
"columns.beforeAfter": "Antes → después",
"columns.verdict": "Veredicto"
```

`impact.byRule` stays "By rule" → change to en "Rules effectiveness" / es "Efectividad de las reglas" so the three cards read as a set. Remove the unused `impact.title`, `impact.description` and `impact.columns.area` only if a grep confirms no reference.

---

## Files touched

- `src/modules/qa/coaching/scorecard.ts` (1a), `src/modules/qa/coaching/weeklyBatch.ts` (1a, import), `src/modules/qa/coaching/postCoaching.ts` (1b), `src/modules/qa/coaching/helpers.ts` (1c)
- `src/modules/qa/coaching/CoachingPage/CoachingPage.tsx` (2)
- `src/modules/qa/coaching/CoachingPage/tabs/ImpactTab.tsx` (3)
- `src/locales/{en,es}/qa.coaching.json` (4)

Do not touch: `StatCard`, `ScorecardBadges`, `impactByArea`, the LMS impact model, the store.

## Out of scope (noted)

- Rule effectiveness is still static mock `stats`; deriving it from assignments and sessions linked by `ruleId` is a follow-up.
- `contentImpactSummary` and `rankMaterialImpact` duplicate the content math; not consolidated here.
- Page-level `measured` (assignments) vs. tab `measuredRows` (rows with a known agent and content) can still disagree in the tab badge.

## Verification

Per DESIGN_ROLE.md the dev server runs only if asked.

1. `npm run typecheck` passes.
2. `/qa/supervisor/coaching?tab=impact`: the four tiles are first; "Measured" shows the split line "16 materials · N sessions" and the tile values are the sum of both.
3. Order below: Rules effectiveness → Content effectiveness (per-material table, then "Recently measured" inside the same card) → Coaching sessions effectiveness (two tables side by side at ≥ lg, stacked below) → By aspect. As QA manager, By team appears before By aspect.
4. Sessions card: the left table has two rows, "1:1 with supervisor" and "AI message"; last week's batch AI messages (sent 8 Sep) count as measured; the right table lists recent sessions with a verdict badge and a tooltip "Week before … → week after …"; clicking a row opens the agent's Impact tab.
5. Dark mode: tile colors and badges legible. Narrow viewport: the two session tables stack.
