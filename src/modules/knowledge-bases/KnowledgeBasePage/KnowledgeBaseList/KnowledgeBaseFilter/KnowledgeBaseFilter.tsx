import React from 'react';
import { TextInput, Select, Group, Text, Button } from '@mantine/core';
import { IconSearch, IconRefresh } from '@tabler/icons-react';
import FilterContainer from '~/components/FilterContainer/FilterContainer';
import {
	KnowledgeBaseStatus,
	KnowledgeBaseType,
} from '~/models/KnowledgeBaseModel';
import classes from './KnowledgeBaseFilter.module.css';

interface FilterProps {
	query: string;
	setQuery: (value: string) => void;
	statusFilter: string | null;
	setStatusFilter: (value: string | null) => void;
	typeFilter: string | null;
	setTypeFilter: (value: string | null) => void;
	total: number;
	count: number;
	refetch: () => void;
}

const KnowledgeBaseFilter: React.FC<FilterProps> = ({
	query,
	setQuery,
	statusFilter,
	setStatusFilter,
	typeFilter,
	setTypeFilter,
	total,
	count,
	refetch,
}) => {
	return (
		<FilterContainer>
			<TextInput
				leftSection={<IconSearch size={16} />}
				placeholder='Search knowledge bases...'
				value={query}
				onChange={(e) => setQuery(e.currentTarget.value)}
				size='sm'
				className={classes.searchInput}
			/>
			<Group gap='xs' wrap='nowrap' className={classes.selectGroup}>
				<Select
					placeholder='All statuses'
					data={[
						{ value: '', label: 'All statuses' },
						...Object.values(KnowledgeBaseStatus).map((s) => ({
							value: s,
							label: s,
						})),
					]}
					value={statusFilter ?? ''}
					onChange={(val) => setStatusFilter(val || null)}
					size='sm'
					className={classes.filterSelect}
					allowDeselect
					checkIconPosition='right'
				/>
				<Select
					placeholder='All types'
					data={[
						{ value: '', label: 'All types' },
						...Object.values(KnowledgeBaseType).map((t) => ({
							value: t,
							label: t,
						})),
					]}
					value={typeFilter ?? ''}
					onChange={(val) => setTypeFilter(val || null)}
					size='sm'
					className={classes.filterSelect}
					allowDeselect
					checkIconPosition='right'
				/>
			</Group>
			<Group gap='xs' wrap='nowrap' className={classes.toolbarActions}>
				<Text size='sm' className={classes.resultsCounter}>
					{count} of {total} items
				</Text>
				<Button
					onClick={() => refetch()}
					variant='subtle'
					size='sm'
					leftSection={<IconRefresh size={16} />}
					className={classes.refreshButton}
				>
					Refresh
				</Button>
			</Group>
		</FilterContainer>
	);
};

export default KnowledgeBaseFilter;
