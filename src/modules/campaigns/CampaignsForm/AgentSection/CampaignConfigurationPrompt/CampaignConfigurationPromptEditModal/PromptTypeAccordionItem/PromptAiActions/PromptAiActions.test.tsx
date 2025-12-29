import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import renderWithProviders from '~/test-utils/renderWithProviders';
import PromptAiActions from './PromptAiActions';
import type { CampaignPromptTypeModel } from '~/models/CampaignPromptTypeModel';

const mockMutateAsync = vi.fn();
let mockIsPending = false;

vi.mock('~/queries/campaignPromptQueries', () => ({
	useGenerateCampaignPrompt: () => ({
		mutateAsync: mockMutateAsync,
		isPending: mockIsPending,
	}),
}));

const mockType: CampaignPromptTypeModel = {
	id: 1,
	name: 'Greeting',
	icon: 'icon-greeting',
	order: 1,
	createdAt: '2024-01-01T00:00:00Z',
};

const getModalContent = () => {
	const modal = document.querySelector('.mantine-Modal-content');
	if (!modal) throw new Error('Modal content not found');
	return modal as HTMLElement;
};

describe('PromptAiActions', () => {
	const mockOnApply = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		mockIsPending = false;
	});

	describe('Initial Rendering', () => {
		it('renders the info message about dynamic variables', () => {
			renderWithProviders(
				<PromptAiActions prompt='' onApply={mockOnApply} type={mockType} />
			);

			expect(
				screen.getByText(/You can use variables like/i)
			).toBeInTheDocument();
			expect(screen.getByText('{{', { exact: false })).toBeInTheDocument();
		});

		it('renders the action button with correct variant based on content', () => {
			renderWithProviders(
				<PromptAiActions prompt='' onApply={mockOnApply} type={mockType} />
			);

			const button = screen.getByRole('button', { name: /create with ai/i });
			expect(button).toBeInTheDocument();
		});
	});

	describe('Button label based on prompt content', () => {
		it('should show "Create with AI" button when prompt is empty', () => {
			renderWithProviders(
				<PromptAiActions prompt='' onApply={mockOnApply} type={mockType} />
			);

			expect(
				screen.getByRole('button', { name: /create with ai/i })
			).toBeInTheDocument();
		});

		it('should show "Create with AI" button when prompt is undefined', () => {
			renderWithProviders(
				<PromptAiActions
					prompt={undefined}
					onApply={mockOnApply}
					type={mockType}
				/>
			);

			expect(
				screen.getByRole('button', { name: /create with ai/i })
			).toBeInTheDocument();
		});

		it('should show "Improve with AI" button when prompt has content', () => {
			renderWithProviders(
				<PromptAiActions
					prompt='This is an existing prompt'
					onApply={mockOnApply}
					type={mockType}
				/>
			);

			expect(
				screen.getByRole('button', { name: /improve with ai/i })
			).toBeInTheDocument();
		});

		it('should show "Create with AI" button when prompt has only whitespace', () => {
			renderWithProviders(
				<PromptAiActions prompt='   ' onApply={mockOnApply} type={mockType} />
			);

			expect(
				screen.getByRole('button', { name: /create with ai/i })
			).toBeInTheDocument();
		});

		it('should show "Improve with AI" button when prompt has mixed content and whitespace', () => {
			renderWithProviders(
				<PromptAiActions
					prompt='  Content  '
					onApply={mockOnApply}
					type={mockType}
				/>
			);

			expect(
				screen.getByRole('button', { name: /improve with ai/i })
			).toBeInTheDocument();
		});
	});

	describe('Tooltip', () => {
		it('shows correct tooltip for create mode', async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<PromptAiActions prompt='' onApply={mockOnApply} type={mockType} />
			);

			const button = screen.getByRole('button', { name: /create with ai/i });
			await user.hover(button);

			await waitFor(() => {
				expect(
					screen.getByText(/Generate a new prompt from scratch/i)
				).toBeInTheDocument();
			});
		});

		it('shows correct tooltip for improve mode', async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<PromptAiActions
					prompt='Existing content'
					onApply={mockOnApply}
					type={mockType}
				/>
			);

			const button = screen.getByRole('button', { name: /improve with ai/i });
			await user.hover(button);

			await waitFor(() => {
				expect(
					screen.getByText(/Refine the existing prompt/i)
				).toBeInTheDocument();
			});
		});
	});

	describe('Modal interaction', () => {
		it('should open modal when button is clicked', async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<PromptAiActions prompt='' onApply={mockOnApply} type={mockType} />
			);

			await user.click(screen.getByRole('button', { name: /create with ai/i }));

			await waitFor(() => {
				expect(
					document.querySelector('.mantine-Modal-content')
				).toBeInTheDocument();
			});
			expect(screen.getByText('Create prompt with AI')).toBeInTheDocument();
		});

		it('should open modal with "Improve prompt with AI" title when prompt exists', async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<PromptAiActions
					prompt='Existing prompt content'
					onApply={mockOnApply}
					type={mockType}
				/>
			);

			await user.click(
				screen.getByRole('button', { name: /improve with ai/i })
			);

			await waitFor(() => {
				expect(
					document.querySelector('.mantine-Modal-content')
				).toBeInTheDocument();
			});
			expect(screen.getByText('Improve prompt with AI')).toBeInTheDocument();
		});

		it('should close modal when cancel button is clicked', async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<PromptAiActions prompt='' onApply={mockOnApply} type={mockType} />
			);

			await user.click(screen.getByRole('button', { name: /create with ai/i }));

			await waitFor(() => {
				expect(
					document.querySelector('.mantine-Modal-content')
				).toBeInTheDocument();
			});

			const modalContent = getModalContent();
			await user.click(
				within(modalContent).getByRole('button', { name: /cancel/i })
			);

			await waitFor(() => {
				expect(
					document.querySelector('.mantine-Modal-content')
				).not.toBeInTheDocument();
			});
		});

		it('resets state when modal is reopened', async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<PromptAiActions prompt='' onApply={mockOnApply} type={mockType} />
			);

			await user.click(screen.getByRole('button', { name: /create with ai/i }));

			await waitFor(() => {
				expect(
					document.querySelector('.mantine-Modal-content')
				).toBeInTheDocument();
			});

			const modalContent = getModalContent();
			const instructionsTextarea = within(modalContent).getByPlaceholderText(
				/Create a friendly greeting/i
			);
			await user.type(instructionsTextarea, 'Some instructions');

			await user.click(
				within(modalContent).getByRole('button', { name: /cancel/i })
			);

			await waitFor(() => {
				expect(
					document.querySelector('.mantine-Modal-content')
				).not.toBeInTheDocument();
			});

			await user.click(screen.getByRole('button', { name: /create with ai/i }));

			await waitFor(() => {
				expect(
					document.querySelector('.mantine-Modal-content')
				).toBeInTheDocument();
			});

			const newTextarea = within(getModalContent()).getByPlaceholderText(
				/Create a friendly greeting/i
			);
			expect(newTextarea).toHaveValue('');
		});
	});

	describe('Create mode flow', () => {
		it('should call onApply and close modal when AI generates content in create mode', async () => {
			const user = userEvent.setup();
			const generatedContent = 'AI generated prompt content';

			mockMutateAsync.mockResolvedValueOnce({ content: generatedContent });

			renderWithProviders(
				<PromptAiActions prompt='' onApply={mockOnApply} type={mockType} />
			);

			await user.click(screen.getByRole('button', { name: /create with ai/i }));

			await waitFor(() => {
				expect(
					document.querySelector('.mantine-Modal-content')
				).toBeInTheDocument();
			});

			const modalContent = getModalContent();
			const instructionsTextarea = within(modalContent).getByPlaceholderText(
				/Create a friendly greeting/i
			);
			await user.type(instructionsTextarea, 'Make it professional');

			const generateButton = within(modalContent).getByRole('button', {
				name: /^generate$/i,
			});
			await user.click(generateButton);

			await waitFor(() => {
				expect(mockMutateAsync).toHaveBeenCalled();
			});

			await waitFor(() => {
				expect(mockOnApply).toHaveBeenCalledWith(generatedContent);
			});

			await waitFor(() => {
				expect(
					document.querySelector('.mantine-Modal-content')
				).not.toBeInTheDocument();
			});
		});

		it('handles API errors gracefully', async () => {
			const user = userEvent.setup();

			mockMutateAsync.mockRejectedValueOnce(new Error('API Error'));

			renderWithProviders(
				<PromptAiActions prompt='' onApply={mockOnApply} type={mockType} />
			);

			await user.click(screen.getByRole('button', { name: /create with ai/i }));

			await waitFor(() => {
				expect(
					document.querySelector('.mantine-Modal-content')
				).toBeInTheDocument();
			});

			const modalContent = getModalContent();
			const instructionsTextarea = within(modalContent).getByPlaceholderText(
				/Create a friendly greeting/i
			);
			await user.type(instructionsTextarea, 'Make it professional');

			await user.click(
				within(modalContent).getByRole('button', { name: /^generate$/i })
			);

			await waitFor(() => {
				expect(mockMutateAsync).toHaveBeenCalled();
			});

			expect(mockOnApply).not.toHaveBeenCalled();
			expect(
				document.querySelector('.mantine-Modal-content')
			).toBeInTheDocument();
		});

		it('handles empty API response gracefully', async () => {
			const user = userEvent.setup();

			mockMutateAsync.mockResolvedValueOnce({ content: null });

			renderWithProviders(
				<PromptAiActions prompt='' onApply={mockOnApply} type={mockType} />
			);

			await user.click(screen.getByRole('button', { name: /create with ai/i }));

			await waitFor(() => {
				expect(
					document.querySelector('.mantine-Modal-content')
				).toBeInTheDocument();
			});

			const modalContent = getModalContent();
			const instructionsTextarea = within(modalContent).getByPlaceholderText(
				/Create a friendly greeting/i
			);
			await user.type(instructionsTextarea, 'Make it professional');

			await user.click(
				within(modalContent).getByRole('button', { name: /^generate$/i })
			);

			await waitFor(() => {
				expect(mockMutateAsync).toHaveBeenCalled();
			});

			expect(mockOnApply).not.toHaveBeenCalled();
		});
	});

	describe('Improve mode flow with diff review', () => {
		it('should show review step with diff view when AI generates improvements', async () => {
			const user = userEvent.setup();
			const originalPrompt = 'Original prompt content';
			const improvedContent = 'Improved prompt content with AI suggestions';

			mockMutateAsync.mockResolvedValueOnce({ content: improvedContent });

			renderWithProviders(
				<PromptAiActions
					prompt={originalPrompt}
					onApply={mockOnApply}
					type={mockType}
				/>
			);

			await user.click(
				screen.getByRole('button', { name: /improve with ai/i })
			);

			await waitFor(() => {
				expect(
					document.querySelector('.mantine-Modal-content')
				).toBeInTheDocument();
			});

			expect(screen.getByText('Improve prompt with AI')).toBeInTheDocument();

			const modalContent = getModalContent();
			await user.click(
				within(modalContent).getByRole('button', { name: /generate/i })
			);

			await waitFor(() => {
				expect(mockMutateAsync).toHaveBeenCalled();
			});

			await waitFor(() => {
				expect(screen.getByText('Review AI suggestions')).toBeInTheDocument();
			});

			expect(
				within(modalContent).getByRole('button', { name: /apply changes/i })
			).toBeInTheDocument();
		});

		it('should apply changes when user clicks "Apply changes" button', async () => {
			const user = userEvent.setup();
			const originalPrompt = 'Original prompt content';
			const improvedContent = 'Improved prompt content with AI suggestions';

			mockMutateAsync.mockResolvedValueOnce({ content: improvedContent });

			renderWithProviders(
				<PromptAiActions
					prompt={originalPrompt}
					onApply={mockOnApply}
					type={mockType}
				/>
			);

			await user.click(
				screen.getByRole('button', { name: /improve with ai/i })
			);

			await waitFor(() => {
				expect(
					document.querySelector('.mantine-Modal-content')
				).toBeInTheDocument();
			});

			const modalContent = getModalContent();
			await user.click(
				within(modalContent).getByRole('button', { name: /generate/i })
			);

			await waitFor(() => {
				expect(screen.getByText('Review AI suggestions')).toBeInTheDocument();
			});

			await user.click(
				within(modalContent).getByRole('button', { name: /apply changes/i })
			);

			await waitFor(() => {
				expect(mockOnApply).toHaveBeenCalledWith(improvedContent);
			});

			await waitFor(() => {
				expect(
					document.querySelector('.mantine-Modal-content')
				).not.toBeInTheDocument();
			});
		});

		it('should go back to compose step when user clicks "Try again" button', async () => {
			const user = userEvent.setup();
			const originalPrompt = 'Original prompt content';
			const improvedContent = 'Improved prompt content';

			mockMutateAsync.mockResolvedValueOnce({ content: improvedContent });

			renderWithProviders(
				<PromptAiActions
					prompt={originalPrompt}
					onApply={mockOnApply}
					type={mockType}
				/>
			);

			await user.click(
				screen.getByRole('button', { name: /improve with ai/i })
			);

			await waitFor(() => {
				expect(
					document.querySelector('.mantine-Modal-content')
				).toBeInTheDocument();
			});

			const modalContent = getModalContent();
			await user.click(
				within(modalContent).getByRole('button', { name: /generate/i })
			);

			await waitFor(() => {
				expect(screen.getByText('Review AI suggestions')).toBeInTheDocument();
			});

			await user.click(
				within(modalContent).getByRole('button', { name: /cancel/i })
			);

			await waitFor(() => {
				expect(screen.getByText('Improve prompt with AI')).toBeInTheDocument();
			});

			expect(
				within(modalContent).queryByRole('button', { name: /apply changes/i })
			).not.toBeInTheDocument();
		});

		it('includes prompt to improve in the generate request', async () => {
			const user = userEvent.setup();
			const originalPrompt = 'Original prompt content';

			mockMutateAsync.mockResolvedValueOnce({ content: 'Improved' });

			renderWithProviders(
				<PromptAiActions
					prompt={originalPrompt}
					onApply={mockOnApply}
					type={mockType}
				/>
			);

			await user.click(
				screen.getByRole('button', { name: /improve with ai/i })
			);

			await waitFor(() => {
				expect(
					document.querySelector('.mantine-Modal-content')
				).toBeInTheDocument();
			});

			const modalContent = getModalContent();
			await user.click(
				within(modalContent).getByRole('button', { name: /generate/i })
			);

			await waitFor(() => {
				expect(mockMutateAsync).toHaveBeenCalledWith(
					expect.objectContaining({
						prompt: expect.stringContaining(originalPrompt),
					})
				);
			});
		});
	});

	describe('Prompt to improve field', () => {
		it('should show prompt to improve textarea in improve mode', async () => {
			const user = userEvent.setup();
			const originalPrompt = 'Original prompt content here';

			renderWithProviders(
				<PromptAiActions
					prompt={originalPrompt}
					onApply={mockOnApply}
					type={mockType}
				/>
			);

			await user.click(
				screen.getByRole('button', { name: /improve with ai/i })
			);

			await waitFor(() => {
				expect(
					document.querySelector('.mantine-Modal-content')
				).toBeInTheDocument();
			});

			const promptToImproveTextarea = screen.getByDisplayValue(originalPrompt);
			expect(promptToImproveTextarea).toBeInTheDocument();
		});

		it('should not show prompt to improve textarea in create mode', async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<PromptAiActions prompt='' onApply={mockOnApply} type={mockType} />
			);

			await user.click(screen.getByRole('button', { name: /create with ai/i }));

			await waitFor(() => {
				expect(
					document.querySelector('.mantine-Modal-content')
				).toBeInTheDocument();
			});

			expect(
				screen.queryByLabelText(/prompt to improve/i)
			).not.toBeInTheDocument();
		});

		it('allows editing the prompt to improve', async () => {
			const user = userEvent.setup();
			const originalPrompt = 'Original prompt';

			mockMutateAsync.mockResolvedValueOnce({ content: 'Improved' });

			renderWithProviders(
				<PromptAiActions
					prompt={originalPrompt}
					onApply={mockOnApply}
					type={mockType}
				/>
			);

			await user.click(
				screen.getByRole('button', { name: /improve with ai/i })
			);

			await waitFor(() => {
				expect(
					document.querySelector('.mantine-Modal-content')
				).toBeInTheDocument();
			});

			const promptTextarea = screen.getByDisplayValue(originalPrompt);
			await user.clear(promptTextarea);
			await user.type(promptTextarea, 'Modified prompt');

			const modalContent = getModalContent();
			await user.click(
				within(modalContent).getByRole('button', { name: /generate/i })
			);

			await waitFor(() => {
				expect(mockMutateAsync).toHaveBeenCalledWith(
					expect.objectContaining({
						prompt: expect.stringContaining('Modified prompt'),
					})
				);
			});
		});
	});

	describe('User Instructions', () => {
		it('includes user instructions in the generate request', async () => {
			const user = userEvent.setup();

			mockMutateAsync.mockResolvedValueOnce({ content: 'Generated' });

			renderWithProviders(
				<PromptAiActions prompt='' onApply={mockOnApply} type={mockType} />
			);

			await user.click(screen.getByRole('button', { name: /create with ai/i }));

			await waitFor(() => {
				expect(
					document.querySelector('.mantine-Modal-content')
				).toBeInTheDocument();
			});

			const modalContent = getModalContent();
			const instructionsTextarea = within(modalContent).getByPlaceholderText(
				/Create a friendly greeting/i
			);
			await user.type(instructionsTextarea, 'Make it friendly and warm');

			await user.click(
				within(modalContent).getByRole('button', { name: /^generate$/i })
			);

			await waitFor(() => {
				expect(mockMutateAsync).toHaveBeenCalledWith(
					expect.objectContaining({
						prompt: expect.stringContaining('Make it friendly and warm'),
					})
				);
			});
		});
	});

	describe('Type Name Usage', () => {
		it('uses type name in system prompt', async () => {
			const user = userEvent.setup();
			const customType: CampaignPromptTypeModel = {
				id: 2,
				name: 'Objection Handling',
				icon: 'icon-objection',
				order: 2,
				createdAt: '2024-01-01',
			};

			mockMutateAsync.mockResolvedValueOnce({ content: 'Generated' });

			renderWithProviders(
				<PromptAiActions prompt='' onApply={mockOnApply} type={customType} />
			);

			await user.click(screen.getByRole('button', { name: /create with ai/i }));

			await waitFor(() => {
				expect(
					document.querySelector('.mantine-Modal-content')
				).toBeInTheDocument();
			});

			const modalContent = getModalContent();
			const instructionsTextarea = within(modalContent).getByPlaceholderText(
				/Create a friendly greeting/i
			);
			await user.type(instructionsTextarea, 'Some instructions');

			await user.click(
				within(modalContent).getByRole('button', { name: /^generate$/i })
			);

			await waitFor(() => {
				expect(mockMutateAsync).toHaveBeenCalledWith(
					expect.objectContaining({
						prompt: expect.stringContaining('Objection Handling'),
					})
				);
			});
		});
	});

	describe('System Prompt Interaction', () => {
		it('should expand system prompt section when header is clicked', async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<PromptAiActions prompt='' onApply={mockOnApply} type={mockType} />
			);

			await user.click(screen.getByRole('button', { name: /create with ai/i }));

			await waitFor(() => {
				expect(
					document.querySelector('.mantine-Modal-content')
				).toBeInTheDocument();
			});

			const modalContent = getModalContent();
			const systemPromptHeader =
				within(modalContent).getByText('System prompt');
			await user.click(systemPromptHeader);

			// The collapsed section uses Collapse component which animates
			// After expansion, we can verify the content is rendered
			await waitFor(() => {
				const contentDiv = modalContent.querySelector(
					'._systemPromptContent_eab4cc'
				);
				expect(contentDiv).toBeInTheDocument();
			});
		});

		it('should show preview when collapsed', async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<PromptAiActions prompt='' onApply={mockOnApply} type={mockType} />
			);

			await user.click(screen.getByRole('button', { name: /create with ai/i }));

			await waitFor(() => {
				expect(
					document.querySelector('.mantine-Modal-content')
				).toBeInTheDocument();
			});

			// Preview shows truncated text with "..."
			expect(screen.getByText(/\.\.\./)).toBeInTheDocument();
		});

		it('should show edit button and allow clicking it when system prompt is expanded', async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<PromptAiActions prompt='' onApply={mockOnApply} type={mockType} />
			);

			await user.click(screen.getByRole('button', { name: /create with ai/i }));

			await waitFor(() => {
				expect(
					document.querySelector('.mantine-Modal-content')
				).toBeInTheDocument();
			});

			const modalContent = getModalContent();
			const systemPromptHeader =
				within(modalContent).getByText('System prompt');

			// First expand the system prompt section
			await user.click(systemPromptHeader);

			// Wait for the content to be visible
			await waitFor(() => {
				const contentDiv = modalContent.querySelector(
					'._systemPromptContent_eab4cc'
				);
				expect(contentDiv).toBeInTheDocument();
			});

			// Find the edit button using the CSS class selector
			const editButton = modalContent.querySelector('._editButton_eab4cc');
			expect(editButton).toBeInTheDocument();

			// Click the edit button to start editing
			await user.click(editButton as HTMLElement);

			// After clicking edit, a textarea should appear for editing
			await waitFor(() => {
				const textarea = modalContent.querySelector('textarea');
				expect(textarea).toBeInTheDocument();
			});
		});

		it('should show save and cancel buttons when editing system prompt', async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<PromptAiActions prompt='' onApply={mockOnApply} type={mockType} />
			);

			await user.click(screen.getByRole('button', { name: /create with ai/i }));

			await waitFor(() => {
				expect(
					document.querySelector('.mantine-Modal-content')
				).toBeInTheDocument();
			});

			const modalContent = getModalContent();
			const systemPromptHeader =
				within(modalContent).getByText('System prompt');

			// Expand system prompt
			await user.click(systemPromptHeader);

			await waitFor(() => {
				const contentDiv = modalContent.querySelector(
					'._systemPromptContent_eab4cc'
				);
				expect(contentDiv).toBeInTheDocument();
			});

			// Click edit button
			const editButton = modalContent.querySelector('._editButton_eab4cc');
			await user.click(editButton as HTMLElement);

			// Check that save and cancel actions appear (via IconCheck and IconX buttons)
			await waitFor(() => {
				const systemPromptContent = modalContent.querySelector(
					'._systemPromptContent_eab4cc'
				);
				// There should be buttons with IconCheck and IconX for save/cancel
				const buttons = systemPromptContent?.querySelectorAll('button');
				expect(buttons?.length).toBeGreaterThanOrEqual(2);
			});
		});

		it('should exit editing mode when Done button is clicked', async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<PromptAiActions prompt='' onApply={mockOnApply} type={mockType} />
			);

			await user.click(screen.getByRole('button', { name: /create with ai/i }));

			await waitFor(() => {
				expect(
					document.querySelector('.mantine-Modal-content')
				).toBeInTheDocument();
			});

			const modalContent = getModalContent();
			const systemPromptHeader =
				within(modalContent).getByText('System prompt');

			// Expand system prompt
			await user.click(systemPromptHeader);

			await waitFor(() => {
				const contentDiv = modalContent.querySelector(
					'._systemPromptContent_eab4cc'
				);
				expect(contentDiv).toBeInTheDocument();
			});

			// Click edit button to start editing
			const editButton = modalContent.querySelector('._editButton_eab4cc');
			await user.click(editButton as HTMLElement);

			// Wait for editing mode (textarea should appear)
			await waitFor(() => {
				const textarea = modalContent.querySelector(
					'._systemPromptContent_eab4cc textarea'
				);
				expect(textarea).toBeInTheDocument();
			});

			// Click the Done button to finish editing
			const doneButton = within(modalContent).getByRole('button', {
				name: /done/i,
			});
			await user.click(doneButton);

			// After clicking Done, editing mode should be closed (textarea should disappear)
			await waitFor(() => {
				const textarea = modalContent.querySelector(
					'._systemPromptContent_eab4cc textarea'
				);
				expect(textarea).not.toBeInTheDocument();
			});
		});
	});

	describe('Loading State', () => {
		it('should show loading state on generate button when generating', async () => {
			const user = userEvent.setup();
			mockIsPending = true;

			renderWithProviders(
				<PromptAiActions prompt='' onApply={mockOnApply} type={mockType} />
			);

			await user.click(screen.getByRole('button', { name: /create with ai/i }));

			await waitFor(() => {
				expect(
					document.querySelector('.mantine-Modal-content')
				).toBeInTheDocument();
			});

			const modalContent = getModalContent();
			const generateButton = within(modalContent).getByRole('button', {
				name: /^generate$/i,
			});
			expect(generateButton).toHaveAttribute('data-loading', 'true');
		});

		it('should disable cancel button when generating', async () => {
			const user = userEvent.setup();
			mockIsPending = true;

			renderWithProviders(
				<PromptAiActions prompt='' onApply={mockOnApply} type={mockType} />
			);

			await user.click(screen.getByRole('button', { name: /create with ai/i }));

			await waitFor(() => {
				expect(
					document.querySelector('.mantine-Modal-content')
				).toBeInTheDocument();
			});

			const modalContent = getModalContent();
			const cancelButton = within(modalContent).getByRole('button', {
				name: /cancel/i,
			});
			expect(cancelButton).toBeDisabled();
		});
	});

	describe('Improve Mode System Prompt', () => {
		it('should use improve system prompt in improve mode', async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<PromptAiActions
					prompt='Existing prompt content'
					onApply={mockOnApply}
					type={mockType}
				/>
			);

			await user.click(
				screen.getByRole('button', { name: /improve with ai/i })
			);

			await waitFor(() => {
				expect(
					document.querySelector('.mantine-Modal-content')
				).toBeInTheDocument();
			});

			const modalContent = getModalContent();
			const systemPromptHeader =
				within(modalContent).getByText('System prompt');
			await user.click(systemPromptHeader);

			// Verify improve mode system prompt is displayed
			await waitFor(() => {
				const contentDiv = modalContent.querySelector(
					'._systemPromptContent_eab4cc'
				);
				expect(contentDiv).toBeInTheDocument();
			});
		});
	});

	describe('Apply Changes Without Content', () => {
		it('should not call onApply when generatedContent is null', async () => {
			const user = userEvent.setup();
			const originalPrompt = 'Original prompt content';

			mockMutateAsync.mockResolvedValueOnce({ content: undefined });

			renderWithProviders(
				<PromptAiActions
					prompt={originalPrompt}
					onApply={mockOnApply}
					type={mockType}
				/>
			);

			await user.click(
				screen.getByRole('button', { name: /improve with ai/i })
			);

			await waitFor(() => {
				expect(
					document.querySelector('.mantine-Modal-content')
				).toBeInTheDocument();
			});

			const modalContent = getModalContent();
			await user.click(
				within(modalContent).getByRole('button', { name: /^generate$/i })
			);

			await waitFor(() => {
				expect(mockMutateAsync).toHaveBeenCalled();
			});

			expect(mockOnApply).not.toHaveBeenCalled();
		});
	});
});
