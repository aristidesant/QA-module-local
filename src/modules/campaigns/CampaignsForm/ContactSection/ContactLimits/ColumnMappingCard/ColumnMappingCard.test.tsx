import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import ColumnMappingCard from './ColumnMappingCard';
import { modals } from '@mantine/modals';

// Mock modals
vi.mock('@mantine/modals', () => ({
	modals: {
		open: vi.fn(),
	},
}));

describe('ColumnMappingCard', () => {
	const mockOnMappingChange = vi.fn();
	const defaultProps = {
		columnMappings: {},
		headers: ['col1', 'col2'],
		onMappingChange: mockOnMappingChange,
	};

	it('renders correctly', () => {
		renderWithProviders(<ColumnMappingCard {...defaultProps} />);

		expect(screen.getByText('Column Mapping')).toBeInTheDocument();
		expect(screen.getByText('Click to configure')).toBeInTheDocument();
	});

	it('opens modal on click', async () => {
		renderWithProviders(<ColumnMappingCard {...defaultProps} />);

		const card = screen.getByText('Click to configure');
		await userEvent.click(card);

		expect(modals.open).toHaveBeenCalledWith(
			expect.objectContaining({
				modalId: 'match-columns-modal',
				title: 'Match Columns',
			})
		);
	});

	it('shows correct mapping count', () => {
		renderWithProviders(
			<ColumnMappingCard
				{...defaultProps}
				columnMappings={{ field1: { csvField: 'col1' } }}
			/>
		);

		expect(screen.getByText('1/2')).toBeInTheDocument();
	});
});
