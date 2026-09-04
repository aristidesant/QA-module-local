import type { Badge, BadgeListQueryParams, PaginatedResponse } from '~/models/qa';
import { qaHttpClient } from '~/api/qa/qaConfig';

export async function getBadges(params?: BadgeListQueryParams) {
	const response = await qaHttpClient.get<PaginatedResponse<Badge>>(
		'/badges',
		{ params }
	);
	return response.data;
}

export async function getAgentBadges(agentId: number, params?: Omit<BadgeListQueryParams, 'agentId'>) {
	const response = await qaHttpClient.get<PaginatedResponse<Badge>>(
		'/badges',
		{ params: { ...params, agentId } }
	);
	return response.data;
}
