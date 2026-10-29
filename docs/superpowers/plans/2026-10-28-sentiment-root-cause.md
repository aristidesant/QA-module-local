# Sentiment root cause (2026-10-28)

## Context

The platform already tracks sentiment shifts everywhere (call detail Sentiment tab with the start → lowest → end journey and anchored moments, Team Analytics Sentiment area, agent and customer profile tabs, sentiment incidents in My Calls). What it never does is say **why** sentiment dropped. The Jose Luis ticket "Sentiment and Root Cause Analysis" asks for both halves: track the shift _and_ connect it to the underlying cause. This plan adds the missing half as a mockup: a per-call root cause with AI evidence and reviewer confirmation, and an aggregated causes section in Team Analytics.

Mock-only, no backend. Existing seeded numbers must not move.

## Decisions (user's picks, 2026-10-28)

- **Where:** call detail Sentiment tab (new "Root cause of the sentiment drop" card) + Team Analytics Sentiment area (new causes section). Profiles untouched.
- **Catalogue:** fixed, two families. BUSINESS: `WAIT_TIME`, `PRICING_BILLING`, `TECHNICAL_FAILURE`, `PROCESS_POLICY`, `BROKEN_PROMISE`. AGENT: `AGENT_TONE`, `LACK_OF_EMPATHY`, `INTERRUPTIONS`, `WRONG_INFORMATION`.
- **Roles:** supervisor, qaManager, operationManager see causes. The agent role never does (same rule as ESG).
- **Cardinality:** one primary cause (with evidence quote + minute) and 0–2 secondary causes. Aggregations count the primary only.
- **Review:** supervisor / QA Manager can confirm or correct the AI's primary cause: `pending | confirmed | corrected`. Zustand store, not persisted (same as `callMomentsStore`).
- **Aggregate:** ranking of causes (calls, share, mean drop, previous-period delta), trend per cause (top 4 lines), and segmentation by team/campaign/agent through the existing segmentation with `sentimentCause` as a new group-by dimension. No drill-down call list.

## Architecture

- `src/modules/qa/sentimentCauses/` — the feature's model: `types.ts`, `constants.ts`, `mockCauses.ts` (seeded assignment), `helpers.ts` (aggregations), `components/causeIcons.ts`.
- `TeamCallMetric.sentimentCause: CallSentimentCause | null`, filled by a **post-pass** `applySentimentCauses(calls)` keyed by a hash of the call id (own LCG stream per call), run **after** the `SENTIMENT_DIP` mutation and on `AI_TEAM_CALLS`. No existing draw moves, result is independent of array order.
- `CallSentimentEvaluation.cause: CallSentimentCause | null` on the single call-detail mock, with evidence at 1:48 (the existing "Distrust of the price" moment).
- Two analytics-only metric ids (`SENTIMENT_DROP_CALL_COUNT`, `SENTIMENT_DROP_CALL_SHARE`), a group-by dimension `sentimentCause`, and a filter `sentimentCauses` wired through `filterCalls` / `ARRAY_KEYS` / `narrowFilters` / `segmentKeyOf`.
- Review state in `src/stores/qa/sentimentCauseReviewStore.ts`.
- New i18n namespace `qa.sentimentCauses` (en + es), loaded by the call detail route and the three analytics routes. Labels resolve cross-namespace with `qa.sentimentCauses:causes.<KEY>` where a `t` bound to `qa.teamAnalytics` is in play (segment labels, filter chips, filter drawer). Verified: `nsSeparator` is the i18next default `:`.
- UI: `SentimentCausePanel` (call detail, SectionCard) and `CausesSection` (analytics, three ChartCards reusing `ShareBar`, `TrendChart`, the segmentation table look).

## Global constraints

- Prettier: tabs, 80 cols, single quotes, semicolons, `trailingComma: es5`, `arrowParens: always`. `tsconfig` has `noUnusedLocals` / `noUnusedParameters`.
- Code and comments in English. Mantine CSS vars only; red (`ALERT`) is the only hue on the call page and means "needs attention". In analytics only a change for the worse gets `danger`.
- Shared primitives: `SectionCard`, `BaseTable`, the analytics chart kit in `TeamAnalyticsPage/charts/`. No raw Mantine `Drawer`.
- Do NOT run the dev server. Do NOT commit unless the user says so. `npm run typecheck` after every task.
- Existing pre-existing typecheck errors (if any) in `src/views/Campaigns/pages/CampaignCreate.tsx`, `CampaignDetail.tsx`, `ConversationAspects.tsx` are unrelated; only new errors matter.
- No en/es parity script exists: keep both JSON files key-for-key identical by hand.

## File structure

New:

- `src/modules/qa/sentimentCauses/types.ts`
- `src/modules/qa/sentimentCauses/constants.ts`
- `src/modules/qa/sentimentCauses/mockCauses.ts`
- `src/modules/qa/sentimentCauses/helpers.ts`
- `src/modules/qa/sentimentCauses/components/causeIcons.ts`
- `src/stores/qa/sentimentCauseReviewStore.ts`
- `src/views/Campaigns/components/call-evaluation/SentimentCausePanel.tsx`
- `src/modules/qa/analytics/TeamAnalyticsPage/Sentiment/CausesSection.tsx`
- `src/locales/en/qa.sentimentCauses.json`, `src/locales/es/qa.sentimentCauses.json`
- `docs/superpowers/plans/2026-10-28-sentiment-root-cause.md` (copy of this plan)

Modified:

- `src/modules/qa/analytics/types.ts`, `constants.ts`, `helpers.ts`, `mockData.ts`
- `src/modules/qa/analytics/TeamAnalyticsPage/Segmentation/segmentLabels.ts`, `FilterBar.tsx`, `FilterDrawer.tsx`, `Sentiment/SentimentView.tsx`
- `src/views/Campaigns/types.ts`, `constants.ts`, `components/call-evaluation/anchors.ts`, `SentimentEmotionPanel.tsx`, `pages/ConversationEvaluations.tsx`
- `src/modules/qa/qaNamespaces.ts`
- `src/locales/{en,es}/qa.teamAnalytics.json`

---

## Task 0 — Copy the plan

Copy this file to `docs/superpowers/plans/2026-10-28-sentiment-root-cause.md`. Follow the tasks in order.

## Task 1 — Model and catalogue

Create `src/modules/qa/sentimentCauses/types.ts`:

```ts
export type SentimentCauseFamily = 'BUSINESS' | 'AGENT';

export type SentimentCauseKey =
	| 'WAIT_TIME'
	| 'PRICING_BILLING'
	| 'TECHNICAL_FAILURE'
	| 'PROCESS_POLICY'
	| 'BROKEN_PROMISE'
	| 'AGENT_TONE'
	| 'LACK_OF_EMPATHY'
	| 'INTERRUPTIONS'
	| 'WRONG_INFORMATION';

/** Segment and filter key: a cause, or 'none' for calls whose sentiment never dropped. */
export type SentimentCauseSegmentKey = SentimentCauseKey | 'none';

export type SentimentCauseReviewStatus = 'pending' | 'confirmed' | 'corrected';

/** The transcript turn the analysis points at. Null on analytics calls, which have no transcript. */
export interface SentimentCauseEvidence {
	/** m:ss, same format as `TranscriptTurn.timestamp`. */
	timestamp: string;
	speaker: 'agent' | 'customer';
	quote: string;
}

/** Why the customer's sentiment dropped on one call, as read by the AI. */
export interface CallSentimentCause {
	primary: SentimentCauseKey;
	/** 0-2 contributing causes, never repeating `primary`. Aggregations ignore them. */
	secondary: SentimentCauseKey[];
	/** How far the customer's sentiment fell from the call's start, 1-5 scale, one decimal. */
	sentimentDrop: number;
	evidence: SentimentCauseEvidence | null;
}

/** What a supervisor or QA Manager decided about the AI-detected primary cause of one call. */
export interface SentimentCauseReview {
	status: SentimentCauseReviewStatus;
	/** The replacement cause; present only when `status` is 'corrected'. */
	correctedTo?: SentimentCauseKey;
	/** ISO datetime. */
	reviewedAt: string;
}

// ---------- Aggregations (Team Analytics) ----------

export interface CauseRankingRow {
	key: SentimentCauseKey;
	family: SentimentCauseFamily;
	/** Calls whose primary cause is this one. */
	calls: number;
	/** % of the calls with a drop, one decimal. */
	share: number;
	/** Mean `sentimentDrop` of those calls; null when there are none. */
	meanDrop: number | null;
	previousCalls: number;
	/** Null when no previous period was given. */
	previousShare: number | null;
	/** share − previousShare, in points; null without a previous period. */
	delta: number | null;
}

/** One period; one column per cause key in `CauseTrend.topKeys` (0 when none). */
export interface CauseTrendPoint {
	period: string;
	[causeKey: string]: number | string;
}

export interface CauseTrend {
	points: CauseTrendPoint[];
	/** Most frequent primary causes, biggest first. */
	topKeys: SentimentCauseKey[];
}

export interface FamilyShareRow {
	family: SentimentCauseFamily;
	count: number;
	share: number;
}
```

Create `src/modules/qa/sentimentCauses/constants.ts`:

```ts
import type { SentimentCauseFamily, SentimentCauseKey } from './types';

/** i18n namespace of every cause label; loaded by the analytics and call detail routes. */
export const SENTIMENT_CAUSES_NS = 'qa.sentimentCauses';
/** Segment key of calls without a drop. Label: `causes.none` in the namespace above. */
export const SENTIMENT_CAUSE_NONE_KEY = 'none';

export const SENTIMENT_CAUSE_FAMILY_ORDER: SentimentCauseFamily[] = [
	'BUSINESS',
	'AGENT',
];

export const SENTIMENT_CAUSES: Record<
	SentimentCauseKey,
	{ family: SentimentCauseFamily }
> = {
	WAIT_TIME: { family: 'BUSINESS' },
	PRICING_BILLING: { family: 'BUSINESS' },
	TECHNICAL_FAILURE: { family: 'BUSINESS' },
	PROCESS_POLICY: { family: 'BUSINESS' },
	BROKEN_PROMISE: { family: 'BUSINESS' },
	AGENT_TONE: { family: 'AGENT' },
	LACK_OF_EMPATHY: { family: 'AGENT' },
	INTERRUPTIONS: { family: 'AGENT' },
	WRONG_INFORMATION: { family: 'AGENT' },
};

/** Catalogue order: business causes first, then agent causes. */
export const SENTIMENT_CAUSE_ORDER: SentimentCauseKey[] = [
	'WAIT_TIME',
	'PRICING_BILLING',
	'TECHNICAL_FAILURE',
	'PROCESS_POLICY',
	'BROKEN_PROMISE',
	'AGENT_TONE',
	'LACK_OF_EMPATHY',
	'INTERRUPTIONS',
	'WRONG_INFORMATION',
];

export const SENTIMENT_CAUSE_KEYS_BY_FAMILY: Record<
	SentimentCauseFamily,
	SentimentCauseKey[]
> = {
	BUSINESS: SENTIMENT_CAUSE_ORDER.filter(
		(key) => SENTIMENT_CAUSES[key].family === 'BUSINESS'
	),
	AGENT: SENTIMENT_CAUSE_ORDER.filter(
		(key) => SENTIMENT_CAUSES[key].family === 'AGENT'
	),
};
```

Create `src/modules/qa/sentimentCauses/components/causeIcons.ts` (all names verified in `@tabler/icons-react`):

```ts
import {
	IconCalendarOff,
	IconClipboardList,
	IconHandStop,
	IconHeartOff,
	IconHourglass,
	IconInfoTriangle,
	IconPlugConnectedX,
	IconReceipt,
	IconVolume,
} from '@tabler/icons-react';
import type { SentimentCauseKey } from '../types';

export const CAUSE_ICONS: Record<SentimentCauseKey, typeof IconHourglass> = {
	WAIT_TIME: IconHourglass,
	PRICING_BILLING: IconReceipt,
	TECHNICAL_FAILURE: IconPlugConnectedX,
	PROCESS_POLICY: IconClipboardList,
	BROKEN_PROMISE: IconCalendarOff,
	AGENT_TONE: IconVolume,
	LACK_OF_EMPATHY: IconHeartOff,
	INTERRUPTIONS: IconHandStop,
	WRONG_INFORMATION: IconInfoTriangle,
};
```

Typecheck.

## Task 2 — `TeamCallMetric.sentimentCause`

`src/modules/qa/analytics/types.ts`: add the import near the other type imports at the top:

```ts
import type {
	CallSentimentCause,
	SentimentCauseSegmentKey,
} from '~/modules/qa/sentimentCauses/types';
```

Inside `TeamCallMetric`, right after `voice: CallVoiceSignals;` (~line 112):

```ts
/** Root cause of the customer's sentiment drop; null when sentiment never dropped. Evidence is null here (no transcript). */
sentimentCause: CallSentimentCause | null;
```

`src/modules/qa/analytics/mockData.ts`, in `generateCalls`, in the call literal right after `voice: TYPICAL_VOICE,` (~line 402):

```ts
					// Placeholder: applySentimentCauses fills it once every sentiment mutation has run.
					sentimentCause: null,
```

(`SentimentCauseSegmentKey` is used in Task 5; leave it imported now, or add it then if `noUnusedLocals` complains — type-only unused imports do not error under `noUnusedLocals`, but keep the order of tasks anyway.)

Typecheck. There is no other `TeamCallMetric` literal in `src/`.

## Task 3 — Seeded cause assignment

Create `src/modules/qa/sentimentCauses/mockCauses.ts`:

```ts
import { DEFAULT_SETTINGS } from '~/modules/qa/settings/constants';
import { negativeEmotionsOf } from '~/modules/qa/settings/helpers';
import type { TeamCallMetric } from '~/modules/qa/analytics/types';
import { SENTIMENT_CAUSES, SENTIMENT_CAUSE_ORDER } from './constants';
import type { CallSentimentCause, SentimentCauseKey } from './types';

/** Same LCG as analytics/mockData and burnout/mockVoice. */
function seeded(seed: number) {
	let s = seed;
	return () => {
		s = (s * 9301 + 49297) % 233280;
		return s / 233280;
	};
}

/** FNV-1a over the call id, folded into the LCG modulus: neighbouring ids land far apart. */
const hashId = (id: string): number => {
	let h = 0x811c9dc5;
	for (let i = 0; i < id.length; i++) {
		h ^= id.charCodeAt(i);
		h = Math.imul(h, 0x01000193) >>> 0;
	}
	return h % 233280;
};

function pickWeighted<T>(
	items: { key: T; weight: number }[],
	rand: () => number
): T {
	const total = items.reduce((s, i) => s + i.weight, 0);
	let r = rand() * total;
	for (const item of items) {
		r -= item.weight;
		if (r <= 0) return item.key;
	}
	return items[items.length - 1].key;
}

const round1 = (v: number) => Math.round(v * 10) / 10;
const MIN_DROP = 0.4;
const MAX_DROP = 2.6;

/**
 * Generation is a one-time pass at module init, so it keys off the defaults
 * (the settings store starts from them). Runtime code reads `call.sentimentCause`.
 */
const SENTIMENT = DEFAULT_SETTINGS.thresholds.sentiment;
const NEGATIVE_EMOTIONS = negativeEmotionsOf(SENTIMENT);
const isNegative = (emotion: string) => NEGATIVE_EMOTIONS.includes(emotion);

/** Base mix before the call's own signals tilt it: business causes lead, as in most contact centres. */
const BASE_WEIGHT: Record<SentimentCauseKey, number> = {
	WAIT_TIME: 14,
	PRICING_BILLING: 18,
	TECHNICAL_FAILURE: 14,
	PROCESS_POLICY: 12,
	BROKEN_PROMISE: 10,
	AGENT_TONE: 9,
	LACK_OF_EMPATHY: 9,
	INTERRUPTIONS: 6,
	WRONG_INFORMATION: 8,
};

/** A call gets a cause when sentiment visibly dropped: low score, negative emotion, or a dip that recovered. */
export const hasSentimentDrop = (call: TeamCallMetric): boolean =>
	call.customerSentiment < SENTIMENT.lowSentimentIncident ||
	isNegative(call.predominantEmotion) ||
	call.sentimentRecovered;

function causeWeights(
	call: TeamCallMetric
): { key: SentimentCauseKey; weight: number }[] {
	const agentSide =
		call.agentSentiment < 3 ||
		isNegative(call.agentEmotion) ||
		call.signals.unhandledObjection;
	const waited = call.holdTimeSeconds > 120 || call.transferred;
	const price =
		call.signals.competitorPlusCost ||
		call.nonConversionReason === 'priceTooHigh';
	const misinformed = call.qaScores.ecc > 0;
	return SENTIMENT_CAUSE_ORDER.map((key) => {
		let weight = BASE_WEIGHT[key];
		if (agentSide && SENTIMENT_CAUSES[key].family === 'AGENT') weight *= 3;
		if (waited && key === 'WAIT_TIME') weight *= 4;
		if (price && key === 'PRICING_BILLING') weight *= 4;
		if (misinformed && key === 'WRONG_INFORMATION') weight *= 4;
		return { key, weight };
	});
}

function causeOf(call: TeamCallMetric): CallSentimentCause {
	const rand = seeded(hashId(call.id));
	rand(); // the LCG's first output is linear in the seed
	const weights = causeWeights(call);
	const primary = pickWeighted(weights, rand);

	const r = rand();
	const secondaryCount = r < 0.45 ? 0 : r < 0.85 ? 1 : 2;
	const secondary: SentimentCauseKey[] = [];
	let pool = weights.filter((w) => w.key !== primary);
	for (let i = 0; i < secondaryCount; i++) {
		const key = pickWeighted(pool, rand);
		secondary.push(key);
		pool = pool.filter((w) => w.key !== key);
	}

	// The start of the call never reads above 5; a call already near 5 keeps the floor.
	const room = Math.max(MIN_DROP, round1(5 - call.customerSentiment));
	const sentimentDrop = round1(
		Math.min(MIN_DROP + rand() * (MAX_DROP - MIN_DROP), room)
	);
	return { primary, secondary, sentimentDrop, evidence: null };
}

/**
 * Gives every call with a sentiment drop its root cause, and null to the rest.
 * Keyed by call id rather than by one shared stream, so the result does not depend on
 * array order or on the other passes; a pass of its own, so no existing number changes.
 * Run it AFTER every mutation of sentiment/emotion fields (the SENTIMENT_DIP incident).
 */
export function applySentimentCauses(
	calls: TeamCallMetric[]
): TeamCallMetric[] {
	for (const call of calls) {
		call.sentimentCause = hasSentimentDrop(call) ? causeOf(call) : null;
	}
	return calls;
}
```

`src/modules/qa/analytics/mockData.ts`:

1. Import next to `applyVoiceSignals` (~line 17):
   ```ts
   import { applySentimentCauses } from '~/modules/qa/sentimentCauses/mockCauses';
   ```
2. Right after the `SENTIMENT_DIP` `.forEach(...)` block ends (~line 588), add:
   ```ts
   /** Last, so the two SENTIMENT_DIP calls (2.1 Anger, 1.9 Sadness) are classified on their dipped values and get a cause. */
   applySentimentCauses(TEAM_CALLS);
   ```
3. Right after the `AI_TEAM_CALLS` declaration (~line 696, before `ANALYTICS_CALLS`):
   ```ts
   applySentimentCauses(AI_TEAM_CALLS);
   ```

Do NOT call it inside `buildAllCalls` (the AGT-004 dip calls would be classified on pre-dip values).

Typecheck.

## Task 4 — Metric ids

`src/modules/qa/analytics/types.ts`, inside `AnalyticsOnlyMetricId` after `'SENTIMENT_RECOVERY_RATE'`:

```ts
	| 'SENTIMENT_DROP_CALL_COUNT'
	| 'SENTIMENT_DROP_CALL_SHARE'
```

`src/modules/qa/analytics/helpers.ts`:

- `SHARE_METRIC_IDS` (~line 152, after `'SENTIMENT_RECOVERY_RATE',`): add `'SENTIMENT_DROP_CALL_SHARE',`.
- `ANALYTICS_METRIC_META` (~line 172, after the `SENTIMENT_RECOVERY_RATE` entry):
  ```ts
  	SENTIMENT_DROP_CALL_COUNT: {
  		unit: 'COUNT',
  		higherIsBetter: false,
  		area: 'SENTIMENT_EMOTION',
  	},
  	SENTIMENT_DROP_CALL_SHARE: {
  		unit: 'PERCENT',
  		higherIsBetter: false,
  		area: 'SENTIMENT_EMOTION',
  	},
  ```
- `metricOf` switch (~line 525, after the `SENTIMENT_RECOVERY_RATE` case; the switch has a silent `default`, so check by hand):
  ```ts
  		case 'SENTIMENT_DROP_CALL_COUNT':
  		case 'SENTIMENT_DROP_CALL_SHARE':
  			return toBool(call.sentimentCause !== null);
  ```

`src/modules/qa/analytics/constants.ts`, `VIEW_METRICS.sentiment` (~line 120, after `'SENTIMENT_RECOVERY_COUNT',`):

```ts
		'SENTIMENT_DROP_CALL_SHARE',
		'SENTIMENT_DROP_CALL_COUNT',
```

`formatMetric` and `aggregateMetric` need no change. Typecheck.

## Task 5 — Group-by dimension and filter

`src/modules/qa/analytics/types.ts`:

- `GroupByDimension` (line ~39): add `| 'sentimentCause'` at the end.
- `TeamAnalyticsFilters` (after `emotions: CallEmotion[];`):
  ```ts
  	/** Primary cause keys, or 'none' for calls without a drop. */
  	sentimentCauses: SentimentCauseSegmentKey[];
  ```
- `FilterChipKey` (after `| 'emotions'`): add `| 'sentimentCauses'`.

`src/modules/qa/analytics/constants.ts`:

- `GROUP_BY_OPTIONS` (last entry): `{ value: 'sentimentCause', managerOnly: false },`
- `DRILL_NEXT` (after `weekday: 'agent',`): `sentimentCause: 'agent',`
- `DEFAULT_FILTERS` (after `emotions: [],`): `sentimentCauses: [],`

`src/modules/qa/analytics/helpers.ts`:

- Imports:
  ```ts
  import { SENTIMENT_CAUSE_NONE_KEY } from '~/modules/qa/sentimentCauses/constants';
  import type { SentimentCauseSegmentKey } from '~/modules/qa/sentimentCauses/types';
  ```
- `filterCalls` (~line 324), right after the `emotions` check (`has` is the local `<T>(arr, v)` helper at ~line 329):
  ```ts
  if (
  	!has<string>(
  		f.sentimentCauses,
  		c.sentimentCause?.primary ?? SENTIMENT_CAUSE_NONE_KEY
  	)
  )
  	return false;
  ```
- `ARRAY_KEYS` (~line 392, after `'emotions',`): `'sentimentCauses',` (gives `isEqualFilters` + chips for free).
- `narrowFilters` (~line 487), before `default`:
  ```ts
  		case 'sentimentCause':
  			return { ...f, sentimentCauses: [key as SentimentCauseSegmentKey] };
  ```
- `segmentKeyOf` (~line 705), before `default`:
  ```ts
  		case 'sentimentCause': {
  			const key = call.sentimentCause?.primary ?? SENTIMENT_CAUSE_NONE_KEY;
  			return { key, label: key };
  		}
  ```

`src/modules/qa/analytics/TeamAnalyticsPage/Segmentation/segmentLabels.ts`, `KEY_LABEL_NAMESPACE` (line ~6-11): add

```ts
	sentimentCause: 'qa.sentimentCauses:causes',
```

(The map value is a key prefix for a `t` bound to `qa.teamAnalytics`; the `ns:` prefix makes it resolve in the new namespace.)

`src/modules/qa/analytics/TeamAnalyticsPage/FilterBar.tsx`:

- `VALUE_LABEL_NAMESPACE` (line 21): add `sentimentCauses: 'qa.sentimentCauses:causes',`
- `chipLabels` (line 48): add `sentimentCauses: t('filters.sentimentCauses'),`

`src/modules/qa/analytics/TeamAnalyticsPage/FilterDrawer.tsx`: import

```ts
import {
	SENTIMENT_CAUSE_NONE_KEY,
	SENTIMENT_CAUSE_ORDER,
} from '~/modules/qa/sentimentCauses/constants';
```

and right after the `emotions` `MultiSelect` (ends ~line 344) add:

```tsx
<MultiSelect
	label={t('filters.sentimentCauses')}
	placeholder={t('filters.all')}
	data={labelled(
		[SENTIMENT_CAUSE_NONE_KEY, ...SENTIMENT_CAUSE_ORDER],
		'qa.sentimentCauses:causes'
	)}
	value={draft.sentimentCauses}
	onChange={(sentimentCauses) =>
		patch({
			sentimentCauses: sentimentCauses as typeof draft.sentimentCauses,
		})
	}
	clearable
	comboboxProps={{ withinPortal: true }}
/>
```

Typecheck. (Locale keys `filters.sentimentCauses`, `filters.groupByOptions.sentimentCause`, `metrics.SENTIMENT_DROP_*` come in Task 9.)

## Task 6 — Aggregation helpers

Create `src/modules/qa/sentimentCauses/helpers.ts` (`distribution` and `periodKeyOf` are exported from `analytics/helpers.ts`; `Granularity` from `analytics/types.ts`):

```ts
import { distribution, periodKeyOf } from '~/modules/qa/analytics/helpers';
import type { Granularity, TeamCallMetric } from '~/modules/qa/analytics/types';
import {
	SENTIMENT_CAUSES,
	SENTIMENT_CAUSE_FAMILY_ORDER,
	SENTIMENT_CAUSE_ORDER,
} from './constants';
import type {
	CallSentimentCause,
	CauseRankingRow,
	CauseTrend,
	CauseTrendPoint,
	FamilyShareRow,
	SentimentCauseFamily,
	SentimentCauseKey,
	SentimentCauseReview,
	SentimentCauseReviewStatus,
} from './types';

type CallWithCause = TeamCallMetric & { sentimentCause: CallSentimentCause };

const round1 = (v: number) => Math.round(v * 10) / 10;
const pct = (part: number, total: number) =>
	total ? round1((part / total) * 100) : 0;
const hasCause = (call: TeamCallMetric): call is CallWithCause =>
	call.sentimentCause !== null;

export const callsWithCause = (calls: TeamCallMetric[]): CallWithCause[] =>
	calls.filter(hasCause);

export const reviewStatusOf = (
	review: SentimentCauseReview | undefined
): SentimentCauseReviewStatus => review?.status ?? 'pending';

/** Primary cause after the reviewer's decision: a correction replaces the AI's pick. */
export const effectivePrimaryCause = (
	cause: CallSentimentCause | null,
	review: SentimentCauseReview | undefined
): SentimentCauseKey | null => {
	if (!cause) return null;
	return review?.status === 'corrected' && review.correctedTo
		? review.correctedTo
		: cause.primary;
};

const countByCause = (calls: CallWithCause[]) => {
	const counts = new Map<SentimentCauseKey, number>();
	for (const call of calls) {
		const key = call.sentimentCause.primary;
		counts.set(key, (counts.get(key) ?? 0) + 1);
	}
	return counts;
};

/** Every cause (zero rows included), by calls desc then catalogue order. Shares are over the calls with a drop. */
export function causeRanking(
	calls: TeamCallMetric[],
	previousCalls: TeamCallMetric[]
): CauseRankingRow[] {
	const current = callsWithCause(calls);
	const previous = callsWithCause(previousCalls);
	const hasPrevious = previousCalls.length > 0;
	const prevCounts = countByCause(previous);
	const rows = SENTIMENT_CAUSE_ORDER.map((key): CauseRankingRow => {
		const own = current.filter((c) => c.sentimentCause.primary === key);
		const previousCount = prevCounts.get(key) ?? 0;
		const share = pct(own.length, current.length);
		const previousShare = hasPrevious
			? pct(previousCount, previous.length)
			: null;
		return {
			key,
			family: SENTIMENT_CAUSES[key].family,
			calls: own.length,
			share,
			meanDrop: own.length
				? round1(
						own.reduce((s, c) => s + c.sentimentCause.sentimentDrop, 0) /
							own.length
					)
				: null,
			previousCalls: previousCount,
			previousShare,
			delta: previousShare === null ? null : round1(share - previousShare),
		};
	});
	return rows.sort(
		(a, b) =>
			b.calls - a.calls ||
			SENTIMENT_CAUSE_ORDER.indexOf(a.key) -
				SENTIMENT_CAUSE_ORDER.indexOf(b.key)
	);
}

/** Calls with a drop per period for the `topN` most frequent primary causes; quiet periods read 0. */
export function causeTrend(
	calls: TeamCallMetric[],
	granularity: Granularity,
	topN = 4
): CauseTrend {
	const g = granularity === 'per-call' ? 'daily' : granularity;
	const withCause = callsWithCause(calls);
	const totals = countByCause(withCause);
	const topKeys = SENTIMENT_CAUSE_ORDER.filter((key) => totals.has(key))
		.sort((a, b) => (totals.get(b) ?? 0) - (totals.get(a) ?? 0))
		.slice(0, topN);
	const top = new Set<SentimentCauseKey>(topKeys);
	const emptyRow = () =>
		Object.fromEntries(topKeys.map((key) => [key, 0])) as Record<
			string,
			number
		>;

	const buckets = new Map<string, Record<string, number>>();
	// Every call opens its period, so periods without a drop still appear as zeros.
	for (const call of calls) {
		const period = periodKeyOf(call.date, g);
		if (!buckets.has(period)) buckets.set(period, emptyRow());
	}
	for (const call of withCause) {
		const key = call.sentimentCause.primary;
		if (!top.has(key)) continue;
		const row = buckets.get(periodKeyOf(call.date, g));
		if (row) row[key] += 1;
	}
	const points: CauseTrendPoint[] = [...buckets.keys()]
		.sort()
		.map((period) => ({ period, ...buckets.get(period) }));
	return { points, topKeys };
}

/** Two rows, BUSINESS then AGENT: how many drops each family caused and its share. */
export const familyShare = (calls: TeamCallMetric[]): FamilyShareRow[] =>
	distribution(
		calls.map((c) =>
			c.sentimentCause
				? SENTIMENT_CAUSES[c.sentimentCause.primary].family
				: null
		),
		SENTIMENT_CAUSE_FAMILY_ORDER
	).map((row) => ({
		family: row.key as SentimentCauseFamily,
		count: row.count,
		share: row.share,
	}));
```

If `periodKeyOf`'s second parameter type is narrower than `Granularity` minus `'per-call'`, adapt the local `g` cast to match its signature (read it at `analytics/helpers.ts` ~line 698). Typecheck.

## Task 7 — Review store

Create `src/stores/qa/sentimentCauseReviewStore.ts` (no `persist`, like `callMomentsStore`):

```ts
import { create } from 'zustand';
import type {
	SentimentCauseKey,
	SentimentCauseReview,
} from '~/modules/qa/sentimentCauses/types';

interface SentimentCauseReviewState {
	/** Nothing is persisted; keyed by call id. A call with no entry is 'pending'. */
	reviews: Record<string, SentimentCauseReview>;
	confirm: (callId: string) => void;
	correct: (callId: string, key: SentimentCauseKey) => void;
	/** Drops the decision, so the call is back to 'pending'. */
	reset: (callId: string) => void;
}

const now = () => new Date().toISOString();

export const useSentimentCauseReviewStore = create<SentimentCauseReviewState>()(
	(set) => ({
		reviews: {},
		confirm: (callId) =>
			set((s) => ({
				reviews: {
					...s.reviews,
					[callId]: { status: 'confirmed', reviewedAt: now() },
				},
			})),
		correct: (callId, key) =>
			set((s) => ({
				reviews: {
					...s.reviews,
					[callId]: {
						status: 'corrected',
						correctedTo: key,
						reviewedAt: now(),
					},
				},
			})),
		reset: (callId) =>
			set((s) => ({
				reviews: Object.fromEntries(
					Object.entries(s.reviews).filter(([id]) => id !== callId)
				),
			})),
	})
);

export const selectReviews = (s: SentimentCauseReviewState) => s.reviews;
/** Raw slice for one call (undefined = pending); a stable reference, safe for Zustand v5 selectors. */
export const selectReview =
	(callId: string) =>
	(s: SentimentCauseReviewState): SentimentCauseReview | undefined =>
		s.reviews[callId];
```

Typecheck.

## Task 8 — Call-detail model and mock

`src/views/Campaigns/types.ts`: import near the `~/modules/qa/emotion-sentiment/types` import (~line 140):

```ts
import type { CallSentimentCause } from '~/modules/qa/sentimentCauses/types';
```

In `CallSentimentEvaluation` after `burnout: AgentBurnoutRisk;`:

```ts
/** Why the customer's sentiment dropped; null when it never did. Hidden from the agent role. */
cause: CallSentimentCause | null;
```

`src/views/Campaigns/constants.ts`, `mockCallEvaluationDetail.sentiment`:

1. **Recovery adjustment (mock-data change, intentional):** the call currently opens at 2.0 and bottoms at 1.8, a 0.2 fall that tells no story. Change the `recovery` block (~lines 1039-1050) to:
   ```ts
   		recovery: {
   			startCategory: 'neutral',
   			startScore: 3.2,
   			lowestCategory: 'negative',
   			lowestScore: 1.8,
   			lowestAt: '1:48',
   			endCategory: 'positive',
   			endScore: 3.6,
   			recovered: true,
   			recoveryTimeSeconds: 57,
   			improvementDelta: 0.4,
   		},
   ```
   (`SentimentCategory` values are `'very-negative' | 'negative' | 'neutral' | 'positive' | 'very-positive'`.)
2. Right after that `recovery` block and before `empathyIndicators`, insert:
   ```ts
   		// 1.4 = startScore 3.2 → lowestScore 1.8 at 1:48, right after the price comparison.
   		cause: {
   			primary: 'PRICING_BILLING',
   			secondary: ['AGENT_TONE'],
   			sentimentDrop: 1.4,
   			evidence: {
   				timestamp: '1:48',
   				speaker: 'customer',
   				quote:
   					"Claro offers the same speed for less, and I don't know what this costs after six months.",
   			},
   		},
   ```
   The quote is the full text of transcript turn `t8` at 1:48, so the evidence anchor resolves to that turn. `AGENT_TONE` as secondary is backed by the existing 1:15 agent Frustration anchor.

Typecheck. This is the only `CallSentimentEvaluation` literal in `src/`.

## Task 9 — i18n

Create `src/locales/en/qa.sentimentCauses.json`:

```json
{
	"causes": {
		"none": "No sentiment drop",
		"WAIT_TIME": "Wait time",
		"PRICING_BILLING": "Pricing & billing",
		"TECHNICAL_FAILURE": "Technical failure",
		"PROCESS_POLICY": "Process & policy",
		"BROKEN_PROMISE": "Broken promise",
		"AGENT_TONE": "Agent tone",
		"LACK_OF_EMPATHY": "Lack of empathy",
		"INTERRUPTIONS": "Interruptions",
		"WRONG_INFORMATION": "Wrong information"
	},
	"families": {
		"BUSINESS": "Business",
		"AGENT": "Agent"
	},
	"review": {
		"pending": "Pending review",
		"confirmed": "Confirmed",
		"corrected": "Corrected",
		"correctedFrom": "The AI read it as {{cause}}",
		"confirm": "Confirm cause",
		"correct": "Change cause",
		"reset": "Undo review"
	},
	"callPanel": {
		"title": "Root cause of the sentiment drop",
		"description": "Why the customer's sentiment fell, as read by the AI. Confirm it or pick the right cause.",
		"primary": "Primary cause",
		"secondary": "Contributing causes",
		"drop": "Sentiment drop",
		"dropValue": "−{{value}} pts",
		"evidence": "Evidence",
		"noCause": "No sentiment drop was detected on this call."
	},
	"analytics": {
		"rankingTitle": "Root causes of sentiment drops",
		"rankingDescription": "Calls whose customer sentiment dropped, by primary cause, compared with the previous period.",
		"trendTitle": "Causes over time",
		"trendDescription": "Calls with a sentiment drop per period, for the most frequent causes.",
		"familyTitle": "Business vs agent causes",
		"familyDescription": "Share of sentiment drops caused by the business versus by the agent.",
		"dropSummary": "{{count}} of {{total}} calls had a sentiment drop",
		"columns": {
			"cause": "Cause",
			"calls": "Calls",
			"share": "Share",
			"meanDrop": "Avg. drop",
			"previous": "Previous",
			"delta": "Change"
		}
	}
}
```

Create `src/locales/es/qa.sentimentCauses.json`:

```json
{
	"causes": {
		"none": "Sin caída de sentimiento",
		"WAIT_TIME": "Tiempo de espera",
		"PRICING_BILLING": "Precio y facturación",
		"TECHNICAL_FAILURE": "Falla técnica",
		"PROCESS_POLICY": "Proceso y políticas",
		"BROKEN_PROMISE": "Promesa incumplida",
		"AGENT_TONE": "Tono del agente",
		"LACK_OF_EMPATHY": "Falta de empatía",
		"INTERRUPTIONS": "Interrupciones",
		"WRONG_INFORMATION": "Información incorrecta"
	},
	"families": {
		"BUSINESS": "Negocio",
		"AGENT": "Agente"
	},
	"review": {
		"pending": "Pendiente de revisión",
		"confirmed": "Confirmada",
		"corrected": "Corregida",
		"correctedFrom": "La IA la leyó como {{cause}}",
		"confirm": "Confirmar causa",
		"correct": "Cambiar causa",
		"reset": "Deshacer revisión"
	},
	"callPanel": {
		"title": "Causa raíz de la caída de sentimiento",
		"description": "Por qué cayó el sentimiento del cliente, según la lectura de la IA. Confírmala o elige la causa correcta.",
		"primary": "Causa principal",
		"secondary": "Causas secundarias",
		"drop": "Caída de sentimiento",
		"dropValue": "−{{value}} pts",
		"evidence": "Evidencia",
		"noCause": "No se detectó una caída de sentimiento en esta llamada."
	},
	"analytics": {
		"rankingTitle": "Causas raíz de las caídas de sentimiento",
		"rankingDescription": "Llamadas en las que cayó el sentimiento del cliente, por causa principal, comparadas con el período anterior.",
		"trendTitle": "Causas a lo largo del tiempo",
		"trendDescription": "Llamadas con caída de sentimiento por período, para las causas más frecuentes.",
		"familyTitle": "Causas del negocio vs del agente",
		"familyDescription": "Proporción de caídas de sentimiento causadas por el negocio frente a las causadas por el agente.",
		"dropSummary": "{{count}} de {{total}} llamadas tuvieron una caída de sentimiento",
		"columns": {
			"cause": "Causa",
			"calls": "Llamadas",
			"share": "Proporción",
			"meanDrop": "Caída promedio",
			"previous": "Anterior",
			"delta": "Variación"
		}
	}
}
```

`src/locales/en/qa.teamAnalytics.json` — add, keeping existing structure:

- `filters.groupByOptions.sentimentCause`: `"Sentiment drop cause"`
- `filters.sentimentCauses`: `"Sentiment drop causes"` (sibling of `filters.emotions`)
- `metrics.SENTIMENT_DROP_CALL_COUNT`: `"Sentiment-drop calls"`
- `metrics.SENTIMENT_DROP_CALL_SHARE`: `"Sentiment-drop rate"`

`src/locales/es/qa.teamAnalytics.json` — same keys:

- `filters.groupByOptions.sentimentCause`: `"Causa de la caída de sentimiento"`
- `filters.sentimentCauses`: `"Causas de caída de sentimiento"`
- `metrics.SENTIMENT_DROP_CALL_COUNT`: `"Llamadas con caída de sentimiento"`
- `metrics.SENTIMENT_DROP_CALL_SHARE`: `"Tasa de caídas de sentimiento"`

`src/modules/qa/qaNamespaces.ts`: append `'qa.sentimentCauses'` to the arrays of `qa.campaigns.conversation`, `qa.supervisor.analytics`, `qa.qa-manager.analytics`, `qa.operation-manager.analytics`. Agent routes do not load it. The glob loader in `src/locales/i18n.ts` picks the new files up automatically.

Typecheck. Then confirm both new JSON files have identical key sets (compare by eye or with a one-off node script in the scratchpad, not in the repo).

## Task 10 — Call detail UI

### 10a. Cause anchor — `src/views/Campaigns/components/call-evaluation/anchors.ts`

Append:

```ts
/** The turn the root cause points at, as a jumpable anchor (not listed with the other moments). */
export const buildCauseAnchor = (
	call: CallEvaluationDetail
): TimelineAnchor | null => {
	const cause = call.sentiment.cause;
	if (!cause?.evidence) return null;
	const turn = turnAt(call.transcript, cause.evidence.timestamp);
	if (!turn) return null;
	return {
		id: `sc-${call.callId}`,
		tab: 'sentiment-emotion',
		turnId: turn.id,
		timestamp: cause.evidence.timestamp,
		seconds: parseTimestamp(cause.evidence.timestamp),
		speaker: cause.evidence.speaker,
		tag: 'Root cause',
		label: cause.primary,
		quote: turn.text,
		highlight: partOf(turn, cause.evidence.quote),
		status: 'alert',
	};
};
```

### 10b. `SentimentCausePanel` — new file `src/views/Campaigns/components/call-evaluation/SentimentCausePanel.tsx`

```tsx
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Badge,
	Button,
	Group,
	Menu,
	Stack,
	Text,
	ThemeIcon,
} from '@mantine/core';
import {
	IconCheck,
	IconChevronDown,
	IconRotate,
	IconTargetArrow,
} from '@tabler/icons-react';
import { SectionCard } from '~/components/SectionCard';
import { CAUSE_ICONS } from '~/modules/qa/sentimentCauses/components/causeIcons';
import {
	SENTIMENT_CAUSES,
	SENTIMENT_CAUSES_NS,
	SENTIMENT_CAUSE_FAMILY_ORDER,
	SENTIMENT_CAUSE_KEYS_BY_FAMILY,
} from '~/modules/qa/sentimentCauses/constants';
import {
	effectivePrimaryCause,
	reviewStatusOf,
} from '~/modules/qa/sentimentCauses/helpers';
import type {
	CallSentimentCause,
	SentimentCauseReviewStatus,
} from '~/modules/qa/sentimentCauses/types';
import {
	selectReview,
	useSentimentCauseReviewStore,
} from '~/stores/qa/sentimentCauseReviewStore';
import type { TimelineAnchor } from '../../types';
import { EvidenceQuote } from './EvidenceQuote';
import { ALERT, flagTone } from './tone';

interface SentimentCausePanelProps {
	cause: CallSentimentCause | null;
	callId: string;
	/** The evidence turn, jumpable. Null when the call has no evidence or no player. */
	anchor: TimelineAnchor | null;
	activeAnchorId: string | null;
	onJump?: (anchor: TimelineAnchor) => void;
	/** Reviewers confirm or change the cause; agents never reach this panel. */
	canReview: boolean;
}

/** Outlined means "not decided yet"; a decision reads filled. Grey throughout: the review is not an alert. */
const REVIEW_BADGE: Record<
	SentimentCauseReviewStatus,
	{ variant: 'outline' | 'light' }
> = {
	pending: { variant: 'outline' },
	confirmed: { variant: 'light' },
	corrected: { variant: 'light' },
};

/** Why the customer's sentiment dropped, the AI's evidence, and the reviewer's decision. */
export function SentimentCausePanel({
	cause,
	callId,
	anchor,
	activeAnchorId,
	onJump,
	canReview,
}: SentimentCausePanelProps) {
	const { t } = useTranslation(SENTIMENT_CAUSES_NS);
	const review = useSentimentCauseReviewStore(selectReview(callId));
	const confirm = useSentimentCauseReviewStore((s) => s.confirm);
	const correct = useSentimentCauseReviewStore((s) => s.correct);
	const reset = useSentimentCauseReviewStore((s) => s.reset);
	const status = reviewStatusOf(review);
	const primary = effectivePrimaryCause(cause, review);
	const PrimaryIcon = primary ? CAUSE_ICONS[primary] : IconTargetArrow;

	return (
		<SectionCard
			title={t('callPanel.title')}
			description={t('callPanel.description')}
			icon={IconTargetArrow}
			headerActions={
				cause && (
					<Group gap='xs'>
						<Badge {...flagTone(cause.sentimentDrop >= 1)} size='lg'>
							{t('callPanel.dropValue', {
								value: cause.sentimentDrop.toFixed(1),
							})}
						</Badge>
						<Badge
							size='lg'
							color='gray'
							variant={REVIEW_BADGE[status].variant}
							tt='none'
						>
							{t(`review.${status}`)}
						</Badge>
					</Group>
				)
			}
		>
			{!cause || !primary ? (
				<Text size='sm' c='dimmed'>
					{t('callPanel.noCause')}
				</Text>
			) : (
				<Stack gap='md'>
					{/* Primary cause */}
					<Group gap='md' align='flex-start' wrap='nowrap'>
						<ThemeIcon size={48} radius='md' variant='light' color={ALERT}>
							<PrimaryIcon size={28} />
						</ThemeIcon>
						<Stack gap={2}>
							<Text size='xs' fw={600} c='dimmed' tt='uppercase'>
								{t('callPanel.primary')}
							</Text>
							<Group gap='xs' wrap='wrap'>
								<Text fw={700} size='lg'>
									{t(`causes.${primary}`)}
								</Text>
								<Badge size='sm' variant='outline' color='gray' tt='none'>
									{t(`families.${SENTIMENT_CAUSES[primary].family}`)}
								</Badge>
							</Group>
							{status === 'corrected' && (
								<Text size='xs' c='dimmed'>
									{t('review.correctedFrom', {
										cause: t(`causes.${cause.primary}`),
									})}
								</Text>
							)}
						</Stack>
					</Group>

					{/* Evidence */}
					{cause.evidence && (
						<div>
							<Text size='xs' fw={600} c='dimmed' tt='uppercase' mb='xs'>
								{t('callPanel.evidence')}
							</Text>
							<EvidenceQuote
								evidence={cause.evidence}
								callId={callId}
								active={anchor !== null && anchor.id === activeAnchorId}
								onPlay={anchor && onJump ? () => onJump(anchor) : undefined}
							/>
						</div>
					)}

					{/* Secondary causes */}
					{cause.secondary.length > 0 && (
						<div>
							<Text size='xs' fw={600} c='dimmed' tt='uppercase' mb='xs'>
								{t('callPanel.secondary')}
							</Text>
							<Group gap='xs'>
								{cause.secondary.map((key) => {
									const Icon = CAUSE_ICONS[key];
									return (
										<Badge
											key={key}
											variant='light'
											color='gray'
											tt='none'
											leftSection={<Icon size={12} />}
										>
											{t(`causes.${key}`)}
										</Badge>
									);
								})}
							</Group>
						</div>
					)}

					{/* Review actions */}
					{canReview && (
						<Group gap='xs'>
							{status === 'pending' && (
								<Button
									size='xs'
									variant='light'
									color='gray'
									leftSection={<IconCheck size={14} />}
									onClick={() => confirm(callId)}
								>
									{t('review.confirm')}
								</Button>
							)}
							<Menu withinPortal position='bottom-start' shadow='md'>
								<Menu.Target>
									<Button
										size='xs'
										variant='subtle'
										color='gray'
										rightSection={<IconChevronDown size={14} />}
									>
										{t('review.correct')}
									</Button>
								</Menu.Target>
								<Menu.Dropdown>
									{SENTIMENT_CAUSE_FAMILY_ORDER.map((family) => (
										<Fragment key={family}>
											<Menu.Label>{t(`families.${family}`)}</Menu.Label>
											{SENTIMENT_CAUSE_KEYS_BY_FAMILY[family]
												.filter((key) => key !== primary)
												.map((key) => {
													const Icon = CAUSE_ICONS[key];
													return (
														<Menu.Item
															key={key}
															leftSection={<Icon size={14} />}
															onClick={() => correct(callId, key)}
														>
															{t(`causes.${key}`)}
														</Menu.Item>
													);
												})}
										</Fragment>
									))}
								</Menu.Dropdown>
							</Menu>
							{status !== 'pending' && (
								<Button
									size='xs'
									variant='subtle'
									color='gray'
									leftSection={<IconRotate size={14} />}
									onClick={() => reset(callId)}
								>
									{t('review.reset')}
								</Button>
							)}
						</Group>
					)}
				</Stack>
			)}
		</SectionCard>
	);
}
```

Behaviour table:

| State          | Trigger                | UI                                                                                                                                            |
| -------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| No drop        | `cause === null`       | Card with the dimmed "No sentiment drop was detected" text, no header badges                                                                  |
| Pending        | no review entry        | Drop badge (red when drop ≥ 1.0, grey otherwise) + outlined grey "Pending review"; buttons Confirm cause · Change cause                       |
| Confirmed      | `confirm(callId)`      | "Confirmed" filled grey; buttons Change cause · Undo review                                                                                   |
| Corrected      | `correct(callId, key)` | Primary shows the corrected cause and its icon; small "The AI read it as X" line; "Corrected" filled grey; buttons Change cause · Undo review |
| Evidence click | Play icon or quote     | `onJump(anchor)` → player seeks to 1:48, transcript turn t8 highlighted, quote card shows `data-active`                                       |
| Agent role     | panel not mounted      | —                                                                                                                                             |

### 10c. `SentimentEmotionPanel.tsx` — new props and mount

Add to the imports:

```ts
import type { CallSentimentCause } from '~/modules/qa/sentimentCauses/types';
import { SentimentCausePanel } from './SentimentCausePanel';
```

Add to `SentimentEmotionPanelProps`:

```ts
	/** Root cause of the drop; omit it where the viewer must not see it (agent role). */
	cause?: CallSentimentCause | null;
	causeAnchor?: TimelineAnchor | null;
	/** Reviewers confirm or change the cause. */
	canReview?: boolean;
```

Destructure `cause, causeAnchor = null, canReview = false` in the component. Render right after the speaker-cards `SimpleGrid` (before the `AnchorMoments` block):

```tsx
{
	/* Why the customer's sentiment dropped (reviewers only) */
}
{
	cause !== undefined && callId && (
		<SentimentCausePanel
			cause={cause}
			callId={callId}
			anchor={causeAnchor}
			activeAnchorId={activeAnchorId}
			onJump={onJump}
			canReview={canReview}
		/>
	);
}
```

### 10d. `ConversationEvaluations.tsx`

- Import `buildCauseAnchor` from `../components/call-evaluation/anchors` (same import line as `buildSentimentAnchors`).
- After `const complianceAnchors = useMemo(...)` (line ~138) add:
  ```ts
  const causeAnchor = useMemo(() => buildCauseAnchor(call), [call]);
  ```
- In the `<SentimentEmotionPanel ... />` mount (lines ~416-427) add:
  ```tsx
  									cause={previewRole !== 'agent' ? call.sentiment.cause : undefined}
  									causeAnchor={causeAnchor}
  									canReview={canReview}
  ```

`jumpToAnchor` already seeks, sets `activeMomentId` to the anchor id and keeps the tab, so the evidence quote's `active` lights up. The cause anchor is deliberately not added to `sentimentAnchors` (it would leak a "Root cause" marker to the agent role).

Typecheck.

## Task 11 — Team Analytics causes section

### 11a. New `src/modules/qa/analytics/TeamAnalyticsPage/Sentiment/CausesSection.tsx`

```tsx
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Badge,
	Group,
	Progress,
	Stack,
	Table,
	Text,
	ThemeIcon,
} from '@mantine/core';
import {
	IconMinus,
	IconTrendingDown,
	IconTrendingUp,
} from '@tabler/icons-react';
import { SENTIMENT_CAUSES_NS } from '~/modules/qa/sentimentCauses/constants';
import {
	callsWithCause,
	causeRanking,
	causeTrend,
	familyShare,
} from '~/modules/qa/sentimentCauses/helpers';
import { useTeamAnalyticsData } from '../TeamAnalyticsContext';
import { ChartCard, Pair, SERIES, ShareBar, TrendChart } from '../charts';
import styles from '../TeamAnalyticsPage.module.css';

/** Root causes of sentiment drops: ranking, business-vs-agent share and the top causes over time. */
export default function CausesSection() {
	const { t } = useTranslation(SENTIMENT_CAUSES_NS);
	const { t: tA } = useTranslation('qa.teamAnalytics');
	const { calls, previousCalls, filters, compare } = useTeamAnalyticsData();

	const ranking = useMemo(
		() => causeRanking(calls, previousCalls),
		[calls, previousCalls]
	);
	const families = useMemo(() => familyShare(calls), [calls]);
	const trend = useMemo(
		() => causeTrend(calls, filters.granularity),
		[calls, filters.granularity]
	);
	const withDrop = useMemo(() => callsWithCause(calls).length, [calls]);
	const na = tA('common.na');

	const rows = ranking.map((row) => {
		// Colour means exception: a cause that grew its share is the only one with a hue.
		const worsened = row.delta !== null && row.delta > 0;
		const TrendIcon =
			row.delta === null || row.delta === 0
				? IconMinus
				: row.delta > 0
					? IconTrendingUp
					: IconTrendingDown;
		return (
			<Table.Tr key={row.key}>
				<Table.Td>
					<Group gap='xs' wrap='nowrap'>
						<Text fw={500} size='sm'>
							{t(`causes.${row.key}`)}
						</Text>
						<Badge size='xs' variant='outline' color='gray' tt='none'>
							{t(`families.${row.family}`)}
						</Badge>
					</Group>
				</Table.Td>
				<Table.Td align='right'>
					<Text fw={700} size='sm'>
						{row.calls}
					</Text>
				</Table.Td>
				<Table.Td>
					<Group gap='xs' wrap='nowrap'>
						<Progress value={row.share} size='xs' color='gray' w={72} />
						<Text size='sm' c='dimmed'>
							{Math.round(row.share)}%
						</Text>
					</Group>
				</Table.Td>
				<Table.Td align='right'>
					<Text size='sm'>
						{row.meanDrop === null ? na : `−${row.meanDrop.toFixed(1)}`}
					</Text>
				</Table.Td>
				{compare && (
					<>
						<Table.Td align='right'>
							<Text c='dimmed' size='sm'>
								{row.previousCalls}
							</Text>
						</Table.Td>
						<Table.Td align='right' className={styles.trendColumn}>
							{row.delta === null ? (
								<Text c='dimmed' size='sm'>
									{na}
								</Text>
							) : (
								<Group gap={4} justify='flex-end' wrap='nowrap'>
									<Text fw={500} size='sm'>
										{row.delta > 0 ? '+' : ''}
										{row.delta.toFixed(1)} pp
									</Text>
									<ThemeIcon
										size='sm'
										variant='light'
										color={worsened ? 'danger' : 'gray'}
									>
										<TrendIcon size={14} />
									</ThemeIcon>
								</Group>
							)}
						</Table.Td>
					</>
				)}
			</Table.Tr>
		);
	});

	return (
		<>
			<Pair>
				<ChartCard
					title={t('analytics.rankingTitle')}
					description={t('analytics.rankingDescription')}
					empty={withDrop === 0}
				>
					<div className={styles.tableSurface}>
						<Table striped highlightOnHover verticalSpacing='sm' miw={560}>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>{t('analytics.columns.cause')}</Table.Th>
									<Table.Th align='right'>
										{t('analytics.columns.calls')}
									</Table.Th>
									<Table.Th>{t('analytics.columns.share')}</Table.Th>
									<Table.Th align='right'>
										{t('analytics.columns.meanDrop')}
									</Table.Th>
									{compare && (
										<>
											<Table.Th align='right'>
												{t('analytics.columns.previous')}
											</Table.Th>
											<Table.Th align='right'>
												{t('analytics.columns.delta')}
											</Table.Th>
										</>
									)}
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>{rows}</Table.Tbody>
						</Table>
					</div>
				</ChartCard>
				<ChartCard
					title={t('analytics.familyTitle')}
					description={t('analytics.familyDescription')}
					empty={withDrop === 0}
				>
					<Stack gap='md'>
						<ShareBar
							segments={families.map((row, i) => ({
								key: row.family,
								label: t(`families.${row.family}`),
								value: row.count,
								color: SERIES[i],
							}))}
						/>
						<Text size='sm' c='dimmed'>
							{t('analytics.dropSummary', {
								count: withDrop,
								total: calls.length,
							})}
						</Text>
					</Stack>
				</ChartCard>
			</Pair>
			<ChartCard
				title={t('analytics.trendTitle')}
				description={t('analytics.trendDescription')}
				empty={trend.topKeys.length === 0}
			>
				<TrendChart
					data={trend.points}
					metricId='SENTIMENT_DROP_CALL_COUNT'
					series={trend.topKeys.map((key, i) => ({
						name: key,
						label: t(`causes.${key}`),
						color: SERIES[i],
					}))}
				/>
			</ChartCard>
		</>
	);
}
```

Notes for the implementer:

- `styles.tableSurface` and `styles.trendColumn` exist in `TeamAnalyticsPage.module.css` (used by `SegmentationTable`).
- `SERIES` has six validated slots; the trend never draws more than four lines (`topN = 4`).
- `ShareBar` takes counts and computes the percentages itself.
- `'danger'` is the colour name the kit already uses for a change for the worse.

### 11b. Wire it into `Sentiment/SentimentView.tsx`

- Import: `import CausesSection from './CausesSection';`
- In the `MetricTileRow` add a sixth tile after `tile('SENTIMENT_RECOVERY_RATE')`:
  ```ts
  					tile('SENTIMENT_DROP_CALL_SHARE'),
  ```
- Render `<CausesSection />` right after the second `<Pair>` (emotion + heatmap) and before `<SegmentationView ... />`.

The existing `SegmentationView` at the bottom now offers `sentimentCause` in the group-by selector and `SENTIMENT_DROP_CALL_SHARE` / `_COUNT` in its metric select, which is the "breakdown by team / campaign / agent" the user asked for (group by team → sentiment-drop rate per team; group by sentiment cause → calls and customer sentiment per cause, drill to agent).

Typecheck.

## Task 12 — Verification (no dev server, no commit)

1. `npm run typecheck` passes with no new errors.
2. `npm run format:check` on the new/modified files (or `npx prettier --check <files>`); fix with `npm run format` limited to those files.
3. `npm run check:inline-styles` passes (no new inline styles were introduced; `w={72}` on `Progress` is a prop, not a style).
4. Grep checks:
   - `rg "sentimentCause" src/modules/qa/analytics/helpers.ts` shows the `filterCalls`, `ARRAY_KEYS`, `narrowFilters`, `segmentKeyOf` and `metricOf` hits.
   - `rg "applySentimentCauses" src/modules/qa/analytics/mockData.ts` shows exactly two call sites plus the import, none inside `buildAllCalls`.
   - `rg "qa.sentimentCauses" src/modules/qa/qaNamespaces.ts` shows four route ids.
5. Key parity: both `qa.sentimentCauses.json` files have the same keys; both `qa.teamAnalytics.json` files gained the same four keys.
6. Determinism sanity (scratch script in the scratchpad dir with its own Vite `cacheDir`, see memory "Vite SSR checks clobber the dev cache"; or skip if the user prefers): `ANALYTICS_CALLS.filter((c) => c.sentimentCause).length` is a meaningful minority of calls, and the two AGT-004 `SENTIMENT_DIP` calls have a non-null cause. Running the script twice gives identical counts.
7. Hand-off note for the user's own visual check (they run the app themselves): call detail at `/qa/campaigns/1/calls/call-001` → Sentiment & Emotion tab shows the new card with "Pricing & billing", drop −1.4 pts, evidence at 1:48, "Agent tone" secondary; Confirm / Change cause / Undo work; the agent preview role does not show the card. Team Analytics → Sentiment & Emotion shows the sixth tile, the ranking table, the business-vs-agent bar, the trend lines, `Sentiment drop cause` in Group by and `Sentiment drop causes` in the filter drawer. Dark and light mode both read correctly (only Mantine vars and kit colours were used).
