import { ColumnDef } from '@tanstack/react-table';
import { ActionIcon } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { CampaignPredefinedParam } from '~/modules/campaigns/CampaignsForm/useCampaignsPredefinedParams';

interface UseCampaignPredefinedParamsColumnsProps {
	onDelete?: (param: CampaignPredefinedParam) => void;
}

const useCampaignPredefinedParamsColumns = ({
	onDelete,
}: UseCampaignPredefinedParamsColumnsProps = {}) => {
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
		{
			id: 'actions',
			header: 'Actions',
			cell: ({ row }) => (
				<ActionIcon
					variant='subtle'
					color='red'
					aria-label='Delete parameter'
					onClick={(e) => {
						e.stopPropagation();
						onDelete?.(row.original);
					}}
					size='sm'
					disabled={!onDelete}
				>
					<IconTrash size={14} />
				</ActionIcon>
			),
		},
	];

	return columns;
};

export default useCampaignPredefinedParamsColumns;
