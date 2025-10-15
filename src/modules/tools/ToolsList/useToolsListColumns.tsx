import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Text, Group, ThemeIcon, Tooltip, Badge } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import type { ToolModel } from '~/models/ToolModel';

type StatusColor = 'green' | 'red' | 'gray';

const getStatusColor = (status: string): StatusColor => {
	switch (status.toLowerCase()) {
		case 'active':
			return 'green';
		case 'inactive':
			return 'red';
		default:
			return 'gray';
	}
};

const getCreatorName = (tool: ToolModel) =>
	tool.config?.accessInfo?.creatorName || 'Unknown';

const formatDate = (dateString: string) =>
	new Date(dateString).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});

function useToolsListColumns(): ColumnDef<ToolModel>[] {
	return useMemo<ColumnDef<ToolModel>[]>(() => {
		return [
			{
				accessorKey: 'name',
				header: 'Name',
				cell: ({ row }) => {
					const tool = row.original;

					return (
						<Group gap='xs'>
							<Text fw={500} size='sm'>
								{tool.name}
							</Text>
							{tool.description ? (
								<Tooltip
									label={tool.description}
									withinPortal
									multiline
									w={280}
								>
									<ThemeIcon size='sm' radius='xl' variant='light' color='gray'>
										<IconInfoCircle size={14} />
									</ThemeIcon>
								</Tooltip>
							) : null}
						</Group>
					);
				},
			},
			{
				accessorKey: 'status',
				header: 'Status',
				cell: ({ row }) => (
					<Badge
						color={getStatusColor(row.original.status)}
						variant='light'
						size='sm'
					>
						{row.original.status}
					</Badge>
				),
			},
			{
				id: 'creator',
				header: 'Created by',
				cell: ({ row }) => (
					<Text size='sm'>{getCreatorName(row.original)}</Text>
				),
			},
			{
				accessorKey: 'createdAt',
				header: 'Created',
				cell: ({ row }) => (
					<Text size='sm' c='dimmed'>
						{formatDate(row.original.createdAt)}
					</Text>
				),
			},
		];
	}, []);
}

export default useToolsListColumns;
