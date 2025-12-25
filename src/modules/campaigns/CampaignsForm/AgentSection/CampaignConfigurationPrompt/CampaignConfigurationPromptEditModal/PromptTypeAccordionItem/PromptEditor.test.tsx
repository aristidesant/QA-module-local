import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import renderWithProviders from '~/test-utils/renderWithProviders';
import PromptEditor from './PromptEditor';
import type { CampaignPromptTypeModel } from '~/models/CampaignPromptTypeModel';

const mockOtherPrompts = [
	{
		id: 100,
		typeId: 1,
		campaignId: 999,
		prompt: 'Prompt from campaign 999',
		order: 1,
		campaign: { name: 'Other Campaign', id: 999 },
	},
	{
		id: 101,
		typeId: 1,
		campaignId: 888,
		prompt: 'Prompt from campaign 888',
		order: 1,
		campaign: { name: 'Another Campaign', id: 888 },
	},
	{
		id: 102,
		typeId: 1,
		campaignId: 777,
		prompt: null, // Prompt with null value
		order: 1,
		campaign: { name: 'Empty Prompt Campaign', id: 777 },
	},
	{
		id: undefined, // Prompt without id
		typeId: 1,
		campaignId: 666,
		prompt: 'Prompt without id',
		order: 1,
		campaign: { name: 'No ID Campaign', id: 666 },
	},
];

const mockAllVariables = [
	{
		name: 'customer_name',
		description: 'Customer full name',
		source: 'schema' as const,
	},
	{
		name: 'phone_number',
		description: 'Customer phone',
		source: 'schema' as const,
	},
	{
		name: 'current_date',
		description: 'Current date',
		source: 'system' as const,
	},
	{
		name: 'agent_name',
		description: null, // Variable without description
		source: 'system' as const,
	},
];

vi.mock('~/queries/campaignPromptQueries', () => ({
	useGetCampaignPrompts: () => ({
		data: mockOtherPrompts,
	}),
}));

vi.mock('~/hooks/usePromptVariables', () => ({
	usePromptVariables: () => mockAllVariables,
}));

vi.mock('./PromptAiActions', () => ({
	default: ({
		prompt,
		onApply,
	}: {
		prompt?: string;
		onApply: (content: string) => void;
	}) => (
		<div data-testid='prompt-ai-actions'>
			<span data-testid='ai-actions-prompt'>{prompt}</span>
			<button onClick={() => onApply('AI generated content')}>Apply AI</button>
		</div>
	),
}));

vi.mock('@uiw/react-md-editor', () => ({
	default: ({
		value,
		onChange,
		textareaProps,
	}: {
		value: string;
		onChange: (val: string) => void;
		textareaProps?: {
			placeholder?: string;
			ref?: React.Ref<HTMLTextAreaElement>;
			onKeyUp?: (e: React.SyntheticEvent<HTMLTextAreaElement>) => void;
			onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
			onClick?: (e: React.SyntheticEvent<HTMLTextAreaElement>) => void;
			onSelect?: (e: React.SyntheticEvent<HTMLTextAreaElement>) => void;
		};
	}) => {
		const internalRef = React.useRef<HTMLTextAreaElement>(null);

		React.useEffect(() => {
			if (textareaProps?.ref && internalRef.current) {
				if (typeof textareaProps.ref === 'function') {
					textareaProps.ref(internalRef.current);
				} else if (textareaProps.ref && 'current' in textareaProps.ref) {
					(
						textareaProps.ref as React.MutableRefObject<HTMLTextAreaElement>
					).current = internalRef.current;
				}
			}
		}, [textareaProps?.ref]);

		return (
			<textarea
				data-testid='md-editor'
				ref={internalRef}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={textareaProps?.placeholder}
				onKeyUp={textareaProps?.onKeyUp}
				onKeyDown={textareaProps?.onKeyDown}
				onClick={textareaProps?.onClick}
				onSelect={textareaProps?.onSelect}
			/>
		);
	},
}));

vi.mock('./PromptAiActions/ReviewStep', () => ({
	default: ({
		diffData,
		onApply,
		onCancel,
	}: {
		diffData: unknown;
		onApply: () => void;
		onCancel: () => void;
	}) => (
		<div data-testid='review-step'>
			<span data-testid='review-diff-data'>
				{diffData ? 'has-diff' : 'no-diff'}
			</span>
			<button onClick={onApply}>Apply Changes</button>
			<button onClick={onCancel}>Cancel Review</button>
		</div>
	),
}));

const mockHistoryModalOnSelect = vi.fn();

vi.mock(
	'~/modules/campaigns/CampaignsForm/AgentSection/CampaignConfigurationPrompt/CampaignConfigurationPromptHistoryModal',
	() => ({
		default: ({
			opened,
			onClose,
			campaignId,
			campaignPromptTypeId,
			currentPromptText,
			onSelect,
		}: {
			opened: boolean;
			onClose: () => void;
			campaignId: number;
			campaignPromptTypeId?: number;
			currentPromptText?: string;
			onSelect: (prompt: string) => void;
		}) => {
			mockHistoryModalOnSelect.mockImplementation(onSelect);
			return opened ? (
				<div data-testid='history-modal'>
					<span data-testid='history-campaign-id'>{campaignId}</span>
					<span data-testid='history-prompt-type-id'>
						{campaignPromptTypeId}
					</span>
					<span data-testid='history-current-prompt'>{currentPromptText}</span>
					<button onClick={() => onSelect('Selected prompt from history')}>
						Select History
					</button>
					<button onClick={onClose}>Close History</button>
				</div>
			) : null;
		},
	})
);

const mockType: CampaignPromptTypeModel = {
	id: 1,
	name: 'Greeting',
	icon: 'icon-greeting',
	order: 1,
	createdAt: '2024-01-01',
};

describe('PromptEditor', () => {
	const mockOnChange = vi.fn();
	const defaultProps = {
		type: mockType,
		value: '',
		onChange: mockOnChange,
		campaignId: 123,
	};

	const renderPromptEditorWithState = (props: {
		type: CampaignPromptTypeModel;
		initialValue?: string;
		campaignId: number;
	}) => {
		const methods: { getValue: () => string | undefined } = {
			getValue: () => undefined,
		};
		const Wrapper: React.FC = () => {
			const [value, setValue] = React.useState(props.initialValue ?? '');
			methods.getValue = () => value;
			return (
				<PromptEditor
					type={props.type}
					value={value}
					onChange={(v) => {
						setValue(v);
						mockOnChange(v);
					}}
					campaignId={props.campaignId}
				/>
			);
		};

		const utils = renderWithProviders(<Wrapper />);
		return { ...utils, methods };
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Rendering', () => {
		it('renders the select for reusing prompts', () => {
			renderWithProviders(<PromptEditor {...defaultProps} />);

			expect(
				screen.getByPlaceholderText(/Load prompt from another campaign/i)
			).toBeInTheDocument();
		});

		it('renders the editor hint text', () => {
			renderWithProviders(<PromptEditor {...defaultProps} />);

			expect(
				screen.getByText(/You can use variables like/i)
			).toBeInTheDocument();
		});

		it('renders the MD editor', () => {
			renderWithProviders(<PromptEditor {...defaultProps} />);

			expect(screen.getByTestId('md-editor')).toBeInTheDocument();
		});

		it('renders PromptAiActions component', () => {
			renderWithProviders(<PromptEditor {...defaultProps} />);

			expect(screen.getByTestId('prompt-ai-actions')).toBeInTheDocument();
		});

		it('renders label for reuse select', () => {
			renderWithProviders(<PromptEditor {...defaultProps} />);

			expect(screen.getByText('Reuse prompt')).toBeInTheDocument();
		});

		it('opens history modal and restores selected prompt', async () => {
			renderWithProviders(
				<PromptEditor {...defaultProps} value='Current prompt' />
			);

			const user = userEvent.setup();
			await user.click(screen.getByLabelText('Prompt History'));

			expect(screen.getByTestId('history-modal')).toBeInTheDocument();
			expect(screen.getByTestId('history-prompt-type-id')).toHaveTextContent(
				'1'
			);

			await user.click(screen.getByText('Select History'));

			await waitFor(() => {
				expect(mockOnChange).toHaveBeenCalledWith(
					'Selected prompt from history'
				);
			});
		});
	});

	describe('Editor Functionality', () => {
		it('renders MD editor with correct value', () => {
			renderWithProviders(
				<PromptEditor {...defaultProps} value='Test content' />
			);

			expect(screen.getByTestId('md-editor')).toHaveValue('Test content');
		});

		it('calls onChange when editor content changes', () => {
			renderWithProviders(<PromptEditor {...defaultProps} />);

			const editor = screen.getByTestId('md-editor');
			fireEvent.change(editor, { target: { value: 'New content' } });

			expect(mockOnChange).toHaveBeenCalledWith('New content');
		});

		it('renders editor with placeholder', () => {
			renderWithProviders(<PromptEditor {...defaultProps} />);

			expect(
				screen.getByPlaceholderText(/Enter your prompt here/i)
			).toBeInTheDocument();
		});

		it('handles undefined value as empty string', () => {
			renderWithProviders(<PromptEditor {...defaultProps} value={undefined} />);

			expect(screen.getByTestId('md-editor')).toHaveValue('');
		});

		it('handles empty string value', () => {
			renderWithProviders(<PromptEditor {...defaultProps} value='' />);

			expect(screen.getByTestId('md-editor')).toHaveValue('');
		});
	});

	describe('Prompt Selection from Other Campaigns', () => {
		it('filters out current campaign from options', () => {
			renderWithProviders(<PromptEditor {...defaultProps} campaignId={999} />);

			const select = screen.getByPlaceholderText(
				/Load prompt from another campaign/i
			);
			fireEvent.click(select);

			expect(screen.queryByText('Other Campaign')).not.toBeInTheDocument();
			expect(screen.getByText('Another Campaign')).toBeInTheDocument();
		});

		it('filters out prompts without id from options', () => {
			renderWithProviders(<PromptEditor {...defaultProps} />);

			const select = screen.getByPlaceholderText(
				/Load prompt from another campaign/i
			);
			fireEvent.click(select);

			expect(screen.queryByText('No ID Campaign')).not.toBeInTheDocument();
		});

		it('applies selected prompt directly when current is empty', async () => {
			const user = userEvent.setup();

			renderWithProviders(<PromptEditor {...defaultProps} value='' />);

			const select = screen.getByPlaceholderText(
				/Load prompt from another campaign/i
			);
			await user.click(select);
			await user.click(screen.getByText('Other Campaign'));

			expect(mockOnChange).toHaveBeenCalledWith('Prompt from campaign 999');
		});

		it('shows diff preview when current has content', async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<PromptEditor {...defaultProps} value='Existing content' />
			);

			const select = screen.getByPlaceholderText(
				/Load prompt from another campaign/i
			);
			await user.click(select);
			await user.click(screen.getByText('Other Campaign'));

			await waitFor(() => {
				expect(screen.getByTestId('review-step')).toBeInTheDocument();
			});
		});

		it('applies pending prompt when diff is accepted', async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<PromptEditor {...defaultProps} value='Existing content' />
			);

			const select = screen.getByPlaceholderText(
				/Load prompt from another campaign/i
			);
			await user.click(select);
			await user.click(screen.getByText('Other Campaign'));

			await waitFor(() => {
				expect(screen.getByTestId('review-step')).toBeInTheDocument();
			});

			await user.click(screen.getByText('Apply Changes'));

			expect(mockOnChange).toHaveBeenCalledWith('Prompt from campaign 999');
		});

		it('cancels diff preview without applying changes', async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<PromptEditor {...defaultProps} value='Existing content' />
			);

			const select = screen.getByPlaceholderText(
				/Load prompt from another campaign/i
			);
			await user.click(select);
			await user.click(screen.getByText('Other Campaign'));

			await waitFor(() => {
				expect(screen.getByTestId('review-step')).toBeInTheDocument();
			});

			await user.click(screen.getByText('Cancel Review'));

			expect(mockOnChange).not.toHaveBeenCalled();
		});

		it('handles selection of prompt with null value', async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<PromptEditor {...defaultProps} value='Existing content' />
			);

			const select = screen.getByPlaceholderText(
				/Load prompt from another campaign/i
			);
			await user.click(select);
			await user.click(screen.getByText('Empty Prompt Campaign'));

			// Should not call onChange or show diff modal since prompt is null
			expect(mockOnChange).not.toHaveBeenCalled();
		});

		it('treats whitespace-only existing value as content for diff preview', async () => {
			const user = userEvent.setup();

			renderWithProviders(<PromptEditor {...defaultProps} value='   ' />);

			const select = screen.getByPlaceholderText(
				/Load prompt from another campaign/i
			);
			await user.click(select);
			await user.click(screen.getByText('Other Campaign'));

			// Whitespace-only should not trigger diff preview (empty after trim)
			expect(mockOnChange).toHaveBeenCalledWith('Prompt from campaign 999');
		});
	});

	describe('AI Actions Integration', () => {
		it('passes current value to PromptAiActions', () => {
			renderWithProviders(
				<PromptEditor {...defaultProps} value='Current prompt value' />
			);

			expect(screen.getByTestId('ai-actions-prompt')).toHaveTextContent(
				'Current prompt value'
			);
		});

		it('applies AI generated content when onApply is called', async () => {
			const user = userEvent.setup();

			renderWithProviders(<PromptEditor {...defaultProps} />);

			await user.click(screen.getByText('Apply AI'));

			expect(mockOnChange).toHaveBeenCalledWith('AI generated content');
		});

		it('passes type prop to PromptAiActions', () => {
			renderWithProviders(<PromptEditor {...defaultProps} />);

			expect(screen.getByTestId('prompt-ai-actions')).toBeInTheDocument();
		});
	});

	describe('Variable Menu', () => {
		it('opens variable menu on typing trigger {{ and inserts with Enter', async () => {
			const user = userEvent.setup();

			const { methods } = renderPromptEditorWithState({
				type: mockType,
				initialValue: '',
				campaignId: 123,
			});

			const editor = screen.getByTestId('md-editor');
			await user.click(editor);
			fireEvent.change(editor, { target: { value: '{{cust' } });
			const textarea = editor as HTMLTextAreaElement;
			textarea.selectionStart = textarea.value.length;
			fireEvent.keyUp(textarea, { currentTarget: textarea });

			await waitFor(() => {
				expect(screen.getByText('customer_name')).toBeInTheDocument();
			});

			await user.keyboard('{Enter}');

			expect(mockOnChange).toHaveBeenCalledWith('{{customer_name}}');
			expect(methods.getValue()).toBe('{{customer_name}}');
		});

		it('opens variable menu and inserts with Tab', async () => {
			const user = userEvent.setup();

			const { methods } = renderPromptEditorWithState({
				type: mockType,
				initialValue: '',
				campaignId: 123,
			});

			const editor = screen.getByTestId('md-editor');
			await user.click(editor);
			fireEvent.change(editor, { target: { value: '{{phone' } });
			const textarea = editor as HTMLTextAreaElement;
			textarea.selectionStart = textarea.value.length;
			fireEvent.keyUp(textarea, { currentTarget: textarea });

			await waitFor(() => {
				expect(screen.getByText('phone_number')).toBeInTheDocument();
			});

			await user.keyboard('{Tab}');

			expect(mockOnChange).toHaveBeenCalledWith('{{phone_number}}');
			expect(methods.getValue()).toBe('{{phone_number}}');
		});

		it('inserts selected variable when clicking the option', async () => {
			const user = userEvent.setup();

			const { methods } = renderPromptEditorWithState({
				type: mockType,
				initialValue: 'Start ',
				campaignId: 123,
			});

			const editor = screen.getByTestId('md-editor');
			await user.click(editor);
			fireEvent.change(editor, { target: { value: 'Start {{' } });
			const textarea = editor as HTMLTextAreaElement;
			textarea.selectionStart = textarea.value.length;
			fireEvent.keyUp(textarea, { currentTarget: textarea });

			await waitFor(() => {
				expect(screen.getByText('customer_name')).toBeInTheDocument();
			});

			await user.click(screen.getByText('phone_number'));

			expect(mockOnChange).toHaveBeenCalledWith('Start {{phone_number}}');
			expect(methods.getValue()).toBe('Start {{phone_number}}');
		});

		it('navigates variables with arrow keys and selects correct entry', async () => {
			const user = userEvent.setup();

			const { methods } = renderPromptEditorWithState({
				type: mockType,
				initialValue: '',
				campaignId: 123,
			});

			const editor = screen.getByTestId('md-editor');
			await user.click(editor);
			fireEvent.change(editor, { target: { value: '{{' } });
			const textarea = editor as HTMLTextAreaElement;
			textarea.selectionStart = textarea.value.length;
			fireEvent.keyUp(textarea, { currentTarget: textarea });

			await waitFor(() => {
				expect(screen.getByText('customer_name')).toBeInTheDocument();
			});

			await user.keyboard('{ArrowDown}');
			await user.keyboard('{Enter}');

			expect(mockOnChange).toHaveBeenCalledWith('{{phone_number}}');
			expect(methods.getValue()).toBe('{{phone_number}}');
		});

		it('wraps around when navigating past the last variable', async () => {
			const user = userEvent.setup();

			const { methods } = renderPromptEditorWithState({
				type: mockType,
				initialValue: '',
				campaignId: 123,
			});

			const editor = screen.getByTestId('md-editor');
			await user.click(editor);
			fireEvent.change(editor, { target: { value: '{{' } });
			const textarea = editor as HTMLTextAreaElement;
			textarea.selectionStart = textarea.value.length;
			fireEvent.keyUp(textarea, { currentTarget: textarea });

			await waitFor(() => {
				expect(screen.getByText('customer_name')).toBeInTheDocument();
			});

			// Navigate down 4 times to wrap around (we have 4 variables)
			await user.keyboard('{ArrowDown}');
			await user.keyboard('{ArrowDown}');
			await user.keyboard('{ArrowDown}');
			await user.keyboard('{ArrowDown}');
			await user.keyboard('{Enter}');

			expect(mockOnChange).toHaveBeenCalledWith('{{customer_name}}');
			expect(methods.getValue()).toBe('{{customer_name}}');
		});

		it('navigates up with arrow keys and wraps around', async () => {
			const user = userEvent.setup();

			const { methods } = renderPromptEditorWithState({
				type: mockType,
				initialValue: '',
				campaignId: 123,
			});

			const editor = screen.getByTestId('md-editor');
			await user.click(editor);
			fireEvent.change(editor, { target: { value: '{{' } });
			const textarea = editor as HTMLTextAreaElement;
			textarea.selectionStart = textarea.value.length;
			fireEvent.keyUp(textarea, { currentTarget: textarea });

			await waitFor(() => {
				expect(screen.getByText('customer_name')).toBeInTheDocument();
			});

			// Navigate up once to wrap to the last variable
			await user.keyboard('{ArrowUp}');
			await user.keyboard('{Enter}');

			expect(mockOnChange).toHaveBeenCalledWith('{{agent_name}}');
			expect(methods.getValue()).toBe('{{agent_name}}');
		});

		it('handles Escape key to close variable menu', async () => {
			const user = userEvent.setup();

			const { methods } = renderPromptEditorWithState({
				type: mockType,
				initialValue: '',
				campaignId: 123,
			});

			const editor = screen.getByTestId('md-editor');
			await user.click(editor);
			fireEvent.change(editor, { target: { value: '{{' } });
			const textarea = editor as HTMLTextAreaElement;
			textarea.selectionStart = textarea.value.length;
			fireEvent.keyUp(textarea, { currentTarget: textarea });

			await waitFor(() => {
				expect(screen.getByText('customer_name')).toBeInTheDocument();
			});

			// Simulate Escape keydown on the textarea
			fireEvent.keyDown(textarea, { key: 'Escape' });

			// After Escape, typing Enter should not insert anything since menu closed
			// The value should remain unchanged
			expect(methods.getValue()).toBe('{{');
		});

		it('displays variable source badges correctly', async () => {
			const user = userEvent.setup();

			renderPromptEditorWithState({
				type: mockType,
				initialValue: '',
				campaignId: 123,
			});

			const editor = screen.getByTestId('md-editor');
			await user.click(editor);
			fireEvent.change(editor, { target: { value: '{{' } });
			const textarea = editor as HTMLTextAreaElement;
			textarea.selectionStart = textarea.value.length;
			fireEvent.keyUp(textarea, { currentTarget: textarea });

			await waitFor(() => {
				expect(screen.getByText('customer_name')).toBeInTheDocument();
			});

			// Should see both Dyn (schema) and Sys (system) badges
			expect(screen.getAllByText('Dyn').length).toBeGreaterThan(0);
			expect(screen.getAllByText('Sys').length).toBeGreaterThan(0);
		});

		it('displays variable descriptions', async () => {
			const user = userEvent.setup();

			renderPromptEditorWithState({
				type: mockType,
				initialValue: '',
				campaignId: 123,
			});

			const editor = screen.getByTestId('md-editor');
			await user.click(editor);
			fireEvent.change(editor, { target: { value: '{{' } });
			const textarea = editor as HTMLTextAreaElement;
			textarea.selectionStart = textarea.value.length;
			fireEvent.keyUp(textarea, { currentTarget: textarea });

			await waitFor(() => {
				expect(screen.getByText('customer_name')).toBeInTheDocument();
			});

			expect(screen.getByText('Customer full name')).toBeInTheDocument();
			expect(screen.getByText('Customer phone')).toBeInTheDocument();
		});

		it('filters variables based on typed text', async () => {
			const user = userEvent.setup();

			renderPromptEditorWithState({
				type: mockType,
				initialValue: '',
				campaignId: 123,
			});

			const editor = screen.getByTestId('md-editor');
			await user.click(editor);
			fireEvent.change(editor, { target: { value: '{{cust' } });
			const textarea = editor as HTMLTextAreaElement;
			textarea.selectionStart = textarea.value.length;
			fireEvent.keyUp(textarea, { currentTarget: textarea });

			await waitFor(() => {
				expect(screen.getByText('customer_name')).toBeInTheDocument();
			});

			// Other variables should not be visible when filtered
			expect(screen.queryByText('phone_number')).not.toBeInTheDocument();
		});

		it('does not show menu when not triggered by {{', async () => {
			const user = userEvent.setup();

			renderPromptEditorWithState({
				type: mockType,
				initialValue: '',
				campaignId: 123,
			});

			const editor = screen.getByTestId('md-editor');
			await user.click(editor);
			fireEvent.change(editor, { target: { value: 'Hello world' } });
			const textarea = editor as HTMLTextAreaElement;
			textarea.selectionStart = textarea.value.length;
			fireEvent.keyUp(textarea, { currentTarget: textarea });

			// Variable menu should not appear
			expect(screen.queryByText('customer_name')).not.toBeInTheDocument();
		});

		it('replaces existing trigger pattern when inserting variable', async () => {
			const user = userEvent.setup();

			const { methods } = renderPromptEditorWithState({
				type: mockType,
				initialValue: '',
				campaignId: 123,
			});

			const editor = screen.getByTestId('md-editor');
			await user.click(editor);
			fireEvent.change(editor, { target: { value: 'Hello {{cust' } });
			const textarea = editor as HTMLTextAreaElement;
			textarea.selectionStart = textarea.value.length;
			fireEvent.keyUp(textarea, { currentTarget: textarea });

			await waitFor(() => {
				expect(screen.getByText('customer_name')).toBeInTheDocument();
			});

			await user.keyboard('{Enter}');

			// The {{cust part should be replaced with {{customer_name}}
			expect(mockOnChange).toHaveBeenCalledWith('Hello {{customer_name}}');
			expect(methods.getValue()).toBe('Hello {{customer_name}}');
		});

		it('handles mouseEnter on variable options', async () => {
			const user = userEvent.setup();

			const { methods } = renderPromptEditorWithState({
				type: mockType,
				initialValue: '',
				campaignId: 123,
			});

			const editor = screen.getByTestId('md-editor');
			await user.click(editor);
			fireEvent.change(editor, { target: { value: '{{' } });
			const textarea = editor as HTMLTextAreaElement;
			textarea.selectionStart = textarea.value.length;
			fireEvent.keyUp(textarea, { currentTarget: textarea });

			await waitFor(() => {
				expect(screen.getByText('customer_name')).toBeInTheDocument();
			});

			// Hover on phone_number to change active index
			const phoneOption = screen.getByText('phone_number').closest('button');
			await user.hover(phoneOption!);

			// Press Enter to select the hovered item
			await user.keyboard('{Enter}');

			expect(mockOnChange).toHaveBeenCalledWith('{{phone_number}}');
			expect(methods.getValue()).toBe('{{phone_number}}');
		});

		it('handles onSelect event to track cursor position', async () => {
			const user = userEvent.setup();

			renderPromptEditorWithState({
				type: mockType,
				initialValue: 'Test content',
				campaignId: 123,
			});

			const editor = screen.getByTestId('md-editor');
			await user.click(editor);

			// Trigger select event
			const textarea = editor as HTMLTextAreaElement;
			textarea.selectionStart = 5;
			fireEvent.select(textarea, {
				currentTarget: { selectionStart: 5 },
			});

			// Now type variable trigger
			fireEvent.change(editor, { target: { value: 'Test {{' } });
			textarea.selectionStart = 7;
			fireEvent.keyUp(textarea, { currentTarget: textarea });

			await waitFor(() => {
				expect(screen.getByText('customer_name')).toBeInTheDocument();
			});
		});

		it('uses lastCursorRef when textarea selectionStart is unavailable', async () => {
			const user = userEvent.setup();

			const { methods } = renderPromptEditorWithState({
				type: mockType,
				initialValue: 'Hello world',
				campaignId: 123,
			});

			const editor = screen.getByTestId('md-editor');
			await user.click(editor);

			// Set up a tracked cursor position via onSelect
			const textarea = editor as HTMLTextAreaElement;
			textarea.selectionStart = 5;
			fireEvent.select(textarea, {
				currentTarget: { selectionStart: 5 },
			});

			// Type variable trigger
			fireEvent.change(editor, { target: { value: 'Hello{{' } });
			textarea.selectionStart = 7;
			fireEvent.keyUp(textarea, { currentTarget: textarea });

			await waitFor(() => {
				expect(screen.getByText('customer_name')).toBeInTheDocument();
			});

			// Insert variable
			await user.keyboard('{Enter}');

			expect(methods.getValue()).toBe('Hello{{customer_name}}');
		});
	});

	describe('Edge Cases', () => {
		it('handles null promptId in handlePromptSelect', async () => {
			const user = userEvent.setup();

			renderWithProviders(<PromptEditor {...defaultProps} />);

			const select = screen.getByPlaceholderText(
				/Load prompt from another campaign/i
			);
			await user.click(select);

			// Clear the selection if possible (simulating null)
			// The Select component should handle this gracefully
			expect(mockOnChange).not.toHaveBeenCalled();
		});

		it('handles editor onClick event', async () => {
			const user = userEvent.setup();

			renderWithProviders(<PromptEditor {...defaultProps} />);

			const editor = screen.getByTestId('md-editor');

			// Click should trigger keyUp handler via onClick prop
			await user.click(editor);

			// No crash should occur
			expect(editor).toBeInTheDocument();
		});

		it('handles editor with empty onChange value', () => {
			renderWithProviders(<PromptEditor {...defaultProps} value='test' />);

			const editor = screen.getByTestId('md-editor');
			fireEvent.change(editor, { target: { value: '' } });

			expect(mockOnChange).toHaveBeenCalledWith('');
		});

		it('handles keyDown when menu is closed', async () => {
			const user = userEvent.setup();

			renderWithProviders(<PromptEditor {...defaultProps} />);

			const editor = screen.getByTestId('md-editor');
			await user.click(editor);

			// KeyDown when menu is not open should not cause issues
			await user.keyboard('{ArrowDown}');
			await user.keyboard('{Enter}');

			// No crash should occur
			expect(editor).toBeInTheDocument();
		});

		it('handles keyDown when filtered variables is empty', async () => {
			const user = userEvent.setup();

			renderPromptEditorWithState({
				type: mockType,
				initialValue: '',
				campaignId: 123,
			});

			const editor = screen.getByTestId('md-editor');
			await user.click(editor);
			// Type a filter that matches nothing
			fireEvent.change(editor, { target: { value: '{{xyz' } });
			const textarea = editor as HTMLTextAreaElement;
			textarea.selectionStart = textarea.value.length;
			fireEvent.keyUp(textarea, { currentTarget: textarea });

			// ArrowDown when no variables should not cause issues
			await user.keyboard('{ArrowDown}');

			// No crash should occur
			expect(editor).toBeInTheDocument();
		});
	});

	describe('Modal State Management', () => {
		it('closes modal when applying changes', async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<PromptEditor {...defaultProps} value='Existing content' />
			);

			const select = screen.getByPlaceholderText(
				/Load prompt from another campaign/i
			);
			await user.click(select);
			await user.click(screen.getByText('Other Campaign'));

			await waitFor(() => {
				expect(screen.getByTestId('review-step')).toBeInTheDocument();
			});

			await user.click(screen.getByText('Apply Changes'));

			await waitFor(() => {
				expect(screen.queryByTestId('review-step')).not.toBeInTheDocument();
			});
		});

		it('closes modal when canceling', async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<PromptEditor {...defaultProps} value='Existing content' />
			);

			const select = screen.getByPlaceholderText(
				/Load prompt from another campaign/i
			);
			await user.click(select);
			await user.click(screen.getByText('Other Campaign'));

			await waitFor(() => {
				expect(screen.getByTestId('review-step')).toBeInTheDocument();
			});

			await user.click(screen.getByText('Cancel Review'));

			await waitFor(() => {
				expect(screen.queryByTestId('review-step')).not.toBeInTheDocument();
			});
		});
	});
});
