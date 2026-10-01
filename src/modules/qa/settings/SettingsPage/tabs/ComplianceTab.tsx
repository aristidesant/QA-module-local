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
import type { ComplianceThresholds } from '../../types';

export const ComplianceTab: React.FC = () => {
	const { t } = useTranslation('qa.settings');
	const stored = useSettingsStore(selectThresholds).compliance;
	const saveThresholds = useSettingsStore((s) => s.saveThresholds);
	const { draft, setDraft, dirty, discard, fillWith } =
		useSettingsDraft<ComplianceThresholds>(stored);

	const invalid =
		validateBands(draft.bands) !== null ||
		Object.values(draft.overrides).some((b) => b && validateBands(b));

	return (
		<Stack gap='lg'>
			<ScoreBandsEditor
				title={t('compliance.bandsTitle')}
				description={t('compliance.bandsDescription')}
				value={draft.bands}
				onChange={(bands) => setDraft({ ...draft, bands })}
			/>
			<MetricOverridesTable
				aspect='compliance'
				inherited={draft.bands}
				overrides={draft.overrides}
				onChange={(overrides) => setDraft({ ...draft, overrides })}
			/>
			<SectionCard
				title={t('compliance.targetTitle')}
				description={t('compliance.targetDescription')}
			>
				<NumberInput
					label={t('compliance.areaTargetPerCall')}
					value={draft.areaTargetPerCall}
					onChange={(v) =>
						setDraft({
							...draft,
							areaTargetPerCall:
								typeof v === 'number' ? v : draft.areaTargetPerCall,
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
					saveThresholds('compliance', draft);
					notifySuccess(t('saved'));
				}}
				onDiscard={discard}
				onReset={() => fillWith(DEFAULT_SETTINGS.thresholds.compliance)}
			/>
		</Stack>
	);
};

export default ComplianceTab;
