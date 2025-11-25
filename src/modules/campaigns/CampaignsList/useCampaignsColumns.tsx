import { ColumnDef } from '@tanstack/react-table';
import {
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
import { timeAgo } from '~/utils/dateUtils';

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
					<Badge
						variant='light'
						color={isOutbound ? 'teal' : 'violet'}
						size='md'
						radius='sm'
						leftSection={
							isOutbound ? (
								<IconArrowUpRight size={14} />
							) : (
								<IconArrowDownLeft size={14} />
							)
						}
					>
						{isOutbound ? 'Outbound' : 'Inbound'}
					</Badge>
				);
			},
			size: 140,
		},
		{
			accessorKey: 'updatedAt',
			header: 'Last Updated',
			cell: ({ row }) => {
				const campaign = row.original;
				return (
					<Text size='sm' c='dimmed'>
						{timeAgo(campaign.updatedAt)}
					</Text>
				);
			},
			size: 140,
		},
		{
			id: 'actions',
			header: '',
			cell: ({ row }) => {
				const campaign = row.original;
				return (
					<Group gap='xs' justify='end'>
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
