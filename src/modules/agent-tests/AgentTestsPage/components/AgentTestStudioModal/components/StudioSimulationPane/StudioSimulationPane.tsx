import {
	ActionIcon,
	Badge,
	Button,
	Group,
	Menu,
	Text,
	Textarea,
	ThemeIcon,
} from '@mantine/core';
import { useEffect, useState } from 'react';
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
		editingTest,
		lastRunResult,
		runAgentTests,
		runTests,
		addConversationTurn,
		removeConversationTurn,
		updateConversationTurnRole,
		updateConversationTurnMessage,
		openAgentSelectFromStudio,
	} = useAgentTestsPage();
	const [selectedMessageIndex, setSelectedMessageIndex] = useState<
		number | null
	>(null);

	useEffect(() => {
		if (chatHistoryPreview.length === 0) {
			setSelectedMessageIndex(null);
			return;
		}

		setSelectedMessageIndex((current) => {
			if (current === null) {
				return chatHistoryPreview.length - 1;
			}
			return current >= chatHistoryPreview.length
				? chatHistoryPreview.length - 1
				: current;
		});
	}, [chatHistoryPreview.length]);

	const handleRunTest = () => {
		const currentId = editingTest?.testId || editingTest?.id;
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
			openAgentSelectFromStudio([currentId]);
			return;
		}
		runTests([currentId], testAgentId);
	};

	return (
		<div className={styles.studioSimulationPane}>
			<div className={styles.studioSimulationContent}>
				<Group
					justify='space-between'
					align='center'
					className={styles.sectionHeader}
				>
					<Text size='xs' fw={700} className={styles.studioSectionTitle}>
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
										variant='subtle'
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
						chatHistoryPreview.map((turn, index) => {
							const isSelected = selectedMessageIndex === index;

							return (
								<div
									key={`${turn.role}-${index}`}
									className={
										turn.role === 'agent'
											? styles.chatRowAgent
											: styles.chatRowUser
									}
									onClick={() => setSelectedMessageIndex(index)}
								>
									<div
										className={
											turn.role === 'agent'
												? `${styles.chatBubble} ${styles.chatBubbleAgent} ${isSelected ? styles.chatBubbleSelected : ''}`
												: `${styles.chatBubble} ${styles.chatBubbleUser} ${isSelected ? styles.chatBubbleSelected : ''}`
										}
									>
										<Group justify='space-between' align='center' wrap='nowrap'>
											<Badge
												size='xs'
												variant='light'
												leftSection={
													turn.role === 'agent' ? (
														<IconRobot size={11} />
													) : (
														<IconUser size={11} />
													)
												}
											>
												{turn.role === 'agent'
													? t('simulation.agent')
													: t('simulation.user')}
											</Badge>
											{isSelected && (
												<Group gap={4} wrap='nowrap'>
													<Menu shadow='sm' withArrow>
														<Menu.Target>
															<ActionIcon
																size='sm'
																variant='subtle'
																aria-label={t('simulation.addMessage')}
															>
																<IconPlus size={14} />
															</ActionIcon>
														</Menu.Target>
														<Menu.Dropdown>
															<Menu.Item
																leftSection={<IconUser size={14} />}
																onClick={() =>
																	addConversationTurn(index, 'user')
																}
															>
																{t('simulation.addUserMessage')}
															</Menu.Item>
															<Menu.Item
																leftSection={<IconRobot size={14} />}
																onClick={() =>
																	addConversationTurn(index, 'agent')
																}
															>
																{t('simulation.addAgentMessage')}
															</Menu.Item>
														</Menu.Dropdown>
													</Menu>
													<Menu shadow='sm' withArrow>
														<Menu.Target>
															<ActionIcon
																size='sm'
																variant='subtle'
																aria-label={t('simulation.user')}
															>
																<ThemeIcon
																	size={14}
																	variant='transparent'
																	color='gray'
																>
																	{turn.role === 'agent' ? (
																		<IconRobot size={12} />
																	) : (
																		<IconUser size={12} />
																	)}
																</ThemeIcon>
															</ActionIcon>
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
													<ActionIcon
														size='sm'
														variant='subtle'
														color='red'
														onClick={() => removeConversationTurn(index)}
														aria-label={t('simulation.removeMessage')}
													>
														<IconTrash size={14} />
													</ActionIcon>
												</Group>
											)}
										</Group>
										<Textarea
											value={turn.message}
											onFocus={() => setSelectedMessageIndex(index)}
											onChange={(event) =>
												updateConversationTurnMessage(
													index,
													event.currentTarget.value
												)
											}
											autosize
											minRows={1}
											maxRows={8}
											size='sm'
											variant='unstyled'
											className={styles.chatBubbleEditor}
											placeholder={
												turn.role === 'agent'
													? t('simulation.agentMessagePlaceholder')
													: t('simulation.userMessagePlaceholder')
											}
										/>
									</div>
								</div>
							);
						})
					)}
				</div>

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
			</div>
		</div>
	);
};

export default StudioSimulationPane;
