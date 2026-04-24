import { Group, Text, Pagination, Select } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import styles from './PaginationControls.module.css';

interface PaginationControlsProps {
	currentPage: number;
	totalPages: number;
	itemsPerPage: number;
	totalItems: number;
	onPageChange: (page: number) => void;
	onItemsPerPageChange: (value: string | null) => void;
	searchTerm?: string;
	isLoading?: boolean;
	itemLabel?: string;
}

const ITEMS_PER_PAGE_OPTIONS = [
	{ value: '5', labelKey: 5 },
	{ value: '10', labelKey: 10 },
	{ value: '20', labelKey: 20 },
	{ value: '50', labelKey: 50 },
];

export const PaginationControls: React.FC<PaginationControlsProps> = ({
	currentPage,
	totalPages,
	itemsPerPage,
	totalItems,
	onPageChange,
	onItemsPerPageChange,
	searchTerm,
	isLoading = false,
	itemLabel,
}) => {
	const { t } = useTranslation();
	if (totalItems === 0 && !isLoading) {
		return null;
	}

	const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
	const endItem = Math.min(currentPage * itemsPerPage, totalItems);

	const shouldDisablePagination = isLoading || totalPages <= 1;
	const shouldDisableItemsSelect = isLoading;

	return (
		<div className={styles.container}>
			{/* Results Summary - Centered */}
			<div className={styles.summary}>
				<Text size='sm' c='dimmed'>
					{isLoading ? (
						t('status.loading')
					) : (
						<>
							{t('pagination.showing')} {startItem}-{endItem}{' '}
							{t('pagination.of')} {totalItems.toLocaleString()}{' '}
							{itemLabel ?? t('pagination.items')}
							{searchTerm && (
								<Text component='span' size='sm' c='blue' fw={500}>
									{' '}
									{t('pagination.filteredBy', { term: searchTerm })}
								</Text>
							)}
						</>
					)}
				</Text>
			</div>

			{/* Pagination Controls Row - Left, Center, Right layout */}
			<div className={styles.controls}>
				{/* Items per page selector - Left */}
				<div className={styles.leftControl}>
					<Group gap='xs'>
						<Text size='sm' c='dimmed'>
							{t('pagination.show')}
						</Text>
						<Select
							value={itemsPerPage.toString()}
							onChange={onItemsPerPageChange}
							data={ITEMS_PER_PAGE_OPTIONS.map((opt) => ({
								value: opt.value,
								label: t('pagination.itemsPerPage', { count: opt.labelKey }),
							}))}
							size='xs'
							className={styles.itemsSelect}
							withCheckIcon={false}
							disabled={shouldDisableItemsSelect}
						/>
					</Group>
				</div>

				{/* Pagination component - Center */}
				<div className={styles.centerControl}>
					<Pagination
						total={Math.max(totalPages, 1)} // Ensure at least 1 page is shown
						value={currentPage}
						onChange={onPageChange}
						size='sm'
						withEdges
						className={styles.pagination}
						disabled={shouldDisablePagination}
					/>
				</div>

				{/* Page info - Right */}
				<div className={styles.rightControl}>
					<Text size='xs' c='dimmed' className={styles.pageInfo}>
						{t('pagination.page')} {currentPage} {t('pagination.of')}{' '}
						{Math.max(totalPages, 1)}
					</Text>
				</div>
			</div>
		</div>
	);
};

export default PaginationControls;
