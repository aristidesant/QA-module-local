import { TEAM_CALLS } from '~/modules/qa/analytics/mockData';
import { UNASSIGNED_SUPERVISOR_ID } from '../constants';
import {
	ALL_CAMPAIGNS,
	clientCampaignById,
	type ClientCampaign,
} from '../campaignCatalog';
import type { AgentProfile, RosterAgent, RosterSupervisor } from '../types';

export interface SupervisorAssignmentRow {
	id: string;
	supervisor: RosterSupervisor;
	campaigns: ClientCampaign[];
	/** Distinct agents across the supervisor's campaigns. */
	agentCount: number;
}

export interface CampaignAgentRow {
	agent: RosterAgent;
	calls: number;
	lastCallAt: string | null;
}

export const campaignById = clientCampaignById;

/** Agents whose ingested calls put them on this campaign, read from the live store and sorted by name. */
export const agentsOnCampaign = (
	profiles: Record<string, AgentProfile>,
	campaignId: string
): RosterAgent[] =>
	Object.values(profiles)
		.map((p) => p.agent)
		.filter((a) => a.campaignIds.includes(campaignId))
		.sort((a, b) => a.name.localeCompare(b.name));

/** Distinct agents across several campaigns. */
export const agentsOnCampaigns = (
	profiles: Record<string, AgentProfile>,
	campaignIds: string[]
): RosterAgent[] => {
	const seen = new Map<string, RosterAgent>();
	for (const id of campaignIds) {
		for (const agent of agentsOnCampaign(profiles, id))
			seen.set(agent.id, agent);
	}
	return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
};

/** One table row per agent with the calls the mock holds for them on this campaign. */
export const campaignAgentRows = (
	agents: RosterAgent[],
	campaignId: string
): CampaignAgentRow[] =>
	agents.map((agent) => {
		const calls = TEAM_CALLS.filter(
			(c) => c.campaignId === campaignId && c.agentId === agent.id
		);
		// TEAM_CALLS is ascending by date, so the last call is the latest.
		return {
			agent,
			calls: calls.length,
			lastCallAt: calls.length ? calls[calls.length - 1].date : null,
		};
	});

/** Supervisors other than `exceptId` that also have this campaign, sorted by name. */
export const otherSupervisorsWithCampaign = (
	teamCampaignIds: Record<string, string[]>,
	supervisors: Record<string, RosterSupervisor>,
	campaignId: string,
	exceptId?: string
): RosterSupervisor[] =>
	Object.entries(teamCampaignIds)
		.filter(
			([supervisorId, ids]) =>
				supervisorId !== exceptId &&
				supervisorId !== UNASSIGNED_SUPERVISOR_ID &&
				ids.includes(campaignId)
		)
		.map(([supervisorId]) => supervisors[supervisorId])
		.filter((s): s is RosterSupervisor => Boolean(s))
		.sort((a, b) => a.name.localeCompare(b.name));

/** Campaigns that no supervisor has yet. */
export const unassignedCampaigns = (
	teamCampaignIds: Record<string, string[]>
): ClientCampaign[] => {
	const assigned = new Set(Object.values(teamCampaignIds).flat());
	return ALL_CAMPAIGNS.filter((c) => !assigned.has(c.id));
};

/** One row per supervisor (the Unassigned pool is not a supervisor), sorted by name. */
export const supervisorAssignmentRows = (
	supervisors: Record<string, RosterSupervisor>,
	teamCampaignIds: Record<string, string[]>,
	profiles: Record<string, AgentProfile>
): SupervisorAssignmentRow[] =>
	Object.values(supervisors)
		.filter((s) => s.id !== UNASSIGNED_SUPERVISOR_ID)
		.map((supervisor) => {
			const ids = teamCampaignIds[supervisor.id] ?? [];
			return {
				id: supervisor.id,
				supervisor,
				campaigns: ids
					.map(campaignById)
					.filter((c): c is ClientCampaign => Boolean(c)),
				agentCount: agentsOnCampaigns(profiles, ids).length,
			};
		})
		.sort((a, b) => a.supervisor.name.localeCompare(b.supervisor.name));
