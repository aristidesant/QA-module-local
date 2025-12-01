import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders as render } from '~/test-utils/renderWithProviders';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CampaignConfigurationSystemTools from './CampaignConfigurationSystemTools';

const mockSetFieldValue = vi.fn();
const mockUseClientConfigByName = vi.fn();
let formValues: any = {
	agentConfig: {
		conversationConfig: { agent: { prompt: { builtInTools: {} } } },
	},
};

vi.mock('~/modules/campaigns/campaignFormFunctions', () => ({
	useCampaignFormContext: () => ({
		values: formValues,
		setFieldValue: mockSetFieldValue,
	}),
}));

vi.mock('~/queries/useClientConfigs', () => ({
	useClientConfigByName: (...args: any[]) => mockUseClientConfigByName(...args),
}));

vi.mock('@mantine/core', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@mantine/core')>();
	return {
		...actual,
		Switch: ({
			checked,
			onChange,
			'aria-label': ariaLabel,
		}: {
			checked?: boolean;
			onChange?: () => void;
			'aria-label'?: string;
		}) => (
			<button
				role='switch'
				aria-checked={checked}
				aria-label={ariaLabel}
				onClick={onChange}
			>
				switch
			</button>
		),
		ActionIcon: ({
			children,
			onClick,
			disabled,
		}: {
			children: React.ReactNode;
			onClick?: () => void;
			disabled?: boolean;
		}) => (
			<button onClick={onClick} disabled={disabled}>
				{children}
			</button>
		),
		Group: ({ children }: { children: React.ReactNode }) => (
			<div>{children}</div>
		),
		Text: ({ children }: { children: React.ReactNode }) => (
			<div>{children}</div>
		),
		Stack: ({ children }: { children: React.ReactNode }) => (
			<div>{children}</div>
		),
		Badge: ({ children }: { children: React.ReactNode }) => (
			<div>{children}</div>
		),
		Tooltip: ({ children }: { children: React.ReactNode }) => (
			<div>{children}</div>
		),
	};
});

vi.mock('./ToolConfigModal', () => ({
	default: ({
		opened,
		onSave,
	}: {
		opened: boolean;
		onSave?: (cfg: any) => void;
	}) =>
		opened ? (
			<div>
				<div>ToolConfigModalOpen</div>
				<button
					onClick={() =>
						onSave && onSave({ name: 'tool_one', type: 'system', added: true })
					}
				>
					Save
				</button>
			</div>
		) : null,
}));

vi.mock('~/components/SectionCard', () => ({
	default: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
}));

describe('CampaignConfigurationSystemTools', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		formValues = {
			agentConfig: {
				conversationConfig: { agent: { prompt: { builtInTools: {} } } },
			},
		};
	});

	it('shows empty state when the config value is invalid JSON', () => {
		mockUseClientConfigByName.mockReturnValue({ data: { value: 'not json' } });

		render(<CampaignConfigurationSystemTools />);

		expect(screen.getByText('No system tools configured.')).toBeVisible();
	});

	it('renders tools list & description fallback and badge default', () => {
		const configValue = JSON.stringify([
			{
				name: 'Tool One',
				nameCode: 'tool_one',
				value: { name: 'tool_one', type: 'system' },
				description: 'desc',
			},
			{
				name: 'Tool Two',
				// missing type/value.description to exercise fallback
				nameCode: 'tool_two',
				value: { name: 'tool_two' },
			},
		]);
		mockUseClientConfigByName.mockReturnValue({ data: { value: configValue } });

		render(<CampaignConfigurationSystemTools />);

		expect(screen.getByText('Tool One')).toBeVisible();
		expect(screen.getByText('desc')).toBeVisible();
		expect(screen.getByText('Tool Two')).toBeVisible();
		expect(screen.getByText('No description available')).toBeVisible();
		// Badge default text 'Custom' when type missing
		expect(screen.getAllByText('Custom').length).toBeGreaterThanOrEqual(1);
	});

	it('disables a selected tool and sets it to null in the form', () => {
		const configValue = JSON.stringify([
			{
				name: 'Tool One',
				nameCode: 'tool_one',
				value: { name: 'tool_one', type: 'system' },
			},
		]);
		mockUseClientConfigByName.mockReturnValue({ data: { value: configValue } });

		// Set the tool as already selected in the form
		formValues = {
			agentConfig: {
				conversationConfig: {
					agent: {
						prompt: { builtInTools: { toolOne: { name: 'tool_one' } } },
					},
				},
			},
		};

		render(<CampaignConfigurationSystemTools />);

		// find the switch for Tool One and click to disable
		fireEvent.click(screen.getByRole('switch', { name: /Tool One/i }));

		expect(mockSetFieldValue).toHaveBeenCalledWith(
			'agentConfig',
			expect.objectContaining({
				conversationConfig: expect.objectContaining({
					agent: expect.objectContaining({
						prompt: expect.objectContaining({
							builtInTools: expect.objectContaining({
								toolOne: null,
							}),
						}),
					}),
				}),
			})
		);
	});

	it('gear ActionIcon is disabled when tool is not selected and enabled after selection', () => {
		const configValue = JSON.stringify([
			{ name: 'Tool One', nameCode: 'tool_one', value: { name: 'tool_one' } },
		]);
		mockUseClientConfigByName.mockReturnValue({ data: { value: configValue } });

		const { rerender } = render(<CampaignConfigurationSystemTools />);

		const switchButton = screen.getByRole('switch', { name: /Tool One/i });
		const gearButton = screen
			.getAllByRole('button')
			.find((b) => b !== switchButton && b.getAttribute('role') !== 'switch');
		expect(gearButton).toBeDefined();
		expect(gearButton?.getAttribute('disabled')).not.toBeNull();

		// Enable the tool by updating form values and rerender
		formValues = {
			agentConfig: {
				conversationConfig: {
					agent: {
						prompt: { builtInTools: { toolOne: { name: 'tool_one' } } },
					},
				},
			},
		};
		rerender(<CampaignConfigurationSystemTools />);

		// Now gear should be enabled (requery after re-render)
		const gearButtonAfter = screen
			.getAllByRole('button')
			.find((b) => b !== switchButton && b.getAttribute('role') !== 'switch');
		expect(gearButtonAfter?.getAttribute('disabled')).toBeNull();
	});

	it('opens modal when clicking gear and saves updated config', () => {
		const configValue = JSON.stringify([
			{
				name: 'Tool One',
				nameCode: 'tool_one',
				value: { name: 'tool_one', type: 'system' },
			},
		]);
		mockUseClientConfigByName.mockReturnValue({ data: { value: configValue } });

		// enable tool by setting form values and rerender
		formValues = {
			agentConfig: {
				conversationConfig: {
					agent: {
						prompt: { builtInTools: { toolOne: { name: 'tool_one' } } },
					},
				},
			},
		};
		render(<CampaignConfigurationSystemTools />);

		const switchButton = screen.getByRole('switch', { name: /Tool One/i });
		const gearButton = screen
			.getAllByRole('button')
			.find((b) => b !== switchButton && b.getAttribute('role') !== 'switch');
		expect(gearButton).toBeDefined();
		fireEvent.click(gearButton!);

		// modal is open
		expect(screen.getByText('ToolConfigModalOpen')).toBeVisible();

		// click Save button in modal which triggers onSave mock
		fireEvent.click(screen.getByRole('button', { name: /Save/i }));

		expect(mockSetFieldValue).toHaveBeenCalledWith(
			'agentConfig',
			expect.objectContaining({
				conversationConfig: expect.objectContaining({
					agent: expect.objectContaining({
						prompt: expect.objectContaining({
							builtInTools: expect.objectContaining({
								toolOne: expect.objectContaining({ added: true }),
							}),
						}),
					}),
				}),
			})
		);
	});

	it('handles missing nameCode/name by generating a name', () => {
		const configValue = JSON.stringify([
			{ value: { name: 'voicemail_detection', type: 'system' } },
		]);
		mockUseClientConfigByName.mockReturnValue({ data: { value: configValue } });

		render(<CampaignConfigurationSystemTools />);

		// Unnamed tool should show 'Unnamed Tool'
		expect(screen.getByText('Unnamed Tool')).toBeVisible();

		// Enabling should use nameCode derived from value.name
		fireEvent.click(screen.getByRole('switch', { name: /Unnamed Tool/i }));

		expect(mockSetFieldValue).toHaveBeenCalled();
		const calledWith =
			mockSetFieldValue.mock.calls[mockSetFieldValue.mock.calls.length - 1][1];
		// builtInTools should contain the camelCase key 'voicemailDetection'
		const builtInTools =
			calledWith.conversationConfig.agent.prompt.builtInTools;
		expect(builtInTools.voicemailDetection).toBeDefined();
	});

	it('shows empty state when there is no system tool configuration', () => {
		mockUseClientConfigByName.mockReturnValue({ data: null });

		render(<CampaignConfigurationSystemTools />);

		expect(screen.getByText('No system tools configured.')).toBeVisible();
	});

	it('enables a tool and stores it in the form', () => {
		const configValue = JSON.stringify([
			{
				name: 'Tool One',
				nameCode: 'tool_one',
				value: { name: 'tool_one', type: 'system' },
				description: 'desc',
			},
		]);
		mockUseClientConfigByName.mockReturnValue({
			data: { value: configValue },
		});

		render(<CampaignConfigurationSystemTools />);

		fireEvent.click(screen.getByRole('switch', { name: /Tool One/i }));

		expect(mockSetFieldValue).toHaveBeenCalledWith(
			'agentConfig',
			expect.objectContaining({
				conversationConfig: expect.objectContaining({
					agent: expect.objectContaining({
						prompt: expect.objectContaining({
							builtInTools: expect.objectContaining({
								toolOne: expect.objectContaining({ name: 'tool_one' }),
							}),
						}),
					}),
				}),
			})
		);
	});
});
