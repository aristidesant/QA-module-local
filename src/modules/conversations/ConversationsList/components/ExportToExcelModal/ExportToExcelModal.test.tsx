import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import ExportToExcelModal from './ExportToExcelModal';

describe('ExportToExcelModal', () => {
	const mockOnClose = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders correctly when opened', async () => {
		renderWithProviders(
			<ExportToExcelModal opened={true} onClose={mockOnClose} />
		);

		expect(
			await screen.findByTestId('export-to-excel-modal-content')
		).toBeInTheDocument();
		expect(screen.getByText('Export conversations')).toBeInTheDocument();
	});

	it('does not render when closed', () => {
		renderWithProviders(
			<ExportToExcelModal opened={false} onClose={mockOnClose} />
		);

		expect(
			screen.queryByTestId('export-to-excel-modal-content')
		).not.toBeInTheDocument();
	});

	it('calls onClose when Cancel button is clicked', async () => {
		renderWithProviders(
			<ExportToExcelModal opened={true} onClose={mockOnClose} />
		);

		const cancelBtn = await screen.findByRole('button', { name: 'Cancel' });
		fireEvent.click(cancelBtn);
		expect(mockOnClose).toHaveBeenCalled();
	});

	it('has required export fields with test ids', async () => {
		renderWithProviders(
			<ExportToExcelModal opened={true} onClose={mockOnClose} />
		);

		expect(screen.getByTestId('export-from-date')).toBeInTheDocument();
		expect(screen.getByTestId('export-to-date')).toBeInTheDocument();
		expect(screen.getByTestId('export-direction-select')).toBeInTheDocument();
	});
});
