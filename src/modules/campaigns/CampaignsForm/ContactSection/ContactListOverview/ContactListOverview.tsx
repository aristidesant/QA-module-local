import { useEffect, useMemo, useCallback, useState } from 'react';
import styles from './ContactListOverview.module.css';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { ContactDetails } from '~/modules/campaigns/CampaignsForm/ContactSection/ContactDetails';
import { useGetCampaignContacts } from '~/queries/contactsQueries';
import { usePagination } from '~/hooks/usePagination';
import PaginationControls from '~/components/PaginationControls';
import BaseTable from '~/components/BaseTable';
import SectionCard from '~/components/SectionCard';
import { useContactColumns } from './useContactColumns';
import ContactListSkeleton from './ContactListSkeleton';
import ContactListOverviewFilters from './ContactListOverviewFilters';
import { useContactFilters } from './useContactFilters';
import type { Contact } from '~/models/ContactsModel';
import type { SortingState } from '@tanstack/react-table';

interface ContactListOverviewProps {}

export const ContactListOverview: React.FC<ContactListOverviewProps> = () => {
	const { selectedCampaign, setRightComponent } = useCampaignsStore();

	// Pagination state
	const pagination = usePagination({
		initialItemsPerPage: 10,
		searchDebounceMs: 500,
	});

	// Sorting state
	const [sorting, setSorting] = useState<SortingState>([]);

	// Filter state
	const contactFilters = useContactFilters({
		debounceMs: 500,
	});

	// Build API params combining pagination and filters
	const apiParams = useMemo(() => {
		const baseParams = {
			limit: pagination.itemsPerPage,
			offset: (pagination.currentPage - 1) * pagination.itemsPerPage,
		};

		const filterParams: Record<string, string> = {};

		if (contactFilters.debouncedFilters.name) {
			filterParams.name = contactFilters.debouncedFilters.name;
		}
		if (contactFilters.debouncedFilters.email) {
			filterParams.email = contactFilters.debouncedFilters.email;
		}
		if (contactFilters.debouncedFilters.phone) {
			filterParams.phone = contactFilters.debouncedFilters.phone;
		}

		// Add sorting params
		const sortBy = sorting.length > 0 ? sorting[0].id : undefined;
		const sortOrder =
			sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : undefined;
		if (sortBy) {
			filterParams.sortBy = sortBy;
		}
		if (sortOrder) {
			filterParams.sortOrder = sortOrder;
		}

		return { ...baseParams, ...filterParams };
	}, [
		pagination.currentPage,
		pagination.itemsPerPage,
		contactFilters.debouncedFilters,
		sorting,
	]);

	// Fetch contacts with server-side pagination and filtering
	const { data: campaignContacts, isLoading } = useGetCampaignContacts(
		selectedCampaign?.id as number,
		apiParams
	);

	// Calculate total pages
	const totalPages = useMemo(() => {
		if (!campaignContacts?.total) return 0;
		return Math.ceil(campaignContacts.total / pagination.itemsPerPage);
	}, [campaignContacts?.total, pagination.itemsPerPage]);

	// Reset to page 1 when filters change
	useEffect(() => {
		pagination.setCurrentPage(1);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [contactFilters.debouncedFilters]);

	// Reset to page 1 when sorting changes
	useEffect(() => {
		pagination.setCurrentPage(1);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sorting]);

	// Table columns
	const columns = useContactColumns();

	// Helper to get contact initials
	const getInitials = useCallback((firstName: string, lastName: string) => {
		const firstInitial = firstName?.charAt(0) || '';
		const lastInitial = lastName?.charAt(0) || '';
		return `${firstInitial}${lastInitial}`.toUpperCase() || '??';
	}, []);

	// Handle contact row click - show details in right panel
	const handleContactClick = useCallback(
		(contact: Contact) => {
			const primaryPhone = contact.phones?.[0] || '';
			const primaryEmail = contact.emails?.[0] || '';

			// Map phoneNumbers to include validation errors
			const phonesWithValidation =
				contact.phoneNumbers?.map((entry) => ({
					phoneNumber: entry.phoneNumber,
					validationError: entry.validationError,
				})) || [];

			const contactDetails = {
				id: contact.id.toString(),
				name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
				phone: primaryPhone,
				email: primaryEmail,
				location: contact.address || 'N/A',
				language: 'Spanish',
				initials: getInitials(contact.firstName || '', contact.lastName || ''),
				phones: phonesWithValidation,
				engagementLevel: 87,
				qualificationScore: 75,
				sentiment: { positive: 2113, neutral: 45, negative: 16 },
			};

			if (setRightComponent) {
				setRightComponent(<ContactDetails contact={contactDetails} />);
			}
		},
		[setRightComponent, getInitials]
	);

	// Handle items per page change
	const handleItemsPerPageChange = useCallback(
		(value: string | null) => {
			if (value) {
				pagination.setItemsPerPage(parseInt(value, 10));
			}
		},
		[pagination]
	);

	// Cleanup right panel on unmount
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
			>
				{/* Filters */}
				<ContactListOverviewFilters
					filters={contactFilters.filters}
					onFilterChange={contactFilters.setFilter}
					onClearFilters={contactFilters.clearFilters}
					hasActiveFilters={contactFilters.hasActiveFilters}
				/>

				{/* Contact Table */}
				<div className={styles.tableContainer}>
					{isLoading ? (
						<ContactListSkeleton />
					) : (
						<BaseTable
							data={campaignContacts?.contacts || []}
							columns={columns}
							onRowClick={handleContactClick}
							filterMode='server'
							onSortingChange={setSorting}
							emptyMessage={
								contactFilters.hasActiveFilters
									? 'No contacts found matching the selected filters.'
									: 'No contacts available.'
							}
							getRowClassName={() => styles.contactRow}
						/>
					)}
				</div>

				{/* Pagination */}
				<PaginationControls
					currentPage={pagination.currentPage}
					totalPages={totalPages}
					itemsPerPage={pagination.itemsPerPage}
					totalItems={campaignContacts?.total || 0}
					onPageChange={pagination.setCurrentPage}
					onItemsPerPageChange={handleItemsPerPageChange}
					searchTerm=''
					isLoading={isLoading}
					itemLabel='contacts'
				/>
			</SectionCard>
		</>
	);
};

export default ContactListOverview;
