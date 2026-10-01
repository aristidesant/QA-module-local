import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActionIcon,
	Badge,
	Button,
	Group,
	NumberInput,
	Stack,
	Switch,
	Text,
	Tooltip,
} from '@mantine/core';
import { IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';
import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import { assessBurnout } from '~/modules/qa/analytics/helpers';
import { BurnoutRiskLevel } from '~/modules/qa/dashboard/types/burnoutRisk';
import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import { useSettingsStore, selectBurnout } from '~/stores/qa/settingsStore';
import { DEFAULT_SETTINGS } from '../../constants';
import {
	deltaRange,
	displayThreshold,
	patternMetricInfo,
	storedThreshold,
} from '../../burnoutPatterns';
import { burnoutLevelFor, validateLevelRule } from '../../helpers';
import { usePatternText } from '../../usePatternText';
import { useSettingsDraft } from '../../useSettingsDraft';
import { PatternDrawer } from '../../components/PatternDrawer';
import { SettingsActions } from '../../components/SettingsActions';
import type { BurnoutPattern, BurnoutSettings } from '../../types';

interface DrawerState {
	opened: boolean;
	/** Bumped on every open so the form starts fresh. */
	key: number;
	pattern: BurnoutPattern | null;
}

export const BurnoutTab: React.FC = () => {
	const { t } = useTranslation('qa.settings');
	const text = usePatternText();
	const stored = useSettingsStore(selectBurnout);
	const saveBurnout = useSettingsStore((s) => s.saveBurnout);
	const { draft, setDraft, dirty, discard, fillWith } =
		useSettingsDraft<BurnoutSettings>(stored);
	const [drawer, setDrawer] = useState<DrawerState>({
		opened: false,
		key: 0,
		pattern: null,
	});

	const enabledCount = draft.patterns.filter((p) => p.enabled).length;
	const levelErrorKey = validateLevelRule(draft.level, enabledCount);

	// Breached counts only depend on the patterns, so editing the level rule re-counts instantly.
	const breachedByAgent = useMemo(
		() =>
			TEAM_AGENTS.map(
				(agent) =>
					assessBurnout(agent.id, {
						patterns: draft.patterns,
						level: draft.level,
					}).breached
			),
		[draft.patterns]
	);
	const levels = breachedByAgent.map((count) =>
		burnoutLevelFor(count, draft.level)
	);
	const highCount = levels.filter((l) => l === BurnoutRiskLevel.HIGH).length;
	const mediumCount = levels.filter(
		(l) => l === BurnoutRiskLevel.MEDIUM
	).length;

	const setPattern = (id: string, patch: Partial<BurnoutPattern>) =>
		setDraft({
			...draft,
			patterns: draft.patterns.map((p) =>
				p.id === id ? { ...p, ...patch } : p
			),
		});

	const openDrawer = (pattern: BurnoutPattern | null) =>
		setDrawer((prev) => ({ opened: true, key: prev.key + 1, pattern }));

	const savePattern = (pattern: BurnoutPattern) => {
		const exists = draft.patterns.some((p) => p.id === pattern.id);
		setDraft({
			...draft,
			patterns: exists
				? draft.patterns.map((p) => (p.id === pattern.id ? pattern : p))
				: [...draft.patterns, pattern],
		});
		setDrawer((prev) => ({ ...prev, opened: false }));
	};

	const removePattern = (id: string) =>
		setDraft({
			...draft,
			patterns: draft.patterns.filter((p) => p.id !== id),
		});

	const columns: BaseTableColumnDef<BurnoutPattern>[] = [
		{
			id: 'pattern',
			header: t('burnout.columns.pattern'),
			cell: ({ row }) => (
				<Stack gap={0}>
					<Group gap='xs' wrap='nowrap'>
						<Text size='sm' fw={500}>
							{text.patternName(row.original)}
						</Text>
						{!row.original.builtIn && (
							<Badge size='xs' variant='light'>
								{t('burnout.custom')}
							</Badge>
						)}
					</Group>
					<Text size='xs' c='dimmed'>
						{text.modeSummary(row.original)}
					</Text>
				</Stack>
			),
		},
		{
			id: 'condition',
			header: t('burnout.columns.condition'),
			cell: ({ row }) => (
				<Text size='sm' c={row.original.enabled ? undefined : 'dimmed'}>
					{text.condition(row.original)}
				</Text>
			),
		},
		{
			id: 'threshold',
			header: t('burnout.columns.threshold'),
			cell: ({ row }) => {
				const pattern = row.original;
				const info = patternMetricInfo(pattern.metricId);
				const streak = pattern.mode === 'STREAK';
				return (
					<NumberInput
						size='xs'
						w={120}
						aria-label={t('burnout.columns.threshold')}
						value={displayThreshold(pattern)}
						onChange={(v) =>
							typeof v === 'number' &&
							setPattern(pattern.id, {
								threshold: storedThreshold(pattern.mode, pattern.direction, v),
							})
						}
						min={streak ? 1 : pattern.mode === 'DELTA' ? 0 : info.min}
						max={
							streak
								? 30
								: pattern.mode === 'DELTA'
									? deltaRange(info)
									: info.max
						}
						step={streak ? 1 : info.step}
						decimalScale={info.unit === 'SCORE_5' && !streak ? 1 : 0}
						rightSection={<Text size='xs'>{text.thresholdUnit(pattern)}</Text>}
						rightSectionWidth={44}
						disabled={!pattern.enabled}
					/>
				);
			},
		},
		{
			id: 'nearBand',
			header: t('burnout.columns.nearBand'),
			cell: ({ row }) => (
				<NumberInput
					size='xs'
					w={90}
					aria-label={t('burnout.columns.nearBand')}
					value={row.original.nearBand}
					onChange={(v) =>
						typeof v === 'number' &&
						setPattern(row.original.id, { nearBand: v })
					}
					min={0}
					step={
						patternMetricInfo(row.original.metricId).unit === 'SCORE_5' &&
						row.original.mode !== 'STREAK'
							? 0.05
							: 1
					}
					decimalScale={2}
					disabled={!row.original.enabled}
				/>
			),
		},
		{
			id: 'enabled',
			header: t('burnout.columns.enabled'),
			cell: ({ row }) => (
				<Switch
					aria-label={t('burnout.enable', {
						pattern: text.patternName(row.original),
					})}
					checked={row.original.enabled}
					onChange={(event) =>
						setPattern(row.original.id, {
							enabled: event.currentTarget.checked,
						})
					}
				/>
			),
		},
		{
			id: 'actions',
			header: '',
			cell: ({ row }) =>
				row.original.builtIn ? null : (
					<Group gap={4} wrap='nowrap'>
						<Tooltip label={t('burnout.edit')} withArrow>
							<ActionIcon
								variant='subtle'
								aria-label={t('burnout.edit')}
								onClick={() => openDrawer(row.original)}
							>
								<IconPencil size={16} />
							</ActionIcon>
						</Tooltip>
						<Tooltip label={t('burnout.delete')} withArrow>
							<ActionIcon
								variant='subtle'
								color='red'
								aria-label={t('burnout.delete')}
								onClick={() => removePattern(row.original.id)}
							>
								<IconTrash size={16} />
							</ActionIcon>
						</Tooltip>
					</Group>
				),
		},
	];

	return (
		<Stack gap='lg'>
			<SectionCard
				title={t('burnout.patternsTitle')}
				description={t('burnout.patternsDescription')}
				headerActions={
					<Button
						size='xs'
						leftSection={<IconPlus size={14} />}
						onClick={() => openDrawer(null)}
					>
						{t('burnout.addPattern')}
					</Button>
				}
			>
				<BaseTable<BurnoutPattern>
					columns={columns}
					data={draft.patterns}
					getRowId={(pattern) => pattern.id}
					density='compact'
				/>
			</SectionCard>

			<SectionCard
				title={t('burnout.levelTitle')}
				description={t('burnout.levelDescription')}
			>
				<Stack gap='md'>
					<Group align='flex-start' gap='md'>
						<NumberInput
							label={t('burnout.mediumAt')}
							value={draft.level.mediumAt}
							onChange={(v) =>
								typeof v === 'number' &&
								setDraft({ ...draft, level: { ...draft.level, mediumAt: v } })
							}
							min={1}
							max={enabledCount || 1}
							w={260}
						/>
						<NumberInput
							label={t('burnout.highAt')}
							value={draft.level.highAt}
							onChange={(v) =>
								typeof v === 'number' &&
								setDraft({ ...draft, level: { ...draft.level, highAt: v } })
							}
							min={1}
							max={enabledCount || 1}
							w={260}
							error={
								levelErrorKey
									? t(levelErrorKey, { count: enabledCount })
									: undefined
							}
						/>
					</Group>
					<Group gap='xs'>
						<Text size='sm'>
							{t('burnout.previewLead', { total: TEAM_AGENTS.length })}
						</Text>
						<Badge color='red' variant='light'>
							{t('burnout.previewHigh', { count: highCount })}
						</Badge>
						<Badge color='orange' variant='light'>
							{t('burnout.previewMedium', { count: mediumCount })}
						</Badge>
					</Group>
				</Stack>
			</SectionCard>

			<SettingsActions
				dirty={dirty}
				invalid={levelErrorKey !== null || enabledCount === 0}
				onSave={() => {
					saveBurnout(draft);
					notifySuccess(t('saved'));
				}}
				onDiscard={discard}
				onReset={() => fillWith(DEFAULT_SETTINGS.burnout)}
			/>

			<PatternDrawer
				key={drawer.key}
				opened={drawer.opened}
				pattern={drawer.pattern}
				onClose={() => setDrawer((prev) => ({ ...prev, opened: false }))}
				onSave={savePattern}
			/>
		</Stack>
	);
};

export default BurnoutTab;
