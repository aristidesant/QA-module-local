import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { ClientConfigsFilters } from './ClientConfigsFilters';
import { useClientConfigsStore } from '~/stores/clientConfigsStore';

const setFiltersMock = vi.fn();
const resetFiltersMock = vi.fn();

vi.mock('~/stores/clientConfigsStore', () => ({
	useClientConfigsStore: vi.fn(),
}));

const mockedStore = useClientConfigsStore as unknown as ReturnType<
	typeof vi.fn
>;

const defaultFilters = {
	search: '',
	type: null,
	sortBy: 'name' as const,
	sortOrder: 'asc' as const,
};

describe('ClientConfigsFilters', () => {
	beforeEach(() => {
		setFiltersMock.mockReset();
		resetFiltersMock.mockReset();
		mockedStore.mockImplementation(() => ({
			filters: defaultFilters,
			setFilters: setFiltersMock,
			resetFilters: resetFiltersMock,
		}));
	});

	describe('Rendering', () => {
		it('renders filter title and controls', () => {
			renderWithProviders(<ClientConfigsFilters />);

			expect(screen.getByText('Filters')).toBeInTheDocument();
			expect(
				screen.getByPlaceholderText(/Search by name or description/i)
			).toBeInTheDocument();
		});

		it('does not show Active badge when no filters are active', () => {
			renderWithProviders(<ClientConfigsFilters />);

			expect(screen.queryByText('Active')).not.toBeInTheDocument();
		});

		it('shows Active badge when search filter is active', () => {
			mockedStore.mockImplementation(() => ({
				filters: { ...defaultFilters, search: 'test' },
				setFilters: setFiltersMock,
				resetFilters: resetFiltersMock,
			}));

			renderWithProviders(<ClientConfigsFilters />);

			expect(screen.getByText('Active')).toBeInTheDocument();
		});

		it('shows Active badge when type filter is active', () => {
			mockedStore.mockImplementation(() => ({
				filters: { ...defaultFilters, type: 'json' },
				setFilters: setFiltersMock,
				resetFilters: resetFiltersMock,
			}));

			renderWithProviders(<ClientConfigsFilters />);

			expect(screen.getByText('Active')).toBeInTheDocument();
		});

		it('shows Active badge when sort is changed from default', () => {
			mockedStore.mockImplementation(() => ({
				filters: { ...defaultFilters, sortBy: 'updatedAt', sortOrder: 'desc' },
				setFilters: setFiltersMock,
				resetFilters: resetFiltersMock,
			}));

			renderWithProviders(<ClientConfigsFilters />);

			expect(screen.getByText('Active')).toBeInTheDocument();
		});
	});

	describe('Search Input', () => {
		it('calls setFilters when search input changes', async () => {
			renderWithProviders(<ClientConfigsFilters />);

			const user = userEvent.setup();
			const searchInput = screen.getByPlaceholderText(
				/Search by name or description/i
			);

			await user.type(searchInput, 'test');

			expect(setFiltersMock).toHaveBeenCalled();
			const lastCall =
				setFiltersMock.mock.calls[setFiltersMock.mock.calls.length - 1][0];
			expect(lastCall.search).toBe('t');
		});
	});

	describe('Type Select', () => {
		it('renders type select with placeholder', () => {
			renderWithProviders(<ClientConfigsFilters />);

			expect(screen.getByPlaceholderText('All Types')).toBeInTheDocument();
		});
	});

	describe('Sort Select', () => {
		it('renders sort select with default value', () => {
			renderWithProviders(<ClientConfigsFilters />);

			expect(screen.getByPlaceholderText('Sort by')).toBeInTheDocument();
		});
	});

	describe('Clear Filters', () => {
		it('shows clear button when filters are active', () => {
			mockedStore.mockImplementation(() => ({
				filters: { ...defaultFilters, search: 'something' },
				setFilters: setFiltersMock,
				resetFilters: resetFiltersMock,
			}));

			renderWithProviders(<ClientConfigsFilters />);

			expect(
				screen.getByRole('button', { name: /Clear all filters/i })
			).toBeInTheDocument();
		});

		it('does not show clear button when no filters are active', () => {
			renderWithProviders(<ClientConfigsFilters />);

			expect(
				screen.queryByRole('button', { name: /Clear all filters/i })
			).not.toBeInTheDocument();
		});

		it('calls resetFilters when clear button is clicked', async () => {
			mockedStore.mockImplementation(() => ({
				filters: { ...defaultFilters, search: 'something' },
				setFilters: setFiltersMock,
				resetFilters: resetFiltersMock,
			}));

			renderWithProviders(<ClientConfigsFilters />);

			const user = userEvent.setup();
			const clearButton = screen.getByRole('button', {
				name: /Clear all filters/i,
			});

			await user.click(clearButton);

			expect(resetFiltersMock).toHaveBeenCalled();
		});
	});
});
