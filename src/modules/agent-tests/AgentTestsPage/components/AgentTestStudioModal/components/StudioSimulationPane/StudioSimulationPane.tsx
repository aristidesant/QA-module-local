import {
	ActionIcon,
	Badge,
	Button,
	Group,
	Menu,
	Stack,
	Text,
	Textarea,
} from '@mantine/core';
import {
	IconPlayerPlay,
	IconPlus,
	IconRobot,
	IconTrash,
	IconUser,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { useAgentTestsPage } from '../../../../context/AgentTestsPageContext';
import styles from '../../../../AgentTestsPage.module.css';

const StudioSimulationPane = () => {
	const { t } = useTranslation('agent-tests');
	const { t: tCommon } = useTranslation('common');
	const {
		chatHistoryPreview,
		dynamicVariablePreview,
		editingTest,
		lastRunResult,
		runAgentTests,
		runTests,
		addConversationTurn,
		removeConversationTurn,
		updateConversationTurnRole,
		updateConversationTurnMessage,
		setPendingRunTests,
		setIsAgentSelectOpen,
		closeModal,
	} = useAgentTestsPage();

	const handleRunTest = () => {
		const currentId = editingTest?.id;
		const testAgentId = editingTest?.agentId;
		if (!currentId) {
			notifications.show({
				title: tCommon('status.error'),
				message: t('simulation.runSingleHint'),
				color: 'red',
			});
			return;
		}
		if (!testAgentId) {
			setPendingRunTests([currentId]);
			setIsAgentSelectOpen(true);
			return;
		}
		runTests([currentId], testAgentId);
	};

	return (
		<div className={styles.studioSimulationPane}>
			<Stack gap='xs'>
				<Group justify='space-between' align='center'>
					<Text size='sm' fw={600}>
						{t('simulation.title')}
					</Text>
					<Button
						size='xs'
						variant='light'
						leftSection={<IconPlayerPlay size={14} />}
						disabled={!editingTest || runAgentTests.isPending}
						loading={runAgentTests.isPending}
						onClick={handleRunTest}
					>
						{t('simulation.run')}
					</Button>
				</Group>

				<div className={styles.conversationBox}>
					{chatHistoryPreview.length === 0 ? (
						<div className={styles.conversationEmptyState}>
							<Text size='sm' c='dimmed'>
								{t('simulation.empty')}
							</Text>
							<Menu shadow='sm' position='bottom-end' withArrow>
								<Menu.Target>
									<Button
										size='xs'
										leftSection={<IconPlus size={12} />}
										variant='default'
									>
										{t('simulation.addMessage')}
									</Button>
								</Menu.Target>
								<Menu.Dropdown>
									<Menu.Item
										leftSection={<IconUser size={14} />}
										onClick={() => addConversationTurn(-1, 'user')}
									>
										{t('simulation.addUserMessage')}
									</Menu.Item>
									<Menu.Item
										leftSection={<IconRobot size={14} />}
										onClick={() => addConversationTurn(-1, 'agent')}
									>
										{t('simulation.addAgentMessage')}
									</Menu.Item>
								</Menu.Dropdown>
							</Menu>
						</div>
					) : (
						chatHistoryPreview.map((turn, index) => (
							<div
								key={`${turn.role}-${index}`}
								className={
									turn.role === 'agent'
										? styles.messageRowAgent
										: styles.messageRowUser
								}
							>
								<div className={styles.messageMetaRow}>
									<Menu shadow='sm' withArrow>
										<Menu.Target>
											<Button
												size='compact-xs'
												variant='subtle'
												className={styles.messageRoleButton}
											>
												{turn.role === 'agent'
													? t('simulation.agent')
													: t('simulation.user')}
											</Button>
										</Menu.Target>
										<Menu.Dropdown>
											<Menu.Item
												leftSection={<IconUser size={14} />}
												onClick={() =>
													updateConversationTurnRole(index, 'user')
												}
											>
												{t('simulation.user')}
											</Menu.Item>
											<Menu.Item
												leftSection={<IconRobot size={14} />}
												onClick={() =>
													updateConversationTurnRole(index, 'agent')
												}
											>
												{t('simulation.agent')}
											</Menu.Item>
										</Menu.Dropdown>
									</Menu>
								</div>
								<Textarea
									value={turn.message}
									onChange={(event) =>
										updateConversationTurnMessage(
											index,
											event.currentTarget.value
										)
									}
									autosize
									minRows={2}
									maxRows={8}
									size='sm'
									variant='unstyled'
									className={styles.messageBubbleEditor}
									placeholder={
										turn.role === 'agent'
											? t('simulation.agentMessagePlaceholder')
											: t('simulation.userMessagePlaceholder')
									}
								/>
								<Group gap='xs' justify='flex-end'>
									<ActionIcon
										size='sm'
										variant='subtle'
										color='red'
										onClick={() => removeConversationTurn(index)}
										aria-label={t('simulation.removeMessage')}
									>
										<IconTrash size={14} />
									</ActionIcon>
									<Menu shadow='sm' position='bottom-end' withArrow>
										<Menu.Target>
											<ActionIcon
												size='sm'
												variant='default'
												aria-label={t('simulation.addMessage')}
											>
												<IconPlus size={14} />
											</ActionIcon>
										</Menu.Target>
										<Menu.Dropdown>
											<Menu.Item
												leftSection={<IconUser size={14} />}
												onClick={() => addConversationTurn(index, 'user')}
											>
												{t('simulation.addUserMessage')}
											</Menu.Item>
											<Menu.Item
												leftSection={<IconRobot size={14} />}
												onClick={() => addConversationTurn(index, 'agent')}
											>
												{t('simulation.addAgentMessage')}
											</Menu.Item>
										</Menu.Dropdown>
									</Menu>
								</Group>
							</div>
						))
					)}
				</div>

				{dynamicVariablePreview.length > 0 && (
					<div className={styles.dynamicVarsBox}>
						<Text size='xs' fw={600}>
							{t('simulation.dynamicVarsPreview')}
						</Text>
						{dynamicVariablePreview.map((item) => (
							<Group key={item.key} justify='space-between' gap='xs'>
								<Text size='xs' c='dimmed'>
									{item.key}
								</Text>
								<Text size='xs'>{item.value || '-'}</Text>
							</Group>
						))}
					</div>
				)}

				{lastRunResult && (
					<div className={styles.runResultBox}>
						<Group gap='xs'>
							<Badge
								size='sm'
								variant='light'
								color={
									lastRunResult.status === 'COMPLETED'
										? 'teal'
										: lastRunResult.status === 'STARTED'
											? 'blue'
											: 'red'
								}
							>
								{lastRunResult.status}
							</Badge>
							<Text size='xs' c='dimmed'>
								{t('run.lastRunDescription', {
									jobId: lastRunResult.jobId,
								})}
							</Text>
						</Group>
						{lastRunResult.summary && (
							<Text size='xs' c='dimmed'>
								{t('run.summary', {
									total: lastRunResult.summary.total,
									passed: lastRunResult.summary.passed,
									failed: lastRunResult.summary.failed,
								})}
							</Text>
						)}
					</div>
				)}

				<Group justify='space-between' mt='sm'>
					<Button variant='default' size='sm' onClick={closeModal}>
						{tCommon('actions.cancel')}
					</Button>
					<Button type='submit' size='sm' form='agent-test-form'>
						{editingTest ? t('actions.saveChanges') : t('actions.create')}
					</Button>
				</Group>
			</Stack>
		</div>
	);
};

export default StudioSimulationPane;
