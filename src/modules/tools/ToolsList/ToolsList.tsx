import { Text, Loader, Center, Stack } from '@mantine/core';
import { IconTool } from '@tabler/icons-react';
import useToolsStore from '~/stores/toolsStore';
import { useToolsByCategory } from '~/queries/toolQueries';
import type { ToolModel } from '~/models/ToolModel';
import BaseTable from '~/components/BaseTable';
import useToolsListColumns from './useToolsListColumns';
import styles from './ToolsList.module.css';
import EmptyState from '~/components/EmptyState';
import { useTranslation } from 'react-i18next';

interface ToolsListProps {
	onEdit: (toolId: string | number) => void;
}

function ToolsList({ onEdit }: ToolsListProps) {
	const { t } = useTranslation('tools');
	const { selectedToolCategory } = useToolsStore();
	const columns = useToolsListColumns();

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
				<Center className={styles.loadingState}>
					<Stack align='center' gap='md'>
						<Loader size='lg' />
						<Text size='sm' c='dimmed'>
							{t('state.loadingTools')}
						</Text>
					</Stack>
				</Center>
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
