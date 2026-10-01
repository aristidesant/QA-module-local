import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Button,
	Group,
	NumberInput,
	SegmentedControl,
	Select,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { IconMoodSad2 } from '@tabler/icons-react';
import { AppDrawer } from '~/components/AppDrawer';
import type { BurnoutPatternMode } from '~/modules/qa/analytics/types';
import { countAgentsMeetingPattern } from '~/modules/qa/analytics/helpers';
import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
import {
	PATTERN_METRICS,
	PATTERN_METRIC_AREAS,
	PATTERN_WINDOWS,
	defaultDayLevel,
	defaultDirection,
	defaultThresholdFor,
	deltaRange,
	displayThreshold,
	newPattern,
	patternMetricInfo,
	storedThreshold,
	suggestNearBand,
	supportsStreak,
} from '../burnoutPatterns';
import { usePatternText } from '../usePatternText';
import type { BurnoutPattern } from '../types';

interface PatternDrawerProps {
	opened: boolean;
	onClose: () => void;
	/** The pattern being edited, or null to create one. */
	pattern: BurnoutPattern | null;
	onSave: (pattern: BurnoutPattern) => void;
}

const MODES: BurnoutPatternMode[] = ['VALUE', 'DELTA', 'STREAK'];
const STREAK_LOOKBACK_DAYS = 30;
/** Metric a pattern falls back to when switched to a streak while reading a count. */
const STREAK_FALLBACK_METRIC = 'QA_OVERALL_SCORE';

/** Form to create or edit a custom burnout pattern: metric, how it is read, threshold and near band. */
export const PatternDrawer: React.FC<PatternDrawerProps> = ({
	opened,
	onClose,
	pattern,
	onSave,
}) => {
	const { t } = useTranslation('qa.settings');
	const text = usePatternText();
	const [form, setForm] = useState<BurnoutPattern>(
		() => pattern ?? newPattern()
	);
	// Once the near band is edited by hand it stops following the threshold.
	const [nearTouched, setNearTouched] = useState(Boolean(pattern));

	const info = patternMetricInfo(form.metricId);
	const shown = displayThreshold(form);
	const isStreak = form.mode === 'STREAK';

	const update = (patch: Partial<BurnoutPattern>) => {
		const next = { ...form, ...patch };
		const nextInfo = patternMetricInfo(next.metricId);
		setForm({
			...next,
			nearBand: nearTouched
				? next.nearBand
				: suggestNearBand(displayThreshold(next), nextInfo, next.mode),
		});
	};

	const setMetric = (id: BurnoutPattern['metricId']) => {
		const nextInfo = patternMetricInfo(id);
		const direction = defaultDirection(nextInfo);
		update({
			metricId: id,
			direction,
			threshold: defaultThresholdFor(nextInfo, form.mode, direction),
			dayLevel: isStreak ? defaultDayLevel(nextInfo) : undefined,
		});
	};

	const setMode = (mode: BurnoutPatternMode) => {
		// Counts have no natural percentage, so a streak moves to a metric that does.
		const nextInfo =
			mode === 'STREAK' && !supportsStreak(info)
				? patternMetricInfo(STREAK_FALLBACK_METRIC)
				: info;
		const direction =
			nextInfo === info ? form.direction : defaultDirection(nextInfo);
		update({
			mode,
			metricId: nextInfo.id,
			direction,
			windowDays: mode === 'STREAK' ? STREAK_LOOKBACK_DAYS : 14,
			threshold: defaultThresholdFor(nextInfo, mode, direction),
			dayLevel: mode === 'STREAK' ? defaultDayLevel(nextInfo) : undefined,
		});
	};

	const setDirection = (direction: BurnoutPattern['direction']) =>
		update({
			direction,
			threshold: storedThreshold(form.mode, direction, shown),
		});

	const metricGroups = PATTERN_METRIC_AREAS.map((area) => ({
		group: t(`burnout.areas.${area}`),
		items: PATTERN_METRICS.filter(
			(m) => m.area === area && (!isStreak || supportsStreak(m))
		).map((m) => ({
			value: m.id,
			label: text.metricLabel(m.id),
		})),
	})).filter((group) => group.items.length > 0);

	const flagged = useMemo(
		() => countAgentsMeetingPattern(form),
		// The name never changes who is flagged.
		[
			form.metricId,
			form.mode,
			form.windowDays,
			form.direction,
			form.threshold,
			form.dayLevel,
		]
	);

	const nameError = form.name?.trim()
		? undefined
		: t('burnout.drawer.nameRequired');
	const invalid = Boolean(nameError) || form.nearBand < 0;

	return (
		<AppDrawer
			opened={opened}
			onClose={onClose}
			size='md'
			title={t(
				pattern ? 'burnout.drawer.editTitle' : 'burnout.drawer.addTitle'
			)}
			description={t('burnout.drawer.description')}
			icon={<IconMoodSad2 size={20} />}
		>
			<Stack gap='md'>
				<TextInput
					label={t('burnout.drawer.name')}
					placeholder={t('burnout.drawer.namePlaceholder')}
					value={form.name ?? ''}
					onChange={(event) =>
						setForm({ ...form, name: event.currentTarget.value })
					}
					error={form.name === '' ? undefined : nameError}
					data-autofocus
				/>
				<Select
					label={t('burnout.drawer.metric')}
					data={metricGroups}
					value={form.metricId}
					onChange={(value) =>
						value && setMetric(value as BurnoutPattern['metricId'])
					}
					searchable
					allowDeselect={false}
				/>

				<Stack gap={4}>
					<Text size='sm' fw={500}>
						{t('burnout.drawer.conditionType')}
					</Text>
					<SegmentedControl
						fullWidth
						value={form.mode}
						onChange={(value) => setMode(value as BurnoutPatternMode)}
						data={MODES.map((mode) => ({
							value: mode,
							label: t(`burnout.mode.${mode}`),
						}))}
					/>
					<Text size='xs' c='dimmed'>
						{t(`burnout.modeHint.${form.mode}`)}
					</Text>
				</Stack>

				<Group grow align='flex-start'>
					<Select
						label={t('burnout.drawer.direction')}
						data={(['ABOVE', 'BELOW'] as const).map((direction) => ({
							value: direction,
							label: t(`burnout.direction.${form.mode}.${direction}`),
						}))}
						value={form.direction}
						onChange={(value) =>
							value && setDirection(value as BurnoutPattern['direction'])
						}
						allowDeselect={false}
					/>
					{!isStreak && (
						<Select
							label={t('burnout.drawer.window')}
							data={PATTERN_WINDOWS.map((days) => ({
								value: String(days),
								label: t('burnout.drawer.windowOption', { count: days }),
							}))}
							value={String(form.windowDays)}
							onChange={(value) =>
								value && update({ windowDays: Number(value) })
							}
							allowDeselect={false}
						/>
					)}
				</Group>

				<Group grow align='flex-start'>
					<NumberInput
						label={t(`burnout.thresholdLabel.${form.mode}`)}
						value={shown}
						onChange={(v) =>
							typeof v === 'number' &&
							update({
								threshold: storedThreshold(form.mode, form.direction, v),
							})
						}
						min={isStreak ? 1 : form.mode === 'DELTA' ? 0 : info.min}
						max={
							isStreak
								? STREAK_LOOKBACK_DAYS
								: form.mode === 'DELTA'
									? deltaRange(info)
									: info.max
						}
						step={isStreak ? 1 : info.step}
						decimalScale={info.unit === 'SCORE_5' ? 1 : 0}
						rightSection={<Text size='xs'>{text.thresholdUnit(form)}</Text>}
						rightSectionWidth={44}
					/>
					{isStreak && (
						<NumberInput
							label={t('burnout.thresholdLabel.dayLevel')}
							value={form.dayLevel ?? 0}
							onChange={(v) => typeof v === 'number' && update({ dayLevel: v })}
							min={0}
							max={100}
							step={1}
							rightSection={<Text size='xs'>%</Text>}
						/>
					)}
					<NumberInput
						label={t('burnout.drawer.nearBand')}
						value={form.nearBand}
						onChange={(v) => {
							if (typeof v !== 'number') return;
							setNearTouched(true);
							setForm({ ...form, nearBand: v });
						}}
						min={0}
						step={info.unit === 'SCORE_5' && !isStreak ? 0.05 : 1}
						decimalScale={2}
					/>
				</Group>
				<Text size='xs' c='dimmed'>
					{t('burnout.drawer.nearBandHint')}
				</Text>

				<Stack gap={4}>
					<Text size='sm' fw={500}>
						{t('burnout.drawer.summary')}
					</Text>
					<Text size='sm'>{text.condition(form)}</Text>
					<Text size='sm' c='dimmed'>
						{t('burnout.drawer.preview', {
							count: flagged,
							total: TEAM_AGENTS.length,
						})}
					</Text>
				</Stack>

				<Group justify='flex-end' gap='sm'>
					<Button variant='default' onClick={onClose}>
						{t('actions.cancel')}
					</Button>
					<Button
						disabled={invalid}
						onClick={() => onSave({ ...form, name: form.name?.trim() })}
					>
						{t(pattern ? 'burnout.drawer.save' : 'burnout.drawer.add')}
					</Button>
				</Group>
			</Stack>
		</AppDrawer>
	);
};

export default PatternDrawer;
