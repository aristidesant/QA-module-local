import React from 'react';
import { useTranslation } from 'react-i18next';
import { Group, MultiSelect, NumberInput, Stack, Text } from '@mantine/core';
import SectionCard from '~/components/SectionCard';
import type { CallEmotion } from '~/modules/qa/analytics/types';
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
import type { SentimentCutPoints, SentimentThresholds } from '../../types';

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
					<MultiSelect
						label={t('sentiment.negativeEmotions')}
						description={t('sentiment.negativeEmotionsHint')}
						data={ALL_CALL_EMOTIONS}
						value={draft.negativeEmotions}
						onChange={(value) =>
							setDraft({ ...draft, negativeEmotions: value as CallEmotion[] })
						}
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
