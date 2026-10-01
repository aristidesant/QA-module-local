import React from 'react';
import { useTranslation } from 'react-i18next';
import { NumberInput, Stack } from '@mantine/core';
import SectionCard from '~/components/SectionCard';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import { useSettingsStore, selectThresholds } from '~/stores/qa/settingsStore';
import { DEFAULT_SETTINGS } from '../../constants';
import { validateBands } from '../../helpers';
import { useSettingsDraft } from '../../useSettingsDraft';
import { MetricOverridesTable } from '../../components/MetricOverridesTable';
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
		validateBands(draft.bands) !== null ||
		Object.values(draft.overrides).some((b) => b && validateBands(b));

	return (
		<Stack gap='lg'>
			<ScoreBandsEditor
				title={t('qa.bandsTitle')}
				description={t('qa.bandsDescription')}
				value={draft.bands}
				onChange={(bands) => setDraft({ ...draft, bands })}
			/>
			<MetricOverridesTable
				aspect='qa'
				inherited={draft.bands}
				overrides={draft.overrides}
				onChange={(overrides) => setDraft({ ...draft, overrides })}
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
