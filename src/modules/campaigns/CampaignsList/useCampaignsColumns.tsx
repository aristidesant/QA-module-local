import { ColumnDef } from '@tanstack/react-table';
import {
	Tooltip,
	ActionIcon,
	Group,
	Text,
	Badge,
	ThemeIcon,
	HoverCard,
	Stack,
} from '@mantine/core';
import {
	IconTrash,
	IconCheck,
	IconArrowUpRight,
	IconArrowDownLeft,
	IconCopy,
	IconPhone,
	IconInfoCircle,
	IconEye,
	IconPencil,
} from '@tabler/icons-react';
import type { Campaign } from '~/models/CampaignsModel';
// useNavigate removed; no client-side navigation from columns
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/contants/ModuleEnum';
import { PermissionEnum } from '~/contants/PermissionEnum';
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
	// navigate unused after removing Metrics navigation
	const { canAccessModule, canPerformAction } = usePermissions();
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
						{canAccessModule(ModuleEnum.CAMPAIGNS) && (
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
						)}
						{canPerformAction(ModuleEnum.CAMPAIGNS, PermissionEnum.UPDATE) && (
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
						)}
						{/* Inline action icons (replacing the 3-dot menu) */}
						{canAccessModule(ModuleEnum.CAMPAIGNS) && (
							<Tooltip label='Test Call'>
								<ActionIcon
									color='green'
									radius='md'
									aria-label='Test Call'
									onClick={(e) => {
										e.stopPropagation();
										onTestCall(campaign);
									}}
								>
									<IconPhone size={16} />
								</ActionIcon>
							</Tooltip>
						)}
						{canPerformAction(ModuleEnum.CAMPAIGNS, PermissionEnum.CREATE) && (
							<Tooltip label='Clone campaign'>
								<ActionIcon
									color='orange'
									radius='md'
									aria-label='Clone campaign'
									onClick={(e) => {
										e.stopPropagation();
										onClone(campaign);
									}}
								>
									<IconCopy size={16} />
								</ActionIcon>
							</Tooltip>
						)}
						{canPerformAction(ModuleEnum.CAMPAIGNS, PermissionEnum.DELETE) && (
							<Tooltip label='Delete campaign'>
								<ActionIcon
									color='red'
									radius='md'
									aria-label='Delete campaign'
									onClick={(e) => {
										e.stopPropagation();
										onDelete(campaign);
									}}
								>
									<IconTrash size={16} />
								</ActionIcon>
							</Tooltip>
						)}
					</Group>
				);
			},
			size: 100,
			enableSorting: false,
		},
	];
};
