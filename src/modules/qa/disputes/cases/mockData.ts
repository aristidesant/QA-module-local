import type {
	DisputeCase,
	DisputeEvaluationType,
	DisputeItemDecision,
} from '~/models/qa/disputeCases';
import { mockCallEvaluationDetail } from '~/views/Campaigns/constants';
import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
import { QA_MANAGER_PERSONA } from '~/modules/qa/team/constants';
import { applyCorrections, headlineScore } from './recalc';

const CAMPAIGNS: { id: string; name: string }[] = [
	{ id: 'camp-001', name: 'Q3 Customer Service' },
	{ id: 'camp-002', name: 'Sales Training' },
	{ id: 'camp-003', name: 'Q4 Compliance' },
	{ id: 'camp-004', name: 'Tech Support' },
];

/** Item ids of the mock call, resolved once so the seed always matches the data. */
const QA_ITEMS = mockCallEvaluationDetail.qa.aspects
	.flatMap((aspect) => aspect.items)
	.filter((item) => item.answer === 'no')
	.map((item) => item.id);
const COMPLIANCE_ITEMS = mockCallEvaluationDetail.compliance.areas
	.flatMap((area) => area.items)
	.filter((item) => item.status !== 'compliant')
	.map((item) => item.key);
const BUSINESS_ITEMS = mockCallEvaluationDetail.business.signals
	.filter((signal) => signal.detected)
	.map((signal) => signal.type);

/** Original headline score per aspect, straight from the evaluated call. */
const SCORE_BEFORE: Record<DisputeEvaluationType, number | null> = {
	qa: headlineScore(mockCallEvaluationDetail, 'qa'),
	compliance: headlineScore(mockCallEvaluationDetail, 'compliance'),
	'sentiment-emotion': headlineScore(
		mockCallEvaluationDetail,
		'sentiment-emotion'
	),
	'business-insights': null,
};

/** Score after the given decisions, so resolved seeds stay consistent. */
const scoreAfter = (
	type: DisputeEvaluationType,
	decisions: DisputeItemDecision[]
) =>
	headlineScore(
		applyCorrections(mockCallEvaluationDetail, type, decisions),
		type
	);

const correct = (
	itemId: string,
	value: string,
	note?: string
): DisputeItemDecision => ({ itemId, outcome: 'correct', value, note });
const keep = (itemId: string, note?: string): DisputeItemDecision => ({
	itemId,
	outcome: 'keep',
	note,
});

interface Seed {
	n: number;
	agentId: string;
	type: DisputeEvaluationType;
	status: DisputeCase['status'];
	createdAt: string;
	resolvedAt?: string;
	flagged?: string[];
	decisions?: DisputeItemDecision[];
	agentComment: string;
	managerComment?: string;
}

const SEEDS: Seed[] = [
	{
		n: 1,
		agentId: 'AGT-004',
		type: 'qa',
		status: 'open',
		createdAt: '2026-09-11T09:20:00Z',
		flagged: QA_ITEMS.slice(0, 2),
		agentComment:
			'I did ask discovery questions, they are at 1:12 in the recording, and the objection was resolved before the recap. I think the evaluator missed both moments.',
	},
	{
		n: 2,
		agentId: 'AGT-006',
		type: 'compliance',
		status: 'open',
		createdAt: '2026-09-10T16:05:00Z',
		flagged: COMPLIANCE_ITEMS.slice(0, 1),
		agentComment:
			'The transparency disclosure was given at the start of the call, before the offer. Please listen from 0:20.',
	},
	{
		n: 3,
		agentId: 'AGT-004',
		type: 'qa',
		status: 'accepted',
		createdAt: '2026-09-03T11:00:00Z',
		resolvedAt: '2026-09-05T13:45:00Z',
		flagged: QA_ITEMS.slice(0, 2),
		decisions: QA_ITEMS.slice(0, 2).map((id) => correct(id, 'yes')),
		agentComment:
			'Two items were marked as missed but both are clearly in the transcript.',
		managerComment:
			'You are right on both counts. Corrected and fed back to the evaluator.',
	},
	{
		n: 4,
		agentId: 'AGT-002',
		type: 'sentiment-emotion',
		status: 'rejected',
		createdAt: '2026-09-02T10:15:00Z',
		resolvedAt: '2026-09-04T09:00:00Z',
		agentComment:
			'The customer sounded calm to me, I do not think the call was negative.',
		managerComment:
			'The customer raised their voice twice and ended without a resolution. The reading stands.',
	},
	{
		n: 5,
		agentId: 'AGT-001',
		type: 'business-insights',
		status: 'open',
		createdAt: '2026-09-09T14:30:00Z',
		flagged: BUSINESS_ITEMS.slice(1, 2),
		agentComment:
			'The objection was handled — I answered it right after the customer raised it.',
	},
	{
		n: 6,
		agentId: 'AGT-011',
		type: 'compliance',
		status: 'accepted',
		createdAt: '2026-08-28T08:40:00Z',
		resolvedAt: '2026-08-30T15:10:00Z',
		flagged: COMPLIANCE_ITEMS,
		decisions: COMPLIANCE_ITEMS.map((id) =>
			correct(
				id,
				'compliant',
				'Consent wording matches the approved July script, read in full at 0:20.'
			)
		),
		agentComment:
			'The consent wording was read verbatim from the approved script.',
		managerComment: 'Confirmed against the script. Finding dismissed.',
	},
	{
		n: 7,
		agentId: 'AGT-015',
		type: 'qa',
		status: 'open',
		createdAt: '2026-09-08T12:00:00Z',
		agentComment:
			'I disagree with the overall score but I am not sure which item pulled it down. Could you review the whole evaluation?',
	},
	{
		n: 8,
		agentId: 'AGT-005',
		type: 'sentiment-emotion',
		status: 'accepted',
		createdAt: '2026-08-25T09:30:00Z',
		resolvedAt: '2026-08-27T11:20:00Z',
		flagged: ['customer-category'],
		decisions: [correct('customer-category', 'neutral')],
		agentComment:
			'The customer thanked me at the end — the negative reading does not match how the call closed.',
		managerComment: 'Agreed, the closing minute was misread. Set to neutral.',
	},
	{
		n: 9,
		agentId: 'AGT-009',
		type: 'qa',
		status: 'rejected',
		createdAt: '2026-08-22T15:45:00Z',
		resolvedAt: '2026-08-24T10:00:00Z',
		agentComment: 'I believe the score should be higher.',
		managerComment:
			'No specific item was contested and the evaluation matches the rubric.',
	},
	{
		n: 10,
		agentId: 'AGT-017',
		type: 'business-insights',
		status: 'accepted',
		createdAt: '2026-08-20T13:10:00Z',
		resolvedAt: '2026-08-21T16:30:00Z',
		flagged: BUSINESS_ITEMS.slice(2, 3),
		decisions: BUSINESS_ITEMS.slice(2, 3).map((id) =>
			correct(id, 'not-detected')
		),
		agentComment:
			'The customer mentioned a competitor but never tied it to price.',
		managerComment: 'Correct, the signal was over-detected.',
	},
	{
		n: 11,
		agentId: 'AGT-003',
		type: 'compliance',
		status: 'open',
		createdAt: '2026-09-12T08:10:00Z',
		agentComment:
			'I would like a second opinion on the transparency finding — the script I used is the one from July.',
	},
	{
		n: 12,
		agentId: 'AGT-007',
		type: 'qa',
		status: 'rejected',
		createdAt: '2026-08-18T11:25:00Z',
		resolvedAt: '2026-08-19T14:00:00Z',
		agentComment: 'The recap was done, just in different words.',
		managerComment:
			'The recap has to cover price and next steps; neither was stated.',
	},
	{
		n: 13,
		agentId: 'AGT-013',
		type: 'sentiment-emotion',
		status: 'open',
		createdAt: '2026-09-06T17:00:00Z',
		flagged: ['recovery'],
		agentComment:
			'The call did recover — the customer agreed to a callback and thanked me.',
	},
	{
		n: 14,
		agentId: 'AGT-020',
		type: 'qa',
		status: 'partially-accepted',
		createdAt: '2026-08-15T10:05:00Z',
		resolvedAt: '2026-08-16T12:40:00Z',
		flagged: QA_ITEMS,
		decisions: [
			...QA_ITEMS.slice(0, 2).map((id) => correct(id, 'yes')),
			...QA_ITEMS.slice(2).map((id) =>
				keep(id, 'The recap never stated the price; the original stands.')
			),
		],
		agentComment:
			'Three items were scored against me on a call where I followed the full flow.',
		managerComment:
			'Two of the three were misjudged and are corrected. The recap item stands — see the note.',
	},
	{
		n: 15,
		agentId: 'AGT-008',
		type: 'sentiment-emotion',
		status: 'open',
		createdAt: '2026-09-11T15:40:00Z',
		flagged: ['customer-emotion'],
		agentComment:
			'The customer was disappointed about the delay, not angry — the tone never escalated and we closed on good terms.',
	},
];

export const DISPUTE_CASES_SEED: DisputeCase[] = SEEDS.map((seed) => {
	const agent = TEAM_AGENTS.find((a) => a.id === seed.agentId);
	const campaign = CAMPAIGNS[(seed.n - 1) % CAMPAIGNS.length];
	const decisions = seed.decisions ?? [];
	const corrected =
		seed.status === 'accepted' || seed.status === 'partially-accepted';

	return {
		id: `DSP-${1000 + seed.n}`,
		callId: `CALL-${2030 + seed.n}`,
		campaignId: campaign.id,
		campaignName: campaign.name,
		agentId: seed.agentId,
		agentName: agent?.name ?? seed.agentId,
		supervisorId: agent?.supervisorId ?? 'SUP-001',
		supervisorName: agent?.supervisorName ?? 'Maria García',
		team: agent?.team ?? 'Team 1',
		evaluationType: seed.type,
		scoreBefore: SCORE_BEFORE[seed.type],
		scoreAfter: corrected ? scoreAfter(seed.type, decisions) : null,
		agentComment: seed.agentComment,
		flaggedItemIds: seed.flagged ?? [],
		status: seed.status,
		createdAt: seed.createdAt,
		resolvedAt: seed.resolvedAt ?? null,
		resolvedBy: seed.resolvedAt ? QA_MANAGER_PERSONA.name : null,
		managerComment: seed.managerComment ?? null,
		decisions,
	};
});
