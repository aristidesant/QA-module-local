import React, { useState } from 'react';
import { Box, Group, Switch, Text, Flex, Stack } from '@mantine/core';
import { TimePicker } from '@mantine/dates';
import { IconClockOff } from '@tabler/icons-react';
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

export const DayScheduleCard: React.FC = () => {
	const form = useSchedulerFormContext();
	const dayConfigs = (form.values.dayConfigs || []) as MaybeDayConfig[];
	const humanEquivalent = Number(form.values.humanEquivalent || 1);
	const [selectedDay, setSelectedDay] = useState<string | null>(null);

	return (
		<Stack gap='xs'>
			{dayConfigs?.map((day, index) => {
				const isActive = day.isActive;
				const isSelected = selectedDay === day.dayOfWeek;
				const dayMinutes = calculateDayMinutes(day);
				const perAgentMinutes = calculatePerAgentTalkMinutes(dayMinutes);
				const teamMinutes = calculateTeamTalkMinutes(
					perAgentMinutes,
					humanEquivalent
				);

				return (
					<Box
						key={index}
						className={`${styles.dayRow} ${
							isSelected ? styles.highlighted : ''
						} ${styles.selectable}`}
						role='button'
						tabIndex={0}
						aria-pressed={isSelected}
						aria-label={`${formatDayName(day.dayOfWeek)} schedule`}
						onClick={() => {
							setSelectedDay(day.dayOfWeek ?? null);
						}}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								setSelectedDay(isSelected ? null : (day.dayOfWeek ?? null));
							}
						}}
					>
						<Flex
							justify='space-between'
							align='center'
							className={styles.dayContent}
							direction={{ base: 'column', sm: 'row' }}
							gap='sm'
						>
							<Group gap='xs' align='center' className={styles.dayHeader}>
								<div
									onClick={(e) => {
										e.stopPropagation();
									}}
								>
									<Switch
										className={styles.daySwitch}
										size='sm'
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
								</div>
								<div className={styles.dayInfo}>
									<Text className={styles.dayName} size='sm'>
										{formatDayName(day.dayOfWeek)}
									</Text>
									<Text className={styles.dayWindow} size='xs'>
										{isActive
											? `Window: ${formatMinutesLabel(dayMinutes)}`
											: 'No calling window'}
									</Text>
								</div>
							</Group>

							{isActive ? (
								<div className={styles.timeSection}>
									<div className={styles.timeInputsContainer}>
										<div className={styles.timeInputWrapper}>
											<Text className={styles.timeLabel} size='xs'>
												Start
											</Text>
											<div onClick={(e) => e.stopPropagation()}>
												<TimePicker
													size='xs'
													aria-label='Start time'
													withDropdown
													format='12h'
													variant='filled'
													value={day.startHour ?? undefined}
													minutesStep={30}
													classNames={{ input: styles.timeInput }}
													onChange={(value) => {
														let dateObj: Date | null = null;
														if (typeof value === 'string') {
															const parsed = new Date(value);
															dateObj = !isNaN(parsed.getTime())
																? parsed
																: null;
														} else if (
															value &&
															typeof value === 'object' &&
															'getHours' in value
														) {
															dateObj = value as Date;
														}
														if (dateObj) {
															dateObj.setMinutes(0, 0, 0);
															const hourStr = `${dateObj
																.getHours()
																.toString()
																.padStart(2, '0')}:00:00`;
															form.setFieldValue(
																`dayConfigs.${index}.startHour`,
																hourStr
															);
														} else {
															form.setFieldValue(
																`dayConfigs.${index}.startHour`,
																value
															);
														}
													}}
												/>
											</div>
										</div>
										<div className={styles.timeInputWrapper}>
											<Text className={styles.timeLabel} size='xs'>
												End
											</Text>
											<div onClick={(e) => e.stopPropagation()}>
												<TimePicker
													size='xs'
													aria-label='End time'
													format='12h'
													withDropdown
													variant='filled'
													value={day.endHour ?? undefined}
													minutesStep={30}
													classNames={{ input: styles.timeInput }}
													onChange={(value) => {
														let dateObj: Date | null = null;
														if (typeof value === 'string') {
															const parsed = new Date(value);
															dateObj = !isNaN(parsed.getTime())
																? parsed
																: null;
														} else if (
															value &&
															typeof value === 'object' &&
															'getHours' in value
														) {
															dateObj = value as Date;
														}
														if (dateObj) {
															dateObj.setMinutes(0, 0, 0);
															const hourStr = `${dateObj
																.getHours()
																.toString()
																.padStart(2, '0')}:00:00`;
															form.setFieldValue(
																`dayConfigs.${index}.endHour`,
																hourStr
															);
														} else {
															form.setFieldValue(
																`dayConfigs.${index}.endHour`,
																value
															);
														}
													}}
												/>
											</div>
										</div>
									</div>
									<div className={styles.metricsContainer}>
										<div className={styles.metricItem}>
											<Text className={styles.metricLabel} size='xs'>
												Per agent
											</Text>
											<Text className={styles.metricsValue} size='sm'>
												{formatMinutesLabel(perAgentMinutes)}
											</Text>
										</div>
										<div className={styles.metricItem}>
											<Text className={styles.metricLabel} size='xs'>
												Team total
											</Text>
											<Text className={styles.metricsValue} size='sm'>
												{formatMinutesLabel(teamMinutes)}
											</Text>
										</div>
									</div>
								</div>
							) : (
								<Box className={styles.closedBadge}>
									<IconClockOff size={16} />
									<Text size='sm'>Closed</Text>
								</Box>
							)}
						</Flex>
					</Box>
				);
			})}
		</Stack>
	);
};
