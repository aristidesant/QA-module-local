import { Text, Loader, Center, Stack, Button } from '@mantine/core';
import { IconPlus, IconTool } from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';
import useToolsStore from '~/stores/toolsStore';
import { useToolsByCategory } from '~/queries/toolQueries';
import type { ToolModel } from '~/models/ToolModel';
import ToolForm from '~/modules/tools/ToolForm';
import BaseTable from '~/components/BaseTable';
import useToolsListColumns from './useToolsListColumns';
import styles from './ToolsList.module.css';
import ToolsListHeader from './ToolsListHeader';

interface ToolsListProps {}

function ToolsList({}: ToolsListProps) {
	const { selectedToolCategory, setToolsCategory } = useToolsStore();
	const columns = useToolsListColumns();

	const {
		data: tools,
		isLoading,
		error,
	} = useToolsByCategory(selectedToolCategory?.id);

	const handleToolClick = (tool: ToolModel) => {
		const toolForm = (
			<ToolForm
				toolId={tool.id}
				onSuccess={() => {
					// Close the form by setting right component to null
					setToolsCategory(selectedToolCategory, null);
				}}
				onCancel={() => {
					// Close the form by setting right component to null
					setToolsCategory(selectedToolCategory, null);
				}}
			/>
		);
		setToolsCategory(selectedToolCategory, toolForm);
	};

	const handleCreateNewTool = () => {
		const toolForm = (
			<ToolForm
				categoryId={selectedToolCategory?.id}
				onSuccess={() => {
					// Close the form by setting right component to null
					setToolsCategory(selectedToolCategory, null);
				}}
				onCancel={() => {
					// Close the form by setting right component to null
					setToolsCategory(selectedToolCategory, null);
				}}
			/>
		);
		setToolsCategory(selectedToolCategory, toolForm);
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
							onCreate={handleCreateNewTool}
						/>
					)}

					<Center className={styles.emptyState}>
						<Stack align='center' gap='md'>
							<IconTool size={48} color='var(--mantine-color-gray-5)' />
							<Text size='lg' fw={500} c='dimmed'>
								No tools in this category
							</Text>
							<Text size='sm' c='dimmed' ta='center'>
								There are no tools under "{selectedToolCategory?.name}"
								category.
								<br />
								Add one to get started.
							</Text>
						</Stack>
					</Center>
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

	return (
		<SectionCard
			description='List of tools'
			title={
				selectedToolCategory
					? `${selectedToolCategory.name} Tools (${tools?.length})`
					: 'Tools'
			}
			headerActions={
				<Button
					leftSection={<IconPlus size={16} />}
					onClick={handleCreateNewTool}
					variant='light'
					size='sm'
				>
					Create New Tool
				</Button>
			}
			icon={IconTool}
			contentSpacing='xs'
		>
			{renderContent()}
		</SectionCard>
	);
}

export default ToolsList;
