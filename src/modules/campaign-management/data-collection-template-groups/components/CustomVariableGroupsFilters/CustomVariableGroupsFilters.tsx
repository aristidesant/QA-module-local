import { Group, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import styles from './CustomVariableGroupsFilters.module.css';

export interface CustomVariableGroupFilters {
	search: string;
}

interface CustomVariableGroupsFiltersProps {
	filters: CustomVariableGroupFilters;
	onFiltersChange: (filters: CustomVariableGroupFilters) => void;
}

export default function CustomVariableGroupsFilters({
	filters,
	onFiltersChange,
}: CustomVariableGroupsFiltersProps) {
	const { t } = useTranslation('campaign-management');

	return (
		<Group gap='xs' className={styles.container}>
			<TextInput
				value={filters.search}
				onChange={(event) =>
					onFiltersChange({
						...filters,
						search: event.currentTarget.value,
					})
				}
				placeholder={t('customVariables.groups.filters.searchPlaceholder')}
				leftSection={<IconSearch size={16} />}
				size='sm'
				className={styles.searchInput}
			/>
		</Group>
	);
}
