import type { Agent } from '~/models/qa';

export const AUTO_MIGRATED_AGENT_ID = '__placeholder__';

export function isAutoMigratedAgent(agent: Pick<Agent, 'employeeId'>) {
	return agent.employeeId === AUTO_MIGRATED_AGENT_ID;
}

export function getAgentDisplayName(
	agent: Pick<Agent, 'employeeId' | 'firstName' | 'lastName'>
) {
	const name = [agent.firstName, agent.lastName]
		.filter(Boolean)
		.join(' ')
		.trim();

	return name || agent.employeeId;
}

export function getAgentSelectLabel(
	agent: Pick<Agent, 'employeeId' | 'firstName' | 'lastName'>
) {
	const name = getAgentDisplayName(agent);

	return name === agent.employeeId ? name : `${name} · ${agent.employeeId}`;
}
