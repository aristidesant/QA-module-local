import React, { useState } from 'react';
import { Text, Stack, Card, Button } from '@mantine/core';
import { IconAlertCircle, IconRocket, IconPlus } from '@tabler/icons-react';
import {
	useDeleteCampaign,
	useGetAllCampaignsPaginated,
} from '~/queries/campaignsQueries';
import styles from './CampaignsList.module.css';
import { CampaignsDetails } from '../CampaignsDetails';
import SectionCard from '~/components/SectionCard';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import CampaignAgentList from '../CampaignAgentList';
import { useCampaignsStore } from '~/stores/campaignsStore';
import CampaignPreview from '../CampaignPreview';
import type { Campaign } from '~/models/CampaignsModel';
import { AddNewCampaignForm } from '../AddNewCampaignForm';
import CampaignFilters from './CampaignFilters';
import { usePagination } from '~/hooks/usePagination';
import PaginationControls from '~/components/PaginationControls';
import { useFilteredAndSortedCampaigns } from '~/hooks/useFilteredAndSortedCampaigns';
import EmptyState from '~/components/EmptyState';
import BaseTable from '~/components/BaseTable';
import { useCampaignsColumns } from './useCampaignsColumns';
import CampaignsListSkeleton from './CampaignsListSkeleton';
import CloneCampaignForm from '../CloneCampaignForm';

export const CampaignsList: React.FC = () => {
	const {
		selectCampaign,
		selectedCampaign,
		setRightComponent,
		setEditCampaign,
		editCampaign,
	} = useCampaignsStore((state) => state);

	// Use the pagination hook for all pagination logic
	const pagination = usePagination({
		initialItemsPerPage: 10,
		searchDebounceMs: 500,
	});

	// Fetch data with server-side pagination
	const {
		data: campaignsResponse,
		isLoading,
		isFetching,
		isError,
		error,
		refetch: reloadCampaigns,
	} = useGetAllCampaignsPaginated(pagination.getApiParams());

	const [sortBy, setSortBy] = useState('createdAt');
	const { mutateAsync: deleteCampaign } = useDeleteCampaign();

	// Calculate total pages from server response
	const totalPages = campaignsResponse?.total
		? pagination.calculateTotalPages(campaignsResponse.total)
		: 0;

	// Filter and sort campaigns
	const filteredAndSortedCampaigns = useFilteredAndSortedCampaigns(
		campaignsResponse?.data,
		pagination.debouncedSearch,
		sortBy
	);

	const columns = useCampaignsColumns({
		onEdit: (campaign) => {
			selectCampaign(campaign);
			setEditCampaign(true);
		},
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
		modals.open({
			modalId: 'create-campaign',
			title: 'Create New Campaign',
			children: (
				<AddNewCampaignForm
					onComplete={() => {
						reloadCampaigns();
						selectCampaign(null);
						modals.close('create-campaign');
					}}
				/>
			),
			size: 'lg',
			centered: true,
		});
	};

	const handleCampaignClick = (campaign: Campaign) => {
		selectCampaign(campaign);

		setRightComponent?.(<CampaignPreview {...{ campaign }} />);
	};

	return (
		<Stack className={styles.tableWrapper}>
			<SectionCard
				title='Campaign list'
				description='Manage and monitor all your campaigns in one place.'
				headerActions={
					<Button fz='xs' onClick={handleShowAddNewCampaignModal}>
						New Campaign
					</Button>
				}
			>
				<CampaignFilters
					searchValue={pagination.searchValue}
					onSearchChange={pagination.setSearchValue}
					sortBy={sortBy}
					onSortChange={setSortBy}
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
				) : !campaignsResponse?.data || campaignsResponse.data.length === 0 ? (
					<Card mt='xs' withBorder>
						<EmptyState
							icon={<IconRocket size={64} stroke={1.2} />}
							title='No campaigns yet'
							subtitle='Launch your first campaign to reach your audience'
							button={
								<Button
									leftSection={<IconPlus size={18} />}
									onClick={handleShowAddNewCampaignModal}
								>
									Create Campaign
								</Button>
							}
						/>
					</Card>
				) : filteredAndSortedCampaigns?.length === 0 &&
				  pagination.searchValue ? (
					<Card mt='xs' withBorder>
						<EmptyState
							icon={<IconRocket size={64} stroke={1.2} />}
							title='No campaigns found'
							subtitle='Try adjusting your search terms or create a new campaign'
						/>
					</Card>
				) : (
					<>
						<BaseTable
							data={filteredAndSortedCampaigns || []}
							columns={columns}
							onRowClick={handleCampaignClick}
							selectedKey={selectedCampaign?.id?.toString()}
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
						/>
					</>
				)}
			</SectionCard>
			{selectedCampaign?.id && editCampaign && (
				<>
					<CampaignsDetails campaignId={`${selectedCampaign?.id}`} />
					<CampaignAgentList campaignId={`${selectedCampaign?.id}`} />
				</>
			)}
		</Stack>
	);
};
