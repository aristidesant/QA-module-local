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
import useKnowledgeBaseSelectionColumns from './useKnowledgeBaseSelectionColumns';
import { useKnowledgeBaseModalStore } from '~/stores/knowledgeBaseModalStore';

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

describe('CampaignConfigurationKnowledgeBaseAddModal', () => {
	const defaultProps = {
		opened: true,
		onClose: vi.fn(),
		selectedIds: [] as number[],
		onSave: vi.fn(),
		allKnowledgeBases: mockKnowledgeBases,
	};

	beforeEach(() => {
		vi.clearAllMocks();
		useKnowledgeBaseModalStore.getState().reset();
	});

	afterEach(() => {
		useKnowledgeBaseModalStore.getState().reset();
	});

	describe('Rendering', () => {
		it('renders modal with title and subtitle', () => {
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal {...defaultProps} />
			);

			expect(screen.getByText('Select Knowledge Bases')).toBeInTheDocument();
			expect(
				screen.getByText(
					/Pick the knowledge bases that should power this agent/
				)
			).toBeInTheDocument();
		});

		it('renders search input and type filter', () => {
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal {...defaultProps} />
			);

			expect(
				screen.getByPlaceholderText('Search by name or description')
			).toBeInTheDocument();
			expect(screen.getByPlaceholderText('Filter by type')).toBeInTheDocument();
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

		it('renders empty message when no knowledge bases available', () => {
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal
					{...defaultProps}
					allKnowledgeBases={[]}
				/>
			);

			expect(
				screen.getByText('No knowledge bases available')
			).toBeInTheDocument();
		});

		it('renders helper note', () => {
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal {...defaultProps} />
			);

			expect(screen.getByText(/Need to narrow the list\?/)).toBeInTheDocument();
		});
	});

	describe('Search Functionality', () => {
		it('filters knowledge bases by name', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal {...defaultProps} />
			);

			const searchInput = screen.getByPlaceholderText(
				'Search by name or description'
			);
			await user.type(searchInput, 'Product');

			expect(screen.getByText('Product Documentation')).toBeInTheDocument();
			expect(screen.queryByText('FAQ Website')).not.toBeInTheDocument();
			expect(screen.queryByText('Company Policy')).not.toBeInTheDocument();
		});

		it('filters knowledge bases by description', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal {...defaultProps} />
			);

			const searchInput = screen.getByPlaceholderText(
				'Search by name or description'
			);
			await user.type(searchInput, 'specs');

			expect(screen.getByText('Product Documentation')).toBeInTheDocument();
			expect(screen.queryByText('FAQ Website')).not.toBeInTheDocument();
		});

		it('search is case insensitive', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal {...defaultProps} />
			);

			const searchInput = screen.getByPlaceholderText(
				'Search by name or description'
			);
			await user.type(searchInput, 'PRODUCT');

			expect(screen.getByText('Product Documentation')).toBeInTheDocument();
		});

		it('shows no results when search matches nothing', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal {...defaultProps} />
			);

			const searchInput = screen.getByPlaceholderText(
				'Search by name or description'
			);
			await user.type(searchInput, 'nonexistent');

			expect(
				screen.getByText('No knowledge bases available')
			).toBeInTheDocument();
		});
	});

	describe('Type Filter Functionality', () => {
		it('filters by FILE type', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal {...defaultProps} />
			);

			const typeFilter = screen.getByPlaceholderText('Filter by type');
			await user.click(typeFilter);

			// Select from the dropdown options - use findAllByText since "File" appears in badges too
			const options = await screen.findAllByText('File');
			// The last one should be the dropdown option
			await user.click(options[options.length - 1]);

			await waitFor(() => {
				expect(screen.getByText('Product Documentation')).toBeInTheDocument();
				expect(screen.getByText('Training Materials')).toBeInTheDocument();
				expect(screen.queryByText('FAQ Website')).not.toBeInTheDocument();
				expect(screen.queryByText('Company Policy')).not.toBeInTheDocument();
			});
		});

		it('filters by URL type', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal {...defaultProps} />
			);

			const typeFilter = screen.getByPlaceholderText('Filter by type');
			await user.click(typeFilter);

			// Use findAllByText since "Link" appears in badges too
			const options = await screen.findAllByText('Link');
			await user.click(options[options.length - 1]);

			await waitFor(() => {
				expect(screen.getByText('FAQ Website')).toBeInTheDocument();
				expect(
					screen.queryByText('Product Documentation')
				).not.toBeInTheDocument();
			});
		});

		it('filters by TEXT type', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal {...defaultProps} />
			);

			const typeFilter = screen.getByPlaceholderText('Filter by type');
			await user.click(typeFilter);

			// Use findAllByText since "Text" appears in badges too
			const options = await screen.findAllByText('Text');
			await user.click(options[options.length - 1]);

			await waitFor(() => {
				expect(screen.getByText('Company Policy')).toBeInTheDocument();
				expect(
					screen.queryByText('Product Documentation')
				).not.toBeInTheDocument();
			});
		});

		it('shows all types when All types is selected', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal {...defaultProps} />
			);

			const typeFilter = screen.getByPlaceholderText('Filter by type');
			await user.click(typeFilter);

			// First select File to filter
			let options = await screen.findAllByText('File');
			await user.click(options[options.length - 1]);

			await waitFor(() => {
				expect(screen.queryByText('FAQ Website')).not.toBeInTheDocument();
			});

			// Now select All types
			await user.click(typeFilter);
			const allOptions = await screen.findAllByText('All types');
			await user.click(allOptions[allOptions.length - 1]);

			await waitFor(() => {
				expect(screen.getByText('Product Documentation')).toBeInTheDocument();
				expect(screen.getByText('FAQ Website')).toBeInTheDocument();
				expect(screen.getByText('Company Policy')).toBeInTheDocument();
				expect(screen.getByText('Training Materials')).toBeInTheDocument();
			});
		}, 10000);

		it('combines search and type filter', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal {...defaultProps} />
			);

			const searchInput = screen.getByPlaceholderText(
				'Search by name or description'
			);
			const typeFilter = screen.getByPlaceholderText('Filter by type');

			await user.type(searchInput, 'Product');
			await user.click(typeFilter);

			// Use findAllByText since "File" appears in badges too
			const options = await screen.findAllByText('File');
			await user.click(options[options.length - 1]);

			await waitFor(() => {
				expect(screen.getByText('Product Documentation')).toBeInTheDocument();
				expect(
					screen.queryByText('Training Materials')
				).not.toBeInTheDocument();
			});
		}, 10000);
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

		it('syncs tempSelectedIds when modal opens with selectedIds', () => {
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal
					{...defaultProps}
					selectedIds={[1]}
				/>
			);

			expect(screen.getByText('1 selected')).toBeInTheDocument();
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

			// Should show create form title in modal header
			expect(
				screen.getByRole('heading', { name: 'Create Knowledge Base' })
			).toBeInTheDocument();
			// Should show back button
			expect(
				screen.getByRole('button', { name: /back to list/i })
			).toBeInTheDocument();
		});

		it('shows create form fields in create view', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal {...defaultProps} />
			);

			await user.click(screen.getByRole('button', { name: /create new/i }));

			// Should show form fields from KnowledgeBaseWizardForm
			expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
		});

		it('returns to list view when Back to list button is clicked', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal {...defaultProps} />
			);

			// Go to create view
			await user.click(screen.getByRole('button', { name: /create new/i }));
			expect(
				screen.getByRole('heading', { name: 'Create Knowledge Base' })
			).toBeInTheDocument();

			// Go back to list view
			await user.click(screen.getByRole('button', { name: /back to list/i }));

			// Should show list view again
			expect(screen.getByText('Select Knowledge Bases')).toBeInTheDocument();
			expect(
				screen.getByRole('button', { name: /create new/i })
			).toBeInTheDocument();
		}, 10000);

		it('returns to list view when Cancel is clicked in create form', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal {...defaultProps} />
			);

			// Go to create view
			await user.click(screen.getByRole('button', { name: /create new/i }));

			// Click Cancel in the form
			await user.click(screen.getByRole('button', { name: /^cancel$/i }));

			// Should show list view again
			expect(screen.getByText('Select Knowledge Bases')).toBeInTheDocument();
		}, 10000);

		it('resets store state when modal is closed', () => {
			// Manually set store to create view
			useKnowledgeBaseModalStore.getState().showCreateView();
			expect(useKnowledgeBaseModalStore.getState().view).toBe('create');

			// Render with modal closed (which triggers reset)
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal
					{...defaultProps}
					opened={false}
				/>
			);

			// Store should be reset to list view
			expect(useKnowledgeBaseModalStore.getState().view).toBe('list');
		});

		it('hides list view elements when in create view', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal {...defaultProps} />
			);

			await user.click(screen.getByRole('button', { name: /create new/i }));

			// List view elements should not be present
			expect(
				screen.queryByPlaceholderText('Search by name or description')
			).not.toBeInTheDocument();
			expect(
				screen.queryByPlaceholderText('Filter by type')
			).not.toBeInTheDocument();
			expect(screen.queryByText('0 selected')).not.toBeInTheDocument();
			expect(
				screen.queryByRole('button', { name: /save selections/i })
			).not.toBeInTheDocument();
		});

		it('shows helper note for filters instead of sorting', () => {
			renderWithProviders(
				<CampaignConfigurationKnowledgeBaseAddModal {...defaultProps} />
			);

			expect(
				screen.getByText(/Need to narrow the list\? Use filters or create/)
			).toBeInTheDocument();
		});
	});
});

describe('useKnowledgeBaseSelectionColumns', () => {
	const mockOnToggle = vi.fn();

	const defaultParams = {
		selectedIds: [] as number[],
		onToggle: mockOnToggle,
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	const renderColumnCell = (
		columnId: string,
		kb: KnowledgeBaseModel,
		params = defaultParams
	) => {
		const TestComponent = () => {
			const columns = useKnowledgeBaseSelectionColumns(params);
			const col = columns.find(
				(c) => (c as any).accessorKey === columnId || (c as any).id === columnId
			);
			if (!col) return <div>Column not found</div>;

			// For createdAt column, we need to provide getValue function
			const cellContext =
				columnId === 'createdAt'
					? {
							row: { original: kb },
							getValue: () => kb.createdAt,
						}
					: { row: { original: kb } };

			return <div>{(col as any).cell(cellContext)}</div>;
		};

		return renderWithProviders(<TestComponent />);
	};

	describe('Select Column', () => {
		it('renders checkbox for selection', () => {
			const kb = createMockKnowledgeBase({ id: 1, name: 'Test KB' });
			renderColumnCell('select', kb);

			expect(
				screen.getByRole('checkbox', { name: /select test kb/i })
			).toBeInTheDocument();
		});

		it('checkbox is unchecked when not in selectedIds', () => {
			const kb = createMockKnowledgeBase({ id: 1, name: 'Test KB' });
			renderColumnCell('select', kb, { ...defaultParams, selectedIds: [] });

			expect(
				screen.getByRole('checkbox', { name: /select test kb/i })
			).not.toBeChecked();
		});

		it('checkbox is checked when in selectedIds', () => {
			const kb = createMockKnowledgeBase({ id: 1, name: 'Test KB' });
			renderColumnCell('select', kb, { ...defaultParams, selectedIds: [1] });

			expect(
				screen.getByRole('checkbox', { name: /select test kb/i })
			).toBeChecked();
		});

		it('calls onToggle when checkbox changes', async () => {
			const user = userEvent.setup();
			const onToggle = vi.fn();
			const kb = createMockKnowledgeBase({ id: 1, name: 'Test KB' });
			renderColumnCell('select', kb, { selectedIds: [], onToggle });

			const checkbox = screen.getByRole('checkbox', {
				name: /select test kb/i,
			});
			await user.click(checkbox);

			expect(onToggle).toHaveBeenCalledWith(1, true);
		});
	});

	describe('Name Column', () => {
		it('renders knowledge base name', () => {
			const kb = createMockKnowledgeBase({
				id: 1,
				name: 'My Knowledge Base',
				type: KnowledgeBaseType.FILE,
				status: KnowledgeBaseStatus.ACTIVE,
			});
			renderColumnCell('name', kb);

			expect(screen.getByText('My Knowledge Base')).toBeInTheDocument();
		});

		it('renders type badge for FILE type', () => {
			const kb = createMockKnowledgeBase({
				type: KnowledgeBaseType.FILE,
			});
			renderColumnCell('name', kb);

			expect(screen.getByText('File')).toBeInTheDocument();
		});

		it('renders type badge for URL type', () => {
			const kb = createMockKnowledgeBase({
				type: KnowledgeBaseType.URL,
			});
			renderColumnCell('name', kb);

			expect(screen.getByText('Link')).toBeInTheDocument();
		});

		it('renders type badge for TEXT type', () => {
			const kb = createMockKnowledgeBase({
				type: KnowledgeBaseType.TEXT,
			});
			renderColumnCell('name', kb);

			expect(screen.getByText('Text')).toBeInTheDocument();
		});

		it('renders status badge for ACTIVE status', () => {
			const kb = createMockKnowledgeBase({
				status: KnowledgeBaseStatus.ACTIVE,
			});
			renderColumnCell('name', kb);

			expect(screen.getByText('Active')).toBeInTheDocument();
		});

		it('renders status badge for PENDING status', () => {
			const kb = createMockKnowledgeBase({
				status: KnowledgeBaseStatus.PENDING,
			});
			renderColumnCell('name', kb);

			expect(screen.getByText('Pending')).toBeInTheDocument();
		});

		it('renders status badge for FAILED status', () => {
			const kb = createMockKnowledgeBase({
				status: KnowledgeBaseStatus.FAILED,
			});
			renderColumnCell('name', kb);

			expect(screen.getByText('Failed')).toBeInTheDocument();
		});

		it('renders status badge for INACTIVE status', () => {
			const kb = createMockKnowledgeBase({
				status: KnowledgeBaseStatus.INACTIVE,
			});
			renderColumnCell('name', kb);

			expect(screen.getByText('Inactive')).toBeInTheDocument();
		});

		it('renders status badge for UPLOADING status', () => {
			const kb = createMockKnowledgeBase({
				status: KnowledgeBaseStatus.UPLOADING,
			});
			renderColumnCell('name', kb);

			expect(screen.getByText('Uploading')).toBeInTheDocument();
		});

		it('renders updated date', () => {
			const kb = createMockKnowledgeBase({
				updatedAt: '2024-06-15T10:00:00Z',
			});
			renderColumnCell('name', kb);

			expect(screen.getByText(/Updated Jun 15, 2024/)).toBeInTheDocument();
		});

		it('handles null updatedAt gracefully', () => {
			const kb = createMockKnowledgeBase({
				updatedAt: null as any,
			});
			renderColumnCell('name', kb);

			expect(screen.getByText(/Updated —/)).toBeInTheDocument();
		});
	});

	describe('Created Column', () => {
		it('renders formatted created date', () => {
			const kb = createMockKnowledgeBase({
				createdAt: '2024-03-25T10:00:00Z',
			});
			renderColumnCell('createdAt', kb);

			expect(screen.getByText('Mar 25, 2024')).toBeInTheDocument();
		});
	});
});
