import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import ExportToExcelModal from './ExportToExcelModal';

// Mock react-i18next
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

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
		expect(screen.getByText('conversations.export.title')).toBeInTheDocument();
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

		const cancelBtn = await screen.findByText(/conversations.export.cancel/i);
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
