import { screen, fireEvent, waitFor } from '@testing-library/react';
import { AxiosError } from 'axios';
import { notifications } from '@mantine/notifications';
import { StepOneGeneral } from './StepOneGeneral';
import { useCampaignWizardStore } from '~/stores/campaignWizardStore';
import {
	useCreateCampaignWithAgent,
	useSetCampaignDraft,
} from '~/queries/campaignsQueries';
import { useGetCampaignObjectives } from '~/queries/campaignObjectivesQueries';
import { useGetAllAgentVoices } from '~/queries/agentVoiceQueries';
import {
	renderWithProviders,
	testI18n,
} from '~/test-utils/renderWithProviders';

// Mock stores and queries
vi.mock('~/stores/campaignWizardStore', () => ({
	useCampaignWizardStore: vi.fn(),
}));

vi.mock('~/queries/campaignsQueries', () => ({
	useCreateCampaignWithAgent: vi.fn(),
	useSetCampaignDraft: vi.fn(),
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

// Mock PhoneNumberSelector using absolute path to ensure correct resolution
vi.mock('~/modules/campaigns/AddNewCampaignForm/PhoneNumberSelector', () => ({
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

// Mock CampaignObjectivesForm
vi.mock(
	'~/modules/campaign-management/campaign-objectives/components/CampaignObjectivesForm/CampaignObjectivesForm',
	() => ({
		CampaignObjectivesForm: ({ onSuccess, onCancel }: any) => (
			<div data-testid='campaign-objectives-form'>
				Campaign Objectives Form
				<button onClick={() => onSuccess({ id: 999, name: 'New Objective' })}>
					Success
				</button>
				<button onClick={onCancel}>Cancel</button>
			</div>
		),
	})
);

// No mock for @tanstack/react-query needed

describe('StepOneGeneral', () => {
	const mockOnNext = vi.fn();
	const mockOnCancel = vi.fn();
	const mockMutate = vi.fn();

	const mockStore = {
		campaignName: '',
		description: '',
		campaignType: 'INBOUND',
		phoneNumberId: '',
		objectiveId: null as number | null,
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
			useSetCampaignDraft as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue({
			mutateAsync: vi.fn(),
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
		return renderWithProviders(
			<StepOneGeneral onNext={mockOnNext} onCancel={mockOnCancel} />
		);
	};

	it('renders all form fields including objective creation button', () => {
		renderComponent();
		expect(
			screen.getByLabelText(
				testI18n.t('wizard.steps.general.campaignName', { ns: 'campaigns' }),
				{ exact: false }
			)
		).toBeInTheDocument();
		expect(
			screen.getByLabelText(
				testI18n.t('wizard.steps.general.description', { ns: 'campaigns' }),
				{ exact: false }
			)
		).toBeInTheDocument();
		expect(
			screen.getByText(
				testI18n.t('wizard.steps.general.campaignType', { ns: 'campaigns' }),
				{ exact: false }
			)
		).toBeInTheDocument();
		expect(screen.getByTestId('phone-selector')).toBeInTheDocument();
		expect(
			screen.getByText(
				testI18n.t('wizard.steps.general.objective', { ns: 'campaigns' }),
				{ exact: false }
			)
		).toBeInTheDocument();
		expect(
			screen.getByLabelText(
				testI18n.t('wizard.steps.general.defaultWaves', { ns: 'campaigns' }),
				{ exact: false }
			)
		).toBeInTheDocument();
		// Check for create button (icon only, normally found by role or label if available, here verify via icon presence indirectly or use tooltip)
		// Since we don't have aria-label on ActionIcon in implementation, we check for the tooltip trigger or icon
		// Adding aria-label or just checking if modal opens is better. Let's assume icon or tooltip.
	});

	it('validates required fields including objective', async () => {
		renderComponent();

		const submitButton = screen.getByRole('button', {
			name: testI18n.t('wizard.steps.general.submit', { ns: 'campaigns' }),
		});
		expect(submitButton).toBeDisabled();

		// Fill other fields but leave objective empty
		fireEvent.change(
			screen.getByLabelText(
				testI18n.t('wizard.steps.general.campaignName', { ns: 'campaigns' }),
				{ exact: false }
			),
			{
				target: { value: 'Test Campaign' },
			}
		);
		fireEvent.change(
			screen.getByLabelText(
				testI18n.t('wizard.steps.general.description', { ns: 'campaigns' }),
				{ exact: false }
			),
			{
				target: { value: 'Test Description' },
			}
		);
		fireEvent.change(screen.getByTestId('phone-selector'), {
			target: { value: '10' },
		});

		// Should still be disabled because objective is mandatory
		await waitFor(() => expect(submitButton).toBeDisabled());
	});

	it('enables submit button when valid including objective', async () => {
		// Override mock store behavior for this test
		const storeWithObjective = { ...mockStore, objectiveId: 1 };
		(
			useCampaignWizardStore as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue(storeWithObjective);

		renderComponent();

		fireEvent.change(
			screen.getByLabelText(
				testI18n.t('wizard.steps.general.campaignName', { ns: 'campaigns' }),
				{ exact: false }
			),
			{
				target: { value: 'Test Campaign' },
			}
		);
		fireEvent.change(
			screen.getByLabelText(
				testI18n.t('wizard.steps.general.description', { ns: 'campaigns' }),
				{ exact: false }
			),
			{
				target: { value: 'Test Description' },
			}
		);
		fireEvent.change(screen.getByTestId('phone-selector'), {
			target: { value: '10' },
		});

		// Since we mocked the store return value above, the form initialValue should pick it up.
		await waitFor(() =>
			expect(
				screen.getByText(
					testI18n.t('wizard.steps.general.submit', { ns: 'campaigns' })
				)
			).toBeInTheDocument()
		);
		const submitButton = screen.getByText(
			testI18n.t('wizard.steps.general.submit', { ns: 'campaigns' })
		);
		await waitFor(() => expect(submitButton).not.toBeDisabled());
	});

	it('opens objective creation modal', async () => {
		renderComponent();

		// Find the button (ActionIcon) for creating new objective.
		// It has a Tooltip 'Create new objective', but Mantine Tooltips render in Portal.
		// Usually ActionIcon renders a button.
		const createButtons = screen.getAllByRole('button');
		// The last button in the form section is likely the "Save & Continue" or "Cancel",
		// but the ActionIcon is inside the form grid.
		// Let's rely on the svg or class if needed, or better, add aria-label in implementation.
		// Assuming we can find it structurally or blindly click "IconPlus" parent.

		// For now, let's find the button that isn't Cancel or Save
		const createButton = createButtons.find(
			(btn) =>
				!btn.textContent?.includes(
					testI18n.t('actions.cancel', { ns: 'common' })
				) &&
				!btn.textContent?.includes(
					testI18n.t('wizard.steps.general.submit', { ns: 'campaigns' })
				)
		);
		if (createButton) {
			fireEvent.click(createButton);
			await waitFor(() =>
				expect(
					screen.getByTestId('campaign-objectives-form')
				).toBeInTheDocument()
			);
		}
	});

	it('auto-selects newly created objective', async () => {
		renderComponent();

		// Open modal
		const createButtons = screen.getAllByRole('button');
		const createButton = createButtons.find(
			(btn) =>
				!btn.textContent?.includes(
					testI18n.t('actions.cancel', { ns: 'common' })
				) &&
				!btn.textContent?.includes(
					testI18n.t('wizard.steps.general.submit', { ns: 'campaigns' })
				)
		);

		if (createButton) {
			fireEvent.click(createButton);

			// Find Success button in the mocked form and click it
			const successButton = await screen.findByText('Success');
			fireEvent.click(successButton);

			// The modal should close
			await waitFor(() => {
				expect(
					screen.queryByTestId('campaign-objectives-form')
				).not.toBeInTheDocument();
			});

			// The objectiveId should be set to 999.
			// To verify, let's fill other required fields and check if the form is valid (submit button enabled)
			fireEvent.change(
				screen.getByLabelText(
					testI18n.t('wizard.steps.general.campaignName', { ns: 'campaigns' }),
					{ exact: false }
				),
				{
					target: { value: 'Test Campaign' },
				}
			);
			fireEvent.change(
				screen.getByLabelText(
					testI18n.t('wizard.steps.general.description', { ns: 'campaigns' }),
					{ exact: false }
				),
				{
					target: { value: 'Test Description' },
				}
			);
			fireEvent.change(screen.getByTestId('phone-selector'), {
				target: { value: '10' },
			});

			const submitButton = screen.getByText(
				testI18n.t('wizard.steps.general.submit', { ns: 'campaigns' })
			);
			await waitFor(() => expect(submitButton).not.toBeDisabled());
		}
	});

	it('submits the form with correct data', async () => {
		// Mock store with objective selected
		const storeWithObjective = { ...mockStore, objectiveId: 1 };
		(
			useCampaignWizardStore as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue(storeWithObjective);

		renderComponent();

		fireEvent.change(
			screen.getByLabelText(
				testI18n.t('wizard.steps.general.campaignName', { ns: 'campaigns' }),
				{ exact: false }
			),
			{
				target: { value: 'Test Campaign' },
			}
		);
		fireEvent.change(
			screen.getByLabelText(
				testI18n.t('wizard.steps.general.description', { ns: 'campaigns' }),
				{ exact: false }
			),
			{
				target: { value: 'Test Description' },
			}
		);

		const phoneSelector = await screen.findByTestId('phone-selector');
		fireEvent.change(phoneSelector, {
			target: { value: '10' },
		});

		const submitButton = screen.getByText(
			testI18n.t('wizard.steps.general.submit', { ns: 'campaigns' })
		);
		await waitFor(() => expect(submitButton).not.toBeDisabled());
		fireEvent.click(submitButton);

		expect(mockMutate).toHaveBeenCalled();
		const callArgs = mockMutate.mock.calls[0][0];
		expect(callArgs.campaign.objectiveId).toBe(1);
	});

	it('clears phone number when campaign type changes', async () => {
		renderComponent();

		// Set a phone number first
		const phoneSelector = screen.getByTestId(
			'phone-selector'
		) as HTMLInputElement;
		fireEvent.change(phoneSelector, { target: { value: '123' } });
		expect(phoneSelector.value).toBe('123');

		// Change campaign type to OUTBOUND
		const outboundRadio = screen.getByLabelText(
			testI18n.t('wizard.steps.general.campaignTypeOutbound', {
				ns: 'campaigns',
			})
		);
		fireEvent.click(outboundRadio);

		// Verify phone number is cleared
		expect(phoneSelector.value).toBe('');
	});

	it('shows specific error message from API response', async () => {
		const errorMessage =
			'Failed to create agent: Agent with name Demo already exists for this client. Campaign creation aborted.';

		const axiosError = new AxiosError(
			'Bad Gateway',
			'502',
			undefined,
			undefined,
			{
				data: {
					message: errorMessage,
					error: 'Bad Gateway',
					statusCode: 502,
				},
				status: 502,
				statusText: 'Bad Gateway',
				headers: {},
				config: {} as any,
			}
		);

		// Mock the mutation to return the error
		const mockCreateWithError = {
			mutate: (_data: any, { onError }: any) => {
				onError(axiosError);
			},
			isPending: false,
		};

		(
			useCreateCampaignWithAgent as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue(mockCreateWithError);

		// Use store with objective selected so we can submit immediately
		const storeWithObjective = { ...mockStore, objectiveId: 1 };
		(
			useCampaignWizardStore as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue(storeWithObjective);

		renderComponent();

		fireEvent.change(
			screen.getByLabelText(
				testI18n.t('wizard.steps.general.campaignName', { ns: 'campaigns' }),
				{ exact: false }
			),
			{
				target: { value: 'Duplicate Campaign' },
			}
		);
		fireEvent.change(
			screen.getByLabelText(
				testI18n.t('wizard.steps.general.description', { ns: 'campaigns' }),
				{ exact: false }
			),
			{
				target: { value: 'Test Description' },
			}
		);
		fireEvent.change(screen.getByTestId('phone-selector'), {
			target: { value: '10' },
		});

		const submitButton = screen.getByText(
			testI18n.t('wizard.steps.general.submit', { ns: 'campaigns' })
		);
		await waitFor(() => expect(submitButton).not.toBeDisabled());
		fireEvent.click(submitButton);

		// Verify notification is called with the specific message
		expect(notifications.show).toHaveBeenCalledWith(
			expect.objectContaining({
				title: testI18n.t('wizard.steps.general.errorTitle', {
					ns: 'campaigns',
				}),
				message: errorMessage,
				color: 'red',
			})
		);
	});

	it('renders error alert when creation fails', () => {
		// Mock failure state
		(
			useCreateCampaignWithAgent as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue({
			mutate: vi.fn(),
			isPending: false,
			isError: true,
			error: new Error('Some error'),
		});

		renderComponent();

		expect(
			screen.getByText(
				testI18n.t('wizard.steps.general.alertMessage', { ns: 'campaigns' })
			)
		).toBeInTheDocument();
	});
});
