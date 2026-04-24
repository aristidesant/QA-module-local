import { Button, Group, Stack, Text, Divider, Box } from '@mantine/core';
import { IconPlus, IconClock, IconCheck } from '@tabler/icons-react';
import { useState } from 'react';
import { modals } from '@mantine/modals';
import type { Scheduler } from '~/models/SchedulerModel';
import styles from './ScheduleModal.module.css';

interface ScheduleModalProps {
	/** Currently selected schedule ID */
	selectedScheduleId?: string;

	/** Callback when a schedule is selected */
	onScheduleSelect: (scheduleId: string) => void;

	/** Callback when "Add schedule" is clicked */
	onAddSchedule?: () => void;

	/** List of available schedules */
	schedules?: Scheduler[];
}

function ScheduleModalContent({
	selectedScheduleId,
	onScheduleSelect,
	onAddSchedule,
	schedules = [],
}: ScheduleModalProps) {
	const [selectedId, setSelectedId] = useState<string | undefined>(
		selectedScheduleId
	);

	const handleSelect = (id: string) => {
		setSelectedId(id);
	};

	const handleApply = () => {
		if (selectedId) {
			onScheduleSelect(selectedId);
			modals.close('schedule-selection-modal');
		}
	};

	// Helper function to format schedule hours from dayConfigs
	const formatScheduleHours = (scheduler: Scheduler): string => {
		if (!scheduler.dayConfigs || scheduler.dayConfigs.length === 0) {
			return 'No schedule configured';
		}

		const activeDays = scheduler.dayConfigs
			.filter((config) => config.isActive)
			.map((day) => {
				return `${day.dayOfWeek?.substring(0, 1).toUpperCase()}${
					day.startHour
				}-${day.endHour}`;
			})
			.join(' | ');

		return activeDays;
	};

	// Get active days count for display
	const getActiveDaysText = (scheduler: Scheduler): string => {
		if (!scheduler.dayConfigs || scheduler.dayConfigs.length === 0) {
			return 'No days configured';
		}

		const activeDays = scheduler.dayConfigs.filter((config) => config.isActive);
		const dayNames = activeDays.map(
			(day) => day.dayOfWeek.charAt(0).toUpperCase() + day.dayOfWeek.slice(1, 3)
		);

		if (dayNames.length === 0) {
			return 'No active days';
		}

		if (dayNames.length === 7) {
			return 'Every day';
		}

		if (
			dayNames.length === 5 &&
			!dayNames.includes('Sat') &&
			!dayNames.includes('Sun')
		) {
			return 'Weekdays';
		}

		if (
			dayNames.length === 2 &&
			dayNames.includes('Sat') &&
			dayNames.includes('Sun')
		) {
			return 'Weekends';
		}

		return dayNames.join(', ');
	};

	return (
		<Stack gap='md'>
			<Text size='sm' c='dimmed'>
				Choose when you'd like to send messages to this contact list.
			</Text>

			<Stack gap='xs'>
				{schedules.map((schedule) => {
					const scheduleId = schedule.id.toString();
					const isSelected = selectedId === scheduleId;
					const isActive = schedule.status === 'active';

					return (
						<Box
							key={schedule.id}
							p='md'
							className={`${styles.scheduleItem} ${
								isSelected ? styles.scheduleItemSelected : ''
							}`}
							onClick={() => handleSelect(scheduleId)}
							role='button'
							tabIndex={0}
							onKeyDown={(e) => e.key === 'Enter' && handleSelect(scheduleId)}
						>
							<Group justify='space-between' mb={4}>
								<Group gap='xs'>
									<Text fw={500}>{schedule.name}</Text>
									{isActive && (
										<Text size='xs' c='blue' fw={500}>
											(Currently Active)
										</Text>
									)}
								</Group>
								{isSelected && (
									<Box className={styles.checkmark}>
										<IconCheck size={12} color='white' />
									</Box>
								)}
							</Group>

							{schedule.description && (
								<Text size='sm' c='dimmed' mb={4}>
									{schedule.description}
								</Text>
							)}

							<Group gap={4} c='dimmed' align='center' mb={2}>
								<IconClock size={14} />
								<Text size='xs'>{formatScheduleHours(schedule)}</Text>
							</Group>

							<Text size='xs' c='dimmed'>
								{getActiveDaysText(schedule)}
							</Text>
						</Box>
					);
				})}
			</Stack>

			{schedules.length === 0 && (
				<Text size='sm' c='dimmed' ta='center' py='xl'>
					No schedules available for this campaign.
				</Text>
			)}

			{onAddSchedule && (
				<>
					<Divider my='xs' label='OR' labelPosition='center' />
					<Button
						variant='outline'
						onClick={onAddSchedule}
						leftSection={<IconPlus size={16} />}
						fullWidth
					>
						Create custom schedule
					</Button>
				</>
			)}

			<Group justify='flex-end' mt='md'>
				<Button
					variant='subtle'
					onClick={() => modals.close('schedule-selection-modal')}
				>
					Cancel
				</Button>
				<Button onClick={handleApply} disabled={!selectedId}>
					{selectedId ? 'Apply Schedule' : 'Select a schedule'}
				</Button>
			</Group>
		</Stack>
	);
}

export function openScheduleModal(props: ScheduleModalProps) {
	modals.open({
		modalId: 'schedule-selection-modal',
		title: 'Select a Schedule',
		size: 'md',
		radius: 'md',
		padding: 'xl',
		children: <ScheduleModalContent {...props} />,
	});
}
