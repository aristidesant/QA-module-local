import type { CallEmotion } from '~/modules/qa/analytics/types';
import type { RosterAgent } from '~/modules/qa/team/types';
import type { CallIssueKey } from './issues';

/** The evaluation aspect a My Calls score-range filter can target — each has its own scale. */
export type MyCallsEvaluationType = 'qa' | 'sentiment' | 'compliance';

/**
 * One of the agent's own calls (My Calls page). Scores are kept only to back
 * the score-range filter — the table never renders a score column. `issues`
 * is what the list is filtered on: My Calls only lists calls with ≥ 1 issue.
 */
export interface AgentCallRow {
	id: string; // TeamCallMetric.id
	callId: string; // id used in /qa/campaigns/:campaignId/calls/:callId
	mockCampaignId: string; // '1'..'5' — the id the Campaigns routes expect
	campaignName: string;
	date: string; // ISO
	durationSeconds: number;
	autoFail: boolean;
	autoFailCount: number; // critical errors behind the auto-fail (0 when !autoFail)
	qaScore: number; // 0-100, filter-only
	sentimentScore: number; // 1-5 (customer sentiment), filter-only
	complianceScore: number; // 0-100 (average of security/regulatory/legal), filter-only
	customerEmotion: CallEmotion;
	agentEmotion: CallEmotion;
	issues: CallIssueKey[];
}

/** Row of the campaign Conversations table — same shape CampaignDetail already filters on. */
export interface CampaignCallRow {
	id: string;
	filename: string;
	agentId: string;
	agentName: string;
	date: string; // 'YYYY-MM-DD'
	score: number;
	status: 'completed' | 'pending';
	isAutoFailed: boolean;
	isDisputed: boolean;
	qaForm: string;
	qaFormPassed: boolean;
	disputeRequested: boolean;
}

export interface CampaignRosterRow {
	agent: RosterAgent;
	calls: number;
	averageQa: number; // 0-100, 0 when no calls
	autoFails: number;
	lastCallAt: string | null; // ISO
}
