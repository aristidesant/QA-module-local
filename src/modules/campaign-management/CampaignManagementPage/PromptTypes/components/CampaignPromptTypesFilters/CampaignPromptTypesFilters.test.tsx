import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CampaignPromptTypesFilters, {
	PromptTypeFilters,
} from './CampaignPromptTypesFilters';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

describe('CampaignPromptTypesFilters', () => {
	const defaultFilters: PromptTypeFilters = {
		search: '',
		sortBy: 'order',
		sortOrder: 'asc',
	};

	const onFiltersChange = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Rendering', () => {
		it('renders the filters container', () => {
			renderWithProviders(
				<CampaignPromptTypesFilters
					filters={defaultFilters}
					onFiltersChange={onFiltersChange}
				/>
			);

			expect(screen.getByText('Filters')).toBeInTheDocument();
		});

		it('renders search input with correct placeholder', () => {
			renderWithProviders(
				<CampaignPromptTypesFilters
					filters={defaultFilters}
					onFiltersChange={onFiltersChange}
				/>
			);

			expect(
				screen.getByPlaceholderText('Search by name or icon...')
			).toBeInTheDocument();
		});

		it('renders sort select', () => {
			renderWithProviders(
				<CampaignPromptTypesFilters
					filters={defaultFilters}
					onFiltersChange={onFiltersChange}
				/>
			);

			// Sort select should be present
			expect(screen.getByPlaceholderText('Sort by')).toBeInTheDocument();
		});

		it('does not show active badge when no filters are active', () => {
			renderWithProviders(
				<CampaignPromptTypesFilters
					filters={defaultFilters}
					onFiltersChange={onFiltersChange}
				/>
			);

			expect(screen.queryByText('Active')).not.toBeInTheDocument();
		});

		it('shows active badge when search filter is applied', () => {
			renderWithProviders(
				<CampaignPromptTypesFilters
					filters={{ ...defaultFilters, search: 'test' }}
					onFiltersChange={onFiltersChange}
				/>
			);

			expect(screen.getByText('Active')).toBeInTheDocument();
		});

		it('shows active badge when sort is changed from default', () => {
			renderWithProviders(
				<CampaignPromptTypesFilters
					filters={{ ...defaultFilters, sortBy: 'name' }}
					onFiltersChange={onFiltersChange}
				/>
			);

			expect(screen.getByText('Active')).toBeInTheDocument();
		});

		it('shows active badge when sort order is changed', () => {
			renderWithProviders(
				<CampaignPromptTypesFilters
					filters={{ ...defaultFilters, sortOrder: 'desc' }}
					onFiltersChange={onFiltersChange}
				/>
			);

			expect(screen.getByText('Active')).toBeInTheDocument();
		});
	});

	describe('User interactions', () => {
		it('calls onFiltersChange with updated search value when typing', () => {
			renderWithProviders(
				<CampaignPromptTypesFilters
					filters={defaultFilters}
					onFiltersChange={onFiltersChange}
				/>
			);

			const searchInput = screen.getByPlaceholderText(
				'Search by name or icon...'
			);
			fireEvent.change(searchInput, { target: { value: 'test prompt' } });

			expect(onFiltersChange).toHaveBeenCalledWith({
				...defaultFilters,
				search: 'test prompt',
			});
		});

		it('shows clear button when filters are active', () => {
			renderWithProviders(
				<CampaignPromptTypesFilters
					filters={{ ...defaultFilters, search: 'test' }}
					onFiltersChange={onFiltersChange}
				/>
			);

			const clearButton = screen.getByTitle('Clear filters');
			expect(clearButton).toBeInTheDocument();
		});

		it('does not show clear button when no filters are active', () => {
			renderWithProviders(
				<CampaignPromptTypesFilters
					filters={defaultFilters}
					onFiltersChange={onFiltersChange}
				/>
			);

			expect(screen.queryByTitle('Clear filters')).not.toBeInTheDocument();
		});

		it('clears all filters when clear button is clicked', () => {
			renderWithProviders(
				<CampaignPromptTypesFilters
					filters={{ ...defaultFilters, search: 'test', sortBy: 'name' }}
					onFiltersChange={onFiltersChange}
				/>
			);

			const clearButton = screen.getByTitle('Clear filters');
			fireEvent.click(clearButton);

			expect(onFiltersChange).toHaveBeenCalledWith({
				search: '',
				sortBy: 'order',
				sortOrder: 'asc',
			});
		});
	});

	describe('Search value display', () => {
		it('displays the current search value in the input', () => {
			renderWithProviders(
				<CampaignPromptTypesFilters
					filters={{ ...defaultFilters, search: 'existing search' }}
					onFiltersChange={onFiltersChange}
				/>
			);

			const searchInput = screen.getByPlaceholderText(
				'Search by name or icon...'
			) as HTMLInputElement;
			expect(searchInput.value).toBe('existing search');
		});
	});
});
