import React, { useState } from 'react';
import { isAxiosError } from 'axios';
import {
	Button,
	Group,
	Stack,
	Box,
	Text,
	Modal,
	Badge,
	ThemeIcon,
	Center,
	Loader,
	SegmentedControl,
	Card,
	ScrollArea,
	TextInput,
	ActionIcon,
	Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import {
	IconPlus,
	IconNetwork,
	IconCheck,
	IconCopy,
	IconSearch,
	IconRefresh,
	IconEye,
} from '@tabler/icons-react';
import { useCampaignWizardStore } from '~/stores/campaignWizardStore';
import { useDispositionBuilderStore } from '~/modules/campaigns/CampaignsForm/DispositionSection/dispositionStore';
import DispositionForm from '~/modules/campaigns/CampaignsForm/DispositionSection/DispositionForm';
import DispositionViewer from '~/modules/campaigns/CampaignsForm/DispositionSection/DispositionViewer';
import {
	useCreateDispositionFlow,
	useCampaignsWithDispositionFlow,
	useCopyDispositionFlow,
	useDispositionFlow,
	useDeleteDispositionFlow,
} from '~/queries/dispositionFlowQueries';
import useDispositionLabel from '~/hooks/useDispositionLabel';
import styles from './StepThreeOutcomes.module.css';
import sharedStyles from '../CampaignWizard.module.css';

interface StepThreeOutcomesProps {
	onNext: () => void;
	onBack: () => void;
}

export const StepThreeOutcomes: React.FC<StepThreeOutcomesProps> = ({
	onNext,
	onBack,
}) => {
	const { createdCampaign, setIsSubmitting, setHasOutcomeFlow } =
		useCampaignWizardStore();

	const [modalOpened, setModalOpened] = useState(false);
	const [previewModalOpened, setPreviewModalOpened] = useState(false);
	const [previewFlowId, setPreviewFlowId] = useState<number | null>(null);
	const [previewCampaignName, setPreviewCampaignName] = useState('');
	const [hasCreatedFlow, setHasCreatedFlow] = useState(false);
	const [flowMode, setFlowMode] = useState<'create' | 'import'>('create');
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedFlowId, setSelectedFlowId] = useState<number | null>(null);
	const [importedFlowName, setImportedFlowName] = useState('');
	const [copiedFlowId, setCopiedFlowId] = useState<number | null>(null);
	const [copyingFlowId, setCopyingFlowId] = useState<number | null>(null);

	const updateCampaign = useCreateDispositionFlow();
	const {
		data: campaignsWithFlows,
		isLoading: isLoadingCampaigns,
		isFetching: isFetchingCampaigns,
		refetch: refetchCampaigns,
	} = useCampaignsWithDispositionFlow(flowMode === 'import');
	const copyDispositionFlow = useCopyDispositionFlow();
	const deleteDispositionFlow = useDeleteDispositionFlow();
	const { data: previewFlow, isLoading: isLoadingPreviewFlow } =
		useDispositionFlow(previewFlowId ?? undefined);
	const queryClient = useQueryClient();
	const dispositionLabel = useDispositionLabel();

	const { flowJson, setDispositionFlow, setFlowJson, setCampaignId } =
		useDispositionBuilderStore();

	const handleOpenModal = () => {
		// Initialize disposition builder for new campaign
		setDispositionFlow({});
		setFlowJson({});
		setCampaignId(createdCampaign?.id);
		setModalOpened(true);
	};

	const handleCloseModal = () => {
		setModalOpened(false);
		// Keep the flow data in store for potential re-editing
	};

	const handleFlowComplete = () => {
		setHasCreatedFlow(true);
		setHasOutcomeFlow(true); // Sync with wizard store
		setModalOpened(false);
		notifications.show({
			title: 'Outcome Flow Created',
			message:
				'Your outcome flow has been created successfully. Click "Save & Continue" to proceed.',
			color: 'green',
		});
	};

	const handleImportFlow = async (flowId: number, campaignName: string) => {
		if (!createdCampaign?.id) {
			notifications.show({
				title: 'Error',
				message: 'Campaign not found. Please start from step 1.',
				color: 'red',
			});
			return;
		}

		setCopyingFlowId(flowId);

		try {
			const response = await copyDispositionFlow.mutateAsync({
				sourceFlowId: flowId,
				targetCampaignId: createdCampaign.id,
			});

			// Store the copied flow ID for potential deletion on "Start Over"
			if (response.flow?.id) {
				setCopiedFlowId(response.flow.id);
				// Set preview flow ID so user can preview it later
				setPreviewFlowId(response.flow.id);
			}

			setSelectedFlowId(flowId);
			setImportedFlowName(campaignName);
			setHasCreatedFlow(true);
			setHasOutcomeFlow(true); // Sync with wizard store

			notifications.show({
				title: 'Outcome Flow Imported',
				message: `Successfully imported outcome flow from "${campaignName}".`,
				color: 'green',
			});
		} catch (error) {
			let errorMessage = 'Failed to import outcome flow';
			if (isAxiosError(error)) {
				errorMessage = error.response?.data?.message || errorMessage;
			} else if (error instanceof Error) {
				errorMessage = error.message;
			}
			notifications.show({
				title: 'Import Failed',
				message: errorMessage,
				color: 'red',
			});
		} finally {
			setCopyingFlowId(null);
		}
	};

	// Handle preview flow - opens modal with DispositionViewer
	const handlePreviewFlow = (flowId: number, campaignName: string) => {
		setPreviewFlowId(flowId);
		setPreviewCampaignName(campaignName);
		setPreviewModalOpened(true);
	};

	// Handle start over - delete the copied flow if exists
	const handleStartOver = async () => {
		if (copiedFlowId) {
			try {
				await deleteDispositionFlow.mutateAsync(copiedFlowId);
				notifications.show({
					title: 'Flow Removed',
					message: 'The imported flow has been removed.',
					color: 'blue',
				});
			} catch (error) {
				notifications.show({
					title: 'Error',
					message: 'Failed to remove the imported flow. Please try again.',
					color: 'red',
				});
				return;
			}
		}

		setHasCreatedFlow(false);
		setHasOutcomeFlow(false); // Sync with wizard store
		setSelectedFlowId(null);
		setImportedFlowName('');
		setCopiedFlowId(null);
		setPreviewFlowId(null);
	};

	// Filter campaigns that have a disposition flow and match search query
	// Note: API may return campaigns without flows, so we filter by flowId
	const filteredCampaigns = campaignsWithFlows
		?.filter((campaign) => campaign.flowId !== null)
		.filter((campaign) =>
			campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
		);

	const handleSubmit = async () => {
		if (!createdCampaign?.id) {
			notifications.show({
				title: 'Error',
				message: 'Campaign not found. Please start from step 1.',
				color: 'red',
			});
			return;
		}

		if (!hasCreatedFlow || !flowJson || Object.keys(flowJson).length === 0) {
			notifications.show({
				title: 'No Outcome Flow',
				message: 'Please create an outcome flow before continuing.',
				color: 'orange',
			});
			return;
		}

		setIsSubmitting(true);

		try {
			// Create disposition flow for the campaign
			await updateCampaign.mutateAsync({
				flowJson: flowJson as any, // Type assertion for now
				campaignId: createdCampaign.id,
			});

			setIsSubmitting(false);

			// Invalidate related queries
			queryClient.invalidateQueries({
				queryKey: ['dispositionFlows', 'campaign', createdCampaign.id],
			});
			queryClient.invalidateQueries({
				queryKey: ['dispositionFlows'],
			});

			notifications.show({
				title: 'Outcome Flow Saved',
				message: 'Outcome configuration saved successfully.',
				color: 'green',
			});

			onNext();
		} catch (error) {
			setIsSubmitting(false);
			notifications.show({
				title: 'Error',
				message:
					error instanceof Error
						? error.message
						: 'Failed to save outcome configuration',
				color: 'red',
			});
		}
	};

	// Count nodes in flow for summary
	const nodeCount = flowJson?.dispositionNodes?.length || 0;

	// Loading state check
	if (!createdCampaign) {
		return (
			<Center py='xl'>
				<Stack align='center' gap='md'>
					<Loader size='lg' />
					<Text c='dimmed'>Loading campaign data...</Text>
				</Stack>
			</Center>
		);
	}

	return (
		<>
			<Stack gap='xl' className={sharedStyles.stepSurface}>
				<Box className={sharedStyles.stepHeaderCard}>
					<Text className={sharedStyles.stepEyebrow}>Outcome routing</Text>
					<Text className={sharedStyles.stepTitle}>Design the flow</Text>
					<Text className={sharedStyles.stepDescriptionText}>
						Build a simple map that tells the system what to do after each
						conversation. Keep the experience consistent for every contact.
					</Text>
				</Box>

				{/* Outcomes Configuration Section */}
				<Box className={styles.sectionCard}>
					<div className={styles.sectionHeader}>
						<IconNetwork size={20} className={styles.sectionIcon} />
						<h3 className={styles.sectionTitle}>Outcome Configuration</h3>
					</div>
					<Text className={styles.sectionDescription}>
						{dispositionLabel(
							'Set up call outcomes for this campaign. Define how calls should be categorized and what actions to take based on different scenarios.'
						)}
					</Text>

					{hasCreatedFlow ? (
						// Show summary of created/imported flow
						<Box className={styles.flowSummary}>
							<Group gap='sm' mb='xs'>
								<ThemeIcon variant='light' color='green' size='sm'>
									<IconCheck size={16} />
								</ThemeIcon>
								<Text size='sm' fw={500}>
									{selectedFlowId
										? 'Outcome flow imported successfully'
										: 'Outcome flow created successfully'}
								</Text>
							</Group>
							<Group gap='xs' mb='md'>
								{selectedFlowId ? (
									<>
										<Badge variant='light' color='violet'>
											<Group gap={4}>
												<IconCopy size={12} />
												Imported
											</Group>
										</Badge>
										<Text size='xs' c='dimmed'>
											From: {importedFlowName}
										</Text>
									</>
								) : (
									<>
										<Badge variant='light' color='blue'>
											{nodeCount} {nodeCount === 1 ? 'outcome' : 'outcomes'}
										</Badge>
										<Text size='xs' c='dimmed'>
											Flow ready for campaign
										</Text>
									</>
								)}
							</Group>

							<Group gap='xs'>
								{selectedFlowId && copiedFlowId && (
									<Button
										variant='outline'
										size='sm'
										leftSection={<IconEye size={16} />}
										onClick={() =>
											handlePreviewFlow(copiedFlowId, importedFlowName)
										}
									>
										Preview Flow
									</Button>
								)}
								{!selectedFlowId && (
									<Button variant='outline' size='sm' onClick={handleOpenModal}>
										Edit Flow
									</Button>
								)}
								<Button
									variant='subtle'
									size='sm'
									color='gray'
									loading={deleteDispositionFlow.isPending}
									onClick={handleStartOver}
								>
									Start Over
								</Button>
							</Group>
						</Box>
					) : (
						// Show create/import flow interface
						<Stack gap='md'>
							<SegmentedControl
								value={flowMode}
								onChange={(value) => setFlowMode(value as 'create' | 'import')}
								data={[
									{
										label: (
											<Group gap='xs' justify='center'>
												<IconPlus size={16} />
												<span>Create New</span>
											</Group>
										),
										value: 'create',
									},
									{
										label: (
											<Group gap='xs' justify='center'>
												<IconCopy size={16} />
												<span>Import from Campaign</span>
											</Group>
										),
										value: 'import',
									},
								]}
								classNames={{ root: styles.segmentedControl }}
							/>

							{flowMode === 'create' ? (
								<Box className={styles.createFlowContainer}>
									<Center py='xl'>
										<Stack align='center' gap='md'>
											<ThemeIcon variant='light' color='blue' size='xl'>
												<IconNetwork size={32} />
											</ThemeIcon>
											<Stack align='center' gap='xs'>
												<Text fw={500}>No outcome flow configured</Text>
												<Text size='sm' c='dimmed' ta='center'>
													Create an outcome flow to define how calls should be
													categorized and processed in your campaign.
												</Text>
											</Stack>
											<Button
												leftSection={<IconPlus size={16} />}
												onClick={handleOpenModal}
												size='md'
											>
												{dispositionLabel('Create Outcome Flow')}
											</Button>
										</Stack>
									</Center>
								</Box>
							) : (
								<Box className={styles.importContainer}>
									<Stack gap='md'>
										<Group gap='xs'>
											<TextInput
												placeholder='Search campaigns...'
												leftSection={<IconSearch size={16} />}
												value={searchQuery}
												onChange={(e) => setSearchQuery(e.target.value)}
												classNames={{ input: styles.searchInput }}
												style={{ flex: 1 }}
											/>
											<Button
												variant='light'
												color='cyan'
												size='sm'
												loading={isFetchingCampaigns}
												onClick={() => refetchCampaigns()}
												leftSection={<IconRefresh size={16} />}
											>
												Refresh
											</Button>
										</Group>

										{isLoadingCampaigns ? (
											<Center py='xl'>
												<Loader size='md' />
											</Center>
										) : filteredCampaigns && filteredCampaigns.length > 0 ? (
											<ScrollArea.Autosize mah={300}>
												<Stack gap='xs'>
													{filteredCampaigns.map((campaign, index) => (
														<Card
															key={`${campaign.id}-${index}`}
															className={styles.campaignCard}
															padding='sm'
														>
															<Group justify='space-between' wrap='nowrap'>
																<Stack gap={2} style={{ flex: 1 }}>
																	<Text size='sm' fw={500} lineClamp={1}>
																		{campaign.name}
																	</Text>
																	<Group gap='xs'>
																		{(campaign.flowId ||
																			campaign.dispositionFlow) && (
																			<Badge
																				size='xs'
																				variant='light'
																				color='blue'
																			>
																				Outcome Flow
																			</Badge>
																		)}
																		{campaign.dispositionCatalog?.type && (
																			<Badge
																				size='xs'
																				variant='outline'
																				color='gray'
																			>
																				{campaign.dispositionCatalog.type}
																			</Badge>
																		)}
																	</Group>
																</Stack>
																<Group gap='xs'>
																	<Tooltip label='Preview flow'>
																		<ActionIcon
																			size='sm'
																			variant='subtle'
																			color='gray'
																			aria-label='Preview flow'
																			onClick={() => {
																				const flowId =
																					campaign.flowId ??
																					campaign.dispositionFlow?.id;
																				if (flowId) {
																					handlePreviewFlow(
																						flowId,
																						campaign.name
																					);
																				}
																			}}
																		>
																			<IconEye size={16} />
																		</ActionIcon>
																	</Tooltip>
																	<Button
																		size='xs'
																		variant='light'
																		leftSection={<IconCopy size={14} />}
																		loading={
																			copyingFlowId ===
																			(campaign.flowId ??
																				campaign.dispositionFlow?.id)
																		}
																		disabled={
																			copyingFlowId !== null &&
																			copyingFlowId !==
																				(campaign.flowId ??
																					campaign.dispositionFlow?.id)
																		}
																		onClick={() => {
																			// Prevent click while already copying
																			if (copyingFlowId !== null) return;
																			const flowId =
																				campaign.flowId ??
																				campaign.dispositionFlow?.id;
																			if (flowId) {
																				handleImportFlow(flowId, campaign.name);
																			}
																		}}
																	>
																		Use flow
																	</Button>
																</Group>
															</Group>
														</Card>
													))}
												</Stack>
											</ScrollArea.Autosize>
										) : (
											<Center py='xl'>
												<Stack align='center' gap='xs'>
													<ThemeIcon variant='light' color='gray' size='lg'>
														<IconNetwork size={20} />
													</ThemeIcon>
													<Text size='sm' c='dimmed' ta='center'>
														{searchQuery
															? 'No campaigns match your search'
															: 'No campaigns with outcome flows available'}
													</Text>
												</Stack>
											</Center>
										)}
									</Stack>
								</Box>
							)}
						</Stack>
					)}
				</Box>
			</Stack>

			<Group className={sharedStyles.actions}>
				<Button variant='default' onClick={onBack}>
					Back
				</Button>
				<Button
					type='button'
					loading={updateCampaign.isPending}
					disabled={!hasCreatedFlow || copyingFlowId !== null}
					onClick={selectedFlowId ? onNext : handleSubmit}
				>
					{selectedFlowId ? 'Continue' : 'Save & Continue'}
				</Button>
			</Group>

			{/* Disposition Form Modal */}
			<Modal
				opened={modalOpened}
				onClose={handleCloseModal}
				size='100vw'
				fullScreen
				withCloseButton={false}
				padding={0}
			>
				<DispositionForm
					onCancel={handleCloseModal}
					onComplete={handleFlowComplete}
				/>
			</Modal>

			{/* Preview Flow Modal */}
			<Modal
				opened={previewModalOpened}
				onClose={() => setPreviewModalOpened(false)}
				size='xl'
				title='Outcome Flow Preview'
				centered
				data-testid='modal-outcome-flow-preview'
				closeButtonProps={{ ['data-testid' as string]: 'modal-close-btn' }}
			>
				<Stack gap='md'>
					{!hasCreatedFlow && previewFlowId && (
						<Group justify='flex-end'>
							<Button
								leftSection={<IconCopy size={16} />}
								loading={copyingFlowId === previewFlowId}
								disabled={
									copyingFlowId !== null && copyingFlowId !== previewFlowId
								}
								onClick={() => {
									if (copyingFlowId !== null) return;
									handleImportFlow(previewFlowId, previewCampaignName);
									setPreviewModalOpened(false);
								}}
								data-testid='modal-use-flow-btn'
							>
								Use flow
							</Button>
						</Group>
					)}
					{isLoadingPreviewFlow ? (
						<Center py='xl'>
							<Loader size='md' />
						</Center>
					) : previewFlow ? (
						<DispositionViewer flow={previewFlow} />
					) : (
						<Center py='xl'>
							<Text c='dimmed'>No flow data available</Text>
						</Center>
					)}
				</Stack>
			</Modal>
		</>
	);
};
