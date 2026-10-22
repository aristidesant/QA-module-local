import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Badge,
	Group,
	NumberInput,
	SegmentedControl,
	SimpleGrid,
	Stack,
	Table,
	Text,
} from '@mantine/core';
import SectionCard from '~/components/SectionCard';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import { computeBurnoutScore } from '~/modules/qa/burnout/compute';
import type {
	BurnoutBaselineMethod,
	BurnoutThresholds,
	BurnoutWindowDays,
} from '~/modules/qa/burnout/types';
import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
import { useSettingsStore, selectThresholds } from '~/stores/qa/settingsStore';
import { DEFAULT_SETTINGS } from '../../constants';
import { validateBurnout } from '../../helpers';
import { useSettingsDraft } from '../../useSettingsDraft';
import { SettingsActions } from '../../components/SettingsActions';
import { BurnoutSignalsTable } from '../../components/BurnoutSignalsTable';
import {
	BandPreview,
	SCORE_SEGMENT_COLORS,
	type BandPreviewSegment,
} from '../../components/BandPreview';

const LEVEL_COLOR = { low: 'gray', medium: 'yellow', high: 'red' } as const;
const PREVIEW_ROWS = 5;

const toNumber = (value: string | number, fallback: number) =>
	typeof value === 'number' ? value : Number(value) || fallback;

/** How burnout is detected: the voice signals and their limits, the baseline, the score levels and a preview of the team. */
export const BurnoutTab: React.FC = () => {
	const { t } = useTranslation(['qa.settings', 'qa.burnout']);
	const stored = useSettingsStore(selectThresholds).burnout;
	const saveThresholds = useSettingsStore((s) => s.saveThresholds);
	const { draft, setDraft, dirty, discard, fillWith } =
		useSettingsDraft<BurnoutThresholds>(stored);
	const errorKey = validateBurnout(draft);
	const { medium, high } = draft.levelCuts;

	const patch = (value: Partial<BurnoutThresholds>) =>
		setDraft({ ...draft, ...value });

	const segments: BandPreviewSegment[] = [
		{
			key: 'low',
			label: t('burnout.bands.low', { value: medium }),
			size: medium,
			...SCORE_SEGMENT_COLORS.good,
		},
		{
			key: 'medium',
			label: t('burnout.bands.medium', { from: medium, to: high - 1 }),
			size: high - medium,
			...SCORE_SEGMENT_COLORS.warning,
		},
		{
			key: 'high',
			label: t('burnout.bands.high', { value: high }),
			size: 100 - high,
			...SCORE_SEGMENT_COLORS.critical,
		},
	];

	// The whole team scored with the draft, so a change is judged before it is saved.
	const preview = useMemo(() => {
		const rows = TEAM_AGENTS.map((agent) => ({
			agent,
			result: computeBurnoutScore(agent.id, draft),
		}));
		return {
			counts: {
				low: rows.filter((r) => r.result.level === 'low').length,
				medium: rows.filter((r) => r.result.level === 'medium').length,
				high: rows.filter((r) => r.result.level === 'high').length,
			},
			top: rows
				.filter((r) => r.result.level !== 'low')
				.sort((a, b) => b.result.score - a.result.score)
				.slice(0, PREVIEW_ROWS),
		};
	}, [draft]);

	return (
		<Stack gap='lg'>
			<SectionCard
				title={t('burnout.signalsTitle')}
				description={t('burnout.signalsDescription')}
			>
				<BurnoutSignalsTable
					value={draft.signals}
					onChange={(signals) => patch({ signals })}
				/>
			</SectionCard>

			<SectionCard
				title={t('burnout.baselineTitle')}
				description={t('burnout.baselineDescription')}
			>
				<Group align='flex-end' gap='lg' wrap='wrap'>
					<Stack gap={4}>
						<Text size='sm' fw={500}>
							{t('burnout.baselineMethod')}
						</Text>
						<SegmentedControl
							value={draft.baseline.method}
							onChange={(method) =>
								patch({
									baseline: {
										...draft.baseline,
										method: method as BurnoutBaselineMethod,
									},
								})
							}
							data={[
								{
									value: 'FIRST_WEEKS',
									label: t('burnout.methods.FIRST_WEEKS'),
								},
								{ value: 'ROLLING', label: t('burnout.methods.ROLLING') },
							]}
						/>
					</Stack>
					<NumberInput
						label={t('burnout.baselineMinCalls')}
						value={draft.baseline.minCalls}
						onChange={(v) =>
							patch({
								baseline: {
									...draft.baseline,
									minCalls: toNumber(v, draft.baseline.minCalls),
								},
							})
						}
						min={10}
						max={200}
						w={200}
					/>
					<Stack gap={4}>
						<Text size='sm' fw={500}>
							{t('burnout.window')}
						</Text>
						<SegmentedControl
							value={String(draft.windowDays)}
							onChange={(v) =>
								patch({ windowDays: Number(v) as BurnoutWindowDays })
							}
							data={[7, 14, 30].map((d) => ({
								value: String(d),
								label: t('burnout.windowDays', { count: d }),
							}))}
						/>
					</Stack>
					<NumberInput
						label={t('burnout.minCallsInWindow')}
						value={draft.minCallsInWindow}
						onChange={(v) =>
							patch({
								minCallsInWindow: toNumber(v, draft.minCallsInWindow),
							})
						}
						min={1}
						max={100}
						w={200}
					/>
				</Group>
			</SectionCard>

			<SectionCard
				title={t('burnout.scoreTitle')}
				description={t('burnout.scoreDescription')}
			>
				<Stack gap='md'>
					<Group align='flex-start' gap='md' wrap='wrap'>
						<NumberInput
							label={t('burnout.mediumFrom')}
							value={medium}
							onChange={(v) =>
								patch({
									levelCuts: {
										...draft.levelCuts,
										medium: toNumber(v, medium),
									},
								})
							}
							min={1}
							max={99}
							w={180}
							error={errorKey ? t(errorKey) : undefined}
						/>
						<NumberInput
							label={t('burnout.highFrom')}
							value={high}
							onChange={(v) =>
								patch({
									levelCuts: { ...draft.levelCuts, high: toNumber(v, high) },
								})
							}
							min={2}
							max={100}
							w={180}
						/>
						<NumberInput
							label={t('burnout.minActive')}
							value={draft.minActiveSignals}
							onChange={(v) =>
								patch({
									minActiveSignals: toNumber(v, draft.minActiveSignals),
								})
							}
							min={1}
							max={10}
							w={180}
						/>
						<NumberInput
							label={t('burnout.persistence')}
							value={draft.persistenceDays}
							onChange={(v) =>
								patch({ persistenceDays: toNumber(v, draft.persistenceDays) })
							}
							min={1}
							max={30}
							w={180}
						/>
						<NumberInput
							label={t('burnout.bonus')}
							value={draft.convergenceBonus}
							onChange={(v) =>
								patch({
									convergenceBonus: toNumber(v, draft.convergenceBonus),
								})
							}
							min={0}
							max={30}
							w={180}
						/>
					</Group>
					{!errorKey && <BandPreview segments={segments} />}
					<Text size='xs' c='dimmed'>
						{t('burnout.scoreHint', { count: draft.minActiveSignals })}
					</Text>
				</Stack>
			</SectionCard>

			<SectionCard
				title={t('burnout.preview.title')}
				description={t('burnout.preview.description')}
			>
				<Stack gap='md'>
					<SimpleGrid cols={{ base: 1, sm: 3 }} spacing='sm'>
						{(['low', 'medium', 'high'] as const).map((level) => (
							<Stack key={level} gap={0}>
								<Text size='xs' c='dimmed' tt='uppercase' fw={600}>
									{t(`levels.${level}`, { ns: 'qa.burnout' })}
								</Text>
								<Text fw={700} size='xl'>
									{preview.counts[level]}
								</Text>
								<Text size='xs' c='dimmed'>
									{t('burnout.preview.agents', {
										count: preview.counts[level],
									})}
								</Text>
							</Stack>
						))}
					</SimpleGrid>
					{preview.top.length === 0 ? (
						<Text size='sm' c='dimmed'>
							{t('burnout.preview.none')}
						</Text>
					) : (
						<Table verticalSpacing='xs' withRowBorders>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>{t('burnout.preview.agent')}</Table.Th>
									<Table.Th w={110}>{t('burnout.preview.level')}</Table.Th>
									<Table.Th w={80}>{t('burnout.preview.score')}</Table.Th>
									<Table.Th>{t('burnout.preview.signal')}</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{preview.top.map(({ agent, result }) => (
									<Table.Tr key={agent.id}>
										<Table.Td>
											<Text size='sm'>{agent.name}</Text>
										</Table.Td>
										<Table.Td>
											<Badge
												size='xs'
												variant='light'
												color={LEVEL_COLOR[result.level]}
											>
												{t(`levels.${result.level}`, { ns: 'qa.burnout' })}
											</Badge>
										</Table.Td>
										<Table.Td>
											<Text size='sm' fw={600}>
												{result.score}
											</Text>
										</Table.Td>
										<Table.Td>
											<Text size='sm' c='dimmed'>
												{result.primary
													? `${t(`signals.${result.primary.key}.label`, {
															ns: 'qa.burnout',
														})} · ${result.primary.deviationPct ?? 0}%`
													: '—'}
											</Text>
										</Table.Td>
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>
					)}
				</Stack>
			</SectionCard>

			<SettingsActions
				dirty={dirty}
				invalid={errorKey !== null}
				onSave={() => {
					saveThresholds('burnout', draft);
					notifySuccess(t('saved'));
				}}
				onDiscard={discard}
				onReset={() => fillWith(DEFAULT_SETTINGS.thresholds.burnout)}
			/>
		</Stack>
	);
};

export default BurnoutTab;
