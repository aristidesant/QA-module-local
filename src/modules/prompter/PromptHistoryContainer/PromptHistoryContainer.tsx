import { useMemo } from 'react';
import { Stack, Text, Paper, Center, Loader } from '@mantine/core';
import BaseTable from '~/components/BaseTable';
import { useGetAllPrompts } from '~/modules/prompt-generator/queries/promptGeneratorQueries';
import type { Prompt } from '~/models/PromptModel';
import { usePromptHistoryStore } from './usePromptHistoryStore';
import usePromptHistoryColumns from './usePromptHistoryColumns';
import { ViewPromptModal } from './ViewPromptModal';
import { EditPromptModal } from './EditPromptModal';
import { FilterSection } from './FilterSection';
import styles from './PromptHistoryContainer.module.css';

export const PromptHistoryContainer: React.FC = () => {
	const { searchTerm, statusFilter } = usePromptHistoryStore();
	const { data: prompts, isLoading, isError, refetch } = useGetAllPrompts();

	const columns = usePromptHistoryColumns();

	// Filter prompts based on search and status
	const filteredPrompts = useMemo(() => {
		if (!prompts) return [];

		return prompts.filter((prompt) => {
			const matchesSearch =
				!searchTerm ||
				prompt.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				prompt.generatedPrompt
					?.toLowerCase()
					.includes(searchTerm.toLowerCase());

			const matchesStatus = !statusFilter || prompt.status === statusFilter;

			return matchesSearch && matchesStatus;
		});
	}, [prompts, searchTerm, statusFilter]);

	if (isLoading) {
		return (
			<Center h={400}>
				<Loader size='lg' />
			</Center>
		);
	}

	if (isError) {
		return (
			<Paper p='xl' withBorder>
				<Stack align='center' gap='md'>
					<Text c='red' size='lg' fw={500}>
						Failed to load prompt history
					</Text>
					<Text size='sm' c='red' ta='center'>
						Please check your connection and try again.
					</Text>
				</Stack>
			</Paper>
		);
	}

	return (
		<>
			<Stack gap='md' className={styles.container}>
				{/* Header with filters */}
				<FilterSection
					resultCount={filteredPrompts.length}
					onRefresh={refetch}
				/>

				{/* Prompts table */}
				<Paper withBorder className={styles.tableContainer}>
					{filteredPrompts.length === 0 ? (
						<Center h={300} className={styles.emptyState}>
							<Stack align='center' gap='md'>
								<Text size='lg' fw={500} c='dimmed'>
									No prompts found
								</Text>
								<Text size='sm' c='dimmed' ta='center'>
									{searchTerm || statusFilter
										? 'Try adjusting your search or filter criteria'
										: 'Start creating prompts to see them here'}
								</Text>
							</Stack>
						</Center>
					) : (
						<BaseTable<Prompt>
							data={filteredPrompts}
							columns={columns}
							density='default'
							className={styles.table}
						/>
					)}
				</Paper>
			</Stack>

			{/* Modals */}
			<ViewPromptModal />
			<EditPromptModal />
		</>
	);
};
