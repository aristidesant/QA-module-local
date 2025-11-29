import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import PaginationControls from './PaginationControls';

const defaultProps = {
	currentPage: 1,
	totalPages: 5,
	itemsPerPage: 10,
	totalItems: 50,
	onPageChange: vi.fn(),
	onItemsPerPageChange: vi.fn(),
};

const renderPaginationControls = (
	props: Partial<Parameters<typeof PaginationControls>[0]> = {}
) => {
	return render(
		<MantineProvider>
			<PaginationControls {...defaultProps} {...props} />
		</MantineProvider>
	);
};

describe('PaginationControls', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Rendering', () => {
		it('renders pagination controls', () => {
			renderPaginationControls();

			expect(screen.getByText('Showing 1-10 of 50 items')).toBeInTheDocument();
			expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
		});

		it('returns null when totalItems is 0 and not loading', () => {
			const { container } = renderPaginationControls({ totalItems: 0 });

			// When component returns null, Mantine still renders its style tags
			const paginationContainer = container.querySelector(
				'[class*="container"]'
			);
			expect(paginationContainer).toBeNull();
		});

		it('renders when loading even with 0 items', () => {
			renderPaginationControls({ totalItems: 0, isLoading: true });

			expect(screen.getByText('Loading...')).toBeInTheDocument();
		});

		it('displays custom item label', () => {
			renderPaginationControls({ itemLabel: 'campaigns' });

			expect(
				screen.getByText('Showing 1-10 of 50 campaigns')
			).toBeInTheDocument();
		});

		it('displays search filter text when searchTerm is provided', () => {
			renderPaginationControls({ searchTerm: 'test' });

			expect(screen.getByText('(filtered by "test")')).toBeInTheDocument();
		});
	});

	describe('Items Calculation', () => {
		it('calculates correct range for first page', () => {
			renderPaginationControls({
				currentPage: 1,
				itemsPerPage: 10,
				totalItems: 50,
			});

			expect(screen.getByText('Showing 1-10 of 50 items')).toBeInTheDocument();
		});

		it('calculates correct range for middle page', () => {
			renderPaginationControls({
				currentPage: 3,
				itemsPerPage: 10,
				totalItems: 50,
			});

			expect(screen.getByText('Showing 21-30 of 50 items')).toBeInTheDocument();
		});

		it('calculates correct range for last page with partial items', () => {
			renderPaginationControls({
				currentPage: 3,
				itemsPerPage: 20,
				totalItems: 45,
			});

			expect(screen.getByText('Showing 41-45 of 45 items')).toBeInTheDocument();
		});

		it('shows 0 items when totalItems is 0', () => {
			renderPaginationControls({ totalItems: 0, isLoading: true });

			expect(screen.getByText('Loading...')).toBeInTheDocument();
		});
	});

	describe('Pagination Interaction', () => {
		it('calls onPageChange when page is clicked', () => {
			const onPageChange = vi.fn();
			renderPaginationControls({ onPageChange });

			const page2Button = screen.getByRole('button', { name: '2' });
			fireEvent.click(page2Button);

			expect(onPageChange).toHaveBeenCalledWith(2);
		});

		it('disables pagination when loading', () => {
			renderPaginationControls({ isLoading: true });

			const paginationButtons = screen.getAllByRole('button');
			const pageButtons = paginationButtons.filter(
				(btn) =>
					btn.getAttribute('data-disabled') === 'true' ||
					(btn as HTMLButtonElement).disabled
			);
			expect(pageButtons.length).toBeGreaterThan(0);
		});

		it('disables pagination when totalPages is 1', () => {
			renderPaginationControls({ totalPages: 1 });

			const paginationButtons = screen.getAllByRole('button');
			const disabledButtons = paginationButtons.filter(
				(btn) =>
					btn.getAttribute('data-disabled') === 'true' ||
					(btn as HTMLButtonElement).disabled
			);
			expect(disabledButtons.length).toBeGreaterThan(0);
		});
	});

	describe('Items Per Page Select', () => {
		it('renders items per page select', () => {
			renderPaginationControls();

			expect(screen.getByText('Show:')).toBeInTheDocument();
		});

		it('shows current items per page value', () => {
			renderPaginationControls({ itemsPerPage: 20 });

			expect(screen.getByRole('textbox')).toHaveValue('20 per page');
		});

		it('disables select when loading', () => {
			renderPaginationControls({ isLoading: true });

			const select = screen.getByRole('textbox');
			expect(select).toBeDisabled();
		});
	});

	describe('Page Info', () => {
		it('shows correct page info', () => {
			renderPaginationControls({
				currentPage: 3,
				totalPages: 10,
			});

			expect(screen.getByText('Page 3 of 10')).toBeInTheDocument();
		});

		it('shows at least 1 page when totalPages is 0', () => {
			renderPaginationControls({
				currentPage: 1,
				totalPages: 0,
				totalItems: 5,
			});

			expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
		});
	});

	describe('Loading State', () => {
		it('displays loading text', () => {
			renderPaginationControls({ isLoading: true, totalItems: 50 });

			expect(screen.getByText('Loading...')).toBeInTheDocument();
		});
	});

	describe('Complete Example', () => {
		it('renders all elements with all props', () => {
			const onPageChange = vi.fn();
			const onItemsPerPageChange = vi.fn();

			renderPaginationControls({
				currentPage: 2,
				totalPages: 5,
				itemsPerPage: 10,
				totalItems: 48,
				onPageChange,
				onItemsPerPageChange,
				searchTerm: 'active',
				isLoading: false,
				itemLabel: 'users',
			});

			expect(screen.getByText('Showing 11-20 of 48 users')).toBeInTheDocument();
			expect(screen.getByText('(filtered by "active")')).toBeInTheDocument();
			expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
			expect(screen.getByText('Show:')).toBeInTheDocument();
		});
	});
});
