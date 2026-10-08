import { useMemo, useState } from 'react';
import {
	Badge,
	Button,
	Group,
	SimpleGrid,
	Stack,
	Text,
	UnstyledButton,
} from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import { IconArrowUpRight } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { StatCard } from '~/components/StatCard';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import EmptyState from '~/components/EmptyState';
import type { AgentCoachingRow } from '../../agentRows';
import { ScorecardBadge } from '../../components/ScorecardBadges';
import { TierTenureText } from '../../components/TierTenureText';
import type { CoachingTierKey } from '../../constants';
import {
	TIER_META,
	TIER_ORDER,
	tierRangeLabel,
	type PerformanceTier,
} from '../../scorecard';
import styles from './AgentsTab.module.css';

const helper = createColumnHelper<AgentCoachingRow>();

/** Agents listed inside a group square; the rest are one click away in the details page. */
const MAX_SQUARE_ROWS = 8;

interface AgentsTabProps {
	rows: AgentCoachingRow[];
	onOpen: (agentId: string) => void;
	/** Opens the isolated page with the full table of one group. */
	onShowDetails: (tier: CoachingTierKey) => void;
}

export function AgentsTab({ rows, onOpen, onShowDetails }: AgentsTabProps) {
	const { t } = useTranslation(['qa.coaching', 'qa.lms']);
	const [tierFilter, setTierFilter] = useState<PerformanceTier | null>(null);

	/** The tier cards are the only filter; the summary strip always shows the full distribution. */
	const filtered = useMemo(
		() => (tierFilter ? rows.filter((r) => r.tier === tierFilter) : rows),
		[rows, tierFilter]
	);

	const tierSummary = useMemo(
		() =>
			Object.fromEntries(
				TIER_ORDER.map((tier) => {
					const inTier = rows.filter((r) => r.tier === tier);
					const avg = inTier.length
						? Math.round(
								inTier.reduce((s, r) => s + (r.scorecard?.score ?? 0), 0) /
									inTier.length
							)
						: null;
					return [tier, { count: inTier.length, avg }];
				})
			) as Record<PerformanceTier, { count: number; avg: number | null }>,
		[rows]
	);

	const byTier = useMemo(() => {
		const groups = new Map<PerformanceTier, AgentCoachingRow[]>();
		const noData: AgentCoachingRow[] = [];
		for (const r of filtered) {
			if (!r.tier) noData.push(r);
			else groups.set(r.tier, [...(groups.get(r.tier) ?? []), r]);
		}
		return { groups, noData };
	}, [filtered]);

	/** Excellent is hidden only while another group's card is filtering the list. */
	const showExcellent = !tierFilter || tierFilter === 'EXCELLENT';

	// Agent name, scorecard and time in the group: all a square shows.
	const squareColumns: BaseTableColumnDef<AgentCoachingRow>[] = [
		helper.accessor('name', {
			header: t('agents.columns.agent'),
			cell: (info) => (
				<Text size='sm' fw={500}>
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
	];

	const renderSquare = (
		key: CoachingTierKey,
		tierRows: AgentCoachingRow[],
		worstFirst: boolean
	) => {
		const accent = key === 'NO_DATA' ? undefined : TIER_META[key].color;
		const sorted = [...tierRows].sort((a, b) =>
			worstFirst
				? (a.scorecard?.score ?? -1) - (b.scorecard?.score ?? -1)
				: (b.scorecard?.score ?? -1) - (a.scorecard?.score ?? -1)
		);
		const hidden = sorted.length - MAX_SQUARE_ROWS;
		return (
			<SectionCard
				key={key}
				fullHeight
				headerAccent={accent}
				title={
					key === 'NO_DATA'
						? t('agents.tiers.noData.title')
						: t(TIER_META[key].labelKey)
				}
				description={
					key === 'NO_DATA'
						? t('agents.tiers.noData.description')
						: t('agents.tiers.description', {
								range: tierRangeLabel(t, key),
							})
				}
				headerActions={
					<Group gap='xs' wrap='nowrap'>
						<Badge size='sm' variant='light' color={accent ?? 'gray'}>
							{t('agents.summary.agents', { count: tierRows.length })}
						</Badge>
						<Button
							size='xs'
							variant='default'
							rightSection={<IconArrowUpRight size={14} />}
							disabled={tierRows.length === 0}
							onClick={() => onShowDetails(key)}
						>
							{t('agents.tiers.showDetails')}
						</Button>
					</Group>
				}
			>
				{tierRows.length === 0 ? (
					<EmptyState message={t('agents.tiers.emptyGroup')} />
				) : (
					<Stack gap='xs'>
						<BaseTable<AgentCoachingRow>
							data={sorted.slice(0, MAX_SQUARE_ROWS)}
							columns={squareColumns}
							getRowId={(r) => r.id}
							density='compact'
							emptyMessage={t('agents.empty')}
							onRowClick={(r) => onOpen(r.id)}
						/>
						{hidden > 0 && (
							<Text size='xs' c='dimmed'>
								{t('agents.tiers.more', { count: hidden })}
							</Text>
						)}
					</Stack>
				)}
			</SectionCard>
		);
	};

	return (
		<Stack gap='md'>
			<SimpleGrid cols={{ base: 2, md: 4 }} spacing='md'>
				{TIER_ORDER.map((tier) => {
					const { count, avg } = tierSummary[tier];
					return (
						<UnstyledButton
							key={tier}
							className={styles.tierCard}
							data-active={tierFilter === tier || undefined}
							aria-pressed={tierFilter === tier}
							onClick={() =>
								setTierFilter((cur) => (cur === tier ? null : tier))
							}
						>
							<StatCard
								variant='compact'
								title={t(TIER_META[tier].labelKey)}
								value={count}
								subtitle={
									avg === null
										? tierRangeLabel(t, tier)
										: t('agents.summary.avgScorecard', { value: avg })
								}
								badge={
									<Badge
										size='xs'
										variant='light'
										color={TIER_META[tier].color}
									>
										{tierRangeLabel(t, tier)}
									</Badge>
								}
							/>
						</UnstyledButton>
					);
				})}
			</SimpleGrid>

			{filtered.length === 0 && !showExcellent ? (
				<EmptyState message={t('agents.empty')} />
			) : (
				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
					{TIER_ORDER.map((tier) => {
						const tierRows = byTier.groups.get(tier) ?? [];
						// Excellent is the goal group: it stays on screen, with an empty state, when nobody is in it.
						if (
							tierRows.length === 0 &&
							!(tier === 'EXCELLENT' && showExcellent)
						)
							return null;
						// The lower groups list the weakest agents first, the upper ones the strongest.
						return renderSquare(
							tier,
							tierRows,
							tier === 'NEEDS_IMPROVEMENT' || tier === 'CRITICAL'
						);
					})}
					{byTier.noData.length > 0 &&
						renderSquare('NO_DATA', byTier.noData, false)}
				</SimpleGrid>
			)}
		</Stack>
	);
}
