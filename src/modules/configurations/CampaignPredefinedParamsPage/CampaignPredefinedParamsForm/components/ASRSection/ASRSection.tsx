import { Select, Stack, TagsInput } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useFormContext } from '../../CampaignPredefinedFormProvider';
import {
	ASR_PROVIDERS,
	AUDIO_FORMATS,
	getAsrQualityOptions,
} from '../../formConfig';
import styles from '../../CampaignPredefinedParamsForm.module.css';

export const ASRSection: React.FC = () => {
	const { form } = useFormContext();
	const { t } = useTranslation('campaign-predefined-params');

	return (
		<Stack className={styles.sectionStack}>
			<Select
				label={t('form.asr.provider.label')}
				placeholder={t('form.asr.provider.placeholder')}
				required
				data={ASR_PROVIDERS}
				{...form.getInputProps('asrProvider')}
				searchable
			/>
			<Select
				label={t('form.asr.quality.label')}
				placeholder={t('form.asr.quality.placeholder')}
				required
				data={getAsrQualityOptions(t)}
				{...form.getInputProps('asrQuality')}
			/>
			<Select
				label={t('form.asr.inputAudioFormat.label')}
				placeholder={t('form.common.selectFormatPlaceholder')}
				required
				data={AUDIO_FORMATS}
				{...form.getInputProps('asrUserInputAudioFormat')}
			/>
			<TagsInput
				label={t('form.asr.keywords.label')}
				placeholder={t('form.asr.keywords.placeholder')}
				description={t('form.asr.keywords.description')}
				{...form.getInputProps('asrKeywords')}
			/>
		</Stack>
	);
};

export default ASRSection;
