import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import CampaignConfigurationKnowledgeBaseAddModal from './CampaignConfigurationKnowledgeBaseAddModal';
import type KnowledgeBaseModel from '~/models/KnowledgeBaseModel';
import {
	KnowledgeBaseType,
	KnowledgeBaseStatus,
} from '~/models/KnowledgeBaseModel';
import { useKnowledgeBaseModalStore } from '~/stores/knowledgeBaseModalStore';
import { useKnowledgeBaseSelectionStore } from '~/stores/knowledgeBaseSelectionStore';
import * as knowledgeBaseQueries from '~/queries/knowledgeBaseQueries';

const createMockKnowledgeBase = (
	overrides: Partial<KnowledgeBaseModel> = {}
): KnowledgeBaseModel => ({
	id: 1,
	name: 'Test Knowledge Base',
	description: 'Test description',
	type: KnowledgeBaseType.FILE,
	status: KnowledgeBaseStatus.ACTIVE,
	clientId: 1,
	userId: 1,
	createdAt: '2024-01-15T10:00:00Z',
	updatedAt: '2024-01-20T10:00:00Z',
	...overrides,
});

const mockKnowledgeBases: KnowledgeBaseModel[] = [
	createMockKnowledgeBase({
		id: 1,
		name: 'Product Documentation',
		description: 'Contains product specs',
		type: KnowledgeBaseType.FILE,
		status: KnowledgeBaseStatus.ACTIVE,
	}),
	createMockKnowledgeBase({
		id: 2,
		name: 'FAQ Website',
		description: 'Frequently asked questions',
		type: KnowledgeBaseType.URL,
		status: KnowledgeBaseStatus.PENDING,
	}),
	createMockKnowledgeBase({
		id: 3,
		name: 'Company Policy',
		description: 'Internal policies',
		type: KnowledgeBaseType.TEXT,
		status: KnowledgeBaseStatus.INACTIVE,
	}),
	createMockKnowledgeBase({
		id: 4,
		name: 'Training Materials',
		description: 'Employee training content',
		type: KnowledgeBaseType.FILE,
		status: KnowledgeBaseStatus.FAILED,
	}),
];

// Mock the knowledge base queries
vi.mock('~/queries/knowledgeBaseQueries', async () => {
	const actual = await vi.importActual<typeof knowledgeBaseQueries>(
		'~/queries/knowledgeBaseQueries'
	);
	return {
		...actual,
		useKnowledgeBases: vi.fn(() => ({
			data: mockKnowledgeBases,
			isLoading: false,
		})),
		useKnowledgeBasesPaginated: vi.fn(() => ({
			data: {
				data: mockKnowledgeBases,
				total: mockKnowledgeBases.length,
				totalPages: 1,
			},
			isLoading: false,
		})),
	};
});

describe('CampaignConfigurationKnowledgeBaseAddModal', () => {
	const defaultProps = {
		opened: true,
		onClose: vi.fn(),
		selectedIds: [] as number[],
		onSave: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
		useKnowledgeBaseModalStore.getState().reset();
		useKnowledgeBaseSelectionStore.getState().reset();
	});

	afterEach(() => {
		useKnowledgeBaseModalStore.getState().reset();
		useKnowledgeBaseSelectionStore.getState().reset();
	});

	describe('Rendering', () => {
		it('renders modal with title and subtitle', () => {
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal {...defaultProps} />
			);

			expect(screen.getByText('Select Knowledge Bases')).toBeInTheDocument();
			expect(
				screen.getByText(/Select existing knowledge bases or create a new one./)
			).toBeInTheDocument();
		});

		it('renders search input and type filter', () => {
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal {...defaultProps} />
			);

			expect(
				screen.getByPlaceholderText('Search knowledge bases')
			).toBeInTheDocument();
			expect(screen.getByRole('radiogroup')).toBeInTheDocument();
		});

		it('renders all knowledge bases in the table', () => {
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal {...defaultProps} />
			);

			expect(screen.getByText('Product Documentation')).toBeInTheDocument();
			expect(screen.getByText('FAQ Website')).toBeInTheDocument();
			expect(screen.getByText('Company Policy')).toBeInTheDocument();
			expect(screen.getByText('Training Materials')).toBeInTheDocument();
		});

		it('renders Cancel and Save buttons', () => {
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal {...defaultProps} />
			);

			expect(
				screen.getByRole('button', { name: /cancel/i })
			).toBeInTheDocument();
			expect(
				screen.getByRole('button', { name: /save selections/i })
			).toBeInTheDocument();
		});

		it('shows selection count as 0 when nothing selected', () => {
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal {...defaultProps} />
			);

			expect(screen.getByText('0 selected')).toBeInTheDocument();
		});

		it('shows correct selection count when items are pre-selected', () => {
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal
					{...defaultProps}
					selectedIds={[1, 2]}
				/>
			);

			expect(screen.getByText('2 selected')).toBeInTheDocument();
		});

		it('does not render when modal is closed', () => {
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal
					{...defaultProps}
					opened={false}
				/>
			);

			expect(
				screen.queryByText('Select Knowledge Bases')
			).not.toBeInTheDocument();
		});

		it('renders type badges for knowledge bases', () => {
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal {...defaultProps} />
			);

			expect(screen.getAllByText('FILE').length).toBeGreaterThan(0);
			expect(screen.getAllByText('URL').length).toBeGreaterThan(0);
			expect(screen.getAllByText('TEXT').length).toBeGreaterThan(0);
		});
	});

	describe('Selection Functionality', () => {
		it('toggles selection when checkbox is clicked', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal {...defaultProps} />
			);

			const checkbox = screen.getByRole('checkbox', {
				name: /select product documentation/i,
			});
			await user.click(checkbox);

			expect(screen.getByText('1 selected')).toBeInTheDocument();
		});

		it('toggles selection when row is clicked', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal {...defaultProps} />
			);

			const row = screen.getByText('Product Documentation').closest('tr');
			if (row) {
				await user.click(row);
			}

			expect(screen.getByText('1 selected')).toBeInTheDocument();
		});

		it('deselects when checkbox is clicked again', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal
					{...defaultProps}
					selectedIds={[1]}
				/>
			);

			expect(screen.getByText('1 selected')).toBeInTheDocument();

			const checkbox = screen.getByRole('checkbox', {
				name: /select product documentation/i,
			});
			await user.click(checkbox);

			expect(screen.getByText('0 selected')).toBeInTheDocument();
		});

		it('can select multiple items sequentially', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal {...defaultProps} />
			);

			const checkbox1 = screen.getByRole('checkbox', {
				name: /select product documentation/i,
			});
			await user.click(checkbox1);

			await waitFor(() => {
				expect(screen.getByText('1 selected')).toBeInTheDocument();
			});

			const checkbox2 = screen.getByRole('checkbox', {
				name: /select faq website/i,
			});
			await user.click(checkbox2);

			await waitFor(() => {
				expect(screen.getByText('2 selected')).toBeInTheDocument();
			});
		});

		it('pre-selects items based on selectedIds prop', () => {
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal
					{...defaultProps}
					selectedIds={[1, 3]}
				/>
			);

			const checkbox1 = screen.getByRole('checkbox', {
				name: /select product documentation/i,
			});
			const checkbox3 = screen.getByRole('checkbox', {
				name: /select company policy/i,
			});

			expect(checkbox1).toBeChecked();
			expect(checkbox3).toBeChecked();
			expect(screen.getByText('2 selected')).toBeInTheDocument();
		});
	});

	describe('Modal Actions', () => {
		it('calls onClose when Cancel button is clicked', async () => {
			const user = userEvent.setup();
			const onClose = vi.fn();
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal
					{...defaultProps}
					onClose={onClose}
				/>
			);

			await user.click(screen.getByRole('button', { name: /cancel/i }));

			expect(onClose).toHaveBeenCalledTimes(1);
		});

		it('calls onSave with selected IDs when Save button is clicked', async () => {
			const user = userEvent.setup();
			const onSave = vi.fn();
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal
					{...defaultProps}
					onSave={onSave}
					selectedIds={[1, 2]}
				/>
			);

			await user.click(
				screen.getByRole('button', { name: /save selections/i })
			);

			expect(onSave).toHaveBeenCalledWith([1, 2]);
		});

		it('saves newly selected items', async () => {
			const user = userEvent.setup();
			const onSave = vi.fn();
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal
					{...defaultProps}
					onSave={onSave}
				/>
			);

			const checkbox = screen.getByRole('checkbox', {
				name: /select product documentation/i,
			});
			await user.click(checkbox);

			await user.click(
				screen.getByRole('button', { name: /save selections/i })
			);

			expect(onSave).toHaveBeenCalledWith([1]);
		});
	});

	describe('Create New Functionality', () => {
		it('renders Create new button in list view', () => {
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal {...defaultProps} />
			);

			expect(
				screen.getByRole('button', { name: /create new/i })
			).toBeInTheDocument();
		});

		it('switches to create view when Create new button is clicked', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal {...defaultProps} />
			);

			await user.click(screen.getByRole('button', { name: /create new/i }));

			expect(
				screen.getByRole('heading', { name: 'Create Knowledge Base' })
			).toBeInTheDocument();
			expect(
				screen.getByRole('button', { name: /back to list/i })
			).toBeInTheDocument();
		});

		it('returns to list view when Back to list button is clicked', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal {...defaultProps} />
			);

			await user.click(screen.getByRole('button', { name: /create new/i }));
			expect(
				screen.getByRole('heading', { name: 'Create Knowledge Base' })
			).toBeInTheDocument();

			await user.click(screen.getByRole('button', { name: /back to list/i }));

			expect(screen.getByText('Select Knowledge Bases')).toBeInTheDocument();
		}, 10000);

		it('resets store state when modal is closed', () => {
			useKnowledgeBaseModalStore.getState().showCreateView();
			expect(useKnowledgeBaseModalStore.getState().view).toBe('create');

			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal
					{...defaultProps}
					opened={false}
				/>
			);

			expect(useKnowledgeBaseModalStore.getState().view).toBe('list');
		});

		it('hides list view elements when in create view', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal {...defaultProps} />
			);

			await user.click(screen.getByRole('button', { name: /create new/i }));

			expect(
				screen.queryByPlaceholderText('Search knowledge bases')
			).not.toBeInTheDocument();
			expect(screen.queryByText('0 selected')).not.toBeInTheDocument();
		});
	});
});
