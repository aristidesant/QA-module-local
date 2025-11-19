import { useEffect, useMemo, useCallback, useState } from 'react';
import { Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
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
import {
	useExportContactGroupFileOriginal,
	useLatestContactGroupFile,
	useAppendContactGroupFile,
	useUploadContactGroupFile,
} from '~/queries/contactGroupFilesQueries';
import PhoneNumbersTable from './PhoneNumbersTable';
import AppendContactsModal from './AppendContactsModal';

interface ContactGroupContactsTableProps {
	contactGroupId: number;
	campaignId?: number; // needed to resolve active schema for append workflow
}

export const ContactGroupContactsTable: React.FC<
	ContactGroupContactsTableProps
> = ({ contactGroupId, campaignId }) => {
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

	// Export query
	const exportQuery = useExportContactGroupFileOriginal(contactGroupId);

	// Latest file (needed before append)
	const latestFileQuery = useLatestContactGroupFile(contactGroupId, false);

	// Schema is no longer required for append

	// Append modal state
	const [showAppendModal, setShowAppendModal] = useState(false);

	// Append mutation
	const appendMutation = useAppendContactGroupFile({
		onSuccess: () => {
			notifications.show({
				title: 'Contacts appended',
				message: 'New contacts were added to the list.',
				color: 'green',
			});
			void groupContactsQuery.refetch();
		},
		onError: (error) => {
			notifications.show({
				title: 'Append failed',
				message:
					error instanceof Error
						? error.message
						: 'Unable to append contacts. Please try again.',
				color: 'red',
			});
		},
	});

	// Upload mutation (to upload new CSV prior to append)
	const uploadMutation = useUploadContactGroupFile({});

	const handleOpenAppendModal = async () => {
		// Fetch latest existing file (baseline, optional)
		await latestFileQuery.refetch();
		setShowAppendModal(true);
	};

	// Step 1: Upload CSV and return file id
	const handleUploadCsv = async (file: File | null) => {
		if (!file) throw new Error('No file provided');
		if (!campaignId) {
			throw new Error('Campaign ID is required to upload file.');
		}
		const isCsv = file.name.toLowerCase().endsWith('.csv');
		if (!isCsv) {
			throw new Error('Only CSV files are supported.');
		}
		const uploaded = await uploadMutation.mutateAsync({ file, campaignId });
		return { contactGroupFileId: uploaded.contactGroupFileId };
	};

	// Step 2: Append uploaded file to list (schema ignored)
	const handleAppendUploadedFile = async (contactGroupFileId: number) => {
		await appendMutation.mutateAsync({
			contactGroupId,
			contactGroupFileId,
		});
	};

	// Query for contacts with server-side filtering and pagination
	const groupContactsQuery = useGetContactGroupContacts(contactGroupId, {
		limit: pagination.itemsPerPage,
		offset: (pagination.currentPage - 1) * pagination.itemsPerPage,
		firstName: contactFilters.debouncedFilters.name || undefined,
		email: contactFilters.debouncedFilters.email || undefined,
		phone: contactFilters.debouncedFilters.phone || undefined,
	});

	// Get contacts from query and filter out those with validation errors
	const allContacts = groupContactsQuery.data?.data ?? [];
	const contacts = useMemo(() => {
		return allContacts.filter((contact) => {
			// Exclude contacts that have any phone number with a validation error
			const hasFaultyPhone = contact.phoneNumbers?.some(
				(phone) => phone.validationError
			);
			return !hasFaultyPhone;
		});
	}, [allContacts]);

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

	// Row className
	const getRowClassName = useCallback(() => {
		return styles.contactRow;
	}, []);

	// Handle export
	const handleExport = useCallback(async () => {
		try {
			const result = await exportQuery.refetch();
			if (result.data) {
				// Create a Blob from the CSV content
				const blob = new Blob([result.data], {
					type: 'text/csv;charset=utf-8;',
				});
				const url = URL.createObjectURL(blob);

				// Create a temporary link and trigger download
				const link = document.createElement('a');
				link.href = url;
				link.download = `contacts-${contactGroupId}.csv`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);

				// Clean up the URL object
				URL.revokeObjectURL(url);

				notifications.show({
					title: 'Export Successful',
					message: 'Contacts exported successfully',
					color: 'green',
				});
			}
		} catch (error) {
			notifications.show({
				title: 'Export Failed',
				message:
					error instanceof Error ? error.message : 'Failed to export contacts',
				color: 'red',
			});
		}
	}, [exportQuery, contactGroupId]);

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
				onExport={handleExport}
				isExporting={exportQuery.isFetching}
				onAppend={handleOpenAppendModal}
				isAppending={appendMutation.isPending || uploadMutation.isPending}
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

			{showAppendModal && (
				<AppendContactsModal
					onClose={() => setShowAppendModal(false)}
					onUpload={(file) => handleUploadCsv(file)}
					onAppend={(fileId) => handleAppendUploadedFile(fileId)}
					isUploading={uploadMutation.isPending}
					isAppending={appendMutation.isPending}
				/>
			)}
		</>
	);
};

export default ContactGroupContactsTable;
