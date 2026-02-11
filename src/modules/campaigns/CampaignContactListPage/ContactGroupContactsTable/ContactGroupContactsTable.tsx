import { useEffect, useMemo, useCallback, useState } from 'react';
import { LoadingOverlay, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
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
import EditContactModal from './EditContactModal';
import { useDeleteContact } from '~/queries/contactsQueries';
import { modals } from '@mantine/modals';
import ContactListSkeleton from './ContactListSkeleton';
import { useGetContactGroupContacts } from '~/queries/contactsQueries';
import {
	useExportContactGroupFileOriginal,
	useAppendContactGroupFile,
	useUploadContactGroupFile,
} from '~/queries/contactGroupFilesQueries';
import EditablePhoneNumbersTable from './EditablePhoneNumbersTable';
import AppendContactsModal from './AppendContactsModal';
import OutboundCallTasksModal from './OutboundCallTasksModal';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import { getErrorMessage } from '~/utils/httpClient';

interface ContactGroupContactsTableProps {
	contactGroupId: number;
	campaignId?: number; // needed to resolve active schema for append workflow
}

export const ContactGroupContactsTable: React.FC<
	ContactGroupContactsTableProps
> = ({ contactGroupId, campaignId }) => {
	const { t } = useTranslation('campaign.contact-list');
	const { setRightComponent } = useCampaignsStore();
	const { canPerformAction } = usePermissions();

	const canExportContacts = canPerformAction(
		ModuleEnum.CONTACTS,
		PermissionEnum.EXPORT
	);
	const canUpdateContacts = canPerformAction(
		ModuleEnum.CONTACTS,
		PermissionEnum.UPDATE
	);
	const canDeleteContacts = canPerformAction(
		ModuleEnum.CONTACTS,
		PermissionEnum.DELETE
	);

	// Pagination state
	const pagination = usePagination({
		initialItemsPerPage: 10,
		searchDebounceMs: 500,
	});

	// Sorting state
	const [sorting, setSorting] = useState<SortingState>([]);

	// Extract sorting values for API
	const sortBy = sorting?.[0]?.id;
	const sortOrder = sorting?.[0]?.desc ? 'desc' : 'asc';

	// Filter state
	const contactFilters = useContactFilters({
		debounceMs: 500,
	});

	// Export query
	const exportQuery = useExportContactGroupFileOriginal(contactGroupId);

	// Removed: latest file prefetch is not needed for append flow

	// Schema is no longer required for append

	// Append modal state
	const [showAppendModal, setShowAppendModal] = useState(false);

	// Append mutation
	const appendMutation = useAppendContactGroupFile({
		onSuccess: () => {
			notifications.show({
				title: t('contactsTable.notifications.appended.title'),
				message: t('contactsTable.notifications.appended.message'),
				color: 'green',
			});
			void groupContactsQuery.refetch();
		},
		onError: (error) => {
			notifications.show({
				title: t('common:status.error'),
				message: getErrorMessage(error),
				color: 'red',
			});
		},
	});

	// Upload mutation (to upload new CSV prior to append)
	const uploadMutation = useUploadContactGroupFile({});

	const handleOpenAppendModal = () => {
		if (!canExportContacts) return;
		// Open immediately for a snappier UX
		setShowAppendModal(true);
	};

	// Step 1: Upload CSV and return file id
	const handleUploadCsv = async (file: File | null) => {
		if (!file) throw new Error(t('contactsTable.errors.noFileProvided'));
		if (!canExportContacts)
			throw new Error(t('contactsTable.errors.noImportPerm'));
		if (!campaignId) {
			throw new Error(t('contactsTable.errors.noCampaignId'));
		}
		const isCsv = file.name.toLowerCase().endsWith('.csv');
		if (!isCsv) {
			throw new Error(t('contactsTable.errors.onlyCsv'));
		}
		const uploaded = await uploadMutation.mutateAsync({ file, campaignId });
		return { contactGroupFileId: uploaded.contactGroupFileId };
	};

	// Step 2: Append uploaded file to list (schema ignored)
	const handleAppendUploadedFile = async (contactGroupFileId: number) => {
		if (!canExportContacts) {
			throw new Error(t('contactsTable.errors.noImportPerm'));
		}
		await appendMutation.mutateAsync({
			contactGroupId,
			contactGroupFileId,
		});
	};

	// Query for contacts with server-side filtering and pagination
	const groupContactsQuery = useGetContactGroupContacts(contactGroupId, {
		limit: pagination.itemsPerPage,
		offset: (pagination.currentPage - 1) * pagination.itemsPerPage,
		name: contactFilters.debouncedFilters.name || undefined,
		email: contactFilters.debouncedFilters.email || undefined,
		phone: contactFilters.debouncedFilters.phone || undefined,
		sortBy: sortBy || undefined,
		sortOrder: sortBy ? sortOrder : undefined,
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

	// Edit contact modal state
	const [editContactId, setEditContactId] = useState<number | null>(null);
	const [outboundTasksContact, setOutboundTasksContact] =
		useState<Contact | null>(null);
	const [deletingContactId, setDeletingContactId] = useState<number | null>(
		null
	);
	const deleteContactMutation = useDeleteContact();

	const handleEditContact = useCallback((contact: Contact) => {
		setEditContactId(contact.id);
	}, []);

	const handleDeleteContact = useCallback(
		(contact: Contact) => {
			modals.openConfirmModal({
				title: t('contactsTable.deleteConfirm.title'),
				children: t('contactsTable.deleteConfirm.message', {
					name: `${contact.firstName} ${contact.lastName}`,
				}),
				labels: {
					confirm: t('common:actions.delete'),
					cancel: t('common:actions.cancel'),
				},
				confirmProps: { color: 'red' },
				onConfirm: () => {
					setDeletingContactId(contact.id);
					deleteContactMutation.mutate(contact.id.toString(), {
						onSuccess: () => {
							notifications.show({
								title: t('contactsTable.notifications.deleted.title'),
								message: t('contactsTable.notifications.deleted.message'),
								color: 'green',
							});
							setDeletingContactId(null);
							void groupContactsQuery.refetch();
						},
						onError: (error) => {
							notifications.show({
								title: t('common:status.error'),
								message: getErrorMessage(error),
								color: 'red',
							});
							setDeletingContactId(null);
						},
					});
				},
			});
		},
		[deleteContactMutation, groupContactsQuery, t]
	);

	const handleViewOutboundTasks = useCallback((contact: Contact) => {
		setOutboundTasksContact(contact);
	}, []);

	const columns = useContactColumns(
		canUpdateContacts ? handleEditContact : undefined,
		canDeleteContacts ? handleDeleteContact : undefined,
		handleViewOutboundTasks,
		(contactId) =>
			deleteContactMutation.isPending && deletingContactId === contactId
	);

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
				location: t('contactDetails.mockData.location'),
				language: t('contactDetails.mockData.language'),
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
		if (!canExportContacts) return;
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
					title: t('contactsTable.notifications.exported.title'),
					message: t('contactsTable.notifications.exported.message'),
					color: 'green',
				});
			}
		} catch (error) {
			notifications.show({
				title: t('common:status.error'),
				message: getErrorMessage(error),
				color: 'red',
			});
		}
	}, [exportQuery, contactGroupId, canExportContacts, t]);

	const handleReloadContacts = useCallback(() => {
		void groupContactsQuery.refetch();
	}, [groupContactsQuery]);

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
				onReload={handleReloadContacts}
				isReloading={groupContactsQuery.isFetching}
				onExport={canExportContacts ? handleExport : undefined}
				isExporting={canExportContacts ? exportQuery.isFetching : false}
				onAppend={canExportContacts ? handleOpenAppendModal : undefined}
				isAppending={
					canExportContacts
						? appendMutation.isPending || uploadMutation.isPending
						: false
				}
			/>

			{/* Contact Table */}
			<div className={styles.tableContainer} style={{ position: 'relative' }}>
				{isLoading ? (
					<ContactListSkeleton />
				) : error ? (
					<div>
						{t('common:status.error')}: {getErrorMessage(error)}
					</div>
				) : (
					<BaseTable
						data={contacts}
						columns={columns}
						onRowClick={handleContactClick}
						filterMode='server'
						initialSort={sorting}
						onSortingChange={setSorting}
						enableExpanding={true}
						renderExpandedRow={(contact) =>
							contact.phoneNumbers && contact.phoneNumbers.length > 0 ? (
								<div style={{ padding: '8px 0' }}>
									<EditablePhoneNumbersTable
										contactId={contact.id}
										contactGroupId={contactGroupId}
										phoneNumbers={contact.phoneNumbers}
									/>
								</div>
							) : (
								<Text size='sm' c='dimmed' p='md'>
									{t('contactsTable.noPhoneNumbers')}
								</Text>
							)
						}
						emptyMessage={
							contactFilters.hasActiveFilters
								? t('contactsTable.emptyFiltered')
								: t('contactsTable.empty')
						}
						getRowClassName={getRowClassName}
					/>
				)}
				{!isLoading && groupContactsQuery.isFetching && (
					<LoadingOverlay
						visible
						zIndex={1}
						overlayProps={{ radius: 'sm', blur: 1 }}
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
				itemLabel={t('contactsTable.itemLabel')}
			/>

			{canExportContacts && showAppendModal && (
				<AppendContactsModal
					onClose={() => setShowAppendModal(false)}
					onUpload={(file) => handleUploadCsv(file)}
					onAppend={(fileId) => handleAppendUploadedFile(fileId)}
					isUploading={uploadMutation.isPending}
					isAppending={appendMutation.isPending}
				/>
			)}
			<EditContactModal
				opened={editContactId != null}
				onClose={() => setEditContactId(null)}
				contactId={editContactId}
				contactGroupId={contactGroupId}
			/>
			<OutboundCallTasksModal
				opened={outboundTasksContact != null}
				onClose={() => setOutboundTasksContact(null)}
				contact={outboundTasksContact}
			/>
		</>
	);
};

export default ContactGroupContactsTable;
