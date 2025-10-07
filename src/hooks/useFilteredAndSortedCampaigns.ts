import { useMemo } from 'react';
import type { Campaign } from '~/models/CampaignsModel';

export const useFilteredAndSortedCampaigns = (
	data: Campaign[] | undefined,
	search: string,
	sortBy: string
) => {
	return useMemo(() => {
		if (!data) return [];

		let filtered = data.filter((campaign) => {
			const searchLower = search.toLowerCase().trim();
			if (!searchLower) return true;

			return (
				campaign.name.toLowerCase().includes(searchLower) ||
				campaign.description?.toLowerCase().includes(searchLower) ||
				campaign.status?.toLowerCase().includes(searchLower) ||
				campaign.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
			);
		});

		filtered.sort((a, b) => {
			switch (sortBy) {
				case 'name':
					return a.name.localeCompare(b.name);
				case 'status':
					return (a.status || '').localeCompare(b.status || '');
				case 'lastActivity':
					return (
						new Date(b.updatedAt || 0).getTime() -
						new Date(a.updatedAt || 0).getTime()
					);
				case 'createdAt':
				default:
					return (
						new Date(b.createdAt || 0).getTime() -
						new Date(a.createdAt || 0).getTime()
					);
			}
		});

		return filtered;
	}, [data, search, sortBy]);
};
