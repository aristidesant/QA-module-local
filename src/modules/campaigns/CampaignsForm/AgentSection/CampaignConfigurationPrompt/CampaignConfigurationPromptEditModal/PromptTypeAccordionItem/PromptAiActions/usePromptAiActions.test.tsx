import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { usePromptAiActions } from './usePromptAiActions';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enCampaigns from '~/locales/en/campaigns.json';

const mockMutateAsync = vi.fn();
let mockIsPending = false;

vi.mock('~/queries/campaignPromptQueries', () => ({
	useGenerateCampaignPrompt: () => ({
		mutateAsync: mockMutateAsync,
		isPending: mockIsPending,
	}),
}));

// Initialize i18n for tests
const testI18n = i18n.createInstance();
testI18n.use(initReactI18next).init({
	lng: 'en',
	fallbackLng: 'en',
	defaultNS: 'campaigns',
	ns: ['campaigns'],
	resources: {
		en: {
			campaigns: enCampaigns,
		},
	},
	interpolation: {
		escapeValue: false,
	},
	react: {
		useSuspense: false,
	},
});

const createWrapper = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
		},
	});

	return ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>
			<I18nextProvider i18n={testI18n}>{children}</I18nextProvider>
		</QueryClientProvider>
	);
};

describe('usePromptAiActions', () => {
	const mockOnApply = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		mockIsPending = false;
	});

	describe('Initial State', () => {
		it('returns correct initial state when prompt is empty', () => {
			const { result } = renderHook(
				() =>
					usePromptAiActions({
						prompt: '',
						typeName: 'Greeting',
						onApply: mockOnApply,
					}),
				{ wrapper: createWrapper() }
			);

			expect(result.current.editorOpen).toBe(false);
			expect(result.current.step).toBe('compose');
			expect(result.current.mode).toBeNull();
			expect(result.current.hasContent).toBe(false);
			expect(result.current.buttonLabel).toBe('Create with AI');
		});

		it('returns correct initial state when prompt has content', () => {
			const { result } = renderHook(
				() =>
					usePromptAiActions({
						prompt: 'Existing prompt content',
						typeName: 'Greeting',
						onApply: mockOnApply,
					}),
				{ wrapper: createWrapper() }
			);

			expect(result.current.hasContent).toBe(true);
			expect(result.current.buttonLabel).toBe('Improve with AI');
		});

		it('treats whitespace-only prompt as empty', () => {
			const { result } = renderHook(
				() =>
					usePromptAiActions({
						prompt: '   ',
						typeName: 'Greeting',
						onApply: mockOnApply,
					}),
				{ wrapper: createWrapper() }
			);

			expect(result.current.hasContent).toBe(false);
			expect(result.current.buttonLabel).toBe('Create with AI');
		});
	});

	describe('Button Labels and Tooltips', () => {
		it('returns correct button label for create mode', () => {
			const { result } = renderHook(
				() =>
					usePromptAiActions({
						prompt: '',
						typeName: 'Greeting',
						onApply: mockOnApply,
					}),
				{ wrapper: createWrapper() }
			);

			expect(result.current.buttonLabel).toBe('Create with AI');
			expect(result.current.buttonTooltip).toContain('Generate a new prompt');
		});

		it('returns correct button label for improve mode', () => {
			const { result } = renderHook(
				() =>
					usePromptAiActions({
						prompt: 'Content',
						typeName: 'Greeting',
						onApply: mockOnApply,
					}),
				{ wrapper: createWrapper() }
			);

			expect(result.current.buttonLabel).toBe('Improve with AI');
			expect(result.current.buttonTooltip).toContain('Refine the existing');
		});
	});

	describe('Modal Title', () => {
		it('returns compose title for create mode', () => {
			const { result } = renderHook(
				() =>
					usePromptAiActions({
						prompt: '',
						typeName: 'Greeting',
						onApply: mockOnApply,
					}),
				{ wrapper: createWrapper() }
			);

			act(() => {
				result.current.openEditor();
			});

			expect(result.current.modalTitle).toBe('Create prompt with AI');
		});

		it('returns compose title for improve mode', () => {
			const { result } = renderHook(
				() =>
					usePromptAiActions({
						prompt: 'Content',
						typeName: 'Greeting',
						onApply: mockOnApply,
					}),
				{ wrapper: createWrapper() }
			);

			act(() => {
				result.current.openEditor();
			});

			expect(result.current.modalTitle).toBe('Improve prompt with AI');
		});

		it('returns review title when step is review', async () => {
			mockMutateAsync.mockResolvedValueOnce({ content: 'Generated content' });

			const { result } = renderHook(
				() =>
					usePromptAiActions({
						prompt: 'Content',
						typeName: 'Greeting',
						onApply: mockOnApply,
					}),
				{ wrapper: createWrapper() }
			);

			act(() => {
				result.current.openEditor();
			});

			await act(async () => {
				await result.current.handleGenerate();
			});

			await waitFor(() => {
				expect(result.current.modalTitle).toBe('Review AI suggestions');
			});
		});
	});

	describe('openEditor', () => {
		it('opens editor and sets create mode when no content', () => {
			const { result } = renderHook(
				() =>
					usePromptAiActions({
						prompt: '',
						typeName: 'Greeting',
						onApply: mockOnApply,
					}),
				{ wrapper: createWrapper() }
			);

			act(() => {
				result.current.openEditor();
			});

			expect(result.current.editorOpen).toBe(true);
			expect(result.current.mode).toBe('create');
			expect(result.current.step).toBe('compose');
		});

		it('opens editor and sets improve mode when content exists', () => {
			const { result } = renderHook(
				() =>
					usePromptAiActions({
						prompt: 'Existing content',
						typeName: 'Greeting',
						onApply: mockOnApply,
					}),
				{ wrapper: createWrapper() }
			);

			act(() => {
				result.current.openEditor();
			});

			expect(result.current.editorOpen).toBe(true);
			expect(result.current.mode).toBe('improve');
			expect(result.current.promptToImprove).toBe('Existing content');
		});

		it('resets all state when opening editor', () => {
			const { result } = renderHook(
				() =>
					usePromptAiActions({
						prompt: '',
						typeName: 'Greeting',
						onApply: mockOnApply,
					}),
				{ wrapper: createWrapper() }
			);

			act(() => {
				result.current.openEditor();
				result.current.setUserInstructions('Some instructions');
			});

			expect(result.current.userInstructions).toBe('Some instructions');

			act(() => {
				result.current.handleCloseModal();
				result.current.openEditor();
			});

			expect(result.current.userInstructions).toBe('');
		});

		it('sets system prompt based on mode', () => {
			const { result } = renderHook(
				() =>
					usePromptAiActions({
						prompt: '',
						typeName: 'CustomType',
						onApply: mockOnApply,
					}),
				{ wrapper: createWrapper() }
			);

			act(() => {
				result.current.openEditor();
			});

			expect(result.current.systemPromptContent).toContain('CustomType');
		});
	});

	describe('handleCloseModal', () => {
		it('closes the modal', () => {
			const { result } = renderHook(
				() =>
					usePromptAiActions({
						prompt: '',
						typeName: 'Greeting',
						onApply: mockOnApply,
					}),
				{ wrapper: createWrapper() }
			);

			act(() => {
				result.current.openEditor();
			});

			expect(result.current.editorOpen).toBe(true);

			act(() => {
				result.current.handleCloseModal();
			});

			expect(result.current.editorOpen).toBe(false);
		});

		it('resets step to compose', () => {
			const { result } = renderHook(
				() =>
					usePromptAiActions({
						prompt: '',
						typeName: 'Greeting',
						onApply: mockOnApply,
					}),
				{ wrapper: createWrapper() }
			);

			act(() => {
				result.current.openEditor();
				result.current.handleCloseModal();
			});

			expect(result.current.step).toBe('compose');
		});
	});

	describe('handleGenerate', () => {
		it('shows error for empty prompt', async () => {
			const { result } = renderHook(
				() =>
					usePromptAiActions({
						prompt: '',
						typeName: 'Greeting',
						onApply: mockOnApply,
					}),
				{ wrapper: createWrapper() }
			);

			act(() => {
				result.current.openEditor();
				result.current.setSystemPromptContent('');
			});

			await act(async () => {
				await result.current.handleGenerate();
			});

			expect(result.current.error).toBe(
				'Please provide some instructions for the AI'
			);
			expect(mockMutateAsync).not.toHaveBeenCalled();
		});

		it('calls API with system prompt in create mode', async () => {
			mockMutateAsync.mockResolvedValueOnce({ content: 'Generated' });

			const { result } = renderHook(
				() =>
					usePromptAiActions({
						prompt: '',
						typeName: 'Greeting',
						onApply: mockOnApply,
					}),
				{ wrapper: createWrapper() }
			);

			act(() => {
				result.current.openEditor();
				result.current.setUserInstructions('Make it friendly');
			});

			await act(async () => {
				await result.current.handleGenerate();
			});

			expect(mockMutateAsync).toHaveBeenCalledWith(
				expect.objectContaining({
					prompt: expect.stringContaining('Make it friendly'),
				})
			);
		});

		it('includes prompt to improve in improve mode', async () => {
			mockMutateAsync.mockResolvedValueOnce({ content: 'Improved' });

			const { result } = renderHook(
				() =>
					usePromptAiActions({
						prompt: 'Original content',
						typeName: 'Greeting',
						onApply: mockOnApply,
					}),
				{ wrapper: createWrapper() }
			);

			act(() => {
				result.current.openEditor();
			});

			await act(async () => {
				await result.current.handleGenerate();
			});

			expect(mockMutateAsync).toHaveBeenCalledWith(
				expect.objectContaining({
					prompt: expect.stringContaining('Original content'),
				})
			);
		});

		it('calls onApply directly in create mode on success', async () => {
			mockMutateAsync.mockResolvedValueOnce({ content: 'New content' });

			const { result } = renderHook(
				() =>
					usePromptAiActions({
						prompt: '',
						typeName: 'Greeting',
						onApply: mockOnApply,
					}),
				{ wrapper: createWrapper() }
			);

			act(() => {
				result.current.openEditor();
			});

			await act(async () => {
				await result.current.handleGenerate();
			});

			expect(mockOnApply).toHaveBeenCalledWith('New content');
			expect(result.current.editorOpen).toBe(false);
		});

		it('transitions to review step in improve mode on success', async () => {
			mockMutateAsync.mockResolvedValueOnce({ content: 'Improved content' });

			const { result } = renderHook(
				() =>
					usePromptAiActions({
						prompt: 'Original',
						typeName: 'Greeting',
						onApply: mockOnApply,
					}),
				{ wrapper: createWrapper() }
			);

			act(() => {
				result.current.openEditor();
			});

			await act(async () => {
				await result.current.handleGenerate();
			});

			expect(result.current.step).toBe('review');
			expect(result.current.generatedContent).toBe('Improved content');
			expect(mockOnApply).not.toHaveBeenCalled();
		});

		it('handles API error gracefully', async () => {
			mockMutateAsync.mockRejectedValueOnce(new Error('API Error'));

			const { result } = renderHook(
				() =>
					usePromptAiActions({
						prompt: '',
						typeName: 'Greeting',
						onApply: mockOnApply,
					}),
				{ wrapper: createWrapper() }
			);

			act(() => {
				result.current.openEditor();
			});

			await act(async () => {
				await result.current.handleGenerate();
			});

			expect(mockOnApply).not.toHaveBeenCalled();
			expect(result.current.editorOpen).toBe(true);
		});

		it('handles empty API response', async () => {
			mockMutateAsync.mockResolvedValueOnce({ content: null });

			const { result } = renderHook(
				() =>
					usePromptAiActions({
						prompt: '',
						typeName: 'Greeting',
						onApply: mockOnApply,
					}),
				{ wrapper: createWrapper() }
			);

			act(() => {
				result.current.openEditor();
			});

			await act(async () => {
				await result.current.handleGenerate();
			});

			expect(mockOnApply).not.toHaveBeenCalled();
		});
	});

	describe('handleApplyChanges', () => {
		it('applies generated content and closes modal', async () => {
			mockMutateAsync.mockResolvedValueOnce({ content: 'Improved content' });

			const { result } = renderHook(
				() =>
					usePromptAiActions({
						prompt: 'Original',
						typeName: 'Greeting',
						onApply: mockOnApply,
					}),
				{ wrapper: createWrapper() }
			);

			act(() => {
				result.current.openEditor();
			});

			await act(async () => {
				await result.current.handleGenerate();
			});

			act(() => {
				result.current.handleApplyChanges();
			});

			expect(mockOnApply).toHaveBeenCalledWith('Improved content');
			expect(result.current.editorOpen).toBe(false);
		});

		it('does nothing if no generated content', () => {
			const { result } = renderHook(
				() =>
					usePromptAiActions({
						prompt: '',
						typeName: 'Greeting',
						onApply: mockOnApply,
					}),
				{ wrapper: createWrapper() }
			);

			act(() => {
				result.current.openEditor();
				result.current.handleApplyChanges();
			});

			expect(mockOnApply).not.toHaveBeenCalled();
		});
	});

	describe('handleReject', () => {
		it('goes back to compose step', async () => {
			mockMutateAsync.mockResolvedValueOnce({ content: 'Content' });

			const { result } = renderHook(
				() =>
					usePromptAiActions({
						prompt: 'Original',
						typeName: 'Greeting',
						onApply: mockOnApply,
					}),
				{ wrapper: createWrapper() }
			);

			act(() => {
				result.current.openEditor();
			});

			await act(async () => {
				await result.current.handleGenerate();
			});

			expect(result.current.step).toBe('review');

			act(() => {
				result.current.handleReject();
			});

			expect(result.current.step).toBe('compose');
			expect(result.current.generatedContent).toBeNull();
		});
	});

	describe('System Prompt Management', () => {
		it('allows setting system prompt content', () => {
			const { result } = renderHook(
				() =>
					usePromptAiActions({
						prompt: '',
						typeName: 'Greeting',
						onApply: mockOnApply,
					}),
				{ wrapper: createWrapper() }
			);

			act(() => {
				result.current.openEditor();
				result.current.setSystemPromptContent('Custom system prompt');
			});

			expect(result.current.systemPromptContent).toBe('Custom system prompt');
		});

		it('allows toggling system prompt expanded state', () => {
			const { result } = renderHook(
				() =>
					usePromptAiActions({
						prompt: '',
						typeName: 'Greeting',
						onApply: mockOnApply,
					}),
				{ wrapper: createWrapper() }
			);

			act(() => {
				result.current.openEditor();
			});

			expect(result.current.systemPromptExpanded).toBe(false);

			act(() => {
				result.current.setSystemPromptExpanded(true);
			});

			expect(result.current.systemPromptExpanded).toBe(true);
		});

		it('allows toggling system prompt editing state', () => {
			const { result } = renderHook(
				() =>
					usePromptAiActions({
						prompt: '',
						typeName: 'Greeting',
						onApply: mockOnApply,
					}),
				{ wrapper: createWrapper() }
			);

			act(() => {
				result.current.openEditor();
				result.current.setSystemPromptEditing(true);
			});

			expect(result.current.systemPromptEditing).toBe(true);
		});

		it('resets system prompt to base value', () => {
			const { result } = renderHook(
				() =>
					usePromptAiActions({
						prompt: '',
						typeName: 'CustomType',
						onApply: mockOnApply,
					}),
				{ wrapper: createWrapper() }
			);

			act(() => {
				result.current.openEditor();
				result.current.setSystemPromptContent('Modified content');
			});

			expect(result.current.systemPromptContent).toBe('Modified content');

			act(() => {
				result.current.resetSystemPrompt();
			});

			expect(result.current.systemPromptContent).toContain('CustomType');
			expect(result.current.systemPromptEditing).toBe(false);
		});
	});

	describe('User Instructions', () => {
		it('allows setting user instructions', () => {
			const { result } = renderHook(
				() =>
					usePromptAiActions({
						prompt: '',
						typeName: 'Greeting',
						onApply: mockOnApply,
					}),
				{ wrapper: createWrapper() }
			);

			act(() => {
				result.current.openEditor();
				result.current.setUserInstructions('Make it formal');
			});

			expect(result.current.userInstructions).toBe('Make it formal');
		});
	});

	describe('Prompt to Improve', () => {
		it('allows editing prompt to improve', () => {
			const { result } = renderHook(
				() =>
					usePromptAiActions({
						prompt: 'Original',
						typeName: 'Greeting',
						onApply: mockOnApply,
					}),
				{ wrapper: createWrapper() }
			);

			act(() => {
				result.current.openEditor();
				result.current.setPromptToImprove('Modified original');
			});

			expect(result.current.promptToImprove).toBe('Modified original');
		});
	});

	describe('Diff Data', () => {
		it('returns null diff data when not in review or no generated content', () => {
			const { result } = renderHook(
				() =>
					usePromptAiActions({
						prompt: 'Original',
						typeName: 'Greeting',
						onApply: mockOnApply,
					}),
				{ wrapper: createWrapper() }
			);

			act(() => {
				result.current.openEditor();
			});

			expect(result.current.diffData).toBeNull();
		});

		it('generates diff data in improve mode with generated content', async () => {
			mockMutateAsync.mockResolvedValueOnce({ content: 'Improved content' });

			const { result } = renderHook(
				() =>
					usePromptAiActions({
						prompt: 'Original content',
						typeName: 'Greeting',
						onApply: mockOnApply,
					}),
				{ wrapper: createWrapper() }
			);

			act(() => {
				result.current.openEditor();
			});

			await act(async () => {
				await result.current.handleGenerate();
			});

			expect(result.current.diffData).not.toBeNull();
			expect(result.current.diffData?.hasChanges).toBe(true);
		});
	});

	describe('isPending', () => {
		it('reflects pending state from mutation', () => {
			mockIsPending = true;

			const { result } = renderHook(
				() =>
					usePromptAiActions({
						prompt: '',
						typeName: 'Greeting',
						onApply: mockOnApply,
					}),
				{ wrapper: createWrapper() }
			);

			expect(result.current.isPending).toBe(true);
		});
	});
});
