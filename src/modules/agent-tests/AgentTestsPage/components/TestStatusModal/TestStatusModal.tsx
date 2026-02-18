import { useEffect, useMemo, useState } from 'react';
import {
	Modal,
	Group,
	Stack,
	Text,
	Skeleton,
	Loader,
	Center,
	ActionIcon,
	Badge,
	Tooltip,
	Progress,
	ThemeIcon,
	Box,
	SimpleGrid,
	Select,
} from '@mantine/core';
import {
	IconRefresh,
	IconCircleX,
	IconCircleCheck,
	IconClock,
	IconPencil,
	IconFlask,
	IconBulb,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useAgentsWithCampaigns } from '~/queries/agentQueries';
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
	onRetryTest: (testId: string, agentId?: string) => void;
	onEditTest: (testId: string) => void;
	isTransitioning: boolean;
	isRetrying: boolean;
	testStatusAgentId: string | null;
}

// Status icon helper
function StatusIcon({ status }: { status: string }) {
	if (status === 'PASSED') {
		return (
			<IconCircleCheck
				size={16}
				style={{ color: 'var(--mantine-color-green-6)', flexShrink: 0 }}
			/>
		);
	}
	if (status === 'FAILED') {
		return (
			<IconCircleX
				size={16}
				style={{ color: 'var(--mantine-color-red-6)', flexShrink: 0 }}
			/>
		);
	}
	return (
		<IconClock
			size={16}
			style={{ color: 'var(--mantine-color-gray-4)', flexShrink: 0 }}
		/>
	);
}

// Status badge helper
function StatusBadge({
	status,
	t,
}: {
	status: string;
	t: (key: string) => string;
}) {
	const color =
		status === 'PASSED' ? 'green' : status === 'FAILED' ? 'red' : 'gray';
	const label =
		status === 'PASSED'
			? t('testStatus.passed')
			: status === 'FAILED'
				? t('testStatus.failed')
				: t('testStatus.pending');
	return (
		<Badge size='xs' variant='light' color={color}>
			{label}
		</Badge>
	);
}

const isSettledStatus = (status: string) =>
	status === 'PASSED' || status === 'FAILED';

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
	testStatusAgentId,
}) => {
	const { t } = useTranslation('agent-tests');
	const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
	const [selectedRetryAgentId, setSelectedRetryAgentId] = useState<
		string | null
	>(testStatusAgentId);
	const runTestIdsSignature = runTestIds.join('|');

	const { data: agentsWithCampaigns, isLoading: isAgentsLoading } =
		useAgentsWithCampaigns({
			page: 1,
			limit: 200,
		});

	const retryAgentOptions = useMemo(() => {
		const uniqueById = new Map<string, { value: string; label: string }>();
		(agentsWithCampaigns?.data ?? [])
			.filter(
				(agent) => Boolean(agent.campaignId) && Boolean(agent.campaignName)
			)
			.forEach((agent) => {
				uniqueById.set(agent.id, {
					value: agent.id,
					label: `${agent.campaignName} - ${agent.name}`,
				});
			});
		return Array.from(uniqueById.values());
	}, [agentsWithCampaigns?.data]);

	useEffect(() => {
		setSelectedRetryAgentId(testStatusAgentId);
	}, [testStatusAgentId, runTestIdsSignature]);

	useEffect(() => {
		if (!isOpen) {
			setSelectedTestId(null);
		}
	}, [isOpen]);

	useEffect(() => {
		setSelectedTestId(null);
	}, [runTestIdsSignature]);

	const testById = useMemo(() => {
		const map = new Map<string, AgentTest>();
		testList.forEach((test) => {
			map.set(test.testId || test.id, test);
		});
		return map;
	}, [testList]);

	// Get failed tests
	const failedTests = useMemo(() => {
		if (!testStatusData?.results) return [];
		return testStatusData.results.filter((r) => r.status === 'FAILED');
	}, [testStatusData?.results]);

	const completedTests = useMemo(() => {
		if (!testStatusData?.results) return [];
		return testStatusData.results.filter((r) => r.status !== 'PENDING');
	}, [testStatusData?.results]);

	const passedCount = useMemo(
		() =>
			testStatusData?.results?.filter((r) => r.status === 'PASSED').length ?? 0,
		[testStatusData?.results]
	);

	const failedCount = failedTests.length;

	const pendingCount = useMemo(
		() =>
			Math.max(
				0,
				runTestIds.length -
					(testStatusData?.results?.filter((r) => r.status !== 'PENDING')
						.length ?? 0)
			),
		[runTestIds.length, testStatusData?.results]
	);

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
		const testMetadata = testById.get(selectedTestId);
		return { result: testResult, metadata: testMetadata };
	}, [selectedTestId, testById, testStatusData?.results]);

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

	const showLoadingState = isLoading || testStatusData?.status === 'STARTED';
	const selectedStatus = selectedTest?.result?.status || 'PENDING';
	const selectedColor =
		selectedStatus === 'PASSED'
			? 'green'
			: selectedStatus === 'FAILED'
				? 'red'
				: 'gray';

	// Build the running tests list (used in loading state for progressive reveal)
	const runningTests = useMemo(() => {
		const statusById = new Map(
			(testStatusData?.results ?? []).map((result) => [result.testId, result])
		);

		return runTestIds.map((testId) => {
			const result = statusById.get(testId);
			const test = testById.get(testId);
			return {
				testId,
				name: result?.testName || test?.name || formatAgentTestName(testId),
				status: result?.status || 'PENDING',
			};
		});
	}, [runTestIds, testById, testStatusData?.results]);

	const activeRunningTest = useMemo(
		() => runningTests.find((item) => !isSettledStatus(item.status)) ?? null,
		[runningTests]
	);

	// Progress value (0–100)
	const progressValue =
		runTestIds.length > 0
			? Math.round((completedTests.length / runTestIds.length) * 100)
			: 0;

	const hasSummary = (testStatusData?.results?.length ?? 0) > 0;

	return (
		<Modal
			opened={isOpen}
			onClose={onClose}
			title={
				<Text fw={600} size='sm'>
					{t('testStatus.title', { testName })}
				</Text>
			}
			size='90%'
			centered
			classNames={{
				header: styles.modalHeader,
				body: styles.modalBody,
				content: styles.modalContent,
			}}
		>
			<Stack gap='xs' h='100%'>
				{/* Two-pane layout */}
				<SimpleGrid cols={2} spacing='xs' h='100%' style={{ minHeight: 0 }}>
					{/* ── Left pane ─────────────────────────────────────── */}
					<Stack gap='xs' style={{ minHeight: 0, overflow: 'hidden' }}>
						{/* Pane header */}
						<Group justify='space-between' align='center' gap='xs'>
							<Text fw={600} size='sm'>
								{showLoadingState
									? t('testStatus.runningTestsTitle', {
											count: runTestIds.length,
										})
									: t('testStatus.completedTests', {
											count: completedTests.length,
										})}
							</Text>
							<Select
								size='xs'
								label={t('testStatus.agentLabel')}
								placeholder={t('testStatus.agentPlaceholder')}
								data={retryAgentOptions}
								value={selectedRetryAgentId}
								onChange={setSelectedRetryAgentId}
								disabled={isAgentsLoading || retryAgentOptions.length === 0}
								searchable
								w={260}
							/>
						</Group>

						{/* Progress bar — always visible while running */}
						{showLoadingState && runTestIds.length > 0 && (
							<Progress
								value={progressValue}
								size='xs'
								color={progressValue === 100 ? 'green' : 'blue'}
								animated={progressValue < 100}
								radius='xl'
							/>
						)}

						{showLoadingState && (
							<Group gap={6} align='center'>
								<Loader size='xs' color='blue' />
								<Text size='xs' c='dimmed' truncate>
									{activeRunningTest
										? t('testStatus.nowRunningLabel', {
												name: formatAgentTestName(activeRunningTest.name),
											})
										: t('testStatus.preparingFirstTest')}
								</Text>
							</Group>
						)}

						{/* Summary badges — shown once results start arriving */}
						{hasSummary && (
							<Group gap={6} className={styles.testStatusSummaryRow}>
								<Badge size='xs' variant='light' color='green'>
									{passedCount} {t('testStatus.passed').toLowerCase()}
								</Badge>
								<Badge size='xs' variant='light' color='red'>
									{failedCount} {t('testStatus.failed').toLowerCase()}
								</Badge>
								{pendingCount > 0 && (
									<Badge size='xs' variant='light' color='gray'>
										{pendingCount} {t('testStatus.pending').toLowerCase()}
									</Badge>
								)}
							</Group>
						)}

						{/* List */}
						<Stack gap='xs' style={{ overflow: 'auto', flex: 1 }}>
							{showLoadingState ? (
								// Loading state: progressive reveal — settled items show real data,
								// still-pending items show skeleton
								runningTests.map((item) => {
									const isSettled = isSettledStatus(item.status);
									const isActiveRunning =
										activeRunningTest?.testId === item.testId;

									if (!isSettled && !isActiveRunning) {
										return (
											<div
												key={item.testId}
												className={styles.testStatusSkeletonRow}
											>
												<Group gap='xs' align='center'>
													<Skeleton height={14} width={14} circle />
													<Skeleton
														height={12}
														radius='sm'
														style={{ flex: 1 }}
													/>
													<Skeleton height={18} width={56} radius='sm' />
												</Group>
											</div>
										);
									}

									// Settled item during loading (completed early) or active running item
									const rowColor = isActiveRunning
										? 'blue'
										: item.status === 'PASSED'
											? 'green'
											: 'red';
									return (
										<div
											key={item.testId}
											style={{
												padding: 'var(--mantine-spacing-xs)',
												border: isActiveRunning
													? '1px solid var(--mantine-color-blue-3)'
													: '1px solid var(--mantine-color-gray-2)',
												borderRadius: 'var(--mantine-radius-md)',
												backgroundColor: isActiveRunning
													? 'var(--mantine-color-blue-0)'
													: item.status === 'PASSED'
														? 'var(--mantine-color-green-0)'
														: 'var(--mantine-color-red-0)',
											}}
											className={styles.testStatusListItem}
										>
											<Group gap='xs' wrap='nowrap'>
												{isActiveRunning ? (
													<Loader size='xs' color='blue' />
												) : (
													<StatusIcon status={item.status} />
												)}
												<div className={styles.testStatusListItemLabel}>
													<Text size='sm' fw={500} truncate>
														{formatAgentTestName(item.name)}
													</Text>
												</div>
												<Badge size='xs' variant='light' color={rowColor}>
													{isActiveRunning
														? t('testStatus.runningBadge')
														: item.status}
												</Badge>
											</Group>
										</div>
									);
								})
							) : completedTests.length === 0 ? (
								// All passed (no failures, nothing to show)
								<Center h={200}>
									<Stack gap='xs' align='center'>
										<ThemeIcon
											size='lg'
											color='green'
											variant='light'
											radius='xl'
										>
											<IconCircleCheck size={20} />
										</ThemeIcon>
										<Text size='sm' c='dimmed'>
											{t('testStatus.allPassed')}
										</Text>
									</Stack>
								</Center>
							) : (
								// Completed state — full interactive list
								completedTests.map((result) => {
									const test = testList.find(
										(t) => (t.testId || t.id) === result.testId
									);
									const isSelected = selectedTestId === result.testId;
									return (
										<div
											key={result.testId}
											onClick={() => setSelectedTestId(result.testId)}
											style={{
												padding: 'var(--mantine-spacing-xs)',
												border: `1px solid ${
													isSelected
														? 'var(--mantine-color-blue-4)'
														: 'var(--mantine-color-gray-2)'
												}`,
												borderRadius: 'var(--mantine-radius-md)',
												cursor: 'pointer',
												backgroundColor:
													result.status === 'PASSED'
														? 'var(--mantine-color-green-0)'
														: result.status === 'FAILED'
															? 'var(--mantine-color-red-0)'
															: 'var(--mantine-color-white)',
											}}
											className={`${styles.testStatusListItem}${
												isSelected ? ` ${styles.testStatusItemSelected}` : ''
											}`}
										>
											<Group gap='xs' wrap='nowrap'>
												<StatusIcon status={result.status} />
												<div className={styles.testStatusListItemLabel}>
													<Tooltip
														label={formatAgentTestName(
															test?.name || result.testId
														)}
														disabled={(test?.name || result.testId).length < 32}
														withArrow
														position='top-start'
													>
														<Text size='sm' fw={500} truncate>
															{formatAgentTestName(test?.name || result.testId)}
														</Text>
													</Tooltip>
												</div>
												<StatusBadge status={result.status} t={t} />
												{/* Hover-reveal actions */}
												<div className={styles.testStatusItemHoverActions}>
													<Tooltip label={t('testStatus.retryTest')}>
														<ActionIcon
															aria-label={t('testStatus.retryTest')}
															size='xs'
															variant='subtle'
															disabled={isRetrying}
															onClick={(e) => {
																e.stopPropagation();
																onRetryTest(
																	result.testId,
																	selectedRetryAgentId || undefined
																);
															}}
														>
															<IconRefresh size={13} />
														</ActionIcon>
													</Tooltip>
													<Tooltip label={t('testStatus.editTest')}>
														<ActionIcon
															aria-label={t('testStatus.editTest')}
															size='xs'
															variant='subtle'
															disabled={isTransitioning}
															onClick={(e) => {
																e.stopPropagation();
																onEditTest(test?.id || result.testId);
															}}
														>
															<IconPencil size={13} />
														</ActionIcon>
													</Tooltip>
												</div>
											</Group>
										</div>
									);
								})
							)}
						</Stack>
					</Stack>

					{/* ── Right pane ────────────────────────────────────── */}
					<Stack
						gap='xs'
						style={{
							minHeight: 0,
							overflow: 'hidden',
							borderLeft: '1px solid var(--mantine-color-gray-2)',
							paddingLeft: 'var(--mantine-spacing-sm)',
						}}
					>
						<Text fw={600} size='sm'>
							{t('testStatus.evaluation')}
						</Text>

						{showLoadingState ? (
							// Loading state — contextual empty state
							<div className={styles.testStatusEmptyLoading}>
								<div className={styles.testStatusEmptyLoadingIcon}>
									<ThemeIcon size={44} color='blue' variant='light' radius='xl'>
										<IconFlask size={22} />
									</ThemeIcon>
								</div>
								<Stack gap={4} align='center'>
									<Text size='sm' fw={500}>
										{t('testStatus.waitingTitle')}
									</Text>
									<Text size='xs' c='dimmed' ta='center' maw={260}>
										{t('testStatus.waitingSubtitle')}
									</Text>
									<Text size='xs' c='dimmed' ta='center' maw={300}>
										{activeRunningTest
											? t('testStatus.nowRunningLabel', {
													name: formatAgentTestName(activeRunningTest.name),
												})
											: t('testStatus.preparingFirstTest')}
									</Text>
								</Stack>
							</div>
						) : !selectedTest ? (
							// No test selected
							<Center h={300}>
								<Text size='sm' c='dimmed' ta='center' maw={220}>
									{t('testStatus.selectTest')}
								</Text>
							</Center>
						) : (
							// Test detail
							<Stack
								gap='xs'
								h='100%'
								style={{ minHeight: 0, overflow: 'auto' }}
							>
								{/* Test name + status header */}
								<Group justify='space-between' align='center' wrap='nowrap'>
									<Group gap={6} style={{ minWidth: 0 }}>
										<StatusIcon status={selectedStatus} />
										<Text size='sm' fw={600} truncate>
											{selectedTestDisplayName}
										</Text>
										<Tooltip label={t('testStatus.editTest')}>
											<ActionIcon
												aria-label={t('testStatus.editTest')}
												size='xs'
												variant='subtle'
												color='gray'
												disabled={isTransitioning || !selectedTest.metadata?.id}
												onClick={() => {
													if (selectedTest.metadata?.id) {
														onEditTest(selectedTest.metadata.id);
													}
												}}
											>
												<IconPencil size={13} />
											</ActionIcon>
										</Tooltip>
									</Group>
									<Badge size='sm' variant='light' color={selectedColor}>
										{selectedStatus === 'PASSED'
											? t('testStatus.passed')
											: selectedStatus === 'FAILED'
												? t('testStatus.failed')
												: t('testStatus.pending')}
									</Badge>
								</Group>

								{/* Success condition callout */}
								{selectedTest.metadata?.successCondition && (
									<Box className={styles.testStatusSuccessCondition}>
										<Text
											size='xs'
											fw={600}
											c='blue.7'
											tt='uppercase'
											style={{ letterSpacing: '0.04em' }}
										>
											{t('testStatus.successConditionLabel')}
										</Text>
										<Text size='xs' c='blue.9'>
											{selectedTest.metadata.successCondition}
										</Text>
									</Box>
								)}

								{/* AI judgment rationale */}
								{selectedTest.result?.rationale && (
									<div className={styles.testStatusRationale}>
										<ThemeIcon
											size='xs'
											color='yellow.7'
											variant='transparent'
											style={{ flexShrink: 0, marginTop: 2 }}
										>
											<IconBulb size={13} />
										</ThemeIcon>
										<Stack gap={2}>
											<Text
												size='xs'
												fw={600}
												c='yellow.8'
												tt='uppercase'
												style={{ letterSpacing: '0.04em' }}
											>
												{t('testStatus.rationaleLabel')}
											</Text>
											<Text size='xs' c='yellow.9'>
												{selectedTest.result.rationale}
											</Text>
										</Stack>
									</div>
								)}

								{/* Conversation replay */}
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
