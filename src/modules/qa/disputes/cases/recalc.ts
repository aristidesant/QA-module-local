import type {
	DisputeEvaluationType,
	DisputeItemRef,
} from '~/models/qa/disputeCases';
import type {
	CallEvaluationDetail,
	ComplianceItemStatus,
	QAAspectResult,
} from '~/views/Campaigns/types';
import type { SentimentCategory } from '~/modules/qa/emotion-sentiment/types';
import {
	BUSINESS_SIGNALS,
	COMPLIANCE_AREAS,
	SENTIMENT_CATEGORY_ORDER,
} from '~/views/Campaigns/constants';

const round = (n: number) => Math.round(n);
const mean = (values: number[]) =>
	values.length === 0 ? 0 : values.reduce((s, v) => s + v, 0) / values.length;

/**
 * Sentiment runs 0-5 over five equal bands. The mock's category and score can
 * disagree (a "negative" call scored 2.6), so a correction lifts the score by a
 * full band and the category is re-derived from the new score — never the other
 * way round, which would let a correction lower the reading.
 */
const BAND = 1;
const categoryOfScore = (score: number): SentimentCategory =>
	SENTIMENT_CATEGORY_ORDER[
		Math.min(
			SENTIMENT_CATEGORY_ORDER.length - 1,
			Math.max(0, Math.floor(score / BAND))
		)
	];
const liftScore = (score: number) =>
	Math.round(Math.min(5, score + BAND) * 10) / 10;

const COMPLIANCE_STATUS_LABEL: Record<ComplianceItemStatus, string> = {
	compliant: 'Compliant',
	warning: 'Warning',
	violation: 'Violation',
};

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
						original: COMPLIANCE_STATUS_LABEL[item.status],
					}))
			);

		case 'sentiment-emotion':
			return [
				{
					id: 'customer-category',
					label: 'Customer sentiment category',
					group: 'Sentiment',
					original: call.sentiment.customer.overallCategory,
				},
				{
					id: 'agent-category',
					label: 'Agent sentiment category',
					group: 'Sentiment',
					original: call.sentiment.agent.overallCategory,
				},
				{
					id: 'recovery',
					label: 'Sentiment recovery',
					group: 'Sentiment',
					original: call.sentiment.recovery.recovered
						? 'Recovered'
						: 'Not recovered',
				},
			];

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
						original: 'Detected',
					})),
				...(call.business.outcome.converted
					? []
					: [
							{
								id: 'outcome-converted',
								label: 'Converted',
								group: 'Outcome',
								original: 'Not converted',
							},
						]),
			];

		default:
			return [];
	}
}

/** Recomputes the QA aspect totals, error types and overall score after corrections. */
function recalcQa(
	call: CallEvaluationDetail,
	itemIds: Set<string>
): CallEvaluationDetail {
	const aspects: QAAspectResult[] = call.qa.aspects.map((aspect) => {
		const items = aspect.items.map((item) =>
			itemIds.has(item.id)
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

function recalcCompliance(
	call: CallEvaluationDetail,
	itemIds: Set<string>
): CallEvaluationDetail {
	const areas = call.compliance.areas.map((area) => {
		const items = area.items.map((item) =>
			itemIds.has(item.key)
				? {
						...item,
						status: 'compliant' as const,
						score: 100,
						note: undefined,
					}
				: item
		);
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

function recalcSentiment(
	call: CallEvaluationDetail,
	itemIds: Set<string>
): CallEvaluationDetail {
	const sentiment = { ...call.sentiment };

	if (itemIds.has('customer-category')) {
		const overallScore = liftScore(sentiment.customer.overallScore);
		sentiment.customer = {
			...sentiment.customer,
			overallScore,
			overallCategory: categoryOfScore(overallScore),
		};
	}
	if (itemIds.has('agent-category')) {
		const overallScore = liftScore(sentiment.agent.overallScore);
		sentiment.agent = {
			...sentiment.agent,
			overallScore,
			overallCategory: categoryOfScore(overallScore),
		};
	}
	if (itemIds.has('recovery')) {
		sentiment.recovery = {
			...sentiment.recovery,
			recovered: true,
			endCategory:
				sentiment.recovery.endScore < 3.5
					? 'positive'
					: sentiment.recovery.endCategory,
			endScore: Math.max(sentiment.recovery.endScore, 3.5),
		};
	}

	return { ...call, sentiment };
}

function recalcBusiness(
	call: CallEvaluationDetail,
	itemIds: Set<string>
): CallEvaluationDetail {
	const signals = call.business.signals.map((signal) =>
		itemIds.has(signal.type)
			? { ...signal, detected: false, evidence: undefined }
			: signal
	);
	const outcome = itemIds.has('outcome-converted')
		? {
				...call.business.outcome,
				converted: true,
				nonConversionReason: undefined,
			}
		: call.business.outcome;

	return { ...call, business: { ...call.business, signals, outcome } };
}

/**
 * Returns a copy of the call with the ticked items scored as correct. Never
 * mutates the source, so the original evaluation stays available side by side.
 */
export function applyCorrections(
	call: CallEvaluationDetail,
	type: DisputeEvaluationType,
	itemIds: string[]
): CallEvaluationDetail {
	if (itemIds.length === 0) return call;
	const ids = new Set(itemIds);

	switch (type) {
		case 'qa':
			return recalcQa(call, ids);
		case 'compliance':
			return recalcCompliance(call, ids);
		case 'sentiment-emotion':
			return recalcSentiment(call, ids);
		case 'business-insights':
			return recalcBusiness(call, ids);
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
