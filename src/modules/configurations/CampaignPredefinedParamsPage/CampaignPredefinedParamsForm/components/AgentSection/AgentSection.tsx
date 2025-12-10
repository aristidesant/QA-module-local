import { Select, Slider, Stack, Text as MantineText } from '@mantine/core';
import { useFormContext } from '../../CampaignPredefinedFormProvider';
import { LLM_MODELS } from '../../formConfig';
import styles from '../../CampaignPredefinedParamsForm.module.css';

export const AgentSection: React.FC = () => {
	const { form } = useFormContext();

	return (
		<Stack gap='lg' mt='md'>
			<Select
				label='LLM Model'
				placeholder='Select LLM model'
				required
				data={LLM_MODELS}
				{...form.getInputProps('agentPromptLlm')}
				searchable
			/>
			<div className={styles.sliderContainer}>
				<div className={styles.sliderLabel}>
					<label>Temperature</label>
					<span className={styles.sliderValue}>
						{form.values.agentPromptTemperature.toFixed(2)}
					</span>
				</div>
				<Slider
					min={0}
					max={2}
					step={0.01}
					value={form.values.agentPromptTemperature}
					onChange={(value) =>
						form.setFieldValue('agentPromptTemperature', value)
					}
					marks={[
						{ value: 0, label: '0' },
						{ value: 1, label: '1' },
						{ value: 2, label: '2' },
					]}
				/>
				<MantineText size='xs' c='dimmed'>
					Controls randomness (0–2)
				</MantineText>
			</div>
		</Stack>
	);
};

export default AgentSection;
