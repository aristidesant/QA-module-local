import { TextInput, ActionIcon, Tooltip } from '@mantine/core';
import {
	IconSearch,
	IconMail,
	IconPhone,
	IconFilterOff,
	IconDownload,
	IconUpload,
} from '@tabler/icons-react';
import { FilterContainer } from '~/components/FilterContainer';
import styles from './ContactGroupContactsTableFilters.module.css';
import { ContactFilters } from '../useContactFilters';

interface ContactGroupContactsTableFiltersProps {
	filters: ContactFilters;
	onFilterChange: (key: keyof ContactFilters, value: string) => void;
	onClearFilters: () => void;
	hasActiveFilters: boolean;
	onExport?: () => void;
	isExporting?: boolean;
	onAppend?: () => void;
	isAppending?: boolean;
}

export const ContactGroupContactsTableFilters: React.FC<
	ContactGroupContactsTableFiltersProps
> = ({
	filters,
	onFilterChange,
	onClearFilters,
	hasActiveFilters,
	onExport,
	isExporting,
	onAppend,
	isAppending,
}) => {
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
						placeholder='Filter by phone...'
						value={filters.phone}
						// Only allow digits: sanitize input by removing non-digit characters
						onChange={(event) =>
							onFilterChange(
								'phone',
								event.currentTarget.value.replaceAll(/\D/g, '')
							)
						}
						// hint mobile devices to show numeric keyboard
						inputMode='numeric'
						pattern='[0-9]*'
						leftSection={<IconPhone size={16} />}
						size='sm'
						className={styles.filterInput}
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
				</div>

				<div className={styles.selectFilters}>
					{onAppend && (
						<Tooltip label='Append contacts via CSV' withArrow>
							<ActionIcon
								variant='light'
								color='blue'
								size='lg'
								onClick={onAppend}
								loading={isAppending}
							>
								<IconUpload size={16} />
							</ActionIcon>
						</Tooltip>
					)}
					{onExport && (
						<Tooltip label='Export contact list' withArrow>
							<ActionIcon
								variant='light'
								color='blue'
								size='lg'
								onClick={onExport}
								loading={isExporting}
							>
								<IconDownload size={16} />
							</ActionIcon>
						</Tooltip>
					)}
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

export default ContactGroupContactsTableFilters;
