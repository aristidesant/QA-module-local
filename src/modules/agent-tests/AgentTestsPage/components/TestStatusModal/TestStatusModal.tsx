import { useEffect, useMemo, useState } from 'react';
import {
	Modal,
	Group,
	Stack,
	Text,
	SimpleGrid,
	Loader,
	Center,
	ActionIcon,
	Badge,
	Tooltip,
} from '@mantine/core';
import { IconRefresh, IconCircleX, IconPencil } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type {
	AgentTest,
	AgentTestChatMessage,
	RunAgentTestsResponse,
} from '~/models/AgentTestModel';
import { formatAgentTestName } from '../../utils/formatAgentTestName';
import styles from '../../AgentTestsPage.module.css';

interface TestStatusModalProps {
	isOpen: boolean;
	onClose: () => void;
	testStatusData: RunAgentTestsResponse | null;
	testList: AgentTest[];
	runTestIds: string[];
	isLoading: boolean;
	testName: string;
	onRetryTest: (testId: string) => void;
	onEditTest: (testId: string) => void;
	isTransitioning: boolean;
	isRetrying: boolean;
}

export const TestStatusModal: React.FC<TestStatusModalProps> = ({
	isOpen,
	onClose,
	testStatusData,
	testList,
	runTestIds,
	isLoading,
	testName,
	onRetryTest,
	onEditTest,
	isTransitioning,
	isRetrying,
}) => {
	const { t } = useTranslation('agent-tests');
	const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

	// Get failed tests
	const failedTests = useMemo(() => {
		if (!testStatusData?.results) return [];
		return testStatusData.results.filter(
			(result) => result.status === 'FAILED'
		);
	}, [testStatusData?.results]);

	const completedTests = useMemo(() => {
		if (!testStatusData?.results) return [];
		return testStatusData.results.filter(
			(result) => result.status !== 'PENDING'
		);
	}, [testStatusData?.results]);

	// Auto-select first failed test, or first completed test
	useEffect(() => {
		if (selectedTestId) return;

		if (failedTests.length > 0) {
			setSelectedTestId(failedTests[0].testId);
			return;
		}

		if (completedTests.length > 0) {
			setSelectedTestId(completedTests[0].testId);
		}
	}, [completedTests, failedTests, selectedTestId]);

	// Get selected test details
	const selectedTest = useMemo(() => {
		if (!selectedTestId) return null;
		const testResult = testStatusData?.results?.find(
			(r) => r.testId === selectedTestId
		);
		const testMetadata = testList.find(
			(t) => (t.testId || t.id) === selectedTestId
		);
		return { result: testResult, metadata: testMetadata };
	}, [selectedTestId, testStatusData?.results, testList]);

	const selectedTestDisplayName = useMemo(() => {
		if (!selectedTest) return '';
		return formatAgentTestName(
			selectedTest.metadata?.name ||
				selectedTest.result?.testName ||
				selectedTest.result?.testId ||
				''
		);
	}, [selectedTest]);

	const conversationMessages = useMemo(() => {
		const invocationConversation = (
			selectedTest?.result?.chatHistory ?? []
		).filter((message) => message.message.trim().length > 0);
		const metadataConversation = (
			selectedTest?.metadata?.chatHistory ?? []
		).filter((message) => message.message.trim().length > 0);
		const baseConversation =
			invocationConversation.length > 0
				? invocationConversation
				: metadataConversation;

		const finalAgentReply = selectedTest?.result?.actual?.trim();
		if (!finalAgentReply) {
			return baseConversation;
		}

		const lastMessage = baseConversation[baseConversation.length - 1];
		const lastMessageIsSameAgentReply =
			lastMessage?.role === 'agent' &&
			lastMessage.message.trim() === finalAgentReply;

		if (lastMessageIsSameAgentReply) {
			return baseConversation;
		}

		return [
			...baseConversation,
			{
				role: 'agent',
				message: finalAgentReply,
			} as AgentTestChatMessage,
		];
	}, [
		selectedTest?.metadata?.chatHistory,
		selectedTest?.result?.actual,
		selectedTest?.result?.chatHistory,
	]);

	const isCompleted = testStatusData?.status === 'COMPLETED';
	const showLoadingState = isLoading || !isCompleted;
	const selectedStatus = selectedTest?.result?.status || 'PENDING';
	const selectedColor =
		selectedStatus === 'PASSED'
			? 'green'
			: selectedStatus === 'FAILED'
				? 'red'
				: 'gray';

	const runningTests = useMemo(() => {
		const statusById = new Map(
			(testStatusData?.results ?? []).map((result) => [result.testId, result])
		);

		return runTestIds.map((testId) => {
			const result = statusById.get(testId);
			const test = testList.find((item) => (item.testId || item.id) === testId);
			return {
				testId,
				name: result?.testName || test?.name || formatAgentTestName(testId),
				status: result?.status || 'PENDING',
			};
		});
	}, [runTestIds, testList, testStatusData?.results]);

	return (
		<Modal
			opened={isOpen}
			onClose={onClose}
			title={t('testStatus.title', { testName })}
			size='90%'
			centered
			classNames={{
				header: styles.modalHeader,
				body: styles.modalBody,
			}}
		>
			<Stack gap='xs' h='100%'>
				{/* Two-pane layout */}
				<SimpleGrid cols={2} spacing='xs' h='100%' style={{ minHeight: 0 }}>
					{/* Left pane - Failed Tests List */}
					<Stack gap='xs' style={{ minHeight: 0, overflow: 'auto' }}>
						<Text fw={600} size='sm'>
							{showLoadingState
								? t('testStatus.runningTestsTitle', {
										count: runTestIds.length,
									})
								: t('testStatus.completedTests', {
										count: completedTests.length,
									})}
						</Text>

						{showLoadingState ? (
							<Stack gap='xs' style={{ overflow: 'auto', flex: 1 }}>
								{runningTests.map((item) => (
									<div
										key={item.testId}
										className={styles.testStatusListItem}
										style={{
											padding: 'var(--mantine-spacing-xs)',
											border: '1px solid var(--mantine-color-gray-2)',
											borderRadius: 'var(--mantine-radius-md)',
											backgroundColor: 'var(--mantine-color-white)',
										}}
									>
										<Group gap='xs' justify='space-between' wrap='nowrap'>
											<div className={styles.testStatusListItemLabel}>
												<Text size='sm' fw={500} truncate>
													{formatAgentTestName(item.name)}
												</Text>
											</div>
											<Badge
												size='xs'
												variant='light'
												color={item.status === 'PENDING' ? 'gray' : 'blue'}
											>
												{item.status === 'PENDING'
													? t('testStatus.pending')
													: item.status}
											</Badge>
										</Group>
									</div>
								))}
								{runningTests.length === 0 && (
									<Center h={120}>
										<Loader size='sm' />
									</Center>
								)}
							</Stack>
						) : completedTests.length === 0 ? (
							<Center h={300}>
								<Text size='sm' c='dimmed'>
									{t('testStatus.allPassed')}
								</Text>
							</Center>
						) : (
							<Stack gap='xs' style={{ overflow: 'auto', flex: 1 }}>
								{completedTests.map((result) => {
									const test = testList.find(
										(t) => (t.testId || t.id) === result.testId
									);
									const isSelected = selectedTestId === result.testId;
									const rowColor =
										result.status === 'PASSED'
											? 'green'
											: result.status === 'FAILED'
												? 'red'
												: 'gray';

									return (
										<div
											key={result.testId}
											onClick={() => setSelectedTestId(result.testId)}
											style={{
												padding: 'var(--mantine-spacing-xs)',
												border: '1px solid var(--mantine-color-gray-2)',
												borderRadius: 'var(--mantine-radius-md)',
												cursor: 'pointer',
												backgroundColor:
													result.status === 'PASSED'
														? 'var(--mantine-color-green-0)'
														: result.status === 'FAILED'
															? 'var(--mantine-color-red-0)'
															: 'var(--mantine-color-white)',
												borderColor: isSelected
													? 'var(--mantine-color-blue-3)'
													: 'var(--mantine-color-gray-2)',
											}}
											className={styles.testStatusListItem}
										>
											<Group gap='xs' wrap='nowrap'>
												<IconCircleX
													size={20}
													style={{
														color:
															rowColor === 'green'
																? 'var(--mantine-color-green-6)'
																: rowColor === 'red'
																	? 'var(--mantine-color-red-6)'
																	: 'var(--mantine-color-gray-6)',
														flexShrink: 0,
													}}
												/>
												<div className={styles.testStatusListItemLabel}>
													<Text size='sm' fw={500} truncate>
														{formatAgentTestName(test?.name || result.testId)}
													</Text>
												</div>
												<Badge size='xs' variant='light' color={rowColor}>
													{result.status}
												</Badge>
												<ActionIcon
													size='xs'
													variant='subtle'
													disabled={isRetrying}
													onClick={(e) => {
														e.stopPropagation();
														onRetryTest(result.testId);
													}}
												>
													<IconRefresh size={14} />
												</ActionIcon>
												<Tooltip label={t('testStatus.editTest')}>
													<ActionIcon
														size='xs'
														variant='subtle'
														disabled={isTransitioning}
														onClick={(e) => {
															e.stopPropagation();
															onEditTest(test?.id || result.testId);
														}}
													>
														<IconPencil size={14} />
													</ActionIcon>
												</Tooltip>
											</Group>
										</div>
									);
								})}
							</Stack>
						)}
					</Stack>

					{/* Right pane - Evaluation Details */}
					<Stack
						gap='xs'
						style={{
							minHeight: 0,
							overflow: 'auto',
							borderLeft: '1px solid var(--mantine-color-gray-2)',
							paddingLeft: 'var(--mantine-spacing-sm)',
						}}
					>
						<Group justify='space-between' align='flex-start'>
							<Text fw={600} size='sm'>
								{t('testStatus.evaluation')}
							</Text>
						</Group>

						{showLoadingState ? (
							<Center h={300}>
								<Stack gap='xs' align='center'>
									<Loader size='sm' />
									<Text size='sm' c='dimmed'>
										{t('testStatus.runningTests')}
									</Text>
								</Stack>
							</Center>
						) : !selectedTest ? (
							<Center h={300}>
								<Text size='sm' c='dimmed'>
									{t('testStatus.selectTest')}
								</Text>
							</Center>
						) : (
							<Stack gap='xs' h='100%' style={{ minHeight: 0 }}>
								<Group justify='space-between' align='center'>
									<Group gap='xs'>
										<Text size='xs' c='dimmed'>
											{selectedTestDisplayName}
										</Text>
										<Tooltip label={t('testStatus.editTest')}>
											<ActionIcon
												size='xs'
												variant='subtle'
												disabled={isTransitioning || !selectedTest.metadata?.id}
												onClick={() => {
													if (selectedTest.metadata?.id) {
														onEditTest(selectedTest.metadata.id);
													}
												}}
											>
												<IconPencil size={14} />
											</ActionIcon>
										</Tooltip>
									</Group>
									<Badge size='sm' variant='light' color={selectedColor}>
										{t('testStatus.actualResponse')}
									</Badge>
								</Group>

								{selectedTest.result?.rationale && (
									<Text size='xs' c='dimmed'>
										{selectedTest.result.rationale}
									</Text>
								)}

								<Stack gap='xs' className={styles.testStatusConversationPane}>
									{conversationMessages.map((message, index) => {
										const isUser = message.role === 'user';
										const isLastMessage =
											index === conversationMessages.length - 1;
										const isFinalActualAgentMessage =
											!isUser &&
											isLastMessage &&
											Boolean(selectedTest.result?.actual?.trim());
										const finalBubbleClass =
											isFinalActualAgentMessage && selectedStatus === 'FAILED'
												? styles.chatBubbleFailed
												: isFinalActualAgentMessage &&
													  selectedStatus === 'PASSED'
													? styles.chatBubblePassed
													: '';

										return (
											<div
												key={`${message.role}-${index}-${message.message}`}
												className={
													isUser ? styles.chatRowUser : styles.chatRowAgent
												}
											>
												<div
													className={`${styles.chatBubble} ${
														isUser
															? styles.chatBubbleUser
															: styles.chatBubbleAgent
													} ${finalBubbleClass}`}
												>
													<Text size='xs' c='dimmed'>
														{isUser
															? t('simulation.user')
															: t('simulation.agent')}
													</Text>
													<Text
														size='sm'
														className={styles.testStatusMessageText}
													>
														{message.message}
													</Text>
												</div>
											</div>
										);
									})}

									{conversationMessages.length === 0 && (
										<Center h={160}>
											<Text size='sm' c='dimmed'>
												{t('testStatus.noConversation')}
											</Text>
										</Center>
									)}
								</Stack>
							</Stack>
						)}
					</Stack>
				</SimpleGrid>
			</Stack>
		</Modal>
	);
};
