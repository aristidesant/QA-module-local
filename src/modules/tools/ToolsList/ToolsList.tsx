import { Text, Loader, Center, Stack } from '@mantine/core';
import { IconTool } from '@tabler/icons-react';
import useToolsStore from '~/stores/toolsStore';
import { useToolsByCategory } from '~/queries/toolQueries';
import type { ToolModel } from '~/models/ToolModel';
import BaseTable from '~/components/BaseTable';
import useToolsListColumns from './useToolsListColumns';
import styles from './ToolsList.module.css';
import ToolsListHeader from './ToolsListHeader';
import EmptyState from '~/components/EmptyState';

interface ToolsListProps {
	onCreate: () => void;
	onEdit: (toolId: string | number) => void;
}

function ToolsList({ onCreate, onEdit }: ToolsListProps) {
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
							Select a category first
						</Text>
						<Text size='sm' c='dimmed' ta='center'>
							Choose a tool category from the sidebar to view its tools
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
							Loading tools...
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
							Error loading tools
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
					{selectedToolCategory && (
						<ToolsListHeader
							category={selectedToolCategory}
							onCreate={onCreate}
						/>
					)}

					<EmptyState
						icon={<IconTool size={48} color='var(--mantine-color-gray-5)' />}
						message='No tools in this category'
						description={
							<>
								There are no tools under "{selectedToolCategory?.name}"
								category.
								<br />
								Add one to get started.
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
