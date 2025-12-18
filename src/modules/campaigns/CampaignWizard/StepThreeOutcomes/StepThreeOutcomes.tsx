import React, { useState } from 'react';
import { isAxiosError } from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import {
	Button,
	Group,
	Stack,
	Box,
	Text,
	Modal,
	Center,
	Loader,
	SegmentedControl,
	ThemeIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconNetwork, IconCopy } from '@tabler/icons-react';
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
	useDispositionFlowsByCampaignPath,
} from '~/queries/dispositionFlowQueries';
import { useSetCampaignDraft } from '~/queries/campaignsQueries';
import useDispositionLabel from '~/hooks/useDispositionLabel';
import styles from './StepThreeOutcomes.module.css';
import sharedStyles from '../CampaignWizard.module.css';
import { FlowSummary, type FlowOrigin } from './components/FlowSummary';
import { ImportFlowPicker } from './components/ImportFlowPicker';

interface StepThreeOutcomesProps {
	onNext: () => void;
}

export const StepThreeOutcomes: React.FC<StepThreeOutcomesProps> = ({
	onNext,
}) => {
	const { createdCampaign, setHasOutcomeFlow } = useCampaignWizardStore();

	const [modalOpened, setModalOpened] = useState(false);
	const [previewModalOpened, setPreviewModalOpened] = useState(false);
	const [previewFlowId, setPreviewFlowId] = useState<number | null>(null);
	const [previewCampaignName, setPreviewCampaignName] = useState('');
	const [hasCreatedFlow, setHasCreatedFlow] = useState(false);
	const [flowMode, setFlowMode] = useState<'create' | 'import'>('create');
	const [searchQuery, setSearchQuery] = useState('');
	const [flowOrigin, setFlowOrigin] = useState<FlowOrigin | null>(null);
	const [importSourceCampaignName, setImportSourceCampaignName] =
		useState<string>('');
	const [copiedFlowId, setCopiedFlowId] = useState<number | null>(null);
	const [copyingFlowId, setCopyingFlowId] = useState<number | null>(null);

	const updateCampaign = useCreateDispositionFlow();
	const queryClient = useQueryClient();
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
	const dispositionLabel = useDispositionLabel();

	// Check for existing flow
	const {
		data: existingFlow,
		isLoading: isLoadingExistingFlow,
		refetch: refetchExistingFlow,
	} = useDispositionFlowsByCampaignPath(createdCampaign?.id);

	const { mutateAsync: setDraft } = useSetCampaignDraft();

	React.useEffect(() => {
		if (existingFlow?.id) {
			setHasCreatedFlow(true);
			setHasOutcomeFlow(true);

			// If we land on this step and the flow already exists in this campaign,
			// we should not display it as an imported flow.
			setFlowOrigin((prev) => prev ?? 'existing');
		}
	}, [existingFlow, setHasOutcomeFlow]);

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
		setFlowOrigin('created');
		setImportSourceCampaignName('');
		setCopiedFlowId(null);
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

			setFlowOrigin('imported');
			setImportSourceCampaignName(campaignName);
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

	// Handle start over - remove the campaign flow (imported or created)
	const handleStartOver = async () => {
		if (!createdCampaign?.id) return;

		let flowIdToDelete = copiedFlowId ?? existingFlow?.id ?? null;
		if (!flowIdToDelete) {
			const result = await refetchExistingFlow();
			flowIdToDelete = result.data?.id ?? null;
		}

		if (flowIdToDelete) {
			try {
				await deleteDispositionFlow.mutateAsync(flowIdToDelete);
				notifications.show({
					title: 'Flow Removed',
					message:
						copiedFlowId || flowOrigin === 'imported'
							? 'The imported flow has been removed.'
							: 'The outcome flow has been removed from this campaign.',
					color: 'blue',
				});

				// Ensure campaign-path query reflects removal immediately
				queryClient.setQueryData(
					['dispositionFlows', 'campaignPath', createdCampaign.id],
					null
				);
				queryClient.invalidateQueries({
					queryKey: ['dispositionFlows', 'campaignPath', createdCampaign.id],
				});
			} catch (error) {
				notifications.show({
					title: 'Error',
					message:
						copiedFlowId || flowOrigin === 'imported'
							? 'Failed to remove the imported flow. Please try again.'
							: 'Failed to remove the outcome flow. Please try again.',
					color: 'red',
				});
				return;
			}
		} else {
			notifications.show({
				title: 'No Flow Found',
				message: 'There is no outcome flow to remove for this campaign.',
				color: 'orange',
			});
		}

		setHasCreatedFlow(false);
		setHasOutcomeFlow(false); // Sync with wizard store
		setFlowOrigin(null);
		setImportSourceCampaignName('');
		setCopiedFlowId(null);
		setPreviewFlowId(null);
	};

	const handleSubmit = async () => {
		if (!createdCampaign?.id) {
			notifications.show({
				title: 'Error',
				message: 'Campaign not found. Please start from step 1.',
				color: 'red',
			});
			return;
		}

		// Simplified check: If we have flagged that a flow is created, we trust it.
		// The checking of flowJson is handled by the modal saving process.
		if (!hasCreatedFlow && !existingFlow?.id) {
			notifications.show({
				title: 'No Outcome Flow',
				message: 'Please create or import an outcome flow before continuing.',
				color: 'orange',
			});
			return;
		}

		// Proceed to next step directly as the flow is already saved in the DB
		// by either the Modal (Create) or the Import logic.

		// Save draft step as 3 (Parameters Step)
		await setDraft({
			campaignId: String(createdCampaign.id),
			data: { isDraft: true, draftStep: 3 },
		}).catch((err) => console.error('Failed to save draft step', err));

		onNext();
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
						<FlowSummary
							origin={flowOrigin ?? 'created'}
							nodeCount={nodeCount}
							importSourceCampaignName={importSourceCampaignName}
							canPreviewImported={!!copiedFlowId}
							onPreviewImported={
								copiedFlowId
									? () =>
											handlePreviewFlow(copiedFlowId, importSourceCampaignName)
									: undefined
							}
							onEditCreated={
								(flowOrigin ?? 'created') === 'created'
									? handleOpenModal
									: undefined
							}
							onStartOver={handleStartOver}
							isDeleting={deleteDispositionFlow.isPending}
						/>
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
									<ImportFlowPicker
										campaignsWithFlows={campaignsWithFlows}
										isLoading={isLoadingCampaigns}
										isFetching={isFetchingCampaigns}
										searchQuery={searchQuery}
										onSearchQueryChange={setSearchQuery}
										onRefresh={() => refetchCampaigns()}
										copyingFlowId={copyingFlowId}
										onPreview={handlePreviewFlow}
										onUseFlow={handleImportFlow}
									/>
								</Box>
							)}
						</Stack>
					)}
				</Box>
			</Stack>

			<Group className={sharedStyles.actions} justify='flex-end'>
				<Button
					type='button'
					loading={updateCampaign.isPending || isLoadingExistingFlow}
					disabled={!hasCreatedFlow || copyingFlowId !== null}
					onClick={handleSubmit} // Unified handler
				>
					Continue
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
