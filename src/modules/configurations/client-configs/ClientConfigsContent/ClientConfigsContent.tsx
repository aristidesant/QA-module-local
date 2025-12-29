import { useState } from 'react';
import { Button, Group, Text, Modal } from '@mantine/core';
import { IconPlus, IconSettings } from '@tabler/icons-react';
import BaseTable from '~/components/BaseTable';
import EmptyState from '~/components/EmptyState';
import PaginationControls from '~/components/PaginationControls';
import { useDeleteClientConfig } from '~/queries/useClientConfigs';
import type { ClientConfig } from '~/models/ClientConfig';
import { notifications } from '@mantine/notifications';
import { useClientConfigsStore } from '~/stores/clientConfigsStore';
import { useClientConfigsColumns, useFilteredClientConfigs } from '../hooks';
import { ClientConfigsFilters } from '../ClientConfigsFilters';
import { useTranslation } from 'react-i18next';

import styles from './ClientConfigsContent.module.css';
import { ClientConfigsForm } from '../ClientConfigsForm';

interface ClientConfigsContentProps {
	createModalOpened: boolean;
	setCreateModalOpened: (opened: boolean) => void;
}

export function ClientConfigsContent({
	createModalOpened,
	setCreateModalOpened,
}: ClientConfigsContentProps) {
	const [editModalOpened, setEditModalOpened] = useState(false);
	const [deleteModalOpened, setDeleteModalOpened] = useState(false);
	const [selectedConfig, setSelectedConfig] = useState<ClientConfig | null>(
		null
	);
	const [configToDelete, setConfigToDelete] = useState<ClientConfig | null>(
		null
	);
	const { t } = useTranslation('client-configs');

	const { pagination, setPagination } = useClientConfigsStore();
	const { configs, totalConfigs, allConfigsCount, isLoading } =
		useFilteredClientConfigs();
	const deleteConfig = useDeleteClientConfig();

	const handleEdit = (config: ClientConfig) => {
		setSelectedConfig(config);
		setEditModalOpened(true);
	};

	const handleDeleteClick = (config: ClientConfig) => {
		setConfigToDelete(config);
		setDeleteModalOpened(true);
	};

	const handleDeleteConfirm = async () => {
		if (!configToDelete) return;

		try {
			await deleteConfig.mutateAsync(configToDelete.name);
			notifications.show({
				title: t('content.notifications.deleteSuccessTitle'),
				message: t('content.notifications.deleteSuccessMessage'),
				color: 'green',
			});
			setDeleteModalOpened(false);
			setConfigToDelete(null);
		} catch (error) {
			notifications.show({
				title: t('content.notifications.deleteErrorTitle'),
				message: t('content.notifications.deleteErrorMessage'),
				color: 'red',
			});
		}
	};

	const columns = useClientConfigsColumns(handleEdit, handleDeleteClick);

	// Show empty state only when there are NO configs at all (not when filters don't match)
	const showEmptyState = allConfigsCount === 0 && !isLoading;

	if (showEmptyState) {
		return (
			<div className={styles.container}>
				<EmptyState
					icon={<IconSettings size={48} />}
					message={t('content.empty.message')}
					description={t('content.empty.description')}
					action={
						<Button
							leftSection={<IconPlus size={16} />}
							onClick={() => setCreateModalOpened(true)}
							size='sm'
						>
							{t('content.empty.action')}
						</Button>
					}
				/>

				<Modal
					opened={createModalOpened}
					onClose={() => setCreateModalOpened(false)}
					title={t('content.empty.modalTitle')}
					size='lg'
				>
					<ClientConfigsForm
						onSuccess={() => setCreateModalOpened(false)}
						onCancel={() => setCreateModalOpened(false)}
					/>
				</Modal>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<ClientConfigsFilters />

			{configs.length === 0 && !isLoading ? (
				<div className={styles.noResultsContainer}>
					<Text size='sm' fw={600} ta='center'>
						{t('content.noResults.title')}
					</Text>
					<Text size='sm' c='dimmed' ta='center'>
						{t('content.noResults.description')}
					</Text>
				</div>
			) : (
				<>
					<BaseTable
						data={configs}
						columns={columns}
						isLoading={isLoading}
						className={styles.table}
					/>

					<PaginationControls
						currentPage={pagination.page}
						totalPages={Math.ceil(totalConfigs / pagination.pageSize)}
						itemsPerPage={pagination.pageSize}
						totalItems={totalConfigs}
						onPageChange={(page) => setPagination({ ...pagination, page })}
						onItemsPerPageChange={(value) => {
							if (value) {
								setPagination({
									...pagination,
									page: 1,
									pageSize: parseInt(value, 10),
								});
							}
						}}
						isLoading={isLoading}
						itemLabel={t('content.paginationLabel')}
					/>
				</>
			)}

			{/* Create Modal */}
			<Modal
				opened={createModalOpened}
				onClose={() => setCreateModalOpened(false)}
				title={t('content.modal.createTitle')}
				size='90%'
			>
				<ClientConfigsForm
					onSuccess={() => setCreateModalOpened(false)}
					onCancel={() => setCreateModalOpened(false)}
				/>
			</Modal>

			{/* Edit Modal */}
			<Modal
				opened={editModalOpened}
				onClose={() => {
					setEditModalOpened(false);
					setSelectedConfig(null);
				}}
				title={t('content.modal.editTitle')}
				size='90%'
			>
				{selectedConfig && (
					<ClientConfigsForm
						config={selectedConfig}
						onSuccess={() => {
							setEditModalOpened(false);
							setSelectedConfig(null);
						}}
						onCancel={() => {
							setEditModalOpened(false);
							setSelectedConfig(null);
						}}
					/>
				)}
			</Modal>

			{/* Delete Confirmation Modal */}
			<Modal
				opened={deleteModalOpened}
				onClose={() => {
					setDeleteModalOpened(false);
					setConfigToDelete(null);
				}}
				title={t('content.modal.deleteTitle')}
				size='sm'
			>
				<Text size='sm' mb='md'>
					{t('content.modal.deleteConfirm', {
						name: configToDelete?.name ?? '',
					})}
				</Text>
				<Group justify='flex-end' gap='xs'>
					<Button
						variant='subtle'
						onClick={() => {
							setDeleteModalOpened(false);
							setConfigToDelete(null);
						}}
						size='sm'
					>
						{t('actions.cancel', { ns: 'common' })}
					</Button>
					<Button
						color='red'
						onClick={handleDeleteConfirm}
						loading={deleteConfig.isPending}
						size='sm'
					>
						{t('actions.delete', { ns: 'common' })}
					</Button>
				</Group>
			</Modal>
		</div>
	);
}
