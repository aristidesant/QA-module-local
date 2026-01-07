import React, { useState, useEffect } from 'react';
import { Text, Card, Button } from '@mantine/core';
import { useTranslation } from 'react-i18next';
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
	const { t } = useTranslation('do-not-call');
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
				title: t('dialogs.edit.title'),
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
									title: t('toasts.updatedTitle'),
									message: t('toasts.updatedMessage'),
									color: 'green',
								});
							} catch (error) {
								notifications.show({
									title: t('common:status.error'),
									message: t('errors.update'),
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
				title: t('dialogs.delete.title'),
				children: (
					<Text size='sm'>
						{t('dialogs.delete.description', {
							phoneNumber: entry.phoneNumber,
						})}
					</Text>
				),
				labels: {
					confirm: t('common:actions.delete'),
					cancel: t('common:actions.cancel'),
				},
				confirmProps: { color: 'red' },
				onConfirm: async () => {
					try {
						await deleteDoNotCall(entry.id);
						reloadDoNotCall();
						setSelectedEntry(null);
						notifications.show({
							title: t('toasts.deletedTitle'),
							message: t('toasts.deletedMessage'),
							color: 'green',
						});
					} catch (error) {
						notifications.show({
							title: t('common:status.error'),
							message: t('errors.delete'),
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
			title: t('dialogs.create.title'),
			children: (
				<DoNotCallForm
					onSubmit={async (data) => {
						try {
							await createDoNotCall(data as any);
							reloadDoNotCall();
							modals.close('create-dnc-entry');
							notifications.show({
								title: t('toasts.createdTitle'),
								message: t('toasts.createdMessage'),
								color: 'green',
							});
						} catch (error) {
							notifications.show({
								title: t('common:status.error'),
								message: t('errors.create'),
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
			title={t('page.title')}
			description={t('page.description')}
			headerActions={
				<Button
					size='xs'
					leftSection={<IconPlus size={16} />}
					onClick={handleShowAddNewModal}
				>
					{t('page.actions.addEntry')}
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
						{t('common:status.loading')}
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
						<Text size='sm' c='red' mt='sm' ta='center'>
							{error instanceof Error ? error.message : t('errors.load')}
						</Text>
					</div>
				</Card>
			) : !doNotCallResponse?.data || doNotCallResponse.data.length === 0 ? (
				<Card mt='xs' withBorder>
					<EmptyState
						icon={<IconPhoneOff size={64} stroke={1.2} />}
						message={t('empty.title')}
						description={t('empty.description')}
						action={
							<Button
								leftSection={<IconPlus size={18} />}
								onClick={handleShowAddNewModal}
							>
								{t('page.actions.addEntry')}
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
						selectedRowId={selectedEntry?.id?.toString()}
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
						itemLabel={t('pagination.entries')}
					/>
				</>
			)}
		</SectionCard>
	);
};

export default DoNotCallSection;
