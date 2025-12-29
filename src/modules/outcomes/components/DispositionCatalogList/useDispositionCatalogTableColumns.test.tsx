import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CellContext, Row } from '@tanstack/react-table';
import type { ReactNode } from 'react';
import { MantineProvider } from '@mantine/core';
import { QueryClientProvider } from '@tanstack/react-query';
import {
	queryClient,
	renderWithProviders,
} from '~/test-utils/renderWithProviders';
import { useDispositionCatalogTableColumns } from './useDispositionCatalogTableColumns';
import type { DispositionCatalogModel } from '~/models/DispositionCatalogModels';

const createMockRow = (
	overrides: Partial<DispositionCatalogModel>
): Row<DispositionCatalogModel> => {
	const defaultData: DispositionCatalogModel = {
		id: 1,
		name: 'Catalog One',
		description: 'Desc',
		clientId: 1,
		campaignId: undefined,
		isActive: true,
		isDefault: false,
		type: 'INBOUND',
		dispositionNodes: [],
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-01T00:00:00Z',
		...overrides,
	};

	return {
		original: defaultData,
		getValue: vi.fn(),
	} as unknown as Row<DispositionCatalogModel>;
};

const createMockCellContext = <TValue,>(
	value: TValue,
	row: Row<DispositionCatalogModel>
): CellContext<DispositionCatalogModel, TValue> => {
	return {
		getValue: () => value,
		row,
		cell: {} as CellContext<DispositionCatalogModel, TValue>['cell'],
		column: {} as CellContext<DispositionCatalogModel, TValue>['column'],
		table: {} as CellContext<DispositionCatalogModel, TValue>['table'],
		renderValue: () => value,
	} as CellContext<DispositionCatalogModel, TValue>;
};

const wrapper = ({ children }: { children: ReactNode }) => (
	<QueryClientProvider client={queryClient}>
		<MantineProvider>{children}</MantineProvider>
	</QueryClientProvider>
);

describe('useDispositionCatalogTableColumns', () => {
	const onEditNodes = vi.fn();
	const onEditDetails = vi.fn();
	const onReactivate = vi.fn();
	const onDeactivate = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		queryClient.clear();
	});

	it('returns the expected column headers in order', () => {
		const { result } = renderHook(
			() =>
				useDispositionCatalogTableColumns({
					onEditNodes,
					onEditDetails,
					onReactivate,
					onDeactivate,
					reactivateState: { isPending: false, variables: undefined },
					deactivateState: { isPending: false, variables: undefined },
				}),
			{ wrapper }
		);

		expect(result.current).toHaveLength(4);
		expect(result.current[0].header).toBe('Name');
		expect(result.current[1].header).toBe('Status');
		expect(result.current[2].header).toBe('Created At');
		expect(result.current[3].header).toBe('Actions');
	});

	it('renders name/description/type and formats createdAt', () => {
		const toLocaleStringSpy = vi
			.spyOn(Date.prototype, 'toLocaleString')
			.mockReturnValue('formatted-date');

		const row = createMockRow({
			name: 'Catalog One',
			description: 'A description',
			type: 'INBOUND',
			createdAt: '2024-01-01T00:00:00Z',
		});

		const { result } = renderHook(
			() =>
				useDispositionCatalogTableColumns({
					onEditNodes,
					onEditDetails,
					onReactivate,
					onDeactivate,
					reactivateState: { isPending: false, variables: undefined },
					deactivateState: { isPending: false, variables: undefined },
				}),
			{ wrapper }
		);

		const columns = result.current as unknown as Array<{
			accessorKey?: string;
			id?: string;
			header?: unknown;
			cell?: (context: unknown) => ReactNode;
		}>;

		const nameCell = (
			columns[0].cell as (props: {
				row: Row<DispositionCatalogModel>;
			}) => ReactNode
		)?.({ row });
		const createdAtCell = columns[2].cell?.(
			createMockCellContext(row.original.createdAt, row)
		);

		renderWithProviders(
			<div>
				<div>{nameCell}</div>
				<div>{createdAtCell}</div>
			</div>
		);

		expect(screen.getByText('Catalog One')).toBeInTheDocument();
		expect(screen.getByText('A description')).toBeInTheDocument();
		expect(screen.getByText('INBOUND')).toBeInTheDocument();
		expect(screen.getByText('formatted-date')).toBeInTheDocument();

		toLocaleStringSpy.mockRestore();
	});

	it('renders active actions and triggers callbacks', async () => {
		const user = userEvent.setup();
		const row = createMockRow({ isActive: true });

		const { result } = renderHook(
			() =>
				useDispositionCatalogTableColumns({
					onEditNodes,
					onEditDetails,
					onReactivate,
					onDeactivate,
					reactivateState: { isPending: false, variables: undefined },
					deactivateState: { isPending: false, variables: undefined },
				}),
			{ wrapper }
		);

		const columns = result.current as unknown as Array<{
			accessorKey?: string;
			id?: string;
			header?: unknown;
			cell?: (context: { row: Row<DispositionCatalogModel> }) => ReactNode;
		}>;

		const actionsCell = columns[3].cell?.({ row });
		renderWithProviders(<div>{actionsCell}</div>);

		await user.click(screen.getByLabelText('Edit nodes'));
		expect(onEditNodes).toHaveBeenCalledWith(row.original);

		await user.click(screen.getByLabelText('Edit details'));
		expect(onEditDetails).toHaveBeenCalledWith(row.original);

		await user.click(screen.getByLabelText('Deactivate'));
		expect(onDeactivate).toHaveBeenCalledWith(row.original);
	});

	it('renders inactive actions and triggers reactivate callback', async () => {
		const user = userEvent.setup();
		const row = createMockRow({ isActive: false, id: 42 });

		const { result } = renderHook(
			() =>
				useDispositionCatalogTableColumns({
					onEditNodes,
					onEditDetails,
					onReactivate,
					onDeactivate,
					reactivateState: { isPending: false, variables: undefined },
					deactivateState: { isPending: false, variables: undefined },
				}),
			{ wrapper }
		);

		const columns = result.current as unknown as Array<{
			accessorKey?: string;
			id?: string;
			header?: unknown;
			cell?: (context: { row: Row<DispositionCatalogModel> }) => ReactNode;
		}>;

		const actionsCell = columns[3].cell?.({ row });
		renderWithProviders(<div>{actionsCell}</div>);

		await user.click(screen.getByLabelText('Reactivate'));
		expect(onReactivate).toHaveBeenCalledWith(row.original);
	});
});
