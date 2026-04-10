import { useEffect, useMemo } from 'react';
import { Select, Slider, Stack, Text as MantineText } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useFormContext } from '../../CampaignPredefinedFormProvider';
import { getGroupedLlmOptions } from '../../formConfig';
import styles from '../../CampaignPredefinedParamsForm.module.css';

interface AgentSectionProps {
	hasResolvedReasoningAvailability: boolean;
	reasoningEffortsByModel: Record<string, string[] | null>;
}

export const AgentSection: React.FC<AgentSectionProps> = ({
	hasResolvedReasoningAvailability,
	reasoningEffortsByModel,
}) => {
	const { form } = useFormContext();
	const { t } = useTranslation('campaign-predefined-params');
	const selectedModel = form.values.agentPromptLlm;
	const selectedReasoningEfforts =
		reasoningEffortsByModel[selectedModel] ?? null;
	const showReasoningEffortSelect =
		Array.isArray(selectedReasoningEfforts) &&
		selectedReasoningEfforts.length > 0;
	const reasoningEffortOptions = useMemo(
		() =>
			(selectedReasoningEfforts ?? []).map((effort) => ({
				value: effort,
				label: t(`form.agent.reasoningEffort.options.${effort}`, {
					defaultValue: effort,
				}),
			})),
		[selectedReasoningEfforts, t]
	);

	useEffect(() => {
		if (
			!hasResolvedReasoningAvailability ||
			!form.values.agentPromptReasoningEffort
		) {
			return;
		}

		const hasSelectedModelMetadata = Object.prototype.hasOwnProperty.call(
			reasoningEffortsByModel,
			selectedModel
		);

		if (!hasSelectedModelMetadata) {
			form.setFieldValue('agentPromptReasoningEffort', null);
			return;
		}

		if (
			!selectedReasoningEfforts?.includes(
				form.values.agentPromptReasoningEffort
			)
		) {
			form.setFieldValue('agentPromptReasoningEffort', null);
		}
	}, [
		form,
		hasResolvedReasoningAvailability,
		reasoningEffortsByModel,
		selectedModel,
		selectedReasoningEfforts,
		form.values.agentPromptReasoningEffort,
	]);

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
			{showReasoningEffortSelect && (
				<Stack gap='xs'>
					<Select
						label={t('form.agent.reasoningEffort.label')}
						placeholder={t('form.agent.reasoningEffort.placeholder')}
						data={reasoningEffortOptions}
						clearable
						{...form.getInputProps('agentPromptReasoningEffort')}
					/>
					<MantineText size='xs' c='dimmed'>
						{t('form.agent.reasoningEffort.helper')}
					</MantineText>
				</Stack>
			)}
		</Stack>
	);
};

export default AgentSection;
