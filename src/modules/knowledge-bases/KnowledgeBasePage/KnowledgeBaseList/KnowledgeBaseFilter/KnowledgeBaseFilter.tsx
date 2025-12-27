import React from 'react';
import { TextInput, Select, Group, Text, Button } from '@mantine/core';
import { IconSearch, IconRefresh } from '@tabler/icons-react';
import FilterContainer from '~/components/FilterContainer/FilterContainer';
import {
	KnowledgeBaseStatus,
	KnowledgeBaseType,
} from '~/models/KnowledgeBaseModel';
import classes from './KnowledgeBaseFilter.module.css';
import { useTranslation } from 'react-i18next';

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
	const { t } = useTranslation('knowledge-bases');

	return (
		<FilterContainer>
			<TextInput
				leftSection={<IconSearch size={16} />}
				placeholder={t('filter.search.placeholder')}
				value={query}
				onChange={(e) => setQuery(e.currentTarget.value)}
				size='sm'
				className={classes.searchInput}
			/>
			<Group gap='xs' wrap='nowrap' className={classes.selectGroup}>
				<Select
					placeholder={t('filter.status.placeholder')}
					data={[
						{ value: '', label: t('filter.status.all') },
						...Object.values(KnowledgeBaseStatus).map((s) => ({
							value: s,
							label: t(`status.${s}`),
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
					placeholder={t('filter.type.placeholder')}
					data={[
						{ value: '', label: t('filter.type.all') },
						...Object.values(KnowledgeBaseType).map((typeValue) => ({
							value: typeValue,
							label: t(`type.${typeValue}`),
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
					{t('filter.results', { count, total })}
				</Text>
				<Button
					onClick={() => refetch()}
					variant='subtle'
					size='sm'
					leftSection={<IconRefresh size={16} />}
					className={classes.refreshButton}
				>
					{t('filter.actions.refresh')}
				</Button>
			</Group>
		</FilterContainer>
	);
};

export default KnowledgeBaseFilter;
