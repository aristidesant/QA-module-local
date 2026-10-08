import React from 'react';
import { useTranslation } from 'react-i18next';
import { Group, NumberInput, Stack, Text } from '@mantine/core';
import SectionCard from '~/components/SectionCard';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import { useSettingsStore, selectThresholds } from '~/stores/qa/settingsStore';
import { DEFAULT_SETTINGS } from '../../constants';
import { validateTierCuts } from '../../helpers';
import { useSettingsDraft } from '../../useSettingsDraft';
import { SettingsActions } from '../../components/SettingsActions';
import {
	BandPreview,
	SCORE_SEGMENT_COLORS,
	type BandPreviewSegment,
} from '../../components/BandPreview';
import type { CoachingThresholds, CoachingTierCuts } from '../../types';

const toNumber = (value: string | number, fallback: number) =>
	typeof value === 'number' ? value : Number(value) || fallback;

/** Good sits between the warning and the on-target fills of the other tabs. */
const GOOD_SEGMENT = { bg: 'blue.7', c: 'white' } as const;

/** The three lower cut-offs of the coaching performance groups; Critical is everything below the last one. */
export const CoachingTab: React.FC = () => {
	const { t } = useTranslation('qa.settings');
	const stored = useSettingsStore(selectThresholds).coaching;
	const saveThresholds = useSettingsStore((s) => s.saveThresholds);
	const { draft, setDraft, dirty, discard, fillWith } =
		useSettingsDraft<CoachingThresholds>(stored);
	const cuts = draft.tierCuts;
	const errorKey = validateTierCuts(cuts);

	const setCut = (key: keyof CoachingTierCuts, value: string | number) =>
		setDraft({
			...draft,
			tierCuts: { ...cuts, [key]: toNumber(value, cuts[key]) },
		});

	const segments: BandPreviewSegment[] = [
		{
			key: 'critical',
			label: t('coaching.preview.critical', { value: cuts.needsImprovement }),
			size: cuts.needsImprovement,
			...SCORE_SEGMENT_COLORS.critical,
		},
		{
			key: 'needsImprovement',
			label: t('coaching.preview.range', {
				from: cuts.needsImprovement,
				to: cuts.good - 1,
			}),
			size: cuts.good - cuts.needsImprovement,
			...SCORE_SEGMENT_COLORS.warning,
		},
		{
			key: 'good',
			label: t('coaching.preview.range', {
				from: cuts.good,
				to: cuts.excellent - 1,
			}),
			size: cuts.excellent - cuts.good,
			...GOOD_SEGMENT,
		},
		{
			key: 'excellent',
			label: t('coaching.preview.excellent', { value: cuts.excellent }),
			size: 100 - cuts.excellent,
			...SCORE_SEGMENT_COLORS.good,
		},
	];

	return (
		<Stack gap='lg'>
			<SectionCard
				title={t('coaching.groupsTitle')}
				description={t('coaching.groupsDescription')}
			>
				<Stack gap='md'>
					<Group align='flex-start' gap='md'>
						<NumberInput
							label={t('coaching.excellent')}
							value={cuts.excellent}
							onChange={(v) => setCut('excellent', v)}
							min={0}
							max={100}
							w={180}
							error={errorKey ? t(errorKey) : undefined}
						/>
						<NumberInput
							label={t('coaching.good')}
							value={cuts.good}
							onChange={(v) => setCut('good', v)}
							min={0}
							max={100}
							w={180}
						/>
						<NumberInput
							label={t('coaching.needsImprovement')}
							value={cuts.needsImprovement}
							onChange={(v) => setCut('needsImprovement', v)}
							min={0}
							max={100}
							w={180}
						/>
					</Group>
					{!errorKey && <BandPreview segments={segments} />}
					<Text size='xs' c='dimmed'>
						{t('coaching.hint', { value: cuts.needsImprovement })}
					</Text>
				</Stack>
			</SectionCard>

			<SectionCard title={t('coaching.usedByTitle')}>
				<Stack gap={4}>
					<Text size='sm'>• {t('coaching.usedBy.agents')}</Text>
					<Text size='sm'>• {t('coaching.usedBy.batch')}</Text>
					<Text size='sm'>• {t('coaching.usedBy.tenure')}</Text>
				</Stack>
			</SectionCard>

			<SettingsActions
				dirty={dirty}
				invalid={errorKey !== null}
				onSave={() => {
					saveThresholds('coaching', draft);
					notifySuccess(t('saved'));
				}}
				onDiscard={discard}
				onReset={() => fillWith(DEFAULT_SETTINGS.thresholds.coaching)}
			/>
		</Stack>
	);
};

export default CoachingTab;
