import { renderHook, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCampaignPromptTypesColumns } from './useCampaignPromptTypesColumns';
import { CampaignPromptTypeModel } from '~/models/CampaignPromptTypeModel';
import { vi, describe, it, expect } from 'vitest';
import { TestProviders } from '~/test-utils/renderWithProviders';

// Mock the styles to avoid issues with CSS modules in tests if not handled
vi.mock('./CampaignPromptTypesContent.module.css', () => ({
	default: {
		orderValue: 'orderValue',
		typeName: 'typeName',
		iconBadge: 'iconBadge',
		createdAt: 'createdAt',
		actionsGroup: 'actionsGroup',
		actionButton: 'actionButton',
		infoButton: 'infoButton',
		infoDropdown: 'infoDropdown',
		infoRow: 'infoRow',
		infoDescription: 'infoDescription',
	},
}));

describe('useCampaignPromptTypesColumns', () => {
	const mockOnEdit = vi.fn();
	const mockOnDelete = vi.fn();
	const isDeletePending = false;

	const wrapper = ({ children }: { children: React.ReactNode }) => (
		<TestProviders>{children}</TestProviders>
	);

	it('should return the correct columns', () => {
		const { result } = renderHook(
			() =>
				useCampaignPromptTypesColumns({
					onEdit: mockOnEdit,
					onDelete: mockOnDelete,
					isDeletePending,
					canUpdate: true,
					canDelete: true,
				}),
			{ wrapper }
		);

		const columns = result.current;
		expect(columns).toHaveLength(6);
		expect(columns[0].header).toBe('Order');
		expect(columns[1].header).toBe('Name');
		expect(columns[2].header).toBe('Info');
		expect(columns[3].header).toBe('Icon');
		expect(columns[4].header).toBe('Created');
		expect(columns[5].header).toBe('Actions');
	});

	it('should render cell content correctly', () => {
		const { result } = renderHook(
			() =>
				useCampaignPromptTypesColumns({
					onEdit: mockOnEdit,
					onDelete: mockOnDelete,
					isDeletePending,
					canUpdate: true,
					canDelete: true,
				}),
			{ wrapper }
		);

		const columns = result.current;
		const mockData: CampaignPromptTypeModel = {
			id: 1,
			name: 'Test Prompt',
			order: 1,
			icon: 'test-icon',
			description: 'Short description',
			createdAt: '2023-06-15T12:00:00Z',
		};

		// Helper to render a cell
		const renderCell = (
			columnIndex: number,
			rowData: CampaignPromptTypeModel
		) => {
			const Cell = columns[columnIndex].cell as any;
			return render(
				<TestProviders>
					<Cell row={{ original: rowData }} />
				</TestProviders>
			);
		};

		// Test Order cell
		renderCell(0, mockData);
		expect(screen.getByText('1')).toBeInTheDocument();

		// Test Name cell
		renderCell(1, mockData);
		expect(screen.getByText('Test Prompt')).toBeInTheDocument();

		// Test Icon cell
		renderCell(3, mockData);
		expect(screen.getByText('test-icon')).toBeInTheDocument();

		// Test CreatedAt cell
		renderCell(4, mockData);
		expect(screen.getByText(/2023/)).toBeInTheDocument();
	});

	it('should call onEdit and onDelete when actions are clicked and user has permissions', async () => {
		const { result } = renderHook(
			() =>
				useCampaignPromptTypesColumns({
					onEdit: mockOnEdit,
					onDelete: mockOnDelete,
					isDeletePending,
					canUpdate: true,
					canDelete: true,
				}),
			{ wrapper }
		);

		const columns = result.current;
		const mockData: CampaignPromptTypeModel = {
			id: 123,
			name: 'Test Prompt',
			order: 1,
			icon: 'test-icon',
			description: 'Short description',
			createdAt: '2023-01-01T00:00:00Z',
		};

		const ActionsCell = columns[5].cell as any;
		render(
			<TestProviders>
				<ActionsCell row={{ original: mockData }} />
			</TestProviders>
		);

		const buttons = screen.getAllByRole('button');
		// Edit button is usually the first one
		await userEvent.click(buttons[0]);
		expect(mockOnEdit).toHaveBeenCalledWith(mockData);

		// Delete button is usually the second one
		await userEvent.click(buttons[1]);
		expect(mockOnDelete).toHaveBeenCalledWith(123);
	});

	it('should hide action buttons when user lacks permissions', () => {
		const { result } = renderHook(
			() =>
				useCampaignPromptTypesColumns({
					onEdit: mockOnEdit,
					onDelete: mockOnDelete,
					isDeletePending,
					canUpdate: false,
					canDelete: false,
				}),
			{ wrapper }
		);

		const columns = result.current;
		const mockData: CampaignPromptTypeModel = {
			id: 123,
			name: 'Test Prompt',
			order: 1,
			icon: 'test-icon',
			description: 'Short description',
			createdAt: '2023-01-01T00:00:00Z',
		};

		const ActionsCell = columns[5].cell as any;
		render(
			<TestProviders>
				<ActionsCell row={{ original: mockData }} />
			</TestProviders>
		);

		expect(screen.queryByRole('button')).not.toBeInTheDocument();
	});

	it('should only show edit button when user only has UPDATE permission', () => {
		const { result } = renderHook(
			() =>
				useCampaignPromptTypesColumns({
					onEdit: mockOnEdit,
					onDelete: mockOnDelete,
					isDeletePending,
					canUpdate: true,
					canDelete: false,
				}),
			{ wrapper }
		);

		const columns = result.current;
		const mockData: CampaignPromptTypeModel = {
			id: 123,
			name: 'Test Prompt',
			order: 1,
			icon: 'test-icon',
			description: 'Short description',
			createdAt: '2023-01-01T00:00:00Z',
		};

		const ActionsCell = columns[5].cell as any;
		render(
			<TestProviders>
				<ActionsCell row={{ original: mockData }} />
			</TestProviders>
		);

		const buttons = screen.getAllByRole('button');
		expect(buttons).toHaveLength(1);
		// Check if it's the edit button (usually by icon or tooltip label if mocked)
		// For now we just verify count as per logic
	});

	it('should only show delete button when user only has DELETE permission', () => {
		const { result } = renderHook(
			() =>
				useCampaignPromptTypesColumns({
					onEdit: mockOnEdit,
					onDelete: mockOnDelete,
					isDeletePending,
					canUpdate: false,
					canDelete: true,
				}),
			{ wrapper }
		);

		const columns = result.current;
		const mockData: CampaignPromptTypeModel = {
			id: 123,
			name: 'Test Prompt',
			order: 1,
			icon: 'test-icon',
			description: 'Short description',
			createdAt: '2023-01-01T00:00:00Z',
		};

		const ActionsCell = columns[5].cell as any;
		render(
			<TestProviders>
				<ActionsCell row={{ original: mockData }} />
			</TestProviders>
		);

		const buttons = screen.getAllByRole('button');
		expect(buttons).toHaveLength(1);
	});
});
