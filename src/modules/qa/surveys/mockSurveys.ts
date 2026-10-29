import type { TeamCallMetric } from '~/modules/qa/analytics/types';
import {
	causeWeights,
	hashId,
	pickWeighted,
	seeded,
} from '~/modules/qa/sentimentCauses/mockCauses';
import { COMMENT_SAMPLES, SURVEY_STRENGTHS } from './constants';
import type { SurveyThemeKey } from './types';

/** Share of effective contacts that answer the post-call survey. */
const RESPONSE_SHARE = 0.35;
/** Share of responses that also leave a comment. */
const COMMENT_SHARE = 0.6;

const clamp = (value: number, min: number, max: number) =>
	Math.min(max, Math.max(min, value));

/**
 * Gives some effective contacts a survey response, and null to the rest.
 * Keyed by call id with its own stream, so nothing seeded elsewhere moves and the result does
 * not depend on array order. The score follows the customer's sentiment and the QA score, so
 * the survey-to-QA correlation exists in the data. The theme of a comment is drawn after
 * everything else, so adding it left every count, type and score as it was: promoters get a
 * strength, everyone else a root cause weighted by the same call signals as a sentiment drop.
 * Run it after every sentiment mutation.
 */
export function applySurveys(calls: TeamCallMetric[]): TeamCallMetric[] {
	for (const call of calls) {
		call.survey = null;
		if (call.contactOutcome !== 'EFFECTIVE') continue;

		const rand = seeded(hashId(`survey:${call.id}`));
		rand(); // the LCG's first output is linear in the seed
		if (rand() >= RESPONSE_SHARE) continue;

		const isNps = rand() < 0.5;
		const qaNudge = call.qaScore >= 90 ? 1 : call.qaScore < 70 ? -1 : 0;
		const nps = clamp(
			Math.round(
				(call.customerSentiment - 1) * 2.5 + (rand() - 0.5) * 3 + qaNudge
			),
			0,
			10
		);
		const score = isNps ? nps : clamp(Math.round(nps / 2), 1, 5);
		const hasComment = rand() < COMMENT_SHARE;

		let verbatim: string | null = null;
		let theme: { key: SurveyThemeKey; highlight: string } | null = null;
		if (hasComment) {
			const praise = isNps ? score >= 9 : score >= 4;
			const key: SurveyThemeKey = praise
				? SURVEY_STRENGTHS[Math.floor(rand() * SURVEY_STRENGTHS.length)]
				: pickWeighted(causeWeights(call), rand);
			const samples = COMMENT_SAMPLES[key];
			const sample = samples[Math.floor(rand() * samples.length)];
			verbatim = sample.quote;
			theme = { key, highlight: sample.highlight };
		}

		call.survey = { type: isNps ? 'NPS' : 'CSAT', score, verbatim, theme };
	}
	return calls;
}
