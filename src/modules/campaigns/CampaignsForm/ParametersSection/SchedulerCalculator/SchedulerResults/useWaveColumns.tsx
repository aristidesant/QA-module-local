import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Text, Progress, useComputedColorScheme } from '@mantine/core';
import type { WaveRow } from './types';
import styles from './SchedulerResults.module.css';

export const useWaveColumns = () => {
	const colorScheme = useComputedColorScheme('light');
	const titleColor = colorScheme === 'dark' ? 'dark.0' : 'gray.9';
	const mutedColor = colorScheme === 'dark' ? 'dimmed' : 'gray.7';

	return useMemo<ColumnDef<WaveRow>[]>(
		() => [
			{
				accessorKey: 'wave',
				header: 'Wave',
				cell: (info) => (
					<Text size='sm' fw={600} c={titleColor}>
						{info.getValue() as string}
					</Text>
				),
			},
			{
				accessorKey: 'projected',
				header: 'Projected %',
				cell: (info) => {
					const row = info.row.original;
					return (
						<div className={styles.projectedCell}>
							<Text
								size='xs'
								fw={500}
								c={mutedColor}
								className={styles.projectedLabel}
							>
								{info.getValue() as string}
							</Text>
							<Progress
								value={row.progressValue}
								size='xs'
								className={styles.projectedProgress}
							/>
						</div>
					);
				},
			},
			{
				accessorKey: 'totalContacted',
				header: 'Contacted',
				cell: (info) => (
					<Text size='xs' c={mutedColor}>
						{info.getValue() as string}
					</Text>
				),
			},
			{
				accessorKey: 'effectiveContact',
				header: 'Effective',
				cell: (info) => (
					<Text size='xs' c={mutedColor}>
						{info.getValue() as string}
					</Text>
				),
			},
			{
				accessorKey: 'noEffectiveContact',
				header: 'No Effective',
				cell: (info) => (
					<Text size='xs' c={mutedColor}>
						{info.getValue() as string}
					</Text>
				),
			},
			{
				accessorKey: 'noContact',
				header: 'No Contact',
				cell: (info) => (
					<Text size='xs' c={mutedColor}>
						{info.getValue() as string}
					</Text>
				),
			},
			{
				accessorKey: 'triesOverNoContact',
				header: 'Tries/No Contact',
				cell: (info) => (
					<Text size='xs' c={mutedColor}>
						{info.getValue() as string}
					</Text>
				),
			},
			{
				accessorKey: 'totalTime',
				header: 'Total Time',
				cell: (info) => (
					<Text size='xs' c={mutedColor}>
						{info.getValue() as string}
					</Text>
				),
			},
		],
		[mutedColor, titleColor]
	);
};
