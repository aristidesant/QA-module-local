import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StepOneGeneral } from './StepOneGeneral';
import { useCampaignWizardStore } from '~/stores/campaignWizardStore';
import { useCreateCampaignWithAgent } from '~/queries/campaignsQueries';
import { useGetCampaignObjectives } from '~/queries/campaignObjectivesQueries';
import { useGetAllAgentVoices } from '~/queries/agentVoiceQueries';
import { MantineProvider } from '@mantine/core';
import { notifications } from '@mantine/notifications';

// Mock stores and queries
vi.mock('~/stores/campaignWizardStore', () => ({
	useCampaignWizardStore: vi.fn(),
}));

vi.mock('~/queries/campaignsQueries', () => ({
	useCreateCampaignWithAgent: vi.fn(),
}));

vi.mock('~/queries/campaignObjectivesQueries', () => ({
	useGetCampaignObjectives: vi.fn(),
}));

vi.mock('~/queries/agentVoiceQueries', () => ({
	useGetAllAgentVoices: vi.fn(),
}));

vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: vi.fn(),
	},
}));

// Mock PhoneNumberSelector as it might be complex
vi.mock('../../AddNewCampaignForm/PhoneNumberSelector', () => ({
	default: ({ onChange, value, error }: any) => (
		<div>
			<input
				data-testid='phone-selector'
				value={value || ''}
				onChange={(e) => onChange(e.target.value)}
			/>
			{error && <div>{error}</div>}
		</div>
	),
}));

describe('StepOneGeneral', () => {
	const mockOnNext = vi.fn();
	const mockOnCancel = vi.fn();
	const mockMutate = vi.fn();

	const mockStore = {
		campaignName: '',
		description: '',
		campaignType: 'INBOUND',
		phoneNumberId: '',
		objectiveId: null,
		defaultMaxWaves: 3,
		setCampaignName: vi.fn(),
		setDescription: vi.fn(),
		setCampaignType: vi.fn(),
		setPhoneNumberId: vi.fn(),
		setObjectiveId: vi.fn(),
		setDefaultMaxWaves: vi.fn(),
		setCreatedCampaign: vi.fn(),
		setIsSubmitting: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
		(
			useCampaignWizardStore as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue(mockStore);
		(
			useCreateCampaignWithAgent as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue({
			mutate: mockMutate,
			isPending: false,
			isError: false,
			error: null,
		});
		(
			useGetCampaignObjectives as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue({
			data: { data: [{ id: 1, name: 'Sales' }] },
		});
		(
			useGetAllAgentVoices as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue({
			data: [{ voice: { id: 'voice-1' } }],
		});
	});

	const renderComponent = () => {
		return render(
			<MantineProvider>
				<StepOneGeneral onNext={mockOnNext} onCancel={mockOnCancel} />
			</MantineProvider>
		);
	};

	it('renders all form fields', () => {
		renderComponent();
		expect(screen.getByLabelText(/Campaign Name/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
		expect(screen.getByText(/Campaign Type/i)).toBeInTheDocument();
		expect(screen.getByTestId('phone-selector')).toBeInTheDocument();
		// Find the Campaign Objective select by its label text
		expect(screen.getByText(/Campaign Objective/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/Default Waves/i)).toBeInTheDocument();
	});

	it('validates required fields', async () => {
		renderComponent();

		const submitButton = screen.getByRole('button', {
			name: /Save & Continue/i,
		});
		expect(submitButton).toBeDisabled();
	});

	it('enables submit button when form is valid', async () => {
		renderComponent();

		fireEvent.change(screen.getByLabelText(/Campaign Name/i), {
			target: { value: 'Test Campaign' },
		});
		fireEvent.change(screen.getByLabelText(/Description/i), {
			target: { value: 'Test Description' },
		});
		fireEvent.change(screen.getByTestId('phone-selector'), {
			target: { value: '10' },
		});

		const submitButton = screen.getByText('Save & Continue');
		await waitFor(() => expect(submitButton).not.toBeDisabled());
	});

	it('submits the form with correct data', async () => {
		renderComponent();

		fireEvent.change(screen.getByLabelText(/Campaign Name/i), {
			target: { value: 'Test Campaign' },
		});
		fireEvent.change(screen.getByLabelText(/Description/i), {
			target: { value: 'Test Description' },
		});
		fireEvent.change(screen.getByTestId('phone-selector'), {
			target: { value: '10' },
		});

		// Select objective
		// Mantine Select is tricky to test directly with fireEvent.change sometimes.
		// We can try to find the input inside it or just skip if not critical, but better to test.
		// Let's assume objective is optional or we just test required fields first.

		const submitButton = screen.getByText('Save & Continue');
		await waitFor(() => expect(submitButton).not.toBeDisabled());
		fireEvent.click(submitButton);

		expect(mockMutate).toHaveBeenCalled();
		const callArgs = mockMutate.mock.calls[0][0];
		expect(callArgs.campaign.name).toBe('Test Campaign');
		expect(callArgs.campaign.description).toBe('Test Description');
		expect(callArgs.campaign.defaultMaxWaves).toBe(3);
	});

	it('handles submission success', async () => {
		// Mock mutate to call onSuccess immediately
		(
			useCreateCampaignWithAgent as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue({
			mutate: (_data: any, { onSuccess }: any) =>
				onSuccess({ campaign: { id: 1 } }),
			isPending: false,
		});

		renderComponent();

		fireEvent.change(screen.getByLabelText(/Campaign Name/i), {
			target: { value: 'Test Campaign' },
		});
		fireEvent.change(screen.getByLabelText(/Description/i), {
			target: { value: 'Test Description' },
		});
		fireEvent.change(screen.getByTestId('phone-selector'), {
			target: { value: '10' },
		});

		const submitButton = screen.getByText('Save & Continue');
		await waitFor(() => expect(submitButton).not.toBeDisabled());
		fireEvent.click(submitButton);

		expect(mockStore.setCreatedCampaign).toHaveBeenCalledWith({ id: 1 });
		expect(mockOnNext).toHaveBeenCalled();
		expect(notifications.show).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Campaign Created',
				color: 'green',
			})
		);
	});

	it('handles submission error', async () => {
		// Mock mutate to call onError immediately
		(
			useCreateCampaignWithAgent as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue({
			mutate: (_data: any, { onError }: any) => onError(new Error('Failed')),
			isPending: false,
		});

		renderComponent();

		fireEvent.change(screen.getByLabelText(/Campaign Name/i), {
			target: { value: 'Test Campaign' },
		});
		fireEvent.change(screen.getByLabelText(/Description/i), {
			target: { value: 'Test Description' },
		});
		fireEvent.change(screen.getByTestId('phone-selector'), {
			target: { value: '10' },
		});

		const submitButton = screen.getByText('Save & Continue');
		await waitFor(() => expect(submitButton).not.toBeDisabled());
		fireEvent.click(submitButton);

		expect(notifications.show).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Error',
				message: 'Failed',
				color: 'red',
			})
		);
	});

	it('shows error if no voices available', async () => {
		(
			useGetAllAgentVoices as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue({
			data: [],
		});

		renderComponent();

		fireEvent.change(screen.getByLabelText(/Campaign Name/i), {
			target: { value: 'Test Campaign' },
		});
		fireEvent.change(screen.getByLabelText(/Description/i), {
			target: { value: 'Test Description' },
		});
		fireEvent.change(screen.getByTestId('phone-selector'), {
			target: { value: 'phone-123' },
		});

		const submitButton = screen.getByText('Save & Continue');
		await waitFor(() => expect(submitButton).not.toBeDisabled());
		fireEvent.click(submitButton);

		expect(notifications.show).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Error',
				message: 'No agent voices available. Please contact support.',
				color: 'red',
			})
		);
		expect(mockMutate).not.toHaveBeenCalled();
	});
});
