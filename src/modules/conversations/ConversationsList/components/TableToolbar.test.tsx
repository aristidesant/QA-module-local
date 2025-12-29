import { screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { TableToolbar } from './TableToolbar';

// Mock ExportToExcelModal to avoid testing its internals
vi.mock('./ExportToExcelModal', () => ({
	default: ({ opened, onClose }: { opened: boolean; onClose: () => void }) =>
		opened ? (
			<div data-testid='export-modal'>
				<button onClick={onClose}>Close Modal</button>
			</div>
		) : null,
}));

describe('TableToolbar', () => {
	const defaultProps = {
		table: {} as any,
		globalFilter: '',
		onGlobalFilterChange: vi.fn(),
		onRefresh: vi.fn(),
		isLoading: false,
	};

	it('renders search input with correct placeholder', () => {
		renderWithProviders(<TableToolbar {...defaultProps} />);

		const searchInput = screen.getByPlaceholderText('Search conversations...');
		expect(searchInput).toBeInTheDocument();
	});

	it('calls onGlobalFilterChange when typing in search input', async () => {
		const onGlobalFilterChange = vi.fn();
		renderWithProviders(
			<TableToolbar
				{...defaultProps}
				onGlobalFilterChange={onGlobalFilterChange}
			/>
		);

		const searchInput = screen.getByPlaceholderText('Search conversations...');
		await userEvent.type(searchInput, 'test search');

		expect(onGlobalFilterChange).toHaveBeenCalled();
	});

	it('renders refresh button and calls onRefresh when clicked', async () => {
		const onRefresh = vi.fn();
		renderWithProviders(
			<TableToolbar {...defaultProps} onRefresh={onRefresh} />
		);

		const refreshButton = screen.getByRole('button', { name: /refresh/i });
		await userEvent.click(refreshButton);

		expect(onRefresh).toHaveBeenCalledTimes(1);
	});

	it('does not render refresh button if onRefresh is not provided', () => {
		renderWithProviders(
			<TableToolbar {...defaultProps} onRefresh={undefined} />
		);

		const refreshButton = screen.queryByRole('button', { name: /refresh/i });
		expect(refreshButton).not.toBeInTheDocument();
	});

	it('renders loader when isLoading is true', () => {
		renderWithProviders(<TableToolbar {...defaultProps} isLoading={true} />);

		// The loader is inside an ActionIcon with aria-label="loading"
		expect(screen.getByLabelText('loading')).toBeInTheDocument();
	});

	it('opens ExportToExcelModal when export button is clicked', async () => {
		renderWithProviders(<TableToolbar {...defaultProps} />);

		const exportButton = screen.getByRole('button', { name: /export/i });
		await userEvent.click(exportButton);

		expect(screen.getByTestId('export-modal')).toBeInTheDocument();

		const closeButton = screen.getByText('Close Modal');
		await userEvent.click(closeButton);

		expect(screen.queryByTestId('export-modal')).not.toBeInTheDocument();
	});
});
