import { Badge, Text } from '@mantine/core';
import type { BaseTableColumnDef } from '~/components/BaseTable';
import type { DemoCoachingReport } from '../../types';

export const useCoachingColumns = (): BaseTableColumnDef<DemoCoachingReport>[] => {
	return [
		{
			accessorKey: 'campaign',
			header: 'Campaign',
			cell: ({ row }) => <Text size='sm' fw={600}>{row.original.campaign}</Text>,
		},
		{
			id: 'weekRange',
			header: 'Week',
			cell: ({ row }) => (
				<Text size='sm'>
					{new Date(row.original.weekStart).toLocaleDateString(
						'en-US',
						{ month: 'short', day: 'numeric' }
					)}
					{' - '}
					{new Date(row.original.weekEnd).toLocaleDateString(
						'en-US',
						{ month: 'short', day: 'numeric' }
					)}
				</Text>
			),
		},
		{
			accessorKey: 'performanceScore',
			header: 'Score',
			cell: ({ row }) => (
				<Badge
					color={
						row.original.performanceScore >= 80
							? 'green'
							: row.original.performanceScore >= 60
								? 'yellow'
								: 'red'
					}
					variant='light'
				>
					{row.original.performanceScore}%
				</Badge>
			),
			size: 100,
		},
		{
			accessorKey: 'callsAnalyzed',
			header: 'Calls Analyzed',
			cell: ({ row }) => <Text size='sm'>{row.original.callsAnalyzed}</Text>,
			size: 120,
		},
		{
			id: 'status',
			header: 'Status',
			cell: () => (
				<Badge color='green' variant='light' size='sm'>
					Reviewed
				</Badge>
			),
			size: 100,
		},
	];
};
