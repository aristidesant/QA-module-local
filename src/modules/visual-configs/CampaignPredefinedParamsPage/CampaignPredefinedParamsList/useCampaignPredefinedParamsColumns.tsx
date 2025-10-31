import { ColumnDef } from '@tanstack/react-table';
import { CampaignPredefinedParam } from '~/modules/campaigns/CampaignsForm/useCampaignsPredefinedParams';

const useCampaignPredefinedParamsColumns = () => {
	const columns: ColumnDef<CampaignPredefinedParam>[] = [
		{
			accessorKey: 'name',
			header: 'Name',
		},
		{
			accessorKey: 'params.conversationConfig.agent.prompt.llm',
			header: 'LLM Model',
		},
		{
			accessorKey: 'params.conversationConfig.tts.agentOutputAudioFormat',
			header: 'Audio Format',
		},
	];

	return columns;
};

export default useCampaignPredefinedParamsColumns;
