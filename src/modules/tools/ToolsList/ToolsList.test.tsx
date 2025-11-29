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

vi.mock('~/components/SectionCard', () => ({
	default: ({ title, children, headerActions }: any) => (
		<div data-testid='section-card'>
			<h2>{title}</h2>
			<div data-testid='header-actions'>{headerActions}</div>
			{children}
		</div>
	),
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

vi.mock('~/modules/tools/ToolForm', () => ({
	default: () => <div data-testid='tool-form'>ToolForm</div>,
}));

vi.mock('./ToolsListHeader', () => ({
	default: ({ category, onCreate }: any) => (
		<div data-testid='tools-list-header'>
			<span>{category.name} Header</span>
			<button onClick={onCreate}>Create Header</button>
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
	const mockSetToolsCategory = vi.fn();
	const mockCategory = { id: 1, name: 'Webhook' };
	const mockTools = [
		{ id: 101, name: 'Tool 1' },
		{ id: 102, name: 'Tool 2' },
	];

	beforeEach(() => {
		vi.clearAllMocks();
		(useToolsStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			selectedToolCategory: mockCategory,
			setToolsCategory: mockSetToolsCategory,
		});
	});

	it('renders select category state when no category is selected', () => {
		(useToolsStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			selectedToolCategory: null,
			setToolsCategory: mockSetToolsCategory,
		});
		(useToolsByCategory as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
			{
				data: [],
				isLoading: false,
			}
		);

		renderWithProvider(<ToolsList />);
		expect(screen.getByText('Select a category first')).toBeInTheDocument();
	});

	it('renders loading state', () => {
		(useToolsByCategory as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
			{
				data: [],
				isLoading: true,
			}
		);

		renderWithProvider(<ToolsList />);
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

		renderWithProvider(<ToolsList />);
		expect(screen.getByText('Error loading tools')).toBeInTheDocument();
		expect(screen.getByText('Failed to load tools')).toBeInTheDocument();
	});

	it('renders empty list state', () => {
		(useToolsByCategory as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
			{
				data: [],
				isLoading: false,
			}
		);

		renderWithProvider(<ToolsList />);
		expect(screen.getByTestId('tools-list-header')).toBeInTheDocument();
		expect(screen.getByTestId('empty-state')).toBeInTheDocument();
		expect(screen.getByText('No tools in this category')).toBeInTheDocument();
	});

	it('renders tools table', () => {
		(useToolsByCategory as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
			{
				data: mockTools,
				isLoading: false,
			}
		);

		renderWithProvider(<ToolsList />);
		expect(screen.getByTestId('base-table')).toBeInTheDocument();
		expect(screen.getByText('Tool 1')).toBeInTheDocument();
		expect(screen.getByText('Tool 2')).toBeInTheDocument();
	});

	it('opens create tool form when create button is clicked', () => {
		(useToolsByCategory as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
			{
				data: mockTools,
				isLoading: false,
			}
		);

		renderWithProvider(<ToolsList />);

		const createButton = screen.getByRole('button', {
			name: /create new tool/i,
		});
		fireEvent.click(createButton);

		expect(mockSetToolsCategory).toHaveBeenCalledWith(
			mockCategory,
			expect.anything()
		);
	});

	it('opens edit tool form when a row is clicked', () => {
		(useToolsByCategory as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
			{
				data: mockTools,
				isLoading: false,
			}
		);

		renderWithProvider(<ToolsList />);

		const row = screen.getByTestId('row-101');
		fireEvent.click(row);

		expect(mockSetToolsCategory).toHaveBeenCalledWith(
			mockCategory,
			expect.anything()
		);
	});
});
