import {
	MultiSelect,
	Select,
	Slider,
	Stack,
	Text as MantineText,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useFormContext } from '../../CampaignPredefinedFormProvider';
import {
	DEFAULT_BACKUP_LLM_PREFERENCE,
	getGroupedLlmOptions,
} from '../../formConfig';
import styles from '../../CampaignPredefinedParamsForm.module.css';

export const AgentSection: React.FC = () => {
	const { form } = useFormContext();
	const { t } = useTranslation('campaign-predefined-params');

	return (
		<Stack className={styles.sectionStack}>
			<Select
				label={t('form.agent.llmModel.label')}
				placeholder={t('form.agent.llmModel.placeholder')}
				required
				data={getGroupedLlmOptions()}
				{...form.getInputProps('agentPromptLlm')}
				searchable
			/>
			<div className={styles.sliderContainer}>
				<div className={styles.sliderLabel}>
					<label>{t('form.agent.temperature.label')}</label>
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
					{t('form.agent.temperature.helper')}
				</MantineText>
			</div>
			<Stack gap='xs'>
				<MantineText fw={600} size='sm'>
					{t('form.agent.backupLlm.title')}
				</MantineText>
				<MantineText size='xs' c='dimmed'>
					{t('form.agent.backupLlm.description')}
				</MantineText>
				<Select
					label={t('form.agent.backupLlm.preference.label')}
					placeholder={t('form.agent.backupLlm.preference.placeholder')}
					data={[
						{
							value: DEFAULT_BACKUP_LLM_PREFERENCE,
							label: t('form.agent.backupLlm.preference.options.override'),
						},
					]}
					{...form.getInputProps('agentPromptBackupLlmPreference')}
					searchable={false}
					clearable={false}
				/>
				<MultiSelect
					label={t('form.agent.backupLlm.order.label')}
					placeholder={t('form.agent.backupLlm.order.placeholder')}
					description={t('form.agent.backupLlm.order.helper')}
					data={getGroupedLlmOptions()}
					{...form.getInputProps('agentPromptBackupLlmOrder')}
					searchable
					clearable
				/>
			</Stack>
		</Stack>
	);
};

export default AgentSection;
