import React, {
	Suspense,
	useState,
	useEffect,
	useCallback,
	useMemo,
} from 'react';
import {
	Text,
	Button,
	Modal,
	ActionIcon,
	Group,
	Loader,
	Center,
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
	const { t } = useTranslation([
		'campaigns.list',
		'campaign.form.agents',
		'common',
	]);
	const navigate = useNavigate();
	const { canPerformAction } = usePermissions();

	const resetWizard = useCampaignWizardStore((state) => state.reset);
	const initializeFromDraft = useCampaignWizardStore(
		(state) => state.initializeFromDraft
	);
	const setIsWizardModalOpen = useCampaignWizardStore(
		(state) => state.setIsWizardModalOpen
	);

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
	const [campaignNoiseCancellation, setCampaignNoiseCancellation] =
		useState(false);
	const [campaignTestCallId, setCampaignTestCallId] = useState<number | null>(
		null
	);

	// Fetch the agent when modal is opened
	const { data: selectedAgentForCall } = useGetAgent(
		selectedAgentIdForCall || ''
	);

	const [sortBy, setSortBy] = useState('updatedAt');
	const [filters, setFilters] = useState<CampaignFiltersType>({
		includeInactive: true,
	});

	// Reset to first page when filters change
	useEffect(() => {
		pagination.setCurrentPage(1);
	}, [filters]);

	const campaignsQueryParams = useMemo(
		() => ({
			...pagination.getApiParams(),
			...filters,
			sortBy,
		}),
		[
			filters,
			pagination.currentPage,
			pagination.debouncedSearch,
			pagination.itemsPerPage,
			sortBy,
		]
	);

	// Fetch data with server-side pagination
	const {
		data: campaignsResponse,
		isLoading,
		isError,
		error,
		refetch: reloadCampaigns,
	} = useGetAllCampaignsPaginated(campaignsQueryParams);
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
		setCampaignNoiseCancellation(
			campaign.agentConfig?.conversationConfig?.noiseCancellation ?? false
		);
	};

	const handleTestCallSuccess = () => {
		setTestCallModalOpened(false);
		setSelectedAgentIdForCall(null);
		setCampaignTestCallId(null);
		setCampaignNoiseCancellation(false);
	};

	const handleTestCallClose = () => {
		setTestCallModalOpened(false);
		setSelectedAgentIdForCall(null);
		setCampaignTestCallId(null);
		setCampaignNoiseCancellation(false);
	};

	// Handle continuing a draft campaign
	const handleContinueDraft = useCallback(
		(campaign: Campaign) => {
			if (!campaign.isDraft) return;

			initializeFromDraft(campaign);
			setIsWizardModalOpen(true);
		},
		[initializeFromDraft, setIsWizardModalOpen]
	);

	// Calculate total pages from server response
	const totalPages = campaignsResponse?.total
		? pagination.calculateTotalPages(campaignsResponse.total)
		: 0;

	const columns = useCampaignsColumns({
		onEdit: (campaign) => {
			navigate(`/campaign/${campaign.id}`);
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
		setIsWizardModalOpen(true);
	};

	const handleCampaignClick = (campaign: Campaign) => {
		navigate(`/campaign/view/${campaign.id}`);
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

					{isLoading ? (
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
						noiseCancellationEnabled={campaignNoiseCancellation}
					/>
				)}
			</Modal>

			<CampaignWizardModalHost reloadCampaigns={reloadCampaigns} />
		</>
	);
};

interface CampaignWizardModalHostProps {
	reloadCampaigns: () => Promise<unknown>;
}

const CampaignWizardModalHost: React.FC<CampaignWizardModalHostProps> = ({
	reloadCampaigns,
}) => {
	const { t } = useTranslation([
		'campaigns.list',
		'campaign.form.agents',
		'common',
	]);
	const isWizardModalOpen = useCampaignWizardStore(
		(state) => state.isWizardModalOpen
	);
	const isResumingDraft = useCampaignWizardStore(
		(state) => state.isResumingDraft
	);
	const resetWizard = useCampaignWizardStore((state) => state.reset);
	const setIsWizardModalOpen = useCampaignWizardStore(
		(state) => state.setIsWizardModalOpen
	);
	const { mutateAsync: setDraft, isPending: isDraftSaving } =
		useSetCampaignDraft();
	const [shouldResetWizardOnClose, setShouldResetWizardOnClose] =
		useState(false);

	const stepNames = useMemo(
		() => [
			t('list.stepGeneral'),
			t('list.stepAgent'),
			t('list.stepOutcomes'),
			t('list.stepParameters'),
			t('list.stepComplete'),
		],
		[t]
	);

	const closeWizardModal = useCallback(() => {
		setShouldResetWizardOnClose(true);
		setIsWizardModalOpen(false);
	}, [setIsWizardModalOpen]);

	const handleWizardClose = useCallback(() => {
		const currentStep = useCampaignWizardStore.getState().activeStep;
		const shouldConfirmDiscard = currentStep === 0 || currentStep === 1;

		if (shouldConfirmDiscard) {
			modals.openConfirmModal({
				title: t('list.discardChanges'),
				children: (
					<Text size='sm'>
						{t('list.discardMessage', { step: stepNames[currentStep] })}
					</Text>
				),
				labels: {
					confirm: t('list.discardConfirm'),
					cancel: t('list.keepEditing'),
				},
				confirmProps: { color: 'red' },
				onConfirm: closeWizardModal,
			});
			return;
		}

		closeWizardModal();
	}, [closeWizardModal, stepNames, t]);

	return (
		<Modal
			opened={isWizardModalOpen}
			onClose={handleWizardClose}
			onExitTransitionEnd={() => {
				if (!shouldResetWizardOnClose) return;
				resetWizard();
				setShouldResetWizardOnClose(false);
			}}
			title={
				isResumingDraft
					? t('list.continueCampaignSetup')
					: t('list.createCampaign')
			}
			size='1200px'
			centered
			closeOnEscape
			closeOnClickOutside={false}
		>
			{isWizardModalOpen && (
				<>
					<LoadingOverlay
						visible={isDraftSaving}
						overlayProps={{ blur: 2 }}
						loaderProps={{ children: t('list.savingDraft') }}
					/>
					<Suspense
						fallback={
							<Center py='xl'>
								<Loader size='sm' />
							</Center>
						}
					>
						<CampaignWizard
							onComplete={async () => {
								const { createdCampaign } = useCampaignWizardStore.getState();

								if (createdCampaign?.id && createdCampaign.isDraft) {
									try {
										await setDraft({
											campaignId: String(createdCampaign.id),
											data: { isDraft: false, draftStep: 0 },
										});
									} catch (error) {
										void error;
									}
								}

								await reloadCampaigns();
								closeWizardModal();
							}}
							onCancel={handleWizardClose}
						/>
					</Suspense>
				</>
			)}
		</Modal>
	);
};

export default CampaignsList;
