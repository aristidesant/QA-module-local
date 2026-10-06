import React from 'react';
import { useTranslation } from 'react-i18next';
import {
	Badge,
	Group,
	List,
	Progress,
	SimpleGrid,
	Stack,
	Text,
	ThemeIcon,
} from '@mantine/core';
import { Sparkline } from '@mantine/charts';
import {
	IconArrowDownRight,
	IconArrowUpRight,
	IconMinus,
	IconTrophy,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import type { NotificationPayload } from '~/models/qa/notifications';
import { formatMetricValue } from '~/modules/qa/triggers/helpers';
import { TODAY } from '~/modules/qa/analytics/constants';
import { CALL_EVALUATION_TABS } from '~/views/Campaigns/constants';
import styles from '../Inbox.module.css';

/** Small label/value pair used by most detail bodies. */
const Fact: React.FC<{ label: string; children: React.ReactNode }> = ({
	label,
	children,
}) => (
	<div>
		<Text size='xs' c='dimmed'>
			{label}
		</Text>
		<Text fw={600} size='sm'>
			{children}
		</Text>
	</div>
);

const DeltaText: React.FC<{ value: number | null; suffix?: string }> = ({
	value,
	suffix = '',
}) => {
	if (value === null) return <Text size='sm'>—</Text>;
	const Icon =
		value > 0 ? IconArrowUpRight : value < 0 ? IconArrowDownRight : IconMinus;
	const color = value > 0 ? 'green' : value < 0 ? 'red' : 'gray';
	return (
		<Group gap={4} wrap='nowrap'>
			<Text fw={600} size='sm' c={color}>
				{value > 0 ? '+' : ''}
				{value}
				{suffix}
			</Text>
			<ThemeIcon size='xs' variant='light' color={color}>
				<Icon size={12} />
			</ThemeIcon>
		</Group>
	);
};

interface PayloadDetailProps {
	payload: NotificationPayload;
}

/**
 * Renders the body that fits the notification kind. Metric labels come from the
 * analytics namespace so a QA alert reads the same here and on the dashboards.
 */
export const PayloadDetail: React.FC<PayloadDetailProps> = ({ payload }) => {
	const { t } = useTranslation('qa.inbox');
	const { t: tAnalytics } = useTranslation('qa.teamAnalytics');

	switch (payload.kind) {
		case 'METRIC_ALERT':
			return (
				<Stack gap='md'>
					<SimpleGrid cols={3} spacing='md'>
						<Fact label={t('details.metricAlert.current')}>
							<Text span c='red' fw={700}>
								{formatMetricValue(payload.metricId, payload.value)}
							</Text>
						</Fact>
						<Fact label={t('details.metricAlert.threshold')}>
							{formatMetricValue(payload.metricId, payload.threshold)}
						</Fact>
						<Fact label={t('details.metricAlert.window')}>
							{payload.windowLabel}
						</Fact>
					</SimpleGrid>
					<div>
						<Text size='xs' c='dimmed' mb={4}>
							{tAnalytics(`metrics.${payload.metricId}`)}
						</Text>
						<Sparkline
							h={48}
							data={payload.sparkline}
							color='red'
							fillOpacity={0.2}
							strokeWidth={2}
						/>
					</div>
					{payload.ruleName && (
						<Badge variant='light' color='gray' tt='none'>
							{t('details.metricAlert.rule', { name: payload.ruleName })}
						</Badge>
					)}
				</Stack>
			);

		case 'TREND_WARNING':
			return (
				<Stack gap='md'>
					<SimpleGrid cols={{ base: 2, sm: 4 }} spacing='md'>
						<Fact label={t('details.trendWarning.from')}>
							{formatMetricValue(payload.metricId, payload.from)}
						</Fact>
						<Fact label={t('details.trendWarning.to')}>
							{formatMetricValue(payload.metricId, payload.to)}
						</Fact>
						<Fact label={t('details.trendWarning.change')}>
							<DeltaText value={payload.deltaPct} suffix='%' />
						</Fact>
						<Fact label={t('details.trendWarning.period')}>
							{payload.periodLabel}
						</Fact>
					</SimpleGrid>
					<div>
						<Text size='xs' c='dimmed' mb={4}>
							{tAnalytics(`metrics.${payload.metricId}`)}
						</Text>
						<Sparkline
							h={48}
							data={payload.sparkline}
							color='orange'
							fillOpacity={0.2}
							strokeWidth={2}
						/>
					</div>
					{payload.ruleName && (
						<Badge variant='light' color='gray' tt='none'>
							{t('details.metricAlert.rule', { name: payload.ruleName })}
						</Badge>
					)}
				</Stack>
			);

		case 'BURNOUT_RISK': {
			const color = payload.level === 'high' ? 'red' : 'orange';
			return (
				<Stack gap='md'>
					<Group justify='space-between'>
						<Fact label={t('details.burnout.level')}>
							<Badge color={color} variant='light'>
								{t(`details.burnout.levels.${payload.level}`)}
							</Badge>
						</Fact>
						<Text fw={700} size='lg'>
							{payload.percentage}%
						</Text>
					</Group>
					<Progress value={payload.percentage} color={color} />
					<div>
						<Text size='xs' c='dimmed' mb={6}>
							{t('details.burnout.drivers')}
						</Text>
						<Group gap={6} wrap='wrap'>
							{payload.drivers.map((driver) => (
								<Badge key={driver} variant='outline' color='gray' tt='none'>
									{tAnalytics(`burnout.drivers.${driver}`)}
								</Badge>
							))}
						</Group>
					</div>
				</Stack>
			);
		}

		case 'RECOGNITION':
			return (
				<Group gap='md' wrap='nowrap'>
					<ThemeIcon size='xl' radius='md' variant='light' color='green'>
						<IconTrophy size={26} />
					</ThemeIcon>
					<Stack gap={2}>
						<Text fw={600}>
							{payload.type === 'STREAK'
								? t('details.recognition.STREAK', {
										count: payload.streakWeeks ?? 0,
									})
								: payload.type === 'IMPROVEMENT'
									? t('details.recognition.IMPROVEMENT', {
											delta: payload.deltaPct ?? 0,
										})
									: t('details.recognition.MILESTONE')}
						</Text>
						{payload.metricId && payload.value !== undefined && (
							<Text size='sm' c='dimmed'>
								{tAnalytics(`metrics.${payload.metricId}`)}:{' '}
								{formatMetricValue(payload.metricId, payload.value)}
							</Text>
						)}
					</Stack>
				</Group>
			);

		case 'BADGE_EARNED':
			return (
				<Group gap='md' wrap='nowrap'>
					<div
						className={styles.badgeCircle}
						data-badge-color={payload.badgeColor}
					>
						<Text size='xl'>{payload.badgeIcon}</Text>
					</div>
					<Stack gap={4}>
						<Group gap='xs'>
							<Text fw={600}>{payload.badgeName}</Text>
							<Badge size='sm' variant='light' color={payload.badgeColor}>
								{t(`details.badge.tier.${payload.tier}`)}
							</Badge>
						</Group>
						<Text size='sm' c='dimmed'>
							{payload.reason}
						</Text>
					</Stack>
				</Group>
			);

		case 'WEEKLY_SUMMARY':
			return (
				<Stack gap='md'>
					<Text size='sm' fw={600}>
						{t('details.weekly.week', { label: payload.weekLabel })}
					</Text>
					<SimpleGrid cols={{ base: 2, sm: 4 }} spacing='md'>
						{payload.kpis.map((kpi) => (
							<div key={kpi.label}>
								<Text size='xs' c='dimmed'>
									{kpi.label}
								</Text>
								<Text fw={700}>{kpi.value}</Text>
								<DeltaText value={kpi.delta} />
							</div>
						))}
					</SimpleGrid>
					{payload.highlights.length > 0 && (
						<div>
							<Text size='xs' c='dimmed' mb={4}>
								{t('details.weekly.highlights')}
							</Text>
							<List size='sm' spacing={4}>
								{payload.highlights.map((h) => (
									<List.Item key={h}>{h}</List.Item>
								))}
							</List>
						</div>
					)}
				</Stack>
			);

		case 'COACHING_SESSION':
			return (
				<SimpleGrid cols={{ base: 1, sm: 3 }} spacing='md'>
					<Fact label={t('details.coaching.when')}>
						{dayjs(payload.date).format('ddd DD MMM · HH:mm')}
					</Fact>
					<Fact label={t('details.coaching.coach')}>{payload.coachName}</Fact>
					<Fact label={t('details.coaching.topic')}>{payload.topic}</Fact>
				</SimpleGrid>
			);

		case 'LMS_ASSIGNMENT': {
			const overdue = payload.dueDate < TODAY;
			return (
				<SimpleGrid cols={{ base: 1, sm: 3 }} spacing='md'>
					<Fact label={t('details.lms.content')}>{payload.contentTitle}</Fact>
					<Fact label={t('details.lms.due')}>
						<Text span c={overdue ? 'red' : undefined} fw={600}>
							{dayjs(payload.dueDate).format('DD MMM YYYY')}
							{overdue ? ` · ${t('details.lms.overdue')}` : ''}
						</Text>
					</Fact>
					<div>
						{payload.mandatory && (
							<Badge color='red' variant='light'>
								{t('details.lms.mandatory')}
							</Badge>
						)}
					</div>
				</SimpleGrid>
			);
		}

		case 'FOLLOW_UP':
			return (
				<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='md'>
					<Fact label={t('details.followUp.customer')}>
						{payload.customerName}
					</Fact>
					<Fact label={t('details.followUp.due')}>
						{dayjs(payload.dueDate).format('DD MMM YYYY')}
					</Fact>
				</SimpleGrid>
			);

		case 'DISPUTE_UPDATE': {
			const statusColor =
				payload.status === 'accepted'
					? 'green'
					: payload.status === 'partially-accepted'
						? 'yellow'
						: payload.status === 'rejected'
							? 'red'
							: 'blue';
			const typeMeta = CALL_EVALUATION_TABS.find(
				(tab) => tab.key === payload.evaluationType
			);
			return (
				<SimpleGrid cols={{ base: 2, sm: 4 }} spacing='md'>
					<Fact label={t('details.dispute.statusLabel')}>
						<Badge color={statusColor} variant='light'>
							{t(`details.dispute.status.${payload.status}`)}
						</Badge>
					</Fact>
					<Fact label={t('details.dispute.type')}>
						<Badge variant='light' color={typeMeta?.color ?? 'gray'}>
							{typeMeta?.label ?? payload.evaluationType}
						</Badge>
					</Fact>
					<Fact label={t('details.dispute.call')}>{payload.callId}</Fact>
					<Fact label={t('details.dispute.score')}>
						{payload.scoreBefore === null
							? '—'
							: payload.scoreAfter === null
								? payload.scoreBefore
								: `${payload.scoreBefore} → ${payload.scoreAfter}`}
					</Fact>
				</SimpleGrid>
			);
		}

		case 'RANKING_UPDATE':
			return (
				<Stack gap='md'>
					<Group justify='space-between' align='flex-start'>
						<Fact label={payload.rankingName}>
							{t(`details.ranking.events.${payload.event}`)}
						</Fact>
						{payload.rank !== undefined && (
							<div className={styles.rankBlock}>
								<Text fw={700} size='xl'>
									#{payload.rank}
								</Text>
								{payload.previousRank !== undefined && (
									<Text size='xs' c='dimmed'>
										{t('details.ranking.previous', {
											rank: payload.previousRank,
										})}
									</Text>
								)}
							</div>
						)}
					</Group>
					{payload.prizeTitle && (
						<Fact label={t('details.ranking.prize')}>{payload.prizeTitle}</Fact>
					)}
					{payload.badgeName && (
						<Badge variant='light' color='yellow' tt='none'>
							{payload.badgeName}
						</Badge>
					)}
				</Stack>
			);

		case 'MESSAGE':
		default:
			return null;
	}
};

export default PayloadDetail;
