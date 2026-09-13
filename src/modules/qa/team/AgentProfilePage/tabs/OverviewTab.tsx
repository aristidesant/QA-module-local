import { useState } from 'react';
import { Anchor, Badge, Button, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { AreaChart } from '@mantine/charts';
import {
	IconAlertTriangle, IconChartLine, IconFlame, IconMinus, IconShieldExclamation, IconThumbUp, IconTrendingDown, IconTrendingUp, IconUsers,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import { StatCard } from '~/components/StatCard';
import PeerComparisonSection from '~/modules/role-preview/AgentDetailPage/components/PeerComparisonSection';
import BurnoutRiskWidget from '~/modules/qa/dashboard/components/BurnoutRiskWidget';
import { useTeamStore } from '~/stores/qa/teamStore';
import type { AgentProfile, PerformancePoint, ProfilePeriod } from '../../types';
import { DIMENSION_ORDER } from '../../constants';
import { formatDateTime, periodDirection } from '../../helpers';
import { DimensionScoreCard } from '../../components/DimensionScoreCard';
import { PerformanceTrendChart } from '../../components/PerformanceTrendChart';

interface OverviewTabProps {
	profile: AgentProfile;
	points: PerformancePoint[];
	period: ProfilePeriod;
}

const DIRECTION_ICON = { up: IconTrendingUp, down: IconTrendingDown, flat: IconMinus } as const;
const DIRECTION_COLOR = { up: 'teal', down: 'red', flat: 'gray' } as const;

export function OverviewTab({ profile, points }: OverviewTabProps) {
	const { t } = useTranslation('qa.team');
	const navigate = useNavigate();
	const [visible, setVisible] = useState({ overall: true, qa: true, sentiment: true, compliance: true, business: true });
	const dir = periodDirection(points, 'overall');
	const DirIcon = DIRECTION_ICON[dir.trend];
	const acknowledgeAlert = useTeamStore((s) => s.acknowledgeAlert);

	const totalCriticalErrors = profile.risk.criticalErrorsTrend.reduce((sum, e) => sum + e.criticalErrors, 0);
	const openAlerts = profile.risk.alerts.filter((a) => !a.acknowledged).length;
	const openDisputes = profile.risk.disputes.filter((d) => d.status === 'open').length;

	const toggle = (key: keyof typeof visible) => setVisible((v) => ({ ...v, [key]: !v[key] }));

	return (
		<Stack gap='md'>
			<SimpleGrid cols={{ base: 2, md: 4 }} spacing='md'>
				{DIMENSION_ORDER.map((key) => (
					<DimensionScoreCard key={key} dimension={profile.dimensions.find((d) => d.key === key)!} />
				))}
			</SimpleGrid>

			<SectionCard
				title={t('overview.performance')}
				description={t('overview.performanceDescription')}
				icon={IconChartLine}
				headerActions={(
					<Badge color={DIRECTION_COLOR[dir.trend]} variant='light' leftSection={<DirIcon size={12} />}>
						{t(`overview.direction.${dir.trend}`)}
					</Badge>
				)}
			>
				<PerformanceTrendChart points={points} visible={visible} onToggle={toggle} />
				<Text size='xs' c='dimmed'>{t('overview.directionHint', { delta: dir.delta })}</Text>
			</SectionCard>

			<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
				<SectionCard title={t('overview.strengths')} icon={IconThumbUp} headerAccent='green'>
					{profile.strengths.length === 0 ? (
						<Text c='dimmed' size='sm'>{t('overview.noStrengths')}</Text>
					) : (
						<Stack gap='xs'>
							{profile.strengths.map((s) => (
								<Paper key={s.label} withBorder p='sm'>
									<Text fw={600} size='sm'>{s.label}</Text>
									<Text size='xs' c='dimmed'>{s.evidence}</Text>
								</Paper>
							))}
						</Stack>
					)}
				</SectionCard>
				<SectionCard title={t('overview.weaknesses')} icon={IconAlertTriangle} headerAccent='yellow'>
					{profile.weaknesses.length === 0 ? (
						<Text c='dimmed' size='sm'>{t('overview.noWeaknesses')}</Text>
					) : (
						<Stack gap='xs'>
							{profile.weaknesses.map((w) => (
								<Paper key={w.label} withBorder p='sm'>
									<Text fw={600} size='sm'>{w.label}</Text>
									<Text size='xs' c='dimmed'>{w.evidence}</Text>
									{w.suggestedAction && (
										<Text size='xs' mt={4}><b>{t('overview.suggestedAction')}:</b> {w.suggestedAction}</Text>
									)}
								</Paper>
							))}
						</Stack>
					)}
				</SectionCard>
			</SimpleGrid>

			<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
				<SectionCard title={t('overview.peer')} description={t('overview.peerDescription', { team: profile.agent.team })} icon={IconUsers}>
					<PeerComparisonSection metrics={profile.peerComparison} agentName={profile.agent.name} percentileRank={`P${profile.overall.percentile}`} />
				</SectionCard>
				<SectionCard title={t('overview.burnout')} icon={IconFlame}>
					<Stack gap='sm'>
						<BurnoutRiskWidget data={profile.risk.burnout} />
						<AreaChart
							h={120}
							data={profile.risk.burnoutTrend}
							dataKey='label'
							series={[{ name: 'percentage', color: 'red.6' }]}
							withXAxis={false}
							withYAxis={false}
							withTooltip
							curveType='monotone'
						/>
					</Stack>
				</SectionCard>
			</SimpleGrid>

			<SectionCard title={t('overview.risk')} icon={IconShieldExclamation}>
				<Stack gap='md'>
					<SimpleGrid cols={{ base: 2, md: 4 }} spacing='md'>
						<StatCard title={t('overview.riskTiles.autoFails')} value={profile.qa.autoFails} color={profile.qa.autoFails > 0 ? 'red' : undefined} variant='compact' />
						<StatCard title={t('overview.riskTiles.criticalErrors')} value={totalCriticalErrors} color={totalCriticalErrors > 0 ? 'orange' : undefined} variant='compact' />
						<StatCard title={t('overview.riskTiles.openAlerts')} value={openAlerts} color={openAlerts > 0 ? 'red' : undefined} variant='compact' />
						<StatCard title={t('overview.riskTiles.openDisputes')} value={openDisputes} color={openDisputes > 0 ? 'orange' : undefined} variant='compact' />
					</SimpleGrid>

					<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
						<Stack gap='xs'>
							<Text size='sm' fw={600}>{t('overview.alerts')}</Text>
							{profile.risk.alerts.length === 0 ? (
								<EmptyState message={t('overview.noAlerts')} />
							) : profile.risk.alerts.map((alert) => (
								<Paper key={alert.id} withBorder p='sm'>
									<Group justify='space-between' align='flex-start'>
										<Stack gap={2}>
											<Badge color={alert.severity === 'critical' ? 'red' : alert.severity === 'warning' ? 'yellow' : 'gray'} size='xs'>
												{alert.severity}
											</Badge>
											<Text fw={600} size='sm'>{alert.ruleName}</Text>
											<Text size='xs' c='dimmed'>{alert.metric} · {formatDateTime(alert.firedAt)}</Text>
										</Stack>
										{alert.acknowledged ? (
											<Badge variant='light' color='green'>{t('overview.acknowledged')}</Badge>
										) : (
											<Button size='xs' variant='light' onClick={() => acknowledgeAlert(profile.agent.id, alert.id)}>
												{t('overview.acknowledge')}
											</Button>
										)}
									</Group>
								</Paper>
							))}
						</Stack>
						<Stack gap='xs'>
							<Text size='sm' fw={600}>{t('overview.disputes')}</Text>
							{profile.risk.disputes.length === 0 ? (
								<EmptyState message={t('overview.noDisputes')} />
							) : profile.risk.disputes.map((dispute) => (
								<Paper key={dispute.id} withBorder p='sm'>
									<Group justify='space-between' align='flex-start'>
										<Stack gap={2}>
											<Badge color={dispute.status === 'open' ? 'orange' : dispute.status === 'won' ? 'green' : dispute.status === 'lost' ? 'red' : 'gray'} size='xs'>
												{t(`overview.disputeStatus.${dispute.status}`)}
											</Badge>
											<Text fw={600} size='sm'>{dispute.item}</Text>
											<Text size='xs' c='dimmed'>Call {dispute.callId} · filed {dispute.filedAt}</Text>
										</Stack>
										<Anchor size='xs' onClick={() => navigate(`/qa/campaigns/1/calls/${dispute.callId}`)}>
											{t('activity.open')}
										</Anchor>
									</Group>
								</Paper>
							))}
						</Stack>
					</SimpleGrid>
				</Stack>
			</SectionCard>
		</Stack>
	);
}
