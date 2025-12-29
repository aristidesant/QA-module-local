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
	IconFileDescription,
	IconSettings,
} from '@tabler/icons-react';
import type { Campaign } from '~/models/CampaignsModel';
// useNavigate removed; no client-side navigation from columns
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import {
	CampaignStatus,
	CampaignStatusConfig,
	CampaignStatusConfigType,
} from '~/models/CampaignStatus';
import { timeAgo } from '~/utils/dateUtils';
import { useTranslation } from 'react-i18next';

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
		label: status || 'status.UNKNOWN',
	};
};

interface UseCampaignsColumnsProps {
	onEdit: (campaign: Campaign) => void;
	onView: (campaign: Campaign) => void;
	onTestCall: (campaign: Campaign) => void;
	onDelete: (campaign: Campaign) => void;
	onClone: (campaign: Campaign) => void;
	onContinueDraft?: (campaign: Campaign) => void;
}

export const useCampaignsColumns = ({
	onEdit,
	onView,
	onTestCall,
	onDelete,
	onClone,
	onContinueDraft,
}: UseCampaignsColumnsProps): ColumnDef<Campaign, any>[] => {
	const { t } = useTranslation('campaigns');
	// navigate unused after removing Metrics navigation
	const { canAccessModule, canPerformAction } = usePermissions();
	return [
		{
			accessorKey: 'name',
			header: t('columns.campaign'),
			cell: ({ row }) => {
				const campaign = row.original;
				return (
					<Group gap='sm' wrap='nowrap'>
						<HoverCard width={280} shadow='none' withArrow position='right'>
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
											{t('columns.campaignDetails')}
										</Text>
										<Badge size='xs' variant='outline' color='gray'>
											ID: {campaign.id}
										</Badge>
									</Group>
									<Text size='xs' c='dimmed'>
										{campaign.description || t('columns.noDescription')}
									</Text>
								</Stack>
							</HoverCard.Dropdown>
						</HoverCard>
						<Text size='sm' fw={500} lineClamp={1}>
							{campaign.name}
						</Text>
						{campaign.isDraft && (
							<Tooltip
								label={t('columns.setupIncomplete', {
									step: (campaign.draftStep ?? 0) + 1,
								})}
							>
								<Badge
									variant='light'
									color='red'
									size='md'
									leftSection={<IconFileDescription size={12} />}
								>
									{t('columns.draft')}
								</Badge>
							</Tooltip>
						)}
					</Group>
				);
			},
			size: 300,
		},
		{
			accessorKey: 'type',
			header: t('columns.type'),
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
						{isOutbound ? t('columns.outbound') : t('columns.inbound')}
					</Badge>
				);
			},
			size: 140,
		},
		{
			accessorKey: 'updatedAt',
			header: t('columns.lastUpdated'),
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
						{campaign.isDraft && onContinueDraft && (
							<Tooltip label={t('columns.continueSetup')}>
								<ActionIcon
									color='red'
									radius='md'
									aria-label={t('columns.continueSetup')}
									onClick={(e) => {
										e.stopPropagation();
										onContinueDraft(campaign);
									}}
								>
									<IconSettings size={16} />
								</ActionIcon>
							</Tooltip>
						)}
						{canAccessModule(ModuleEnum.CAMPAIGNS) && (
							<Tooltip
								label={
									campaign.isDraft
										? t('columns.completeSetupFirst')
										: t('columns.viewCampaign')
								}
							>
								<ActionIcon
									color='teal'
									radius='md'
									aria-label={t('columns.viewCampaign')}
									disabled={campaign.isDraft}
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
							<Tooltip
								label={
									campaign.isDraft
										? t('columns.completeSetupFirst')
										: t('columns.editCampaign')
								}
							>
								<ActionIcon
									color='blue'
									radius='md'
									aria-label={t('columns.editCampaign')}
									disabled={campaign.isDraft}
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
							<Tooltip
								label={
									campaign.isDraft
										? t('columns.completeSetupFirst')
										: t('columns.testCall')
								}
							>
								<ActionIcon
									color='green'
									radius='md'
									aria-label={t('columns.testCall')}
									disabled={campaign.isDraft}
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
							<Tooltip
								label={
									campaign.isDraft
										? t('columns.completeSetupFirst')
										: t('columns.cloneCampaign')
								}
							>
								<ActionIcon
									color='orange'
									radius='md'
									aria-label={t('columns.cloneCampaign')}
									disabled={campaign.isDraft}
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
							<Tooltip label={t('columns.deleteCampaign')}>
								<ActionIcon
									color='red'
									radius='md'
									aria-label={t('columns.deleteCampaign')}
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
