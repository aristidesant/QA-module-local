import React, { useState, useEffect } from 'react';
import { Text, Card, Button } from '@mantine/core';
import { IconAlertCircle, IconPhoneOff, IconPlus } from '@tabler/icons-react';
import {
	useDoNotCallList,
	useDeleteDoNotCall,
	useCreateDoNotCall,
	useUpdateDoNotCall,
} from '~/queries/doNotCallQueries';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import type {
	DoNotCallModel,
	DoNotCallReason,
	DoNotCallStatus,
} from '~/models/DoNotCallModel';
import DoNotCallFilters from '~/modules/do-not-call/DoNotCallFilters';
import { usePagination } from '~/hooks/usePagination';
import PaginationControls from '~/components/PaginationControls';
import EmptyState from '~/components/EmptyState';
import BaseTable from '~/components/BaseTable';
import { useDoNotCallColumns } from '~/modules/do-not-call/hooks/useDoNotCallColumns';
import DoNotCallForm from '~/modules/do-not-call/DoNotCallForm';
import SectionCard from '~/components/SectionCard';

interface DoNotCallSectionProps {
	campaignId?: number;
}

interface DoNotCallFiltersType {
	reason?: DoNotCallReason;
	status?: DoNotCallStatus;
}

const DoNotCallSection: React.FC<DoNotCallSectionProps> = () => {
	const pagination = usePagination({
		initialItemsPerPage: 10,
		searchDebounceMs: 500,
	});

	const [filters, setFilters] = useState<DoNotCallFiltersType>({
		status: 'active',
	});
	const [selectedEntry, setSelectedEntry] = useState<DoNotCallModel | null>(
		null
	);

	useEffect(() => {
		pagination.setCurrentPage(1);
	}, [filters]);

	const {
		data: doNotCallResponse,
		isLoading,
		isFetching,
		isError,
		error,
		refetch: reloadDoNotCall,
	} = useDoNotCallList({
		...pagination.getApiParams(),
		phoneNumber: pagination.debouncedSearch || undefined,
		...filters,
	});

	const { mutateAsync: deleteDoNotCall } = useDeleteDoNotCall();
	const { mutateAsync: createDoNotCall } = useCreateDoNotCall();
	const { mutateAsync: updateDoNotCall } = useUpdateDoNotCall();

	const totalPages = doNotCallResponse?.total
		? pagination.calculateTotalPages(doNotCallResponse.total)
		: 0;

	const columns = useDoNotCallColumns({
		onEdit: (entry) => {
			setSelectedEntry(entry);
			modals.open({
				modalId: 'edit-dnc-entry',
				title: 'Edit Do Not Call Entry',
				children: (
					<DoNotCallForm
						entry={entry}
						onSubmit={async (data) => {
							try {
								await updateDoNotCall({ id: entry.id, data });
								reloadDoNotCall();
								setSelectedEntry(null);
								modals.close('edit-dnc-entry');
								notifications.show({
									title: 'Entry Updated',
									message:
										'The Do Not Call entry has been successfully updated.',
									color: 'green',
								});
							} catch (error) {
								notifications.show({
									title: 'Error',
									message: 'Failed to update entry. Please try again.',
									color: 'red',
								});
							}
						}}
						onCancel={() => {
							setSelectedEntry(null);
							modals.close('edit-dnc-entry');
						}}
					/>
				),
				size: 'lg',
				centered: true,
			});
		},
		onDelete: (entry) => {
			modals.openConfirmModal({
				title: 'Delete Do Not Call Entry',
				children: (
					<Text size='sm'>
						Are you sure you want to delete this Do Not Call entry for{' '}
						{entry.phoneNumber}?
					</Text>
				),
				labels: { confirm: 'Delete', cancel: 'Cancel' },
				confirmProps: { color: 'red' },
				onConfirm: async () => {
					try {
						await deleteDoNotCall(entry.id);
						reloadDoNotCall();
						setSelectedEntry(null);
						notifications.show({
							title: 'Entry Deleted',
							message: 'The Do Not Call entry has been successfully deleted.',
							color: 'green',
						});
					} catch (error) {
						notifications.show({
							title: 'Error',
							message: 'Failed to delete entry. Please try again.',
							color: 'red',
						});
					}
				},
			});
		},
	});

	const handleItemsPerPageChange = (value: string | null) => {
		if (value) {
			pagination.setItemsPerPage(parseInt(value, 10));
		}
	};

	const handleShowAddNewModal = () => {
		modals.open({
			modalId: 'create-dnc-entry',
			title: 'Add Do Not Call Entry',
			children: (
				<DoNotCallForm
					onSubmit={async (data) => {
						try {
							await createDoNotCall(data as any);
							reloadDoNotCall();
							modals.close('create-dnc-entry');
							notifications.show({
								title: 'Entry Created',
								message: 'The Do Not Call entry has been successfully created.',
								color: 'green',
							});
						} catch (error) {
							notifications.show({
								title: 'Error',
								message: 'Failed to create entry. Please try again.',
								color: 'red',
							});
						}
					}}
					onCancel={() => {
						modals.close('create-dnc-entry');
					}}
				/>
			),
			size: 'lg',
			centered: true,
		});
	};

	return (
		<SectionCard
			title='Do Not Call List'
			description='Manage phone numbers that should not be contacted for this campaign.'
			headerActions={
				<Button
					size='xs'
					leftSection={<IconPlus size={16} />}
					onClick={handleShowAddNewModal}
				>
					Add Entry
				</Button>
			}
		>
			<DoNotCallFilters
				searchValue={pagination.searchValue}
				onSearchChange={pagination.setSearchValue}
				filters={filters}
				onFiltersChange={setFilters}
			/>

			{isLoading || isFetching ? (
				<Card mt='xs' withBorder>
					<Text c='dimmed' ta='center' py='xl'>
						Loading...
					</Text>
				</Card>
			) : isError ? (
				<Card mt='xs' withBorder>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							padding: 'var(--mantine-spacing-xl)',
						}}
					>
						<IconAlertCircle size={32} color='red' />
						<Text c='red' mt='sm'>
							{error instanceof Error
								? error.message
								: 'Failed to load Do Not Call entries.'}
						</Text>
					</div>
				</Card>
			) : !doNotCallResponse?.data || doNotCallResponse.data.length === 0 ? (
				<Card mt='xs' withBorder>
					<EmptyState
						icon={<IconPhoneOff size={64} stroke={1.2} />}
						message='No entries yet'
						description='Add phone numbers to the Do Not Call list'
						action={
							<Button
								leftSection={<IconPlus size={18} />}
								onClick={handleShowAddNewModal}
							>
								Add Entry
							</Button>
						}
					/>
				</Card>
			) : (
				<>
					<BaseTable
						data={doNotCallResponse?.data || []}
						columns={columns}
						onRowClick={(entry) => setSelectedEntry(entry)}
						selectedKey={selectedEntry?.id?.toString()}
					/>

					<PaginationControls
						currentPage={pagination.currentPage}
						totalPages={totalPages}
						itemsPerPage={pagination.itemsPerPage}
						totalItems={doNotCallResponse?.total || 0}
						onPageChange={pagination.setCurrentPage}
						onItemsPerPageChange={handleItemsPerPageChange}
						searchTerm={pagination.debouncedSearch}
						isLoading={isLoading}
						itemLabel='entries'
					/>
				</>
			)}
		</SectionCard>
	);
};

export default DoNotCallSection;
