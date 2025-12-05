import React, { useState } from 'react';
import { Box, Switch, Text, Table, Group } from '@mantine/core';
import { TimePicker } from '@mantine/dates';
import { IconClock, IconClockOff } from '@tabler/icons-react';
import styles from './DayScheduleCard.module.css';
import { useSchedulerFormContext } from '../SchedulerCard/schedulerFormProvider';
import {
	calculateDayMinutes,
	calculatePerAgentTalkMinutes,
	calculateTeamTalkMinutes,
	formatMinutesLabel,
	type MaybeDayConfig,
} from '../utils/schedulerMetrics';

const formatDayName = (day?: string | null) => {
	return day ? day.charAt(0).toUpperCase() + day.slice(1) : 'Day';
};

type TimeValue = string | Date | null;

const normalizeTimeValue = (value: TimeValue) => {
	let dateObj: Date | null = null;

	if (typeof value === 'string') {
		const parsed = new Date(value);
		dateObj = !isNaN(parsed.getTime()) ? parsed : null;
	} else if (value instanceof Date) {
		dateObj = value;
	} else if (value && typeof value === 'object' && 'getHours' in value) {
		dateObj = value as Date;
	}

	if (dateObj) {
		dateObj.setMinutes(0, 0, 0);
		return `${dateObj.getHours().toString().padStart(2, '0')}:00:00`;
	}

	return value;
};

export const DayScheduleCard: React.FC = () => {
	const form = useSchedulerFormContext();
	const dayConfigs = (form.values.dayConfigs || []) as MaybeDayConfig[];
	const humanEquivalent = Number(form.values.humanEquivalent || 1);
	const [selectedDay, setSelectedDay] = useState<string | null>(null);

	return (
		<Table
			highlightOnHover
			striped={false}
			withColumnBorders={false}
			withRowBorders={false}
			horizontalSpacing='sm'
			verticalSpacing='xs'
			classNames={{ table: styles.tableRoot, thead: styles.tableHead }}
		>
			<Table.Thead>
				<Table.Tr>
					<Table.Th className={styles.headerCell}>Day</Table.Th>
					<Table.Th className={styles.headerCell}>Status</Table.Th>
					<Table.Th className={styles.headerCell}>Hours</Table.Th>
					<Table.Th className={styles.headerCell}>Agent</Table.Th>
					<Table.Th className={styles.headerCell}>Team</Table.Th>
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody>
				{dayConfigs?.map((day, index) => {
					const isActive = day.isActive;
					const isSelected = selectedDay === day.dayOfWeek;
					const dayMinutes = calculateDayMinutes(day);
					const perAgentMinutes = calculatePerAgentTalkMinutes(dayMinutes);
					const teamMinutes = calculateTeamTalkMinutes(
						perAgentMinutes,
						humanEquivalent
					);

					const handleTimeChange = (value: TimeValue, fieldPath: string) => {
						form.setFieldValue(fieldPath, normalizeTimeValue(value));
					};

					const toggleSelection = () => {
						setSelectedDay((prev) =>
							prev === day.dayOfWeek ? null : (day.dayOfWeek ?? null)
						);
					};

					return (
						<Table.Tr
							key={index}
							className={`${styles.row} ${isSelected ? styles.rowSelected : ''} ${!isActive ? styles.rowInactive : ''}`}
							tabIndex={0}
							role='button'
							aria-pressed={isSelected}
							aria-label={`${formatDayName(day.dayOfWeek)} schedule`}
							onClick={toggleSelection}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									toggleSelection();
								}
							}}
						>
							<Table.Td>
								<Group gap='xs' align='center' wrap='nowrap'>
									<Box onClick={(e) => e.stopPropagation()}>
										<Switch
											size='xs'
											checked={isActive}
											aria-label={`Toggle ${formatDayName(day.dayOfWeek)} active`}
											onChange={(e) => {
												e.stopPropagation();
												form.setFieldValue(
													`dayConfigs.${index}.isActive`,
													!isActive
												);
											}}
										/>
									</Box>
									<div className={styles.dayCell}>
										<Text
											className={`${styles.dayName} ${!isActive ? styles.dayNameInactive : ''}`}
										>
											{formatDayName(day.dayOfWeek)}
										</Text>
										<Text className={styles.daySubtle}>
											{isActive ? 'Open window' : 'Paused'}
										</Text>
									</div>
									<div
										className={`${styles.statusDot} ${isActive ? styles.statusDotActive : styles.statusDotInactive}`}
									/>
								</Group>
							</Table.Td>

							<Table.Td>
								{isActive ? (
									<div className={styles.windowPill}>
										<IconClock size={12} className={styles.windowIcon} />
										<Text className={styles.windowText}>
											{formatMinutesLabel(dayMinutes)}
										</Text>
									</div>
								) : (
									<div className={styles.closedLabel}>
										<IconClockOff size={12} />
										<Text size='xs'>Closed</Text>
									</div>
								)}
							</Table.Td>

							<Table.Td>
								{isActive ? (
									<Group gap='xs' wrap='nowrap' className={styles.timeRange}>
										<Box onClick={(e) => e.stopPropagation()}>
											<TimePicker
												size='xs'
												aria-label='Start time'
												withDropdown
												format='12h'
												variant='filled'
												value={day.startHour ?? undefined}
												minutesStep={30}
												className={styles.timePicker}
												onChange={(value) =>
													handleTimeChange(
														value,
														`dayConfigs.${index}.startHour`
													)
												}
											/>
										</Box>
										<Text className={styles.timeSeparator}>→</Text>
										<Box onClick={(e) => e.stopPropagation()}>
											<TimePicker
												size='xs'
												aria-label='End time'
												format='12h'
												withDropdown
												variant='filled'
												value={day.endHour ?? undefined}
												minutesStep={30}
												className={styles.timePicker}
												onChange={(value) =>
													handleTimeChange(value, `dayConfigs.${index}.endHour`)
												}
											/>
										</Box>
									</Group>
								) : (
									<Text className={styles.inactiveHint}>
										No hours configured
									</Text>
								)}
							</Table.Td>

							<Table.Td>
								<div className={styles.metricCell}>
									<Text className={styles.metricLabel}>Per agent</Text>
									<Text
										className={`${styles.metricValue} ${!isActive ? styles.metricValueInactive : ''}`}
									>
										{formatMinutesLabel(perAgentMinutes)}
									</Text>
								</div>
							</Table.Td>

							<Table.Td>
								<div className={styles.metricCell}>
									<Text className={styles.metricLabel}>Team total</Text>
									<Text
										className={`${styles.metricValue} ${!isActive ? styles.metricValueInactive : ''}`}
									>
										{formatMinutesLabel(teamMinutes)}
									</Text>
								</div>
							</Table.Td>
						</Table.Tr>
					);
				})}
			</Table.Tbody>
		</Table>
	);
};
