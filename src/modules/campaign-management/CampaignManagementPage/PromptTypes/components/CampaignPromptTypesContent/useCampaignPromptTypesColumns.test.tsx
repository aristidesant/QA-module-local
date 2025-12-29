import { renderHook, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCampaignPromptTypesColumns } from './useCampaignPromptTypesColumns';
import { CampaignPromptTypeModel } from '~/models/CampaignPromptTypeModel';
import { vi } from 'vitest';
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
		const { getByText: getByTextOrder } = renderCell(0, mockData);
		expect(getByTextOrder('1')).toBeInTheDocument();

		// Test Name cell
		const { getByText: getByTextName } = renderCell(1, mockData);
		expect(getByTextName('Test Prompt')).toBeInTheDocument();

		// Test Icon cell
		const { getByText: getByTextIcon } = renderCell(3, mockData);
		expect(getByTextIcon('test-icon')).toBeInTheDocument();

		// Test CreatedAt cell
		const { getByText: getByTextDate } = renderCell(4, mockData);
		// Date formatting might depend on locale, checking if it renders something
		expect(getByTextDate(/2023/)).toBeInTheDocument();
	});

	it('should call onEdit and onDelete when actions are clicked', async () => {
		const { result } = renderHook(
			() =>
				useCampaignPromptTypesColumns({
					onEdit: mockOnEdit,
					onDelete: mockOnDelete,
					isDeletePending,
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
		const { getAllByRole } = render(
			<TestProviders>
				<ActionsCell row={{ original: mockData }} />
			</TestProviders>
		);

		const buttons = getAllByRole('button');
		// Edit button is usually the first one
		await userEvent.click(buttons[0]);
		expect(mockOnEdit).toHaveBeenCalledWith(mockData);

		// Delete button is usually the second one
		await userEvent.click(buttons[1]);
		expect(mockOnDelete).toHaveBeenCalledWith(123);
	});
});
