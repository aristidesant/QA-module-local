import { Select, Slider, Stack, Text as MantineText } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useFormContext } from '../../CampaignPredefinedFormProvider';
import { TTS_MODELS, AUDIO_FORMATS } from '../../formConfig';
import styles from '../../CampaignPredefinedParamsForm.module.css';

export const TTSSection: React.FC = () => {
	const { form } = useFormContext();
	const { t } = useTranslation('campaign-predefined-params');

	return (
		<Stack className={styles.sectionStack}>
			<div className={styles.fieldRow}>
				<Select
					label={t('form.tts.model.label')}
					placeholder={t('form.tts.model.placeholder')}
					required
					data={TTS_MODELS}
					{...form.getInputProps('ttsModelId')}
					searchable
				/>
				<Select
					label={t('form.tts.outputAudioFormat.label')}
					placeholder={t('form.common.selectFormatPlaceholder')}
					required
					data={AUDIO_FORMATS}
					{...form.getInputProps('ttsAgentOutputAudioFormat')}
				/>
			</div>
			<div className={styles.sliderContainer}>
				<div className={styles.sliderLabel}>
					<label>{t('form.tts.speed.label')}</label>
					<span className={styles.sliderValue}>
						{form.values.ttsSpeed.toFixed(2)}
					</span>
				</div>
				<Slider
					min={0.25}
					max={4.0}
					step={0.01}
					value={form.values.ttsSpeed}
					onChange={(value) => form.setFieldValue('ttsSpeed', value)}
					marks={[
						{ value: 0.25, label: '0.25' },
						{ value: 2.0, label: '2.0' },
						{ value: 4.0, label: '4.0' },
					]}
				/>
				<MantineText size='xs' c='dimmed'>
					{t('form.tts.speed.helper')}
				</MantineText>
			</div>
			<div className={styles.sliderContainer}>
				<div className={styles.sliderLabel}>
					<label>{t('form.tts.streamingLatency.label')}</label>
					<span className={styles.sliderValue}>
						{form.values.ttsOptimizeStreamingLatency}
					</span>
				</div>
				<Slider
					min={0}
					max={4}
					step={1}
					value={form.values.ttsOptimizeStreamingLatency}
					onChange={(value) =>
						form.setFieldValue('ttsOptimizeStreamingLatency', value)
					}
					marks={[
						{ value: 0, label: '0' },
						{ value: 2, label: '2' },
						{ value: 4, label: '4' },
					]}
				/>
				<MantineText size='xs' c='dimmed'>
					{t('form.tts.streamingLatency.helper')}
				</MantineText>
			</div>
			<div className={styles.sliderContainer}>
				<div className={styles.sliderLabel}>
					<label>{t('form.tts.stability.label')}</label>
					<span className={styles.sliderValue}>
						{form.values.ttsStability.toFixed(2)}
					</span>
				</div>
				<Slider
					min={0}
					max={1}
					step={0.01}
					value={form.values.ttsStability}
					onChange={(value) => form.setFieldValue('ttsStability', value)}
					marks={[
						{ value: 0, label: '0' },
						{ value: 0.5, label: '0.5' },
						{ value: 1, label: '1' },
					]}
				/>
				<MantineText size='xs' c='dimmed'>
					{t('form.tts.stability.helper')}
				</MantineText>
			</div>
			<div className={styles.sliderContainer}>
				<div className={styles.sliderLabel}>
					<label>{t('form.tts.similarityBoost.label')}</label>
					<span className={styles.sliderValue}>
						{form.values.ttsSimilarityBoost.toFixed(2)}
					</span>
				</div>
				<Slider
					min={0}
					max={1}
					step={0.01}
					value={form.values.ttsSimilarityBoost}
					onChange={(value) => form.setFieldValue('ttsSimilarityBoost', value)}
					marks={[
						{ value: 0, label: '0' },
						{ value: 0.5, label: '0.5' },
						{ value: 1, label: '1' },
					]}
				/>
				<MantineText size='xs' c='dimmed'>
					{t('form.tts.similarityBoost.helper')}
				</MantineText>
			</div>
		</Stack>
	);
};

export default TTSSection;
