import { useEffect, useMemo, useState } from 'react';
import {
	Modal,
	Group,
	Button,
	Stack,
	Text,
	SimpleGrid,
	Loader,
	Center,
	ActionIcon,
} from '@mantine/core';
import { IconRefresh, IconCircleX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { AgentTest, RunAgentTestsResponse } from '~/models/AgentTestModel';
import styles from '../../AgentTestsPage.module.css';

interface TestStatusModalProps {
	isOpen: boolean;
	onClose: () => void;
	testStatusData: RunAgentTestsResponse | null;
	testList: AgentTest[];
	isLoading: boolean;
	testName: string;
	onRetryFailed: () => void;
	onRetryAll: () => void;
	isRetrying: boolean;
}

export const TestStatusModal: React.FC<TestStatusModalProps> = ({
	isOpen,
	onClose,
	testStatusData,
	testList,
	isLoading,
	testName,
	onRetryFailed,
	onRetryAll,
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

	// Auto-select first failed test when modal opens or data updates
	useEffect(() => {
		if (failedTests.length > 0 && !selectedTestId) {
			setSelectedTestId(failedTests[0].testId);
		}
	}, [failedTests, selectedTestId]);

	// Get selected test details
	const selectedTest = useMemo(() => {
		if (!selectedTestId) return null;
		const testResult = testStatusData?.results?.find(
			(r) => r.testId === selectedTestId
		);
		const testMetadata = testList.find((t) => t.id === selectedTestId);
		return { result: testResult, metadata: testMetadata };
	}, [selectedTestId, testStatusData?.results, testList]);

	const isCompleted = testStatusData?.status === 'COMPLETED';
	const showLoadingState = isLoading || !isCompleted;

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
				{/* Header with buttons */}
				<Group justify='space-between' mb='sm'>
					<div />
					<Group gap='xs'>
						{isCompleted && (
							<>
								<Button
									variant='light'
									size='sm'
									onClick={onRetryFailed}
									disabled={failedTests.length === 0 || isRetrying}
									loading={isRetrying}
								>
									{t('testStatus.retryFailed')}
								</Button>
								<Button
									variant='light'
									size='sm'
									onClick={onRetryAll}
									disabled={isRetrying}
									loading={isRetrying}
								>
									{t('testStatus.retryAll')}
								</Button>
							</>
						)}
					</Group>
				</Group>

				{/* Two-pane layout */}
				<SimpleGrid cols={2} spacing='xs' h='100%' style={{ minHeight: 0 }}>
					{/* Left pane - Failed Tests List */}
					<Stack gap='xs' style={{ minHeight: 0, overflow: 'auto' }}>
						<Text fw={600} size='sm'>
							{t('testStatus.failedTests', { count: failedTests.length })}
						</Text>

						{showLoadingState ? (
							<Center h={300}>
								<Loader size='sm' />
							</Center>
						) : failedTests.length === 0 ? (
							<Center h={300}>
								<Text size='sm' c='dimmed'>
									All tests passed!
								</Text>
							</Center>
						) : (
							<Stack gap='xs' style={{ overflow: 'auto', flex: 1 }}>
								{failedTests.map((result) => {
									const test = testList.find((t) => t.id === result.testId);
									const isSelected = selectedTestId === result.testId;

									return (
										<div
											key={result.testId}
											onClick={() => setSelectedTestId(result.testId)}
											style={{
												padding: 'var(--mantine-spacing-xs)',
												border: '1px solid var(--mantine-color-gray-2)',
												borderRadius: 'var(--mantine-radius-md)',
												cursor: 'pointer',
												backgroundColor: isSelected
													? 'var(--mantine-color-blue-0)'
													: 'var(--mantine-color-white)',
												borderColor: isSelected
													? 'var(--mantine-color-blue-3)'
													: 'var(--mantine-color-gray-2)',
											}}
										>
											<Group gap='xs' wrap='nowrap'>
												<IconCircleX
													size={20}
													style={{
														color: 'var(--mantine-color-red-6)',
														flexShrink: 0,
													}}
												/>
												<div style={{ flex: 1, minWidth: 0 }}>
													<Text size='sm' fw={500} truncate>
														{(test?.name || result.testId).split('##')[0]}
													</Text>
												</div>
												<ActionIcon
													size='xs'
													variant='subtle'
													onClick={(e) => {
														e.stopPropagation();
														// This will be handled by retry logic
													}}
												>
													<IconRefresh size={14} />
												</ActionIcon>
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
							{selectedTest?.metadata && (
								<Button
									variant='light'
									size='xs'
									onClick={() => {
										// Will be implemented to open edit modal
									}}
								>
									{t('testStatus.editTest')}
								</Button>
							)}
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
							<Stack gap='sm'>
								{/* Test Name */}
								<div
									style={{
										padding: 'var(--mantine-spacing-sm)',
										border: '1px solid var(--mantine-color-gray-2)',
										borderRadius: 'var(--mantine-radius-md)',
										backgroundColor: 'var(--mantine-color-gray-0)',
									}}
								>
									<Text size='xs' c='dimmed' mb='xs'>
										Test Information
									</Text>
									<Text size='sm' fw={500}>
										{selectedTest.metadata?.name?.split('##')[0]}
									</Text>
									<Text size='xs' c='dimmed' mt='xs'>
										ID: {selectedTest.result?.testId}
									</Text>
								</div>

								{/* Expected Response */}
								<div
									style={{
										padding: 'var(--mantine-spacing-sm)',
										border: '1px solid var(--mantine-color-gray-2)',
										borderRadius: 'var(--mantine-radius-md)',
										backgroundColor: 'var(--mantine-color-gray-0)',
									}}
								>
									<Text size='xs' c='dimmed' mb='xs'>
										{t('testStatus.expectedResponse')}
									</Text>
									<Text
										size='sm'
										style={{
											whiteSpace: 'pre-wrap',
											wordBreak: 'break-word',
										}}
									>
										{selectedTest.metadata?.successCondition ||
											selectedTest.metadata?.expectedResponse ||
											'N/A'}
									</Text>
								</div>

								{/* Actual Response */}
								<div
									style={{
										padding: 'var(--mantine-spacing-sm)',
										border: '1px solid var(--mantine-color-red-2)',
										borderRadius: 'var(--mantine-radius-md)',
										backgroundColor: 'var(--mantine-color-red-0)',
									}}
								>
									<Text size='xs' c='red' mb='xs' fw={500}>
										{t('testStatus.actualResponse')}
									</Text>
									<Text
										size='sm'
										c='red'
										style={{
											whiteSpace: 'pre-wrap',
											wordBreak: 'break-word',
										}}
									>
										{selectedTest.result?.actual || 'N/A'}
									</Text>
								</div>
							</Stack>
						)}
					</Stack>
				</SimpleGrid>
			</Stack>
		</Modal>
	);
};
