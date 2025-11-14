import { useQuery } from '@tanstack/react-query';
import { getLiveMetrics } from '~/api/metricsApi';

export const useContactListMetrics = (
	contactGroupId: number,
	range: string
) => {
	return useQuery({
		queryKey: ['live-metrics', contactGroupId, range],
		queryFn: () => getLiveMetrics(contactGroupId, range),
	});
};
