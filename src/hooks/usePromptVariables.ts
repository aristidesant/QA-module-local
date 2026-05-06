import { useMemo } from 'react';
import type { CampaignPromptVariable } from '~/models/CampaignsModel';
import { useGetCampaignPromptVariables } from '~/queries/campaignsQueries';

export type PromptVariable = CampaignPromptVariable;

export const usePromptVariables = (campaignId: number) => {
	const { data: promptVariables } = useGetCampaignPromptVariables(campaignId);

	const allVariables = useMemo<PromptVariable[]>(() => {
		if (!promptVariables?.length) {
			return [];
		}

		const seenVariableNames = new Set<string>();

		return promptVariables.filter((variable) => {
			const normalizedName = variable.name.trim().toLowerCase();

			if (!normalizedName || seenVariableNames.has(normalizedName)) {
				return false;
			}

			seenVariableNames.add(normalizedName);
			return true;
		});
	}, [promptVariables]);

	return allVariables;
};
