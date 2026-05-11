import React, { useState } from 'react';
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
	Badge,
	Accordion,
	Box,
	ScrollArea,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import {
	useCampaignsForBehavior,
	useReplaceAgentBehavior,
	useReplaceJob,
	useProcessReplaceJob,
	useCleanupContinuity,
} from '~/queries/useAgentBehaviors';
import type { AgentBehavior } from '~/models/AgentBehavior';

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
	const [activeStep, setActiveStep] = useState(0);
	const [targetConfigId, setTargetConfigId] = useState<string | null>(null);
	const [jobId, setJobId] = useState<string | null>(null);

	const { data: campaignsRaw, isLoading: isLoadingCampaigns } =
		useCampaignsForBehavior(sourceBehavior?.id ?? '', {
			enabled: !!sourceBehavior && opened,
		});
	const campaigns = (
		Array.isArray(campaignsRaw)
			? campaignsRaw
			: (campaignsRaw as any)?.data || (campaignsRaw as any)?.campaigns || []
	) as any[];

	const replaceMutation = useReplaceAgentBehavior();
	const processMutation = useProcessReplaceJob();
	const cleanupMutation = useCleanupContinuity();

	// Poll job if we have a job ID and it's not completed/failed
	const { data: jobStatus, refetch } = useReplaceJob(jobId ?? '', {
		enabled: !!jobId,
		refetchInterval: (data: any) => {
			if (data?.status === 'COMPLETED' || data?.status === 'FAILED')
				return false;
			return 3000;
		},
	});

	const handleStartReplace = async () => {
		if (!sourceBehavior || !targetConfigId || !campaigns) return;
		const campaignIds = campaigns.map((c: any) => c.id);

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
		.filter((b) => b.id !== sourceBehavior?.id)
		.map((b) => ({ value: b.id, label: b.name }));

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
										{campaigns.map((c: any) => (
											<List.Item key={c.id}>{c.name}</List.Item>
										))}
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
								<Group mb='md'>
									<Text fw={600}>Status:</Text>
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
										({jobStatus.succeededCount ?? 0} / {jobStatus.totalCount}{' '}
										completed)
									</Text>
								</Group>

								{jobStatus.status === 'PENDING' && (
									<Alert
										icon={<IconAlertCircle size='1rem' />}
										title='Job Queued'
										mb='md'
									>
										This job has been scheduled to run automatically at
										midnight. You can also trigger it manually now.
										<Group mt='sm'>
											<Button
												size='xs'
												variant='light'
												onClick={handleProcessNow}
												loading={processMutation.isPending}
											>
												Process Now
											</Button>
										</Group>
									</Alert>
								)}

								{(jobStatus.status === 'COMPLETED' ||
									jobStatus.status === 'FAILED') &&
									jobStatus.report && (
										<Accordion variant='contained' mt='md'>
											{jobStatus.report.failed.length > 0 && (
												<Accordion.Item value='failed'>
													<Accordion.Control>
														<Group>
															<Text c='red' fw={500}>
																Failed ({jobStatus.report.failed.length})
															</Text>
														</Group>
													</Accordion.Control>
													<Accordion.Panel>
														<List size='xs' spacing='xs'>
															{jobStatus.report.failed.map((f) => (
																<List.Item key={f.campaignId}>
																	<Text>Campaign ID: {f.campaignId}</Text>
																	<Text c='dimmed'>{f.error}</Text>
																	{f.cleanupRequired && (
																		<Button
																			size='compact-xs'
																			color='red'
																			mt='xs'
																			onClick={() =>
																				handleCleanup(f.campaignId)
																			}
																			loading={cleanupMutation.isPending}
																		>
																			Run Continuity Cleanup
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
															Succeeded ({jobStatus.report.succeeded.length})
														</Text>
													</Accordion.Control>
													<Accordion.Panel>
														<List size='xs' spacing='xs'>
															{jobStatus.report.succeeded.map((s) => (
																<List.Item key={s.campaignId}>
																	Campaign ID: {s.campaignId}
																</List.Item>
															))}
														</List>
													</Accordion.Panel>
												</Accordion.Item>
											)}
										</Accordion>
									)}

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
