import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import ToolConfigModal from './ToolConfigModal';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import type { SystemToolModel } from '~/models/AgentListObject';

const createMockToolConfig = (
	overrides: Partial<SystemToolModel> = {}
): SystemToolModel => ({
	type: 'system',
	name: 'tool_one',
	description: '',
	responseTimeoutSecs: 30,
	disableInterruptions: false,
	forcePreToolSpeech: false,
	assignments: [],
	toolCallSound: null,
	toolCallSoundBehavior: 'default',
	params: {},
	...overrides,
});

describe('ToolConfigModal', () => {
	let onSave: Mock<(updatedConfig: SystemToolModel) => void>;
	let onClose: Mock<() => void>;

	beforeEach(() => {
		vi.clearAllMocks();
		onSave = vi.fn<(updatedConfig: SystemToolModel) => void>();
		onClose = vi.fn<() => void>();
	});

	it('renders name, description, checkbox, and action buttons', () => {
		renderWithProviders(
			<ToolConfigModal
				opened={true}
				onClose={onClose}
				toolName={'Tool One'}
				toolConfig={createMockToolConfig()}
				onSave={onSave}
			/>
		);

		expect(screen.getByText('Tool One')).toBeVisible();
		expect(
			screen.getByPlaceholderText(
				'Leave blank to use the default optimized LLM prompt.'
			)
		).toBeVisible();
		expect(screen.getByLabelText('Disable interruptions')).toBeVisible();
		expect(screen.getByRole('button', { name: /Save/i })).toBeVisible();
		expect(screen.getByRole('button', { name: /Cancel/i })).toBeVisible();
	});

	it('calls onClose when Cancel is clicked and does not call onSave', async () => {
		const user = userEvent.setup();
		renderWithProviders(
			<ToolConfigModal
				opened={true}
				onClose={onClose}
				toolName={'Tool One'}
				toolConfig={createMockToolConfig()}
				onSave={onSave}
			/>
		);

		await user.click(screen.getByRole('button', { name: /Cancel/i }));

		expect(onClose).toHaveBeenCalled();
		expect(onSave).not.toHaveBeenCalled();
	});

	it('saves updated description and disableInterruptions for a non-voicemail tool', async () => {
		const user = userEvent.setup();
		const initialConfig = createMockToolConfig({
			description: 'old',
			disableInterruptions: false,
		});

		renderWithProviders(
			<ToolConfigModal
				opened={true}
				onClose={onClose}
				toolName={'Tool One'}
				toolConfig={initialConfig}
				onSave={onSave}
			/>
		);

		const descInput = screen.getByPlaceholderText(
			'Leave blank to use the default optimized LLM prompt.'
		);
		await user.clear(descInput);
		await user.type(descInput, 'new description');

		const checkbox = screen.getByLabelText('Disable interruptions');
		await user.click(checkbox);

		await user.click(screen.getByRole('button', { name: /Save/i }));

		expect(onSave).toHaveBeenCalledWith(
			expect.objectContaining({
				description: 'new description',
				disableInterruptions: true,
			})
		);
		expect(onClose).toHaveBeenCalled();
	});

	it('renders voicemail configuration only for voicemail_detection and saves voicemail message in params', async () => {
		const user = userEvent.setup();
		const initialConfig = createMockToolConfig({
			name: 'voicemail_detection',
			description: 'vm desc',
			params: { voicemailMessage: 'initial message' },
		});

		renderWithProviders(
			<ToolConfigModal
				opened={true}
				onClose={onClose}
				toolName={'Voicemail Tool'}
				toolConfig={initialConfig}
				onSave={onSave}
			/>
		);

		// voicemail textarea should be visible
		const vmInput = screen.getByPlaceholderText(
			/Hello, this is an automated call from/i
		);
		expect(vmInput).toBeVisible();

		// update voicemail message
		await user.clear(vmInput);
		await user.type(vmInput, 'new voicemail message');

		await user.click(screen.getByRole('button', { name: /Save/i }));

		expect(onSave).toHaveBeenCalledWith(
			expect.objectContaining({
				params: expect.objectContaining({
					voicemailMessage: 'new voicemail message',
				}),
			})
		);
		expect(onClose).toHaveBeenCalled();
	});
});

export {};
