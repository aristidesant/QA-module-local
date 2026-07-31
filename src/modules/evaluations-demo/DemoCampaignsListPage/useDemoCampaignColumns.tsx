import type { ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router';
import { ActionIcon, Badge, Group, Stack, Text } from '@mantine/core';
import {
	IconFileText,
	IconPlayerPause,
	IconPlayerPlay,
} from '@tabler/icons-react';
import type { DemoCampaign } from '../mockData';
import { DEMO_CAMPAIGN_STATUS_COLORS } from '../demoBadgeColors';
import classes from './useDemoCampaignColumns.module.css';

export const useDemoCampaignColumns = (): ColumnDef<DemoCampaign, any>[] => {
	const navigate = useNavigate();

	return [
		{
			accessorKey: 'name',
			header: 'Campaign Name',
			cell: ({ row }) => (
				<Stack gap={2}>
					<Text size='sm' fw={600} c='green.7'>
						{row.original.name}
					</Text>
					<Text size='xs' c='dimmed'>
						{row.original.description}
					</Text>
				</Stack>
			),
			size: 260,
		},
		{
			accessorKey: 'source',
			header: 'Source',
			cell: ({ row }) => (
				<Badge variant='light' color='blue' size='sm'>
					{row.original.source}
				</Badge>
			),
			size: 120,
		},
		{
			accessorKey: 'status',
			header: 'Status',
			cell: ({ row }) => {
				const campaign = row.original;
				return (
					<Badge
						variant='light'
						color={DEMO_CAMPAIGN_STATUS_COLORS[campaign.status]}
						size='sm'
					>
						{campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
					</Badge>
				);
			},
			size: 120,
		},
		{
			accessorKey: 'qaTestsCount',
			header: 'Evaluation Types',
			cell: ({ row }) => <Text size='sm'>{row.original.qaTestsCount}</Text>,
			size: 100,
		},
		{
			id: 'actions',
			header: 'Actions',
			meta: {
				headerClassName: classes.actionsHeader,
				cellClassName: classes.actionsCell,
			},
			cell: ({ row }) => {
				const campaign = row.original;
				const isActive = campaign.status === 'active';
				return (
					<Group gap='xs' justify='flex-end'>
						<ActionIcon
							variant='light'
							color='gray'
							size='sm'
							aria-label='View campaign'
							onClick={(e) => {
								e.stopPropagation();
								navigate(`/role-preview/qa-campaigns/${campaign.id}`);
							}}
						>
							<IconFileText size={16} />
						</ActionIcon>
						<ActionIcon
							variant='light'
							color='gray'
							size='sm'
							aria-label={isActive ? 'Pause campaign' : 'Resume campaign'}
							onClick={(e) => e.stopPropagation()}
						>
							{isActive ? (
								<IconPlayerPause size={16} />
							) : (
								<IconPlayerPlay size={16} />
							)}
						</ActionIcon>
					</Group>
				);
			},
			size: 100,
			enableSorting: false,
		},
	];
};
