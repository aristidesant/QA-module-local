import {
	Select,
	Slider,
	Stack,
	Text as MantineText,
	Group,
} from '@mantine/core';
import { useFormContext } from '../../CampaignPredefinedFormProvider';
import { TTS_MODELS, AUDIO_FORMATS } from '../../formConfig';
import styles from '../../CampaignPredefinedParamsForm.module.css';

export const TTSSection: React.FC = () => {
	const { form } = useFormContext();

	return (
		<Stack gap='lg' mt='md'>
			<Group grow>
				<Select
					label='Model'
					placeholder='Select TTS model'
					required
					data={TTS_MODELS}
					{...form.getInputProps('ttsModelId')}
					searchable
				/>
				<Select
					label='Output Audio Format'
					placeholder='Select format'
					required
					data={AUDIO_FORMATS}
					{...form.getInputProps('ttsAgentOutputAudioFormat')}
				/>
			</Group>
			<div className={styles.sliderContainer}>
				<div className={styles.sliderLabel}>
					<label>Speed</label>
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
					Speech rate (0.25–4.0)
				</MantineText>
			</div>
			<div className={styles.sliderContainer}>
				<div className={styles.sliderLabel}>
					<label>Streaming Latency</label>
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
					0 = best quality, 4 = lowest latency
				</MantineText>
			</div>
			<div className={styles.sliderContainer}>
				<div className={styles.sliderLabel}>
					<label>Stability</label>
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
					Voice consistency (0–1)
				</MantineText>
			</div>
			<div className={styles.sliderContainer}>
				<div className={styles.sliderLabel}>
					<label>Similarity Boost</label>
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
					Match to original voice (0–1)
				</MantineText>
			</div>
		</Stack>
	);
};

export default TTSSection;
