import { ActionIcon, Badge, Group, Text } from '@mantine/core';
import type { ColumnDef } from '@tanstack/react-table';
import { IconCalendarTime, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { PredefinedScheduleConfig } from '~/models/PredefinedScheduleConfig';
import { getActiveDaysLabel, getHoursWindow } from '../utils';

interface UseSchedulerPredefinedParamsColumnsProps {
	onDelete?: (param: PredefinedScheduleConfig) => void;
}

const useSchedulerPredefinedParamsColumns = ({
	onDelete,
}: UseSchedulerPredefinedParamsColumnsProps = {}) => {
	const { t } = useTranslation('scheduler-predefined-params');

	const columns: ColumnDef<PredefinedScheduleConfig>[] = [
		{
			accessorKey: 'name',
			header: t('list.columns.name'),
			cell: ({ row }) => (
				<Group gap='xs'>
					<Badge
						variant='light'
						color='blue'
						size='sm'
						leftSection={<IconCalendarTime size={12} />}
					>
						{t('list.badge.preset')}
					</Badge>
					<Text size='sm' fw={600}>
						{row.original.name}
					</Text>
				</Group>
			),
		},
		{
			id: 'activeDays',
			header: t('list.columns.activeDays'),
			cell: ({ row }) => (
				<Text size='sm' c='dark'>
					{getActiveDaysLabel(row.original.dayConfigs, t)}
				</Text>
			),
		},
		{
			id: 'window',
			header: t('list.columns.hoursWindow'),
			cell: ({ row }) => (
				<Text size='sm' c='dimmed'>
					{getHoursWindow(row.original.dayConfigs, t)}
				</Text>
			),
		},
		{
			id: 'actions',
			header: t('list.columns.actions'),
			cell: ({ row }) => (
				<ActionIcon
					variant='subtle'
					color='red'
					aria-label={t('list.actions.deleteAria')}
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
