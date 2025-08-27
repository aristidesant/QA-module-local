import React, { useState } from 'react';
import {
	Card,
	Text,
	Stack,
	Group,
	Badge,
	Skeleton,
	Flex,
	ActionIcon,
	Tooltip,
	Collapse,
} from '@mantine/core';
import {
	IconRefresh,
	IconChevronDown,
	IconChevronUp,
} from '@tabler/icons-react';
import styles from './CampaignParameters.module.css';
import { useGetCampaignScheduleSummary } from '~/queries/campaignsQueries';
import { useCampaignsStore } from '~/stores/campaignsStore';

const CampaignParameters: React.FC = () => {
	const selectedCampaign = useCampaignsStore((state) => state.selectedCampaign);
	const [scheduleExpanded, setScheduleExpanded] = useState(false);

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
			<Stack gap='md' mt='sm'>
				<div>
					<Text fw={600} size='md' className={styles.title}>
						Defined Parameters
					</Text>
					<Text size='xs' c='dimmed' className={styles.subtitle}>
						No campaign selected.
					</Text>
				</div>
			</Stack>
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
			<Stack gap='md' mt='sm'>
				<Group justify='space-between' align='flex-start'>
					<div>
						<Skeleton height={20} width='60%' mb='xs' />
						<Skeleton height={14} width='80%' />
					</div>
					<Skeleton height={28} width={28} radius='sm' />
				</Group>
				<Stack gap='xs'>
					{[1, 2, 3].map((index) => (
						<Card
							key={index}
							radius='md'
							padding='sm'
							withBorder
							className={styles.parameterCard}
						>
							<Group justify='space-between'>
								<Skeleton height={16} width='40%' />
								<Skeleton height={16} width='30%' />
							</Group>
						</Card>
					))}
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack gap='md' mt='sm'>
			<Group justify='space-between' align='flex-start'>
				<div>
					<Text fw={600} size='md' className={styles.title}>
						Defined Parameters &nbsp;
						<Tooltip
							label={
								isCompleted ? 'Campaign is completed' : 'Refresh parameters'
							}
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
					</Text>
					<Text size='xs' c='dimmed' className={styles.subtitle}>
						These settings control how and when interactions are executed.
					</Text>
				</div>
			</Group>

			<Stack gap='xs' className={styles.parametersList}>
				{/* Active Schedule Days */}
				{activeSchedules.length > 0 && (
					<Card
						radius='md'
						padding='sm'
						withBorder
						className={styles.parameterCard}
					>
						<Stack gap='xs'>
							<Group
								justify='space-between'
								align='center'
								onClick={() => setScheduleExpanded(!scheduleExpanded)}
								className={styles.scheduleHeader}
							>
								<Text size='sm' c='dimmed'>
									Calling schedule ({activeSchedules.length} days)
								</Text>
								<ActionIcon
									variant='subtle'
									size='sm'
									className={styles.expandButton}
								>
									{scheduleExpanded ? (
										<IconChevronUp size={16} />
									) : (
										<IconChevronDown size={16} />
									)}
								</ActionIcon>
							</Group>
							<Collapse in={scheduleExpanded}>
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
							</Collapse>
						</Stack>
					</Card>
				)}

				{/* Voicemail Detection */}
				{parameters?.voicemailDetection !== undefined && (
					<Card
						radius='md'
						padding='sm'
						withBorder
						className={styles.parameterCard}
					>
						<Group justify='space-between' className={styles.parameterItem}>
							<Text size='sm' c='dimmed'>
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
					</Card>
				)}

				{/* Call Retries */}
				{parameters?.callRetries !== undefined && (
					<Card
						radius='md'
						padding='sm'
						withBorder
						className={styles.parameterCard}
					>
						<Group justify='space-between' className={styles.parameterItem}>
							<Text size='sm' c='dimmed'>
								Call retries
							</Text>
							<Text size='sm' fw={500}>
								Up to {parameters.callRetries} times
							</Text>
						</Group>
					</Card>
				)}

				{/* Max Concurrent Calls */}
				{parameters?.maxConcurrentCalls && (
					<Card
						radius='md'
						padding='sm'
						withBorder
						className={styles.parameterCard}
					>
						<Group justify='space-between' className={styles.parameterItem}>
							<Text size='sm' c='dimmed'>
								Max concurrent calls
							</Text>
							<Text size='sm' fw={500}>
								{parameters.maxConcurrentCalls} calls
							</Text>
						</Group>
					</Card>
				)}

				{/* Answer Machine Detection */}
				{parameters?.answerMachineDetection !== undefined && (
					<Card
						radius='md'
						padding='sm'
						withBorder
						className={styles.parameterCard}
					>
						<Group justify='space-between' className={styles.parameterItem}>
							<Text size='sm' c='dimmed'>
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
					</Card>
				)}

				{/* Show empty state if no parameters or schedule data */}
				{activeSchedules.length === 0 &&
					parameters?.voicemailDetection === undefined &&
					parameters?.callRetries === undefined &&
					!parameters?.maxConcurrentCalls &&
					parameters?.answerMachineDetection === undefined && (
						<Card
							radius='md'
							padding='lg'
							withBorder
							className={styles.parameterCard}
						>
							<Text
								size='sm'
								c='dimmed'
								ta='center'
								className={styles.emptyState}
							>
								No parameters configured for this campaign.
							</Text>
						</Card>
					)}
			</Stack>
		</Stack>
	);
};

export default CampaignParameters;
