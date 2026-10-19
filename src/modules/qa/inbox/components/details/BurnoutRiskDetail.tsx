import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Group, Paper, RingProgress, Stack, Text } from '@mantine/core';
import { AreaChart } from '@mantine/charts';
import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import type { NotificationPayload } from '~/models/qa/notifications';
import type { BurnoutDriver } from '~/modules/qa/analytics/types';
import { assessBurnout } from '~/modules/qa/analytics/helpers';
import { TEAM_AGENTS, TEAM_PROFILES } from '~/modules/qa/team/mockData';
import {
	describeCondition,
	formatMetricValue,
} from '~/modules/qa/triggers/helpers';
import {
	selectTriggerRules,
	useTriggerRulesStore,
} from '~/stores/qa/triggerRulesStore';
import { agentNameOf, type InboxViewer } from '../../constants';
import styles from '../Inbox.module.css';

type BurnoutPayload = Extract<NotificationPayload, { kind: 'BURNOUT_RISK' }>;

interface BurnoutRiskDetailProps {
	payload: BurnoutPayload;
	/** The agent the alert is about; a team-level alert carries a manager id and falls back to the driver labels. */
	agentId: string;
	viewer: InboxViewer;
}

/** Driver rows: conditions met first, then the ones close to their threshold. */
const STATUS_ORDER: Record<BurnoutDriver['status'], number> = {
	BREACHED: 0,
	NEAR: 1,
	OK: 2,
};

const STATUS_TONE: Record<BurnoutDriver['status'], string> = {
	BREACHED: 'danger',
	NEAR: 'amber',
	OK: 'gray',
};

/** Risk level as a small square tile, the six-month timeline beside it, and why the rules flagged the agent. */
export const BurnoutRiskDetail: React.FC<BurnoutRiskDetailProps> = ({
	payload,
	agentId,
	viewer,
}) => {
	const { t } = useTranslation('qa.inbox');
	const { t: tAnalytics } = useTranslation('qa.teamAnalytics');
	const { t: tTriggers } = useTranslation('qa.triggers');
	const rules = useTriggerRulesStore(selectTriggerRules);
	const tone = payload.level === 'high' ? 'danger' : 'amber';

	const isAgent = TEAM_AGENTS.some((agent) => agent.id === agentId);
	const profile = TEAM_PROFILES[agentId];
	const drivers = useMemo(
		() =>
			isAgent
				? [...assessBurnout(agentId, rules).drivers].sort(
						(a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
					)
				: [],
		[agentId, isAgent, rules]
	);

	const columns = useMemo<BaseTableColumnDef<BurnoutDriver>[]>(
		() => [
			{
				id: 'condition',
				header: t('details.burnout.columns.condition'),
				cell: ({ row }) => (
					<div>
						<Text size='sm'>
							{describeCondition(tTriggers, row.original.condition)}
						</Text>
						<Text size='xs' c='dimmed'>
							{row.original.ruleName}
						</Text>
					</div>
				),
			},
			{
				id: 'current',
				header: t('details.burnout.columns.current'),
				size: 110,
				cell: ({ row }) => (
					<Text size='sm' fw={600}>
						{row.original.currentValue === null
							? '—'
							: formatMetricValue(
									row.original.condition.metricId,
									row.original.currentValue
								)}
					</Text>
				),
			},
			{
				id: 'status',
				header: t('details.burnout.columns.status'),
				size: 150,
				cell: ({ row }) => (
					<Badge
						variant='light'
						size='sm'
						color={STATUS_TONE[row.original.status]}
					>
						{tAnalytics(`burnout.driverStatus.${row.original.status}`)}
					</Badge>
				),
			},
		],
		[t, tAnalytics, tTriggers]
	);

	const driverChips = (
		<Group gap={6} wrap='wrap'>
			{payload.drivers.map((driver) => (
				<Badge key={driver} variant='outline' color='gray' tt='none'>
					{tAnalytics(`burnout.drivers.${driver}`)}
				</Badge>
			))}
		</Group>
	);

	return (
		<Stack gap='md'>
			<Group align='stretch' gap='lg' wrap='wrap'>
				<Paper withBorder radius='md' p='xs' className={styles.riskTile}>
					<Stack align='center' justify='center' gap={6} h='100%'>
						<Text size='xs' c='dimmed'>
							{t('details.burnout.level')}
						</Text>
						<RingProgress
							size={76}
							thickness={9}
							roundCaps
							sections={[{ value: payload.percentage, color: tone }]}
							role='img'
							aria-label={`${t('details.burnout.level')}: ${payload.percentage}%`}
							label={
								<Text ta='center' fw={700} size='sm'>
									{payload.percentage}%
								</Text>
							}
						/>
						<Badge color={tone} variant='light' size='sm'>
							{t(`details.burnout.levels.${payload.level}`)}
						</Badge>
					</Stack>
				</Paper>

				<div className={styles.riskDrivers}>
					{profile ? (
						<>
							<Text size='xs' c='dimmed' mb={6}>
								{tAnalytics('burnout.timelineTitle')}
							</Text>
							<AreaChart
								h={120}
								data={profile.risk.burnoutTrend}
								dataKey='label'
								series={[
									{
										name: 'percentage',
										label: tAnalytics('burnout.timelineSeries'),
										color: tone,
									},
								]}
								curveType='monotone'
								withYAxis={false}
								withTooltip
								unit='%'
								yAxisProps={{ domain: [0, 100] }}
							/>
						</>
					) : (
						<>
							<Text size='xs' c='dimmed' mb={6}>
								{t('details.burnout.drivers')}
							</Text>
							{driverChips}
						</>
					)}
				</div>
			</Group>

			{drivers.length > 0 ? (
				<Stack gap='xs'>
					<Text size='sm' fw={600}>
						{viewer === 'agent'
							? t('details.burnout.whyYou')
							: t('details.burnout.whyAgent', {
									name: agentNameOf(agentId) ?? agentId,
								})}
					</Text>
					<BaseTable<BurnoutDriver>
						columns={columns}
						data={drivers}
						getRowId={(driver) => driver.id}
						density='compact'
					/>
				</Stack>
			) : (
				profile && (
					<div>
						<Text size='xs' c='dimmed' mb={6}>
							{t('details.burnout.drivers')}
						</Text>
						{driverChips}
					</div>
				)
			)}
		</Stack>
	);
};

export default BurnoutRiskDetail;
