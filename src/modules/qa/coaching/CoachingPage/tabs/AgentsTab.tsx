import { useMemo, useState } from 'react';
import {
	Badge,
	Button,
	Group,
	Select,
	SimpleGrid,
	Stack,
	Switch,
	TextInput,
	UnstyledButton,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { StatCard } from '~/components/StatCard';
import type { AgentCoachingRow } from '../../agentRows';
import { AgentsTierTable } from '../../components/AgentsTierTable';
import {
	SCORECARD_DIMENSION_META,
	SCORECARD_DIMENSION_ORDER,
	TIER_META,
	TIER_ORDER,
	tierRangeLabel,
	type PerformanceTier,
	type ScorecardDimension,
} from '../../scorecard';
import styles from './AgentsTab.module.css';

/** A performance group, or the agents with no scorecard this week. */
type TierFilter = PerformanceTier | 'NO_DATA';

interface AgentFilters {
	search: string;
	team: string | null;
	tier: TierFilter | null;
	weakest: ScorecardDimension | null;
	pendingOnly: boolean;
}

const DEFAULT_FILTERS: AgentFilters = {
	search: '',
	team: null,
	tier: null,
	weakest: null,
	pendingOnly: false,
};

interface AgentsTabProps {
	rows: AgentCoachingRow[];
	onOpen: (agentId: string) => void;
}

export function AgentsTab({ rows, onOpen }: AgentsTabProps) {
	const { t } = useTranslation(['qa.coaching', 'qa.lms']);
	const [filters, setFilters] = useState<AgentFilters>(DEFAULT_FILTERS);

	const isDefault =
		filters.search === DEFAULT_FILTERS.search &&
		filters.team === DEFAULT_FILTERS.team &&
		filters.tier === DEFAULT_FILTERS.tier &&
		filters.weakest === DEFAULT_FILTERS.weakest &&
		filters.pendingOnly === DEFAULT_FILTERS.pendingOnly;

	const teams = useMemo(
		() => Array.from(new Set(rows.map((r) => r.team))).sort(),
		[rows]
	);

	/** The summary strip always shows the full distribution, whatever the filters are. */
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

	const filtered = useMemo(() => {
		const query = filters.search.trim().toLowerCase();
		return rows.filter((r) => {
			if (query && !r.name.toLowerCase().includes(query)) return false;
			if (filters.team && r.team !== filters.team) return false;
			if (filters.tier) {
				if (
					filters.tier === 'NO_DATA' ? r.tier !== null : r.tier !== filters.tier
				)
					return false;
			}
			if (filters.weakest && r.weakest?.dimension !== filters.weakest)
				return false;
			if (filters.pendingOnly && !r.pendingSession) return false;
			return true;
		});
	}, [rows, filters]);

	const tierOptions = [
		...TIER_ORDER.map((tier) => ({
			value: tier,
			label: t(TIER_META[tier].labelKey),
		})),
		{ value: 'NO_DATA', label: t('agents.tiers.noData.title') },
	];

	const weakestOptions = SCORECARD_DIMENSION_ORDER.map((dimension) => ({
		value: dimension,
		label: t(SCORECARD_DIMENSION_META[dimension].labelKey),
	}));

	return (
		<Stack gap='md'>
			<SimpleGrid cols={{ base: 2, md: 4 }} spacing='md'>
				{TIER_ORDER.map((tier) => {
					const { count, avg } = tierSummary[tier];
					return (
						<UnstyledButton
							key={tier}
							className={styles.tierCard}
							data-active={filters.tier === tier || undefined}
							aria-pressed={filters.tier === tier}
							onClick={() =>
								setFilters((f) => ({
									...f,
									tier: f.tier === tier ? null : tier,
								}))
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

			<SectionCard
				title={t('agents.title')}
				description={t('agents.description')}
				headerActions={
					<Badge size='sm' variant='light' color='gray'>
						{t('agents.summary.agents', { count: filtered.length })}
					</Badge>
				}
			>
				<Stack gap='md'>
					<Group gap='sm' wrap='wrap'>
						<TextInput
							size='sm'
							leftSection={<IconSearch size={16} />}
							placeholder={t('agents.filters.search')}
							value={filters.search}
							onChange={(e) => {
								const search = e.currentTarget.value;
								setFilters((f) => ({ ...f, search }));
							}}
							w={240}
						/>
						<Select
							size='sm'
							placeholder={t('agents.filters.team')}
							data={teams}
							value={filters.team}
							onChange={(team) => setFilters((f) => ({ ...f, team }))}
							clearable
							w={180}
						/>
						<Select
							size='sm'
							placeholder={t('agents.filters.tier')}
							data={tierOptions}
							value={filters.tier}
							onChange={(tier) =>
								setFilters((f) => ({ ...f, tier: tier as TierFilter | null }))
							}
							clearable
							w={190}
						/>
						<Select
							size='sm'
							placeholder={t('agents.filters.area')}
							data={weakestOptions}
							value={filters.weakest}
							onChange={(weakest) =>
								setFilters((f) => ({
									...f,
									weakest: weakest as ScorecardDimension | null,
								}))
							}
							clearable
							w={200}
						/>
						<Switch
							label={t('agents.filters.pendingSession')}
							checked={filters.pendingOnly}
							onChange={(e) => {
								const pendingOnly = e.currentTarget.checked;
								setFilters((f) => ({ ...f, pendingOnly }));
							}}
						/>
						{!isDefault && (
							<Button
								variant='subtle'
								size='xs'
								onClick={() => setFilters(DEFAULT_FILTERS)}
							>
								{t('agents.filters.clear')}
							</Button>
						)}
					</Group>

					<AgentsTierTable rows={filtered} onOpen={onOpen} />
				</Stack>
			</SectionCard>
		</Stack>
	);
}
