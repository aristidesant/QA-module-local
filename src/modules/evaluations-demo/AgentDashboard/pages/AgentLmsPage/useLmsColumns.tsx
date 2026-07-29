import { Badge, Button, Progress, Text } from '@mantine/core';
import type { BaseTableColumnDef } from '~/components/BaseTable';
import type { DemoLmsContent } from '../../types';

export const useLmsColumns = (): BaseTableColumnDef<DemoLmsContent>[] => {
	return [
		{
			accessorKey: 'title',
			header: 'Title',
			cell: ({ row }) => <Text size='sm' fw={600}>{row.original.title}</Text>,
		},
		{
			accessorKey: 'type',
			header: 'Type',
			cell: ({ row }) => (
				<Badge size='sm' variant='light'>
					{row.original.type}
				</Badge>
			),
			size: 100,
		},
		{
			id: 'mandatory',
			header: 'Status',
			cell: ({ row }) => (
				<Badge
					color={row.original.mandatory ? 'red' : 'gray'}
					variant='light'
					size='sm'
				>
					{row.original.mandatory ? 'Mandatory' : 'Optional'}
				</Badge>
			),
			size: 120,
		},
		{
			accessorKey: 'durationMin',
			header: 'Duration',
			cell: ({ row }) => (
				<Text size='sm'>
					{row.original.durationMin
						? `${row.original.durationMin} min`
						: '—'}
				</Text>
			),
			size: 100,
		},
		{
			accessorKey: 'deadline',
			header: 'Deadline',
			cell: ({ row }) => (
				<Text size='sm'>
					{row.original.deadline
						? new Date(row.original.deadline).toLocaleDateString(
								'en-US',
								{ month: 'short', day: 'numeric' }
						  )
						: '—'}
				</Text>
			),
			size: 100,
		},
		{
			accessorKey: 'completionPercent',
			header: 'Progress',
			cell: ({ row }) => (
				<div style={{ width: 80 }}>
					<Progress
						value={row.original.completionPercent || 0}
						size='sm'
						color={
							row.original.completed
								? 'green'
								: row.original.completionPercent &&
									  row.original
										.completionPercent > 0
									? 'blue'
									: 'gray'
						}
					/>
					<Text size='xs' c='dimmed' mt={4}>
						{row.original.completionPercent || 0}%
					</Text>
				</div>
			),
			size: 100,
		},
		{
			id: 'actions',
			header: 'Action',
			cell: ({ row }) => (
				<Button size='xs' variant='light'>
					{row.original.completed ? 'Resume' : 'View'}
				</Button>
			),
			size: 80,
		},
	];
};
