import { useEffect, useMemo, useCallback, useState } from 'react';
import { Text } from '@mantine/core';
import styles from './ContactGroupContactsTable.module.css';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { ContactDetails } from '~/modules/campaigns/CampaignsForm/ContactSection/ContactDetails';
import { usePagination } from '~/hooks/usePagination';
import PaginationControls from '~/components/PaginationControls';
import BaseTable from '~/components/BaseTable';
import ContactGroupContactsTableFilters from './ContactGroupContactsTableFilters';
import { useContactFilters } from './useContactFilters';
import type { Contact } from '~/models/ContactsModel';
import type { SortingState } from '@tanstack/react-table';
import { useContactColumns } from './useContactColumns';
import ContactListSkeleton from './ContactListSkeleton';
import { useGetContactGroupContacts } from '~/queries/contactsQueries';
import PhoneNumbersTable from './PhoneNumbersTable';

interface ContactGroupContactsTableProps {
	contactGroupId: number;
}

export const ContactGroupContactsTable: React.FC<
	ContactGroupContactsTableProps
> = ({ contactGroupId }) => {
	const { setRightComponent } = useCampaignsStore();

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

	// Query for contacts with server-side filtering and pagination
	const groupContactsQuery = useGetContactGroupContacts(contactGroupId, {
		limit: pagination.itemsPerPage,
		offset: (pagination.currentPage - 1) * pagination.itemsPerPage,
		firstName: contactFilters.debouncedFilters.name || undefined,
		email: contactFilters.debouncedFilters.email || undefined,
		phone: contactFilters.debouncedFilters.phone || undefined,
	});

	// Get contacts from query
	const contacts = groupContactsQuery.data?.data ?? [];
	const totalContacts = groupContactsQuery.data?.total ?? 0;
	const isLoading = groupContactsQuery.isLoading;
	const error = groupContactsQuery.error;

	// Calculate total pages
	const totalPages = useMemo(() => {
		return Math.ceil(totalContacts / pagination.itemsPerPage);
	}, [totalContacts, pagination.itemsPerPage]);

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
			const primaryPhone = contact.phoneNumbers?.[0]?.phoneNumber || '';
			const primaryEmail = contact.emails?.[0] || '';

			const contactDetails = {
				id: contact.id.toString(),
				name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
				phone: primaryPhone,
				email: primaryEmail,
				location: 'N/A',
				language: 'Spanish',
				initials: getInitials(contact.firstName || '', contact.lastName || ''),
				phones: contact.phoneNumbers || [],
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

	// Check if contact has validation errors
	const getRowClassName = useCallback((_row: { original: Contact }) => {
		// For now, no validation errors since model doesn't have phoneNumbers
		return styles.contactRow;
	}, []);

	// Cleanup right panel on unmount
	useEffect(() => {
		return () => {
			setRightComponent?.(null);
		};
	}, [setRightComponent]);

	return (
		<>
			{/* Filters */}
			<ContactGroupContactsTableFilters
				filters={contactFilters.filters}
				onFilterChange={contactFilters.setFilter}
				onClearFilters={contactFilters.clearFilters}
				hasActiveFilters={contactFilters.hasActiveFilters}
			/>

			{/* Contact Table */}
			<div className={styles.tableContainer}>
				{isLoading ? (
					<ContactListSkeleton />
				) : error ? (
					<div>
						Error:{' '}
						{error instanceof Error ? error.message : 'An error occurred'}
					</div>
				) : (
					<BaseTable
						data={contacts}
						columns={columns}
						onRowClick={handleContactClick}
						filterMode='server'
						onSortingChange={setSorting}
						enableExpanding={true}
						renderExpandedRow={(contact) =>
							contact.phoneNumbers && contact.phoneNumbers.length > 0 ? (
								<div style={{ padding: '8px 0' }}>
									<PhoneNumbersTable phoneNumbers={contact.phoneNumbers} />
								</div>
							) : (
								<Text size='sm' c='dimmed' p='md'>
									No phone numbers available
								</Text>
							)
						}
						emptyMessage={
							contactFilters.hasActiveFilters
								? 'No contacts found matching the selected filters.'
								: 'No contacts available in this group.'
						}
						getRowClassName={getRowClassName}
					/>
				)}
			</div>

			{/* Pagination */}
			<PaginationControls
				currentPage={pagination.currentPage}
				totalPages={totalPages}
				itemsPerPage={pagination.itemsPerPage}
				totalItems={totalContacts}
				onPageChange={pagination.setCurrentPage}
				onItemsPerPageChange={handleItemsPerPageChange}
				searchTerm=''
				isLoading={isLoading}
				itemLabel='contacts'
			/>
		</>
	);
};

export default ContactGroupContactsTable;
