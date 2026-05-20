import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Modal,
	Button,
	Text,
	Stepper,
	Select,
	Loader,
	Alert,
	List,
	Group,
	Box,
	ScrollArea,
} from '@mantine/core';
import {
	useCampaignsForBehavior,
	useReplaceAgentBehavior,
	useReplaceJob,
	useProcessReplaceJob,
	useCleanupContinuity,
} from '~/queries/useAgentBehaviors';
import type {
	AgentBehavior,
	AgentBehaviorCampaign,
} from '~/models/AgentBehavior';
import ReplaceJobProgress from '../ReplaceJobProgress';
import { isBackupBehavior } from '../utils/agentBehaviorHelpers';

interface BatchReplaceModalProps {
	opened: boolean;
	onClose: () => void;
	sourceBehavior: AgentBehavior | null;
	allBehaviors: AgentBehavior[];
}

const BatchReplaceModal: React.FC<BatchReplaceModalProps> = ({
	opened,
	onClose,
	sourceBehavior,
	allBehaviors,
}) => {
	const { t } = useTranslation('campaign-predefined-params');
	const [activeStep, setActiveStep] = useState(0);
	const [targetConfigId, setTargetConfigId] = useState<string | null>(null);
	const [jobId, setJobId] = useState<string | null>(null);

	const { data: campaignsRaw, isLoading: isLoadingCampaigns } =
		useCampaignsForBehavior(sourceBehavior?.id ?? '', {
			enabled: !!sourceBehavior && opened,
		});
	const campaigns = campaignsRaw ?? [];

	const replaceMutation = useReplaceAgentBehavior();
	const processMutation = useProcessReplaceJob();
	const cleanupMutation = useCleanupContinuity();

	// Poll job if we have a job ID and it's not completed/failed
	const { data: jobStatus, refetch } = useReplaceJob(jobId ?? '', {
		enabled: !!jobId,
		refetchInterval: (data) => {
			if (data?.status === 'COMPLETED' || data?.status === 'FAILED')
				return false;
			return 3000;
		},
	});

	const handleStartReplace = async () => {
		if (!sourceBehavior || !targetConfigId || !campaigns) return;
		const campaignIds = campaigns.map((campaign) => campaign.id);

		try {
			const res = await replaceMutation.mutateAsync({
				targetConfigId,
				campaignIds,
			});
			setJobId(res.jobId);
			setActiveStep(2);
		} catch (error) {
			// handled
		}
	};

	const handleProcessNow = async () => {
		if (!jobId) return;
		await processMutation.mutateAsync(jobId);
		refetch();
	};

	const handleCleanup = async (campaignId: number) => {
		if (!jobId) return;
		await cleanupMutation.mutateAsync({ jobId, data: { campaignId } });
		refetch();
	};

	const resetAndClose = () => {
		setActiveStep(0);
		setTargetConfigId(null);
		setJobId(null);
		onClose();
	};

	const availableTargets = allBehaviors
		.filter((b) => b.id !== sourceBehavior?.id && !isBackupBehavior(b))
		.map((b) => ({ value: b.id, label: b.name }));

	const renderCampaignItem = (campaign: AgentBehaviorCampaign) => (
		<List.Item key={campaign.id}>
			<Group gap='xs'>
				<Text size='xs'>{campaign.name}</Text>
				{campaign.isUsingBackupBehavior && (
					<Text size='xs' c='dimmed'>
						{t('replace.campaignState.onBackup')}
					</Text>
				)}
			</Group>
		</List.Item>
	);

	return (
		<Modal
			opened={opened}
			onClose={
				jobStatus &&
				(jobStatus.status === 'PENDING' || jobStatus.status === 'IN_PROGRESS')
					? () => {}
					: resetAndClose
			}
			title={`Batch Replace Behavior: ${sourceBehavior?.name}`}
			size='lg'
			closeOnClickOutside={false}
			withCloseButton={
				!jobStatus ||
				jobStatus.status === 'COMPLETED' ||
				jobStatus.status === 'FAILED'
			}
		>
			<Stepper
				active={activeStep}
				onStepClick={setActiveStep}
				allowNextStepsSelect={false}
			>
				<Stepper.Step label='Review' description='Campaigns'>
					<Box py='md'>
						{isLoadingCampaigns ? (
							<Loader size='sm' />
						) : !campaigns || campaigns.length === 0 ? (
							<Alert color='blue' title='No Campaigns Found'>
								There are no active campaigns currently using this behavior.
								Replacement is not necessary.
							</Alert>
						) : (
							<>
								<Text size='sm' mb='sm'>
									The following <b>{campaigns.length}</b> campaigns will be
									updated:
								</Text>
								<ScrollArea h={200} type='auto'>
									<List size='xs' spacing='xs'>
										{campaigns.map(renderCampaignItem)}
									</List>
								</ScrollArea>
								<Group justify='right' mt='md'>
									<Button onClick={() => setActiveStep(1)}>Next Step</Button>
								</Group>
							</>
						)}
					</Box>
				</Stepper.Step>

				<Stepper.Step label='Select Target' description='New Behavior'>
					<Box py='md'>
						<Select
							label='Target Behavior'
							description='Select the new behavior to apply to these campaigns.'
							placeholder='Select a behavior...'
							data={availableTargets}
							value={targetConfigId}
							onChange={setTargetConfigId}
							searchable
						/>
						<Group justify='space-between' mt='xl'>
							<Button variant='default' onClick={() => setActiveStep(0)}>
								Back
							</Button>
							<Button
								color='blue'
								disabled={!targetConfigId}
								loading={replaceMutation.isPending}
								onClick={handleStartReplace}
							>
								Start Replacement
							</Button>
						</Group>
					</Box>
				</Stepper.Step>

				<Stepper.Step label='Progress' description='Job Status'>
					<Box py='md'>
						{!jobStatus ? (
							<Loader size='sm' />
						) : (
							<div>
								<ReplaceJobProgress
									jobStatus={jobStatus}
									isProcessing={processMutation.isPending}
									isCleaningUp={cleanupMutation.isPending}
									onProcessNow={handleProcessNow}
									onCleanup={handleCleanup}
								/>

								<Group justify='right' mt='xl'>
									<Button
										variant='default'
										onClick={resetAndClose}
										disabled={
											jobStatus.status === 'IN_PROGRESS' ||
											jobStatus.status === 'PENDING'
										}
									>
										Close
									</Button>
								</Group>
							</div>
						)}
					</Box>
				</Stepper.Step>
			</Stepper>
		</Modal>
	);
};

export default BatchReplaceModal;
