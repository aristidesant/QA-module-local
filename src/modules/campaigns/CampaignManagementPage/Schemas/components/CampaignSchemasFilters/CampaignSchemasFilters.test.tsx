import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CampaignSchemasFilters, {
	SchemaFilters,
} from './CampaignSchemasFilters';

// Mock scrollIntoView to avoid errors from Mantine Combobox
beforeAll(() => {
	Element.prototype.scrollIntoView = vi.fn();
});

// Mock the campaign objectives query
vi.mock('~/queries/campaignObjectivesQueries', () => ({
	useGetCampaignObjectives: () => ({
		data: {
			data: [
				{ id: 1, name: 'Objective 1' },
				{ id: 2, name: 'Objective 2' },
			],
		},
	}),
}));

const createTestQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: { retry: false },
		},
	});

const renderWithProviders = (ui: React.ReactNode) => {
	const queryClient = createTestQueryClient();
	return render(
		<QueryClientProvider client={queryClient}>
			<MantineProvider>{ui}</MantineProvider>
		</QueryClientProvider>
	);
};

describe('CampaignSchemasFilters', () => {
	const defaultFilters: SchemaFilters = {
		search: '',
		objectiveId: null,
		sortBy: 'name',
		sortOrder: 'asc',
	};

	const onFiltersChange = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Rendering', () => {
		it('renders the filters container', () => {
			renderWithProviders(
				<CampaignSchemasFilters
					filters={defaultFilters}
					onFiltersChange={onFiltersChange}
				/>
			);

			expect(screen.getByText('Filters')).toBeInTheDocument();
		});

		it('renders search input with correct placeholder', () => {
			renderWithProviders(
				<CampaignSchemasFilters
					filters={defaultFilters}
					onFiltersChange={onFiltersChange}
				/>
			);

			expect(
				screen.getByPlaceholderText('Search by name or code...')
			).toBeInTheDocument();
		});

		it('renders sort select with options', () => {
			renderWithProviders(
				<CampaignSchemasFilters
					filters={defaultFilters}
					onFiltersChange={onFiltersChange}
				/>
			);

			// Sort select should be present - using placeholder text
			expect(screen.getByPlaceholderText('Sort by')).toBeInTheDocument();
		});

		it('does not show active badge when no filters are active', () => {
			renderWithProviders(
				<CampaignSchemasFilters
					filters={defaultFilters}
					onFiltersChange={onFiltersChange}
				/>
			);

			expect(screen.queryByText('Active')).not.toBeInTheDocument();
		});

		it('shows active badge when search filter is applied', () => {
			renderWithProviders(
				<CampaignSchemasFilters
					filters={{ ...defaultFilters, search: 'test' }}
					onFiltersChange={onFiltersChange}
				/>
			);

			expect(screen.getByText('Active')).toBeInTheDocument();
		});

		it('shows active badge when objectiveId filter is applied', () => {
			renderWithProviders(
				<CampaignSchemasFilters
					filters={{ ...defaultFilters, objectiveId: 1 }}
					onFiltersChange={onFiltersChange}
				/>
			);

			expect(screen.getByText('Active')).toBeInTheDocument();
		});

		it('shows active badge when sort is changed from default', () => {
			renderWithProviders(
				<CampaignSchemasFilters
					filters={{ ...defaultFilters, sortBy: 'code' }}
					onFiltersChange={onFiltersChange}
				/>
			);

			expect(screen.getByText('Active')).toBeInTheDocument();
		});
	});

	describe('User interactions', () => {
		it('calls onFiltersChange with updated search value when typing', () => {
			renderWithProviders(
				<CampaignSchemasFilters
					filters={defaultFilters}
					onFiltersChange={onFiltersChange}
				/>
			);

			const searchInput = screen.getByPlaceholderText(
				'Search by name or code...'
			);
			fireEvent.change(searchInput, { target: { value: 'test schema' } });

			expect(onFiltersChange).toHaveBeenCalledWith({
				...defaultFilters,
				search: 'test schema',
			});
		});

		it('shows clear button when filters are active', () => {
			renderWithProviders(
				<CampaignSchemasFilters
					filters={{ ...defaultFilters, search: 'test' }}
					onFiltersChange={onFiltersChange}
				/>
			);

			const clearButton = screen.getByTitle('Clear all filters');
			expect(clearButton).toBeInTheDocument();
		});

		it('does not show clear button when no filters are active', () => {
			renderWithProviders(
				<CampaignSchemasFilters
					filters={defaultFilters}
					onFiltersChange={onFiltersChange}
				/>
			);

			expect(screen.queryByTitle('Clear all filters')).not.toBeInTheDocument();
		});

		it('clears all filters when clear button is clicked', () => {
			renderWithProviders(
				<CampaignSchemasFilters
					filters={{ ...defaultFilters, search: 'test', objectiveId: 1 }}
					onFiltersChange={onFiltersChange}
				/>
			);

			const clearButton = screen.getByTitle('Clear all filters');
			fireEvent.click(clearButton);

			expect(onFiltersChange).toHaveBeenCalledWith({
				search: '',
				objectiveId: null,
				sortBy: 'name',
				sortOrder: 'asc',
			});
		});
	});

	describe('Search value display', () => {
		it('displays the current search value in the input', () => {
			renderWithProviders(
				<CampaignSchemasFilters
					filters={{ ...defaultFilters, search: 'existing search' }}
					onFiltersChange={onFiltersChange}
				/>
			);

			const searchInput = screen.getByPlaceholderText(
				'Search by name or code...'
			) as HTMLInputElement;
			expect(searchInput.value).toBe('existing search');
		});
	});

	describe('Objective filter interactions', () => {
		it('renders objective select with All Objectives placeholder', () => {
			renderWithProviders(
				<CampaignSchemasFilters
					filters={defaultFilters}
					onFiltersChange={onFiltersChange}
				/>
			);

			expect(screen.getByPlaceholderText('All Objectives')).toBeInTheDocument();
		});

		it('calls onFiltersChange when selecting an objective', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<CampaignSchemasFilters
					filters={defaultFilters}
					onFiltersChange={onFiltersChange}
				/>
			);

			const objectiveSelect = screen.getByPlaceholderText('All Objectives');
			await user.click(objectiveSelect);

			const option = await screen.findByText('Objective 1');
			await user.click(option);

			expect(onFiltersChange).toHaveBeenCalledWith({
				...defaultFilters,
				objectiveId: 1,
			});
		});

		it('calls onFiltersChange with null when selecting All Objectives', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<CampaignSchemasFilters
					filters={{ ...defaultFilters, objectiveId: 1 }}
					onFiltersChange={onFiltersChange}
				/>
			);

			const objectiveSelect = screen.getByPlaceholderText('All Objectives');
			await user.click(objectiveSelect);

			const options = await screen.findAllByText('All Objectives');
			// The second one is the option in the dropdown
			const allOption = options[options.length - 1];
			await user.click(allOption);

			expect(onFiltersChange).toHaveBeenCalledWith({
				...defaultFilters,
				objectiveId: null,
			});
		});

		it('calls onFiltersChange when selecting second objective', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<CampaignSchemasFilters
					filters={defaultFilters}
					onFiltersChange={onFiltersChange}
				/>
			);

			const objectiveSelect = screen.getByPlaceholderText('All Objectives');
			await user.click(objectiveSelect);

			const option = await screen.findByText('Objective 2');
			await user.click(option);

			expect(onFiltersChange).toHaveBeenCalledWith({
				...defaultFilters,
				objectiveId: 2,
			});
		});
	});

	describe('Sort filter interactions', () => {
		it('calls onFiltersChange when selecting a sort option', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<CampaignSchemasFilters
					filters={defaultFilters}
					onFiltersChange={onFiltersChange}
				/>
			);

			const sortSelect = screen.getByPlaceholderText('Sort by');
			await user.click(sortSelect);

			const option = await screen.findByText('Name Z-A');
			await user.click(option);

			expect(onFiltersChange).toHaveBeenCalledWith({
				...defaultFilters,
				sortBy: 'name',
				sortOrder: 'desc',
			});
		});

		it('calls onFiltersChange with code-asc when selecting Code A-Z', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<CampaignSchemasFilters
					filters={defaultFilters}
					onFiltersChange={onFiltersChange}
				/>
			);

			const sortSelect = screen.getByPlaceholderText('Sort by');
			await user.click(sortSelect);

			const option = await screen.findByText('Code A-Z');
			await user.click(option);

			expect(onFiltersChange).toHaveBeenCalledWith({
				...defaultFilters,
				sortBy: 'code',
				sortOrder: 'asc',
			});
		});

		it('shows active badge when sortOrder is desc', () => {
			renderWithProviders(
				<CampaignSchemasFilters
					filters={{ ...defaultFilters, sortOrder: 'desc' }}
					onFiltersChange={onFiltersChange}
				/>
			);

			expect(screen.getByText('Active')).toBeInTheDocument();
		});

		it('calls onFiltersChange with createdAt-desc for Newest First', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<CampaignSchemasFilters
					filters={defaultFilters}
					onFiltersChange={onFiltersChange}
				/>
			);

			const sortSelect = screen.getByPlaceholderText('Sort by');
			await user.click(sortSelect);

			const option = await screen.findByText('Newest First');
			await user.click(option);

			expect(onFiltersChange).toHaveBeenCalledWith({
				...defaultFilters,
				sortBy: 'createdAt',
				sortOrder: 'desc',
			});
		});

		it('calls onFiltersChange with objectiveId-asc for Objective A-Z', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<CampaignSchemasFilters
					filters={defaultFilters}
					onFiltersChange={onFiltersChange}
				/>
			);

			const sortSelect = screen.getByPlaceholderText('Sort by');
			await user.click(sortSelect);

			const option = await screen.findByText('Objective A-Z');
			await user.click(option);

			expect(onFiltersChange).toHaveBeenCalledWith({
				...defaultFilters,
				sortBy: 'objectiveId',
				sortOrder: 'asc',
			});
		});

		it('calls onFiltersChange with updatedAt-desc for Recently Updated', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<CampaignSchemasFilters
					filters={defaultFilters}
					onFiltersChange={onFiltersChange}
				/>
			);

			const sortSelect = screen.getByPlaceholderText('Sort by');
			await user.click(sortSelect);

			const option = await screen.findByText('Recently Updated');
			await user.click(option);

			expect(onFiltersChange).toHaveBeenCalledWith({
				...defaultFilters,
				sortBy: 'updatedAt',
				sortOrder: 'desc',
			});
		});
	});

	describe('Edge cases', () => {
		it('handles empty objectives list gracefully', () => {
			vi.doMock('~/queries/campaignObjectivesQueries', () => ({
				useGetCampaignObjectives: () => ({
					data: { data: [] },
				}),
			}));

			renderWithProviders(
				<CampaignSchemasFilters
					filters={defaultFilters}
					onFiltersChange={onFiltersChange}
				/>
			);

			expect(screen.getByPlaceholderText('All Objectives')).toBeInTheDocument();
		});

		it('handles undefined objectives response', () => {
			vi.doMock('~/queries/campaignObjectivesQueries', () => ({
				useGetCampaignObjectives: () => ({
					data: undefined,
				}),
			}));

			renderWithProviders(
				<CampaignSchemasFilters
					filters={defaultFilters}
					onFiltersChange={onFiltersChange}
				/>
			);

			expect(screen.getByPlaceholderText('All Objectives')).toBeInTheDocument();
		});

		it('displays multiple active filters correctly', () => {
			renderWithProviders(
				<CampaignSchemasFilters
					filters={{
						search: 'test',
						objectiveId: 1,
						sortBy: 'code',
						sortOrder: 'desc',
					}}
					onFiltersChange={onFiltersChange}
				/>
			);

			expect(screen.getByText('Active')).toBeInTheDocument();
			expect(screen.getByTitle('Clear all filters')).toBeInTheDocument();
		});

		it('renders all sort options when dropdown is opened', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<CampaignSchemasFilters
					filters={defaultFilters}
					onFiltersChange={onFiltersChange}
				/>
			);

			const sortSelect = screen.getByPlaceholderText('Sort by');
			await user.click(sortSelect);

			expect(await screen.findByText('Name A-Z')).toBeInTheDocument();
			expect(screen.getByText('Name Z-A')).toBeInTheDocument();
			expect(screen.getByText('Code A-Z')).toBeInTheDocument();
			expect(screen.getByText('Code Z-A')).toBeInTheDocument();
			expect(screen.getByText('Objective A-Z')).toBeInTheDocument();
			expect(screen.getByText('Objective Z-A')).toBeInTheDocument();
			expect(screen.getByText('Newest First')).toBeInTheDocument();
			expect(screen.getByText('Oldest First')).toBeInTheDocument();
			expect(screen.getByText('Recently Updated')).toBeInTheDocument();
		});
	});
});
