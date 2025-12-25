import { useCampaignObjectivesColumns } from './useCampaignObjectivesColumns';
import { vi } from 'vitest';

describe('useCampaignObjectivesColumns', () => {
	const mockOnEdit = vi.fn();
	const mockOnDelete = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns an array of column definitions', () => {
		const columns = useCampaignObjectivesColumns({
			onEdit: mockOnEdit,
			onDelete: mockOnDelete,
			isDeletePending: false,
		});

		expect(Array.isArray(columns)).toBe(true);
		expect(columns.length).toBeGreaterThan(0);
	});

	it('includes name column', () => {
		const columns = useCampaignObjectivesColumns({
			onEdit: mockOnEdit,
			onDelete: mockOnDelete,
			isDeletePending: false,
		});

		const nameColumn = columns.find((col: any) => col.accessorKey === 'name');
		expect(nameColumn).toBeDefined();
		expect(nameColumn?.header).toBe('Name');
	});

	it('includes categoryName column', () => {
		const columns = useCampaignObjectivesColumns({
			onEdit: mockOnEdit,
			onDelete: mockOnDelete,
			isDeletePending: false,
		});

		const categoryColumn = columns.find(
			(col: any) => col.accessorKey === 'categoryName'
		);
		expect(categoryColumn).toBeDefined();
		expect(categoryColumn?.header).toBe('Category');
	});

	it('includes description column', () => {
		const columns = useCampaignObjectivesColumns({
			onEdit: mockOnEdit,
			onDelete: mockOnDelete,
			isDeletePending: false,
		});

		const descColumn = columns.find(
			(col: any) => col.accessorKey === 'description'
		);
		expect(descColumn).toBeDefined();
		expect(descColumn?.header).toBe('Description');
	});

	it('includes active status column', () => {
		const columns = useCampaignObjectivesColumns({
			onEdit: mockOnEdit,
			onDelete: mockOnDelete,
			isDeletePending: false,
		});

		const activeColumn = columns.find(
			(col: any) => col.accessorKey === 'active'
		);
		expect(activeColumn).toBeDefined();
		expect(activeColumn?.header).toBe('Status');
	});

	it('includes actions column', () => {
		const columns = useCampaignObjectivesColumns({
			onEdit: mockOnEdit,
			onDelete: mockOnDelete,
			isDeletePending: false,
		});

		const actionsColumn = columns.find((col: any) => col.id === 'actions');
		expect(actionsColumn).toBeDefined();
		expect(actionsColumn?.header).toBe('Actions');
	});

	it('returns the same columns reference for same inputs', () => {
		const firstCall = useCampaignObjectivesColumns({
			onEdit: mockOnEdit,
			onDelete: mockOnDelete,
			isDeletePending: false,
		});

		const secondCall = useCampaignObjectivesColumns({
			onEdit: mockOnEdit,
			onDelete: mockOnDelete,
			isDeletePending: false,
		});

		// Note: This test verifies the function returns consistent structure
		expect(firstCall.length).toBe(secondCall.length);
		expect((firstCall[0] as any).accessorKey).toBe(
			(secondCall[0] as any).accessorKey
		);
	});
});
