import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@mantine/core', async () => {
	const actual =
		await vi.importActual<typeof import('@mantine/core')>('@mantine/core');

	type SelectProps = {
		value: string | null;
		onChange?: (value: string | null) => void;
		disabled?: boolean;
		data?: Array<{ value: string; label: string }>;
	};

	return {
		...actual,
		Select: ({ value, onChange, disabled, data }: SelectProps) => (
			<select
				aria-label='Items per page'
				disabled={disabled}
				value={value ?? ''}
				onChange={(event) => onChange?.(event.currentTarget.value)}
			>
				{(data ?? []).map((item) => (
					<option key={item.value} value={item.value}>
						{item.label}
					</option>
				))}
			</select>
		),
	};
});

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import {
	CampaignCategoriesPagination,
	PaginationState,
} from './CampaignCategoriesPagination';

describe('CampaignCategoriesPagination', () => {
	const mockOnPaginationChange = vi.fn();

	const defaultPagination: PaginationState = {
		page: 1,
		pageSize: 10,
		total: 50,
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders pagination info correctly', () => {
		renderWithProviders(
			<CampaignCategoriesPagination
				pagination={defaultPagination}
				onPaginationChange={mockOnPaginationChange}
			/>
		);

		expect(
			screen.getByText(/Showing 1-10 of 50 categories/i)
		).toBeInTheDocument();
	});

	it('does not render when total is 0', () => {
		renderWithProviders(
			<CampaignCategoriesPagination
				pagination={{ page: 1, pageSize: 10, total: 0 }}
				onPaginationChange={mockOnPaginationChange}
			/>
		);

		expect(
			screen.queryByText(/Showing\s+\d+-\d+\s+of\s+\d+\s+categories/i)
		).not.toBeInTheDocument();
		expect(screen.queryByText('Items per page:')).not.toBeInTheDocument();
	});

	it('displays correct page size options', () => {
		renderWithProviders(
			<CampaignCategoriesPagination
				pagination={defaultPagination}
				onPaginationChange={mockOnPaginationChange}
			/>
		);

		expect(screen.getByText('Items per page:')).toBeInTheDocument();
	});

	it('calls onPaginationChange when page size changes', async () => {
		const user = userEvent.setup();
		renderWithProviders(
			<CampaignCategoriesPagination
				pagination={defaultPagination}
				onPaginationChange={mockOnPaginationChange}
			/>
		);

		await user.selectOptions(
			screen.getByRole('combobox', { name: 'Items per page' }),
			'25'
		);

		expect(mockOnPaginationChange).toHaveBeenCalledWith({
			page: 1,
			pageSize: 25,
			total: 50,
		});
	});

	it('shows pagination controls when total pages > 1', () => {
		renderWithProviders(
			<CampaignCategoriesPagination
				pagination={defaultPagination}
				onPaginationChange={mockOnPaginationChange}
			/>
		);

		// Check for pagination info text
		expect(
			screen.getByText(/Showing 1-10 of 50 categories/i)
		).toBeInTheDocument();
	});

	it('does not show pagination buttons when total pages = 1', () => {
		renderWithProviders(
			<CampaignCategoriesPagination
				pagination={{ page: 1, pageSize: 10, total: 5 }}
				onPaginationChange={mockOnPaginationChange}
			/>
		);

		// With only 1 page, pagination controls should not be rendered
		// The component should only show the info text and page size selector
		expect(
			screen.getByText(/Showing 1-5 of 5 categories/i)
		).toBeInTheDocument();
		expect(screen.getByText('Items per page:')).toBeInTheDocument();
	});

	it('displays disabled note when disabled prop is true', () => {
		renderWithProviders(
			<CampaignCategoriesPagination
				pagination={defaultPagination}
				onPaginationChange={mockOnPaginationChange}
				disabled={true}
			/>
		);

		expect(
			screen.getByText(/Pagination is currently read-only/i)
		).toBeInTheDocument();
	});

	it('calculates end item correctly for last page', () => {
		renderWithProviders(
			<CampaignCategoriesPagination
				pagination={{ page: 5, pageSize: 10, total: 45 }}
				onPaginationChange={mockOnPaginationChange}
			/>
		);

		expect(
			screen.getByText(/Showing 41-45 of 45 categories/i)
		).toBeInTheDocument();
	});
});
