import {
	Button,
	Center,
	Group,
	Loader,
	Modal,
	Select,
	Stack,
	Text,
} from '@mantine/core';
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
		agentSelectSource,
		setAgentSelectSource,
		setIsModalOpen,
		isModalTransitioning,
		pendingRunTests,
		setPendingRunTests,
		runTests,
		runAgentTests,
	} = useAgentTestsPage();

	const handleClose = () => {
		const wasOpenedFromStudio = agentSelectSource === 'studio';
		setIsAgentSelectOpen(false);
		setPendingRunTests(null);
		setSelectedAgentForRun(null);
		setAgentSelectSource(null);
		if (isModalTransitioning) {
			return;
		}
		if (wasOpenedFromStudio) {
			setIsModalOpen(true);
		}
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
			setIsAgentSelectOpen(false);
			setPendingRunTests(null);
			setSelectedAgentForRun(null);
			setAgentSelectSource(null);
			runTests(pendingRunTests, selectedAgentForRun);
		}
	};

	return (
		<Modal
			opened={isAgentSelectOpen}
			onClose={handleClose}
			title={t('run.selectAgentTitle')}
			centered
		>
			{isModalTransitioning ? (
				<Center h={180}>
					<Stack gap='xs' align='center'>
						<Loader size='sm' />
						<Text size='xs' c='dimmed'>
							{t('run.preparingAgentSelection')}
						</Text>
					</Stack>
				</Center>
			) : (
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
						<Button
							variant='default'
							size='sm'
							onClick={handleClose}
							disabled={runAgentTests.isPending}
						>
							{tCommon('actions.cancel')}
						</Button>
						<Button
							size='sm'
							onClick={handleConfirm}
							loading={runAgentTests.isPending}
							disabled={runAgentTests.isPending}
						>
							{t('run.selectAgentConfirm')}
						</Button>
					</Group>
				</Stack>
			)}
		</Modal>
	);
};

export default AgentSelectModal;
