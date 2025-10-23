import React, { useState } from 'react';
import { Box, Group, Switch, Text, Flex, Stack } from '@mantine/core';
import { TimePicker } from '@mantine/dates';
import { IconClockOff, IconInfoCircle } from '@tabler/icons-react';
import styles from './DayScheduleCard.module.css';
import { useSchedulerFormContext } from '../SchedulerCard/schedulerFormProvider';
import { useCampaignsStore } from '~/stores/campaignsStore';
import DayTimeDistribution from './DayTimeDistribution';
import type { DayConfig } from '~/models/SchedulerModel';
import {
	calculateDayMinutes,
	calculatePerAgentTalkMinutes,
	calculateTeamTalkMinutes,
	formatMinutesLabel,
	type MaybeDayConfig,
} from '../utils/schedulerMetrics';

const formatDayName = (day?: string | null) => {
	if (!day) {
		return 'Day';
	}

	return day.charAt(0).toUpperCase() + day.slice(1);
};

export const DayScheduleCard: React.FC = () => {
	const { setRightComponent } = useCampaignsStore((state) => state);
	const form = useSchedulerFormContext();
	const dayConfigs = (form.values.dayConfigs || []) as MaybeDayConfig[];
	const humanEquivalent = Number(form.values.humanEquivalent || 1);
	const [selectedDay, setSelectedDay] = useState<string | null>(null);

	const handleTimeDistributionUpdateComplete = () => {
		setRightComponent?.(null);
		setSelectedDay(null);
	};

	return (
		<Stack gap='sm'>
			<Group gap='xs' className={styles.estimationNote} align='flex-start'>
				<IconInfoCircle size={16} className={styles.estimationIcon} />
				<Text size='xs' c='dimmed'>
					Time ranges and talk minutes are estimations based on your current
					schedule. Adjust times to explore different daily coverage scenarios.
				</Text>
			</Group>
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
						onClick={() => {
							setSelectedDay(day.dayOfWeek ?? null);
							setRightComponent?.(
								<DayTimeDistribution
									dayConfig={day as DayConfig}
									onComplete={handleTimeDistributionUpdateComplete}
								/>
							);
						}}
					>
						<Flex
							justify='space-between'
							align='flex-start'
							className={styles.dayContent}
						>
							<Group gap='md' align='flex-start' className={styles.dayHeader}>
								<div
									onClick={(e) => {
										e.stopPropagation();
									}}
								>
									<Switch
										className={styles.daySwitch}
										size='md'
										checked={isActive}
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
									<Text className={styles.dayName}>
										{formatDayName(day.dayOfWeek)}
									</Text>
									<Text className={styles.dayStatus}>
										{isActive ? 'Estimated coverage' : 'Inactive day'}
									</Text>
								</div>
							</Group>

							{isActive ? (
								<div className={styles.timeSection}>
									<div className={styles.timeInputsContainer}>
										<div className={styles.timeInputWrapper}>
											<Text className={styles.timeLabel}>Start time</Text>
											<div onClick={(e) => e.stopPropagation()}>
												<TimePicker
													size='md'
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
											<Text className={styles.timeLabel}>End time</Text>
											<div onClick={(e) => e.stopPropagation()}>
												<TimePicker
													size='md'
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
										<Text className={styles.metricsTitle}>
											Estimated talk time
										</Text>
										<Group gap='md' wrap='nowrap' className={styles.metricsRow}>
											<Text component='span' className={styles.metricsLabel}>
												Minutes per agent
												<Text component='span' className={styles.metricsValue}>
													{formatMinutesLabel(perAgentMinutes)}
												</Text>
											</Text>
											<Text component='span' className={styles.metricsLabel}>
												Team minutes
												<Text component='span' className={styles.metricsValue}>
													{formatMinutesLabel(teamMinutes)}
												</Text>
											</Text>
										</Group>
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
