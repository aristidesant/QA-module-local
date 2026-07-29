import type { ColumnDef } from '@tanstack/react-table';
import { Badge, Text } from '@mantine/core';
import type { DemoCall } from '../mockData';
import { DEMO_CALL_STATUS_COLORS } from '../demoBadgeColors';

export const useDemoCallColumns = (): ColumnDef<DemoCall, any>[] => [
	{
		accessorKey: 'fileName',
		header: 'Call',
		cell: ({ row }) => (
			<Text size='sm' fw={600} c='green.7'>
				{row.original.fileName}
			</Text>
		),
		size: 160,
	},
	{
		accessorKey: 'agentName',
		header: 'Agent',
		cell: ({ row }) => <Text size='sm'>{row.original.agentName}</Text>,
		size: 160,
	},
	{
		accessorKey: 'date',
		header: 'Date',
		cell: ({ row }) => (
			<Text size='sm' c='dimmed'>
				{row.original.date}
			</Text>
		),
		size: 120,
	},
	{
		accessorKey: 'score',
		header: 'Score',
		cell: ({ row }) => (
			<Text size='sm' fw={600}>
				{row.original.score ?? '—'}
			</Text>
		),
		size: 100,
	},
	{
		accessorKey: 'status',
		header: 'Status',
		cell: ({ row }) => {
			const call = row.original;
			return (
				<Badge
					variant='light'
					color={DEMO_CALL_STATUS_COLORS[call.status]}
					size='sm'
				>
					{call.status.charAt(0).toUpperCase() + call.status.slice(1)}
				</Badge>
			);
		},
		size: 120,
	},
];
