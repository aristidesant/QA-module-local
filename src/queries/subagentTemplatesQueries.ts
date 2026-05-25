import { useQuery } from '@tanstack/react-query';
import subagentTemplatesApi from '~/api/subagentTemplatesApi';
import type { SubagentTemplateFilters } from '~/models/SubagentTemplateModel';

export const useGetSubagentTemplates = (filters?: SubagentTemplateFilters) => {
	return useQuery({
		queryKey: ['subagentTemplates', filters],
		queryFn: async () => {
			const api = subagentTemplatesApi();
			return api.findAll(filters);
		},
	});
};
