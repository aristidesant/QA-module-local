import type {
	DisputeEvaluationType,
	DisputeItemDecision,
	DisputeItemRef,
} from '~/models/qa/disputeCases';
import type {
	CallEvaluationDetail,
	ComplianceItemStatus,
	QAAspectResult,
	SpeakerSentiment,
} from '~/views/Campaigns/types';
import type {
	Emotion,
	SentimentCategory,
} from '~/modules/qa/emotion-sentiment/types';
import { EMOTION_SENTIMENT_MAP } from '~/modules/qa/emotion-sentiment/types';
import {
	BUSINESS_SIGNALS,
	COMPLIANCE_AREAS,
	EMOTION_LABELS,
	SENTIMENT_CATEGORIES,
	SENTIMENT_CATEGORY_ORDER,
} from '~/views/Campaigns/constants';
import {
	CATEGORY_MIDPOINT,
	COMPLIANCE_WARNING_SCORE,
	DEFAULT_EMOTION_BY_CATEGORY,
} from './constants';

const round = (n: number) => Math.round(n);
const mean = (values: number[]) =>
	values.length === 0 ? 0 : values.reduce((s, v) => s + v, 0) / values.length;

const COMPLIANCE_STATUS_LABEL: Record<ComplianceItemStatus, string> = {
	compliant: 'Compliant',
	warning: 'Warning',
	violation: 'Violation',
};

const isCategory = (value: string): value is SentimentCategory =>
	(SENTIMENT_CATEGORY_ORDER as string[]).includes(value);
const isEmotion = (value: string): value is Emotion =>
	value in EMOTION_SENTIMENT_MAP;

/** Every sub-item the agent can contest for one evaluation type. */
export function listDisputableItems(
	call: CallEvaluationDetail,
	type: DisputeEvaluationType
): DisputeItemRef[] {
	switch (type) {
		case 'qa':
			return call.qa.aspects.flatMap((aspect) =>
				aspect.items
					.filter((item) => item.answer === 'no')
					.map((item) => ({
						id: item.id,
						label: item.name,
						group: aspect.name,
						kind: 'binary' as const,
						value: 'no',
						original: `No · 0/${item.valuation}`,
					}))
			);

		case 'compliance':
			return call.compliance.areas.flatMap((area) =>
				area.items
					.filter((item) => item.status !== 'compliant')
					.map((item) => ({
						id: item.key,
						label: item.label,
						group: COMPLIANCE_AREAS[area.key].label,
						kind: 'compliance' as const,
						value: item.status,
						original: COMPLIANCE_STATUS_LABEL[item.status],
						analysis: {
							note: item.note,
							evidenceTimestamp: item.evidence?.timestamp,
							evidenceQuote: item.evidence?.quote,
						},
					}))
			);

		case 'sentiment-emotion': {
			const { customer, agent, recovery } = call.sentiment;
			return [
				{
					id: 'customer-category',
					label: 'Customer sentiment',
					group: 'Customer',
					kind: 'sentiment-category' as const,
					value: customer.overallCategory,
					original: SENTIMENT_CATEGORIES[customer.overallCategory].label,
				},
				{
					id: 'customer-emotion',
					label: 'Customer dominant emotion',
					group: 'Customer',
					kind: 'emotion' as const,
					value: customer.dominantEmotion,
					original: EMOTION_LABELS[customer.dominantEmotion],
				},
				{
					id: 'agent-category',
					label: 'Agent sentiment',
					group: 'Agent',
					kind: 'sentiment-category' as const,
					value: agent.overallCategory,
					original: SENTIMENT_CATEGORIES[agent.overallCategory].label,
				},
				{
					id: 'agent-emotion',
					label: 'Agent dominant emotion',
					group: 'Agent',
					kind: 'emotion' as const,
					value: agent.dominantEmotion,
					original: EMOTION_LABELS[agent.dominantEmotion],
				},
				{
					id: 'recovery',
					label: 'Sentiment recovery',
					group: 'Recovery',
					kind: 'recovery' as const,
					value: recovery.recovered ? 'recovered' : 'not-recovered',
					original: recovery.recovered ? 'Recovered' : 'Not recovered',
				},
			];
		}

		case 'business-insights':
			return [
				...call.business.signals
					.filter(
						(signal) => signal.detected && signal.type !== 'BEST_TIME_FRAME'
					)
					.map((signal) => ({
						id: signal.type,
						label: BUSINESS_SIGNALS[signal.type].label,
						group: 'Signals',
						kind: 'binary' as const,
						value: 'detected',
						original: 'Detected',
					})),
				...(call.business.outcome.converted
					? []
					: [
							{
								id: 'outcome-converted',
								label: 'Converted',
								group: 'Outcome',
								kind: 'binary' as const,
								value: 'not-converted',
								original: 'Not converted',
							},
						]),
			];

		default:
			return [];
	}
}

type Corrections = Map<string, DisputeItemDecision>;

/** Recomputes the QA aspect totals, error types and overall score after corrections. */
function recalcQa(
	call: CallEvaluationDetail,
	corrections: Corrections
): CallEvaluationDetail {
	const aspects: QAAspectResult[] = call.qa.aspects.map((aspect) => {
		const items = aspect.items.map((item) =>
			corrections.has(item.id)
				? { ...item, answer: 'yes' as const, awarded: item.valuation }
				: item
		);
		return {
			...aspect,
			items,
			score: items.reduce((sum, item) => sum + item.awarded, 0),
		};
	});

	const allItems = aspects.flatMap((aspect) => aspect.items);
	const awarded = allItems.reduce((sum, item) => sum + item.awarded, 0);
	const possible = allItems.reduce((sum, item) => sum + item.valuation, 0);
	const overallScore = possible === 0 ? 0 : round((awarded / possible) * 100);

	const errorTypes = call.qa.errorTypes.map((errorType) => {
		const ofType = allItems.filter((item) => item.errorType === errorType.code);
		const errorsFound = ofType.filter((item) => item.answer === 'no').length;
		const itemsEvaluated = ofType.length || errorType.itemsEvaluated;
		const score =
			itemsEvaluated === 0
				? 100
				: round(100 * (1 - errorsFound / itemsEvaluated));
		return {
			...errorType,
			errorsFound,
			itemsEvaluated,
			score,
			status:
				score >= 90
					? ('good' as const)
					: score >= 70
						? ('warning' as const)
						: ('critical' as const),
		};
	});

	const autoFailCount = allItems.filter(
		(item) =>
			item.answer === 'no' &&
			(item.errorType === 'ECC' || item.errorType === 'ECUF')
	).length;

	return {
		...call,
		qa: {
			...call.qa,
			aspects,
			errorTypes,
			overallScore,
			autoFailCount,
			passed: overallScore >= call.qa.passThreshold,
		},
	};
}

/**
 * A finding can be dismissed (compliant, 100) or downgraded to a warning, which
 * keeps the note and evidence so the audit trail survives the correction.
 */
function recalcCompliance(
	call: CallEvaluationDetail,
	corrections: Corrections
): CallEvaluationDetail {
	const areas = call.compliance.areas.map((area) => {
		const items = area.items.map((item) => {
			const decision = corrections.get(item.key);
			if (!decision) return item;
			const status: ComplianceItemStatus =
				decision.value === 'warning' || decision.value === 'compliant'
					? decision.value
					: item.status;
			const edits = decision.edits;
			const evidence = edits?.evidenceQuote
				? {
						timestamp:
							edits.evidenceTimestamp ?? item.evidence?.timestamp ?? '0:00',
						speaker: item.evidence?.speaker ?? ('agent' as const),
						quote: edits.evidenceQuote,
					}
				: item.evidence;
			return {
				...item,
				status,
				score:
					status === item.status
						? item.score
						: status === 'warning'
							? COMPLIANCE_WARNING_SCORE
							: 100,
				note: edits?.note ?? (status === 'compliant' ? undefined : item.note),
				evidence,
			};
		});
		return { ...area, items, score: round(mean(items.map((i) => i.score))) };
	});

	const allItems = areas.flatMap((area) => area.items);
	const violationCount = allItems.filter(
		(item) => item.status === 'violation'
	).length;
	const warningCount = allItems.filter(
		(item) => item.status === 'warning'
	).length;

	return {
		...call,
		compliance: {
			...call.compliance,
			areas,
			overallScore: round(mean(areas.map((area) => area.score))),
			violationCount,
			warningCount,
			status:
				violationCount > 0
					? 'violation'
					: warningCount > 0
						? 'warning'
						: 'compliant',
		},
	};
}

/** The chosen category becomes the largest share (at least half); the others scale down to fill 100. */
function rebalanceShares(
	shares: Record<SentimentCategory, number>,
	category: SentimentCategory
): Record<SentimentCategory, number> {
	const target = Math.max(shares[category], 50);
	const othersTotal = SENTIMENT_CATEGORY_ORDER.filter(
		(k) => k !== category
	).reduce((sum, k) => sum + shares[k], 0);
	const scale = othersTotal === 0 ? 0 : (100 - target) / othersTotal;
	const next = { ...shares };
	SENTIMENT_CATEGORY_ORDER.forEach((k) => {
		if (k !== category) next[k] = round(shares[k] * scale);
	});
	next[category] =
		100 -
		SENTIMENT_CATEGORY_ORDER.filter((k) => k !== category).reduce(
			(sum, k) => sum + next[k],
			0
		);
	return next;
}

/** Sets the category the QA Manager chose and keeps score, shares and dominant emotion consistent with it. */
function setSpeakerCategory(
	speaker: SpeakerSentiment,
	category: SentimentCategory
): SpeakerSentiment {
	const dominantEmotion =
		EMOTION_SENTIMENT_MAP[speaker.dominantEmotion] === category
			? speaker.dominantEmotion
			: ([...speaker.emotions]
					.sort((a, b) => b.percentage - a.percentage)
					.find((e) => EMOTION_SENTIMENT_MAP[e.emotion] === category)
					?.emotion ?? DEFAULT_EMOTION_BY_CATEGORY[category]);
	return {
		...speaker,
		overallCategory: category,
		overallScore: CATEGORY_MIDPOINT[category],
		dominantEmotion,
		categories: rebalanceShares(speaker.categories, category),
	};
}

/** Sets the dominant emotion; the category follows when the emotion belongs to another one. */
function setSpeakerEmotion(
	speaker: SpeakerSentiment,
	emotion: Emotion
): SpeakerSentiment {
	const top = Math.max(0, ...speaker.emotions.map((e) => e.percentage));
	const current = speaker.emotions.find((e) => e.emotion === emotion);
	const emotions = [
		{ emotion, percentage: Math.max(current?.percentage ?? 0, top) },
		...speaker.emotions.filter((e) => e.emotion !== emotion),
	];
	const next = { ...speaker, dominantEmotion: emotion, emotions };
	const category = EMOTION_SENTIMENT_MAP[emotion];
	return category === speaker.overallCategory
		? next
		: setSpeakerCategory(next, category);
}

function recalcSentiment(
	call: CallEvaluationDetail,
	corrections: Corrections
): CallEvaluationDetail {
	const sentiment = { ...call.sentiment };

	// Emotion first, then the explicit category wins when both were set.
	(['customer', 'agent'] as const).forEach((speaker) => {
		const emotion = corrections.get(`${speaker}-emotion`)?.value;
		if (emotion && isEmotion(emotion)) {
			sentiment[speaker] = setSpeakerEmotion(sentiment[speaker], emotion);
		}
		const category = corrections.get(`${speaker}-category`)?.value;
		if (category && isCategory(category)) {
			sentiment[speaker] = setSpeakerCategory(sentiment[speaker], category);
		}
	});

	const recovery = corrections.get('recovery')?.value;
	if (recovery === 'recovered') {
		sentiment.recovery = {
			...sentiment.recovery,
			recovered: true,
			endCategory:
				sentiment.recovery.endScore < 3.5
					? 'positive'
					: sentiment.recovery.endCategory,
			endScore: Math.max(sentiment.recovery.endScore, 3.5),
		};
	} else if (recovery === 'not-recovered') {
		sentiment.recovery = { ...sentiment.recovery, recovered: false };
	}

	return { ...call, sentiment };
}

function recalcBusiness(
	call: CallEvaluationDetail,
	corrections: Corrections
): CallEvaluationDetail {
	const signals = call.business.signals.map((signal) =>
		corrections.has(signal.type)
			? { ...signal, detected: false, evidence: undefined }
			: signal
	);
	const outcome = corrections.has('outcome-converted')
		? {
				...call.business.outcome,
				converted: true,
				nonConversionReason: undefined,
			}
		: call.business.outcome;

	return { ...call, business: { ...call.business, signals, outcome } };
}

/**
 * Returns a copy of the call with the corrected decisions applied ("keep"
 * decisions change nothing). Never mutates the source, so the original
 * evaluation stays available side by side.
 */
export function applyCorrections(
	call: CallEvaluationDetail,
	type: DisputeEvaluationType,
	decisions: DisputeItemDecision[]
): CallEvaluationDetail {
	const corrections: Corrections = new Map(
		decisions
			.filter((decision) => decision.outcome === 'correct')
			.map((decision) => [decision.itemId, decision])
	);
	if (corrections.size === 0) return call;

	switch (type) {
		case 'qa':
			return recalcQa(call, corrections);
		case 'compliance':
			return recalcCompliance(call, corrections);
		case 'sentiment-emotion':
			return recalcSentiment(call, corrections);
		case 'business-insights':
			return recalcBusiness(call, corrections);
		default:
			return call;
	}
}

/** The single number that represents the disputed aspect. Business Insights has none. */
export function headlineScore(
	call: CallEvaluationDetail,
	type: DisputeEvaluationType
): number | null {
	switch (type) {
		case 'qa':
			return call.qa.overallScore;
		case 'compliance':
			return call.compliance.overallScore;
		case 'sentiment-emotion':
			return call.sentiment.customer.overallScore;
		default:
			return null;
	}
}

/** Business Insights is judged by how many signals were detected, not by a score. */
export const detectedSignalCount = (call: CallEvaluationDetail): number =>
	call.business.signals.filter((signal) => signal.detected).length;

/** Compliance is also judged by its findings, which a downgrade changes without moving the score much. */
export const complianceCounts = (call: CallEvaluationDetail) => ({
	violations: call.compliance.violationCount,
	warnings: call.compliance.warningCount,
});
