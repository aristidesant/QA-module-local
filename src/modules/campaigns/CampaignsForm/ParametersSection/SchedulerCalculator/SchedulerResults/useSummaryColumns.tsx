import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Text, useComputedColorScheme } from '@mantine/core';
import type { MetricRow } from './types';

export const useSummaryColumns = () => {
	const colorScheme = useComputedColorScheme('light');

	const principalMetricColor = colorScheme === 'dark' ? 'blue.3' : 'blue.7';
	const principalValueColor = colorScheme === 'dark' ? 'blue.2' : 'blue.7';
	const regularMetricColor = colorScheme === 'dark' ? 'dimmed' : 'gray.7';
	const regularValueColor = colorScheme === 'dark' ? 'dark.0' : 'gray.9';

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
							c={isPrincipal ? principalMetricColor : regularMetricColor}
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
							c={isPrincipal ? principalValueColor : regularValueColor}
						>
							{info.getValue() as string}
						</Text>
					);
				},
			},
		],
		[
			principalMetricColor,
			principalValueColor,
			regularMetricColor,
			regularValueColor,
		]
	);
};
