import React, { useState, useEffect } from 'react';
import { Text, Card, Button } from '@mantine/core';
import {
	IconAlertCircle,
	IconPhoneOff,
	IconPlus,
	IconTrash,
} from '@tabler/icons-react';
import {
	useDoNotCallList,
	useDeleteDoNotCall,
	useCreateDoNotCall,
	useUpdateDoNotCall,
	useCleanExpiredDoNotCall,
} from '~/queries/doNotCallQueries';
import styles from './DoNotCallContent.module.css';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import type {
	DoNotCallModel,
	DoNotCallReason,
	DoNotCallStatus,
} from '~/models/DoNotCallModel';
import DoNotCallFilters from '../DoNotCallFilters';
import { usePagination } from '~/hooks/usePagination';
import PaginationControls from '~/components/PaginationControls';
import EmptyState from '~/components/EmptyState';
import BaseTable from '~/components/BaseTable';
import { useDoNotCallColumns } from '../hooks/useDoNotCallColumns';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import DoNotCallForm from '../DoNotCallForm';
import { useTranslation } from 'react-i18next';
import type { DoNotCallCreateRequest } from '~/models/DoNotCallModel';
import SectionCard from '~/components/SectionCard';

interface DoNotCallFiltersType {
	reason?: DoNotCallReason;
	status?: DoNotCallStatus;
}

export const DoNotCallContent: React.FC = () => {
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
	const { mutateAsync: cleanExpired } = useCleanExpiredDoNotCall();

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
							} catch {
								notifications.show({
									title: t('status.error', { ns: 'common' }),
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
					confirm: t('actions.delete', { ns: 'common' }),
					cancel: t('actions.cancel', { ns: 'common' }),
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
					} catch {
						notifications.show({
							title: t('status.error', { ns: 'common' }),
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
							if (!('phoneNumber' in data)) {
								throw new Error('Missing phoneNumber for create request');
							}
							await createDoNotCall(data as DoNotCallCreateRequest);
							reloadDoNotCall();
							modals.close('create-dnc-entry');
							notifications.show({
								title: t('toasts.createdTitle'),
								message: t('toasts.createdMessage'),
								color: 'green',
							});
						} catch {
							notifications.show({
								title: t('status.error', { ns: 'common' }),
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

	const handleCleanExpired = async () => {
		modals.openConfirmModal({
			title: t('dialogs.cleanExpired.title'),
			children: <Text size='sm'>{t('dialogs.cleanExpired.description')}</Text>,
			labels: {
				confirm: t('dialogs.cleanExpired.confirm'),
				cancel: t('actions.cancel', { ns: 'common' }),
			},
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				try {
					const result = await cleanExpired();
					reloadDoNotCall();
					notifications.show({
						title: t('toasts.cleanedTitle'),
						message: t('toasts.cleanedMessage', { count: result.cleaned }),
						color: 'green',
					});
				} catch {
					notifications.show({
						title: t('status.error', { ns: 'common' }),
						message: t('errors.cleanExpired'),
						color: 'red',
					});
				}
			},
		});
	};

	return (
		<ContentContainer
			title={t('page.title')}
			description={t('page.description')}
		>
			<div className={styles.root}>
				<SectionCard
					title={t('list.title')}
					contentSpacing='sm'
					actions={{
						primary: {
							kind: 'add',
							label: t('page.actions.addEntry'),
							onClick: handleShowAddNewModal,
						},
						secondary: [
							{
								kind: 'delete',
								icon: IconTrash,
								label: t('page.actions.cleanExpired'),
								color: 'red',
								onClick: handleCleanExpired,
							},
						],
					}}
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
								{t('status.loading', { ns: 'common' })}
							</Text>
						</Card>
					) : isError ? (
						<div className={styles.errorContainer}>
							<IconAlertCircle size={32} color='red' />
							<Text c='red' mt='sm'>
								{error instanceof Error ? error.message : t('errors.load')}
							</Text>
						</div>
					) : !doNotCallResponse?.data ||
					  doNotCallResponse.data.length === 0 ? (
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
			</div>
		</ContentContainer>
	);
};
