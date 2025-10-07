import { ColumnDef } from '@tanstack/react-table';
import {
	Avatar,
	Tooltip,
	ActionIcon,
	Group,
	Text,
	Badge,
	Progress,
	Menu,
	Stack,
} from '@mantine/core';
import {
	IconDotsVertical,
	IconTrash,
	IconEye,
	IconPlayerPlayFilled,
	IconBolt,
	IconPlayerPause,
	IconCircleCheck,
	IconExclamationMark,
	IconCheck,
	IconArrowUpRight,
	IconArrowDownLeft,
} from '@tabler/icons-react';
import type { Campaign } from '~/models/CampaignsModel';
import ScoreGauge from './CampaignsListItem/ScoreGauge';

// Helper to get status info
const getCampaignStatusInfo = (status: string) => {
	const campaignStatus = status?.toLowerCase();
	const size = 16;

	switch (campaignStatus) {
		case 'active':
			return {
				icon: <IconPlayerPlayFilled size={size} />,
				color: 'green',
				label: 'Active',
			};
		case 'running':
			return {
				icon: <IconBolt size={size} />,
				color: 'green',
				label: 'Running',
			};
		case 'paused':
			return {
				icon: <IconPlayerPause size={size} />,
				color: 'yellow',
				label: 'Paused',
			};
		case 'completed':
			return {
				icon: <IconCircleCheck size={size} />,
				color: 'green',
				label: 'Completed',
			};
		case 'inactive':
		case 'incomplete':
		case 'error':
			return {
				icon: <IconExclamationMark size={size} />,
				color: 'red',
				label: 'Inactive',
			};
		case 'ready':
		case 'scheduled':
			return {
				icon: <IconCheck size={size} />,
				color: 'blue',
				label: 'Ready',
			};
		default:
			return {
				icon: <IconCheck size={size} />,
				color: 'gray',
				label: 'Unknown Status',
			};
	}
};

// Helper to get progress color
const getProgressColor = (percentage: number): string => {
	if (percentage >= 80) return 'green';
	if (percentage >= 50) return 'blue';
	if (percentage >= 25) return 'yellow';
	return 'red';
};

interface UseCampaignsColumnsProps {
	onEdit: (campaign: Campaign) => void;
	onDelete: (campaign: Campaign) => void;
}

export const useCampaignsColumns = ({
	onEdit,
	onDelete,
}: UseCampaignsColumnsProps): ColumnDef<Campaign, any>[] => {
	return [
		{
			accessorKey: 'name',
			header: 'Campaign',
			cell: ({ row }) => {
				const campaign = row.original;
				const statusInfo = getCampaignStatusInfo(campaign.status ?? '');
				return (
					<Group gap='sm' wrap='nowrap'>
						<Avatar
							size={24}
							radius='xl'
							color={statusInfo.color}
							title={statusInfo.label}
						>
							{statusInfo.icon}
						</Avatar>
						<div>
							<Text size='sm' fw={500} lineClamp={1}>
								{campaign.name}
							</Text>
							<Text size='xs' c='dimmed' lineClamp={1}>
								{campaign.description || 'No description'}
							</Text>
						</div>
					</Group>
				);
			},
			size: 300,
		},
		{
			accessorKey: 'type',
			header: 'Type',
			cell: ({ row }) => {
				const campaign = row.original;
				return (
					<Badge
						variant='light'
						color={campaign.type === 'OUTBOUND' ? 'green' : 'blue'}
						radius='lg'
						size='sm'
						rightSection={
							campaign.type === 'OUTBOUND' ? (
								<IconArrowUpRight size={12} />
							) : (
								<IconArrowDownLeft size={12} />
							)
						}
					>
						{campaign.type}
					</Badge>
				);
			},
			size: 120,
		},
		{
			accessorKey: 'status',
			header: 'Status',
			cell: ({ row }) => {
				const campaign = row.original;
				const statusInfo = getCampaignStatusInfo(campaign.status ?? '');
				return (
					<Badge
						variant='light'
						color={statusInfo.color}
						size='sm'
						leftSection={statusInfo.icon}
					>
						{statusInfo.label}
					</Badge>
				);
			},
			size: 120,
		},
		{
			accessorKey: 'progress',
			header: 'Progress',
			cell: ({ row }) => {
				const campaign = row.original;
				const progressPercentage = campaign.progress || 0;
				return (
					<Stack gap={4}>
						<Progress
							value={progressPercentage}
							color={getProgressColor(progressPercentage)}
							size='sm'
							radius='xl'
						/>
						<Text size='xs' c='dimmed'>
							{progressPercentage.toFixed(0)}%
						</Text>
					</Stack>
				);
			},
			size: 150,
		},

		{
			accessorKey: 'agents',
			header: 'Agents',
			cell: ({ row }) => {
				const campaign = row.original;
				if (!campaign.agents || campaign.agents.length === 0) {
					return (
						<Text size='xs' c='dimmed'>
							No agents
						</Text>
					);
				}
				return (
					<Group gap={4}>
						{campaign.agents.slice(0, 3).map((campaignAgent) => (
							<Tooltip
								key={campaignAgent.id}
								label={`${campaignAgent.agent.name} - ${campaignAgent.agent.language}`}
							>
								<Avatar radius='xl' size={24} color='blue'>
									{campaignAgent.agent.name.charAt(0).toUpperCase()}
								</Avatar>
							</Tooltip>
						))}
						{campaign.agents.length > 3 && (
							<Avatar radius='xl' size={24} color='gray'>
								<Text size='xs' fw={600}>
									+{campaign.agents.length - 3}
								</Text>
							</Avatar>
						)}
					</Group>
				);
			},
			size: 150,
		},
		{
			id: 'actions',
			header: '',
			cell: ({ row }) => {
				const campaign = row.original;
				return (
					<Menu shadow='md' width={160}>
						<Menu.Target>
							<ActionIcon
								variant='subtle'
								color='gray'
								radius='md'
								aria-label='Campaign actions'
								onClick={(e) => e.stopPropagation()}
							>
								<IconDotsVertical size={16} aria-hidden />
							</ActionIcon>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Item
								onClick={(e) => {
									e.stopPropagation();
									onEdit(campaign);
								}}
								leftSection={<IconEye size={14} />}
							>
								Edit Campaign
							</Menu.Item>
							<Menu.Divider />
							<Menu.Item
								onClick={(e) => {
									e.stopPropagation();
									onDelete(campaign);
								}}
								leftSection={<IconTrash size={14} />}
								color='red'
							>
								Delete
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				);
			},
			size: 60,
			enableSorting: false,
		},
	];
};
