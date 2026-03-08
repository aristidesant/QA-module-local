import React, { useState, useEffect, useCallback } from 'react';
import {
	Text,
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
import { useTranslation } from 'react-i18next';
import {
	useDeleteCampaign,
	useGetAllCampaignsPaginated,
	useSetCampaignDraft,
	useToggleCampaignStatus,
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
import AppDrawer from '~/components/AppDrawer';
import SectionCard from '~/components/SectionCard';

interface CampaignFiltersType {
	type?: string;
	campaignExecutionType?: string;
	status?: CampaignStatus;
	budgetMin?: number;
	budgetMax?: number;
	spentMin?: number;
	spentMax?: number;
	userId?: number;
	includeInactive?: boolean;
}

export const CampaignsList: React.FC = () => {
	const { t } = useTranslation(['campaigns', 'common']);
	const { selectCampaign, selectedCampaign } = useCampaignsStore(
		(state) => state
	);
	const navigate = useNavigate();
	const { canPerformAction } = usePermissions();

	// Get wizard store functions
	const {
		reset: resetWizard,
		initializeFromDraft,
		activeStep,
		createdCampaign,
		isResumingDraft,
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
	const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
	const [campaignTestCallId, setCampaignTestCallId] = useState<number | null>(
		null
	);

	// Fetch the agent when modal is opened
	const { data: selectedAgentForCall } = useGetAgent(
		selectedAgentIdForCall || ''
	);

	const [sortBy, setSortBy] = useState('createdAt');
	const [filters, setFilters] = useState<CampaignFiltersType>({
		includeInactive: true,
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
	const { mutateAsync: toggleCampaignStatus } = useToggleCampaignStatus();

	const handleToggleStatus = useCallback(
		(campaign: Campaign) => {
			const isActive = campaign.status === CampaignStatus.ACTIVE;
			const action = isActive ? 'inactive' : 'activate';

			const getConfirmMessage = () => {
				if (!isActive) return t('toggleStatus.confirmActivateMessage');
				return campaign.type === 'INBOUND'
					? t('toggleStatus.confirmDeactivateInbound')
					: t('toggleStatus.confirmDeactivateOutbound');
			};

			modals.openConfirmModal({
				title: isActive
					? t('toggleStatus.confirmDeactivateTitle')
					: t('toggleStatus.confirmActivateTitle'),
				children: <Text size='sm'>{getConfirmMessage()}</Text>,
				labels: {
					confirm: t('toggleStatus.confirm'),
					cancel: t('actions.cancel', { ns: 'common' }),
				},
				confirmProps: { color: isActive ? 'red' : 'green' },
				onConfirm: async () => {
					try {
						const result = await toggleCampaignStatus({
							campaignId: campaign.id,
							action,
						});
						notifications.show({
							title: result.message,
							message: '',
							color: 'green',
						});
						reloadCampaigns();
					} catch {
						notifications.show({
							title: t('toggleStatus.error'),
							message: t('toggleStatus.errorMessage'),
							color: 'red',
						});
					}
				},
			});
		},
		[t, toggleCampaignStatus, reloadCampaigns]
	);

	const handleTestCall = (campaign: Campaign) => {
		// Check if campaign has agents
		if (!campaign.agents || campaign.agents.length === 0) {
			notifications.show({
				title: t('list.noAgents'),
				message: t('list.noAgentsMessage'),
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
	const STEP_NAMES = [
		t('list.stepGeneral'),
		t('list.stepAgent'),
		t('list.stepOutcomes'),
		t('list.stepParameters'),
		t('list.stepComplete'),
	];

	// Step constants
	const FIRST_STEP = 0;
	const AGENT_STEP = 1;

	// Handle wizard close (no draft save / no campaign deletion)
	const handleWizardClose = useCallback(() => {
		// Only acknowledge potential loss on early steps (General + Agent)
		const shouldConfirmDiscard =
			activeStep === FIRST_STEP || activeStep === AGENT_STEP;

		if (shouldConfirmDiscard) {
			modals.openConfirmModal({
				title: t('list.discardChanges'),
				children: (
					<Text size='sm'>
						{t('list.discardMessage', { step: STEP_NAMES[activeStep] })}
					</Text>
				),
				labels: {
					confirm: t('list.discardConfirm'),
					cancel: t('list.keepEditing'),
				},
				confirmProps: { color: 'red' },
				onConfirm: () => {
					resetWizard();
					setAddNewModalOpened(false);
				},
			});
			return;
		}

		resetWizard();
		setAddNewModalOpened(false);
	}, [activeStep, resetWizard]);

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
			if (campaign.type === 'INBOUND') {
				navigate(`/campaign/${campaign.id}/conversations`);
			} else {
				navigate(`/campaign/view/${campaign.id}`);
			}
		},
		onTestCall: handleTestCall,
		onDelete: (campaign) => {
			modals.openConfirmModal({
				title: t('deleteModal.title'),
				children: <Text size='sm'>{t('deleteModal.message')}</Text>,
				labels: {
					confirm: t('deleteModal.confirm'),
					cancel: t('actions.cancel', { ns: 'common' }),
				},
				confirmProps: { color: 'red' },
				onConfirm: async () => {
					try {
						await deleteCampaign(`${campaign.id}`);
						reloadCampaigns();
						selectCampaign(null);
						notifications.show({
							title: t('deleteModal.success'),
							message: t('deleteModal.successMessage'),
							color: 'green',
						});
					} catch (error) {
						notifications.show({
							title: t('deleteModal.error'),
							message: t('deleteModal.errorMessage'),
							color: 'red',
						});
					}
				},
			});
		},
		onClone: (campaign) => {
			modals.open({
				modalId: 'clone-campaign',
				title: t('form.agent.columns.clone'),
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
		onToggleStatus: handleToggleStatus,
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
		setIsDetailsDrawerOpen(true);
	};

	return (
		<>
			<ContentContainer
				title={t('page.title')}
				description={t('page.description')}
				titleRight={
					<Group gap='xs'>
						{canPerformAction(ModuleEnum.CAMPAIGNS, PermissionEnum.CREATE) && (
							<ActionIcon
								onClick={handleShowAddNewCampaignModal}
								data-testid='header-create-campaign-btn'
								title={t('list.createCampaign')}
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
				<SectionCard>
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
					) : campaignsResponse?.data?.length === 0 &&
					  pagination.searchValue ? (
						<EmptyState
							icon={<IconRocket size={64} stroke={1.2} />}
							message={t('list.noCampaignsFound')}
							description={t('list.noCampaignsFoundDesc')}
						/>
					) : !campaignsResponse?.data ||
					  campaignsResponse.data.length === 0 ? (
						<EmptyState
							icon={<IconRocket size={64} stroke={1.2} />}
							message={t('list.noCampaignsYet')}
							description={t('list.noCampaignsYetDesc')}
							action={
								<Button
									leftSection={<IconPlus size={18} />}
									onClick={handleShowAddNewCampaignModal}
								>
									{t('list.createButton')}
								</Button>
							}
						/>
					) : (
						<>
							<BaseTable
								data={campaignsResponse?.data || []}
								columns={columns}
								onRowClick={handleCampaignClick}
								selectedRowId={selectedCampaign?.id?.toString()}
								density='compact'
							/>

							<PaginationControls
								currentPage={pagination.currentPage}
								totalPages={totalPages}
								itemsPerPage={pagination.itemsPerPage}
								totalItems={campaignsResponse?.total || 0}
								onPageChange={pagination.setCurrentPage}
								onItemsPerPageChange={handleItemsPerPageChange}
								searchTerm={pagination.debouncedSearch}
								isLoading={isLoading}
								itemLabel={t('list.itemLabel')}
							/>
						</>
					)}
				</SectionCard>
			</ContentContainer>
			<AppDrawer
				opened={isDetailsDrawerOpen && Boolean(selectedCampaign)}
				onClose={() => setIsDetailsDrawerOpen(false)}
				title={t('detailsDrawer.title')}
				size='xl'
			>
				{selectedCampaign && <CampaignPreview campaign={selectedCampaign} />}
				{!selectedCampaign && (
					<Text size='sm' c='dimmed'>
						{t('detailsDrawer.empty')}
					</Text>
				)}
			</AppDrawer>

			{/* Test Call Modal */}
			<Modal
				opened={testCallModalOpened}
				onClose={handleTestCallClose}
				title={t('list.testCallModal')}
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
					isResumingDraft
						? t('list.continueCampaignSetup')
						: t('list.createCampaign')
				}
				size='1200px'
				centered
				closeOnEscape={false}
			>
				<LoadingOverlay
					visible={isDraftSaving}
					overlayProps={{ blur: 2 }}
					loaderProps={{ children: t('list.savingDraft') }}
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
