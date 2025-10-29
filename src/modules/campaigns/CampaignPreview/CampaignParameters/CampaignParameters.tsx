import React from 'react';
import {
	Text,
	Stack,
	Group,
	Badge,
	Skeleton,
	ActionIcon,
	Tooltip,
} from '@mantine/core';
import { IconRefresh, IconMist } from '@tabler/icons-react';
import styles from './CampaignParameters.module.css';
import { useGetCampaignScheduleSummary } from '~/queries/campaignsQueries';
import { useCampaignsStore } from '~/stores/campaignsStore';
import RightSectionCard from '~/components/RightSectionCard';

type FormattedSchedule = {
	day: string;
	startHour: string;
	endHour: string;
};

type ParameterItem =
	| {
			key: string;
			label: string;
			type: 'status';
			display: string;
			color: string;
	  }
	| {
			key: string;
			label: string;
			type: 'text';
			display: string;
	  };

const CampaignParameters: React.FC = () => {
	const selectedCampaign = useCampaignsStore((state) => state.selectedCampaign);

	const {
		data: scheduleSummary,
		isLoading,
		refetch,
	} = useGetCampaignScheduleSummary(selectedCampaign?.id.toString() || '');

	const isCompleted = selectedCampaign?.status === 'COMPLETED';

	const handleRefetch = () => {
		if (!isCompleted) {
			refetch();
		}
	};

	const formatScheduleData = (): FormattedSchedule[] => {
		if (!scheduleSummary || scheduleSummary.length === 0) {
			return [];
		}

		const dayMap: Record<string, FormattedSchedule> = {};

		scheduleSummary.forEach((schedule) => {
			const dayKey = schedule.dayOfWeek.toLowerCase();
			if (!dayMap[dayKey]) {
				dayMap[dayKey] = {
					day: schedule.dayOfWeek,
					startHour: schedule.startHour,
					endHour: schedule.endHour,
				};
			}
		});

		const dayOrder = [
			'monday',
			'tuesday',
			'wednesday',
			'thursday',
			'friday',
			'saturday',
			'sunday',
		];

		return dayOrder
			.map((day) => dayMap[day])
			.filter(Boolean) as FormattedSchedule[];
	};

	const formatTime = (time: string) => {
		if (!time) return '';
		const [hours, minutes = '00'] = time.split(':');
		const hour = Number.parseInt(hours, 10);
		const ampm = hour >= 12 ? 'PM' : 'AM';
		const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
		return `${displayHour}:${minutes.padEnd(2, '0')} ${ampm}`;
	};

	const getDayAbbreviation = (day: string) => {
		const dayMap: Record<string, string> = {
			Monday: 'Mon',
			Tuesday: 'Tue',
			Wednesday: 'Wed',
			Thursday: 'Thu',
			Friday: 'Fri',
			Saturday: 'Sat',
			Sunday: 'Sun',
		};
		return dayMap[day] || day.slice(0, 3);
	};

	if (!selectedCampaign) {
		return (
			<RightSectionCard
				title='Schedule'
				description='Active dialing windows and call handling limits.'
				icon={IconMist}
			>
				<></>
			</RightSectionCard>
		);
	}

	const activeSchedules = formatScheduleData();
	const parameters = selectedCampaign.parameters;

	const parameterItems: ParameterItem[] = [
		parameters?.voicemailDetection !== undefined && {
			key: 'voicemailDetection',
			label: 'Voicemail detection',
			type: 'status',
			display: parameters.voicemailDetection ? 'Enabled' : 'Disabled',
			color: parameters.voicemailDetection ? 'teal' : 'gray',
		},
		parameters?.callRetries !== undefined && {
			key: 'callRetries',
			label: 'Call retries',
			type: 'text',
			display: `Up to ${parameters.callRetries} times`,
		},
		parameters?.maxConcurrentCalls != null && {
			key: 'maxConcurrentCalls',
			label: 'Max concurrent calls',
			type: 'text',
			display: `${parameters.maxConcurrentCalls} calls`,
		},
		parameters?.answerMachineDetection !== undefined && {
			key: 'answerMachineDetection',
			label: 'Answer machine detection',
			type: 'status',
			display: parameters.answerMachineDetection ? 'Enabled' : 'Disabled',
			color: parameters.answerMachineDetection ? 'teal' : 'gray',
		},
	].filter(Boolean) as ParameterItem[];

	if (isLoading) {
		return (
			<RightSectionCard
				title='Schedule'
				description='Active dialing windows and call handling limits.'
				icon={IconMist}
				rightSection={
					<Tooltip
						label={isCompleted ? 'Campaign is completed' : 'Refresh parameters'}
						withArrow
					>
						<ActionIcon
							variant='subtle'
							color='gray'
							size='sm'
							onClick={handleRefetch}
							disabled={isCompleted || isLoading}
							className={styles.refetchButton}
						>
							<IconRefresh size={14} />
						</ActionIcon>
					</Tooltip>
				}
			>
				<Stack gap='xs'>
					<Skeleton height={12} radius='xl' />
					<Skeleton height={48} radius='md' />
					<Skeleton height={88} radius='md' />
				</Stack>
			</RightSectionCard>
		);
	}

	return (
		<RightSectionCard
			title='Schedule'
			description='Active dialing windows and call handling limits.'
			icon={IconMist}
			rightSection={
				<Tooltip
					label={isCompleted ? 'Campaign is completed' : 'Refresh parameters'}
					withArrow
				>
					<ActionIcon
						variant='subtle'
						color='gray'
						size='sm'
						onClick={handleRefetch}
						disabled={isCompleted || isLoading}
						className={styles.refetchButton}
					>
						<IconRefresh size={14} />
					</ActionIcon>
				</Tooltip>
			}
		>
			<Stack gap='sm' className={styles.root}>
				{activeSchedules.length > 0 && (
					<div className={styles.section}>
						<Group justify='space-between' align='center'>
							<Text fw={600} size='sm' className={styles.sectionTitle}>
								Active windows
							</Text>
							<Badge variant='light' color='blue' size='sm'>
								{activeSchedules.length}{' '}
								{activeSchedules.length === 1 ? 'day' : 'days'}
							</Badge>
						</Group>
						<div className={styles.scheduleList}>
							{activeSchedules.map((schedule) => (
								<div
									key={`${schedule.day}-${schedule.startHour}`}
									className={styles.scheduleChip}
								>
									<Text size='xs' fw={700} className={styles.dayLabel}>
										{getDayAbbreviation(schedule.day)}
									</Text>
									<Text size='xs' c='dimmed' className={styles.timeRange}>
										{formatTime(schedule.startHour)} -{' '}
										{formatTime(schedule.endHour)}
									</Text>
								</div>
							))}
						</div>
					</div>
				)}

				{parameterItems.length > 0 && (
					<div className={styles.section}>
						<Group justify='space-between' align='center'>
							<Text fw={600} size='sm' className={styles.sectionTitle}>
								Call handling
							</Text>
							<Badge variant='light' color='blue' size='sm'>
								{parameterItems.length} setting
								{parameterItems.length === 1 ? '' : 's'}
							</Badge>
						</Group>
						<div className={styles.parametersGrid}>
							{parameterItems.map((item) => (
								<div key={item.key} className={styles.parameterCard}>
									<Text size='xs' c='dimmed' className={styles.parameterLabel}>
										{item.label}
									</Text>
									{item.type === 'status' ? (
										<Badge
											size='sm'
											variant='light'
											color={item.color}
											radius='sm'
											className={styles.parameterBadge}
										>
											{item.display}
										</Badge>
									) : (
										<Text size='sm' fw={600} className={styles.parameterValue}>
											{item.display}
										</Text>
									)}
								</div>
							))}
						</div>
					</div>
				)}

				{activeSchedules.length === 0 && parameterItems.length === 0 && (
					<Text size='sm' c='dimmed' ta='center' className={styles.emptyState}>
						No schedules or call handling rules configured for this campaign.
					</Text>
				)}
			</Stack>
		</RightSectionCard>
	);
};

export default CampaignParameters;
