import React from 'react';
import { useTranslation } from 'react-i18next';
import { NumberInput, Stack } from '@mantine/core';
import SectionCard from '~/components/SectionCard';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import { useSettingsStore, selectThresholds } from '~/stores/qa/settingsStore';
import { DEFAULT_SETTINGS } from '../../constants';
import { validateBands } from '../../helpers';
import { useSettingsDraft } from '../../useSettingsDraft';
import { CategoryBandsTable } from '../../components/CategoryBandsTable';
import { ScoreBandsEditor } from '../../components/ScoreBandsEditor';
import { SettingsActions } from '../../components/SettingsActions';
import type { QaThresholds } from '../../types';

export const QualityAssuranceTab: React.FC = () => {
	const { t } = useTranslation('qa.settings');
	const stored = useSettingsStore(selectThresholds).qa;
	const saveThresholds = useSettingsStore((s) => s.saveThresholds);
	const { draft, setDraft, dirty, discard, fillWith } =
		useSettingsDraft<QaThresholds>(stored);

	const invalid =
		validateBands(draft.scoreBands) !== null ||
		Object.values(draft.categoryBands).some((b) => validateBands(b) !== null);

	return (
		<Stack gap='lg'>
			<ScoreBandsEditor
				title={t('qa.scoreBandsTitle')}
				description={t('qa.scoreBandsDescription')}
				value={draft.scoreBands}
				onChange={(scoreBands) => setDraft({ ...draft, scoreBands })}
			/>
			<SectionCard
				title={t('qa.incidentsTitle')}
				description={t('qa.incidentsDescription')}
			>
				<NumberInput
					label={t('qa.lowScoreIncident')}
					value={draft.lowScoreIncident}
					onChange={(v) =>
						setDraft({
							...draft,
							lowScoreIncident:
								typeof v === 'number' ? v : draft.lowScoreIncident,
						})
					}
					min={0}
					max={100}
					w={260}
				/>
			</SectionCard>
			<CategoryBandsTable
				title={t('copc.title')}
				description={t('copc.description')}
				value={draft.categoryBands}
				onChange={(categoryBands) => setDraft({ ...draft, categoryBands })}
			/>
			<SettingsActions
				dirty={dirty}
				invalid={invalid}
				onSave={() => {
					saveThresholds('qa', draft);
					notifySuccess(t('saved'));
				}}
				onDiscard={discard}
				onReset={() => fillWith(DEFAULT_SETTINGS.thresholds.qa)}
			/>
		</Stack>
	);
};

export default QualityAssuranceTab;
