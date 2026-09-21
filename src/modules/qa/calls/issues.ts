import type { CallEmotion, TeamCallMetric } from '~/modules/qa/analytics/types';

/** Evaluation aspect an issue belongs to — drives filter grouping and badge colours. */
export type CallIssueAspect = 'qa' | 'compliance' | 'sentiment';
export const CALL_ISSUE_ASPECTS: CallIssueAspect[] = [
	'qa',
	'compliance',
	'sentiment',
];

export type CallIssueKey =
	| 'auto-fail'
	| 'qa-ecn'
	| 'qa-enc'
	| 'qa-ecc'
	| 'qa-ecuf'
	| 'low-qa-score'
	| 'compliance-security'
	| 'compliance-regulatory'
	| 'compliance-legal'
	| 'negative-customer-emotion'
	| 'negative-agent-emotion'
	| 'low-customer-sentiment'
	| 'low-agent-sentiment';

/** Thresholds shared by the dashboard cards and the My Calls list so both agree on what an incident is. */
export const LOW_QA_SCORE = 70; // qaScore below this is an incident
export const COMPLIANCE_TARGET = 85; // an area score below this fails the area on that call
export const LOW_SENTIMENT = 2.5; // 1-5 scale
export const NEGATIVE_EMOTIONS: CallEmotion[] = [
	'Anger',
	'Fear',
	'Sadness',
	'Disgust',
];

export const isNegativeEmotion = (emotion: CallEmotion) =>
	NEGATIVE_EMOTIONS.includes(emotion);

export interface CallIssueMeta {
	key: CallIssueKey;
	aspect: CallIssueAspect;
	/** Mantine colour for the badge */
	color: string;
	test: (call: TeamCallMetric) => boolean;
}

/** Display order = filter order. Labels: qa.calls `issues.<key>`. */
export const CALL_ISSUES: CallIssueMeta[] = [
	{ key: 'auto-fail', aspect: 'qa', color: 'red', test: (c) => c.autoFail },
	{
		key: 'qa-ecn',
		aspect: 'qa',
		color: 'red',
		test: (c) => c.qaScores.ecn > 0,
	},
	{
		key: 'qa-enc',
		aspect: 'qa',
		color: 'orange',
		test: (c) => c.qaScores.enc > 0,
	},
	{
		key: 'qa-ecc',
		aspect: 'qa',
		color: 'grape',
		test: (c) => c.qaScores.ecc > 0,
	},
	{
		key: 'qa-ecuf',
		aspect: 'qa',
		color: 'yellow',
		test: (c) => c.qaScores.ecuf > 0,
	},
	{
		key: 'low-qa-score',
		aspect: 'qa',
		color: 'orange',
		test: (c) => c.qaScore < LOW_QA_SCORE,
	},
	{
		key: 'compliance-security',
		aspect: 'compliance',
		color: 'blue',
		test: (c) => c.complianceByArea.security.score < COMPLIANCE_TARGET,
	},
	{
		key: 'compliance-regulatory',
		aspect: 'compliance',
		color: 'orange',
		test: (c) => c.complianceByArea.regulatory.score < COMPLIANCE_TARGET,
	},
	{
		key: 'compliance-legal',
		aspect: 'compliance',
		color: 'red',
		test: (c) => c.complianceByArea.legal.score < COMPLIANCE_TARGET,
	},
	{
		key: 'negative-customer-emotion',
		aspect: 'sentiment',
		color: 'violet',
		test: (c) => isNegativeEmotion(c.predominantEmotion),
	},
	{
		key: 'negative-agent-emotion',
		aspect: 'sentiment',
		color: 'violet',
		test: (c) => isNegativeEmotion(c.agentEmotion),
	},
	{
		key: 'low-customer-sentiment',
		aspect: 'sentiment',
		color: 'pink',
		test: (c) => c.customerSentiment < LOW_SENTIMENT,
	},
	{
		key: 'low-agent-sentiment',
		aspect: 'sentiment',
		color: 'pink',
		test: (c) => c.agentSentiment < LOW_SENTIMENT,
	},
];

export const CALL_ISSUE_BY_KEY: Record<CallIssueKey, CallIssueMeta> =
	Object.fromEntries(CALL_ISSUES.map((issue) => [issue.key, issue])) as Record<
		CallIssueKey,
		CallIssueMeta
	>;

export const isCallIssueKey = (value: string): value is CallIssueKey =>
	value in CALL_ISSUE_BY_KEY;

/** Every incident detected on a call, in display order. Empty for a clean call. */
export const callIssues = (call: TeamCallMetric): CallIssueKey[] =>
	CALL_ISSUES.filter((issue) => issue.test(call)).map((issue) => issue.key);

/** `?issue=a,b` ↔ CallIssueKey[] (unknown keys dropped). */
export const parseIssueParam = (value: string | null): CallIssueKey[] =>
	(value ?? '')
		.split(',')
		.map((v) => v.trim())
		.filter(isCallIssueKey);
