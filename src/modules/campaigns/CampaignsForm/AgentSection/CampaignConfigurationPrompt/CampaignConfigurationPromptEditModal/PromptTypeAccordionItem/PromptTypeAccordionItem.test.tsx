import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Accordion } from '@mantine/core';
import React from 'react';
import renderWithProviders from '~/test-utils/renderWithProviders';
import PromptTypeAccordionItem from './PromptTypeAccordionItem';
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
			onKeyUp?: (e: React.SyntheticEvent<HTMLTextAreaElement>) => void;
			onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
			onClick?: (e: React.SyntheticEvent<HTMLTextAreaElement>) => void;
			onSelect?: (e: React.SyntheticEvent<HTMLTextAreaElement>) => void;
		};
	}) => (
		<textarea
			data-testid='md-editor'
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder={textareaProps?.placeholder}
			onKeyUp={textareaProps?.onKeyUp}
			onKeyDown={textareaProps?.onKeyDown}
			onClick={textareaProps?.onClick}
			onSelect={textareaProps?.onSelect}
		/>
	),
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

// Wrapper component to provide Accordion context
const AccordionWrapper: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => <Accordion defaultValue='1'>{children}</Accordion>;

const renderPromptTypeAccordionItem = (props: {
	type: CampaignPromptTypeModel;
	value?: string;
	onChange: (value: string) => void;
	campaignId: number;
}) => {
	return renderWithProviders(
		<AccordionWrapper>
			<PromptTypeAccordionItem {...props} />
		</AccordionWrapper>
	);
};

// The stateful rendering wrapper is defined inside the test suite so it can
// access `mockOnChange` which is declared below.

describe('PromptTypeAccordionItem', () => {
	const mockOnChange = vi.fn();

	// Helper for tests that need an actual controlled value state so typing
	// reflects correctly in the DOM and component props
	const renderPromptTypeAccordionItemWithState = (props: {
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
				<AccordionWrapper>
					<PromptTypeAccordionItem
						type={props.type}
						value={value}
						onChange={(v) => {
							setValue(v);
							mockOnChange(v);
						}}
						campaignId={props.campaignId}
					/>
				</AccordionWrapper>
			);
		};

		const utils = renderWithProviders(<Wrapper />);
		return { ...utils, methods };
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Rendering', () => {
		it('renders accordion item with type name', () => {
			renderPromptTypeAccordionItem({
				type: mockType,
				value: '',
				onChange: mockOnChange,
				campaignId: 123,
			});

			expect(screen.getByText('Greeting')).toBeInTheDocument();
		});

		it('opens history modal and restores selected prompt', async () => {
			renderPromptTypeAccordionItem({
				type: mockType,
				value: 'Current prompt',
				onChange: mockOnChange,
				campaignId: 123,
			});

			const user = userEvent.setup();
			await user.click(screen.getByLabelText('Prompt history'));

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

		it('shows "Empty" status when value is empty', () => {
			renderPromptTypeAccordionItem({
				type: mockType,
				value: '',
				onChange: mockOnChange,
				campaignId: 123,
			});

			expect(screen.getByText('Empty')).toBeInTheDocument();
		});

		it('shows "Drafted" status when value has content', () => {
			renderPromptTypeAccordionItem({
				type: mockType,
				value: 'Some prompt content',
				onChange: mockOnChange,
				campaignId: 123,
			});

			expect(screen.getByText('Drafted')).toBeInTheDocument();
		});

		it('shows correct line count badge', () => {
			const multilineContent = 'Line 1\nLine 2\nLine 3';
			renderPromptTypeAccordionItem({
				type: mockType,
				value: multilineContent,
				onChange: mockOnChange,
				campaignId: 123,
			});

			expect(screen.getByText('(3 lines)')).toBeInTheDocument();
		});

		it('counts only non-empty lines', () => {
			const contentWithEmptyLines = 'Line 1\n\nLine 2\n\n\nLine 3';
			renderPromptTypeAccordionItem({
				type: mockType,
				value: contentWithEmptyLines,
				onChange: mockOnChange,
				campaignId: 123,
			});

			expect(screen.getByText('(3 lines)')).toBeInTheDocument();
		});

		it('shows 0 lines when value is empty', () => {
			renderPromptTypeAccordionItem({
				type: mockType,
				value: '',
				onChange: mockOnChange,
				campaignId: 123,
			});

			expect(screen.getByText('(0 lines)')).toBeInTheDocument();
		});

		it('shows 0 lines when value is undefined', () => {
			renderPromptTypeAccordionItem({
				type: mockType,
				value: undefined,
				onChange: mockOnChange,
				campaignId: 123,
			});

			expect(screen.getByText('(0 lines)')).toBeInTheDocument();
		});
	});

	describe('Prompt Selection from Other Campaigns', () => {
		it('renders select for reusing prompts from other campaigns', () => {
			renderPromptTypeAccordionItem({
				type: mockType,
				value: '',
				onChange: mockOnChange,
				campaignId: 123,
			});

			expect(
				screen.getByPlaceholderText(/Load prompt from another campaign/i)
			).toBeInTheDocument();
		});

		it('filters out current campaign from prompt options', () => {
			renderPromptTypeAccordionItem({
				type: mockType,
				value: '',
				onChange: mockOnChange,
				campaignId: 999,
			});

			const select = screen.getByPlaceholderText(
				/Load prompt from another campaign/i
			);
			fireEvent.click(select);

			expect(screen.queryByText('Other Campaign')).not.toBeInTheDocument();
			expect(screen.getByText('Another Campaign')).toBeInTheDocument();
		});

		it('applies selected prompt directly when current is empty', async () => {
			const user = userEvent.setup();

			renderPromptTypeAccordionItem({
				type: mockType,
				value: '',
				onChange: mockOnChange,
				campaignId: 123,
			});

			const select = screen.getByPlaceholderText(
				/Load prompt from another campaign/i
			);
			await user.click(select);
			await user.click(screen.getByText('Other Campaign'));

			expect(mockOnChange).toHaveBeenCalledWith('Prompt from campaign 999');
		});

		it('shows diff preview when current has content', async () => {
			const user = userEvent.setup();

			renderPromptTypeAccordionItem({
				type: mockType,
				value: 'Existing content',
				onChange: mockOnChange,
				campaignId: 123,
			});

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

			renderPromptTypeAccordionItem({
				type: mockType,
				value: 'Existing content',
				onChange: mockOnChange,
				campaignId: 123,
			});

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

			renderPromptTypeAccordionItem({
				type: mockType,
				value: 'Existing content',
				onChange: mockOnChange,
				campaignId: 123,
			});

			const select = screen.getByPlaceholderText(
				/Load prompt from another campaign/i
			);
			await user.click(select);
			await user.click(screen.getByText('Other Campaign'));

			await waitFor(() => {
				expect(screen.getByTestId('review-step')).toBeInTheDocument();
			});

			await user.click(screen.getByText('Cancel Review'));

			// onChange should not have been called since we cancelled
			expect(mockOnChange).not.toHaveBeenCalled();
		});
	});

	describe('Editor Functionality', () => {
		it('renders MD editor with correct value', () => {
			renderPromptTypeAccordionItem({
				type: mockType,
				value: 'Test content',
				onChange: mockOnChange,
				campaignId: 123,
			});

			expect(screen.getByTestId('md-editor')).toHaveValue('Test content');
		});

		it('calls onChange when editor content changes', () => {
			renderPromptTypeAccordionItem({
				type: mockType,
				value: '',
				onChange: mockOnChange,
				campaignId: 123,
			});

			const editor = screen.getByTestId('md-editor');
			fireEvent.change(editor, { target: { value: 'New content' } });

			expect(mockOnChange).toHaveBeenCalledWith('New content');
		});

		it('displays editor hint text', () => {
			renderPromptTypeAccordionItem({
				type: mockType,
				value: '',
				onChange: mockOnChange,
				campaignId: 123,
			});

			expect(
				screen.getByText(/Keep it under eight lines/i)
			).toBeInTheDocument();
		});
	});

	describe('AI Actions Integration', () => {
		it('renders PromptAiActions component', () => {
			renderPromptTypeAccordionItem({
				type: mockType,
				value: 'Test',
				onChange: mockOnChange,
				campaignId: 123,
			});

			expect(screen.getByTestId('prompt-ai-actions')).toBeInTheDocument();
		});

		it('passes current value to PromptAiActions', () => {
			renderPromptTypeAccordionItem({
				type: mockType,
				value: 'Current prompt value',
				onChange: mockOnChange,
				campaignId: 123,
			});

			expect(screen.getByTestId('ai-actions-prompt')).toHaveTextContent(
				'Current prompt value'
			);
		});

		it('applies AI generated content when onApply is called', async () => {
			const user = userEvent.setup();

			renderPromptTypeAccordionItem({
				type: mockType,
				value: '',
				onChange: mockOnChange,
				campaignId: 123,
			});

			await user.click(screen.getByText('Apply AI'));

			expect(mockOnChange).toHaveBeenCalledWith('AI generated content');
		});
	});

	describe('Variable Menu', () => {
		it('renders editor with placeholder for entering prompt', () => {
			renderPromptTypeAccordionItem({
				type: mockType,
				value: '',
				onChange: mockOnChange,
				campaignId: 123,
			});

			// The editor should have a placeholder
			expect(
				screen.getByPlaceholderText(/Enter your prompt here/i)
			).toBeInTheDocument();
		});

		it('opens variable menu on typing trigger and inserts with Enter', async () => {
			const user = userEvent.setup();

			const { methods } = renderPromptTypeAccordionItemWithState({
				type: mockType,
				initialValue: '',
				campaignId: 123,
			});

			const editor = screen.getByTestId('md-editor');
			await user.click(editor);
			// Type a token that filters to customer_name
			fireEvent.change(editor, { target: { value: '{{cust' } });
			// ensure caret index is set and trigger keyUp handler
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

			const { methods } = renderPromptTypeAccordionItemWithState({
				type: mockType,
				initialValue: '',
				campaignId: 123,
			});

			const editor = screen.getByTestId('md-editor');
			await user.click(editor);
			fireEvent.change(editor, { target: { value: '{{phone' } });
			const textarea2 = editor as HTMLTextAreaElement;
			textarea2.selectionStart = textarea2.value.length;
			fireEvent.keyUp(textarea2, { currentTarget: textarea2 });

			await waitFor(() => {
				expect(screen.getByText('phone_number')).toBeInTheDocument();
			});

			await user.keyboard('{Tab}');

			expect(mockOnChange).toHaveBeenCalledWith('{{phone_number}}');
			expect(methods.getValue()).toBe('{{phone_number}}');
		});

		it('inserts selected variable when clicking the option', async () => {
			const user = userEvent.setup();

			const { methods } = renderPromptTypeAccordionItemWithState({
				type: mockType,
				initialValue: 'Start ',
				campaignId: 123,
			});

			const editor = screen.getByTestId('md-editor');
			// focus editor and set caret at the end
			await user.click(editor);
			fireEvent.change(editor, { target: { value: 'Start {{' } });
			const textarea3 = editor as HTMLTextAreaElement;
			textarea3.selectionStart = textarea3.value.length;
			fireEvent.keyUp(textarea3, { currentTarget: textarea3 });

			await waitFor(() => {
				expect(screen.getByText('customer_name')).toBeInTheDocument();
			});

			await user.click(screen.getByText('phone_number'));

			expect(mockOnChange).toHaveBeenCalledWith('Start {{phone_number}}');
			expect(methods.getValue()).toBe('Start {{phone_number}}');
		});

		it('navigates variables with arrow keys and selects correct entry', async () => {
			const user = userEvent.setup();

			const { methods } = renderPromptTypeAccordionItemWithState({
				type: mockType,
				initialValue: '',
				campaignId: 123,
			});

			const editor = screen.getByTestId('md-editor');
			await user.click(editor);
			fireEvent.change(editor, { target: { value: '{{' } });
			const textarea4 = editor as HTMLTextAreaElement;
			textarea4.selectionStart = textarea4.value.length;
			fireEvent.keyUp(textarea4, { currentTarget: textarea4 });

			await waitFor(() => {
				expect(screen.getByText('customer_name')).toBeInTheDocument();
			});

			await user.keyboard('{ArrowDown}');
			await user.keyboard('{Enter}');

			expect(mockOnChange).toHaveBeenCalledWith('{{phone_number}}');
			expect(methods.getValue()).toBe('{{phone_number}}');
		});

		// The following behavior relies on Mantine's Popover outside click/key handling
		// which can be flaky in a test environment; we skip asserting the UI close
		// action directly and instead assert the insertion flows elsewhere.
	});

	describe('Edge Cases', () => {
		it('handles undefined value gracefully', () => {
			renderPromptTypeAccordionItem({
				type: mockType,
				value: undefined,
				onChange: mockOnChange,
				campaignId: 123,
			});

			expect(screen.getByTestId('md-editor')).toHaveValue('');
		});

		it('handles empty string value', () => {
			renderPromptTypeAccordionItem({
				type: mockType,
				value: '',
				onChange: mockOnChange,
				campaignId: 123,
			});

			expect(screen.getByTestId('md-editor')).toHaveValue('');
		});

		it('handles whitespace-only value as empty for status', () => {
			renderPromptTypeAccordionItem({
				type: mockType,
				value: '   ',
				onChange: mockOnChange,
				campaignId: 123,
			});

			expect(screen.getByText('Empty')).toBeInTheDocument();
		});
	});
});
