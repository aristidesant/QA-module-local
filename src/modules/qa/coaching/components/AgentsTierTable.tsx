import { Badge, Group, Text } from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import { getScoreBandColor } from '~/modules/qa/constants/badgeColors';
import type { AgentCoachingRow } from '../agentRows';
import {
	SCORECARD_DIMENSION_META,
	SCORECARD_DIMENSION_ORDER,
	TIER_META,
	TIER_ORDER,
	type ScorecardDimension,
} from '../scorecard';
import {
	ScorecardBadge,
	ScorecardDimensionBadge,
	ScorecardTrendBadge,
} from './ScorecardBadges';
import { TierTenureText } from './TierTenureText';

const helper = createColumnHelper<AgentCoachingRow>();

interface AgentsTierTableProps {
	rows: AgentCoachingRow[];
	onOpen: (agentId: string) => void;
}

/** The Agents tab table: group, scorecard, aspects, time in group and pending session for every agent passed in. */
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
		helper.accessor(
			(r) => (r.tier ? TIER_ORDER.indexOf(r.tier) : TIER_ORDER.length),
			{
				id: 'tier',
				header: t('agents.columns.tier'),
				cell: (info) => {
					const tier = info.row.original.tier;
					return tier ? (
						<Badge size='xs' variant='light' color={TIER_META[tier].color}>
							{t(TIER_META[tier].labelKey)}
						</Badge>
					) : (
						<Badge size='xs' variant='light' color='gray'>
							{t('agents.tiers.noData.title')}
						</Badge>
					);
				},
			}
		) as BaseTableColumnDef<AgentCoachingRow>,
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
			enablePagination
			pageSize={12}
			showPaginationControls
			emptyMessage={t('agents.empty')}
			onRowClick={(r) => onOpen(r.id)}
		/>
	);
}
