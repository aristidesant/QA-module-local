import { renderHook, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCampaignPromptTypesColumns } from './useCampaignPromptTypesColumns';
import { CampaignPromptTypeModel } from '~/models/CampaignPromptTypeModel';
import { MantineProvider } from '@mantine/core';
import { vi } from 'vitest';

// Mock the styles to avoid issues with CSS modules in tests if not handled
vi.mock('./CampaignPromptTypesContent.module.css', () => ({
	default: {
		orderValue: 'orderValue',
		typeName: 'typeName',
		iconBadge: 'iconBadge',
		createdAt: 'createdAt',
		actionsGroup: 'actionsGroup',
		actionButton: 'actionButton',
	},
}));

describe('useCampaignPromptTypesColumns', () => {
	const mockOnEdit = vi.fn();
	const mockOnDelete = vi.fn();
	const isDeletePending = false;

	const wrapper = ({ children }: { children: React.ReactNode }) => (
		<MantineProvider>{children}</MantineProvider>
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
		expect(columns).toHaveLength(5);
		expect(columns[0].header).toBe('Order');
		expect(columns[1].header).toBe('Name');
		expect(columns[2].header).toBe('Icon');
		expect(columns[3].header).toBe('Created');
		expect(columns[4].header).toBe('Actions');
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
			createdAt: '2023-06-15T12:00:00Z',
		};

		// Helper to render a cell
		const renderCell = (
			columnIndex: number,
			rowData: CampaignPromptTypeModel
		) => {
			const Cell = columns[columnIndex].cell as any;
			return render(
				<MantineProvider>
					<Cell row={{ original: rowData }} />
				</MantineProvider>
			);
		};

		// Test Order cell
		const { getByText: getByTextOrder } = renderCell(0, mockData);
		expect(getByTextOrder('1')).toBeInTheDocument();

		// Test Name cell
		const { getByText: getByTextName } = renderCell(1, mockData);
		expect(getByTextName('Test Prompt')).toBeInTheDocument();

		// Test Icon cell
		const { getByText: getByTextIcon } = renderCell(2, mockData);
		expect(getByTextIcon('test-icon')).toBeInTheDocument();

		// Test CreatedAt cell
		const { getByText: getByTextDate } = renderCell(3, mockData);
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
			createdAt: '2023-01-01T00:00:00Z',
		};

		const ActionsCell = columns[4].cell as any;
		const { getAllByRole } = render(
			<MantineProvider>
				<ActionsCell row={{ original: mockData }} />
			</MantineProvider>
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
