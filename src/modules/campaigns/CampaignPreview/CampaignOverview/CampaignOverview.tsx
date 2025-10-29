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
import type { Campaign } from '../../../../models/CampaignsModel';
import { CampaignStatus, CampaignStatusConfig } from '~/models/CampaignStatus';
import {
	useGetCampaign,
	useGetCampaignRequirements,
	usePauseOutboundCampaign,
	useResumeOutboundCampaign,
	useStartOutboundCampaign,
} from '~/queries/campaignsQueries';
import { notifications } from '@mantine/notifications';
import RightSectionCard from '~/components/RightSectionCard';
import CleanQueueButton from '../CleanQueueButton';
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
		console.error('Date formatting error:', error);
		return value;
	}
};

const CampaignOverview: React.FC<CampaignOverviewProps> = ({ campaign }) => {
	const {
		data: campaignData,
		refetch,
		isLoading,
	} = useGetCampaign(`${campaign?.id}`);
	const { mutate: pauseCampaign, isPending: isPausing } =
		usePauseOutboundCampaign();
	const { mutate: resumeCampaign, isPending: isResuming } =
		useResumeOutboundCampaign();
	const { mutate: startCampaign, isPending: isStarting } =
		useStartOutboundCampaign();
	const {
		data: requirements,
		isLoading: isLoadingRequirements,
		error: requirementsError,
	} = useGetCampaignRequirements(`${campaign?.id}`);

	const displayCampaign = campaignData ?? campaign;
	const status = (campaignData?.status ?? campaign.status) as
		| CampaignStatus
		| undefined;
	const isActionMutating = isPausing || isResuming || isStarting;
	const campaignId = String(displayCampaign?.id ?? campaign.id);
	const campaignNumericId = Number(displayCampaign?.id ?? campaign.id);
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
			case CampaignStatus.RUNNING:
				return {
					label: 'Pause',
					color: 'red',
					variant: 'light',
					icon: IconPlayerPause,
					disabled: false,
				};
			case CampaignStatus.PAUSED:
				return {
					label: 'Resume',
					color: 'green',
					variant: 'filled',
					icon: IconPlayerPlay,
					disabled: false,
				};
			case CampaignStatus.PENDING:
				return {
					label: 'Start',
					color: 'green',
					variant: 'filled',
					icon: IconPlayerPlay,
					disabled: isStartDisabled,
				};
			case CampaignStatus.COMPLETED:
				return {
					label: 'Completed',
					color: 'gray',
					variant: 'filled',
					icon: IconPlayerPlay,
					disabled: true,
				};
			case CampaignStatus.FAILED:
				return {
					label: 'Failed',
					color: 'gray',
					variant: 'filled',
					icon: IconPlayerPlay,
					disabled: true,
				};
			default:
				return {
					label: 'Start',
					color: 'gray',
					variant: 'filled',
					icon: IconPlayerPlay,
					disabled: true,
				};
		}
	}, [isStartDisabled, status]);

	const onSuccess = useCallback(
		(action: string) => {
			notifications.show({
				title: 'Success',
				message: `Campaign ${action} successfully`,
				color: 'green',
			});
			refetch();
		},
		[refetch]
	);

	const onError = useCallback((error: unknown, action: string) => {
		const defaultMessage = `Failed to ${action} campaign`;
		const apiMessage =
			typeof error === 'object' && error !== null && 'response' in error
				? // @ts-expect-error -- safe guarded access
					(error.response?.data?.message ?? defaultMessage)
				: defaultMessage;

		notifications.show({
			title: 'Error',
			message: apiMessage,
			color: 'red',
		});
		console.error(`Error ${action} campaign:`, error);
	}, []);

	const handleToggle = useCallback(() => {
		switch (status) {
			case CampaignStatus.RUNNING:
				pauseCampaign(campaign?.id, {
					onSuccess: () => onSuccess('paused'),
					onError: (error) => onError(error, 'pause'),
				});
				break;
			case CampaignStatus.PAUSED:
				resumeCampaign(campaign?.id, {
					onSuccess: () => onSuccess('resumed'),
					onError: (error) => onError(error, 'resume'),
				});
				break;
			case CampaignStatus.PENDING:
				startCampaign(campaign?.id, {
					onSuccess: () => onSuccess('started'),
					onError: (error) => onError(error, 'start'),
				});
				break;
			default:
				break;
		}
	}, [
		campaign?.id,
		onError,
		onSuccess,
		pauseCampaign,
		resumeCampaign,
		startCampaign,
		status,
	]);

	const statusConfig =
		(status && CampaignStatusConfig[status]) ??
		({
			label: 'Unknown',
			color: 'gray',
			icon: IconInfoCircle,
		} as const);

	const StatusIcon = statusConfig.icon;

	const typeLabel = useMemo(() => {
		if (!displayCampaign?.type) {
			return 'Unknown';
		}

		const label =
			displayCampaign.type.charAt(0) +
			displayCampaign.type.slice(1).toLowerCase();
		return label;
	}, [displayCampaign?.type]);

	const metaItems = useMemo(
		() => [
			{
				label: 'Agent',
				value: displayCampaign?.agentName ?? 'Not assigned',
			},
			{
				label: 'Owner',
				value: displayCampaign?.user?.username ?? '—',
			},
			{
				label: 'Created',
				value: formatDate(displayCampaign?.createdAt),
			},
			{
				label: 'Last updated',
				value: formatDate(displayCampaign?.updatedAt),
			},
		],
		[
			displayCampaign?.agentName,
			displayCampaign?.createdAt,
			displayCampaign?.updatedAt,
			displayCampaign?.user?.username,
		]
	);

	const progressValue = Number.isFinite(displayCampaign?.progress)
		? Math.min(Math.max(Number(displayCampaign?.progress), 0), 100)
		: null;

	// Show skeleton while loading
	if (isLoading) {
		return (
			<RightSectionCard
				title='Campaign overview'
				description='Status and operational readiness'
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
			title='Campaign overview'
			description='Status and operational readiness'
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
									<span>{statusConfig.label}</span>
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
							<Text className={classes.progressLabel}>Progress</Text>
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
				<CleanQueueButton
					campaignId={campaignNumericId}
					className={classes.actionButton}
				/>

				{/* Health Section */}
				<div className={classes.healthSection}>
					<Text className={classes.healthTitle}>Operational Health</Text>
					<CampaignHealth campaignId={campaignId} />
				</div>
			</Stack>
		</RightSectionCard>
	);
};

export default CampaignOverview;
