import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
	parseTimeToMinutes,
	type MaybeDayConfig,
} from '../utils/schedulerMetrics';

/**
 * Translate a day-of-week key (e.g. "monday") using the campaigns namespace.
 * Falls back to capitalised raw string when translation is unavailable.
 */
const useTranslateDayName = () => {
	const { t } = useTranslation('campaigns');
	return (day?: string | null) => {
		if (!day)
			return t('scheduler.daySchedule.fallbackDay', { defaultValue: 'Day' });
		const normalized = day.trim().toLowerCase();
		return t(`scheduler.schedulerBuilder.days.${normalized}`, {
			defaultValue: day.charAt(0).toUpperCase() + day.slice(1),
		});
	};
};

type TimeValue = string | Date | null;

const normalizeTimeValue = (value: TimeValue): string | null => {
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

	return value as string | null;
};

export const DayScheduleCard: React.FC = () => {
	const { t } = useTranslation('campaigns');
	const formatDayName = useTranslateDayName();
	const form = useSchedulerFormContext();
	const dayConfigs = (form.values.dayConfigs || []) as MaybeDayConfig[];
	const humanEquivalent = Number(form.values.humanEquivalent || 1);
	const [selectedDay, setSelectedDay] = useState<string | null>(null);
	const [timeErrors, setTimeErrors] = useState<Record<string, string | null>>(
		{}
	);

	const validateTimeRange = (
		start: string | null,
		end: string | null
	): string | null => {
		const startMinutes = parseTimeToMinutes(start ?? undefined);
		const endMinutes = parseTimeToMinutes(end ?? undefined);

		if (startMinutes === null || endMinutes === null) {
			return null;
		}

		if (endMinutes <= startMinutes) {
			return t('scheduler.daySchedule.errors.endTime');
		}

		return null;
	};

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
					<Table.Th className={styles.headerCell}>
						{t('scheduler.daySchedule.headers.day')}
					</Table.Th>
					<Table.Th className={styles.headerCell}>
						{t('scheduler.daySchedule.headers.status')}
					</Table.Th>
					<Table.Th className={styles.headerCell}>
						{t('scheduler.daySchedule.headers.hours')}
					</Table.Th>
					<Table.Th className={styles.headerCell}>
						{t('scheduler.daySchedule.headers.agent')}
					</Table.Th>
					<Table.Th className={styles.headerCell}>
						{t('scheduler.daySchedule.headers.team')}
					</Table.Th>
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody>
				{dayConfigs?.map((day, index) => {
					const dayKey = day?.dayOfWeek ?? String(index);
					const isActive = day.isActive;
					const isSelected = selectedDay === day.dayOfWeek;
					const dayMinutes = calculateDayMinutes(day);
					const perAgentMinutes = calculatePerAgentTalkMinutes(dayMinutes);
					const teamMinutes = calculateTeamTalkMinutes(
						perAgentMinutes,
						humanEquivalent
					);

					const handleTimeChange = (
						value: TimeValue,
						fieldPath: string,
						field: 'start' | 'end'
					) => {
						const normalized = normalizeTimeValue(value);
						const nextStart =
							field === 'start' ? normalized : (day.startHour ?? null);
						const nextEnd =
							field === 'end' ? normalized : (day.endHour ?? null);

						const error = validateTimeRange(nextStart, nextEnd);

						if (error) {
							setTimeErrors((prev) => ({ ...prev, [dayKey]: error }));

							if (field === 'start') {
								form.setFieldValue(fieldPath, normalized);
								(form.setFieldValue as any)(
									`dayConfigs.${index}.endHour`,
									null
								);
							} else {
								(form.setFieldValue as any)(fieldPath, null);
							}

							return;
						}

						setTimeErrors((prev) => ({ ...prev, [dayKey]: null }));
						form.setFieldValue(fieldPath, normalized);
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
											{isActive
												? t('scheduler.daySchedule.status.open')
												: t('scheduler.daySchedule.status.paused')}
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
										<Text size='xs'>
											{t('scheduler.daySchedule.status.closed')}
										</Text>
									</div>
								)}
							</Table.Td>

							<Table.Td>
								{isActive ? (
									<div className={styles.timeRangeWrapper}>
										<Group gap='xs' wrap='nowrap' className={styles.timeRange}>
											<Box onClick={(e) => e.stopPropagation()}>
												<TimePicker
													size='xs'
													aria-label='Start time'
													withDropdown
													format='12h'
													variant='filled'
													value={day.startHour}
													minutesStep={30}
													className={styles.timePicker}
													onChange={(value) =>
														handleTimeChange(
															value,
															`dayConfigs.${index}.startHour`,
															'start'
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
													value={day.endHour}
													minutesStep={30}
													className={styles.timePicker}
													onChange={(value) =>
														handleTimeChange(
															value,
															`dayConfigs.${index}.endHour`,
															'end'
														)
													}
												/>
											</Box>
										</Group>
										{timeErrors[dayKey] ? (
											<Text
												size='xs'
												className={styles.timeError}
												role='alert'
												aria-live='polite'
											>
												{timeErrors[dayKey]}
											</Text>
										) : null}
									</div>
								) : (
									<Text className={styles.inactiveHint}>
										{t('scheduler.daySchedule.noHours')}
									</Text>
								)}
							</Table.Td>

							<Table.Td>
								<div className={styles.metricCell}>
									<Text className={styles.metricLabel}>
										{t('scheduler.daySchedule.metrics.perAgent')}
									</Text>
									<Text
										className={`${styles.metricValue} ${!isActive ? styles.metricValueInactive : ''}`}
									>
										{formatMinutesLabel(perAgentMinutes)}
									</Text>
								</div>
							</Table.Td>

							<Table.Td>
								<div className={styles.metricCell}>
									<Text className={styles.metricLabel}>
										{t('scheduler.daySchedule.metrics.teamTotal')}
									</Text>
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
