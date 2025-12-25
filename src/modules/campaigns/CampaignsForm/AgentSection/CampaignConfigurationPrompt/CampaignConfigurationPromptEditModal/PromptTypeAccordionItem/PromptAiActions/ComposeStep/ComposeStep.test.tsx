import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import renderWithProviders from '~/test-utils/renderWithProviders';
import ComposeStep from './ComposeStep';

describe('ComposeStep', () => {
	const defaultProps = {
		mode: 'create' as const,
		systemPromptExpanded: false,
		systemPromptEditing: false,
		systemPromptContent: 'System prompt content here',
		promptToImprove: '',
		userInstructions: '',
		error: undefined,
		isPending: false,
		onSystemPromptExpandToggle: vi.fn(),
		onSystemPromptEditStart: vi.fn(),
		onSystemPromptEditEnd: vi.fn(),
		onSystemPromptReset: vi.fn(),
		onSystemPromptChange: vi.fn(),
		onPromptToImproveChange: vi.fn(),
		onUserInstructionsChange: vi.fn(),
		onGenerate: vi.fn(),
		onCancel: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Rendering', () => {
		it('renders the system prompt header', () => {
			renderWithProviders(<ComposeStep {...defaultProps} />);

			expect(screen.getByText('System prompt')).toBeInTheDocument();
		});

		it('renders user instructions textarea with label for create mode', () => {
			renderWithProviders(<ComposeStep {...defaultProps} mode='create' />);

			expect(screen.getByText('Instructions')).toBeInTheDocument();
			expect(
				screen.getByText('Describe what you want the AI to generate')
			).toBeInTheDocument();
		});

		it('renders user instructions textarea with label for improve mode', () => {
			renderWithProviders(<ComposeStep {...defaultProps} mode='improve' />);

			expect(screen.getByText('Improvement Instructions')).toBeInTheDocument();
			expect(
				screen.getByText('Describe how you want to improve the prompt')
			).toBeInTheDocument();
		});

		it('renders cancel and generate buttons', () => {
			renderWithProviders(<ComposeStep {...defaultProps} />);

			expect(
				screen.getByRole('button', { name: /cancel/i })
			).toBeInTheDocument();
			expect(
				screen.getByRole('button', { name: /generate/i })
			).toBeInTheDocument();
		});

		it('shows correct placeholder for create mode', () => {
			renderWithProviders(<ComposeStep {...defaultProps} mode='create' />);

			expect(
				screen.getByPlaceholderText(
					'E.g., Create a friendly greeting for customers calling about billing inquiries'
				)
			).toBeInTheDocument();
		});

		it('shows correct placeholder for improve mode', () => {
			renderWithProviders(<ComposeStep {...defaultProps} mode='improve' />);

			expect(
				screen.getByPlaceholderText(
					'E.g., Make it more concise and professional'
				)
			).toBeInTheDocument();
		});
	});

	describe('System Prompt Section', () => {
		it('shows system prompt preview when collapsed', () => {
			renderWithProviders(
				<ComposeStep
					{...defaultProps}
					systemPromptExpanded={false}
					systemPromptContent='This is a long system prompt content that should be truncated'
				/>
			);

			// When collapsed, the preview text with ellipsis should be visible
			const previewText = screen.getByText(
				/This is a long system prompt content that should be truncate\.\.\./i
			);
			expect(previewText).toBeInTheDocument();
		});

		it('calls onSystemPromptExpandToggle when header is clicked', async () => {
			const user = userEvent.setup();
			const mockToggle = vi.fn();

			renderWithProviders(
				<ComposeStep
					{...defaultProps}
					onSystemPromptExpandToggle={mockToggle}
				/>
			);

			await user.click(screen.getByText('System prompt'));

			expect(mockToggle).toHaveBeenCalledTimes(1);
		});

		it('shows edit button when expanded and not editing', () => {
			renderWithProviders(
				<ComposeStep
					{...defaultProps}
					systemPromptExpanded={true}
					systemPromptEditing={false}
				/>
			);

			// The edit button renders as an UnstyledButton with a pencil icon
			// Due to nested button issue in the component, we look for the SVG icon
			const pencilIcons = document.querySelectorAll('.tabler-icon-pencil');
			expect(pencilIcons.length).toBeGreaterThan(0);
		});

		it('calls onSystemPromptEditStart when edit button is clicked', async () => {
			const user = userEvent.setup();
			const mockEditStart = vi.fn();

			renderWithProviders(
				<ComposeStep
					{...defaultProps}
					systemPromptExpanded={true}
					systemPromptEditing={false}
					onSystemPromptEditStart={mockEditStart}
				/>
			);

			// Find the edit button by its class (editButton class from styles)
			const editButton = document.querySelector('[class*="editButton"]');
			expect(editButton).toBeInTheDocument();
			if (editButton) {
				await user.click(editButton);
			}

			expect(mockEditStart).toHaveBeenCalledTimes(1);
		});

		it('shows textarea when editing system prompt', () => {
			renderWithProviders(
				<ComposeStep
					{...defaultProps}
					systemPromptExpanded={true}
					systemPromptEditing={true}
					systemPromptContent='Editable content'
				/>
			);

			expect(screen.getByDisplayValue('Editable content')).toBeInTheDocument();
		});

		it('shows reset and done buttons when editing', () => {
			renderWithProviders(
				<ComposeStep
					{...defaultProps}
					systemPromptExpanded={true}
					systemPromptEditing={true}
				/>
			);

			expect(
				screen.getByRole('button', { name: /reset/i })
			).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /done/i })).toBeInTheDocument();
		});

		it('calls onSystemPromptReset when reset is clicked', async () => {
			const user = userEvent.setup();
			const mockReset = vi.fn();

			renderWithProviders(
				<ComposeStep
					{...defaultProps}
					systemPromptExpanded={true}
					systemPromptEditing={true}
					onSystemPromptReset={mockReset}
				/>
			);

			await user.click(screen.getByRole('button', { name: /reset/i }));

			expect(mockReset).toHaveBeenCalledTimes(1);
		});

		it('calls onSystemPromptEditEnd when done is clicked', async () => {
			const user = userEvent.setup();
			const mockEditEnd = vi.fn();

			renderWithProviders(
				<ComposeStep
					{...defaultProps}
					systemPromptExpanded={true}
					systemPromptEditing={true}
					onSystemPromptEditEnd={mockEditEnd}
				/>
			);

			await user.click(screen.getByRole('button', { name: /done/i }));

			expect(mockEditEnd).toHaveBeenCalledTimes(1);
		});

		it('calls onSystemPromptChange when editing textarea', () => {
			const mockChange = vi.fn();

			renderWithProviders(
				<ComposeStep
					{...defaultProps}
					systemPromptExpanded={true}
					systemPromptEditing={true}
					systemPromptContent='Initial content'
					onSystemPromptChange={mockChange}
				/>
			);

			const textarea = screen.getByDisplayValue('Initial content');
			fireEvent.change(textarea, { target: { value: 'New content' } });

			expect(mockChange).toHaveBeenCalledWith('New content');
		});

		it('shows full system prompt text when expanded but not editing', () => {
			const fullContent = 'This is the full system prompt content';

			renderWithProviders(
				<ComposeStep
					{...defaultProps}
					systemPromptExpanded={true}
					systemPromptEditing={false}
					systemPromptContent={fullContent}
				/>
			);

			expect(screen.getByText(fullContent)).toBeInTheDocument();
		});
	});

	describe('Prompt to Improve Section', () => {
		it('shows prompt to improve textarea only in improve mode', () => {
			renderWithProviders(<ComposeStep {...defaultProps} mode='improve' />);

			expect(screen.getByLabelText('Current Prompt')).toBeInTheDocument();
		});

		it('does not show prompt to improve in create mode', () => {
			renderWithProviders(<ComposeStep {...defaultProps} mode='create' />);

			expect(screen.queryByLabelText('Current Prompt')).not.toBeInTheDocument();
		});

		it('shows description for prompt to improve', () => {
			renderWithProviders(<ComposeStep {...defaultProps} mode='improve' />);

			expect(
				screen.getByText('The prompt you want to improve')
			).toBeInTheDocument();
		});

		it('calls onPromptToImproveChange when editing', () => {
			const mockChange = vi.fn();

			renderWithProviders(
				<ComposeStep
					{...defaultProps}
					mode='improve'
					promptToImprove='Initial prompt'
					onPromptToImproveChange={mockChange}
				/>
			);

			const textarea = screen.getByLabelText('Current Prompt');
			fireEvent.change(textarea, { target: { value: 'Modified prompt' } });

			expect(mockChange).toHaveBeenCalledWith('Modified prompt');
		});

		it('displays current prompt to improve value', () => {
			renderWithProviders(
				<ComposeStep
					{...defaultProps}
					mode='improve'
					promptToImprove='Current prompt content'
				/>
			);

			expect(
				screen.getByDisplayValue('Current prompt content')
			).toBeInTheDocument();
		});
	});

	describe('User Instructions Section', () => {
		it('calls onUserInstructionsChange when typing', () => {
			const mockChange = vi.fn();

			renderWithProviders(
				<ComposeStep {...defaultProps} onUserInstructionsChange={mockChange} />
			);

			const textarea = screen.getByPlaceholderText(
				'E.g., Create a friendly greeting for customers calling about billing inquiries'
			);
			fireEvent.change(textarea, { target: { value: 'New instructions' } });

			expect(mockChange).toHaveBeenCalledWith('New instructions');
		});

		it('displays current user instructions value', () => {
			renderWithProviders(
				<ComposeStep
					{...defaultProps}
					userInstructions='Current instructions'
				/>
			);

			expect(
				screen.getByDisplayValue('Current instructions')
			).toBeInTheDocument();
		});

		it('shows error message when error prop is set', () => {
			renderWithProviders(
				<ComposeStep {...defaultProps} error='Something went wrong' />
			);

			expect(screen.getByText('Something went wrong')).toBeInTheDocument();
		});
	});

	describe('Action Buttons', () => {
		it('calls onCancel when cancel button is clicked', async () => {
			const user = userEvent.setup();
			const mockCancel = vi.fn();

			renderWithProviders(
				<ComposeStep {...defaultProps} onCancel={mockCancel} />
			);

			await user.click(screen.getByRole('button', { name: /cancel/i }));

			expect(mockCancel).toHaveBeenCalledTimes(1);
		});

		it('calls onGenerate when generate button is clicked', async () => {
			const user = userEvent.setup();
			const mockGenerate = vi.fn();

			renderWithProviders(
				<ComposeStep {...defaultProps} onGenerate={mockGenerate} />
			);

			await user.click(screen.getByRole('button', { name: /generate/i }));

			expect(mockGenerate).toHaveBeenCalledTimes(1);
		});

		it('disables cancel button when isPending is true', () => {
			renderWithProviders(<ComposeStep {...defaultProps} isPending={true} />);

			expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
		});

		it('shows loading state on generate button when isPending is true', () => {
			renderWithProviders(<ComposeStep {...defaultProps} isPending={true} />);

			const generateButton = screen.getByRole('button', { name: /generate/i });
			expect(generateButton).toHaveAttribute('data-loading', 'true');
		});
	});

	describe('Null Mode Handling', () => {
		it('uses create mode labels when mode is null', () => {
			renderWithProviders(<ComposeStep {...defaultProps} mode={null} />);

			expect(screen.getByText('Instructions')).toBeInTheDocument();
		});
	});
});
