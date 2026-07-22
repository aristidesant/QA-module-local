import { useQuery } from '@tanstack/react-query';

import { fetchHealth } from '~/api/qa/healthApi';

export const healthQueryKey = ['qa', 'health'] as const;

export function useHealthQuery() {
	return useQuery({
		queryKey: healthQueryKey,
		queryFn: fetchHealth,
		refetchInterval: 60_000,
		staleTime: 30_000,
	});
}
