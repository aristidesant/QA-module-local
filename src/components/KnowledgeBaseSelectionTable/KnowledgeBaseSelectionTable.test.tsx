import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import KnowledgeBaseSelectionTable from './KnowledgeBaseSelectionTable';
import type KnowledgeBaseModel from '~/models/KnowledgeBaseModel';
import {
	KnowledgeBaseType,
	KnowledgeBaseStatus,
} from '~/models/KnowledgeBaseModel';
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
];

// Mock the knowledge base queries
vi.mock('~/queries/knowledgeBaseQueries', async () => {
	const actual = await vi.importActual<typeof knowledgeBaseQueries>(
		'~/queries/knowledgeBaseQueries'
	);
	return {
		...actual,
		useKnowledgeBasesPaginated: vi.fn(() => ({
			data: { data: mockKnowledgeBases, total: mockKnowledgeBases.length },
			isLoading: false,
		})),
	};
});

// Mock useDebouncedValue to avoid act warnings
vi.mock('@mantine/hooks', async () => {
	const actual = await vi.importActual<any>('@mantine/hooks');
	return {
		...actual,
		useDebouncedValue: (value: any) => [value, () => {}],
	};
});

// Removed BaseTable mock to allow real table rendering
// vi.mock('~/components/BaseTable/BaseTable', () => {
//   return {
//     __esModule: true,
//     default: ({ onPaginationChange, children, ..._props }: any) => (
//       <div>
//         <button onClick={() => onPaginationChange?.(1, 10)}>go-page-2</button>
//         <div>{children}</div>
//       </div>
//     ),
//   };
// });

// Mock Mantine components that cause act warnings
vi.mock('@mantine/core', async () => {
	const actual = await vi.importActual<any>('@mantine/core');
	return {
		...actual,
		SegmentedControl: ({ data, value, onChange, ...props }: any) => (
			<div role='radiogroup' {...props}>
				{data.map((item: any) => (
					<button
						key={item.value || item}
						onClick={() => onChange(item.value || item)}
						type='button'
					>
						{item.label || item}
					</button>
				))}
			</div>
		),
		Checkbox: ({ checked, onChange, indeterminate, ...props }: any) => (
			<input
				type='checkbox'
				checked={checked}
				onChange={onChange}
				{...props}
				ref={(input) => {
					if (input) input.indeterminate = !!indeterminate;
				}}
			/>
		),
	};
});

describe('KnowledgeBaseSelectionTable', () => {
	const defaultProps = {
		initialSelectedIds: [] as number[],
		onCancel: vi.fn(),
		onSave: vi.fn(),
		showFooter: true,
	};

	beforeEach(() => {
		vi.clearAllMocks();
		useKnowledgeBaseSelectionStore.getState().reset();
	});

	afterEach(() => {
		useKnowledgeBaseSelectionStore.getState().reset();
	});

	describe('Rendering', () => {
		it('calls paginated hook with default limit/offset', async () => {
			renderWithProviders(<KnowledgeBaseSelectionTable {...defaultProps} />);
			expect(
				knowledgeBaseQueries.useKnowledgeBasesPaginated
			).toHaveBeenCalled();
			const params = vi
				.mocked(knowledgeBaseQueries.useKnowledgeBasesPaginated)
				.mock.calls.at(-1)?.[0] as any;
			expect(params).toEqual(expect.objectContaining({ limit: 10, offset: 0 }));
		});

		it('renders search input and type filter controls', async () => {
			renderWithProviders(<KnowledgeBaseSelectionTable {...defaultProps} />);

			expect(
				await screen.findByPlaceholderText('Search knowledge bases')
			).toBeInTheDocument();
			expect(screen.getByRole('radiogroup')).toBeInTheDocument();
		});

		it('renders all knowledge bases in the table', async () => {
			renderWithProviders(<KnowledgeBaseSelectionTable {...defaultProps} />);

			expect(
				await screen.findByText('Product Documentation')
			).toBeInTheDocument();
			expect(screen.getByText('FAQ Website')).toBeInTheDocument();
			expect(screen.getByText('Company Policy')).toBeInTheDocument();
		});

		it('renders type badges for each knowledge base', async () => {
			renderWithProviders(<KnowledgeBaseSelectionTable {...defaultProps} />);

			// Use getAllByText since URL/TEXT appear in both filter controls and badges
			const fileBadges = await screen.findAllByText('FILE');
			const urlElements = screen.getAllByText('URL');
			const textElements = screen.getAllByText(/^TEXT$/);

			// FILE only appears as badge (not in filter)
			expect(fileBadges.length).toBeGreaterThanOrEqual(1);
			// URL appears in filter + badge
			expect(urlElements.length).toBeGreaterThanOrEqual(2);
			// TEXT appears in filter (as "Text") + badge (as "TEXT")
			expect(textElements.length).toBeGreaterThanOrEqual(1);
		});

		it('renders Cancel and Save buttons when showFooter is true', async () => {
			renderWithProviders(<KnowledgeBaseSelectionTable {...defaultProps} />);

			expect(
				await screen.findByRole('button', { name: /cancel/i })
			).toBeInTheDocument();
			expect(
				screen.getByRole('button', { name: /save selections/i })
			).toBeInTheDocument();
		});

		it('does not render footer when showFooter is false', async () => {
			renderWithProviders(
				<KnowledgeBaseSelectionTable {...defaultProps} showFooter={false} />
			);

			expect(
				await screen.queryByRole('button', { name: /cancel/i })
			).not.toBeInTheDocument();
			expect(
				screen.queryByRole('button', { name: /save selections/i })
			).not.toBeInTheDocument();
		});

		it('shows selection count as 0 when nothing selected', async () => {
			renderWithProviders(<KnowledgeBaseSelectionTable {...defaultProps} />);

			expect(await screen.findByText('0 selected')).toBeInTheDocument();
		});

		it('shows correct selection count when items are pre-selected', async () => {
			renderWithProviders(
				<KnowledgeBaseSelectionTable
					{...defaultProps}
					initialSelectedIds={[1, 2]}
				/>
			);

			expect(await screen.findByText('2 selected')).toBeInTheDocument();
		});

		it('renders Create new button when showCreateButton is true', async () => {
			const onCreateNew = vi.fn();
			renderWithProviders(
				<KnowledgeBaseSelectionTable
					{...defaultProps}
					showCreateButton
					onCreateNew={onCreateNew}
				/>
			);

			expect(
				await screen.findByRole('button', { name: /create new/i })
			).toBeInTheDocument();
		});

		it('does not render Create new button when showCreateButton is false', async () => {
			renderWithProviders(<KnowledgeBaseSelectionTable {...defaultProps} />);

			expect(
				screen.queryByRole('button', { name: /create new/i })
			).not.toBeInTheDocument();
		});
	});

	describe('Selection Functionality', () => {
		it('toggles selection when checkbox is clicked', async () => {
			const user = userEvent.setup();
			renderWithProviders(<KnowledgeBaseSelectionTable {...defaultProps} />);

			const checkbox = await screen.findByRole('checkbox', {
				name: /select product documentation/i,
			});
			await user.click(checkbox);

			expect(await screen.findByText('1 selected')).toBeInTheDocument();
		});

		it('toggles selection when row is clicked', async () => {
			const user = userEvent.setup();
			renderWithProviders(<KnowledgeBaseSelectionTable {...defaultProps} />);

			// Get the table body row for Product Documentation
			const rows = await screen.findAllByRole('row');
			// First row is header, second row is first data row
			const dataRow = rows[1];

			await user.click(dataRow);
			expect(await screen.findByText('1 selected')).toBeInTheDocument();
		});

		it('deselects when checkbox is clicked again', async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<KnowledgeBaseSelectionTable
					{...defaultProps}
					initialSelectedIds={[1]}
				/>
			);

			expect(await screen.findByText('1 selected')).toBeInTheDocument();

			const checkbox = await screen.findByRole('checkbox', {
				name: /select product documentation/i,
			});
			await user.click(checkbox);

			expect(await screen.findByText('0 selected')).toBeInTheDocument();
		});

		it('can select multiple items sequentially', async () => {
			const user = userEvent.setup();
			renderWithProviders(<KnowledgeBaseSelectionTable {...defaultProps} />);

			const checkbox1 = await screen.findByRole('checkbox', {
				name: /select product documentation/i,
			});
			await user.click(checkbox1);
			expect(await screen.findByText('1 selected')).toBeInTheDocument();

			const checkbox2 = screen.getByRole('checkbox', {
				name: /select faq website/i,
			});
			await user.click(checkbox2);
			expect(await screen.findByText('2 selected')).toBeInTheDocument();
		});

		it('selects all when header checkbox is clicked', async () => {
			const user = userEvent.setup();
			renderWithProviders(<KnowledgeBaseSelectionTable {...defaultProps} />);

			const headerCheckbox = await screen.findByRole('checkbox', {
				name: /select all/i,
			});
			await user.click(headerCheckbox);
			expect(await screen.findByText('3 selected')).toBeInTheDocument();
		});

		it('pre-selects items based on initialSelectedIds prop', async () => {
			renderWithProviders(
				<KnowledgeBaseSelectionTable
					{...defaultProps}
					initialSelectedIds={[1, 3]}
				/>
			);

			const checkbox1 = await screen.findByRole('checkbox', {
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

	describe('Actions', () => {
		it('calls onCancel when Cancel button is clicked', async () => {
			const user = userEvent.setup();
			const onCancel = vi.fn();
			renderWithProviders(
				<KnowledgeBaseSelectionTable {...defaultProps} onCancel={onCancel} />
			);

			await user.click(screen.getByRole('button', { name: /cancel/i }));

			await waitFor(() => expect(onCancel).toHaveBeenCalledTimes(1));
		});

		it('calls onSave with selected IDs when Save button is clicked', async () => {
			const user = userEvent.setup();
			const onSave = vi.fn();
			renderWithProviders(
				<KnowledgeBaseSelectionTable
					{...defaultProps}
					onSave={onSave}
					initialSelectedIds={[1, 2]}
				/>
			);

			await user.click(
				screen.getByRole('button', { name: /save selections/i })
			);

			await waitFor(() => expect(onSave).toHaveBeenCalledWith([1, 2]));
		});

		it('saves newly selected items', async () => {
			const user = userEvent.setup();
			const onSave = vi.fn();
			renderWithProviders(
				<KnowledgeBaseSelectionTable {...defaultProps} onSave={onSave} />
			);

			const checkbox = await screen.findByRole('checkbox', {
				name: /select product documentation/i,
			});
			await user.click(checkbox);

			await user.click(
				screen.getByRole('button', { name: /save selections/i })
			);

			await waitFor(() => expect(onSave).toHaveBeenCalledWith([1]));
		});

		it('calls onCreateNew when Create new button is clicked', async () => {
			const user = userEvent.setup();
			const onCreateNew = vi.fn();
			renderWithProviders(
				<KnowledgeBaseSelectionTable
					{...defaultProps}
					showCreateButton
					onCreateNew={onCreateNew}
				/>
			);

			await user.click(screen.getByRole('button', { name: /create new/i }));

			await waitFor(() => expect(onCreateNew).toHaveBeenCalledTimes(1));
		});
	});

	describe('Server pagination', () => {
		it('updates offset when changing page', async () => {
			// Ensure pagination shows multiple pages
			vi.mocked(
				knowledgeBaseQueries.useKnowledgeBasesPaginated
			).mockReturnValue({
				data: { data: mockKnowledgeBases, total: 25 },
				isLoading: false,
			} as unknown as ReturnType<
				typeof knowledgeBaseQueries.useKnowledgeBasesPaginated
			>);

			const user = userEvent.setup();
			renderWithProviders(<KnowledgeBaseSelectionTable {...defaultProps} />);

			await user.click(screen.getByRole('button', { name: '2' }));

			await waitFor(() => {
				const params = vi
					.mocked(knowledgeBaseQueries.useKnowledgeBasesPaginated)
					.mock.calls.at(-1)?.[0] as any;
				expect(params).toEqual(
					expect.objectContaining({ limit: 10, offset: 10 })
				);
			});
		});
	});

	describe('Custom Props', () => {
		it('displays custom empty message when no data', async () => {
			vi.mocked(
				knowledgeBaseQueries.useKnowledgeBasesPaginated
			).mockReturnValue({
				data: { data: [], total: 0 },
				isLoading: false,
			} as unknown as ReturnType<
				typeof knowledgeBaseQueries.useKnowledgeBasesPaginated
			>);

			renderWithProviders(
				<KnowledgeBaseSelectionTable
					{...defaultProps}
					emptyMessage='Custom empty message'
				/>
			);

			expect(
				await screen.findByText('Custom empty message')
			).toBeInTheDocument();
		});
	});
});
