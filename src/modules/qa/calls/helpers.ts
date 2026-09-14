import { TEAM_CALLS } from '~/modules/qa/analytics/mockData';
import type { TeamCallMetric } from '~/modules/qa/analytics/types';
import { TEAM_AGENTS, TEAM_CAMPAIGNS } from '~/modules/qa/team/mockData';
import { SUPERVISOR_PERSONA } from '~/modules/qa/team/constants';
import { teamBasePath } from '~/modules/qa/team/helpers';
import type { RosterAgent } from '~/modules/qa/team/types';
import type { PreviewRole } from '~/constants/previewRole';
import {
	CAMPAIGN_ROSTER_MAP,
	QA_FORM_BY_CAMPAIGN_TYPE,
	ROSTER_TO_MOCK_CAMPAIGN,
} from './constants';
import type { AgentCallRow, CampaignCallRow, CampaignRosterRow } from './types';

export const rosterCampaignIdFor = (
	mockCampaignId: string | undefined
): string => CAMPAIGN_ROSTER_MAP[mockCampaignId ?? ''] ?? 'camp-001';

/** The call-detail page always renders mockCallEvaluationDetail, so any callId works; keep the TEAM_CALLS id. */
const criticalErrors = (c: TeamCallMetric) =>
	c.qaScores.ecn + c.qaScores.ecc + c.qaScores.ecuf;

/** The agent's own calls, newest first. */
export const buildAgentCalls = (agentId: string): AgentCallRow[] =>
	TEAM_CALLS.filter((c) => c.agentId === agentId)
		.map((c) => ({
			id: c.id,
			callId: c.id,
			mockCampaignId: ROSTER_TO_MOCK_CAMPAIGN[c.campaignId] ?? '1',
			campaignName: c.campaignName,
			date: c.date,
			durationSeconds: c.handleTimeSeconds,
			autoFail: c.autoFail,
			autoFailCount: c.autoFail ? criticalErrors(c) : 0,
			qaScore: c.qaScore,
		}))
		.sort((a, b) => b.date.localeCompare(a.date));

/** Agents participating in a roster campaign, scoped by preview role (supervisor → own team only). */
export const campaignRosterAgents = (
	rosterCampaignId: string,
	previewRole: PreviewRole | null
): RosterAgent[] =>
	TEAM_AGENTS.filter(
		(a) =>
			a.campaignIds.includes(rosterCampaignId) &&
			(previewRole !== 'supervisor' || a.supervisorId === SUPERVISOR_PERSONA.id)
	);

/** Conversations rows for a campaign (all agents of the campaign, newest first). Dispute flags are deterministic mock. */
export const buildCampaignCalls = (
	mockCampaignId: string | undefined
): CampaignCallRow[] => {
	const rosterId = rosterCampaignIdFor(mockCampaignId);
	const campaign = TEAM_CAMPAIGNS.find((c) => c.id === rosterId);
	const qaForm = campaign
		? QA_FORM_BY_CAMPAIGN_TYPE[campaign.campaignType]
		: QA_FORM_BY_CAMPAIGN_TYPE.INBOUND;
	return TEAM_CALLS.filter((c) => c.campaignId === rosterId)
		.map((c, i) => ({
			id: c.id,
			filename: `${c.id.toLowerCase()}_${c.date.slice(0, 10)}.mp3`,
			agentId: c.agentId,
			agentName: c.agentName,
			date: c.date.slice(0, 10),
			score: c.qaScore,
			status: (i % 9 === 8
				? 'pending'
				: 'completed') as CampaignCallRow['status'],
			isAutoFailed: c.autoFail,
			isDisputed: c.qaScore < 60 && i % 4 === 0,
			qaForm,
			qaFormPassed: c.qaScore >= 70,
			disputeRequested: c.qaScore < 65 && i % 3 === 0,
		}))
		.sort((a, b) => b.date.localeCompare(a.date));
};

export const buildCampaignRoster = (
	mockCampaignId: string | undefined,
	previewRole: PreviewRole | null
): CampaignRosterRow[] => {
	const rosterId = rosterCampaignIdFor(mockCampaignId);
	return campaignRosterAgents(rosterId, previewRole).map((agent) => {
		const calls = TEAM_CALLS.filter(
			(c) => c.campaignId === rosterId && c.agentId === agent.id
		);
		const averageQa = calls.length
			? Math.round(calls.reduce((s, c) => s + c.qaScore, 0) / calls.length)
			: 0;
		const lastCallAt = calls.length ? calls[calls.length - 1].date : null; // TEAM_CALLS is ascending by date
		return {
			agent,
			calls: calls.length,
			averageQa,
			autoFails: calls.filter((c) => c.autoFail).length,
			lastCallAt,
		};
	});
};

/** Where a roster row navigates: the role's own agent-profile route. */
export const agentProfilePathFor = (
	previewRole: PreviewRole | null,
	agentId: string
) =>
	`${teamBasePath(previewRole === 'supervisor' ? 'supervisor' : 'qa-manager')}/${agentId}`;
