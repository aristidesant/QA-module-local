import { useState } from 'react';
import {
	Alert,
	Badge,
	Box,
	Button,
	Group,
	List,
	Loader,
	Modal,
	ScrollArea,
	Stepper,
	Text,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import type { AgentBehavior } from '~/models/AgentBehavior';
import {
	useCleanupContinuity,
	useProcessReplaceJob,
	useReplaceJob,
	useRestoreAgentBehaviorFromBackup,
	useRestoreFromBackupCheck,
} from '~/queries/useAgentBehaviors';
import ReplaceJobProgress from '../ReplaceJobProgress';

interface RestoreFromBackupModalProps {
	opened: boolean;
	onClose: () => void;
	sourceBehavior: AgentBehavior | null;
}

const RestoreFromBackupModal: React.FC<RestoreFromBackupModalProps> = ({
	opened,
	onClose,
	sourceBehavior,
}) => {
	const { t } = useTranslation('campaign-predefined-params');
	const [activeStep, setActiveStep] = useState(0);
	const [jobId, setJobId] = useState<string | null>(null);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const { data: restoreCheck, isLoading: isLoadingRestoreCheck } =
		useRestoreFromBackupCheck(sourceBehavior?.id ?? '', {
			enabled: opened && !!sourceBehavior?.id,
		});

	const restoreMutation = useRestoreAgentBehaviorFromBackup();
	const processMutation = useProcessReplaceJob();
	const cleanupMutation = useCleanupContinuity();

	const { data: jobStatus, refetch } = useReplaceJob(jobId ?? '', {
		enabled: !!jobId,
		refetchInterval: (data) => {
			if (data?.status === 'COMPLETED' || data?.status === 'FAILED') {
				return false;
			}
			return 3000;
		},
	});

	const handleStartRestore = async () => {
		if (!sourceBehavior) return;

		try {
			setSubmitError(null);
			const response = await restoreMutation.mutateAsync(sourceBehavior.id);
			setJobId(response.jobId);
			setActiveStep(1);
		} catch (error) {
			const message =
				axios.isAxiosError(error) && error.response?.status === 400
					? t('restore.errors.badRequest')
					: t('restore.errors.default');
			setSubmitError(message);
		}
	};

	const handleProcessNow = async () => {
		if (!jobId) return;
		await processMutation.mutateAsync(jobId);
		void refetch();
	};

	const handleCleanup = async (campaignId: number) => {
		if (!jobId) return;
		await cleanupMutation.mutateAsync({ jobId, data: { campaignId } });
		void refetch();
	};

	const resetAndClose = () => {
		setActiveStep(0);
		setJobId(null);
		setSubmitError(null);
		onClose();
	};

	const isJobLocked =
		jobStatus?.status === 'PENDING' || jobStatus?.status === 'IN_PROGRESS';
	const canRestore = restoreCheck?.canRestore && restoreCheck.campaignCount > 0;

	return (
		<Modal
			opened={opened}
			onClose={isJobLocked ? () => {} : resetAndClose}
			title={t('restore.title', { name: sourceBehavior?.name ?? '' })}
			size='lg'
			centered
			closeOnClickOutside={false}
			withCloseButton={!isJobLocked}
		>
			<Stepper
				active={activeStep}
				onStepClick={setActiveStep}
				allowNextStepsSelect={false}
			>
				<Stepper.Step
					label={t('restore.steps.review.label')}
					description={t('restore.steps.review.description')}
				>
					<Box py='md'>
						<Group gap='xs' mb='md'>
							<Text size='sm' fw={600}>
								{t('restore.primaryLabel')}
							</Text>
							<Badge variant='light' color='gray'>
								{sourceBehavior?.name}
							</Badge>
						</Group>

						{submitError && (
							<Alert
								color='red'
								variant='light'
								icon={<IconAlertCircle size='1rem' />}
								mb='md'
							>
								{submitError}
							</Alert>
						)}

						{isLoadingRestoreCheck ? (
							<Loader size='sm' />
						) : !canRestore ? (
							<Alert color='blue' variant='light'>
								{t('restore.noCampaigns')}
							</Alert>
						) : (
							<>
								<Text size='sm' mb='sm'>
									{t('restore.campaignSummary', {
										count: restoreCheck.campaignCount,
									})}
								</Text>
								<ScrollArea h={200} type='auto'>
									<List size='xs' spacing='xs'>
										{restoreCheck.campaigns.map((campaign) => (
											<List.Item key={campaign.id}>
												<Group gap='xs'>
													<Text size='xs'>{campaign.name}</Text>
													{campaign.currentConfigId && (
														<Text size='xs' c='dimmed'>
															{t('restore.currentConfig', {
																id: campaign.currentConfigId,
															})}
														</Text>
													)}
												</Group>
											</List.Item>
										))}
									</List>
								</ScrollArea>
							</>
						)}

						<Group justify='flex-end' gap='xs' mt='xl'>
							<Button variant='default' onClick={resetAndClose}>
								{t('actions.cancel', { ns: 'common' })}
							</Button>
							<Button
								color='teal'
								loading={restoreMutation.isPending}
								disabled={!canRestore}
								onClick={handleStartRestore}
							>
								{t('restore.actions.start')}
							</Button>
						</Group>
					</Box>
				</Stepper.Step>

				<Stepper.Step
					label={t('restore.steps.progress.label')}
					description={t('restore.steps.progress.description')}
				>
					<Box py='md'>
						{!jobStatus ? (
							<Loader size='sm' />
						) : (
							<>
								<ReplaceJobProgress
									jobStatus={jobStatus}
									isProcessing={processMutation.isPending}
									isCleaningUp={cleanupMutation.isPending}
									onProcessNow={handleProcessNow}
									onCleanup={handleCleanup}
								/>
								<Group justify='flex-end' mt='xl'>
									<Button
										variant='default'
										onClick={resetAndClose}
										disabled={isJobLocked}
									>
										{t('actions.close', { ns: 'common' })}
									</Button>
								</Group>
							</>
						)}
					</Box>
				</Stepper.Step>
			</Stepper>
		</Modal>
	);
};

export default RestoreFromBackupModal;
