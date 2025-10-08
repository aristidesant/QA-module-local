import React from 'react';
import {
	Text,
	Stack,
	Group,
	Badge,
	Skeleton,
	Flex,
	ActionIcon,
	Tooltip,
	Divider,
} from '@mantine/core';
import { IconRefresh, IconMist } from '@tabler/icons-react';
import styles from './CampaignParameters.module.css';
import { useGetCampaignScheduleSummary } from '~/queries/campaignsQueries';
import { useCampaignsStore } from '~/stores/campaignsStore';
import RightSectionCard from '~/components/RightSectionCard';

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

	// Early return if no campaign is selected
	if (!selectedCampaign) {
		return (
			<RightSectionCard
				title='Defined Parameters'
				description='No campaign selected.'
				icon={IconMist}
			>
				<></>
			</RightSectionCard>
		);
	}

	const parameters = selectedCampaign.parameters;

	const formatScheduleData = () => {
		if (!scheduleSummary || scheduleSummary.length === 0) {
			return [];
		}

		// Group by day and format
		const dayMap: { [key: string]: any } = {};

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

		// Convert to array and sort by day order
		const dayOrder = [
			'monday',
			'tuesday',
			'wednesday',
			'thursday',
			'friday',
			'saturday',
			'sunday',
		];

		const result = dayOrder.map((day) => dayMap[day]).filter(Boolean);
		return result;
	};

	const formatTime = (time: string) => {
		if (!time) return '';
		const [hours, minutes] = time.split(':');
		const hour = parseInt(hours);
		const ampm = hour >= 12 ? 'PM' : 'AM';
		const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
		return `${displayHour}:${minutes || '00'} ${ampm}`;
	};

	const getDayAbbreviation = (day: string) => {
		const dayMap: { [key: string]: string } = {
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

	const activeSchedules = formatScheduleData();

	if (isLoading) {
		return (
			<RightSectionCard
				title='Defined Parameters'
				description='Controls interaction execution and timing.'
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
					{[1, 2, 3].map((index) => (
						<div key={index}>
							<Group justify='space-between' align='center'>
								<Skeleton height={16} width='40%' />
								<Skeleton height={16} width='30%' />
							</Group>
							{index < 3 && <Divider />}
						</div>
					))}
				</Stack>
			</RightSectionCard>
		);
	}

	return (
		<RightSectionCard
			title='Defined Parameters'
			description='Controls interaction execution and timing.'
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
			<Stack gap='xs' className={styles.parametersList}>
				{activeSchedules.length > 0 && (
					<>
						<Group justify='space-between' align='center'>
							<Text fw={600} size='sm'>
								Active schedule
							</Text>
						</Group>
						<Stack gap='xs'>
							{activeSchedules.map((schedule, index) => (
								<Group
									key={index}
									justify='space-between'
									className={styles.scheduleRow}
								>
									<Text size='sm' fw={500} className={styles.dayLabel}>
										{getDayAbbreviation(schedule.day)}
									</Text>
									<Flex gap='xs' align='center'>
										<Text size='xs' c='dimmed'>
											{formatTime(schedule.startHour)}
										</Text>
										<Text size='xs' c='dimmed'>
											-
										</Text>
										<Text size='xs' c='dimmed'>
											{formatTime(schedule.endHour)}
										</Text>
									</Flex>
								</Group>
							))}
						</Stack>
						<Divider />
					</>
				)}

				{/* Voicemail Detection */}
				{parameters?.voicemailDetection !== undefined && (
					<>
						<Group justify='space-between' align='center'>
							<Text fw={600} size='sm'>
								Voicemail detection
							</Text>
							<Badge
								variant='light'
								color={parameters.voicemailDetection ? 'green' : 'red'}
								size='sm'
							>
								{parameters.voicemailDetection ? 'Enabled' : 'Disabled'}
							</Badge>
						</Group>
						<Divider />
					</>
				)}

				{/* Call Retries */}
				{parameters?.callRetries !== undefined && (
					<>
						<Group justify='space-between' align='center'>
							<Text fw={600} size='sm'>
								Call retries
							</Text>
							<Text size='sm' fw={500}>
								Up to {parameters.callRetries} times
							</Text>
						</Group>
						<Divider />
					</>
				)}

				{/* Max Concurrent Calls */}
				{parameters?.maxConcurrentCalls && (
					<>
						<Group justify='space-between' align='center'>
							<Text fw={600} size='sm'>
								Max concurrent calls
							</Text>
							<Text size='sm' fw={500}>
								{parameters.maxConcurrentCalls} calls
							</Text>
						</Group>
						<Divider />
					</>
				)}

				{/* Answer Machine Detection */}
				{parameters?.answerMachineDetection !== undefined && (
					<>
						<Group justify='space-between' align='center'>
							<Text fw={600} size='sm'>
								Answer machine detection
							</Text>
							<Badge
								variant='light'
								color={parameters.answerMachineDetection ? 'green' : 'red'}
								size='sm'
							>
								{parameters.answerMachineDetection ? 'Enabled' : 'Disabled'}
							</Badge>
						</Group>
						<Divider />
					</>
				)}

				{/* Show empty state if no parameters or schedule data */}
				{activeSchedules.length === 0 &&
					parameters?.voicemailDetection === undefined &&
					parameters?.callRetries === undefined &&
					!parameters?.maxConcurrentCalls &&
					parameters?.answerMachineDetection === undefined && (
						<Text
							size='sm'
							c='dimmed'
							ta='center'
							className={styles.emptyState}
						>
							No parameters configured for this campaign.
						</Text>
					)}
			</Stack>
		</RightSectionCard>
	);
};

export default CampaignParameters;
