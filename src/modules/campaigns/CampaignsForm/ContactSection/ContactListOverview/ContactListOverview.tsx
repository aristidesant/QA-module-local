import { useEffect, useState } from 'react';
import { Modal, TextInput, ActionIcon, Group } from '@mantine/core';
import { IconSearch, IconAdjustments, IconX } from '@tabler/icons-react';
import styles from './ContactListOverview.module.css';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { ContactDetails } from '~/modules/campaigns/CampaignsForm/ContactSection/ContactDetails';
import { useGetCampaignContacts } from '~/queries/contactsQueries';
import { usePagination } from '~/hooks/usePagination';
import PaginationControls from '~/components/PaginationControls';
import BaseTable from '~/components/BaseTable';
import { FilterContainer } from '~/components/FilterContainer';
import SectionCard from '~/components/SectionCard';
import { useContactColumns } from './useContactColumns';
import ContactListSkeleton from './ContactListSkeleton';
import type { Contact } from '~/models/ContactsModel';

interface ContactListOverviewProps {}

export const ContactListOverview: React.FC<ContactListOverviewProps> = () => {
	const { selectedCampaign, setRightComponent } = useCampaignsStore();
	const [filtersOpened, setFiltersOpened] = useState(false);

	// Use the pagination hook for all pagination logic
	const pagination = usePagination({
		initialItemsPerPage: 10,
		searchDebounceMs: 500,
	});

	// Fetch data with server-side pagination
	const { data: campaignContacts, isLoading } = useGetCampaignContacts(
		selectedCampaign?.id as number,
		pagination.getApiParams()
	);

	// Calculate total pages from server response
	const totalPages = campaignContacts?.total
		? pagination.calculateTotalPages(campaignContacts.total)
		: 0;

	const columns = useContactColumns();

	const getInitials = (firstName: string, lastName: string) => {
		const firstInitial = firstName?.charAt(0) || '';
		const lastInitial = lastName?.charAt(0) || '';
		return `${firstInitial}${lastInitial}`.toUpperCase() || '??';
	};

	// Handle contact click for details view
	const handleContactClick = (contact: Contact) => {
		const primaryPhone = contact.phones?.[0] || '';
		const primaryEmail = contact.emails?.[0] || '';

		const contactDetails = {
			id: contact.id.toString(),
			name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
			phone: primaryPhone,
			email: primaryEmail,
			location: contact.address || 'N/A',
			language: 'Spanish',
			initials: getInitials(contact.firstName || '', contact.lastName || ''),
			engagementLevel: 87,
			qualificationScore: 75,
			sentiment: { positive: 2113, neutral: 45, negative: 16 },
		};

		if (setRightComponent) {
			setRightComponent(<ContactDetails contact={contactDetails} />);
		}
	};

	// Handle items per page change
	const handleItemsPerPageChange = (value: string | null) => {
		if (value) {
			pagination.setItemsPerPage(parseInt(value, 10));
		}
	};

	// Clear search function
	const handleClearSearch = () => {
		pagination.setSearchValue('');
	};

	// Cleanup effect
	useEffect(() => {
		return () => {
			setRightComponent?.(null);
		};
	}, [setRightComponent]);

	return (
		<>
			<SectionCard
				title='Contact List Overview'
				description='View and filter campaign contacts to tailor your outreach.'
				headerActions={
					<Group gap='sm'>
						<TextInput
							placeholder='Search by first name...'
							value={pagination.searchValue}
							onChange={(event) =>
								pagination.setSearchValue(event.currentTarget.value)
							}
							leftSection={<IconSearch size={16} />}
							rightSection={
								pagination.searchValue ? (
									<ActionIcon
										variant='subtle'
										size='sm'
										onClick={handleClearSearch}
									>
										<IconX size={14} />
									</ActionIcon>
								) : null
							}
							size='sm'
						/>
						<ActionIcon
							variant='light'
							size='lg'
							onClick={() => setFiltersOpened(true)}
						>
							<IconAdjustments size={16} />
						</ActionIcon>
					</Group>
				}
			>
				{/* Data Table */}
				<div className={styles.tableContainer}>
					{isLoading ? (
						<ContactListSkeleton />
					) : (
						<BaseTable
							data={campaignContacts?.contacts || []}
							columns={columns}
							onRowClick={handleContactClick}
							filterMode='server'
							emptyMessage={
								pagination.debouncedSearch
									? `No contacts found matching "${pagination.debouncedSearch}".`
									: 'No contacts available.'
							}
							getRowClassName={() => styles.contactRow}
						/>
					)}
				</div>

				{/* Pagination Controls */}
				<PaginationControls
					currentPage={pagination.currentPage}
					totalPages={totalPages}
					itemsPerPage={pagination.itemsPerPage}
					totalItems={campaignContacts?.total || 0}
					onPageChange={pagination.setCurrentPage}
					onItemsPerPageChange={handleItemsPerPageChange}
					searchTerm={pagination.debouncedSearch}
					isLoading={isLoading}
					itemLabel='contacts'
				/>
			</SectionCard>

			<Modal
				opened={filtersOpened}
				onClose={() => setFiltersOpened(false)}
				title='Filter Contacts'
				size='md'
			>
				<FilterContainer>
					{/* TODO: Add filter components here */}
					<p>Filters will be implemented here.</p>
				</FilterContainer>
			</Modal>
		</>
	);
};

export default ContactListOverview;
