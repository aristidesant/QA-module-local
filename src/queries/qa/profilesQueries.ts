import { useQuery } from '@tanstack/react-query';

import {
	getAgentProfile,
	getAgentProfileStats,
	getCustomerProfile,
} from '~/api/qa/profilesApi';

export const agentProfileQueryKey = (agentId: number) =>
	['qa', 'profiles', 'agent', agentId] as const;
export const agentProfileStatsQueryKey = (agentId: number, days: number) =>
	['qa', 'profiles', 'agent', agentId, 'stats', days] as const;
export const customerProfileQueryKey = (customerId: string) =>
	['qa', 'profiles', 'customer', customerId] as const;

export function useAgentProfileQuery(agentId: number) {
	return useQuery({
		enabled: Number.isFinite(agentId),
		queryKey: agentProfileQueryKey(agentId),
		queryFn: () => getAgentProfile(agentId),
		staleTime: 3 * 60 * 1000,
		gcTime: 15 * 60 * 1000,
	});
}

export function useAgentProfileStatsQuery(agentId: number, days: number = 30) {
	return useQuery({
		enabled: Number.isFinite(agentId),
		queryKey: agentProfileStatsQueryKey(agentId, days),
		queryFn: () => getAgentProfileStats(agentId, days),
		staleTime: 5 * 60 * 1000,
		gcTime: 20 * 60 * 1000,
	});
}

export function useCustomerProfileQuery(customerId: string) {
	return useQuery({
		enabled: Boolean(customerId),
		queryKey: customerProfileQueryKey(customerId),
		queryFn: () => getCustomerProfile(customerId),
		staleTime: 3 * 60 * 1000,
		gcTime: 15 * 60 * 1000,
	});
}
