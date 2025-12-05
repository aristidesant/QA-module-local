import { ActionIcon, Badge, Group, Text } from '@mantine/core';
import type { ColumnDef } from '@tanstack/react-table';
import { IconCalendarTime, IconTrash } from '@tabler/icons-react';
import type { PredefinedScheduleConfig } from '~/models/PredefinedScheduleConfig';
import { getActiveDaysLabel, getHoursWindow } from '../utils';

interface UseSchedulerPredefinedParamsColumnsProps {
	onDelete?: (param: PredefinedScheduleConfig) => void;
}

const useSchedulerPredefinedParamsColumns = ({
	onDelete,
}: UseSchedulerPredefinedParamsColumnsProps = {}) => {
	const columns: ColumnDef<PredefinedScheduleConfig>[] = [
		{
			accessorKey: 'name',
			header: 'Name',
			cell: ({ row }) => (
				<Group gap='xs'>
					<Badge
						variant='light'
						color='blue'
						size='sm'
						leftSection={<IconCalendarTime size={12} />}
					>
						Preset
					</Badge>
					<Text size='sm' fw={600}>
						{row.original.name}
					</Text>
				</Group>
			),
		},
		{
			id: 'activeDays',
			header: 'Active days',
			cell: ({ row }) => (
				<Text size='sm' c='dark'>
					{getActiveDaysLabel(row.original.dayConfigs)}
				</Text>
			),
		},
		{
			id: 'window',
			header: 'Hours window',
			cell: ({ row }) => (
				<Text size='sm' c='dimmed'>
					{getHoursWindow(row.original.dayConfigs)}
				</Text>
			),
		},
		{
			id: 'actions',
			header: 'Actions',
			cell: ({ row }) => (
				<ActionIcon
					variant='subtle'
					color='red'
					aria-label='Delete schedule'
					onClick={(e) => {
						e.stopPropagation();
						onDelete?.(row.original);
					}}
					size='sm'
					disabled={!onDelete}
				>
					<IconTrash size={14} />
				</ActionIcon>
			),
		},
	];

	return columns;
};

export default useSchedulerPredefinedParamsColumns;
