import { ColumnDef } from '@tanstack/react-table';
import {
	Avatar,
	Tooltip,
	ActionIcon,
	Group,
	Text,
	Badge,
	Menu,
	ThemeIcon,
	HoverCard,
	Stack,
} from '@mantine/core';
import {
	IconDotsVertical,
	IconTrash,
	IconCheck,
	IconArrowUpRight,
	IconArrowDownLeft,
	IconCopy,
	IconChartDots,
	IconPhone,
	IconInfoCircle,
	IconEye,
	IconPencil,
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

interface UseCampaignsColumnsProps {
	onEdit: (campaign: Campaign) => void;
	onView: (campaign: Campaign) => void;
	onTestCall: (campaign: Campaign) => void;
	onDelete: (campaign: Campaign) => void;
	onClone: (campaign: Campaign) => void;
}

export const useCampaignsColumns = ({
	onEdit,
	onView,
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
						<HoverCard width={280} shadow='md' withArrow position='right'>
							<HoverCard.Target>
								<ThemeIcon
									variant='light'
									color='blue'
									size={'xs'}
									style={{ cursor: 'pointer' }}
								>
									<IconInfoCircle size={16} />
								</ThemeIcon>
							</HoverCard.Target>
							<HoverCard.Dropdown>
								<Stack gap='xs'>
									<Group justify='space-between'>
										<Text size='sm' fw={700}>
											Campaign Details
										</Text>
										<Badge size='xs' variant='outline' color='gray'>
											ID: {campaign.id}
										</Badge>
									</Group>
									<Text size='xs' c='dimmed'>
										{campaign.description || 'No description available.'}
									</Text>
								</Stack>
							</HoverCard.Dropdown>
						</HoverCard>
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
				const isOutbound = campaign.type === 'OUTBOUND';
				return (
					<Tooltip label={isOutbound ? 'Outbound' : 'Inbound'}>
						<ThemeIcon
							variant='light'
							color={isOutbound ? 'green' : 'blue'}
							size='sm'
							radius='xl'
						>
							{isOutbound ? (
								<IconArrowUpRight size={16} />
							) : (
								<IconArrowDownLeft size={16} />
							)}
						</ThemeIcon>
					</Tooltip>
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
					<Tooltip label={statusInfo.label}>
						<Badge
							variant='light'
							color={statusInfo.color}
							size='xs'
							leftSection={<statusInfo.icon size={16} />}
						>
							{statusInfo.label}
						</Badge>
					</Tooltip>
				);
			},
			size: 120,
		},

		{
			accessorKey: 'agents',
			header: 'Agents',
			cell: ({ row }) => {
				const campaign = row.original;
				if (!campaign.agents || campaign.agents.length === 0) {
					return (
						<Text size='xs' c='dimmed'>
							N/A
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
					<Group gap='xs' justify='end'>
						<Tooltip label='Edit campaign'>
							<ActionIcon
								color='blue'
								radius='md'
								aria-label='Edit campaign'
								onClick={(e) => {
									e.stopPropagation();
									onEdit(campaign);
								}}
							>
								<IconPencil size={16} />
							</ActionIcon>
						</Tooltip>
						<Tooltip label='View campaign'>
							<ActionIcon
								color='teal'
								radius='md'
								aria-label='View campaign'
								onClick={(e) => {
									e.stopPropagation();
									onView(campaign);
								}}
							>
								<IconEye size={16} />
							</ActionIcon>
						</Tooltip>
						<Menu shadow='md' width={200}>
							<Menu.Target>
								<ActionIcon
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
									leftSection={
										<ThemeIcon variant='light' color='violet' size={'xs'}>
											<IconChartDots size={14} />
										</ThemeIcon>
									}
								>
									View Metrics
								</Menu.Item>
								<Menu.Item
									onClick={(e) => {
										e.stopPropagation();
										onTestCall(campaign);
									}}
									leftSection={
										<ThemeIcon variant='light' color='green' size={'xs'}>
											<IconPhone size={14} />
										</ThemeIcon>
									}
								>
									Test Call
								</Menu.Item>
								<Menu.Item
									onClick={(e) => {
										e.stopPropagation();
										onClone(campaign);
									}}
									leftSection={
										<ThemeIcon variant='light' color='orange' size={'xs'}>
											<IconCopy size={14} />
										</ThemeIcon>
									}
								>
									Clone Campaign
								</Menu.Item>
								<Menu.Divider />
								<Menu.Item
									onClick={(e) => {
										e.stopPropagation();
										onDelete(campaign);
									}}
									leftSection={
										<ThemeIcon variant='light' color='red' size={'xs'}>
											<IconTrash size={14} />
										</ThemeIcon>
									}
									color='red'
								>
									Delete
								</Menu.Item>
							</Menu.Dropdown>
						</Menu>
					</Group>
				);
			},
			size: 100,
			enableSorting: false,
		},
	];
};
