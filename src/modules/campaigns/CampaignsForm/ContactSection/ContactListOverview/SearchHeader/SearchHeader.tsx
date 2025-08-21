import { Group, Text, TextInput, ActionIcon, Title } from "@mantine/core";
import { IconSearch, IconAdjustments, IconX } from "@tabler/icons-react";
import styles from "./SearchHeader.module.css";

interface SearchHeaderProps {
	title: string;
	subtitle: string;
	searchValue: string;
	onSearchChange: (value: string) => void;
	onClearSearch?: () => void;
	showFilters?: boolean;
	onFiltersClick?: () => void;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
	title,
	subtitle,
	searchValue,
	onSearchChange,
	onClearSearch,
	showFilters = true,
	onFiltersClick,
}) => {
	return (
		<div className={styles.header}>
			<Group justify="space-between" align="flex-start">
				<div className={styles.titleSection}>
					<Title order={4} className={styles.title}>
						{title}
					</Title>
					<Text size="sm" c="dimmed" className={styles.subtitle}>
						{subtitle}
					</Text>
				</div>

				<Group gap="sm" className={styles.searchSection}>
					<TextInput
						placeholder="Search by first name..."
						value={searchValue}
						onChange={(event) => onSearchChange(event.currentTarget.value)}
						leftSection={<IconSearch size={16} />}
						rightSection={
							searchValue && onClearSearch ? (
								<ActionIcon
									variant="subtle"
									size="sm"
									onClick={onClearSearch}
									className={styles.clearButton}
								>
									<IconX size={14} />
								</ActionIcon>
							) : null
						}
						className={styles.searchInput}
					/>

					{showFilters && (
						<ActionIcon
							variant="light"
							size="lg"
							onClick={onFiltersClick}
							className={styles.filtersButton}
						>
							<IconAdjustments size={16} />
						</ActionIcon>
					)}
				</Group>
			</Group>
		</div>
	);
};

export default SearchHeader;
