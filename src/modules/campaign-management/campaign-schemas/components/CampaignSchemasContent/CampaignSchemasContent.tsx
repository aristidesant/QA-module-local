import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Text, Modal, ActionIcon, Tooltip } from '@mantine/core';
import { IconPlus, IconDatabase } from '@tabler/icons-react';
import BaseTable from '~/components/BaseTable';
import EmptyState from '~/components/EmptyState';
import { useDeleteCampaignContactSchema } from '~/queries/campaignContactSchemasQueries';
import { CampaignContactSchema } from '~/models/CampaignContactSchemaModel';
import { notifications } from '@mantine/notifications';
import CampaignSchemasForm from '../CampaignSchemasForm';
import PaginationControls from '~/components/PaginationControls';

import styles from './CampaignSchemasContent.module.css';
import { useCampaignSchemasWithFilters } from '~/modules/campaigns/hooks/useFilteredSchemas';
import CampaignSchemasFilters from '../CampaignSchemasFilters';
import SectionCard from '~/components/SectionCard/SectionCard';
import { useCampaignSchemasColumns } from './useCampaignSchemasColumns';

interface CampaignSchemasContentProps {
	createModalOpened: boolean;
	setCreateModalOpened: (opened: boolean) => void;
}

const CampaignSchemasContent: React.FC<CampaignSchemasContentProps> = ({
	createModalOpened,
	setCreateModalOpened,
}) => {
	const { t } = useTranslation('campaign-management');
	const [editModalOpened, setEditModalOpened] = useState(false);
	const [selectedSchema, setSelectedSchema] =
		useState<CampaignContactSchema | null>(null);

	// Use the combined hook that handles both server and client filtering
	const { schemas, pagination, filters, setPagination, setFilters, isLoading } =
		useCampaignSchemasWithFilters();

	const deleteSchema = useDeleteCampaignContactSchema();

	const handleEdit = (schema: CampaignContactSchema) => {
		setSelectedSchema(schema);
		setEditModalOpened(true);
	};

	const handleDelete = async (id: number) => {
		try {
			await deleteSchema.mutateAsync(id);
			notifications.show({
				title: t('status.success', { ns: 'common' }),
				message: t('setup.schemas.deleteSuccess'),
				color: 'green',
			});
		} catch (error) {
			notifications.show({
				title: t('status.error', { ns: 'common' }),
				message: t('setup.schemas.deleteError'),
				color: 'red',
			});
		}
	};

	const columns = useCampaignSchemasColumns({
		onEdit: handleEdit,
		onDelete: handleDelete,
		isDeletePending: deleteSchema.isPending,
	});

	// Show empty state only if no schemas exist at all (not filtered)
	const showEmptyState =
		schemas.length === 0 &&
		!isLoading &&
		!filters.search &&
		!filters.objectiveId;

	if (showEmptyState) {
		return (
			<div className={styles.container}>
				<EmptyState
					icon={<IconDatabase size={48} />}
					message={t('setup.schemas.noResults')}
					description={t('setup.schemas.getStarted')}
					action={
						<Button
							leftSection={<IconPlus size={16} />}
							onClick={() => setCreateModalOpened(true)}
						>
							{t('setup.schemas.create')}
						</Button>
					}
				/>

				<Modal
					opened={createModalOpened}
					onClose={() => setCreateModalOpened(false)}
					title={t('setup.schemas.create')}
					size='lg'
				>
					<CampaignSchemasForm
						onSuccess={() => setCreateModalOpened(false)}
						onCancel={() => setCreateModalOpened(false)}
					/>
				</Modal>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<SectionCard
				icon={IconDatabase}
				title={t('setup.schemas.title')}
				description={t('setup.schemas.sectionCardDescription')}
				padding='lg'
				headerActions={
					<Tooltip label={t('setup.schemas.create')} withArrow>
						<ActionIcon
							variant='filled'
							onClick={() => setCreateModalOpened(true)}
							size='xs'
						>
							<IconPlus size={16} />
						</ActionIcon>
					</Tooltip>
				}
			>
				<CampaignSchemasFilters
					filters={filters}
					onFiltersChange={setFilters}
				/>

				{schemas.length === 0 && !isLoading ? (
					<div className={styles.noResultsContainer}>
						<Text size='lg' fw={500} ta='center'>
							{t('setup.schemas.noResultsFilters')}
						</Text>
						<Text size='sm' c='dimmed' ta='center'>
							{t('setup.schemas.noResultsFiltersDescription')}
						</Text>
						<Button
							variant='light'
							onClick={() =>
								setFilters({ ...filters, search: '', objectiveId: null })
							}
							mt='md'
						>
							{t('setup.schemas.clearFilters')}
						</Button>
					</div>
				) : (
					<>
						<BaseTable
							data={schemas}
							columns={columns}
							isLoading={isLoading}
							className={styles.table}
							density='default'
						/>

						<PaginationControls
							currentPage={pagination.page}
							totalPages={Math.ceil(pagination.total / pagination.pageSize)}
							itemsPerPage={pagination.pageSize}
							totalItems={pagination.total}
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
							itemLabel={t('setup.schemas.pagination.itemLabel')}
						/>
					</>
				)}
			</SectionCard>

			{/* Create Modal */}
			<Modal
				opened={createModalOpened}
				onClose={() => setCreateModalOpened(false)}
				title={t('setup.schemas.create')}
				size='lg'
			>
				<CampaignSchemasForm
					onSuccess={() => setCreateModalOpened(false)}
					onCancel={() => setCreateModalOpened(false)}
				/>
			</Modal>

			{/* Edit Modal */}
			<Modal
				opened={editModalOpened}
				onClose={() => {
					setEditModalOpened(false);
					setSelectedSchema(null);
				}}
				title={t('setup.schemas.edit')}
				size='xl'
			>
				{selectedSchema && (
					<CampaignSchemasForm
						schema={selectedSchema}
						onSuccess={() => {
							setEditModalOpened(false);
							setSelectedSchema(null);
						}}
						onCancel={() => {
							setEditModalOpened(false);
							setSelectedSchema(null);
						}}
					/>
				)}
			</Modal>
		</div>
	);
};

export default CampaignSchemasContent;
