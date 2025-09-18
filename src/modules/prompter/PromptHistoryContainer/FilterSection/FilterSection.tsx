import React from 'react';
import { Paper, Group, TextInput, Select, Text, Button } from '@mantine/core';
import { IconSearch, IconFilter, IconRefresh } from '@tabler/icons-react';
import { usePromptHistoryStore } from '../usePromptHistoryStore';
import styles from './FilterSection.module.css';

interface FilterSectionProps {
	resultCount: number;
	onRefresh: () => void;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
	resultCount,
	onRefresh,
}) => {
	const { searchTerm, statusFilter, setSearchTerm, setStatusFilter } =
		usePromptHistoryStore();

	return (
		<Paper p='md' withBorder className={styles.filtersSection}>
			<Group justify='space-between' align='flex-end'>
				<Group gap='md' style={{ flex: 1 }}>
					<TextInput
						placeholder='Search prompts...'
						leftSection={<IconSearch size={16} />}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.currentTarget.value)}
						style={{ minWidth: 250 }}
					/>
					<Select
						placeholder='Filter by status'
						leftSection={<IconFilter size={16} />}
						value={statusFilter}
						onChange={setStatusFilter}
						data={[
							{ value: 'ACTIVE', label: 'Active' },
							{ value: 'INACTIVE', label: 'Inactive' },
						]}
						clearable
						style={{ minWidth: 150 }}
					/>
				</Group>
				<Group gap='xs'>
					<Text size='sm' c='dimmed'>
						{resultCount} prompt{resultCount !== 1 ? 's' : ''}
					</Text>
					<Button
						leftSection={<IconRefresh size={16} />}
						onClick={onRefresh}
						variant='light'
						size='sm'
					>
						Refresh
					</Button>
				</Group>
			</Group>
		</Paper>
	);
};
