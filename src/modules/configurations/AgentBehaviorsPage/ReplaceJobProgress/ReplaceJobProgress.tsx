import {
	Accordion,
	Alert,
	Badge,
	Button,
	Group,
	List,
	Text,
} from '@mantine/core';
import { IconAlertCircle, IconPlayerPlay } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { AgentBehaviorReplaceJob } from '~/models/AgentBehavior';

interface ReplaceJobProgressProps {
	jobStatus: AgentBehaviorReplaceJob;
	isProcessing?: boolean;
	isCleaningUp?: boolean;
	onProcessNow: () => void;
	onCleanup?: (campaignId: number) => void;
}

const getStatusColor = (status: AgentBehaviorReplaceJob['status']) => {
	if (status === 'COMPLETED') return 'green';
	if (status === 'FAILED') return 'red';
	if (status === 'IN_PROGRESS') return 'blue';
	return 'yellow';
};

const getFriendlyErrorKey = (error: string) => {
	const normalizedError = error.toLowerCase();

	if (
		normalizedError.includes('tts.speed') ||
		(normalizedError.includes('conversation config') &&
			normalizedError.includes('1.2'))
	) {
		return 'replaceJob.report.errors.ttsSpeed';
	}

	if (
		normalizedError.includes('validation_error') ||
		normalizedError.includes('invalid_parameters')
	) {
		return 'replaceJob.report.errors.invalidConfig';
	}

	return 'replaceJob.report.errors.default';
};

const ReplaceJobProgress: React.FC<ReplaceJobProgressProps> = ({
	jobStatus,
	isProcessing,
	isCleaningUp,
	onProcessNow,
	onCleanup,
}) => {
	const { t } = useTranslation('campaign-predefined-params');
	const canProcess =
		jobStatus.status === 'PENDING' || jobStatus.status === 'FAILED';
	const failedCount =
		jobStatus.failedCount ?? jobStatus.report?.failed.length ?? 0;
	const hasFailedCampaigns = failedCount > 0;
	const displayStatus =
		jobStatus.status === 'COMPLETED' && hasFailedCampaigns
			? t('replaceJob.status.completedWithIssues')
			: t(`replaceJob.status.${jobStatus.status}`);
	const displayStatusColor =
		jobStatus.status === 'COMPLETED' && hasFailedCampaigns
			? 'yellow'
			: getStatusColor(jobStatus.status);

	return (
		<div>
			<Group mb='md' gap='xs'>
				<Text fw={600}>{t('replaceJob.statusLabel')}</Text>
				<Badge color={displayStatusColor}>{displayStatus}</Badge>
				{jobStatus.operation && (
					<Badge color='gray' variant='light'>
						{t(`replaceJob.operation.${jobStatus.operation}`)}
					</Badge>
				)}
				<Text size='xs' c='dimmed'>
					{t('replaceJob.progressCount', {
						succeeded: jobStatus.succeededCount ?? 0,
						total: jobStatus.totalCount,
					})}
				</Text>
			</Group>

			{jobStatus.errorMessage && (
				<Alert
					icon={<IconAlertCircle size='1rem' />}
					color='red'
					variant='light'
					mb='md'
				>
					{jobStatus.errorMessage}
				</Alert>
			)}

			{canProcess && (
				<Alert
					icon={<IconAlertCircle size='1rem' />}
					title={
						jobStatus.status === 'FAILED'
							? t('replaceJob.failed.title')
							: t('replaceJob.pending.title')
					}
					mb='md'
				>
					<Text size='sm'>
						{jobStatus.status === 'FAILED'
							? t('replaceJob.failed.description')
							: t('replaceJob.pending.description')}
					</Text>
					<Group mt='sm'>
						<Button
							size='sm'
							variant='filled'
							color={jobStatus.status === 'FAILED' ? 'red' : 'green'}
							leftSection={<IconPlayerPlay size={14} />}
							onClick={onProcessNow}
							loading={isProcessing}
						>
							{t('replaceJob.actions.processNow')}
						</Button>
					</Group>
				</Alert>
			)}

			{jobStatus.report && (
				<Accordion variant='contained' mt='md'>
					{jobStatus.report.failed.length > 0 && (
						<Accordion.Item value='failed'>
							<Accordion.Control>
								<Text c='red' fw={500}>
									{t('replaceJob.report.failed', {
										count: jobStatus.report.failed.length,
									})}
								</Text>
							</Accordion.Control>
							<Accordion.Panel>
								<List size='xs' spacing='xs'>
									{jobStatus.report.failed.map((item, index) => (
										<List.Item key={item.campaignId}>
											<Text fw={500}>
												{t('replaceJob.report.campaignNeedsAttention', {
													index: index + 1,
												})}
											</Text>
											<Text c='dimmed'>
												{t(getFriendlyErrorKey(item.error))}
											</Text>
											{item.cleanupRequired && onCleanup && (
												<Button
													size='compact-xs'
													color='red'
													mt='xs'
													onClick={() => onCleanup(item.campaignId)}
													loading={isCleaningUp}
												>
													{t('replaceJob.actions.cleanup')}
												</Button>
											)}
										</List.Item>
									))}
								</List>
							</Accordion.Panel>
						</Accordion.Item>
					)}
					{jobStatus.report.succeeded.length > 0 && (
						<Accordion.Item value='succeeded'>
							<Accordion.Control>
								<Text c='green' fw={500}>
									{t('replaceJob.report.succeeded', {
										count: jobStatus.report.succeeded.length,
									})}
								</Text>
							</Accordion.Control>
							<Accordion.Panel>
								<Text size='sm' c='dimmed'>
									{t('replaceJob.report.succeededDescription', {
										count: jobStatus.report.succeeded.length,
									})}
								</Text>
							</Accordion.Panel>
						</Accordion.Item>
					)}
				</Accordion>
			)}
		</div>
	);
};

export default ReplaceJobProgress;
