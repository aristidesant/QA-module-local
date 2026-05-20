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
import type { AgentBehaviorCampaign } from '~/models/AgentBehavior';
import {
	useCampaignsForBehavior,
	useProcessReplaceJob,
	useReplaceAgentBehaviorWithBackup,
	useReplaceJob,
} from '~/queries/useAgentBehaviors';

interface ReplaceWithBackupModalProps {
	opened: boolean;
	onClose: () => void;
	sourceBehavior: AgentBehavior | null;
	allBehaviors: AgentBehavior[];
}

type CampaignsForBehaviorQueryResult =
	| AgentBehaviorCampaign[]
	| {
			data?: AgentBehaviorCampaign[];
			campaigns?: AgentBehaviorCampaign[];
	  };

const normalizeCampaigns = (
	campaigns: CampaignsForBehaviorQueryResult | undefined
): AgentBehaviorCampaign[] => {
	if (Array.isArray(campaigns)) {
		return campaigns;
	}

	if (Array.isArray(campaigns?.data)) {
		return campaigns.data;
	}

	if (Array.isArray(campaigns?.campaigns)) {
		return campaigns.campaigns;
	}

	return [];
};

const ReplaceWithBackupModal: React.FC<ReplaceWithBackupModalProps> = ({
	opened,
	onClose,
	sourceBehavior,
	allBehaviors,
}) => {
	const { t } = useTranslation('campaign-predefined-params');
	const [activeStep, setActiveStep] = useState(0);
	const [jobId, setJobId] = useState<string | null>(null);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const backupBehavior = allBehaviors.find(
		(behavior) => behavior.id === sourceBehavior?.backupBehaviorId
	);

	const { data: campaignsRaw, isLoading: isLoadingCampaigns } =
		useCampaignsForBehavior(sourceBehavior?.id ?? '', {
			enabled: !!sourceBehavior && opened,
		});
	const campaigns = normalizeCampaigns(campaignsRaw);

	const replaceMutation = useReplaceAgentBehaviorWithBackup();
	const processMutation = useProcessReplaceJob();

	const { data: jobStatus, refetch } = useReplaceJob(jobId ?? '', {
		enabled: !!jobId,
		refetchInterval: (data) => {
			if (data?.status === 'COMPLETED' || data?.status === 'FAILED') {
				return false;
			}
			return 3000;
		},
	});

	const handleStartReplace = async () => {
		if (!sourceBehavior) return;

		try {
			setSubmitError(null);
			const response = await replaceMutation.mutateAsync(sourceBehavior.id);
			setJobId(response.jobId);
			setActiveStep(1);
		} catch (error) {
			const message =
				axios.isAxiosError(error) && error.response?.status === 400
					? t('backupReplace.errors.badRequest')
					: t('backupReplace.errors.default');
			setSubmitError(message);
		}
	};

	const handleProcessNow = async () => {
		if (!jobId) return;
		await processMutation.mutateAsync(jobId);
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

	return (
		<Modal
			opened={opened}
			onClose={isJobLocked ? () => {} : resetAndClose}
			title={t('backupReplace.title', { name: sourceBehavior?.name ?? '' })}
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
					label={t('backupReplace.steps.review.label')}
					description={t('backupReplace.steps.review.description')}
				>
					<Box py='md'>
						<Group gap='xs' mb='sm'>
							<Text size='sm' fw={600}>
								{t('backupReplace.sourceLabel')}
							</Text>
							<Badge variant='light' color='gray'>
								{sourceBehavior?.name}
							</Badge>
						</Group>
						<Group gap='xs' mb='md'>
							<Text size='sm' fw={600}>
								{t('backupReplace.backupLabel')}
							</Text>
							<Badge variant='light' color='teal'>
								{backupBehavior?.name ?? t('backupReplace.missingBackup')}
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

						{isLoadingCampaigns ? (
							<Loader size='sm' />
						) : campaigns.length === 0 ? (
							<Alert color='blue' variant='light'>
								{t('backupReplace.noCampaigns')}
							</Alert>
						) : (
							<>
								<Text size='sm' mb='sm'>
									{t('backupReplace.campaignSummary', {
										count: campaigns.length,
									})}
								</Text>
								<ScrollArea h={200} type='auto'>
									<List size='xs' spacing='xs'>
										{campaigns.map((campaign) => (
											<List.Item key={campaign.id}>{campaign.name}</List.Item>
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
								loading={replaceMutation.isPending}
								disabled={!backupBehavior || campaigns.length === 0}
								onClick={handleStartReplace}
							>
								{t('backupReplace.actions.start')}
							</Button>
						</Group>
					</Box>
				</Stepper.Step>

				<Stepper.Step
					label={t('backupReplace.steps.progress.label')}
					description={t('backupReplace.steps.progress.description')}
				>
					<Box py='md'>
						{!jobStatus ? (
							<Loader size='sm' />
						) : (
							<>
								<Group mb='md'>
									<Text fw={600}>{t('backupReplace.statusLabel')}</Text>
									<Badge
										color={
											jobStatus.status === 'COMPLETED'
												? 'green'
												: jobStatus.status === 'FAILED'
													? 'red'
													: jobStatus.status === 'IN_PROGRESS'
														? 'blue'
														: 'yellow'
										}
									>
										{jobStatus.status}
									</Badge>
									<Text size='xs' c='dimmed'>
										{t('backupReplace.progressCount', {
											succeeded: jobStatus.succeededCount ?? 0,
											total: jobStatus.totalCount,
										})}
									</Text>
								</Group>

								{jobStatus.status === 'PENDING' && (
									<Alert
										icon={<IconAlertCircle size='1rem' />}
										title={t('backupReplace.pending.title')}
										mb='md'
									>
										<Text size='sm'>
											{t('backupReplace.pending.description')}
										</Text>
										<Group mt='sm'>
											<Button
												size='xs'
												variant='light'
												onClick={handleProcessNow}
												loading={processMutation.isPending}
											>
												{t('backupReplace.actions.processNow')}
											</Button>
										</Group>
									</Alert>
								)}

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

export default ReplaceWithBackupModal;
