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
			accessorKey: 'score',
			header: 'QA Score',
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
			accessorKey: 'sentimentScore',
			header: 'Sentiment Score',
			cell: ({ row }) => {
				const score = (row.original as any).sentimentScore;
				return (
					<Badge
						color={score ? undefined : 'gray'}
						variant='light'
						size='sm'
					>
						{score || 'N/A'}
					</Badge>
				);
			},
			size: 120,
		},
		{
			accessorKey: 'complianceScore',
			header: 'Compliance Score',
			cell: ({ row }) => {
				const score = (row.original as any).complianceScore;
				return (
					<Badge
						color={score ? undefined : 'gray'}
						variant='light'
						size='sm'
					>
						{score || 'N/A'}
					</Badge>
				);
			},
			size: 130,
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
