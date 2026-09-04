import { useQuery } from '@tanstack/react-query';

import { getAgentBadges, getBadges } from '~/api/qa/badgesApi';
import type { BadgeListQueryParams } from '~/models/qa';

export const badgesQueryKey = ['qa', 'badges'] as const;
export const badgesListQueryKey = (params?: BadgeListQueryParams) =>
	['qa', 'badges', 'list', params ?? {}] as const;
export const agentBadgesQueryKey = (agentId: number) =>
	['qa', 'badges', 'agent', agentId] as const;

export function useBadgesQuery(params?: BadgeListQueryParams) {
	return useQuery({
		queryKey: badgesListQueryKey(params),
		queryFn: () => getBadges(params),
		staleTime: 2 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
}

export function useAgentBadgesQuery(agentId: number) {
	return useQuery({
		enabled: Number.isFinite(agentId),
		queryKey: agentBadgesQueryKey(agentId),
		queryFn: () => getAgentBadges(agentId),
		staleTime: 2 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
}
