import { ActionIcon, Button, Group, Tooltip } from '@mantine/core';
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
					size='lg'
					onClick={onRefetch}
					loading={isRefreshing}
					disabled={isRefreshing}
				>
					<IconRefresh size={16} />
				</ActionIcon>
			</Tooltip>
			{canCreate && (
				<Button
					size='xs'
					leftSection={<IconPlus size={13} />}
					onClick={openCreateModal}
				>
					{t('actions.create')}
				</Button>
			)}
		</Group>
	);
};

export default AgentTestsHeaderActions;
