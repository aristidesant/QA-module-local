import React, { useState, useEffect, useCallback } from 'react';
import {
	Text,
	Card,
	Button,
	Modal,
	ActionIcon,
	Group,
	LoadingOverlay,
} from '@mantine/core';
import {
	IconAlertCircle,
	IconRocket,
	IconPlus,
	IconRefresh,
} from '@tabler/icons-react';
import {
	useDeleteCampaign,
	useGetAllCampaignsPaginated,
	useSetCampaignDraft,
} from '~/queries/campaignsQueries';
import styles from './CampaignsList.module.css';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useCampaignsStore } from '~/stores/campaignsStore';
import CampaignPreview from '../CampaignPreview';
import type { Campaign } from '~/models/CampaignsModel';
import { CampaignWizard } from '../CampaignWizard';
import CampaignFilters from './CampaignFilters';
import { usePagination } from '~/hooks/usePagination';
import PaginationControls from '~/components/PaginationControls';
import EmptyState from '~/components/EmptyState';
import BaseTable from '~/components/BaseTable';
import { useCampaignsColumns } from './useCampaignsColumns';
import CampaignsListSkeleton from './CampaignsListSkeleton';
import CloneCampaignForm from '../CloneCampaignForm';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { CampaignStatus } from '~/models/CampaignStatus';
import { OutboundCallForm } from '~/components/OutboundCallForm';
import { useGetAgent } from '~/queries/agentQueries';
import { useNavigate } from 'react-router';
import { useCampaignWizardStore } from '~/stores/campaignWizardStore';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';

interface CampaignFiltersType {
	type?: string;
	campaignExecutionType?: string;
	status?: CampaignStatus;
	budgetMin?: number;
	budgetMax?: number;
	spentMin?: number;
	spentMax?: number;
	userId?: number;
	includeCompleted?: boolean;
}

export const CampaignsList: React.FC = () => {
	const {
		selectCampaign,
		selectedCampaign,
		setRightComponent,
		rightComponent,
	} = useCampaignsStore((state) => state);
	const navigate = useNavigate();
	const { canPerformAction } = usePermissions();

	// Get wizard store functions
	const {
		reset: resetWizard,
		initializeFromDraft,
		activeStep,
		createdCampaign,
		isResumingDraft,
		hasOutcomeFlow,
	} = useCampaignWizardStore();

	// Draft mutation
	const { mutateAsync: setDraft, isPending: isDraftSaving } =
		useSetCampaignDraft();

	// Use the pagination hook for all pagination logic
	const pagination = usePagination({
		initialItemsPerPage: 10,
		searchDebounceMs: 500,
	});

	// Test call modal state
	const [testCallModalOpened, setTestCallModalOpened] = useState(false);
	const [selectedAgentIdForCall, setSelectedAgentIdForCall] = useState<
		string | null
	>(null);

	const [addNewModalOpened, setAddNewModalOpened] = useState(false);
	const [campaignTestCallId, setCampaignTestCallId] = useState<number | null>(
		null
	);

	// Fetch the agent when modal is opened
	const { data: selectedAgentForCall } = useGetAgent(
		selectedAgentIdForCall || ''
	);

	const [sortBy, setSortBy] = useState('createdAt');
	const [filters, setFilters] = useState<CampaignFiltersType>({
		includeCompleted: false,
	});

	// Reset to first page when filters change
	useEffect(() => {
		pagination.setCurrentPage(1);
	}, [filters]);

	// Fetch data with server-side pagination
	const {
		data: campaignsResponse,
		isLoading,
		isFetching,
		isError,
		error,
		refetch: reloadCampaigns,
	} = useGetAllCampaignsPaginated({
		...pagination.getApiParams(),
		...filters,
		sortBy,
	});
	const { mutateAsync: deleteCampaign } = useDeleteCampaign();

	const handleTestCall = (campaign: Campaign) => {
		// Check if campaign has agents
		if (!campaign.agents || campaign.agents.length === 0) {
			notifications.show({
				title: 'No Agents',
				message: 'This campaign has no agents assigned.',
				color: 'yellow',
			});
			return;
		}

		// If campaign has multiple agents, use the first one
		const agentId = campaign.agents[0].agentId;
		setSelectedAgentIdForCall(agentId);
		setTestCallModalOpened(true);
		setCampaignTestCallId(campaign.id);
	};

	const handleTestCallSuccess = () => {
		setTestCallModalOpened(false);
		setSelectedAgentIdForCall(null);
		setCampaignTestCallId(null);
	};

	const handleTestCallClose = () => {
		setTestCallModalOpened(false);
		setSelectedAgentIdForCall(null);
		setCampaignTestCallId(null);
	};

	// Handle continuing a draft campaign
	const handleContinueDraft = useCallback(
		(campaign: Campaign) => {
			if (!campaign.isDraft) return;

			initializeFromDraft(campaign);
			setAddNewModalOpened(true);
		},
		[initializeFromDraft]
	);

	// Step names for display (0-indexed)
	const STEP_NAMES = ['General', 'Agent', 'Outcomes', 'Parameters', 'Complete'];

	// Step constants
	const FINAL_STEP = 4;
	const FIRST_STEP = 0;
	const OUTCOMES_STEP = 2;
	const PARAMETERS_STEP = 3;

	// Handle wizard close with draft confirmation
	const handleWizardClose = useCallback(async () => {
		// If we're on the final step (step 4 = Complete), clear draft status if it was a draft
		if (activeStep === FINAL_STEP) {
			// If the campaign was a draft, clear the draft status since we reached completion
			if (createdCampaign?.id && createdCampaign.isDraft) {
				try {
					await setDraft({
						campaignId: String(createdCampaign.id),
						data: { isDraft: false, draftStep: 0 },
					});
					reloadCampaigns();
				} catch (error) {
					// eslint-disable-next-line no-console
					console.error('Failed to clear draft status:', error);
				}
			}
			resetWizard();
			setAddNewModalOpened(false);
			return;
		}

		// If no campaign was created yet (step 0 = General before submission), just close
		// Step 0 doesn't need drafting because the campaign hasn't been created yet
		if (activeStep === FIRST_STEP || !createdCampaign) {
			resetWizard();
			setAddNewModalOpened(false);
			return;
		}

		// Special case: On Outcomes step (2) with outcome flow created
		// The outcome step is essentially complete, so draft to Parameters step (3)
		const isOutcomeStepComplete =
			activeStep === OUTCOMES_STEP && hasOutcomeFlow;

		if (isOutcomeStepComplete) {
			// Determine if this is a new campaign (never drafted before)
			const isNewCampaign = !isResumingDraft;

			modals.openConfirmModal({
				title: 'Save as Draft?',
				children: (
					<Text size='sm'>
						Your outcome flow has been saved. You can continue from the{' '}
						<strong>Parameters</strong> step later.
					</Text>
				),
				labels: { confirm: 'Save Draft', cancel: 'Discard' },
				confirmProps: { color: 'orange' },
				onConfirm: async () => {
					try {
						// Save draft at Parameters step since Outcomes is complete
						await setDraft({
							campaignId: String(createdCampaign.id),
							data: { isDraft: true, draftStep: PARAMETERS_STEP },
						});
						notifications.show({
							title: 'Draft Saved',
							message:
								'Your campaign has been saved. Continue from Parameters step.',
							color: 'green',
						});
						reloadCampaigns();
					} catch (error) {
						notifications.show({
							title: 'Error',
							message: 'Failed to save draft. Please try again.',
							color: 'red',
						});
					} finally {
						resetWizard();
						setAddNewModalOpened(false);
					}
				},
				onCancel: async () => {
					// If this is a new campaign (never drafted), delete it when discarding
					if (isNewCampaign && createdCampaign?.id) {
						try {
							await deleteCampaign(String(createdCampaign.id));
							reloadCampaigns();
						} catch (error) {
							// eslint-disable-next-line no-console
							console.error('Failed to delete discarded campaign:', error);
						}
					}
					resetWizard();
					setAddNewModalOpened(false);
				},
			});
			return;
		}

		// Determine if this is a new campaign (never drafted before)
		// A campaign is "new" if we're NOT resuming a draft
		const isNewCampaign = !isResumingDraft;

		// Show confirmation modal for draft save
		modals.openConfirmModal({
			title: 'Save as Draft?',
			children: (
				<Text size='sm'>
					Your campaign will be saved as a draft. You can continue from the{' '}
					<strong>{STEP_NAMES[activeStep]}</strong> step later.
				</Text>
			),
			labels: { confirm: 'Save Draft', cancel: 'Discard' },
			confirmProps: { color: 'orange' },
			onConfirm: async () => {
				try {
					await setDraft({
						campaignId: String(createdCampaign.id),
						data: { isDraft: true, draftStep: activeStep },
					});
					notifications.show({
						title: 'Draft Saved',
						message: 'Your campaign has been saved as a draft.',
						color: 'green',
					});
					reloadCampaigns();
				} catch (error) {
					notifications.show({
						title: 'Error',
						message: 'Failed to save draft. Please try again.',
						color: 'red',
					});
				} finally {
					resetWizard();
					setAddNewModalOpened(false);
				}
			},
			onCancel: async () => {
				// If this is a new campaign (never drafted), delete it when discarding
				// If it's an existing draft being resumed, just close without deleting
				if (isNewCampaign && createdCampaign?.id) {
					try {
						await deleteCampaign(String(createdCampaign.id));
						reloadCampaigns();
					} catch (error) {
						// Silently fail - campaign will be cleaned up or user can delete manually
						// eslint-disable-next-line no-console
						console.error('Failed to delete discarded campaign:', error);
					}
				}
				resetWizard();
				setAddNewModalOpened(false);
			},
		});
	}, [
		activeStep,
		createdCampaign,
		hasOutcomeFlow,
		isResumingDraft,
		resetWizard,
		setDraft,
		deleteCampaign,
		reloadCampaigns,
	]);

	// Handle Escape key for wizard modal
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && addNewModalOpened) {
				// Check if there are multiple open modals (outer wizard + inner modal)
				const openModals = document.querySelectorAll('.mantine-Modal-content');
				if (openModals.length > 1) {
					return; // Let the inner modal handle it
				}
				event.preventDefault();
				handleWizardClose();
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [addNewModalOpened, handleWizardClose]);

	// Calculate total pages from server response
	const totalPages = campaignsResponse?.total
		? pagination.calculateTotalPages(campaignsResponse.total)
		: 0;

	const columns = useCampaignsColumns({
		onEdit: (campaign) => {
			navigate(`/campaign/${campaign.id}`);
		},
		onView: (campaign) => {
			navigate(`/campaign/view/${campaign.id}`);
		},
		onTestCall: handleTestCall,
		onDelete: (campaign) => {
			modals.openConfirmModal({
				title: 'Delete Campaign',
				children: (
					<Text size='sm'>Are you sure you want to delete this campaign?</Text>
				),
				labels: { confirm: 'Delete', cancel: 'Cancel' },
				confirmProps: { color: 'red' },
				onConfirm: async () => {
					try {
						await deleteCampaign(`${campaign.id}`);
						reloadCampaigns();
						selectCampaign(null);
						notifications.show({
							title: 'Campaign Deleted',
							message: 'The campaign has been successfully deleted.',
							color: 'green',
						});
					} catch (error) {
						notifications.show({
							title: 'Error',
							message: 'Failed to delete campaign. Please try again.',
							color: 'red',
						});
					}
				},
			});
		},
		onClone: (campaign) => {
			modals.open({
				modalId: 'clone-campaign',
				title: 'Clone Campaign',
				children: (
					<CloneCampaignForm
						campaign={campaign}
						onComplete={() => {
							reloadCampaigns();
							selectCampaign(null);
							modals.close('clone-campaign');
						}}
					/>
				),
				size: 'lg',
				centered: true,
			});
		},
		onContinueDraft: handleContinueDraft,
	});

	// Helper functions
	const handleItemsPerPageChange = (value: string | null) => {
		if (value) {
			pagination.setItemsPerPage(parseInt(value, 10));
		}
	};

	const handleShowAddNewCampaignModal = () => {
		// Reset wizard to ensure fresh start
		resetWizard();
		setAddNewModalOpened(true);
	};

	const handleCampaignClick = (campaign: Campaign) => {
		selectCampaign(campaign);

		setRightComponent?.(<CampaignPreview {...{ campaign }} />);
	};

	return (
		<>
			<ContentContainer
				title='Campaign list'
				description='Manage and monitor all your campaigns in one place.'
				rightSection={rightComponent || <></>}
				titleRight={
					<Group gap='xs'>
						{canPerformAction(ModuleEnum.CAMPAIGNS, PermissionEnum.CREATE) && (
							<ActionIcon
								onClick={handleShowAddNewCampaignModal}
								data-testid='header-create-campaign-btn'
								title='Create New Campaign'
							>
								<IconPlus size={16} />
							</ActionIcon>
						)}
						<ActionIcon
							onClick={() => reloadCampaigns()}
							data-testid='header-refresh-btn'
						>
							<IconRefresh size={16} />
						</ActionIcon>
					</Group>
				}
			>
				<CampaignFilters
					searchValue={pagination.searchValue}
					onSearchChange={pagination.setSearchValue}
					sortBy={sortBy}
					onSortChange={setSortBy}
					filters={filters}
					onFiltersChange={setFilters}
				/>

				{isLoading || isFetching ? (
					<CampaignsListSkeleton />
				) : isError ? (
					<div className={styles.errorContainer}>
						<IconAlertCircle size={32} color='red' />
						<Text c='red' mt='sm'>
							{error instanceof Error
								? error.message
								: 'Failed to load campaigns.'}
						</Text>
					</div>
				) : campaignsResponse?.data?.length === 0 && pagination.searchValue ? (
					<Card mt='xs' withBorder>
						<EmptyState
							icon={<IconRocket size={64} stroke={1.2} />}
							message='No campaigns found'
							description='Try adjusting your search terms or create a new campaign'
						/>
					</Card>
				) : !campaignsResponse?.data || campaignsResponse.data.length === 0 ? (
					<Card mt='xs' withBorder>
						<EmptyState
							icon={<IconRocket size={64} stroke={1.2} />}
							message='No campaigns yet'
							description='Launch your first campaign to reach your audience'
							action={
								<Button
									leftSection={<IconPlus size={18} />}
									onClick={handleShowAddNewCampaignModal}
								>
									Create Campaign
								</Button>
							}
						/>
					</Card>
				) : (
					<>
						<BaseTable
							data={campaignsResponse?.data || []}
							columns={columns}
							onRowClick={handleCampaignClick}
							selectedRowId={selectedCampaign?.id?.toString()}
						/>

						{/* Pagination Controls */}
						<PaginationControls
							currentPage={pagination.currentPage}
							totalPages={totalPages}
							itemsPerPage={pagination.itemsPerPage}
							totalItems={campaignsResponse?.total || 0}
							onPageChange={pagination.setCurrentPage}
							onItemsPerPageChange={handleItemsPerPageChange}
							searchTerm={pagination.debouncedSearch}
							isLoading={isLoading}
							itemLabel='campaigns'
						/>
					</>
				)}
			</ContentContainer>

			{/* Test Call Modal */}
			<Modal
				opened={testCallModalOpened}
				onClose={handleTestCallClose}
				title='Test Campaign Call'
				size='md'
				centered
			>
				{selectedAgentForCall && (
					<OutboundCallForm
						agent={selectedAgentForCall}
						onSuccess={handleTestCallSuccess}
						campaignId={campaignTestCallId!}
						onClose={handleTestCallClose}
					/>
				)}
			</Modal>

			{/* Add New Campaign Modal */}
			<Modal
				opened={addNewModalOpened}
				onClose={handleWizardClose}
				title={
					isResumingDraft ? 'Continue Campaign Setup' : 'Create New Campaign'
				}
				size='1200px'
				centered
				closeOnEscape={false}
			>
				<LoadingOverlay
					visible={isDraftSaving}
					overlayProps={{ blur: 2 }}
					loaderProps={{ children: 'Saving draft...' }}
				/>
				<CampaignWizard
					onComplete={async () => {
						// Clear draft status if it's a draft (whether new or resumed)
						if (createdCampaign?.id && createdCampaign.isDraft) {
							try {
								await setDraft({
									campaignId: String(createdCampaign.id),
									data: { isDraft: false, draftStep: 0 },
								});
							} catch (error) {
								// eslint-disable-next-line no-console
								console.error('Failed to clear draft status:', error);
							}
						}
						reloadCampaigns();
						selectCampaign(null);
						resetWizard();
						setAddNewModalOpened(false);
					}}
					onCancel={handleWizardClose}
				/>
			</Modal>
		</>
	);
};

export default CampaignsList;
