import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Text, Progress } from '@mantine/core';
import type { WaveRow } from './types';

export const useWaveColumns = () => {
	return useMemo<ColumnDef<WaveRow>[]>(
		() => [
			{
				accessorKey: 'wave',
				header: 'Wave',
				cell: (info) => (
					<Text size='sm' fw={600} c='gray.9'>
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
						<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
							<Text size='xs' fw={500} c='gray.7' style={{ minWidth: '45px' }}>
								{info.getValue() as string}
							</Text>
							<Progress
								value={row.progressValue}
								size='xs'
								style={{ flex: 1, minWidth: '80px' }}
							/>
						</div>
					);
				},
			},
			{
				accessorKey: 'totalContacted',
				header: 'Contacted',
				cell: (info) => (
					<Text size='xs' c='gray.7'>
						{info.getValue() as string}
					</Text>
				),
			},
			{
				accessorKey: 'effectiveContact',
				header: 'Effective',
				cell: (info) => (
					<Text size='xs' c='gray.7'>
						{info.getValue() as string}
					</Text>
				),
			},
			{
				accessorKey: 'noEffectiveContact',
				header: 'No Effective',
				cell: (info) => (
					<Text size='xs' c='gray.7'>
						{info.getValue() as string}
					</Text>
				),
			},
			{
				accessorKey: 'noContact',
				header: 'No Contact',
				cell: (info) => (
					<Text size='xs' c='gray.7'>
						{info.getValue() as string}
					</Text>
				),
			},
			{
				accessorKey: 'triesOverNoContact',
				header: 'Tries/No Contact',
				cell: (info) => (
					<Text size='xs' c='gray.7'>
						{info.getValue() as string}
					</Text>
				),
			},
			{
				accessorKey: 'totalTime',
				header: 'Total Time',
				cell: (info) => (
					<Text size='xs' c='gray.7'>
						{info.getValue() as string}
					</Text>
				),
			},
		],
		[]
	);
};
