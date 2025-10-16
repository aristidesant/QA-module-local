import { useMemo } from 'react';
import { ConversationConfigModel } from '~/models/AgentListObject';
import { useClientConfigByName } from '~/queries/useClientConfigs';

export type CampaignPredefinedParam = {
	name: string;
	params: {
		conversationConfig?: ConversationConfigModel;
	};
};

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
