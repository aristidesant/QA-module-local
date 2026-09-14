import type { RosterAgent } from '~/modules/qa/team/types';

/** The evaluation aspect a My Calls score-range filter can target — each has its own scale. */
export type MyCallsEvaluationType = 'qa' | 'sentiment' | 'compliance';

/**
 * One of the agent's own calls (My Calls page). The score fields are kept
 * only to back the score-range filter — the table itself never renders a
 * score column.
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
	qaScore: number; // 0-100, filter-only — not displayed
	sentimentScore: number; // 1-5 (customer sentiment), filter-only — not displayed
	complianceScore: number; // 0-100 (average of security/regulatory/legal), filter-only — not displayed
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
