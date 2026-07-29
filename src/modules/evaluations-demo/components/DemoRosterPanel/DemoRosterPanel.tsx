import React, { useMemo } from 'react';
import { Avatar, Badge, Box, Group, Stack, Text, Title } from '@mantine/core';
import EmptyState from '~/components/EmptyState';
import BaseTable from '~/components/BaseTable';
import type { BaseTableColumnDef } from '~/components/BaseTable';
import type { DemoRosterAgent } from '../../mockData';

const initials = (name: string) =>
	name
		.split(' ')
		.map((part) => part[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();

interface DemoRosterPanelProps {
	roster: DemoRosterAgent[];
}

const DemoRosterPanel: React.FC<DemoRosterPanelProps> = ({ roster }) => {
	const columns = useMemo<BaseTableColumnDef<DemoRosterAgent>[]>(
		() => [
			{
				accessorKey: 'name',
				header: 'Agent Name',
				cell: ({ row }) => (
					<Group gap='xs' wrap='nowrap'>
						<Avatar size='sm' radius='xl' color='gray'>
							{initials(row.original.name)}
						</Avatar>
						<Text size='sm' fw={600}>
							{row.original.name}
						</Text>
					</Group>
				),
			},
			{
				accessorKey: 'email',
				header: 'Email',
				cell: ({ row }) => (
					<Text size='sm' c='dimmed'>
						{row.original.email}
					</Text>
				),
			},
			{
				accessorKey: 'department',
				header: 'Department',
				cell: ({ row }) => <Text size='sm'>{row.original.department}</Text>,
			},
			{
				accessorKey: 'callsRecorded',
				header: 'Calls Recorded',
				cell: ({ row }) => <Text size='sm'>{row.original.callsRecorded}</Text>,
			},
			{
				accessorKey: 'evaluationScore',
				header: 'Evaluation Score',
				cell: ({ row }) => (
					<Group gap={6} wrap='nowrap'>
						<Text size='sm' fw={600}>
							{row.original.evaluationScore}
						</Text>
						<Box
							w={8}
							h={8}
{/* inline-style-allow: */}
							style={{
								borderRadius: '50%',
								backgroundColor:
									row.original.evaluationScore >= 90
										? 'var(--mantine-color-green-6)'
										: 'var(--mantine-color-orange-6)',
							}}
						/>
					</Group>
				),
			},
			{
				accessorKey: 'status',
				header: 'Status',
				cell: ({ row }) => (
					<Badge
						color={row.original.status === 'active' ? 'green' : 'gray'}
						variant='light'
						size='sm'
					>
						{row.original.status === 'active' ? 'Active' : 'Inactive'}
					</Badge>
				),
				size: 100,
			},
			{
				accessorKey: 'disputes',
				header: 'Disputes',
				cell: ({ row }) => (
					<Text size='sm' c='dimmed'>
						{row.original.disputes}
					</Text>
				),
				size: 100,
			},
		],
		[]
	);

	return (
		<Stack gap='md'>
			<div>
				<Title order={4}>Campaign Roster</Title>
				<Text size='sm' c='dimmed'>
					All agents participating in this campaign
				</Text>
			</div>

			{roster.length === 0 ? (
				<EmptyState message='No agents in this roster yet.' />
			) : (
				<BaseTable
					data={roster}
					columns={columns}
					getRowId={(agent) => agent.id}
					density='compact'
					filterMode='client'
				/>
			)}
		</Stack>
	);
};

export default DemoRosterPanel;
