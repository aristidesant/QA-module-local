import { ColumnDef } from '@tanstack/react-table';
import { ActionIcon } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { CampaignPredefinedParam } from '~/modules/campaigns/CampaignsForm/useCampaignsPredefinedParams';

interface UseCampaignPredefinedParamsColumnsProps {
	onDelete?: (param: CampaignPredefinedParam) => void;
}

const useCampaignPredefinedParamsColumns = ({
	onDelete,
}: UseCampaignPredefinedParamsColumnsProps = {}) => {
	const { t } = useTranslation('campaign-predefined-params');

	const columns: ColumnDef<CampaignPredefinedParam>[] = [
		{
			accessorKey: 'name',
			header: t('list.columns.name'),
		},
		{
			accessorKey: 'params.conversationConfig.agent.prompt.llm',
			header: t('list.columns.llmModel'),
		},
		{
			accessorKey: 'params.conversationConfig.tts.agentOutputAudioFormat',
			header: t('list.columns.audioFormat'),
		},
		{
			id: 'actions',
			header: t('list.columns.actions'),
			cell: ({ row }) => (
				<ActionIcon
					variant='light'
					color='red'
					aria-label={t('list.actions.deleteAria')}
					onClick={(e) => {
						e.stopPropagation();
						onDelete?.(row.original);
					}}
					size='sm'
					radius='md'
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
