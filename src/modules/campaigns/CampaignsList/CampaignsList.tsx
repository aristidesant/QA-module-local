import React, { useState, useEffect } from 'react';
import { Text, Card, Button, Modal, ActionIcon, Group } from '@mantine/core';
import {
	IconAlertCircle,
	IconRocket,
	IconPlus,
	IconRefresh,
} from '@tabler/icons-react';
import {
	useDeleteCampaign,
	useGetAllCampaignsPaginated,
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
import { ModuleEnum } from '~/contants/ModuleEnum';
import { PermissionEnum } from '~/contants/PermissionEnum';

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

	// Get the wizard reset function
	const resetWizard = useCampaignWizardStore((state) => state.reset);

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
				onClose={() => {
					resetWizard();
					setAddNewModalOpened(false);
				}}
				title='Create New Campaign'
				size='1200px'
				centered
			>
				<CampaignWizard
					onComplete={() => {
						reloadCampaigns();
						selectCampaign(null);
						resetWizard();
						setAddNewModalOpened(false);
					}}
					onCancel={() => {
						selectCampaign(null);
						resetWizard();
						setAddNewModalOpened(false);
					}}
				/>
			</Modal>
		</>
	);
};

export default CampaignsList;
