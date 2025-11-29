import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ToolsCategories from './ToolsCategories';
import { useToolCategories } from '~/queries/toolCategoryQueries';
import useToolsStore from '~/stores/toolsStore';
import { MantineProvider } from '@mantine/core';

// Mock queries
vi.mock('~/queries/toolCategoryQueries', () => ({
	useToolCategories: vi.fn(),
}));

// Mock store
vi.mock('~/stores/toolsStore', () => ({
	default: vi.fn(),
}));

const renderWithProvider = (component: React.ReactNode) => {
	return render(<MantineProvider>{component}</MantineProvider>);
};

describe('ToolsCategories', () => {
	const mockSetToolsCategory = vi.fn();
	const mockCategories = [
		{ id: 1, name: 'Webhook', _count: { tools: 5 } },
		{ id: 2, name: 'Database', _count: { tools: 3 } },
	];

	beforeEach(() => {
		vi.clearAllMocks();
		(useToolsStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
			(selector) =>
				selector({
					selectedToolCategory: null,
					setToolsCategory: mockSetToolsCategory,
				})
		);
	});

	it('renders loading state', () => {
		(useToolCategories as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			isLoading: true,
			data: [],
		});

		renderWithProvider(<ToolsCategories />);
		expect(screen.getByText('Loading categories')).toBeInTheDocument();
	});

	it('renders error state', () => {
		(useToolCategories as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			isLoading: false,
			error: new Error('Failed to fetch'),
			data: [],
		});

		renderWithProvider(<ToolsCategories />);
		expect(screen.getByText('Error loading categories')).toBeInTheDocument();
	});

	it('renders empty state', () => {
		(useToolCategories as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			isLoading: false,
			data: [],
		});

		renderWithProvider(<ToolsCategories />);
		expect(screen.getByText('No categories yet')).toBeInTheDocument();
	});

	it('renders categories and selects default webhook category', () => {
		(useToolCategories as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			isLoading: false,
			data: mockCategories,
		});

		renderWithProvider(<ToolsCategories />);

		// Check if categories are rendered (SegmentedControl labels)
		expect(screen.getByText('Webhook')).toBeInTheDocument();
		expect(screen.getByText('Database')).toBeInTheDocument();

		// Check if setToolsCategory was called with Webhook category
		expect(mockSetToolsCategory).toHaveBeenCalledWith(mockCategories[0], null);
	});

	it('does not auto-select if category is already selected', () => {
		(useToolCategories as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			isLoading: false,
			data: mockCategories,
		});

		(useToolsStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
			(selector) =>
				selector({
					selectedToolCategory: mockCategories[1], // Database selected
					setToolsCategory: mockSetToolsCategory,
				})
		);

		renderWithProvider(<ToolsCategories />);

		// Should not call setToolsCategory again for default selection
		expect(mockSetToolsCategory).not.toHaveBeenCalled();
	});

	it('calls setToolsCategory when a category is clicked', () => {
		(useToolCategories as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			isLoading: false,
			data: mockCategories,
		});

		renderWithProvider(<ToolsCategories />);

		// Find the radio input for "Database" and click it (SegmentedControl uses inputs)
		// Alternatively, just click the label
		const databaseOption = screen.getByText('Database');
		fireEvent.click(databaseOption);

		expect(mockSetToolsCategory).toHaveBeenCalledWith(mockCategories[1], null);
	});
});
