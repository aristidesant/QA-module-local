import { Button, Group } from '@mantine/core';
import { IconPlayerPlay, IconPlus, IconRefresh } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useAgentTestsPage } from '../../context/AgentTestsPageContext';
import type { AgentTest } from '~/models/AgentTestModel';

interface AgentTestsHeaderActionsProps {
	canCreate: boolean;
	canRun: boolean;
	tests: AgentTest[];
	onRefetch: () => void;
}

const AgentTestsHeaderActions = ({
	canCreate,
	canRun,
	tests,
	onRefetch,
}: AgentTestsHeaderActionsProps) => {
	const { t } = useTranslation('agent-tests');
	const { openCreateModal, handleRunSelected, selectedTestIds, runAgentTests } =
		useAgentTestsPage();

	const selectedTests = tests.filter((test) =>
		selectedTestIds.includes(test.id)
	);

	return (
		<Group gap='xs'>
			<Button
				variant='default'
				size='xs'
				leftSection={<IconRefresh size={14} />}
				onClick={onRefetch}
			>
				{t('actions.refresh')}
			</Button>
			{canRun && (
				<Button
					size='xs'
					leftSection={<IconPlayerPlay size={14} />}
					onClick={() => handleRunSelected(selectedTests)}
					disabled={selectedTestIds.length === 0 || runAgentTests.isPending}
					loading={runAgentTests.isPending}
				>
					{t('actions.runSelected')}
				</Button>
			)}
			{canCreate && (
				<Button
					size='xs'
					leftSection={<IconPlus size={14} />}
					onClick={openCreateModal}
				>
					{t('actions.create')}
				</Button>
			)}
		</Group>
	);
};

export default AgentTestsHeaderActions;
