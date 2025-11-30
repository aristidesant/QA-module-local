import { renderHook, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { useCampaignSchemasColumns } from './useCampaignSchemasColumns';
import { CampaignContactSchema } from '~/models/CampaignContactSchemaModel';

const baseSchema: CampaignContactSchema = {
	id: 1,
	name: 'Welcome Flow',
	code: 'WELCOME',
	description: 'Schema description',
	objectiveId: 2,
	schemaFields: [],
	version: 1,
	userId: 10,
	clientId: 20,
	createdAt: '2024-01-01T00:00:00.000Z',
	updatedAt: '2024-01-05T12:00:00.000Z',
	objective: { id: 2, name: 'Acquisition' },
	isActive: true,
};

const renderCell = (
	key: string,
	schema: CampaignContactSchema,
	onEdit = vi.fn(),
	onDelete = vi.fn(),
	isDeletePending = false
) => {
	const { result } = renderHook(() =>
		useCampaignSchemasColumns({ onEdit, onDelete, isDeletePending })
	);

	const column = result.current.find(
		(col) => (col as any).accessorKey === key || col.id === key
	);

	const cellFn = typeof column?.cell === 'function' ? column.cell : null;
	const cell = cellFn?.({
		row: {
			original: schema,
		},
	} as any);

	return {
		...render(<MantineProvider>{cell}</MantineProvider>),
		onEdit,
		onDelete,
	};
};

describe('useCampaignSchemasColumns', () => {
	beforeEach(() => {
		Object.defineProperty(navigator, 'clipboard', {
			value: { writeText: vi.fn() },
			writable: true,
			configurable: true,
		});
	});

	it('renders name column with schema name and description tooltip', () => {
		renderCell('name', baseSchema);
		expect(screen.getByText('Welcome Flow')).toBeInTheDocument();
	});

	it('renders name column with fallback tooltip when no description', () => {
		renderCell('name', { ...baseSchema, description: '' });
		expect(screen.getByText('Welcome Flow')).toBeInTheDocument();
	});

	it('renders objective and status content correctly', () => {
		renderCell('objective', baseSchema);
		expect(screen.getByText('Acquisition')).toBeInTheDocument();

		renderCell('isActive', { ...baseSchema, isActive: false });
		expect(screen.getByText('Inactive')).toBeInTheDocument();
	});

	it('renders fallback objective and copies code value', async () => {
		const writeSpy = vi.spyOn(navigator.clipboard, 'writeText');
		writeSpy.mockResolvedValue(undefined);

		renderCell('objective', { ...baseSchema, objective: undefined });
		expect(screen.getByText('--')).toBeInTheDocument();

		renderCell('code', baseSchema);
		const copyButton = screen.getByRole('button');

		await userEvent.click(copyButton);
		expect(writeSpy).toHaveBeenCalledWith(baseSchema.code);
	});

	it('calls edit and delete callbacks from the actions column', async () => {
		const onEdit = vi.fn();
		const onDelete = vi.fn();

		const { getAllByRole } = renderCell(
			'actions',
			baseSchema,
			onEdit,
			onDelete,
			false
		);

		const [editButton, deleteButton] = getAllByRole('button');

		await userEvent.click(editButton);
		expect(onEdit).toHaveBeenCalledWith(baseSchema);

		await userEvent.click(deleteButton);
		expect(onDelete).toHaveBeenCalledWith(baseSchema.id);
	});
});
