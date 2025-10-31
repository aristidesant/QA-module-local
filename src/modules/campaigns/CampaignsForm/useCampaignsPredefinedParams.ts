import { useMemo } from 'react';
import type { CampaignPredefinedParam } from '~/models/CampaignPredefinedParam';
import { useClientConfigByName } from '~/queries/useClientConfigs';
export type { CampaignPredefinedParam } from '~/models/CampaignPredefinedParam';

const useCampaignsPredefinedParams = () => {
	const { data } = useClientConfigByName('campaign_predefined_params');

	const parsedParams = useMemo<CampaignPredefinedParam[]>(() => {
		if (data?.value) {
			return [...JSON.parse(data.value)];
		}
		return [];
	}, [data]);

	return parsedParams;
};

export default useCampaignsPredefinedParams;
