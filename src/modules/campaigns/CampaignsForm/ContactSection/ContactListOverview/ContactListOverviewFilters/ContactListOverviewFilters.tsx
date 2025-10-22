import { TextInput, ActionIcon } from '@mantine/core';
import {
	IconSearch,
	IconMail,
	IconPhone,
	IconFilterOff,
} from '@tabler/icons-react';
import { FilterContainer } from '~/components/FilterContainer';
import type { ContactFilters } from '../useContactFilters';
import styles from './ContactListOverviewFilters.module.css';

interface ContactListOverviewFiltersProps {
	filters: ContactFilters;
	onFilterChange: <K extends keyof ContactFilters>(
		key: K,
		value: ContactFilters[K]
	) => void;
	onClearFilters: () => void;
	hasActiveFilters: boolean;
}

export const ContactListOverviewFilters: React.FC<
	ContactListOverviewFiltersProps
> = ({ filters, onFilterChange, onClearFilters, hasActiveFilters }) => {
	return (
		<FilterContainer>
			<div className={styles.filtersContent}>
				<div className={styles.searchFilters}>
					<TextInput
						placeholder='Search by name...'
						value={filters.name}
						onChange={(event) =>
							onFilterChange('name', event.currentTarget.value)
						}
						leftSection={<IconSearch size={16} />}
						size='sm'
						className={styles.searchInput}
					/>

					<TextInput
						placeholder='Filter by email...'
						value={filters.email}
						onChange={(event) =>
							onFilterChange('email', event.currentTarget.value)
						}
						leftSection={<IconMail size={16} />}
						size='sm'
						className={styles.filterInput}
					/>

					<TextInput
						placeholder='Filter by phone...'
						value={filters.phone}
						onChange={(event) =>
							onFilterChange('phone', event.currentTarget.value)
						}
						leftSection={<IconPhone size={16} />}
						size='sm'
						className={styles.filterInput}
					/>
				</div>

				<div className={styles.selectFilters}>
					<ActionIcon
						variant='light'
						color='gray'
						size='lg'
						onClick={onClearFilters}
						disabled={!hasActiveFilters}
						className={styles.clearButton}
					>
						<IconFilterOff size={16} />
					</ActionIcon>
				</div>
			</div>
		</FilterContainer>
	);
};

export default ContactListOverviewFilters;
