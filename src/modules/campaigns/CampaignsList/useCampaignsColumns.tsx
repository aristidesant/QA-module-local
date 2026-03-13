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
	Divider,
	Menu,
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
	IconPlayerPlay,
	IconPlayerPause,
	IconDotsVertical,
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
import { timeAgo, formatExpirationDate as formatDate } from '~/utils/dateUtils';
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
	onToggleStatus?: (campaign: Campaign) => void;
}

export const useCampaignsColumns = ({
	onEdit,
	onView,
	onTestCall,
	onDelete,
	onClone,
	onContinueDraft,
	onToggleStatus,
}: UseCampaignsColumnsProps): ColumnDef<Campaign, any>[] => {
	const { t } = useTranslation('campaigns.list');
	// navigate unused after removing Metrics navigation
	const { canAccessModule, canPerformAction } = usePermissions();
	return [
		{
			accessorKey: 'name',
			header: t('columns.campaign'),
			cell: ({ row }) => {
				const campaign = row.original;
				return (
					<Group gap={8} wrap='nowrap'>
						<HoverCard
							width={260}
							shadow='sm'
							withArrow
							position='right'
							openDelay={120}
						>
							<HoverCard.Target>
								<ThemeIcon
									variant='light'
									color='blue'
									size='sm'
									radius='xl'
									style={{ cursor: 'pointer' }}
									data-testid='campaign-info-trigger'
								>
									<IconInfoCircle size={14} />
								</ThemeIcon>
							</HoverCard.Target>
							<HoverCard.Dropdown p='sm'>
								<Stack gap={8}>
									<Group justify='space-between' wrap='nowrap'>
										<Text size='xs' fw={700}>
											{t('columns.campaignDetails')}
										</Text>
										<Badge
											size='xs'
											variant='light'
											color='blue'
											radius='sm'
											style={{ textTransform: 'none' }}
										>
											ID: {campaign.id}
										</Badge>
									</Group>

									<Text size='xs' c='dimmed' lineClamp={3}>
										{campaign.description || t('columns.noDescription')}
									</Text>

									<Divider variant='dashed' />

									<Stack gap={6}>
										<Group gap={6} wrap='nowrap'>
											<Text size='xs' fw={600} c='dimmed'>
												{t('columns.createdBy')}:
											</Text>
											<Text size='xs' fw={500}>
												{campaign.user?.username || t('columns.noUser')}
											</Text>
										</Group>

										<Group gap={6} wrap='nowrap'>
											<Text size='xs' fw={600} c='dimmed'>
												{t('columns.createdOn')}:
											</Text>
											<Text size='xs' fw={500}>
												{formatDate(campaign.createdAt)}
											</Text>
										</Group>

										<Group gap={6} wrap='nowrap'>
											<Text size='xs' fw={600} c='dimmed'>
												{t('columns.type')}:
											</Text>
											<Badge
												size='xs'
												variant='dot'
												color={campaign.type === 'OUTBOUND' ? 'teal' : 'violet'}
											>
												{campaign.type === 'OUTBOUND'
													? t('columns.outbound')
													: t('columns.inbound')}
											</Badge>
										</Group>
									</Stack>
								</Stack>
							</HoverCard.Dropdown>
						</HoverCard>
						<Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
							<Text size='sm' fw={600} lineClamp={1}>
								{campaign.name}
							</Text>
						</Stack>
						{campaign.isDraft && (
							<Tooltip
								label={t('columns.setupIncomplete', {
									step: (campaign.draftStep ?? 0) + 1,
								})}
							>
								<Badge
									variant='light'
									color='red'
									size='sm'
									radius='sm'
									leftSection={<IconFileDescription size={10} />}
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
						size='sm'
						radius='sm'
						leftSection={
							isOutbound ? (
								<IconArrowUpRight size={12} />
							) : (
								<IconArrowDownLeft size={12} />
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
			accessorKey: 'status',
			header: t('columns.status'),
			cell: ({ row }) => {
				const campaign = row.original;
				const statusInfo = getCampaignStatusInfo(campaign.status);
				const StatusIcon = statusInfo.icon;
				return (
					<Badge
						variant='light'
						color={statusInfo.color}
						size='sm'
						radius='sm'
						leftSection={<StatusIcon size={12} />}
					>
						{t(statusInfo.label)}
					</Badge>
				);
			},
			size: 120,
		},
		{
			accessorKey: 'updatedAt',
			header: t('columns.lastUpdated'),
			cell: ({ row }) => {
				const campaign = row.original;
				return (
					<Text size='xs' c='dimmed' fw={500}>
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
				const isDraft = campaign.isDraft;
				const isActive = campaign.status === CampaignStatus.ACTIVE;

				const canContinueDraft = isDraft && Boolean(onContinueDraft);
				const canViewCampaign =
					canAccessModule(ModuleEnum.CAMPAIGNS) && !isDraft;
				const canEditCampaign =
					canPerformAction(ModuleEnum.CAMPAIGNS, PermissionEnum.UPDATE) &&
					!isDraft;
				const canTestCallCampaign =
					canAccessModule(ModuleEnum.CAMPAIGNS) && !isDraft;
				const canCloneCampaign =
					canPerformAction(ModuleEnum.CAMPAIGNS, PermissionEnum.CREATE) &&
					!isDraft;
				const canDeleteCampaign = canPerformAction(
					ModuleEnum.CAMPAIGNS,
					PermissionEnum.DELETE
				);
				const canToggleCampaignStatus =
					canPerformAction(ModuleEnum.CAMPAIGNS, PermissionEnum.UPDATE) &&
					Boolean(onToggleStatus) &&
					!isDraft;

				const hasMenuActions =
					canTestCallCampaign ||
					canCloneCampaign ||
					canToggleCampaignStatus ||
					canDeleteCampaign;

				return (
					<Group gap={4} justify='end' wrap='nowrap'>
						{canContinueDraft && (
							<Tooltip label={t('columns.continueSetup')}>
								<ActionIcon
									variant='subtle'
									color='gray'
									radius='xl'
									size='sm'
									aria-label={t('columns.continueSetup')}
									visibleFrom='sm'
									onClick={(e) => {
										e.stopPropagation();
										onContinueDraft?.(campaign);
									}}
								>
									<IconSettings size={14} />
								</ActionIcon>
							</Tooltip>
						)}
						{canViewCampaign && (
							<Tooltip label={t('columns.viewCampaign')}>
								<ActionIcon
									variant='subtle'
									color='gray'
									radius='xl'
									size='sm'
									aria-label={t('columns.viewCampaign')}
									visibleFrom='sm'
									onClick={(e) => {
										e.stopPropagation();
										onView(campaign);
									}}
								>
									<IconEye size={14} />
								</ActionIcon>
							</Tooltip>
						)}
						{canEditCampaign && (
							<Tooltip label={t('columns.editCampaign')}>
								<ActionIcon
									variant='subtle'
									color='gray'
									radius='xl'
									size='sm'
									aria-label={t('columns.editCampaign')}
									visibleFrom='sm'
									onClick={(e) => {
										e.stopPropagation();
										onEdit(campaign);
									}}
								>
									<IconPencil size={14} />
								</ActionIcon>
							</Tooltip>
						)}

						{hasMenuActions && (
							<Menu shadow='md' position='bottom-end' withinPortal>
								<Menu.Target>
									<ActionIcon
										variant='subtle'
										color='gray'
										radius='xl'
										size='sm'
										aria-label={t('columns.moreActions')}
										onClick={(e) => e.stopPropagation()}
									>
										<IconDotsVertical size={14} />
									</ActionIcon>
								</Menu.Target>

								<Menu.Dropdown onClick={(e) => e.stopPropagation()}>
									{(canTestCallCampaign || canCloneCampaign) && (
										<>
											<Menu.Label>{t('columns.actionsGroupManage')}</Menu.Label>
											{canTestCallCampaign && (
												<Menu.Item
													leftSection={<IconPhone size={14} />}
													onClick={() => onTestCall(campaign)}
												>
													{t('columns.testCall')}
												</Menu.Item>
											)}
											{canCloneCampaign && (
												<Menu.Item
													leftSection={<IconCopy size={14} />}
													onClick={() => onClone(campaign)}
												>
													{t('columns.cloneCampaign')}
												</Menu.Item>
											)}
										</>
									)}

									{canToggleCampaignStatus && (
										<>
											<Menu.Divider />
											<Menu.Label>{t('columns.actionsGroupStatus')}</Menu.Label>
											<Menu.Item
												leftSection={
													isActive ? (
														<IconPlayerPause size={14} />
													) : (
														<IconPlayerPlay size={14} />
													)
												}
												onClick={() => onToggleStatus?.(campaign)}
											>
												{isActive
													? t('toggleStatus.deactivate')
													: t('toggleStatus.activate')}
											</Menu.Item>
										</>
									)}

									{canDeleteCampaign && (
										<>
											<Menu.Divider />
											<Menu.Label>{t('columns.actionsGroupDanger')}</Menu.Label>
											<Menu.Item
												color='red'
												leftSection={<IconTrash size={14} />}
												onClick={() => onDelete(campaign)}
											>
												{t('columns.deleteCampaign')}
											</Menu.Item>
										</>
									)}
								</Menu.Dropdown>
							</Menu>
						)}
					</Group>
				);
			},
			size: 108,
			enableSorting: false,
		},
	];
};
