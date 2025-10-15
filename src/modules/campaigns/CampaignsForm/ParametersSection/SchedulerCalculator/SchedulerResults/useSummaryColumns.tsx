import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Text } from '@mantine/core';
import type { MetricRow } from './types';

export const useSummaryColumns = () => {
	return useMemo<ColumnDef<MetricRow>[]>(
		() => [
			{
				accessorKey: 'metric',
				header: 'Metric',
				cell: (info) => {
					const isPrincipal = info.row.original.isPrincipal;
					return (
						<Text
							size='xs'
							fw={isPrincipal ? 700 : 500}
							c={isPrincipal ? 'blue.7' : 'gray.7'}
						>
							{info.getValue() as string}
						</Text>
					);
				},
			},
			{
				accessorKey: 'value',
				header: 'Value',
				cell: (info) => {
					const isPrincipal = info.row.original.isPrincipal;
					return (
						<Text
							size='sm'
							fw={isPrincipal ? 700 : 600}
							c={isPrincipal ? 'blue.7' : 'gray.9'}
						>
							{info.getValue() as string}
						</Text>
					);
				},
			},
		],
		[]
	);
};
