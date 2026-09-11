import { ActionIcon, Button, Select, SegmentedControl, SimpleGrid, Stack, TextInput } from '@mantine/core';
import { IconPlus, IconSearch, IconX } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { BadgeDefinition, BadgeArea, BadgeStatus, BadgeTier } from '~/models/qa';
import { EVALUATION_AREAS } from '~/modules/qa/triggers/constants';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import { useTriggerRulesStore } from '~/stores/qa/triggerRulesStore';
import SectionCard from '~/components/SectionCard';
import { FilterContainer } from '~/components/FilterContainer';
import EmptyState from '~/components/EmptyState';
import BadgeCard from '~/modules/qa/triggers/components/BadgeCard';
import BadgeDetailDrawer from '~/modules/qa/triggers/components/BadgeDetailDrawer';
import BadgeEditorDrawer from '~/modules/qa/triggers/components/BadgeEditorDrawer';

interface BadgesTabProps {
	onOpenRule: (ruleId: string) => void;
	onCreateRuleForBadge: (badge: BadgeDefinition) => void;
}

interface BadgesFilters {
	search: string;
	area: BadgeArea | null;
	tier: BadgeTier | null;
	status: BadgeStatus | 'ALL';
}

export default function BadgesTab({ onOpenRule, onCreateRuleForBadge }: BadgesTabProps) {
	const { t } = useTranslation('qa.triggers');
	const badges = useTriggerRulesStore((s) => s.badges);
	const setBadgeStatus = useTriggerRulesStore((s) => s.setBadgeStatus);

	const [filters, setFilters] = useState<BadgesFilters>({
		search: '',
		area: null,
		tier: null,
		status: 'ACTIVE',
	});

	const [detailBadge, setDetailBadge] = useState<BadgeDefinition | null>(null);
	const [detailOpened, setDetailOpened] = useState(false);

	const [editorBadge, setEditorBadge] = useState<BadgeDefinition | null>(null);
	const [editorOpened, setEditorOpened] = useState(false);

	const filteredBadges = useMemo(() => {
		let result = badges;

		if (filters.search) {
			const q = filters.search.toLowerCase();
			result = result.filter((b) => b.name.toLowerCase().includes(q) || b.description.toLowerCase().includes(q));
		}

		if (filters.area) {
			result = result.filter((b) => b.area === filters.area);
		}

		if (filters.tier) {
			result = result.filter((b) => b.tier === filters.tier);
		}

		if (filters.status !== 'ALL') {
			result = result.filter((b) => b.status === filters.status);
		}

		return result.sort((a, b) => {
			if (a.area !== b.area) return a.area.localeCompare(b.area);
			const tierOrder = { BRONZE: 0, SILVER: 1, GOLD: 2 };
			if (tierOrder[a.tier] !== tierOrder[b.tier]) return tierOrder[a.tier] - tierOrder[b.tier];
			return a.name.localeCompare(b.name);
		});
	}, [badges, filters]);

	const hasActiveFilters = filters.search || filters.area || filters.tier || filters.status !== 'ACTIVE';

	const handleClearFilters = () => {
		setFilters({ search: '', area: null, tier: null, status: 'ACTIVE' });
	};

	const handleToggleStatus = (badge: BadgeDefinition) => {
		const newStatus: BadgeStatus = badge.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';
		setBadgeStatus(badge.id, newStatus);
		notifySuccess(newStatus === 'ARCHIVED' ? t('badges.notifications.archived') : t('badges.notifications.restored'));
	};

	const handleCreateRule = (badge: BadgeDefinition) => {
		onCreateRuleForBadge(badge);
	};

	return (
		<>
			<SectionCard
				title={t('badges.title')}
				description={t('badges.description')}
				headerActions={
					<Button
						size="sm"
						leftSection={<IconPlus size={16} />}
						onClick={() => {
							setEditorBadge(null);
							setEditorOpened(true);
						}}
					>
						{t('badges.new')}
					</Button>
				}
			>
				<Stack gap="md">
					<FilterContainer>
						<TextInput
							size="sm"
							placeholder={t('badges.filters.search')}
							leftSection={<IconSearch size={14} />}
							rightSection={
								filters.search ? (
									<ActionIcon
										size="xs"
										variant="subtle"
										onClick={() => setFilters((f) => ({ ...f, search: '' }))}
									>
										<IconX size={12} />
									</ActionIcon>
								) : null
							}
							value={filters.search}
							onChange={(e) => setFilters((f) => ({ ...f, search: e.currentTarget.value }))}
						/>

						<Select
							size="sm"
							placeholder={t('badges.filters.area')}
							clearable
							searchable
							data={[
								...EVALUATION_AREAS.map((area) => ({
									value: area,
									label: t(`areas.${area}`),
								})),
								{ value: 'GENERAL', label: t('areas.GENERAL') },
							]}
							value={filters.area}
							onChange={(value) => setFilters((f) => ({ ...f, area: (value as any) ?? null }))}
						/>

						<Select
							size="sm"
							placeholder={t('badges.filters.tier')}
							clearable
							data={[
								{ value: 'BRONZE', label: t('tiers.BRONZE') },
								{ value: 'SILVER', label: t('tiers.SILVER') },
								{ value: 'GOLD', label: t('tiers.GOLD') },
							]}
							value={filters.tier}
							onChange={(value) => setFilters((f) => ({ ...f, tier: (value as any) ?? null }))}
						/>

						<SegmentedControl
							size="sm"
							value={filters.status}
							onChange={(value) => setFilters((f) => ({ ...f, status: value as any }))}
							data={[
								{ value: 'ALL', label: t('badges.filters.all') },
								{ value: 'ACTIVE', label: t('badges.filters.active') },
								{ value: 'ARCHIVED', label: t('badges.filters.archived') },
							]}
						/>

						{hasActiveFilters && (
							<Button variant="light" size="sm" leftSection={<IconX size={14} />} onClick={handleClearFilters}>
								{t('badges.filters.clear')}
							</Button>
						)}
					</FilterContainer>

					{badges.length === 0 ? (
						<EmptyState
							icon={null}
							message={t('badges.empty.title')}
							description={t('badges.empty.description')}
						/>
					) : filteredBadges.length === 0 ? (
						<EmptyState icon={null} message={t('badges.empty.noMatches')} />
					) : (
						<SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
							{filteredBadges.map((badge) => (
								<BadgeCard
									key={badge.id}
									badge={badge}
									onOpen={(b) => {
										setDetailBadge(b);
										setDetailOpened(true);
									}}
									onEdit={(b) => {
										setEditorBadge(b);
										setEditorOpened(true);
									}}
									onToggleStatus={handleToggleStatus}
									onCreateRule={handleCreateRule}
								/>
							))}
						</SimpleGrid>
					)}
				</Stack>
			</SectionCard>

			<BadgeDetailDrawer
				badge={detailBadge}
				opened={detailOpened}
				onClose={() => setDetailOpened(false)}
				onEdit={(b) => {
					setDetailOpened(false);
					setEditorBadge(b);
					setEditorOpened(true);
				}}
				onOpenRule={onOpenRule}
			/>

			<BadgeEditorDrawer
				opened={editorOpened}
				badge={editorBadge}
				onClose={() => {
					setEditorOpened(false);
					setEditorBadge(null);
				}}
				onSaved={() => {
					setEditorOpened(false);
					setEditorBadge(null);
				}}
			/>
		</>
	);
}
