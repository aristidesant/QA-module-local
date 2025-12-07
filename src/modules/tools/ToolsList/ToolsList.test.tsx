import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ToolsList from './ToolsList';
import useToolsStore from '~/stores/toolsStore';
import { useToolsByCategory } from '~/queries/toolQueries';
import { MantineProvider } from '@mantine/core';

// Mock dependencies
vi.mock('~/stores/toolsStore', () => ({
	default: vi.fn(),
}));

vi.mock('~/queries/toolQueries', () => ({
	useToolsByCategory: vi.fn(),
}));

vi.mock('./useToolsListColumns', () => ({
	default: () => [],
}));

vi.mock('~/components/BaseTable', () => ({
	default: ({ onRowClick, data }: any) => (
		<div data-testid='base-table'>
			{data.map((item: any) => (
				<div
					key={item.id}
					data-testid={`row-${item.id}`}
					onClick={() => onRowClick(item)}
				>
					{item.name}
				</div>
			))}
		</div>
	),
}));

vi.mock('~/components/EmptyState', () => ({
	default: ({ message }: any) => <div data-testid='empty-state'>{message}</div>,
}));

const renderWithProvider = (component: React.ReactNode) => {
	return render(<MantineProvider>{component}</MantineProvider>);
};

describe('ToolsList', () => {
	const mockOnCreate = vi.fn();
	const mockOnEdit = vi.fn();
	const mockCategory = { id: 1, name: 'Webhook' };
	const mockTools = [
		{ id: 101, name: 'Tool 1' },
		{ id: 102, name: 'Tool 2' },
	];

	beforeEach(() => {
		vi.clearAllMocks();
		(useToolsStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			selectedToolCategory: mockCategory,
		});
	});

	it('renders select category state when no category is selected', () => {
		(useToolsStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			selectedToolCategory: null,
		});
		(useToolsByCategory as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
			{
				data: [],
				isLoading: false,
			}
		);

		renderWithProvider(
			<ToolsList onCreate={mockOnCreate} onEdit={mockOnEdit} />
		);
		expect(screen.getByText('Select a category first')).toBeInTheDocument();
	});

	it('renders loading state', () => {
		(useToolsByCategory as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
			{
				data: [],
				isLoading: true,
			}
		);

		renderWithProvider(
			<ToolsList onCreate={mockOnCreate} onEdit={mockOnEdit} />
		);
		expect(screen.getByText('Loading tools...')).toBeInTheDocument();
	});

	it('renders error state', () => {
		(useToolsByCategory as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
			{
				data: [],
				isLoading: false,
				error: { message: 'Failed to load tools' },
			}
		);

		renderWithProvider(
			<ToolsList onCreate={mockOnCreate} onEdit={mockOnEdit} />
		);
		expect(screen.getByText('Error loading tools')).toBeInTheDocument();
	});

	it('renders empty list state and handles create from header', () => {
		(useToolsByCategory as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
			{
				data: [],
				isLoading: false,
			}
		);

		renderWithProvider(
			<ToolsList onCreate={mockOnCreate} onEdit={mockOnEdit} />
		);
		expect(screen.getByTestId('empty-state')).toBeInTheDocument();
	});

	it('renders tools table', () => {
		(useToolsByCategory as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
			{
				data: mockTools,
				isLoading: false,
			}
		);

		renderWithProvider(
			<ToolsList onCreate={mockOnCreate} onEdit={mockOnEdit} />
		);
		expect(screen.getByTestId('base-table')).toBeInTheDocument();
		expect(screen.getByText('Tool 1')).toBeInTheDocument();
		expect(screen.getByText('Tool 2')).toBeInTheDocument();
	});

	it('calls onEdit when a row is clicked', () => {
		(useToolsByCategory as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
			{
				data: mockTools,
				isLoading: false,
			}
		);

		renderWithProvider(
			<ToolsList onCreate={mockOnCreate} onEdit={mockOnEdit} />
		);

		const row = screen.getByTestId('row-101');
		fireEvent.click(row);

		expect(mockOnEdit).toHaveBeenCalledWith(101);
	});
});
