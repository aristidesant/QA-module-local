import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import CampaignConfigurationKnowledgeBase from './CampaignConfigurationKnowledgeBase';

const mockSetFieldValue = vi.fn();
const mockUseKnowledgeBases = vi.fn();
const mockUseKnowledgeBasesByIds = vi.fn();
const mockFormValues = vi.fn();

vi.mock('~/modules/campaigns/campaignFormFunctions', () => ({
	useCampaignFormContext: () => ({
		values: mockFormValues(),
		setFieldValue: mockSetFieldValue,
	}),
}));

vi.mock('~/queries/knowledgeBaseQueries', () => ({
	useKnowledgeBases: (...args: unknown[]) => mockUseKnowledgeBases(...args),
	useKnowledgeBasesByIds: (...args: unknown[]) =>
		mockUseKnowledgeBasesByIds(...args),
}));

vi.mock('@mantine/core', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@mantine/core')>();
	return {
		...actual,
		Loader: () => <div data-testid='loader' />,
		ThemeIcon: ({ children }: { children: React.ReactNode }) => (
			<div>{children}</div>
		),
		Badge: ({ children }: { children: React.ReactNode }) => (
			<div>{children}</div>
		),
		ActionIcon: ({
			onClick,
			'aria-label': ariaLabel,
			children,
		}: {
			onClick?: () => void;
			'aria-label'?: string;
			children: React.ReactNode;
		}) => (
			<button aria-label={ariaLabel} onClick={onClick}>
				{children}
			</button>
		),
		Tooltip: ({ children }: { children: React.ReactNode }) => (
			<div>{children}</div>
		),
		Text: ({ children }: { children: React.ReactNode }) => (
			<div>{children}</div>
		),
	};
});

vi.mock('~/components/SectionCard', () => ({
	default: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
}));

const mockModalOnSave = vi.fn();
const mockModalOnClose = vi.fn();

vi.mock('./CampaignConfigurationKnowledgeBaseAddModal', () => ({
	default: ({
		opened,
		onClose,
		onSave,
	}: {
		opened: boolean;
		onClose: () => void;
		onSave: (ids: number[]) => void;
		selectedIds: number[];
		allKnowledgeBases: unknown[];
	}) => {
		mockModalOnSave.mockImplementation(onSave);
		mockModalOnClose.mockImplementation(onClose);
		return opened ? (
			<div data-testid='knowledge-base-modal'>
				<button onClick={() => onSave([1, 2])}>Save Selections</button>
				<button onClick={onClose}>Close Modal</button>
			</div>
		) : null;
	},
}));

describe('CampaignConfigurationKnowledgeBase', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockFormValues.mockReturnValue({
			agentConfig: {
				knowledgeBaseIds: [], // Root (Legacy/Backend)
				conversationConfig: {
					agent: {
						prompt: {
							knowledgeBase: [1], // Deep (Wizard/Standard)
						},
					},
				},
			},
		});
		mockUseKnowledgeBasesByIds.mockReturnValue([]);
	});

	describe('Loading State', () => {
		it('shows loading state when knowledge bases are loading', () => {
			mockUseKnowledgeBases.mockReturnValue({
				data: undefined,
				isLoading: true,
				error: null,
			});

			renderWithProviders(<CampaignConfigurationKnowledgeBase />);

			expect(screen.getByTestId('loader')).toBeInTheDocument();
			expect(screen.getByText(/Loading knowledge bases/i)).toBeVisible();
		});
	});

	describe('Error State', () => {
		it('shows error message when loading knowledge bases fails', () => {
			mockUseKnowledgeBases.mockReturnValue({
				data: undefined,
				isLoading: false,
				error: new Error('Failed to load'),
			});

			renderWithProviders(<CampaignConfigurationKnowledgeBase />);

			expect(screen.getByText(/Error loading knowledge bases/i)).toBeVisible();
		});
	});

	describe('Empty State', () => {
		it('shows empty state when no knowledge bases are selected', () => {
			mockFormValues.mockReturnValue({
				agentConfig: {
					knowledgeBaseIds: [],
					conversationConfig: {
						agent: {
							prompt: {
								knowledgeBase: [],
							},
						},
					},
				},
			});
			mockUseKnowledgeBases.mockReturnValue({
				data: [
					{ id: 1, name: 'KB One', status: 'active', createdAt: '2024-01-01' },
				],
				isLoading: false,
				error: null,
			});

			renderWithProviders(<CampaignConfigurationKnowledgeBase />);

			expect(screen.getByText(/No knowledge bases selected/i)).toBeVisible();
		});

		it('handles undefined knowledgeBaseIds gracefully', () => {
			mockFormValues.mockReturnValue({
				agentConfig: {},
			});
			mockUseKnowledgeBases.mockReturnValue({
				data: [],
				isLoading: false,
				error: null,
			});

			renderWithProviders(<CampaignConfigurationKnowledgeBase />);

			expect(screen.getByText(/No knowledge bases selected/i)).toBeVisible();
		});

		it('handles undefined agentConfig gracefully', () => {
			mockFormValues.mockReturnValue({});
			mockUseKnowledgeBases.mockReturnValue({
				data: [],
				isLoading: false,
				error: null,
			});

			renderWithProviders(<CampaignConfigurationKnowledgeBase />);

			expect(screen.getByText(/No knowledge bases selected/i)).toBeVisible();
		});
	});

	describe('Knowledge Base Display', () => {
		it('renders selected knowledge bases from DEEP path', () => {
			mockFormValues.mockReturnValue({
				agentConfig: {
					knowledgeBaseIds: [],
					conversationConfig: {
						agent: {
							prompt: {
								knowledgeBase: [1],
							},
						},
					},
				},
			});
			mockUseKnowledgeBases.mockReturnValue({
				data: [
					{
						id: 1,
						name: 'KB One',
						status: 'active',
						createdAt: '2024-01-01',
					},
				],
				isLoading: false,
				error: null,
			});

			renderWithProviders(<CampaignConfigurationKnowledgeBase />);
			expect(screen.getByText('KB One')).toBeVisible();
		});

		it('renders selected knowledge bases from ROOT path (legacy/backend)', () => {
			mockFormValues.mockReturnValue({
				agentConfig: {
					knowledgeBaseIds: [2],
					conversationConfig: {
						agent: {
							prompt: {
								knowledgeBase: [],
							},
						},
					},
				},
			});
			mockUseKnowledgeBases.mockReturnValue({
				data: [
					{
						id: 2,
						name: 'KB Two',
						status: 'active',
					},
				],
				isLoading: false,
				error: null,
			});

			renderWithProviders(<CampaignConfigurationKnowledgeBase />);
			expect(screen.getByText('KB Two')).toBeVisible();
		});

		it('merges IDs from both paths', () => {
			mockFormValues.mockReturnValue({
				agentConfig: {
					knowledgeBaseIds: [2],
					conversationConfig: {
						agent: {
							prompt: {
								knowledgeBase: [1],
							},
						},
					},
				},
			});
			mockUseKnowledgeBases.mockReturnValue({
				data: [
					{ id: 1, name: 'KB One', status: 'active' },
					{ id: 2, name: 'KB Two', status: 'active' },
				],
				isLoading: false,
				error: null,
			});

			renderWithProviders(<CampaignConfigurationKnowledgeBase />);
			expect(screen.getByText('KB One')).toBeVisible();
			expect(screen.getByText('KB Two')).toBeVisible();
		});

		it('displays status badges for each knowledge base', () => {
			mockUseKnowledgeBases.mockReturnValue({
				data: [
					{ id: 1, name: 'KB One', status: 'active', createdAt: '2024-01-01' },
				],
				isLoading: false,
				error: null,
			});

			renderWithProviders(<CampaignConfigurationKnowledgeBase />);

			expect(screen.getByText('active')).toBeVisible();
		});

		it('displays created date when available', () => {
			mockUseKnowledgeBases.mockReturnValue({
				data: [
					{ id: 1, name: 'KB One', status: 'active', createdAt: '2024-01-15' },
				],
				isLoading: false,
				error: null,
			});

			renderWithProviders(<CampaignConfigurationKnowledgeBase />);

			expect(screen.getByText(/Created:/i)).toBeVisible();
		});

		it('handles knowledge base without createdAt date', () => {
			mockUseKnowledgeBases.mockReturnValue({
				data: [{ id: 1, name: 'KB One', status: 'active' }],
				isLoading: false,
				error: null,
			});

			renderWithProviders(<CampaignConfigurationKnowledgeBase />);

			expect(screen.getByText('KB One')).toBeVisible();
			expect(screen.queryByText(/Created:/i)).not.toBeInTheDocument();
		});
	});

	describe('Removing Knowledge Bases', () => {
		it('removes specific knowledge base and updates BOTH paths', () => {
			mockFormValues.mockReturnValue({
				agentConfig: {
					knowledgeBaseIds: [1, 2, 3],
					conversationConfig: {
						agent: {
							prompt: {
								knowledgeBase: [1, 2, 3],
							},
						},
					},
				},
			});
			mockUseKnowledgeBases.mockReturnValue({
				data: [
					{ id: 1, name: 'KB One', status: 'active', createdAt: '2024-01-01' },
					{ id: 2, name: 'KB Two', status: 'active', createdAt: '2024-02-01' },
					{
						id: 3,
						name: 'KB Three',
						status: 'active',
						createdAt: '2024-03-01',
					},
				],
				isLoading: false,
				error: null,
			});

			renderWithProviders(<CampaignConfigurationKnowledgeBase />);

			fireEvent.click(screen.getByRole('button', { name: /Remove KB Two/i }));

			// Check update to Deep Path
			expect(mockSetFieldValue).toHaveBeenCalledWith(
				'agentConfig.conversationConfig.agent.prompt.knowledgeBase',
				[1, 3]
			);
			// Check update to Root Path
			expect(mockSetFieldValue).toHaveBeenCalledWith(
				'agentConfig.knowledgeBaseIds',
				[1, 3]
			);
		});
	});

	describe('Add Knowledge Base Modal', () => {
		it('opens modal when add button is clicked', () => {
			mockUseKnowledgeBases.mockReturnValue({
				data: [],
				isLoading: false,
				error: null,
			});

			renderWithProviders(<CampaignConfigurationKnowledgeBase />);

			expect(
				screen.queryByTestId('knowledge-base-modal')
			).not.toBeInTheDocument();

			fireEvent.click(
				screen.getByRole('button', { name: /Add Knowledge Base/i })
			);

			expect(screen.getByTestId('knowledge-base-modal')).toBeVisible();
		});

		it('closes modal when close is triggered', () => {
			mockUseKnowledgeBases.mockReturnValue({
				data: [],
				isLoading: false,
				error: null,
			});

			renderWithProviders(<CampaignConfigurationKnowledgeBase />);

			fireEvent.click(
				screen.getByRole('button', { name: /Add Knowledge Base/i })
			);
			expect(screen.getByTestId('knowledge-base-modal')).toBeVisible();

			fireEvent.click(screen.getByRole('button', { name: /Close Modal/i }));
			expect(
				screen.queryByTestId('knowledge-base-modal')
			).not.toBeInTheDocument();
		});

		it('saves new selections to BOTH paths and closes modal when save is triggered', () => {
			mockFormValues.mockReturnValue({
				agentConfig: {
					knowledgeBaseIds: [],
					conversationConfig: {
						agent: {
							prompt: {
								knowledgeBase: [],
							},
						},
					},
				},
			});
			mockUseKnowledgeBases.mockReturnValue({
				data: [
					{ id: 1, name: 'KB One', status: 'active', createdAt: '2024-01-01' },
					{ id: 2, name: 'KB Two', status: 'active', createdAt: '2024-02-01' },
				],
				isLoading: false,
				error: null,
			});

			renderWithProviders(<CampaignConfigurationKnowledgeBase />);

			fireEvent.click(
				screen.getByRole('button', { name: /Add Knowledge Base/i })
			);
			fireEvent.click(screen.getByRole('button', { name: /Save Selections/i }));

			// Deep Path
			expect(mockSetFieldValue).toHaveBeenCalledWith(
				'agentConfig.conversationConfig.agent.prompt.knowledgeBase',
				[1, 2]
			);
			// Root Path
			expect(mockSetFieldValue).toHaveBeenCalledWith(
				'agentConfig.knowledgeBaseIds',
				[1, 2]
			);
			expect(
				screen.queryByTestId('knowledge-base-modal')
			).not.toBeInTheDocument();
		});
	});

	describe('Status Colors', () => {
		it.each([
			['active', 'KB Active'],
			['pending', 'KB Pending'],
			['failed', 'KB Failed'],
			['unknown', 'KB Unknown'],
		])('renders knowledge base with %s status', (status, name) => {
			mockFormValues.mockReturnValue({
				agentConfig: {
					conversationConfig: {
						agent: {
							prompt: {
								knowledgeBase: [1],
							},
						},
					},
				},
			});
			mockUseKnowledgeBases.mockReturnValue({
				data: [{ id: 1, name, status, createdAt: '2024-01-01' }],
				isLoading: false,
				error: null,
			});

			renderWithProviders(<CampaignConfigurationKnowledgeBase />);

			expect(screen.getByText(name)).toBeVisible();
			expect(screen.getByText(status)).toBeVisible();
		});
	});
});
