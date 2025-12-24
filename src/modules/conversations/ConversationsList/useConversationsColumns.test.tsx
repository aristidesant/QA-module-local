import { renderHook } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { ColumnDef, CellContext, Row } from '@tanstack/react-table';
import { MantineProvider } from '@mantine/core';
import { useConversationsColumns } from './useConversationsColumns';
import type { ConversationsModel } from '~/models/ConversationsModels';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';

// Extend dayjs with required plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

const t = (key: string) => key;

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: t,
	}),
}));

// Helper type to access accessorKey from column definitions
type ColumnWithAccessorKey = ColumnDef<ConversationsModel> & {
	accessorKey?: string;
};

// Helper to render cell content with Mantine provider
const renderCell = (cellContent: React.ReactNode) => {
	return render(<MantineProvider>{cellContent}</MantineProvider>);
};

// Create a mock row for testing cells
const createMockRow = (
	data: Partial<ConversationsModel>
): Row<ConversationsModel> => {
	const defaultData: ConversationsModel = {
		id: 1,
		identifier: 'test-id',
		agentId: 'agent-1',
		campaignId: 1,
		contactId: null,
		status: 'completed',
		startDate: '2025-01-01T12:00:00Z',
		endDate: '2025-01-01T12:05:00Z',
		userId: 1,
		clientId: 1,
		transcriptContent: {} as ConversationsModel['transcriptContent'],
		transcriptUrl: null,
		transcriptVoiceUrl: null,
		voiceFileId: null,
		createdAt: '2025-01-01T12:00:00Z',
		updatedAt: '2025-01-01T12:05:00Z',
		deletedAt: null,
		agent: {} as ConversationsModel['agent'],
		campaign: {} as ConversationsModel['campaign'],
		contact: null,
		voiceFile: null,
		...data,
	};

	return {
		original: defaultData,
		getValue: vi.fn(),
	} as unknown as Row<ConversationsModel>;
};

// Create a mock cell context for accessor columns
const createMockCellContext = <T,>(
	value: T,
	row: Row<ConversationsModel>
): CellContext<ConversationsModel, T> => {
	return {
		getValue: () => value,
		row,
		cell: {} as CellContext<ConversationsModel, T>['cell'],
		column: {} as CellContext<ConversationsModel, T>['column'],
		table: {} as CellContext<ConversationsModel, T>['table'],
		renderValue: () => value,
	} as CellContext<ConversationsModel, T>;
};

describe('useConversationsColumns', () => {
	const userTimezone = 'America/Puerto_Rico';

	describe('column definitions', () => {
		it('returns exactly 6 columns', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			expect(result.current).toHaveLength(6);
		});

		it('has "list.columns.contactName" as the header for the first column', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			expect(result.current[0].header).toBe('list.columns.contactName');
		});

		it('has "list.columns.phoneNumber" as the header for the second column', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			expect(result.current[1].header).toBe('list.columns.phoneNumber');
		});

		it('has "list.columns.outcome" as the header for the third column', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			expect(result.current[2].header).toBe('list.columns.outcome');
		});

		it('has "list.columns.status" as the header for the fourth column', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			expect(result.current[3].header).toBe('list.columns.status');
		});

		it('has "list.columns.when" as the header for the fifth column', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			expect(result.current[4].header).toBe('list.columns.when');
		});

		it('has "list.columns.duration" as the header for the sixth column', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			expect(result.current[5].header).toBe('list.columns.duration');
		});

		it('has correct column IDs and accessorKeys', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const columns = result.current as ColumnWithAccessorKey[];
			expect(columns[0].id).toBe('contactName');
			expect(columns[1].id).toBe('phoneNumber');
			expect(columns[2].id).toBe('disposition');
			expect(columns[3].accessorKey).toBe('status');
			expect(columns[4].accessorKey).toBe('startDate');
			expect(columns[5].id).toBe('duration');
		});
	});

	describe('column headers exact match validation', () => {
		const expectedHeaders = [
			'list.columns.contactName',
			'list.columns.phoneNumber',
			'list.columns.outcome',
			'list.columns.status',
			'list.columns.when',
			'list.columns.duration',
		];

		it.each(expectedHeaders.map((header, index) => [index, header]))(
			'column at index %i has exact header "%s"',
			(index, expectedHeader) => {
				const { result } = renderHook(() =>
					useConversationsColumns(userTimezone)
				);
				expect(result.current[index as number].header).toBe(expectedHeader);
			}
		);

		it('all column headers match expected values in order', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const actualHeaders = result.current.map((col) => col.header);
			expect(actualHeaders).toEqual(expectedHeaders);
		});
	});

	describe('status column existence', () => {
		it('has a status column with accessorKey', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const columns = result.current as ColumnWithAccessorKey[];
			const statusColumn = columns.find((col) => col.accessorKey === 'status');
			expect(statusColumn).toBeDefined();
			expect(statusColumn?.header).toBe('list.columns.status');
		});

		it('has a startDate column with accessorKey', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const columns = result.current as ColumnWithAccessorKey[];
			const whenColumn = columns.find((col) => col.accessorKey === 'startDate');
			expect(whenColumn).toBeDefined();
			expect(whenColumn?.header).toBe('list.columns.when');
		});
	});

	describe('memoization', () => {
		it('returns same reference when timezone does not change', () => {
			const { result, rerender } = renderHook(
				({ tz }) => useConversationsColumns(tz),
				{ initialProps: { tz: userTimezone } }
			);

			const firstResult = result.current;
			rerender({ tz: userTimezone });
			const secondResult = result.current;

			expect(firstResult).toBe(secondResult);
		});

		it('returns new reference when timezone changes', () => {
			const { result, rerender } = renderHook(
				({ tz }) => useConversationsColumns(tz),
				{ initialProps: { tz: userTimezone } }
			);

			const firstResult = result.current;
			rerender({ tz: 'America/New_York' });
			const secondResult = result.current;

			expect(firstResult).not.toBe(secondResult);
		});
	});

	describe('Contact Name column cell rendering', () => {
		it('renders contact name when provided', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const contactNameColumn = result.current[0];
			const row = createMockRow({ contactName: 'John Doe' });

			const cellFn = contactNameColumn.cell as (
				props: CellContext<ConversationsModel, unknown>
			) => React.ReactNode;
			renderCell(cellFn({ row } as CellContext<ConversationsModel, unknown>));

			expect(screen.getByText('John Doe')).toBeInTheDocument();
		});

		it('renders dash when contact name is empty', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const contactNameColumn = result.current[0];
			const row = createMockRow({ contactName: '' });

			const cellFn = contactNameColumn.cell as (
				props: CellContext<ConversationsModel, unknown>
			) => React.ReactNode;
			renderCell(cellFn({ row } as CellContext<ConversationsModel, unknown>));

			expect(screen.getByText('—')).toBeInTheDocument();
		});

		it('renders dash when contact name is null', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const contactNameColumn = result.current[0];
			const row = createMockRow({ contactName: null });

			const cellFn = contactNameColumn.cell as (
				props: CellContext<ConversationsModel, unknown>
			) => React.ReactNode;
			renderCell(cellFn({ row } as CellContext<ConversationsModel, unknown>));

			expect(screen.getByText('—')).toBeInTheDocument();
		});
	});

	describe('Phone Number column cell rendering', () => {
		it('renders phone number when provided', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const phoneColumn = result.current[1];
			const row = createMockRow({ contactPhoneNumber: '+1234567890' });

			const cellFn = phoneColumn.cell as (
				props: CellContext<ConversationsModel, unknown>
			) => React.ReactNode;
			renderCell(cellFn({ row } as CellContext<ConversationsModel, unknown>));

			expect(screen.getByText('+1234567890')).toBeInTheDocument();
		});

		it('renders dash when phone number is empty', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const phoneColumn = result.current[1];
			const row = createMockRow({ contactPhoneNumber: '' });

			const cellFn = phoneColumn.cell as (
				props: CellContext<ConversationsModel, unknown>
			) => React.ReactNode;
			renderCell(cellFn({ row } as CellContext<ConversationsModel, unknown>));

			expect(screen.getByText('—')).toBeInTheDocument();
		});

		it('renders dash when phone number is undefined', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const phoneColumn = result.current[1];
			const row = createMockRow({ contactPhoneNumber: undefined });

			const cellFn = phoneColumn.cell as (
				props: CellContext<ConversationsModel, unknown>
			) => React.ReactNode;
			renderCell(cellFn({ row } as CellContext<ConversationsModel, unknown>));

			expect(screen.getByText('—')).toBeInTheDocument();
		});
	});

	describe('Outcome/Disposition column cell rendering', () => {
		it('renders green badge for POSITIVE call status', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const dispositionColumn = result.current[2];
			const row = createMockRow({
				dispositions: {
					id: 1,
					conversationId: 1,
					dispositionName: 'Sale Made',
					dispositionDescription: 'Customer purchased',
					callStatus: 'POSITIVE',
					createdAt: '2025-01-01T12:00:00Z',
				},
			});

			const cellFn = dispositionColumn.cell as (
				props: CellContext<ConversationsModel, unknown>
			) => React.ReactNode;
			renderCell(cellFn({ row } as CellContext<ConversationsModel, unknown>));

			const badge = screen.getByText('Sale Made');
			expect(badge).toBeInTheDocument();
		});

		it('renders red badge for NEGATIVE call status', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const dispositionColumn = result.current[2];
			const row = createMockRow({
				dispositions: {
					id: 1,
					conversationId: 1,
					dispositionName: 'Not Interested',
					dispositionDescription: 'Customer declined',
					callStatus: 'NEGATIVE',
					createdAt: '2025-01-01T12:00:00Z',
				},
			});

			const cellFn = dispositionColumn.cell as (
				props: CellContext<ConversationsModel, unknown>
			) => React.ReactNode;
			renderCell(cellFn({ row } as CellContext<ConversationsModel, unknown>));

			const badge = screen.getByText('Not Interested');
			expect(badge).toBeInTheDocument();
		});

		it('renders gray badge for NEUTRAL call status', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const dispositionColumn = result.current[2];
			const row = createMockRow({
				dispositions: {
					id: 1,
					conversationId: 1,
					dispositionName: 'Callback Requested',
					dispositionDescription: 'Will call back',
					callStatus: 'NEUTRAL',
					createdAt: '2025-01-01T12:00:00Z',
				},
			});

			const cellFn = dispositionColumn.cell as (
				props: CellContext<ConversationsModel, unknown>
			) => React.ReactNode;
			renderCell(cellFn({ row } as CellContext<ConversationsModel, unknown>));

			const badge = screen.getByText('Callback Requested');
			expect(badge).toBeInTheDocument();
		});

		it('renders overview.fallbacks.na when disposition is null', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const dispositionColumn = result.current[2];
			const row = createMockRow({ dispositions: null });

			const cellFn = dispositionColumn.cell as (
				props: CellContext<ConversationsModel, unknown>
			) => React.ReactNode;
			renderCell(cellFn({ row } as CellContext<ConversationsModel, unknown>));

			expect(screen.getByText('overview.fallbacks.na')).toBeInTheDocument();
		});

		it('renders overview.fallbacks.na when disposition is undefined', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const dispositionColumn = result.current[2];
			const row = createMockRow({ dispositions: undefined });

			const cellFn = dispositionColumn.cell as (
				props: CellContext<ConversationsModel, unknown>
			) => React.ReactNode;
			renderCell(cellFn({ row } as CellContext<ConversationsModel, unknown>));

			expect(screen.getByText('overview.fallbacks.na')).toBeInTheDocument();
		});
	});

	describe('Status column cell rendering (resolveSimpleStatus)', () => {
		it('renders green "list.status.done" badge for completed status', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const statusColumn = result.current[3];
			const row = createMockRow({ status: 'completed' });
			const context = createMockCellContext('completed', row);

			const cellFn = statusColumn.cell as (
				props: CellContext<ConversationsModel, string>
			) => React.ReactNode;
			renderCell(cellFn(context));

			expect(screen.getByText('list.status.done')).toBeInTheDocument();
		});

		it('renders green "list.status.done" badge for success status', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const statusColumn = result.current[3];
			const row = createMockRow({ status: 'success' });
			const context = createMockCellContext('success', row);

			const cellFn = statusColumn.cell as (
				props: CellContext<ConversationsModel, string>
			) => React.ReactNode;
			renderCell(cellFn(context));

			expect(screen.getByText('list.status.done')).toBeInTheDocument();
		});

		it('renders green "list.status.done" badge for done status', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const statusColumn = result.current[3];
			const row = createMockRow({ status: 'done' });
			const context = createMockCellContext('done', row);

			const cellFn = statusColumn.cell as (
				props: CellContext<ConversationsModel, string>
			) => React.ReactNode;
			renderCell(cellFn(context));

			expect(screen.getByText('list.status.done')).toBeInTheDocument();
		});

		it('renders blue "list.status.inProgress" badge for progress status', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const statusColumn = result.current[3];
			const row = createMockRow({ status: 'in-progress' });
			const context = createMockCellContext('in-progress', row);

			const cellFn = statusColumn.cell as (
				props: CellContext<ConversationsModel, string>
			) => React.ReactNode;
			renderCell(cellFn(context));

			expect(screen.getByText('list.status.inProgress')).toBeInTheDocument();
		});

		it('renders blue "list.status.inProgress" badge for running status', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const statusColumn = result.current[3];
			const row = createMockRow({ status: 'running' });
			const context = createMockCellContext('running', row);

			const cellFn = statusColumn.cell as (
				props: CellContext<ConversationsModel, string>
			) => React.ReactNode;
			renderCell(cellFn(context));

			expect(screen.getByText('list.status.inProgress')).toBeInTheDocument();
		});

		it('renders red "list.status.failed" badge for failed status', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const statusColumn = result.current[3];
			const row = createMockRow({ status: 'failed' });
			const context = createMockCellContext('failed', row);

			const cellFn = statusColumn.cell as (
				props: CellContext<ConversationsModel, string>
			) => React.ReactNode;
			renderCell(cellFn(context));

			expect(screen.getByText('list.status.failed')).toBeInTheDocument();
		});

		it('renders red "list.status.failed" badge for error status', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const statusColumn = result.current[3];
			const row = createMockRow({ status: 'error' });
			const context = createMockCellContext('error', row);

			const cellFn = statusColumn.cell as (
				props: CellContext<ConversationsModel, string>
			) => React.ReactNode;
			renderCell(cellFn(context));

			expect(screen.getByText('list.status.failed')).toBeInTheDocument();
		});

		it('renders red "list.status.failed" badge for cancelled status', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const statusColumn = result.current[3];
			const row = createMockRow({ status: 'cancelled' });
			const context = createMockCellContext('cancelled', row);

			const cellFn = statusColumn.cell as (
				props: CellContext<ConversationsModel, string>
			) => React.ReactNode;
			renderCell(cellFn(context));

			expect(screen.getByText('list.status.failed')).toBeInTheDocument();
		});

		it('renders yellow "list.status.pending" badge for pending status', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const statusColumn = result.current[3];
			const row = createMockRow({ status: 'pending' });
			const context = createMockCellContext('pending', row);

			const cellFn = statusColumn.cell as (
				props: CellContext<ConversationsModel, string>
			) => React.ReactNode;
			renderCell(cellFn(context));

			expect(screen.getByText('list.status.pending')).toBeInTheDocument();
		});

		it('renders yellow "list.status.pending" badge for queued status', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const statusColumn = result.current[3];
			const row = createMockRow({ status: 'queued' });
			const context = createMockCellContext('queued', row);

			const cellFn = statusColumn.cell as (
				props: CellContext<ConversationsModel, string>
			) => React.ReactNode;
			renderCell(cellFn(context));

			expect(screen.getByText('list.status.pending')).toBeInTheDocument();
		});

		it('renders yellow "list.status.pending" badge for waiting status', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const statusColumn = result.current[3];
			const row = createMockRow({ status: 'waiting' });
			const context = createMockCellContext('waiting', row);

			const cellFn = statusColumn.cell as (
				props: CellContext<ConversationsModel, string>
			) => React.ReactNode;
			renderCell(cellFn(context));

			expect(screen.getByText('list.status.pending')).toBeInTheDocument();
		});

		it('renders yellow "list.status.pending" badge for initiated status', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const statusColumn = result.current[3];
			const row = createMockRow({ status: 'initiated' });
			const context = createMockCellContext('initiated', row);

			const cellFn = statusColumn.cell as (
				props: CellContext<ConversationsModel, string>
			) => React.ReactNode;
			renderCell(cellFn(context));

			expect(screen.getByText('list.status.pending')).toBeInTheDocument();
		});

		it('renders gray "list.status.unknown" badge for unknown status', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const statusColumn = result.current[3];
			const row = createMockRow({ status: 'some-random-status' });
			const context = createMockCellContext('some-random-status', row);

			const cellFn = statusColumn.cell as (
				props: CellContext<ConversationsModel, string>
			) => React.ReactNode;
			renderCell(cellFn(context));

			expect(screen.getByText('list.status.unknown')).toBeInTheDocument();
		});

		it('renders gray "list.status.unknown" badge when status is null', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const statusColumn = result.current[3];
			const row = createMockRow({ status: '' });
			const context = createMockCellContext(null as unknown as string, row);

			const cellFn = statusColumn.cell as (
				props: CellContext<ConversationsModel, string>
			) => React.ReactNode;
			renderCell(cellFn(context));

			expect(screen.getByText('list.status.unknown')).toBeInTheDocument();
		});
	});

	describe('When column cell rendering (formatZonedDate)', () => {
		it('renders relative time when startDate is provided', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const whenColumn = result.current[4];
			const pastDate = dayjs().subtract(2, 'hours').toISOString();
			const row = createMockRow({ startDate: pastDate });
			const context = createMockCellContext(pastDate, row);

			const cellFn = whenColumn.cell as (
				props: CellContext<ConversationsModel, string>
			) => React.ReactNode;
			renderCell(cellFn(context));

			expect(screen.getByText('2 hours ago')).toBeInTheDocument();
		});

		it('renders dash when startDate is empty', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const whenColumn = result.current[4];
			const row = createMockRow({ startDate: '' });
			const context = createMockCellContext('', row);

			const cellFn = whenColumn.cell as (
				props: CellContext<ConversationsModel, string>
			) => React.ReactNode;
			renderCell(cellFn(context));

			expect(screen.getByText('—')).toBeInTheDocument();
		});

		it('renders dash when startDate is invalid', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const whenColumn = result.current[4];
			const row = createMockRow({ startDate: 'invalid-date' });
			const context = createMockCellContext('invalid-date', row);

			const cellFn = whenColumn.cell as (
				props: CellContext<ConversationsModel, string>
			) => React.ReactNode;
			renderCell(cellFn(context));

			expect(screen.getByText('—')).toBeInTheDocument();
		});

		it('renders tooltip with absolute date format', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const whenColumn = result.current[4];
			const pastDate = dayjs().subtract(1, 'day').toISOString();
			const row = createMockRow({ startDate: pastDate });
			const context = createMockCellContext(pastDate, row);

			const cellFn = whenColumn.cell as (
				props: CellContext<ConversationsModel, string>
			) => React.ReactNode;
			renderCell(cellFn(context));

			// The text element should be rendered
			expect(screen.getByText('a day ago')).toBeInTheDocument();
		});
	});

	describe('Duration column cell rendering (formatDuration)', () => {
		it('renders duration in minutes when less than an hour', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const durationColumn = result.current[5];
			const startDate = '2025-01-01T12:00:00Z';
			const endDate = '2025-01-01T12:05:30Z';
			const row = createMockRow({ startDate, endDate });

			const cellFn = durationColumn.cell as (
				props: CellContext<ConversationsModel, unknown>
			) => React.ReactNode;
			renderCell(cellFn({ row } as CellContext<ConversationsModel, unknown>));

			expect(screen.getByText('5units.minute')).toBeInTheDocument();
		});

		it('renders duration in seconds when less than a minute', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const durationColumn = result.current[5];
			const startDate = '2025-01-01T12:00:00Z';
			const endDate = '2025-01-01T12:00:45Z';
			const row = createMockRow({ startDate, endDate });

			const cellFn = durationColumn.cell as (
				props: CellContext<ConversationsModel, unknown>
			) => React.ReactNode;
			renderCell(cellFn({ row } as CellContext<ConversationsModel, unknown>));

			expect(screen.getByText('45units.second')).toBeInTheDocument();
		});

		it('renders duration in hours and minutes', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const durationColumn = result.current[5];
			const startDate = '2025-01-01T12:00:00Z';
			const endDate = '2025-01-01T14:30:00Z';
			const row = createMockRow({ startDate, endDate });

			const cellFn = durationColumn.cell as (
				props: CellContext<ConversationsModel, unknown>
			) => React.ReactNode;
			renderCell(cellFn({ row } as CellContext<ConversationsModel, unknown>));

			expect(
				screen.getByText('2units.hour 30units.minute')
			).toBeInTheDocument();
		});

		it('renders duration in days, hours, and minutes', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const durationColumn = result.current[5];
			const startDate = '2025-01-01T12:00:00Z';
			const endDate = '2025-01-03T14:30:00Z';
			const row = createMockRow({ startDate, endDate });

			const cellFn = durationColumn.cell as (
				props: CellContext<ConversationsModel, unknown>
			) => React.ReactNode;
			renderCell(cellFn({ row } as CellContext<ConversationsModel, unknown>));

			expect(
				screen.getByText('2units.day 2units.hour 30units.minute')
			).toBeInTheDocument();
		});

		it('renders dash when startDate is missing', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const durationColumn = result.current[5];
			const row = createMockRow({
				startDate: '',
				endDate: '2025-01-01T12:05:00Z',
			});

			const cellFn = durationColumn.cell as (
				props: CellContext<ConversationsModel, unknown>
			) => React.ReactNode;
			renderCell(cellFn({ row } as CellContext<ConversationsModel, unknown>));

			expect(screen.getByText('—')).toBeInTheDocument();
		});

		it('renders dash when startDate is invalid', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const durationColumn = result.current[5];
			const row = createMockRow({
				startDate: 'invalid-date',
				endDate: '2025-01-01T12:05:00Z',
			});

			const cellFn = durationColumn.cell as (
				props: CellContext<ConversationsModel, unknown>
			) => React.ReactNode;
			renderCell(cellFn({ row } as CellContext<ConversationsModel, unknown>));

			expect(screen.getByText('—')).toBeInTheDocument();
		});

		it('renders dash when duration is negative', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const durationColumn = result.current[5];
			const startDate = '2025-01-01T14:00:00Z';
			const endDate = '2025-01-01T12:00:00Z'; // End before start
			const row = createMockRow({ startDate, endDate });

			const cellFn = durationColumn.cell as (
				props: CellContext<ConversationsModel, unknown>
			) => React.ReactNode;
			renderCell(cellFn({ row } as CellContext<ConversationsModel, unknown>));

			expect(screen.getByText('—')).toBeInTheDocument();
		});

		it('renders duration without tooltip when endDate is not provided', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const durationColumn = result.current[5];
			// Use a fixed date for predictable duration calculation
			const startDate = dayjs().subtract(5, 'minutes').toISOString();
			const row = createMockRow({ startDate, endDate: '' });

			const cellFn = durationColumn.cell as (
				props: CellContext<ConversationsModel, unknown>
			) => React.ReactNode;
			renderCell(cellFn({ row } as CellContext<ConversationsModel, unknown>));

			// Should show approximately 5 minutes
			expect(screen.getByText('5units.minute')).toBeInTheDocument();
		});

		it('renders with tooltip when endDate is provided', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const durationColumn = result.current[5];
			const startDate = '2025-01-01T12:00:00Z';
			const endDate = '2025-01-01T12:10:00Z';
			const row = createMockRow({ startDate, endDate });

			const cellFn = durationColumn.cell as (
				props: CellContext<ConversationsModel, unknown>
			) => React.ReactNode;
			renderCell(cellFn({ row } as CellContext<ConversationsModel, unknown>));

			expect(screen.getByText('10units.minute')).toBeInTheDocument();
		});

		it('renders 0units.second when start and end dates are the same', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const durationColumn = result.current[5];
			const sameDate = '2025-01-01T12:00:00Z';
			const row = createMockRow({ startDate: sameDate, endDate: sameDate });

			const cellFn = durationColumn.cell as (
				props: CellContext<ConversationsModel, unknown>
			) => React.ReactNode;
			renderCell(cellFn({ row } as CellContext<ConversationsModel, unknown>));

			expect(screen.getByText('0units.second')).toBeInTheDocument();
		});
	});

	describe('edge cases', () => {
		it('handles mixed case status values', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const statusColumn = result.current[3];
			const row = createMockRow({ status: 'COMPLETED' });
			const context = createMockCellContext('COMPLETED', row);

			const cellFn = statusColumn.cell as (
				props: CellContext<ConversationsModel, string>
			) => React.ReactNode;
			renderCell(cellFn(context));

			expect(screen.getByText('list.status.done')).toBeInTheDocument();
		});

		it('handles partial status matches', () => {
			const { result } = renderHook(() =>
				useConversationsColumns(userTimezone)
			);
			const statusColumn = result.current[3];
			const row = createMockRow({ status: 'call_complete_success' });
			const context = createMockCellContext('call_complete_success', row);

			const cellFn = statusColumn.cell as (
				props: CellContext<ConversationsModel, string>
			) => React.ReactNode;
			renderCell(cellFn(context));

			expect(screen.getByText('list.status.done')).toBeInTheDocument();
		});

		it('works with different timezones', () => {
			const { result } = renderHook(() =>
				useConversationsColumns('Europe/London')
			);
			const whenColumn = result.current[4];
			const pastDate = dayjs().subtract(3, 'hours').toISOString();
			const row = createMockRow({ startDate: pastDate });
			const context = createMockCellContext(pastDate, row);

			const cellFn = whenColumn.cell as (
				props: CellContext<ConversationsModel, string>
			) => React.ReactNode;
			renderCell(cellFn(context));

			expect(screen.getByText('3 hours ago')).toBeInTheDocument();
		});
	});
});
