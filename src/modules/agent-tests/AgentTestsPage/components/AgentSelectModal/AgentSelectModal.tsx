import { Button, Group, Modal, Select, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { useAgentTestsPage } from '../../context/AgentTestsPageContext';

interface AgentSelectModalProps {
	agentOptions: Array<{ value: string; label: string }>;
	isLoadingAgents: boolean;
}

const AgentSelectModal = ({
	agentOptions,
	isLoadingAgents,
}: AgentSelectModalProps) => {
	const { t } = useTranslation('agent-tests');
	const { t: tCommon } = useTranslation('common');
	const {
		isAgentSelectOpen,
		setIsAgentSelectOpen,
		selectedAgentForRun,
		setSelectedAgentForRun,
		pendingRunTests,
		setPendingRunTests,
		runTests,
	} = useAgentTestsPage();

	const handleClose = () => {
		setIsAgentSelectOpen(false);
		setPendingRunTests(null);
		setSelectedAgentForRun(null);
	};

	const handleConfirm = () => {
		if (!selectedAgentForRun) {
			notifications.show({
				title: tCommon('status.error'),
				message: t('run.selectAgentValidation'),
				color: 'red',
			});
			return;
		}
		if (pendingRunTests) {
			runTests(pendingRunTests, selectedAgentForRun);
			handleClose();
		}
	};

	return (
		<Modal
			opened={isAgentSelectOpen}
			onClose={handleClose}
			title={t('run.selectAgentTitle')}
			centered
		>
			<Stack gap='md'>
				<Text size='sm'>{t('run.selectAgentDescription')}</Text>
				<Select
					label={t('run.selectAgentLabel')}
					placeholder={t('run.selectAgentPlaceholder')}
					data={agentOptions}
					value={selectedAgentForRun}
					onChange={setSelectedAgentForRun}
					searchable
					size='sm'
					disabled={isLoadingAgents}
				/>
				<Group justify='flex-end' gap='xs'>
					<Button variant='default' size='sm' onClick={handleClose}>
						{tCommon('actions.cancel')}
					</Button>
					<Button size='sm' onClick={handleConfirm}>
						{t('run.selectAgentConfirm')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};

export default AgentSelectModal;
