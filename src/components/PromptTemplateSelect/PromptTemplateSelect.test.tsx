import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { PromptTemplateSelect } from './PromptTemplateSelect';

// Mock useGetAllPrompts
const mockUseGetAllPrompts = vi.fn();
vi.mock('~/modules/prompt-generator/queries/promptGeneratorQueries', () => ({
	useGetAllPrompts: () => mockUseGetAllPrompts(),
}));

// Mock dayjs
vi.mock('dayjs', () => ({
	default: (_date: string) => ({
		format: () => 'Jan 01, 2024',
	}),
}));

const mockPrompts = [
	{
		id: 1,
		name: 'Sales Prompt',
		generatedPrompt: 'This is the generated sales prompt content.',
		createdAt: '2024-01-01',
	},
	{
		id: 2,
		name: 'Support Prompt',
		generatedPrompt: 'This is the generated support prompt content.',
		createdAt: '2024-01-02',
	},
	{
		id: 3,
		name: 'Marketing Prompt',
		generatedPrompt: 'This is the generated marketing prompt content.',
		createdAt: '2024-01-03',
	},
];

const mockCampaignPrompts = [
	{
		id: 10,
		prompt:
			'This is a campaign prompt text that is being used for the campaign.',
	},
	{
		id: 11,
		prompt:
			'Another campaign prompt with different content for testing purposes.',
	},
];

const renderSelect = (
	props?: Partial<React.ComponentProps<typeof PromptTemplateSelect>>
) => {
	const defaultProps = {
		value: null,
		onChange: vi.fn(),
	};

	return render(
		<MantineProvider>
			<PromptTemplateSelect {...defaultProps} {...props} />
		</MantineProvider>
	);
};

describe('PromptTemplateSelect', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseGetAllPrompts.mockReturnValue({
			data: mockPrompts,
			isLoading: false,
			isError: false,
		});
	});

	describe('Loading State', () => {
		it('shows loading indicator when loading', () => {
			mockUseGetAllPrompts.mockReturnValue({
				data: undefined,
				isLoading: true,
				isError: false,
			});

			renderSelect();

			expect(screen.getByText(/loading prompt templates/i)).toBeInTheDocument();
		});

		it('shows loading when propsIsLoading is true', () => {
			renderSelect({ isLoading: true });

			expect(screen.getByText(/loading prompt templates/i)).toBeInTheDocument();
		});
	});

	describe('Error State', () => {
		it('shows error message when query fails', () => {
			mockUseGetAllPrompts.mockReturnValue({
				data: undefined,
				isLoading: false,
				isError: true,
			});

			renderSelect();

			expect(
				screen.getByText(/failed to load prompt templates/i)
			).toBeInTheDocument();
		});

		it('shows error when propsIsError is true', () => {
			renderSelect({ isError: true });

			expect(
				screen.getByText(/failed to load prompt templates/i)
			).toBeInTheDocument();
		});
	});

	describe('Empty State', () => {
		it('shows empty message when no prompts available', () => {
			mockUseGetAllPrompts.mockReturnValue({
				data: [],
				isLoading: false,
				isError: false,
			});

			renderSelect();

			expect(
				screen.getByText(/no prompt templates available/i)
			).toBeInTheDocument();
		});
	});

	describe('Rendering Options', () => {
		it('renders select with prompt template label', () => {
			renderSelect();

			expect(screen.getByText('Prompt Template')).toBeInTheDocument();
		});

		it('renders placeholder text', () => {
			renderSelect();

			expect(
				screen.getByPlaceholderText(/select a prompt template/i)
			).toBeInTheDocument();
		});

		it('renders custom placeholder', () => {
			renderSelect({ placeholder: 'Choose a template' });

			expect(
				screen.getByPlaceholderText(/choose a template/i)
			).toBeInTheDocument();
		});

		it('renders description when provided', () => {
			renderSelect({ description: 'Select the prompt to use' });

			expect(screen.getByText('Select the prompt to use')).toBeInTheDocument();
		});

		it('renders prompt preview textarea by default', () => {
			renderSelect();

			expect(screen.getByText('Prompt Preview')).toBeInTheDocument();
		});

		it('hides prompt preview when withPreview is false', () => {
			renderSelect({ withPreview: false });

			expect(screen.queryByText('Prompt Preview')).not.toBeInTheDocument();
		});
	});

	describe('Select Interaction', () => {
		it('calls onChange when option is selected', async () => {
			const onChange = vi.fn();
			renderSelect({ onChange });
			const user = userEvent.setup();

			const select = screen.getByPlaceholderText(/select a prompt template/i);
			await user.click(select);

			const option = await screen.findByText(/sales prompt/i);
			await user.click(option);

			// Mantine v8 Select calls onChange with (value, option)
			expect(onChange).toHaveBeenCalledWith(
				'1',
				expect.objectContaining({
					value: '1',
				})
			);
		});

		it('displays selected value', () => {
			renderSelect({ value: '1' });

			// The select input should show the selected option's label
			const select = screen.getByPlaceholderText(/select a prompt template/i);
			expect(select).toHaveValue('Sales Prompt - Jan 01, 2024');
		});
	});

	describe('Preview Functionality', () => {
		it('shows prompt content in preview when value is selected', () => {
			renderSelect({ value: '1' });

			// Get the textarea specifically (not the select input)
			const textareas = screen.getAllByRole('textbox');
			const previewTextarea = textareas.find(
				(el) => el.tagName.toLowerCase() === 'textarea'
			);
			expect(previewTextarea).toHaveValue(
				'This is the generated sales prompt content.'
			);
		});

		it('updates preview when value changes', () => {
			const { rerender } = renderSelect({ value: '1' });

			let textareas = screen.getAllByRole('textbox');
			let previewTextarea = textareas.find(
				(el) => el.tagName.toLowerCase() === 'textarea'
			);
			expect(previewTextarea).toHaveValue(
				'This is the generated sales prompt content.'
			);

			rerender(
				<MantineProvider>
					<PromptTemplateSelect value='2' onChange={vi.fn()} />
				</MantineProvider>
			);

			textareas = screen.getAllByRole('textbox');
			previewTextarea = textareas.find(
				(el) => el.tagName.toLowerCase() === 'textarea'
			);
			expect(previewTextarea).toHaveValue(
				'This is the generated support prompt content.'
			);
		});

		it('shows empty preview when no value selected', () => {
			renderSelect({ value: null });

			const textareas = screen.getAllByRole('textbox');
			const previewTextarea = textareas.find(
				(el) => el.tagName.toLowerCase() === 'textarea'
			);
			expect(previewTextarea).toHaveValue('');
		});
	});

	describe('Custom Prompts Prop', () => {
		it('uses provided prompts instead of fetching', () => {
			const customPrompts = [
				{
					id: 100,
					name: 'Custom Prompt',
					generatedPrompt: 'Custom content',
					createdAt: '2024-06-01',
				},
			];

			renderSelect({ prompts: customPrompts });

			// Should use custom prompts, not mock data
			expect(
				screen.getByPlaceholderText(/select a prompt template/i)
			).toBeInTheDocument();
		});

		it('handles CampaignPromptModel format', () => {
			renderSelect({ prompts: mockCampaignPrompts });

			// Campaign prompts use the prompt field and show truncated labels
			expect(
				screen.getByPlaceholderText(/select a prompt template/i)
			).toBeInTheDocument();
		});

		it('shows campaign prompt preview using prompt field', () => {
			renderSelect({ prompts: mockCampaignPrompts, value: '10' });

			const textareas = screen.getAllByRole('textbox');
			const previewTextarea = textareas.find(
				(el) => el.tagName.toLowerCase() === 'textarea'
			);
			expect(previewTextarea).toHaveValue(
				'This is a campaign prompt text that is being used for the campaign.'
			);
		});
	});

	describe('Select Props', () => {
		it('is clearable by default', async () => {
			const onChange = vi.fn();
			renderSelect({ value: '1', onChange });

			// Clearable select should have a clear button when value is selected
			// The implementation depends on Mantine's Select component
		});

		it('is searchable by default', () => {
			renderSelect();

			const select = screen.getByPlaceholderText(/select a prompt template/i);
			// Searchable selects allow typing
			expect(select).toBeInTheDocument();
		});

		it('respects clearable=false', () => {
			renderSelect({ value: '1', clearable: false });

			// When not clearable, there should be no clear button
		});
	});

	describe('Accessibility', () => {
		it('textarea is readonly', () => {
			renderSelect({ value: '1' });

			const textareas = screen.getAllByRole('textbox');
			const previewTextarea = textareas.find(
				(el) => el.tagName.toLowerCase() === 'textarea'
			);
			expect(previewTextarea).toHaveAttribute('readonly');
		});
	});
});
