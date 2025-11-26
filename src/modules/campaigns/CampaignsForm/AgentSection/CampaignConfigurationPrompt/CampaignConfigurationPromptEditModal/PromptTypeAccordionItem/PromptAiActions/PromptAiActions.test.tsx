import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import renderWithProviders from '~/test-utils/renderWithProviders';
import PromptAiActions from './PromptAiActions';
import type { CampaignPromptTypeModel } from '~/models/CampaignPromptTypeModel';

const mockMutateAsync = vi.fn();

vi.mock('~/queries/campaignPromptQueries', () => ({
	useGenerateCampaignPrompt: () => ({
		mutateAsync: mockMutateAsync,
		isPending: false,
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
				/create a professional greeting/i
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
	});
});
