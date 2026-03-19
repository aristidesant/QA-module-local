import React, { useCallback, useMemo } from 'react';
import {
	Text,
	Badge,
	Stack,
	Group,
	Button,
	Skeleton,
	Progress,
	Flex,
} from '@mantine/core';
import {
	IconPlayerPause,
	IconPlayerPlay,
	IconInfoCircle,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { Campaign } from '../../../../models/CampaignsModel';
import { CampaignStatus, CampaignStatusConfig } from '~/models/CampaignStatus';
import {
	useGetCampaign,
	useGetCampaignRequirements,
	usePauseOutboundCampaign,
	useStartOutboundCampaign,
	useToggleCampaignStatus,
} from '~/queries/campaignsQueries';
import { notifications } from '@mantine/notifications';
import RightSectionCard from '~/components/RightSectionCard';
import CampaignHealth from '../../CampaignHealth';
import classes from './CampaignOverview.module.css';

interface CampaignOverviewProps {
	campaign: Campaign;
}

type IconComponent = React.ComponentType<{ size?: number }>;

type ButtonConfig = {
	label: string;
	color: 'green' | 'red' | 'gray' | 'blue';
	variant: 'light' | 'filled';
	disabled: boolean;
	icon: IconComponent;
};

const formatDate = (value?: string) => {
	if (!value) {
		return '—';
	}

	try {
		return new Intl.DateTimeFormat(undefined, {
			dateStyle: 'medium',
			timeStyle: 'short',
		}).format(new Date(value));
	} catch (error) {
		void error;
		return value;
	}
};

const CampaignOverview: React.FC<CampaignOverviewProps> = ({ campaign }) => {
	const { t } = useTranslation(['campaign.detail', 'campaigns.list']);
	const {
		data: campaignData,
		refetch,
		isLoading,
	} = useGetCampaign(`${campaign?.id}`);
	const { mutate: pauseCampaign, isPending: isPausing } =
		usePauseOutboundCampaign();
	const { mutate: startCampaign, isPending: isStarting } =
		useStartOutboundCampaign();
	const { mutate: toggleCampaignStatus, isPending: isToggling } =
		useToggleCampaignStatus();
	const {
		data: requirements,
		isLoading: isLoadingRequirements,
		error: requirementsError,
	} = useGetCampaignRequirements(`${campaign?.id}`);

	const displayCampaign = campaignData ?? campaign;
	const status = (campaignData?.status ?? campaign.status) as
		| CampaignStatus
		| undefined;
	const isInbound = displayCampaign?.type === 'INBOUND';
	const isActionMutating = isPausing || isStarting || isToggling;
	const campaignId = String(displayCampaign?.id ?? campaign.id);
	const campaignNumericId = displayCampaign?.id ?? campaign.id;
	const contactGroupId = displayCampaign?.contactList?.id;
	const isStartDisabled = useMemo(() => {
		if (isLoadingRequirements) {
			return true;
		}

		if (requirementsError) {
			return true;
		}

		return !(requirements?.canRun ?? false);
	}, [isLoadingRequirements, requirementsError, requirements?.canRun]);

	const buttonConfig = useMemo<ButtonConfig>(() => {
		switch (status) {
			case CampaignStatus.ACTIVE:
				return {
					label: t('preview.overview.actions.pause'),
					color: 'red',
					variant: 'light',
					icon: IconPlayerPause,
					disabled: false,
				};
			case CampaignStatus.INACTIVE:
				return {
					label: t('preview.overview.actions.start'),
					color: 'green',
					variant: 'filled',
					icon: IconPlayerPlay,
					disabled: isStartDisabled,
				};
			case CampaignStatus.FAILED:
				return {
					label: t('preview.overview.actions.failed'),
					color: 'gray',
					variant: 'filled',
					icon: IconPlayerPlay,
					disabled: true,
				};
			default:
				return {
					label: t('preview.overview.actions.start'),
					color: 'gray',
					variant: 'filled',
					icon: IconPlayerPlay,
					disabled: true,
				};
		}
	}, [isStartDisabled, status, t]);

	const onSuccess = useCallback(
		(action: string) => {
			notifications.show({
				title: t('preview.overview.notifications.success'),
				message: t('preview.overview.notifications.campaignActioned', {
					action,
				}),
				color: 'green',
			});
			refetch();
		},
		[refetch, t]
	);

	const onError = useCallback(
		(error: unknown, action: string) => {
			const defaultMessage = t(
				'preview.overview.notifications.failedToAction',
				{ action }
			);
			const apiMessage =
				typeof error === 'object' && error !== null && 'response' in error
					? // @ts-expect-error -- safe guarded access
						(error.response?.data?.message ?? defaultMessage)
					: defaultMessage;

			notifications.show({
				title: t('preview.overview.notifications.error'),
				message: apiMessage,
				color: 'red',
			});
			void error;
		},
		[t]
	);

	const ensureContactGroup = useCallback(
		(action: string) => {
			if (!campaignNumericId || !contactGroupId) {
				notifications.show({
					title: t('preview.overview.notifications.unavailable'),
					message: t('preview.overview.notifications.noContactList'),
					color: 'yellow',
				});
				void action;
				return false;
			}
			return true;
		},
		[campaignNumericId, contactGroupId, t]
	);

	const handleToggle = useCallback(() => {
		// Inbound campaigns don't use contact lists, use toggle-status API
		if (isInbound) {
			const action = status === CampaignStatus.ACTIVE ? 'inactive' : 'activate';
			const actionLabel =
				status === CampaignStatus.ACTIVE ? 'paused' : 'started';
			toggleCampaignStatus(
				{ campaignId: campaignNumericId, action },
				{
					onSuccess: () => onSuccess(actionLabel),
					onError: (error) => onError(error, actionLabel),
				}
			);
			return;
		}

		// Outbound campaigns require a contact list
		switch (status) {
			case CampaignStatus.ACTIVE:
				if (!ensureContactGroup('pause')) {
					return;
				}
				pauseCampaign(
					{
						campaignId: campaignNumericId,
						contactGroupId: contactGroupId!,
					},
					{
						onSuccess: () => onSuccess('paused'),
						onError: (error) => onError(error, 'pause'),
					}
				);
				break;
			case CampaignStatus.INACTIVE:
				if (!ensureContactGroup('start')) {
					return;
				}
				startCampaign(
					{
						campaignId: campaignNumericId,
						contactGroupId: contactGroupId!,
					},
					{
						onSuccess: () => onSuccess('started'),
						onError: (error) => onError(error, 'start'),
					}
				);
				break;
			default:
				break;
		}
	}, [
		campaignNumericId,
		contactGroupId,
		ensureContactGroup,
		isInbound,
		onError,
		onSuccess,
		pauseCampaign,
		startCampaign,
		status,
		toggleCampaignStatus,
	]);
	const statusConfig =
		(status && CampaignStatusConfig[status]) ??
		({
			label: 'Unknown',
			color: 'gray',
			icon: IconInfoCircle,
		} as const);

	const StatusIcon = statusConfig.icon;
	const statusLabel = useMemo(() => {
		if (!statusConfig?.label) {
			return t('status.UNKNOWN', { ns: 'campaigns.list' });
		}

		return t(statusConfig.label, {
			ns: 'campaigns.list',
			defaultValue: t('status.UNKNOWN', { ns: 'campaigns.list' }),
		});
	}, [statusConfig?.label, t]);

	const typeLabel = useMemo(() => {
		if (!displayCampaign?.type) {
			return t('preview.overview.unknown');
		}

		const label =
			displayCampaign.type.charAt(0) +
			displayCampaign.type.slice(1).toLowerCase();
		return label;
	}, [displayCampaign?.type, t]);

	const metaItems = useMemo(
		() => [
			{
				label: t('preview.overview.agent'),
				value: displayCampaign?.agentName ?? t('preview.overview.notAssigned'),
			},
			{
				label: t('preview.overview.owner'),
				value: displayCampaign?.user?.username ?? '—',
			},
			{
				label: t('preview.overview.created'),
				value: formatDate(displayCampaign?.createdAt),
			},
			{
				label: t('preview.overview.lastUpdated'),
				value: formatDate(displayCampaign?.updatedAt),
			},
		],
		[
			displayCampaign?.agentName,
			displayCampaign?.createdAt,
			displayCampaign?.updatedAt,
			displayCampaign?.user?.username,
			t,
		]
	);

	const progressValue = Number.isFinite(displayCampaign?.progress)
		? Math.min(Math.max(Number(displayCampaign?.progress), 0), 100)
		: null;

	// Show skeleton while loading
	if (isLoading) {
		return (
			<RightSectionCard
				title={t('preview.overview.title')}
				description={t('preview.overview.description')}
				icon={IconInfoCircle}
				iconColor='var(--mantine-color-blue-6)'
			>
				<Stack gap='sm' className={classes.content}>
					<Group justify='space-between' align='flex-start' wrap='nowrap'>
						<Stack gap={3} className={classes.overviewCopy}>
							<Skeleton height={18} width='60%' radius='sm' />
							<Skeleton height={10} width='80%' radius='sm' />
						</Stack>
						<Stack gap={4} className={classes.statusStack}>
							<Skeleton height={20} width={100} radius='md' />
							<Skeleton height={16} width={80} radius='md' />
						</Stack>
					</Group>
					<Skeleton height={8} width='100%' radius='sm' />
					<Skeleton height={36} width='100%' radius='sm' />
				</Stack>
			</RightSectionCard>
		);
	}

	return (
		<RightSectionCard
			title={t('preview.overview.title')}
			description={t('preview.overview.description')}
			icon={IconInfoCircle}
			iconColor='var(--mantine-color-blue-6)'
		>
			<Stack gap='xs' className={classes.content}>
				{/* Header Section */}
				<Group
					justify='space-between'
					align='flex-start'
					wrap='nowrap'
					className={classes.topRow}
				>
					<Stack gap={'xs'} w={'100%'}>
						<Flex gap={2} direction={'column'}>
							<Text ta={'center'} className={classes.campaignName}>
								{displayCampaign?.name ?? 'Untitled campaign'}
							</Text>
							{displayCampaign?.description ? (
								<Text ta={'center'} className={classes.campaignDescription}>
									{displayCampaign.description}
								</Text>
							) : null}
						</Flex>
						<Group align='center' justify='center'>
							<Badge
								variant='filled'
								color={statusConfig.color}
								size='xs'
								className={`${classes.badge} ${classes.statusBadge}`}
							>
								<Group gap={3}>
									<StatusIcon size={11} />
									<span>{statusLabel}</span>
								</Group>
							</Badge>
							<Badge
								variant='light'
								color='gray'
								size='xs'
								className={`${classes.badge} ${classes.typeBadge}`}
							>
								{typeLabel}
							</Badge>
						</Group>
					</Stack>
				</Group>

				{/* Progress Bar */}
				{progressValue !== null ? (
					<div className={classes.progressSection}>
						<Group justify='space-between' align='center' gap='xs'>
							<Text className={classes.progressLabel}>
								{t('preview.overview.progress')}
							</Text>
							<Text className={classes.progressValue}>
								{Math.round(progressValue)}%
							</Text>
						</Group>
						<Progress
							value={progressValue}
							className={classes.progressBar}
							color='blue'
						/>
					</div>
				) : null}

				{/* Meta Information Grid */}
				<div className={classes.metaGrid}>
					{metaItems.map(({ label, value }) => (
						<div key={label} className={classes.metaItem}>
							<Text className={classes.metaLabel}>{label}</Text>
							<Text className={classes.metaValue}>{value}</Text>
						</div>
					))}
				</div>

				{/* Action Button */}
				<Button
					variant={buttonConfig.variant}
					color={buttonConfig.color}
					size='sm'
					disabled={buttonConfig.disabled || isActionMutating}
					loading={isActionMutating}
					leftSection={<buttonConfig.icon size={14} />}
					onClick={handleToggle}
					className={classes.actionButton}
				>
					{buttonConfig.label}
				</Button>

				{/* Health Section */}
				<div className={classes.healthSection}>
					<Text className={classes.healthTitle}>
						{t('preview.overview.operationalHealth')}
					</Text>
					<CampaignHealth campaignId={campaignId} />
				</div>
			</Stack>
		</RightSectionCard>
	);
};

export default CampaignOverview;
