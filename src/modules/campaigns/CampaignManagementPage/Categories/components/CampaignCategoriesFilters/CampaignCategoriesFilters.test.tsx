import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import {
	CampaignCategoriesFilters,
	CategoryFilters,
} from './CampaignCategoriesFilters';

describe('CampaignCategoriesFilters', () => {
	const defaultFilters: CategoryFilters = {
		search: '',
		status: 'all',
		sortBy: 'name',
		sortOrder: 'asc',
	};

	const onFiltersChange = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	const renderWithProviders = (ui: React.ReactNode) => {
		return render(<MantineProvider>{ui}</MantineProvider>);
	};

	describe('Rendering', () => {
		it('renders the filters container', () => {
			renderWithProviders(
				<CampaignCategoriesFilters
					filters={defaultFilters}
					onFiltersChange={onFiltersChange}
				/>
			);

			expect(screen.getByText('Filters')).toBeInTheDocument();
		});

		it('renders search input with correct placeholder', () => {
			renderWithProviders(
				<CampaignCategoriesFilters
					filters={defaultFilters}
					onFiltersChange={onFiltersChange}
				/>
			);

			expect(
				screen.getByPlaceholderText('Search by name, code, or description...')
			).toBeInTheDocument();
		});

		it('renders status select', () => {
			renderWithProviders(
				<CampaignCategoriesFilters
					filters={defaultFilters}
					onFiltersChange={onFiltersChange}
				/>
			);

			expect(screen.getByPlaceholderText('Status')).toBeInTheDocument();
		});

		it('does not show active badge when no filters are active', () => {
			renderWithProviders(
				<CampaignCategoriesFilters
					filters={defaultFilters}
					onFiltersChange={onFiltersChange}
				/>
			);

			// The badge shows "X active" text pattern
			expect(screen.queryByText(/\d+ active/)).not.toBeInTheDocument();
		});

		it('shows active badge when search filter is applied', () => {
			renderWithProviders(
				<CampaignCategoriesFilters
					filters={{ ...defaultFilters, search: 'test' }}
					onFiltersChange={onFiltersChange}
				/>
			);

			expect(screen.getByText('1 active')).toBeInTheDocument();
		});

		it('shows active badge when status filter is changed', () => {
			renderWithProviders(
				<CampaignCategoriesFilters
					filters={{ ...defaultFilters, status: 'active' }}
					onFiltersChange={onFiltersChange}
				/>
			);

			expect(screen.getByText('1 active')).toBeInTheDocument();
		});

		it('shows active badge with count when multiple filters are applied', () => {
			renderWithProviders(
				<CampaignCategoriesFilters
					filters={{ ...defaultFilters, search: 'test', status: 'active' }}
					onFiltersChange={onFiltersChange}
				/>
			);

			expect(screen.getByText('2 active')).toBeInTheDocument();
		});
	});

	describe('User interactions', () => {
		it('calls onFiltersChange with updated search value when typing', () => {
			renderWithProviders(
				<CampaignCategoriesFilters
					filters={defaultFilters}
					onFiltersChange={onFiltersChange}
				/>
			);

			const searchInput = screen.getByPlaceholderText(
				'Search by name, code, or description...'
			);
			fireEvent.change(searchInput, { target: { value: 'test category' } });

			expect(onFiltersChange).toHaveBeenCalledWith({
				...defaultFilters,
				search: 'test category',
			});
		});

		it('shows clear button when filters are active', () => {
			renderWithProviders(
				<CampaignCategoriesFilters
					filters={{ ...defaultFilters, search: 'test' }}
					onFiltersChange={onFiltersChange}
				/>
			);

			const clearButton = screen.getByTitle('Clear all filters');
			expect(clearButton).toBeInTheDocument();
		});

		it('does not show clear button when no filters are active', () => {
			renderWithProviders(
				<CampaignCategoriesFilters
					filters={defaultFilters}
					onFiltersChange={onFiltersChange}
				/>
			);

			expect(screen.queryByTitle('Clear all filters')).not.toBeInTheDocument();
		});

		it('clears all filters when clear button is clicked', () => {
			renderWithProviders(
				<CampaignCategoriesFilters
					filters={{
						...defaultFilters,
						search: 'test',
						status: 'active',
						sortBy: 'code',
					}}
					onFiltersChange={onFiltersChange}
				/>
			);

			const clearButton = screen.getByTitle('Clear all filters');
			fireEvent.click(clearButton);

			expect(onFiltersChange).toHaveBeenCalledWith({
				search: '',
				status: 'all',
				sortBy: 'name',
				sortOrder: 'asc',
			});
		});
	});

	describe('Search value display', () => {
		it('displays the current search value in the input', () => {
			renderWithProviders(
				<CampaignCategoriesFilters
					filters={{ ...defaultFilters, search: 'existing search' }}
					onFiltersChange={onFiltersChange}
				/>
			);

			const searchInput = screen.getByPlaceholderText(
				'Search by name, code, or description...'
			) as HTMLInputElement;
			expect(searchInput.value).toBe('existing search');
		});
	});

	describe('Active filters count', () => {
		it('counts search as one active filter', () => {
			renderWithProviders(
				<CampaignCategoriesFilters
					filters={{ ...defaultFilters, search: 'test' }}
					onFiltersChange={onFiltersChange}
				/>
			);

			expect(screen.getByText('1 active')).toBeInTheDocument();
		});

		it('counts status as one active filter', () => {
			renderWithProviders(
				<CampaignCategoriesFilters
					filters={{ ...defaultFilters, status: 'active' }}
					onFiltersChange={onFiltersChange}
				/>
			);

			expect(screen.getByText('1 active')).toBeInTheDocument();
		});

		it('counts sort change as one active filter', () => {
			renderWithProviders(
				<CampaignCategoriesFilters
					filters={{ ...defaultFilters, sortBy: 'code' }}
					onFiltersChange={onFiltersChange}
				/>
			);

			expect(screen.getByText('1 active')).toBeInTheDocument();
		});

		it('counts all filters correctly', () => {
			renderWithProviders(
				<CampaignCategoriesFilters
					filters={{
						search: 'test',
						status: 'inactive',
						sortBy: 'code',
						sortOrder: 'desc',
					}}
					onFiltersChange={onFiltersChange}
				/>
			);

			expect(screen.getByText('3 active')).toBeInTheDocument();
		});
	});
});
