import { ColumnDef } from '@tanstack/react-table';
import { ActionIcon, Tooltip, Group } from '@mantine/core';
import { IconTrash, IconRefresh } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { AgentBehavior } from '~/models/AgentBehavior';

interface UseAgentBehaviorsColumnsProps {
	onDelete?: (param: AgentBehavior) => void;
	onReplace?: (param: AgentBehavior) => void;
}

const useAgentBehaviorsColumns = ({
	onDelete,
	onReplace,
}: UseAgentBehaviorsColumnsProps = {}) => {
	const { t } = useTranslation('campaign-predefined-params');

	const columns: ColumnDef<AgentBehavior>[] = [
		{
			accessorKey: 'name',
			header: t('list.columns.name', 'Name'),
		},
		{
			accessorKey: 'params.conversationConfig.agent.prompt.llm',
			header: t('list.columns.llmModel', 'LLM Model'),
		},
		{
			accessorKey: 'params.conversationConfig.tts.agentOutputAudioFormat',
			header: t('list.columns.audioFormat', 'Audio Format'),
		},
		{
			id: 'actions',
			header: t('list.columns.actions', 'Actions'),
			cell: ({ row }) => (
				<Group gap={8} wrap='nowrap'>
					<Tooltip
						label={t('list.actions.replace', 'Sync / Replace')}
						withArrow
					>
						<ActionIcon
							variant='light'
							color='blue'
							aria-label='Replace behavior'
							onClick={(e) => {
								e.stopPropagation();
								onReplace?.(row.original);
							}}
							size='sm'
							radius='md'
							disabled={!onReplace}
						>
							<IconRefresh size={14} />
						</ActionIcon>
					</Tooltip>
					<ActionIcon
						variant='light'
						color='red'
						aria-label={t('list.actions.deleteAria', 'Delete behavior')}
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
				</Group>
			),
		},
	];

	return columns;
};

export default useAgentBehaviorsColumns;
