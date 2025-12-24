import { screen } from '@testing-library/react';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { ContactHeaderMapping } from './ContactHeaderMapping';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { useGetClientConfig } from '~/queries/clientConfigQueries';
import { useGetSchemaByObjectiveId } from '~/queries/campaignContactSchemasQueries';

// Mock the hooks
vi.mock('~/queries/clientConfigQueries');
vi.mock('~/queries/campaignContactSchemasQueries');
vi.mock('~/stores/campaignsStore');

describe('ContactHeaderMapping', () => {
	const mockOnMappingChange = vi.fn();

	beforeEach(() => {
		vi.resetAllMocks();
		(useCampaignsStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			selectedCampaign: { objectiveId: 1 },
		});
		(useGetClientConfig as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
			{
				data: { value: '[]' },
				isLoading: false,
			}
		);
		(
			useGetSchemaByObjectiveId as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue({
			data: { data: [] },
		});
	});

	it('renders correctly', () => {
		renderWithProviders(
			<ContactHeaderMapping
				documentColumns={['col1', 'col2']}
				onMappingChange={mockOnMappingChange}
			/>
		);

		expect(
			screen.getByText('Map CSV headers to system fields')
		).toBeInTheDocument();
		expect(screen.getByText('CSV columns')).toBeInTheDocument();
		expect(screen.getByText('System fields')).toBeInTheDocument();
	});

	it('displays document columns', () => {
		renderWithProviders(
			<ContactHeaderMapping
				documentColumns={['Email', 'Phone']}
				onMappingChange={mockOnMappingChange}
			/>
		);

		expect(screen.getByText('Email')).toBeInTheDocument();
		expect(screen.getByText('Phone')).toBeInTheDocument();
	});
});
