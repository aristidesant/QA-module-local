import { useMemo } from 'react';
import {
	Box,
	Card,
	Divider,
	Group,
	SimpleGrid,
	Slider,
	Stack,
	Text,
} from '@mantine/core';
import { IconCalendarTime, IconHeadset, IconUsers } from '@tabler/icons-react';
import { useSchedulerFormContext } from '../SchedulerCard/schedulerFormProvider';
import type { DayOfWeek } from '~/models/SchedulerModel';
import styles from './CapacityCall.module.css';
import { DayScheduleCard } from '../DayScheduleCard';
import {
	MINUTES_PER_HOUR,
	TALK_MINUTES_PER_HOUR,
	calculateDayMinutes,
	calculateHourConfigMinutes,
	calculatePerAgentTalkMinutes,
	calculateTeamTalkMinutes,
	formatMinutesLabel,
	parseTimeToMinutes,
	MaybeDayConfig,
	MaybeHourConfig,
} from '../utils/schedulerMetrics';

const DAY_ORDER: DayOfWeek[] = [
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
	'sunday',
];

const DAY_LABELS: Record<DayOfWeek, string> = {
	monday: 'Monday',
	tuesday: 'Tuesday',
	wednesday: 'Wednesday',
	thursday: 'Thursday',
	friday: 'Friday',
	saturday: 'Saturday',
	sunday: 'Sunday',
};

const formatMinutesToTimeLabel = (minutes: number): string => {
	if (!Number.isFinite(minutes) || minutes < 0) {
		return '--:--';
	}

	if (minutes >= MINUTES_PER_HOUR * 24) {
		return '24:00';
	}

	const hours = Math.floor(minutes / MINUTES_PER_HOUR);
	const remainder = minutes % MINUTES_PER_HOUR;

	return `${String(hours).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
};

const calculateHourConfigRanges = (
	hourConfigs?: MaybeHourConfig[]
): string[] => {
	if (!hourConfigs || hourConfigs.length === 0) {
		return [];
	}

	const activeSlots = hourConfigs.filter((slot) => slot?.isActive);
	if (activeSlots.length === 0) {
		return [];
	}

	const sortValue = (slot: MaybeHourConfig): number => {
		if (typeof slot?.hourOrder === 'number') {
			return slot.hourOrder;
		}

		const timeInMinutes = parseTimeToMinutes(slot?.hour);
		if (timeInMinutes !== null) {
			return timeInMinutes;
		}

		return Number.MAX_SAFE_INTEGER;
	};

	const sortedSlots = [...activeSlots].sort(
		(a, b) => sortValue(a) - sortValue(b)
	);
	const ranges: Array<{ start: number; end: number }> = [];

	sortedSlots.forEach((slot) => {
		const start = parseTimeToMinutes(slot?.hour);
		if (start === null) {
			return;
		}

		const end = start + MINUTES_PER_HOUR;
		const lastRange = ranges[ranges.length - 1];

		if (lastRange && start <= lastRange.end) {
			lastRange.end = Math.max(lastRange.end, end);
			return;
		}

		ranges.push({ start, end });
	});

	return ranges.map(
		(range) =>
			`${formatMinutesToTimeLabel(range.start)} – ${formatMinutesToTimeLabel(range.end)}`
	);
};

const calculateSchedulerRangesForDay = (day?: MaybeDayConfig): string[] => {
	if (!day || !day.isActive) {
		return [];
	}

	return calculateHourConfigRanges(day.hourConfigs);
};

const formatHours = (hours: number): string => {
	if (!Number.isFinite(hours) || hours <= 0) {
		return '0 h';
	}

	const decimals = hours >= 10 ? 0 : 1;
	return `${hours.toFixed(decimals)} h`;
};

const formatTimeLabel = (time?: string | null): string => {
	if (!time) {
		return '--:--';
	}

	const [hours = '00', minutes = '00'] = time.split(':');
	return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
};

const formatRange = (start?: string | null, end?: string | null): string => {
	if (!start || !end) {
		return 'Hours not configured';
	}

	return `${formatTimeLabel(start)} – ${formatTimeLabel(end)}`;
};

const getDaySortIndex = (day: MaybeDayConfig, index: number): number => {
	if (typeof day.dayOrder === 'number') {
		return day.dayOrder;
	}

	if (day.dayOfWeek && DAY_ORDER.includes(day.dayOfWeek as DayOfWeek)) {
		return DAY_ORDER.indexOf(day.dayOfWeek as DayOfWeek);
	}

	return index;
};

const getDayLabel = (day: MaybeDayConfig): string => {
	if (day.dayOfWeek && DAY_ORDER.includes(day.dayOfWeek as DayOfWeek)) {
		return DAY_LABELS[day.dayOfWeek as DayOfWeek];
	}

	if (typeof day.dayOrder === 'number') {
		return `Day ${day.dayOrder + 1}`;
	}

	return 'Day';
};

interface DayEntry {
	key: string;
	label: string;
	range: string;
	hours: number;
	slots: number;
	slotRanges: string[];
	perAgentMinutes: number;
	teamMinutes: number;
	sortIndex: number;
}

const CapacityCall: React.FC = () => {
	const form = useSchedulerFormContext();
	const humanEquivalent = Number(form.values.humanEquivalent || 1);
	const dayConfigs = (form.values.dayConfigs || []) as MaybeDayConfig[];

	const metrics = useMemo(() => {
		let totalMinutes = 0;
		const activeDayEntries: DayEntry[] = [];

		dayConfigs.forEach((day, index) => {
			const minutes = calculateDayMinutes(day);
			if (minutes <= 0) {
				return;
			}

			totalMinutes += minutes;

			const hourConfigMinutes = calculateHourConfigMinutes(day.hourConfigs);
			const slotCount =
				hourConfigMinutes > 0
					? Math.round(hourConfigMinutes / MINUTES_PER_HOUR)
					: 0;
			const perAgentMinutes = calculatePerAgentTalkMinutes(minutes);
			const teamMinutes = calculateTeamTalkMinutes(
				perAgentMinutes,
				humanEquivalent
			);

			activeDayEntries.push({
				key: String(day?.id ?? day?.dayOfWeek ?? index),
				label: getDayLabel(day),
				range: formatRange(day?.startHour, day?.endHour),
				hours: minutes / MINUTES_PER_HOUR,
				slots: slotCount,
				slotRanges: calculateSchedulerRangesForDay(day),
				perAgentMinutes,
				teamMinutes,
				sortIndex: getDaySortIndex(day, index),
			});
		});

		const totalWeeklyHours = totalMinutes / MINUTES_PER_HOUR;
		const talkMinutesPerHuman = totalWeeklyHours * TALK_MINUTES_PER_HOUR;
		const talkHoursPerHuman = talkMinutesPerHuman / MINUTES_PER_HOUR;
		const teamTalkMinutes = calculateTeamTalkMinutes(
			talkMinutesPerHuman,
			humanEquivalent
		);
		const teamTalkHours = teamTalkMinutes / MINUTES_PER_HOUR;
		const activeDayCount = activeDayEntries.length;
		const averageDailyHours =
			activeDayCount > 0 ? totalWeeklyHours / activeDayCount : 0;
		const dayEntries = [...activeDayEntries].sort(
			(a, b) => a.sortIndex - b.sortIndex
		);

		return {
			totalWeeklyHours,
			talkMinutesPerHuman,
			talkHoursPerHuman,
			teamTalkMinutes,
			teamTalkHours,
			averageDailyHours,
			activeDayCount,
			dayEntries,
		};
	}, [dayConfigs, humanEquivalent]);

	const sliderValue =
		Number.isFinite(humanEquivalent) && humanEquivalent > 0
			? humanEquivalent
			: 1;

	const summaryCards = useMemo(
		() => [
			{
				id: 'schedule',
				label: 'Weekly scheduled hours',
				icon: <IconCalendarTime size={16} />,
				value: formatHours(metrics.totalWeeklyHours),
				description:
					metrics.activeDayCount > 0
						? `${metrics.activeDayCount} active day${metrics.activeDayCount > 1 ? 's' : ''} • ${formatHours(metrics.averageDailyHours)} avg/day`
						: 'No active schedule yet',
			},
			{
				id: 'per-human',
				label: 'Talk time per human',
				icon: <IconHeadset size={16} />,
				value: formatHours(metrics.talkHoursPerHuman),
				description: `${formatMinutesLabel(
					metrics.talkMinutesPerHuman
				)} each week`,
			},
			{
				id: 'team',
				label: 'Team talk time',
				icon: <IconUsers size={16} />,
				value: formatHours(metrics.teamTalkHours),
				description: `${formatMinutesLabel(
					metrics.teamTalkMinutes
				)} across ${sliderValue} human${sliderValue > 1 ? 's' : ''}`,
			},
		],
		[metrics, sliderValue]
	);

	return (
		<Card withBorder radius='md' className={styles.card}>
			<Stack gap='lg'>
				<Group
					justify='space-between'
					align='flex-start'
					className={styles.header}
				>
					<Box className={styles.headerText}>
						<Text className={styles.title}>Capacity call</Text>
						<Text className={styles.subtitle}>
							Translate your working hours into realistic human talk time.
						</Text>
					</Box>

					<Box className={styles.valueChip}>
						<Text className={styles.valueNumber}>{sliderValue}</Text>
						<Text className={styles.valueLabel}>Human equivalent</Text>
					</Box>
				</Group>

				<div className={styles.sliderSection}>
					<Group justify='space-between' align='center'>
						<Text className={styles.sliderLabel}>Adjust human equivalent</Text>
						<Text className={styles.sliderHelper}>38.5 min talk / hour</Text>
					</Group>

					<Slider
						value={sliderValue}
						onChange={(value) =>
							form.setFieldValue('humanEquivalent', Number(value))
						}
						min={1}
						max={500}
						step={1}
						classNames={{
							root: styles.sliderRoot,
							track: styles.sliderTrack,
							bar: styles.sliderBar,
							thumb: styles.sliderThumb,
						}}
					/>
				</div>

				<Divider className={styles.divider} />

				<Box className={styles.summarySection}>
					<Text className={styles.summaryTitle}>Talking efficiency</Text>
					<Text className={styles.summaryDescription}>
						Every working hour contributes {TALK_MINUTES_PER_HOUR} minutes of
						actual talk time. We combine your active schedule with the human
						equivalent to project realistic weekly capacity.
					</Text>
				</Box>

				<SimpleGrid
					cols={{ base: 1, sm: 2, md: 3 }}
					spacing='md'
					className={styles.metricsGrid}
				>
					{summaryCards.map((card) => (
						<Box key={card.id} className={styles.metricCard}>
							<Group gap='xs' align='center'>
								<span className={styles.metricIcon}>{card.icon}</span>
								<Text className={styles.metricLabel}>{card.label}</Text>
							</Group>
							<Text className={styles.metricValue}>{card.value}</Text>
							<Text className={styles.metricDescription}>
								{card.description}
							</Text>
						</Box>
					))}
				</SimpleGrid>

				<Box className={styles.scheduleBlock}>
					<Stack gap='md'>
						<Group justify='space-between' align='center'>
							<Group gap='xs' align='center'>
								<span className={styles.metricIcon}>
									<IconCalendarTime size={16} />
								</span>
								<Text className={styles.scheduleTitle}>
									Working hours schedule
								</Text>
							</Group>
							<Text className={styles.scheduleBadge}>
								{metrics.activeDayCount} active day
								{metrics.activeDayCount === 1 ? '' : 's'}
							</Text>
						</Group>

						<DayScheduleCard />
					</Stack>
				</Box>
			</Stack>
		</Card>
	);
};

export default CapacityCall;
