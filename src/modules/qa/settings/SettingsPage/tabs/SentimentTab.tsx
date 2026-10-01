import React from 'react';
import { useTranslation } from 'react-i18next';
import {
	Box,
	Group,
	NumberInput,
	Paper,
	SimpleGrid,
	Stack,
	TagsInput,
	Text,
} from '@mantine/core';
import SectionCard from '~/components/SectionCard';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import { useSettingsStore, selectThresholds } from '~/stores/qa/settingsStore';
import { ALL_CALL_EMOTIONS, DEFAULT_SETTINGS } from '../../constants';
import { validateCutPoints } from '../../helpers';
import { useSettingsDraft } from '../../useSettingsDraft';
import {
	BandPreview,
	SENTIMENT_SEGMENT_COLORS,
	type BandPreviewSegment,
} from '../../components/BandPreview';
import { SettingsActions } from '../../components/SettingsActions';
import type {
	SentimentBandKey,
	SentimentCutPoints,
	SentimentThresholds,
} from '../../types';

const CUT_POINT_FIELDS: (keyof SentimentCutPoints)[] = [
	'veryNegative',
	'negative',
	'neutral',
	'positive',
];

const BAND_KEYS = [
	'veryNegative',
	'negative',
	'neutral',
	'positive',
	'veryPositive',
] as const;

/** Emotion names match regardless of case. */
const sameEmotion = (a: string, b: string) =>
	a.toLowerCase() === b.toLowerCase();

/** Trims typed names, reuses the casing of an emotion that already exists and drops duplicates. */
const normalizeEmotions = (typed: string[], known: string[]) => {
	const result: string[] = [];
	for (const raw of typed) {
		const name = raw.trim();
		if (!name) continue;
		const canonical =
			known.find((emotion) => sameEmotion(emotion, name)) ??
			name.charAt(0).toUpperCase() + name.slice(1);
		if (!result.some((emotion) => sameEmotion(emotion, canonical)))
			result.push(canonical);
	}
	return result;
};

const SCALE_MIN = 1;
const SCALE_MAX = 5;

export const SentimentTab: React.FC = () => {
	const { t } = useTranslation('qa.settings');
	const stored = useSettingsStore(selectThresholds).sentiment;
	const saveThresholds = useSettingsStore((s) => s.saveThresholds);
	const { draft, setDraft, dirty, discard, fillWith } =
		useSettingsDraft<SentimentThresholds>(stored);

	const cutPoints = draft.cutPoints;
	const errorKey = validateCutPoints(cutPoints);
	const bounds = [
		SCALE_MIN,
		cutPoints.veryNegative,
		cutPoints.negative,
		cutPoints.neutral,
		cutPoints.positive,
		SCALE_MAX,
	];
	const segments: BandPreviewSegment[] = BAND_KEYS.map((key, index) => ({
		key,
		label: t(`sentiment.bands.${key}`),
		size: bounds[index + 1] - bounds[index],
		...SENTIMENT_SEGMENT_COLORS[index],
	}));

	const assignedEmotions = Object.values(draft.emotionsBySentiment).flat();
	// Suggestions: the emotions calls carry plus any the QA Manager has added.
	const knownEmotions = [
		...ALL_CALL_EMOTIONS,
		...assignedEmotions.filter(
			(emotion) =>
				!ALL_CALL_EMOTIONS.some((known) => sameEmotion(known, emotion))
		),
	];
	const unassigned = knownEmotions.filter(
		(emotion) => !assignedEmotions.includes(emotion)
	);

	/** An emotion belongs to one sentiment type: adding it here takes it out of the others. */
	const setEmotions = (key: SentimentBandKey, typed: string[]) => {
		const value = normalizeEmotions(typed, knownEmotions);
		const added = value.filter(
			(emotion) => !draft.emotionsBySentiment[key].includes(emotion)
		);
		const next = Object.fromEntries(
			BAND_KEYS.map((band) => [
				band,
				band === key
					? value
					: draft.emotionsBySentiment[band].filter((e) => !added.includes(e)),
			])
		) as SentimentThresholds['emotionsBySentiment'];
		setDraft({ ...draft, emotionsBySentiment: next });
	};

	return (
		<Stack gap='lg'>
			<SectionCard
				title={t('sentiment.scaleTitle')}
				description={t('sentiment.scaleDescription')}
			>
				<Stack gap='md'>
					<Group align='flex-start' gap='md'>
						{CUT_POINT_FIELDS.map((field, index) => (
							<NumberInput
								key={field}
								label={t(`sentiment.cutPoints.${field}`)}
								value={cutPoints[field]}
								onChange={(v) =>
									setDraft({
										...draft,
										cutPoints: {
											...cutPoints,
											[field]: typeof v === 'number' ? v : cutPoints[field],
										},
									})
								}
								min={SCALE_MIN}
								max={SCALE_MAX}
								step={0.1}
								decimalScale={1}
								w={170}
								error={index === 0 && errorKey ? t(errorKey) : undefined}
							/>
						))}
					</Group>
					{!errorKey && <BandPreview segments={segments} />}
					<Text size='xs' c='dimmed'>
						{t('sentiment.scaleHint', { value: cutPoints.positive })}
					</Text>
				</Stack>
			</SectionCard>
			<SectionCard
				title={t('sentiment.emotionsTitle')}
				description={t('sentiment.emotionsDescription')}
			>
				<Stack gap='md'>
					<SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing='md'>
						{BAND_KEYS.map((key, index) => (
							<Paper key={key} withBorder p='sm' radius='md'>
								<Stack gap='xs'>
									<Group gap='xs' wrap='nowrap'>
										<Box
											w={10}
											h={10}
											bdrs='xl'
											bg={SENTIMENT_SEGMENT_COLORS[index].bg}
										/>
										<Text size='sm' fw={600}>
											{t(`sentiment.bands.${key}`)}
										</Text>
									</Group>
									<TagsInput
										aria-label={t('sentiment.emotionsFor', {
											band: t(`sentiment.bands.${key}`),
										})}
										placeholder={t('sentiment.placeholderAdd')}
										data={knownEmotions}
										value={draft.emotionsBySentiment[key]}
										onChange={(value) => setEmotions(key, value)}
										acceptValueOnBlur
										clearable
									/>
								</Stack>
							</Paper>
						))}
					</SimpleGrid>
					<Text size='xs' c='dimmed'>
						{t('sentiment.emotionsHint')}
					</Text>
					{unassigned.length > 0 && (
						<Text size='xs' c='dimmed'>
							{t('sentiment.unassigned', {
								emotions: unassigned
									.map((e) => t(`sentiment.emotions.${e}`))
									.join(', '),
							})}
						</Text>
					)}
				</Stack>
			</SectionCard>
			<SectionCard
				title={t('sentiment.incidentsTitle')}
				description={t('sentiment.incidentsDescription')}
			>
				<Stack gap='md'>
					<NumberInput
						label={t('sentiment.lowSentimentIncident')}
						value={draft.lowSentimentIncident}
						onChange={(v) =>
							setDraft({
								...draft,
								lowSentimentIncident:
									typeof v === 'number' ? v : draft.lowSentimentIncident,
							})
						}
						min={SCALE_MIN}
						max={SCALE_MAX}
						step={0.1}
						decimalScale={1}
						w={260}
					/>
				</Stack>
			</SectionCard>
			<SettingsActions
				dirty={dirty}
				invalid={errorKey !== null}
				onSave={() => {
					saveThresholds('sentiment', draft);
					notifySuccess(t('saved'));
				}}
				onDiscard={discard}
				onReset={() => fillWith(DEFAULT_SETTINGS.thresholds.sentiment)}
			/>
		</Stack>
	);
};

export default SentimentTab;
