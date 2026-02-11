import { ActionIcon, Group, Tooltip } from '@mantine/core';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useAgentTestsPage } from '../../context/AgentTestsPageContext';

interface AgentTestsHeaderActionsProps {
	canCreate: boolean;
	onRefetch: () => void;
	isRefreshing: boolean;
}

const AgentTestsHeaderActions = ({
	canCreate,
	onRefetch,
	isRefreshing,
}: AgentTestsHeaderActionsProps) => {
	const { t } = useTranslation('agent-tests');
	const { openCreateModal } = useAgentTestsPage();

	return (
		<Group gap='xs'>
			<Tooltip label={t('actions.refresh')} withArrow>
				<ActionIcon
					variant='default'
					size='sm'
					aria-label={t('actions.refresh')}
					onClick={onRefetch}
					loading={isRefreshing}
					disabled={isRefreshing}
				>
					<IconRefresh size={16} />
				</ActionIcon>
			</Tooltip>
			{canCreate && (
				<Tooltip label={t('actions.create')} withArrow>
					<ActionIcon
						variant='default'
						size='sm'
						aria-label={t('actions.create')}
						onClick={openCreateModal}
					>
						<IconPlus size={16} />
					</ActionIcon>
				</Tooltip>
			)}
		</Group>
	);
};

export default AgentTestsHeaderActions;
