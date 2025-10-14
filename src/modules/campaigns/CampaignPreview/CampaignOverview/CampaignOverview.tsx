import React from 'react';
import {
	Text,
	Badge,
	Stack,
	Group,
	ThemeIcon,
	Button,
	Skeleton,
} from '@mantine/core';
import {
	IconArrowUpRight,
	IconPlayerPause,
	IconPlayerPlay,
} from '@tabler/icons-react';
import classes from './CampaignOverview.module.css';
import type { Campaign } from '../../../../models/CampaignsModel';
import { CampaignStatus } from '~/models/CampaignStatus';
import {
	useGetCampaign,
	usePauseOutboundCampaign,
	useResumeOutboundCampaign,
	useStartOutboundCampaign,
} from '~/queries/campaignsQueries';
import { notifications } from '@mantine/notifications';

interface CampaignOverviewProps {
	campaign: Campaign;
}

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

	// Get campaign status from fresh query data
	const status = campaignData?.status?.toUpperCase() as CampaignStatus;
	const isMutating = isPausing || isResuming || isStarting;

	// Determine button configuration based on status
	const getButtonConfig = () => {
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
					disabled: false,
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
					color: 'blue',
					variant: 'filled',
					icon: IconPlayerPlay,
					disabled: true,
				};
		}
	};

	const buttonConfig = getButtonConfig();

	// Generic mutation callbacks
	const onSuccess = (action: string) => {
		notifications.show({
			title: 'Success',
			message: `Campaign ${action} successfully`,
			color: 'green',
		});
		refetch();
	};

	const onError = (error: any, action: string) => {
		notifications.show({
			title: 'Error',
			message: error?.response?.data?.message || `Failed to ${action} campaign`,
			color: 'red',
		});
		console.error(`Error ${action} campaign:`, error);
	};

	const handleToggle = () => {
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
	};

	// Show skeleton while loading
	if (isLoading) {
		return (
			<Stack gap={4} align='center' className={classes.simpleCard}>
				<Skeleton height={12} width={60} radius='sm' />
				<Skeleton height={24} width={200} radius='sm' mt={4} />
				<Group gap='sm' align='center' mt={4}>
					<Skeleton height={28} width={100} radius='xl' />
					<Skeleton height={32} width={90} radius='sm' />
				</Group>
			</Stack>
		);
	}

	return (
		<Stack gap={4} align='center' className={classes.simpleCard}>
			<Text size='xs' c='dimmed' mb={2}>
				Campaign
			</Text>

			<Group gap={8} align='center'>
				<Text fw={700} size='lg' className={classes.campaignName}>
					{campaignData?.name}
				</Text>
			</Group>

			<Group gap='sm' align='center'>
				<Badge
					variant='light'
					color='gray'
					size='md'
					radius='xl'
					p='md'
					className={classes.outboundBadge}
					leftSection={null}
					rightSection={
						<>
							{campaignData?.type === 'OUTBOUND' && (
								<ThemeIcon variant='transparent' color='green' size={'xs'}>
									<IconArrowUpRight />
								</ThemeIcon>
							)}
							{campaignData?.type === 'INBOUND' && (
								<ThemeIcon variant='transparent' color='blue' size={'xs'}>
									<IconArrowUpRight />
								</ThemeIcon>
							)}
						</>
					}
					style={{ gap: 4, fontWeight: 500, alignContent: 'center' }}
				>
					{(campaignData as Campaign)?.type?.charAt(0) +
						(campaignData as Campaign)?.type?.slice(1).toLowerCase()}
				</Badge>

				<Button
					variant={buttonConfig.variant as any}
					color={buttonConfig.color}
					size='sm'
					disabled={buttonConfig.disabled || isMutating}
					loading={isMutating}
					leftSection={<buttonConfig.icon size={14} />}
					onClick={handleToggle}
					className={classes.toggleButton}
				>
					{buttonConfig.label}
				</Button>
			</Group>
		</Stack>
	);
};

export default CampaignOverview;
