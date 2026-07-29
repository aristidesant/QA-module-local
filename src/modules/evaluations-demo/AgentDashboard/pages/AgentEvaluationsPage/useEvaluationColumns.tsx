import { Badge, Text } from '@mantine/core';
import type { BaseTableColumnDef } from '~/components/BaseTable';
import type { DemoAgentCall } from '../../types';

export const useEvaluationColumns = (): BaseTableColumnDef<DemoAgentCall>[] => {
	const getScoreBadgeColor = (score: number) => {
		if (score >= 80) return 'green';
		if (score >= 60) return 'yellow';
		return 'red';
	};

	return [
		{
			accessorKey: 'callDate',
			header: 'Date',
			cell: ({ row }) => (
				<Text size='sm'>
					{new Date(row.original.callDate).toLocaleDateString(
						'en-US',
						{
							month: 'short',
							day: 'numeric',
							hour: '2-digit',
							minute: '2-digit',
						}
					)}
				</Text>
			),
			size: 140,
		},
		{
			accessorKey: 'campaign',
			header: 'Campaign',
			cell: ({ row }) => <Text size='sm'>{row.original.campaign}</Text>,
		},
		{
			accessorKey: 'duration',
			header: 'Duration',
			cell: ({ row }) => (
				<Text size='sm'>
					{Math.floor(row.original.duration / 60)}:
					{String(row.original.duration % 60).padStart(2, '0')}
				</Text>
			),
			size: 100,
		},
		{
			accessorKey: 'score',
			header: 'Score',
			cell: ({ row }) => (
				<Badge
					color={getScoreBadgeColor(row.original.score)}
					variant='light'
				>
					{row.original.score}%
				</Badge>
			),
			size: 100,
		},
		{
			accessorKey: 'evaluationType',
			header: 'Type',
			cell: ({ row }) => (
				<Badge size='sm' variant='light'>
					{row.original.evaluationType}
				</Badge>
			),
			size: 130,
		},
		{
			accessorKey: 'result',
			header: 'Result',
			cell: ({ row }) => (
				<Badge
					color={row.original.result === 'passed' ? 'green' : 'red'}
					variant='light'
					size='sm'
				>
					{row.original.result.charAt(0).toUpperCase() +
						row.original.result.slice(1)}
				</Badge>
			),
			size: 100,
		},
		{
			id: 'disputed',
			header: 'Dispute',
			cell: ({ row }) =>
				row.original.disputed ? (
					<Badge color='orange' variant='light' size='sm'>
						Disputed
					</Badge>
				) : (
					<Text size='sm' c='dimmed'>
						—
					</Text>
				),
			size: 100,
		},
	];
};
