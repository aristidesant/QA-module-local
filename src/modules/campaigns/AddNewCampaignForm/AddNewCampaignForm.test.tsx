import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { AddNewCampaignForm } from './AddNewCampaignForm';
import { notifications } from '@mantine/notifications';

// Mock child components to isolate form logic

type MockAgentVoiceSelectorProps = {
	onSelect: (voice: { voice: { id: string } }) => void;
	selectedVoiceId?: string;
};

vi.mock('./AgentVoiceSelector', () => ({
	default: ({ onSelect, selectedVoiceId }: MockAgentVoiceSelectorProps) => (
		<div>
			<button
				type='button'
				data-testid='select-voice'
				onClick={() => onSelect({ voice: { id: 'voice-1' } })}
			>
				Select voice
			</button>
			<div data-testid='selected-voice-id'>{selectedVoiceId ?? ''}</div>
		</div>
	),
}));

let autoSelectPhone = false;

type MockPhoneNumberSelectorProps = {
	onChange?: (value: number | null) => void;
	value: number | null;
};

vi.mock('./PhoneNumberSelector', () => ({
	default: ({ onChange, value }: MockPhoneNumberSelectorProps) => {
		React.useEffect(() => {
			// Auto-select behavior for tests when asked to
			if (autoSelectPhone && !value) {
				onChange?.(10);
			}
		}, [onChange, value]);
		return (
			<div>
				<button
					type='button'
					data-testid='select-phone'
					onClick={() => onChange?.(10)}
				>
					Select phone
				</button>
				<div data-testid='selected-phone-id'>{value ?? ''}</div>
			</div>
		);
	},
}));

// Mock hooks and queries
const mockUseCreateCampaignWithAgent = vi.fn();
vi.mock('~/queries/campaignsQueries', () => ({
	useCreateCampaignWithAgent: () => mockUseCreateCampaignWithAgent(),
}));

let predefinedParamsMock: any = [
	{
		id: 'cfg-1',
		name: 'Default Behavior',
		description: 'Default config',
		params: {
			conversationConfig: {
				tts: { voice: 'a' },
				agent: { prompt: { text: 'hi' } },
			},
		},
	},
];

export const setPredefinedParams = (arr: any) => {
	predefinedParamsMock = arr;
};

vi.mock(
	'~/modules/campaigns/CampaignsForm/useCampaignsPredefinedParams',
	() => ({
		__esModule: true,
		default: () => predefinedParamsMock,
	})
);

vi.mock('@mantine/notifications', () => ({
	notifications: { show: vi.fn() },
}));

describe('AddNewCampaignForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		autoSelectPhone = false;
		mockUseCreateCampaignWithAgent.mockReturnValue({
			mutate: vi.fn((_dto: any, { onSuccess }: any) => onSuccess?.()),
			isPending: false,
			isError: false,
			error: null,
		});
		setPredefinedParams([
			{
				id: 'cfg-1',
				name: 'Default Behavior',
				description: 'Default config',
				params: {
					conversationConfig: {
						tts: { voice: 'a' },
						agent: { prompt: { text: 'hi' } },
					},
				},
			},
		]);
	});

	it('renders form fields', () => {
		renderWithProviders(<AddNewCampaignForm />);

		expect(
			screen.getByPlaceholderText('Enter campaign name')
		).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText('Describe your campaign')
		).toBeInTheDocument();
		expect(screen.getByText('Campaign Type')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('Enter agent name')).toBeInTheDocument();
	});

	it('calls onCancel when cancel is clicked', () => {
		const onCancel = vi.fn();
		renderWithProviders(<AddNewCampaignForm onCancel={onCancel} />);

		fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
		expect(onCancel).toHaveBeenCalled();
	});

	it('submits form with required values and calls mutation', async () => {
		const onComplete = vi.fn();
		const createMutate = vi.fn((_dto: any, { onSuccess }: any) =>
			onSuccess?.()
		);
		mockUseCreateCampaignWithAgent.mockReturnValue({
			mutate: createMutate,
			isPending: false,
			isError: false,
			error: null,
		});

		renderWithProviders(<AddNewCampaignForm onComplete={onComplete} />);

		fireEvent.change(screen.getByPlaceholderText('Enter campaign name'), {
			target: { value: 'My Campaign' },
		});
		fireEvent.change(screen.getByPlaceholderText('Describe your campaign'), {
			target: { value: 'A sample campaign' },
		});
		fireEvent.change(screen.getByPlaceholderText('Enter agent name'), {
			target: { value: 'Agent X' },
		});

		// Select voice and phone using mocked children
		fireEvent.click(screen.getByTestId('select-voice'));
		fireEvent.click(screen.getByTestId('select-phone'));

		// Submit the form
		const createBtn = screen.getByRole('button', {
			name: 'Create Campaign',
		});
		await waitFor(() => expect(createBtn).not.toBeDisabled());
		fireEvent.click(createBtn);

		await waitFor(() => {
			expect(createMutate).toHaveBeenCalled();
		});

		// Assert DTO structure
		const dto = createMutate.mock.calls[0][0];
		expect(dto.campaign.name).toBe('My Campaign');
		expect(dto.agent.name).toBe('Agent X');
		expect(dto.agent.type).toBe('OUTBOUND');
		expect(dto.agent.voiceId).toBe('voice-1');
		expect(dto.agent.conversationConfig.agent.outboundPhoneNumberId).toBe(10);
		expect(onComplete).toHaveBeenCalled();
	});

	it('shows error when mutation returns error', async () => {
		const createMutate = vi.fn((_dto: any, { onError }: any) =>
			onError?.(new Error('Err'))
		);
		mockUseCreateCampaignWithAgent.mockReturnValue({
			mutate: createMutate,
			isPending: false,
			isError: true,
			error: new Error('Err'),
		});

		renderWithProviders(<AddNewCampaignForm />);

		fireEvent.change(screen.getByPlaceholderText('Enter campaign name'), {
			target: { value: 'My Campaign' },
		});
		fireEvent.change(screen.getByPlaceholderText('Describe your campaign'), {
			target: { value: 'A sample campaign' },
		});
		fireEvent.change(screen.getByPlaceholderText('Enter agent name'), {
			target: { value: 'Agent X' },
		});
		fireEvent.click(screen.getByTestId('select-voice'));
		fireEvent.click(screen.getByTestId('select-phone'));

		const createBtn = screen.getByRole('button', {
			name: 'Create Campaign',
		});
		await waitFor(() => expect(createBtn).not.toBeDisabled());
		fireEvent.click(createBtn);

		await waitFor(() => {
			expect(notifications.show).toHaveBeenCalled();
		});
	});

	it('displays error message text when mutation isError', async () => {
		const createMutate = vi.fn((_dto: any, { onError }: any) =>
			onError?.(new Error('Fail'))
		);
		mockUseCreateCampaignWithAgent.mockReturnValue({
			mutate: createMutate,
			isPending: false,
			isError: true,
			error: new Error('Fail'),
		});

		renderWithProviders(<AddNewCampaignForm />);

		// Fill valid values and select phone
		fireEvent.change(screen.getByPlaceholderText('Enter campaign name'), {
			target: { value: 'My Campaign' },
		});
		fireEvent.change(screen.getByPlaceholderText('Describe your campaign'), {
			target: { value: 'A sample campaign' },
		});
		fireEvent.change(screen.getByPlaceholderText('Enter agent name'), {
			target: { value: 'Agent X' },
		});
		fireEvent.click(screen.getByTestId('select-voice'));
		fireEvent.click(screen.getByTestId('select-phone'));

		const createBtn = screen.getByRole('button', {
			name: 'Create Campaign',
		});
		await waitFor(() => expect(createBtn).not.toBeDisabled());
		fireEvent.click(createBtn);

		await waitFor(() => expect(screen.getByText('Fail')).toBeInTheDocument());
	});

	it('create button is disabled when no phone selected', () => {
		renderWithProviders(<AddNewCampaignForm />);

		const createBtn = screen.getByRole('button', {
			name: 'Create Campaign',
		});
		expect(createBtn).toBeDisabled();
	});

	it('create button is enabled when form is valid and phone selected', async () => {
		autoSelectPhone = true;
		renderWithProviders(<AddNewCampaignForm />);

		fireEvent.change(screen.getByPlaceholderText('Enter campaign name'), {
			target: { value: 'My Campaign' },
		});
		fireEvent.change(screen.getByPlaceholderText('Describe your campaign'), {
			target: { value: 'A sample campaign' },
		});
		fireEvent.change(screen.getByPlaceholderText('Enter agent name'), {
			target: { value: 'Agent X' },
		});
		fireEvent.click(screen.getByTestId('select-voice'));
		fireEvent.click(screen.getByTestId('select-phone'));

		await waitFor(() =>
			expect(screen.getByTestId('selected-phone-id')).toHaveTextContent('10')
		);
		const createBtn = screen.getByRole('button', {
			name: 'Create Campaign',
		});
		await waitFor(() => expect(createBtn).not.toBeDisabled());
	});

	it('submits INBOUND phone as inboundPhoneNumberId', async () => {
		const createMutate = vi.fn((_dto: any, { onSuccess }: any) =>
			onSuccess?.()
		);
		mockUseCreateCampaignWithAgent.mockReturnValue({
			mutate: createMutate,
			isPending: false,
			isError: false,
			error: null,
		});

		renderWithProviders(<AddNewCampaignForm />);

		// fill required inputs
		fireEvent.change(screen.getByPlaceholderText('Enter campaign name'), {
			target: { value: 'My Campaign' },
		});
		fireEvent.change(screen.getByPlaceholderText('Describe your campaign'), {
			target: { value: 'A sample campaign' },
		});
		fireEvent.change(screen.getByPlaceholderText('Enter agent name'), {
			target: { value: 'Agent X' },
		});

		// change campaign type to INBOUND using segmented control input
		// Mantine SegmentedControl renders inputs with type radio, but labels are clickable
		fireEvent.click(screen.getByText('Inbound'));

		// select voice and phone for inbound
		fireEvent.click(screen.getByTestId('select-voice'));
		fireEvent.click(screen.getByTestId('select-phone'));
		await waitFor(() =>
			expect(screen.getByTestId('selected-phone-id')).toHaveTextContent('10')
		);

		// Submit
		const createBtn = screen.getByRole('button', {
			name: 'Create Campaign',
		});
		await waitFor(() => expect(createBtn).not.toBeDisabled());
		fireEvent.click(createBtn);

		await waitFor(() => expect(createMutate).toHaveBeenCalled());
		const dto = createMutate.mock.calls[0][0];
		expect(dto.agent.type).toBe('INBOUND');
		expect(dto.agent.conversationConfig.agent.inboundPhoneNumberId).toBe(10);
	});

	it('merges predefined conversation config into agent config on select', async () => {
		// Set predefined params to have prompt override and new tts voice
		setPredefinedParams([
			{
				id: 'cfg-override',
				name: 'Override Behavior',
				description: 'Override',
				params: {
					conversationConfig: {
						agent: { prompt: { text: 'updated' } },
						tts: { voice: 'new' },
					},
				},
			},
		]);

		const createMutate = vi.fn((_dto: any, { onSuccess }: any) =>
			onSuccess?.()
		);
		mockUseCreateCampaignWithAgent.mockReturnValue({
			mutate: createMutate,
			isPending: false,
			isError: false,
			error: null,
		});

		renderWithProviders(<AddNewCampaignForm />);

		// Fill other required fields
		fireEvent.change(screen.getByPlaceholderText('Enter campaign name'), {
			target: { value: 'My Campaign' },
		});
		fireEvent.change(screen.getByPlaceholderText('Describe your campaign'), {
			target: { value: 'A sample campaign' },
		});
		fireEvent.change(screen.getByPlaceholderText('Enter agent name'), {
			target: { value: 'Agent X' },
		});
		fireEvent.click(screen.getByTestId('select-voice'));
		fireEvent.click(screen.getByTestId('select-phone'));

		// Select agent behavior
		const select = screen.getByPlaceholderText('Choose an agent behavior');
		// Open dropdown
		fireEvent.click(select);
		// Click option
		const option = await screen.findByText('Override Behavior');
		fireEvent.click(option);

		// Submit
		const createBtn = screen.getByRole('button', {
			name: 'Create Campaign',
		});
		await waitFor(() => expect(createBtn).not.toBeDisabled());
		fireEvent.click(createBtn);

		await waitFor(() => expect(createMutate).toHaveBeenCalled());
		const dto = createMutate.mock.calls[0][0];
		expect(dto.campaign.configId).toBe('cfg-override');
		expect(dto.agent.conversationConfig.agent.prompt.text).toBe('updated');
		expect(dto.agent.conversationConfig.tts.voice).toBe('new');
	});

	it('shows fallback error text when mutation error is not an Error instance', async () => {
		const createMutate = vi.fn((_dto: any, { onError }: any) =>
			onError?.('string error')
		);
		mockUseCreateCampaignWithAgent.mockReturnValue({
			mutate: createMutate,
			isPending: false,
			isError: true,
			error: 'string error' as any,
		});

		renderWithProviders(<AddNewCampaignForm />);

		// fill valid form values
		fireEvent.change(screen.getByPlaceholderText('Enter campaign name'), {
			target: { value: 'My Campaign' },
		});
		fireEvent.change(screen.getByPlaceholderText('Describe your campaign'), {
			target: { value: 'A sample campaign' },
		});
		fireEvent.change(screen.getByPlaceholderText('Enter agent name'), {
			target: { value: 'Agent X' },
		});
		fireEvent.click(screen.getByTestId('select-voice'));
		fireEvent.click(screen.getByTestId('select-phone'));

		const createBtn = screen.getByRole('button', {
			name: 'Create Campaign',
		});
		await waitFor(() => expect(createBtn).not.toBeDisabled());
		fireEvent.click(createBtn);

		await waitFor(() =>
			expect(screen.getByText('Error creating campaign')).toBeInTheDocument()
		);
	});

	it('rejects whitespace-only values and displays validation messages', async () => {
		renderWithProviders(<AddNewCampaignForm />);

		fireEvent.change(screen.getByPlaceholderText('Enter campaign name'), {
			target: { value: '   ' },
		});
		fireEvent.change(screen.getByPlaceholderText('Describe your campaign'), {
			target: { value: '   ' },
		});
		fireEvent.change(screen.getByPlaceholderText('Enter agent name'), {
			target: { value: '   ' },
		});

		// ensure phone selected for the form
		fireEvent.click(screen.getByTestId('select-phone'));
		await waitFor(() =>
			expect(screen.getByTestId('selected-phone-id')).toHaveTextContent('10')
		);

		const createBtn = screen.getByRole('button', {
			name: 'Create Campaign',
		});
		expect(createBtn).toBeDisabled();

		// validation messages
		expect(screen.getByText('Campaign name is required')).toBeInTheDocument();
		expect(screen.getByText('Description is required')).toBeInTheDocument();
		expect(screen.getByText('Agent name is required')).toBeInTheDocument();
	});
});
