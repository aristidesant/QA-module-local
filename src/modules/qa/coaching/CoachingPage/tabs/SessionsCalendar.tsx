import { useMemo, useState } from 'react';
import { ActionIcon, Button, Text } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import clsx from 'clsx';
import dayjs, { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import AppSegmentedControl from '~/components/ui/AppSegmentedControl';
import type { CoachingSessionRecord } from '~/models/qa';
import { NOW_ISO } from '~/modules/qa/team/constants';
import styles from './SessionsCalendar.module.css';

type CalendarView = 'month' | 'week' | 'day';

const FIRST_HOUR = 8;
const LAST_HOUR = 18;
const HOURS = Array.from(
	{ length: LAST_HOUR - FIRST_HOUR + 1 },
	(_, i) => FIRST_HOUR + i
);
const MAX_CHIPS_PER_DAY = 3;
const DAY_KEY = 'YYYY-MM-DD';

interface SessionsCalendarProps {
	sessions: CoachingSessionRecord[];
	onOpen: (sessionId: string) => void;
}

/** Month, week and day views of the coaching sessions, in the spirit of a calendar app. */
export function SessionsCalendar({ sessions, onOpen }: SessionsCalendarProps) {
	const { t } = useTranslation('qa.coaching');
	const [view, setView] = useState<CalendarView>('month');
	const todayDate = useMemo(() => dayjs(NOW_ISO), []);
	const [anchor, setAnchor] = useState<Dayjs>(todayDate);

	const byDay = useMemo(() => {
		const map = new Map<string, CoachingSessionRecord[]>();
		for (const s of [...sessions].sort((a, b) =>
			a.date.localeCompare(b.date)
		)) {
			const key = dayjs(s.date).format(DAY_KEY);
			map.set(key, [...(map.get(key) ?? []), s]);
		}
		return map;
	}, [sessions]);

	const step = (direction: 1 | -1) =>
		setAnchor((current) => current.add(direction, view));

	const title =
		view === 'month'
			? anchor.format('MMMM YYYY')
			: view === 'week'
				? `${anchor.startOf('week').format('MMM D')} – ${anchor.endOf('week').format('MMM D, YYYY')}`
				: anchor.format('dddd, MMM D, YYYY');

	const openDay = (day: Dayjs) => {
		setAnchor(day);
		setView('day');
	};

	const chip = (s: CoachingSessionRecord, detailed = false) => (
		<button
			key={s.id}
			type='button'
			className={clsx(styles.chip, detailed && styles.dayChip)}
			data-status={s.status}
			title={`${dayjs(s.date).format('HH:mm')} · ${s.topic} · ${s.agentName}`}
			onClick={() => onOpen(s.id)}
		>
			<span className={styles.chipTime}>{dayjs(s.date).format('HH:mm')}</span>
			{s.topic}
			{detailed && ` · ${s.agentName}`}
		</button>
	);

	const monthDays = useMemo(() => {
		const first = anchor.startOf('month').startOf('week');
		const last = anchor.endOf('month').endOf('week');
		const days: Dayjs[] = [];
		for (let d = first; d.isBefore(last); d = d.add(1, 'day')) days.push(d);
		return days;
	}, [anchor]);

	const columns: Dayjs[] =
		view === 'week'
			? Array.from({ length: 7 }, (_, i) =>
					anchor.startOf('week').add(i, 'day')
				)
			: [anchor];

	const hourOf = (s: CoachingSessionRecord) =>
		Math.min(LAST_HOUR, Math.max(FIRST_HOUR, dayjs(s.date).hour()));

	return (
		<div>
			<div className={styles.toolbar}>
				<div className={styles.nav}>
					<Button
						size='xs'
						variant='default'
						onClick={() => setAnchor(todayDate)}
					>
						{t('sessions.calendar.today')}
					</Button>
					<ActionIcon
						variant='subtle'
						color='gray'
						aria-label={t('sessions.calendar.previous')}
						onClick={() => step(-1)}
					>
						<IconChevronLeft size={18} />
					</ActionIcon>
					<ActionIcon
						variant='subtle'
						color='gray'
						aria-label={t('sessions.calendar.next')}
						onClick={() => step(1)}
					>
						<IconChevronRight size={18} />
					</ActionIcon>
					<Text className={styles.title} aria-live='polite'>
						{title}
					</Text>
				</div>
				<AppSegmentedControl
					size='sm'
					value={view}
					onChange={(v) => setView(v as CalendarView)}
					data={[
						{ label: t('sessions.calendar.month'), value: 'month' },
						{ label: t('sessions.calendar.week'), value: 'week' },
						{ label: t('sessions.calendar.day'), value: 'day' },
					]}
				/>
			</div>

			<div className={styles.frame}>
				{view === 'month' ? (
					<>
						<div className={styles.weekdays}>
							{monthDays.slice(0, 7).map((d) => (
								<div key={d.format(DAY_KEY)} className={styles.weekday}>
									{d.format('ddd')}
								</div>
							))}
						</div>
						<div className={styles.monthGrid}>
							{monthDays.map((d) => {
								const items = byDay.get(d.format(DAY_KEY)) ?? [];
								return (
									<div
										key={d.format(DAY_KEY)}
										className={clsx(
											styles.cell,
											!d.isSame(anchor, 'month') && styles.outside
										)}
									>
										<button
											type='button'
											className={clsx(
												styles.dayNumber,
												d.isSame(todayDate, 'day') && styles.today
											)}
											onClick={() => openDay(d)}
										>
											{d.date()}
										</button>
										{items.slice(0, MAX_CHIPS_PER_DAY).map((s) => chip(s))}
										{items.length > MAX_CHIPS_PER_DAY && (
											<button
												type='button'
												className={styles.more}
												onClick={() => openDay(d)}
											>
												{t('sessions.calendar.more', {
													count: items.length - MAX_CHIPS_PER_DAY,
												})}
											</button>
										)}
									</div>
								);
							})}
						</div>
					</>
				) : (
					<div
						className={clsx(
							styles.timeGrid,
							view === 'week' && styles.timeGridWeek
						)}
					>
						<div className={styles.corner} />
						{columns.map((d) => (
							<div key={d.format(DAY_KEY)} className={styles.columnHead}>
								{d.format('ddd')}
								<strong>{d.date()}</strong>
							</div>
						))}
						{HOURS.map((hour) => (
							<HourRow
								key={hour}
								hour={hour}
								columns={columns}
								byDay={byDay}
								hourOf={hourOf}
								renderChip={(s) => chip(s, true)}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

interface HourRowProps {
	hour: number;
	columns: Dayjs[];
	byDay: Map<string, CoachingSessionRecord[]>;
	hourOf: (s: CoachingSessionRecord) => number;
	renderChip: (s: CoachingSessionRecord) => React.ReactNode;
}

function HourRow({ hour, columns, byDay, hourOf, renderChip }: HourRowProps) {
	return (
		<>
			<div className={styles.hourLabel}>
				{dayjs().hour(hour).minute(0).format('HH:mm')}
			</div>
			{columns.map((d) => (
				<div key={d.format(DAY_KEY)} className={styles.hourCell}>
					{(byDay.get(d.format(DAY_KEY)) ?? [])
						.filter((s) => hourOf(s) === hour)
						.map(renderChip)}
				</div>
			))}
		</>
	);
}
