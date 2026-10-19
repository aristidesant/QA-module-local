import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Group, List, SimpleGrid, Stack, Text } from '@mantine/core';
import dayjs from 'dayjs';
import type { NotificationPayload } from '~/models/qa/notifications';
import { TODAY } from '~/modules/qa/analytics/constants';
import { CALL_EVALUATION_TABS } from '~/views/Campaigns/constants';
import type { InboxViewer } from '../../constants';
import { DeltaText, Fact } from './Fact';
import { MetricAlertDetail } from './MetricAlertDetail';
import { TrendWarningDetail } from './TrendWarningDetail';
import { BurnoutRiskDetail } from './BurnoutRiskDetail';
import { RecognitionDetail } from './RecognitionDetail';
import { BadgeEarnedDetail } from './BadgeEarnedDetail';
import styles from '../Inbox.module.css';

export { DeltaText, Fact } from './Fact';

interface PayloadDetailProps {
	payload: NotificationPayload;
	/** The agent the notification is about. */
	agentId: string;
	/** When the notification was raised. */
	createdAt: string;
	viewer: InboxViewer;
}

/**
 * Renders the body that fits the notification kind. Alerts, burnout, recognitions
 * and badges have their own components; the rest are short fact grids.
 */
export const PayloadDetail: React.FC<PayloadDetailProps> = ({
	payload,
	agentId,
	createdAt,
	viewer,
}) => {
	const { t } = useTranslation('qa.inbox');

	switch (payload.kind) {
		case 'METRIC_ALERT':
			return <MetricAlertDetail payload={payload} />;

		case 'TREND_WARNING':
			return <TrendWarningDetail payload={payload} />;

		case 'BURNOUT_RISK':
			return (
				<BurnoutRiskDetail
					payload={payload}
					agentId={agentId}
					viewer={viewer}
				/>
			);

		case 'RECOGNITION':
			return <RecognitionDetail payload={payload} />;

		case 'BADGE_EARNED':
			return (
				<BadgeEarnedDetail
					payload={payload}
					agentId={agentId}
					earnedAt={createdAt}
					viewer={viewer}
				/>
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
