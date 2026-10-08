import { Badge, Group, Text } from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import { getScoreBandColor } from '~/modules/qa/constants/badgeColors';
import { daysUntil } from '~/modules/qa/lms/helpers';
import type { AgentCoachingRow } from '../agentRows';
import {
	SCORECARD_DIMENSION_META,
	SCORECARD_DIMENSION_ORDER,
	type ScorecardDimension,
} from '../scorecard';
import {
	ScorecardBadge,
	ScorecardDimensionBadge,
	ScorecardTrendBadge,
} from './ScorecardBadges';
import { TierTenureText } from './TierTenureText';

const helper = createColumnHelper<AgentCoachingRow>();

/** Sessions and fired rules are counted over the weekly evaluation period. */
const EVALUATION_PERIOD_DAYS = 7;

interface AgentsTierTableProps {
	rows: AgentCoachingRow[];
	onOpen: (agentId: string) => void;
}

/** Every column of the Agents tab for one set of agents: scorecard, aspects, time in group, sessions and rules. */
export function AgentsTierTable({ rows, onOpen }: AgentsTierTableProps) {
	const { t } = useTranslation(['qa.coaching', 'qa.lms']);

	const dimensionColumn = (dimension: ScorecardDimension) =>
		helper.accessor((r) => r.scorecard?.dimensions[dimension] ?? -1, {
			id: dimension,
			header: t(SCORECARD_DIMENSION_META[dimension].shortLabelKey),
			cell: (info) => {
				const v = info.getValue();
				return v < 0 ? (
					<Text size='sm' c='dimmed'>
						—
					</Text>
				) : (
					<Text size='sm' fw={500} c={`${getScoreBandColor(v)}.7`}>
						{v}
					</Text>
				);
			},
		}) as BaseTableColumnDef<AgentCoachingRow>;

	const columns: BaseTableColumnDef<AgentCoachingRow>[] = [
		helper.accessor('name', {
			header: t('agents.columns.agent'),
			cell: (info) => (
				<Text size='sm' fw={500}>
					{info.getValue()}
				</Text>
			),
		}) as BaseTableColumnDef<AgentCoachingRow>,
		helper.accessor('team', {
			header: t('agents.columns.team'),
			cell: (info) => (
				<Text size='sm' c='dimmed'>
					{info.getValue()}
				</Text>
			),
		}) as BaseTableColumnDef<AgentCoachingRow>,
		helper.accessor((r) => r.scorecard?.score ?? -1, {
			id: 'scorecard',
			header: t('agents.columns.scorecard'),
			cell: (info) => (
				<ScorecardBadge scorecard={info.row.original.scorecard} size='sm' />
			),
		}) as BaseTableColumnDef<AgentCoachingRow>,
		helper.accessor((r) => (r.tenure.tier ? r.tenure.weeks : -1), {
			id: 'tenure',
			header: t('agents.columns.tenure'),
			cell: (info) => <TierTenureText tenure={info.row.original.tenure} />,
		}) as BaseTableColumnDef<AgentCoachingRow>,
		...SCORECARD_DIMENSION_ORDER.map(dimensionColumn),
		helper.display({
			id: 'weakest',
			header: t('agents.columns.weakest'),
			cell: (info) => {
				const w = info.row.original.weakest;
				if (!w)
					return (
						<Text size='sm' c='dimmed'>
							—
						</Text>
					);
				return (
					<Group gap={6} wrap='nowrap'>
						<ScorecardDimensionBadge dimension={w.dimension} size='xs' />
						<Text size='xs' c='dimmed'>
							{w.value}
						</Text>
					</Group>
				);
			},
		}) as BaseTableColumnDef<AgentCoachingRow>,
		helper.display({
			id: 'trend',
			header: t('agents.columns.lastImpact'),
			cell: (info) => (
				<ScorecardTrendBadge trend={info.row.original.trend} size='xs' />
			),
		}) as BaseTableColumnDef<AgentCoachingRow>,
		helper.display({
			id: 'sessions',
			header: t('agents.columns.sessions'),
			cell: (info) => (
				<Text size='sm'>
					{
						info.row.original.sessionDates.filter(
							(d) =>
								daysUntil(d) >= -EVALUATION_PERIOD_DAYS && daysUntil(d) <= 0
						).length
					}
				</Text>
			),
		}) as BaseTableColumnDef<AgentCoachingRow>,
		helper.accessor('pending', {
			header: t('agents.columns.pending'),
			cell: (info) => (
				<Text size='sm' c={info.getValue() > 0 ? 'yellow.7' : undefined}>
					{info.getValue()}
				</Text>
			),
		}) as BaseTableColumnDef<AgentCoachingRow>,
		helper.accessor('overdue', {
			header: t('agents.columns.overdue'),
			cell: (info) => (
				<Text
					size='sm'
					c={info.getValue() > 0 ? 'red' : undefined}
					fw={info.getValue() > 0 ? 600 : 400}
				>
					{info.getValue()}
				</Text>
			),
		}) as BaseTableColumnDef<AgentCoachingRow>,
		helper.display({
			id: 'triggeredRules',
			header: t('agents.columns.triggeredRules'),
			cell: (info) => {
				// Distinct rules that fired for the agent inside the evaluation period.
				const count = new Set(
					info.row.original.ruleEvents
						.filter(
							(e) =>
								daysUntil(e.date) >= -EVALUATION_PERIOD_DAYS &&
								daysUntil(e.date) <= 0
						)
						.map((e) => e.ruleId)
				).size;
				return (
					<Text size='sm' c={count === 0 ? 'dimmed' : undefined}>
						{count}
					</Text>
				);
			},
		}) as BaseTableColumnDef<AgentCoachingRow>,
		helper.accessor('pendingSession', {
			header: t('agents.columns.pendingSession'),
			cell: (info) =>
				info.getValue() ? (
					<Badge size='xs' variant='light'>
						{t('agents.pendingSession.yes')}
					</Badge>
				) : (
					<Text size='sm' c='dimmed'>
						{t('agents.pendingSession.no')}
					</Text>
				),
		}) as BaseTableColumnDef<AgentCoachingRow>,
	];

	return (
		<BaseTable<AgentCoachingRow>
			data={rows}
			columns={columns}
			getRowId={(r) => r.id}
			initialSort={[{ id: 'scorecard', desc: true }]}
			density='compact'
			emptyMessage={t('agents.empty')}
			onRowClick={(r) => onOpen(r.id)}
		/>
	);
}
