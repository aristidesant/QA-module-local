import { qaHttpClient } from '~/api/qa/qaConfig';

interface AgentProfileWithStats {
	id: number;
	name: string;
	role: string;
	qaScore: number;
	sentiment: number;
	compliance: number;
}

interface CustomerProfile {
	id: string;
	name: string;
	nps: number;
	sentiment: string;
}

export async function getAgentProfile(agentId: number) {
	const response = await qaHttpClient.get<AgentProfileWithStats>(
		`/profiles/agents/${agentId}`
	);
	return response.data;
}

export async function getAgentProfileStats(agentId: number, days: number = 30) {
	const response = await qaHttpClient.get<AgentProfileWithStats>(
		`/profiles/agents/${agentId}/stats`,
		{ params: { days } }
	);
	return response.data;
}

export async function getCustomerProfile(customerId: string) {
	const response = await qaHttpClient.get<CustomerProfile>(
		`/profiles/customers/${customerId}`
	);
	return response.data;
}
