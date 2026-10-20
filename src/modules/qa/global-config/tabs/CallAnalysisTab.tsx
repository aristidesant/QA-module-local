import React from 'react';
import { useTranslation } from 'react-i18next';
import {
	Checkbox,
	MultiSelect,
	NumberInput,
	Select,
	SimpleGrid,
	Stack,
	Switch,
} from '@mantine/core';
import { IconWaveSine } from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';
import { useSettingsDraft } from '~/modules/qa/settings/useSettingsDraft';
import { SettingsActions } from '~/modules/qa/settings/components/SettingsActions';
import {
	selectCallAnalysis,
	useGlobalConfigStore,
} from '~/stores/qa/globalConfigStore';
import { ActiveClientBanner } from '../components/ActiveClientBanner';
import {
	AUDIO_RETENTION_DAYS,
	CALL_ANALYSIS_KINDS,
	PII_FIELDS,
} from '../constants';
import { SEED_CALL_ANALYSIS } from '../seed';
import type { CallAnalysisKind, CallAnalysisLanguage } from '../types';

/** Defaults applied to every call imported for the active client before any analysis runs. */
export const CallAnalysisTab: React.FC = () => {
	const { t } = useTranslation('qa.globalConfig');
	const stored = useGlobalConfigStore(selectCallAnalysis);
	const save = useGlobalConfigStore((s) => s.saveCallAnalysis);
	const { draft, setDraft, dirty, discard, fillWith } =
		useSettingsDraft(stored);

	const languages: CallAnalysisLanguage[] = ['AUTO', 'es', 'en'];

	return (
		<Stack gap='lg'>
			<SectionCard
				icon={IconWaveSine}
				title={t('callAnalysis.title')}
				description={t('callAnalysis.description')}
				footer={
					<SettingsActions
						dirty={dirty}
						invalid={draft.analyses.length === 0}
						onSave={() => save(draft)}
						onDiscard={discard}
						onReset={() => fillWith(SEED_CALL_ANALYSIS)}
					/>
				}
			>
				<Stack gap='lg'>
					<ActiveClientBanner
						title={t('callAnalysis.banner.title')}
						description={t('callAnalysis.banner.description')}
						configured
					/>

					<SimpleGrid cols={{ base: 1, md: 2 }} spacing='lg'>
						<Select
							label={t('callAnalysis.language.label')}
							description={t('callAnalysis.language.help')}
							data={languages.map((value) => ({
								value,
								label: t(`callAnalysis.language.options.${value}`),
							}))}
							value={draft.language}
							onChange={(value) =>
								value &&
								setDraft({ ...draft, language: value as CallAnalysisLanguage })
							}
							allowDeselect={false}
							comboboxProps={{ withinPortal: true }}
						/>
						<Select
							label={t('callAnalysis.retention.label')}
							description={t('callAnalysis.retention.help')}
							data={AUDIO_RETENTION_DAYS.map((days) => ({
								value: String(days),
								label: t('callAnalysis.retention.days', { count: days }),
							}))}
							value={String(draft.audioRetentionDays)}
							onChange={(value) =>
								value &&
								setDraft({ ...draft, audioRetentionDays: Number(value) })
							}
							allowDeselect={false}
							comboboxProps={{ withinPortal: true }}
						/>
					</SimpleGrid>

					<Stack gap='sm'>
						<Switch
							color='gray'
							label={t('callAnalysis.diarization.label')}
							description={t('callAnalysis.diarization.help')}
							checked={draft.diarization}
							onChange={(event) =>
								setDraft({ ...draft, diarization: event.currentTarget.checked })
							}
						/>
						<Switch
							color='gray'
							label={t('callAnalysis.redact.label')}
							description={t('callAnalysis.redact.help')}
							checked={draft.redactPii}
							onChange={(event) =>
								setDraft({ ...draft, redactPii: event.currentTarget.checked })
							}
						/>
						<MultiSelect
							label={t('callAnalysis.piiFields.label')}
							data={PII_FIELDS.map((field) => ({
								value: field,
								label: t(`callAnalysis.piiFields.options.${field}`),
							}))}
							value={draft.piiFields}
							onChange={(piiFields) => setDraft({ ...draft, piiFields })}
							disabled={!draft.redactPii}
							comboboxProps={{ withinPortal: true }}
						/>
					</Stack>

					<Checkbox.Group
						label={t('callAnalysis.analyses.label')}
						description={t('callAnalysis.analyses.help')}
						value={draft.analyses}
						onChange={(values) =>
							setDraft({ ...draft, analyses: values as CallAnalysisKind[] })
						}
						error={
							draft.analyses.length === 0
								? t('callAnalysis.analyses.required')
								: undefined
						}
					>
						<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='xs' mt='xs'>
							{CALL_ANALYSIS_KINDS.map((kind) => (
								<Checkbox
									key={kind}
									value={kind}
									label={t(`callAnalysis.analyses.options.${kind}`)}
								/>
							))}
						</SimpleGrid>
					</Checkbox.Group>

					<NumberInput
						label={t('callAnalysis.minDuration.label')}
						description={t('callAnalysis.minDuration.help')}
						min={0}
						max={600}
						step={5}
						suffix=' s'
						value={draft.minDurationSeconds}
						onChange={(value) =>
							setDraft({ ...draft, minDurationSeconds: Number(value) || 0 })
						}
						maw={240}
					/>
				</Stack>
			</SectionCard>
		</Stack>
	);
};

export default CallAnalysisTab;
