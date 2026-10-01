import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Group, NumberInput, Stack, Switch, Text } from '@mantine/core';
import SectionCard from '~/components/SectionCard';
import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import { assessBurnout } from '~/modules/qa/analytics/helpers';
import { BurnoutRiskLevel } from '~/modules/qa/dashboard/types/burnoutRisk';
import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import { useSettingsStore, selectBurnout } from '~/stores/qa/settingsStore';
import { DEFAULT_SETTINGS } from '../../constants';
import { burnoutLevelFor, validateLevelRule } from '../../helpers';
import { useSettingsDraft } from '../../useSettingsDraft';
import { SettingsActions } from '../../components/SettingsActions';
import type { BurnoutPattern, BurnoutSettings } from '../../types';

/** Label key under `qa.teamAnalytics` `burnout.drivers.*` for each pattern. */
const PATTERN_LABEL_KEY: Record<BurnoutPattern['id'], string> = {
	AGENT_SENTIMENT_TREND: 'agentSentimentTrend',
	NEGATIVE_EMOTION_7D: 'negativeEmotionShare',
	QA_TREND_14D: 'qaScoreTrend',
	AFTER_HOURS_30D: 'afterHoursShare',
	AHT_VS_TEAM_30D: 'ahtVsTeam',
	NEGATIVE_EMOTION_STREAK: 'negativeEmotionStreak',
};

const PATTERN_UNIT: Record<BurnoutPattern['id'], 'pts' | 'days' | '%'> = {
	AGENT_SENTIMENT_TREND: 'pts',
	NEGATIVE_EMOTION_7D: '%',
	QA_TREND_14D: '%',
	AFTER_HOURS_30D: '%',
	AHT_VS_TEAM_30D: '%',
	NEGATIVE_EMOTION_STREAK: 'days',
};

/** Drops are stored as negative numbers but edited as the size of the drop. */
const toDisplay = (pattern: BurnoutPattern) =>
	pattern.direction === 'BELOW'
		? Math.abs(pattern.threshold)
		: pattern.threshold;
const fromDisplay = (pattern: BurnoutPattern, value: number) =>
	pattern.direction === 'BELOW' ? -Math.abs(value) : value;

export const BurnoutTab: React.FC = () => {
	const { t } = useTranslation('qa.settings');
	const { t: tAnalytics } = useTranslation('qa.teamAnalytics');
	const stored = useSettingsStore(selectBurnout);
	const saveBurnout = useSettingsStore((s) => s.saveBurnout);
	const { draft, setDraft, dirty, discard, fillWith } =
		useSettingsDraft<BurnoutSettings>(stored);

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

	const setPattern = (
		id: BurnoutPattern['id'],
		patch: Partial<BurnoutPattern>
	) =>
		setDraft({
			...draft,
			patterns: draft.patterns.map((p) =>
				p.id === id ? { ...p, ...patch } : p
			),
		});

	const columns: BaseTableColumnDef<BurnoutPattern>[] = [
		{
			id: 'pattern',
			header: t('burnout.columns.pattern'),
			cell: ({ row }) => (
				<Stack gap={0}>
					<Text size='sm' fw={500}>
						{tAnalytics(
							`burnout.drivers.${PATTERN_LABEL_KEY[row.original.id]}`
						)}
					</Text>
					<Text size='xs' c='dimmed'>
						{t(`burnout.windows.${row.original.id}`)}
					</Text>
				</Stack>
			),
		},
		{
			id: 'condition',
			header: t('burnout.columns.condition'),
			cell: ({ row }) => (
				<Text size='sm' c={row.original.enabled ? undefined : 'dimmed'}>
					{tAnalytics(row.original.conditionLabelKey, {
						threshold: toDisplay(row.original),
					})}
				</Text>
			),
		},
		{
			id: 'threshold',
			header: t('burnout.columns.threshold'),
			cell: ({ row }) => (
				<NumberInput
					size='xs'
					w={110}
					aria-label={t('burnout.columns.threshold')}
					value={toDisplay(row.original)}
					onChange={(v) =>
						typeof v === 'number' &&
						setPattern(row.original.id, {
							threshold: fromDisplay(row.original, v),
						})
					}
					min={0}
					step={PATTERN_UNIT[row.original.id] === 'pts' ? 0.1 : 1}
					decimalScale={PATTERN_UNIT[row.original.id] === 'pts' ? 1 : 0}
					rightSection={
						<Text size='xs'>
							{t(`burnout.units.${PATTERN_UNIT[row.original.id]}`)}
						</Text>
					}
					rightSectionWidth={44}
					disabled={!row.original.enabled}
				/>
			),
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
					step={PATTERN_UNIT[row.original.id] === 'pts' ? 0.05 : 1}
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
						pattern: tAnalytics(
							`burnout.drivers.${PATTERN_LABEL_KEY[row.original.id]}`
						),
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
	];

	return (
		<Stack gap='lg'>
			<SectionCard
				title={t('burnout.patternsTitle')}
				description={t('burnout.patternsDescription')}
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
		</Stack>
	);
};

export default BurnoutTab;
