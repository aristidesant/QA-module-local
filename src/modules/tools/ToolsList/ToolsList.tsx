import { Text, Skeleton, Center, Stack } from '@mantine/core';
import { IconTool } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import useToolsStore from '~/stores/toolsStore';
import { useDeleteTool, useToolsByCategory } from '~/queries/toolQueries';
import type { ToolModel } from '~/models/ToolModel';
import BaseTable from '~/components/BaseTable';
import useToolsListColumns from './useToolsListColumns';
import styles from './ToolsList.module.css';
import EmptyState from '~/components/EmptyState';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '~/utils/httpClient';

interface ToolsListProps {
	onEdit: (toolId: string | number) => void;
}

function ToolsList({ onEdit }: ToolsListProps) {
	const { t } = useTranslation('tools');
	const { t: tCommon } = useTranslation('common');
	const { selectedToolCategory } = useToolsStore();
	const deleteMutation = useDeleteTool();
	const columns = useToolsListColumns({
		onDelete: (tool) => {
			modals.openConfirmModal({
				title: t('deleteConfirm.title'),
				centered: true,
				labels: {
					confirm: t('deleteConfirm.confirm'),
					cancel: tCommon('actions.cancel'),
				},
				confirmProps: { color: 'red' },
				children: (
					<Text size='sm'>
						{t('deleteConfirm.message', { name: tool.name })}
					</Text>
				),
				onConfirm: async () => {
					try {
						await deleteMutation.mutateAsync(tool.id);
						notifications.show({
							message: t('notifications.deleted'),
							color: 'green',
						});
					} catch (error) {
						notifications.show({
							message: t('notifications.deleteFailed', {
								message: getErrorMessage(error),
							}),
							color: 'red',
						});
					}
				},
			});
		},
	});

	const {
		data: tools,
		isLoading,
		error,
	} = useToolsByCategory(selectedToolCategory?.id);

	const handleToolClick = (tool: ToolModel) => {
		onEdit(tool.id);
	};

	const renderContent = () => {
		if (!selectedToolCategory) {
			return (
				<Center className={styles.emptyState}>
					<Stack align='center' gap='md'>
						<IconTool size={48} color='var(--mantine-color-gray-5)' />
						<Text size='lg' fw={500} c='dimmed'>
							{t('list.noCategory.title')}
						</Text>
						<Text size='sm' c='dimmed' ta='center'>
							{t('list.noCategory.description')}
						</Text>
					</Stack>
				</Center>
			);
		}

		if (isLoading) {
			return (
				<Stack gap='xs' px='md' py='sm'>
					{Array.from({ length: 6 }).map((_, i) => (
						<Skeleton key={i} height={44} radius='sm' animate />
					))}
				</Stack>
			);
		}

		if (error) {
			return (
				<Center className={styles.emptyState}>
					<Stack align='center' gap='md'>
						<IconTool size={48} color='var(--mantine-color-red-5)' />
						<Text size='lg' fw={500} c='red'>
							{t('state.errorLoadingTools')}
						</Text>
						<Text size='sm' c='dimmed' ta='center'>
							{error.message}
						</Text>
					</Stack>
				</Center>
			);
		}

		if (!tools || tools.length === 0) {
			return (
				<div className={styles.container}>
					<EmptyState
						icon={<IconTool size={48} color='var(--mantine-color-gray-5)' />}
						message={t('list.empty.message')}
						description={
							<>
								{t('list.empty.descriptionLine1', {
									categoryName: selectedToolCategory?.name,
								})}
								<br />
								{t('list.empty.descriptionLine2')}
							</>
						}
						className={styles.emptyState}
					/>
				</div>
			);
		}

		return (
			<BaseTable<ToolModel>
				data={tools}
				columns={columns}
				onRowClick={handleToolClick}
				getRowClassName={() => styles.tableRow}
			/>
		);
	};

	return <>{renderContent()}</>;
}

export default ToolsList;
