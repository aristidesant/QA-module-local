import React, { useState, useMemo } from 'react';
import { Loader, Text, Stack, Card, Button } from '@mantine/core';
import { IconAlertCircle, IconRocket, IconPlus } from '@tabler/icons-react';
import {
	useDeleteCampaign,
	useGetAllCampaignsPaginated,
} from '~/queries/campaignsQueries';
import styles from './CampaignsList.module.css';
import { CampaignsDetails } from '../CampaignsDetails';
import SectionCard from '~/components/SectionCard';
import CampaignsListItem from './CampaignsListItem';
import { modals } from '@mantine/modals';
import { CampaignsForm } from '../CampaignsForm/CampaignsForm';
import { notifications } from '@mantine/notifications';
import CampaignAgentList from '../CampaignAgentList';
import { useCampaignsStore } from '~/stores/campaignsStore';
import CampaignPreview from '../CampaignPreview';
import type { Campaign } from '~/models/CampaignsModel';
import { AddNewCampaignForm } from '../AddNewCampaignForm';
import CampaignFilters from './CampaignFilters';
import { usePagination } from '~/hooks/usePagination';
import PaginationControls from '~/components/PaginationControls';

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

	const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null);
	const [sortBy, setSortBy] = useState('createdAt');
	const { mutateAsync: deleteCampaign } = useDeleteCampaign();

	// Calculate total pages from server response
	const totalPages = campaignsResponse?.total
		? pagination.calculateTotalPages(campaignsResponse.total)
		: 0;

	// Filter and sort campaigns (now working on the data array from the response)
	const filteredAndSortedCampaigns = useMemo(() => {
		if (!campaignsResponse?.data) return [];

		let filtered = campaignsResponse.data.filter((campaign: Campaign) => {
			const searchLower = pagination.debouncedSearch.toLowerCase().trim();
			if (!searchLower) return true;

			return (
				campaign.name.toLowerCase().includes(searchLower) ||
				campaign.description?.toLowerCase().includes(searchLower) ||
				campaign.status?.toLowerCase().includes(searchLower) ||
				campaign.tags?.some((tag: string) =>
					tag.toLowerCase().includes(searchLower)
				)
			);
		});

		// Sort campaigns
		filtered.sort((a: Campaign, b: Campaign) => {
			switch (sortBy) {
				case 'name':
					return a.name.localeCompare(b.name);
				case 'status':
					return (a.status || '').localeCompare(b.status || '');
				case 'lastActivity':
					return (
						new Date(b.updatedAt || 0).getTime() -
						new Date(a.updatedAt || 0).getTime()
					);
				case 'createdAt':
				default:
					return (
						new Date(b.createdAt || 0).getTime() -
						new Date(a.createdAt || 0).getTime()
					);
			}
		});

		return filtered;
	}, [campaignsResponse?.data, pagination.debouncedSearch, sortBy]);

	// Helper functions
	const handleItemsPerPageChange = (value: string | null) => {
		if (value) {
			pagination.setItemsPerPage(parseInt(value, 10));
		}
	};

	if (isLoading || isFetching) {
		return (
			<div className={styles.loaderContainer}>
				<Loader size='lg' />
			</div>
		);
	}

	if (isError) {
		return (
			<div className={styles.errorContainer}>
				<IconAlertCircle size={32} color='red' />
				<Text c='red' mt='sm'>
					{error instanceof Error ? error.message : 'Failed to load campaigns.'}
				</Text>
			</div>
		);
	}

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

	if (!campaignsResponse?.data || campaignsResponse.data.length === 0) {
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
					<Card mt='xs' withBorder>
						<Stack align='center' justify='center'>
							<div className={styles.emptyIcon}>
								<IconRocket size={64} stroke={1.2} />
							</div>
							<Text size='xl' fw={600} mt='xl' className={styles.emptyTitle}>
								No campaigns yet
							</Text>
							<Text
								size='md'
								c='dimmed'
								mt={8}
								className={styles.emptySubtitle}
							>
								Launch your first campaign to reach your audience
							</Text>
							<Button
								leftSection={<IconPlus size={18} />}
								onClick={handleShowAddNewCampaignModal}
							>
								Create Campaign
							</Button>
						</Stack>
					</Card>
				</SectionCard>
			</Stack>
		);
	}

	if (filteredAndSortedCampaigns?.length === 0 && pagination.searchValue) {
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
					<Card mt='xs' withBorder>
						<Stack align='center' justify='center' py='xl'>
							<Text size='lg' fw={500}>
								No campaigns found
							</Text>
							<Text size='sm' c='dimmed'>
								Try adjusting your search terms or create a new campaign
							</Text>
						</Stack>
					</Card>
				</SectionCard>
			</Stack>
		);
	}

	const handleCampaignClick = (campaign: Campaign) => {
		setCurrentCampaign(campaign);
		if (campaign.id === selectedCampaign?.id) {
			selectCampaign(null);
		} else {
			selectCampaign(campaign);
		}

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
				// icon={IconDetails}
			>
				<CampaignFilters
					searchValue={pagination.searchValue}
					onSearchChange={pagination.setSearchValue}
					sortBy={sortBy}
					onSortChange={setSortBy}
				/>

				<Stack gap={'xs'}>
					{filteredAndSortedCampaigns?.map((campaign: Campaign) => (
						<CampaignsListItem
							key={campaign.id}
							campaign={campaign}
							selected={currentCampaign?.id === campaign.id}
							onClick={() => handleCampaignClick(campaign)}
							onViewDetails={() => {
								selectCampaign(campaign);

								if (editCampaign) setEditCampaign(false);
								setEditCampaign(true);
							}}
							onEdit={() => {
								modals.open({
									modalId: 'edit-campaign',
									title: `Edit Campaign: ${campaign.name}`,
									children: <CampaignsForm campaign={campaign} />,
									size: 'lg',
									centered: true,
								});
							}}
							onDelete={async () => {
								modals.openConfirmModal({
									title: 'Delete Campaign',
									children: (
										<Text size='sm'>
											Are you sure you want to delete this campaign?
										</Text>
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
							}}
						/>
					))}
				</Stack>

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
