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

	// Check campaign status directly from campaignData (use fresh data from query)
	const status = campaignData?.status?.toLowerCase().trim();
	const isRunning = status === 'running';
	const isCompleted = status === 'completed';
	const isInactive = status === 'inactive';
	const isPaused = status === 'paused';
	const isActive = status === 'active';
	const isDisabled = isCompleted || isInactive;
	const isPending = isPausing || isResuming || isStarting;

	const handleToggle = () => {
		if (isRunning) {
			// Campaign is running, pause it
			pauseCampaign(campaign?.id, {
				onSuccess: () => {
					notifications.show({
						title: 'Success',
						message: 'Campaign paused successfully',
						color: 'green',
					});
					refetch(); // Refetch to update UI
				},
				onError: (error) => {
					notifications.show({
						title: 'Error',
						message:
							// @ts-ignore
							error?.response?.data?.message || 'Failed to pause campaign',
						color: 'red',
					});
					console.error('Error pausing campaign:', error);
				},
			});
		} else if (isPaused) {
			// Campaign is paused, resume it
			resumeCampaign(campaign?.id, {
				onSuccess: () => {
					notifications.show({
						title: 'Success',
						message: 'Campaign resumed successfully',
						color: 'green',
					});
					refetch(); // Refetch to update UI
				},
				onError: (error) => {
					notifications.show({
						title: 'Error',
						message:
							// @ts-ignore
							error?.response?.data?.message || 'Failed to resume campaign',
						color: 'red',
					});
					console.error('Error resuming campaign:', error);
				},
			});
		} else if (isActive) {
			// Campaign is active but not running, start it
			startCampaign(campaign?.id, {
				onSuccess: () => {
					notifications.show({
						title: 'Success',
						message: 'Campaign started successfully',
						color: 'green',
					});
					refetch(); // Refetch to update UI
				},
				onError: (error) => {
					notifications.show({
						title: 'Error',
						message:
							// @ts-ignore
							error?.response?.data?.message || 'Failed to start campaign',
						color: 'red',
					});
					console.error('Error starting campaign:', error);
				},
			});
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
					variant={isRunning ? 'light' : 'filled'}
					color={isRunning ? 'red' : isActive || isPaused ? 'green' : 'blue'}
					size='sm'
					disabled={isDisabled || isPending}
					loading={isPending}
					leftSection={
						isRunning ? (
							<IconPlayerPause size={14} />
						) : (
							<IconPlayerPlay size={14} />
						)
					}
					onClick={handleToggle}
					className={classes.toggleButton}
				>
					{isCompleted
						? 'Completed'
						: isInactive
							? 'Inactive'
							: isActive
								? 'Start'
								: isRunning
									? 'Pause'
									: isPaused
										? 'Resume'
										: 'Start'}
				</Button>
			</Group>
		</Stack>
	);
};

export default CampaignOverview;
