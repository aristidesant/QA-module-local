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
	ThemeIcon,
} from '@mantine/core';
import {
	IconDotsVertical,
	IconTrash,
	IconEye,
	IconCheck,
	IconArrowUpRight,
	IconArrowDownLeft,
	IconCopy,
	IconChartDots,
	IconPhone,
	IconInfoCircle,
} from '@tabler/icons-react';
import type { Campaign } from '~/models/CampaignsModel';
import { useNavigate } from 'react-router';
import {
	CampaignStatus,
	CampaignStatusConfig,
	CampaignStatusConfigType,
} from '~/models/CampaignStatus';

// Helper to get status info
export const getCampaignStatusInfo = (
	status: string
): CampaignStatusConfigType => {
	const config = CampaignStatusConfig[status as CampaignStatus];

	if (config) {
		return {
			icon: config.icon,
			color: config.color,
			label: config.label,
		};
	}

	// Fallback for unknown status
	return {
		icon: IconCheck,
		color: 'gray',
		label: status || 'Unknown',
	};
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
	onTestCall: (campaign: Campaign) => void;
	onDelete: (campaign: Campaign) => void;
	onClone: (campaign: Campaign) => void;
}

export const useCampaignsColumns = ({
	onEdit,
	onTestCall,
	onDelete,
	onClone,
}: UseCampaignsColumnsProps): ColumnDef<Campaign, any>[] => {
	const navigate = useNavigate();
	return [
		{
			accessorKey: 'name',
			header: 'Campaign',
			cell: ({ row }) => {
				const campaign = row.original;
				return (
					<Group gap='sm' wrap='nowrap'>
						<Tooltip withArrow label={campaign.description || 'No description'}>
							<ThemeIcon variant='light' color='blue' size={'xs'}>
								<IconInfoCircle size={16} />
							</ThemeIcon>
						</Tooltip>
						<Text size='sm' fw={500} lineClamp={1}>
							{campaign.name}
						</Text>
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
						leftSection={<statusInfo.icon size={16} />}
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
					<Menu shadow='md' width={200}>
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
								onClick={() => {
									navigate(`/campaigns/metrics/${campaign.id}`);
								}}
								leftSection={<IconChartDots size={14} />}
							>
								View Metrics
							</Menu.Item>
							<Menu.Item
								onClick={(e) => {
									e.stopPropagation();
									onTestCall(campaign);
								}}
								leftSection={<IconPhone size={14} />}
							>
								Test Call
							</Menu.Item>
							<Menu.Item
								onClick={(e) => {
									e.stopPropagation();
									onEdit(campaign);
								}}
								leftSection={<IconEye size={14} />}
							>
								Edit Campaign
							</Menu.Item>
							<Menu.Item
								onClick={(e) => {
									e.stopPropagation();
									onClone(campaign);
								}}
								leftSection={<IconCopy size={14} />}
							>
								Clone Campaign
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
