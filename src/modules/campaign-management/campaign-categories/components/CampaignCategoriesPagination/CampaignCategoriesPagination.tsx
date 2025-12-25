import React from 'react';
import { Group, Text, Select, Pagination } from '@mantine/core';
import styles from './CampaignCategoriesPagination.module.css';

export interface PaginationState {
	page: number;
	pageSize: number;
	total: number;
}

interface CampaignCategoriesPaginationProps {
	pagination: PaginationState;
	onPaginationChange: (pagination: PaginationState) => void;
	disabled?: boolean;
}

export const CampaignCategoriesPagination: React.FC<
	CampaignCategoriesPaginationProps
> = ({ pagination, onPaginationChange, disabled = false }) => {
	const { page, pageSize, total } = pagination;
	const totalPages = Math.ceil(total / pageSize);
	const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
	const endItem = Math.min(page * pageSize, total);

	const handlePageChange = (newPage: number) => {
		onPaginationChange({
			...pagination,
			page: newPage,
		});
	};

	const handlePageSizeChange = (newPageSize: string | null) => {
		if (newPageSize) {
			onPaginationChange({
				...pagination,
				page: 1, // Reset to first page when changing page size
				pageSize: parseInt(newPageSize, 10),
			});
		}
	};

	if (total === 0) {
		return null;
	}

	return (
		<div className={styles.paginationContainer}>
			<Group
				justify='space-between'
				align='center'
				className={styles.paginationWrapper}
			>
				<Group gap='sm' className={styles.info}>
					<Text size='sm' c='dimmed' className={styles.itemsText}>
						Showing {startItem}-{endItem} of {total} categories
					</Text>

					<Group gap='xs' className={styles.pageSizeGroup}>
						<Text size='sm' c='dimmed'>
							Items per page:
						</Text>
						<Select
							value={pageSize.toString()}
							onChange={handlePageSizeChange}
							data={[
								{ value: '10', label: '10' },
								{ value: '25', label: '25' },
								{ value: '50', label: '50' },
								{ value: '100', label: '100' },
							]}
							size='xs'
							className={styles.pageSizeSelect}
							disabled={disabled}
						/>
					</Group>
				</Group>

				{totalPages > 1 && (
					<Pagination
						value={page}
						onChange={handlePageChange}
						total={totalPages}
						size='sm'
						disabled={disabled}
						className={styles.pagination}
					/>
				)}
			</Group>

			{disabled && (
				<Text size='xs' c='orange' className={styles.disabledNote}>
					* Pagination is currently read-only. Live pagination will be available
					after backend updates.
				</Text>
			)}
		</div>
	);
};
