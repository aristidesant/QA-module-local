import { Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type {
	AgentWorkflow,
	OverrideAgentNode,
} from '~/models/AgentWorkflowModel';
import WorkflowNodeForm from '../WorkflowNodeForm';
import { resolveNodeLabel } from '../nodeFormUtils';
import styles from './OverrideAgentForm.module.css';

interface OverrideAgentFormProps {
	nodeId: string;
	workflow?: AgentWorkflow;
}

const OverrideAgentForm = ({ nodeId, workflow }: OverrideAgentFormProps) => {
	const { t } = useTranslation('campaigns');
	const node = workflow?.nodes[nodeId] as OverrideAgentNode | undefined;

	if (!node) {
		return (
			<WorkflowNodeForm
				title={t('form.workflow.forms.override.title')}
				description={t('form.workflow.forms.override.missingNode')}
			>
				<Text size='sm' c='dimmed'>
					{t('form.workflow.forms.override.missingNodeHint')}
				</Text>
			</WorkflowNodeForm>
		);
	}

	const toolIds = node.additionalToolIds ?? [];
	const knowledgeBase = node.additionalKnowledgeBase ?? [];

	return (
		<WorkflowNodeForm
			title={t('form.workflow.forms.override.title')}
			description={t('form.workflow.forms.override.description')}
		>
			<Stack gap='md'>
				<div>
					<Text className={styles.sectionTitle}>
						{t('form.workflow.forms.override.promptTitle')}
					</Text>
					{node.additionalPrompt ? (
						<Text size='sm'>{node.additionalPrompt}</Text>
					) : (
						<div className={styles.empty}>
							<Text size='xs' c='dimmed'>
								{t('form.workflow.forms.override.promptEmpty')}
							</Text>
						</div>
					)}
				</div>
				<div>
					<Text className={styles.sectionTitle}>
						{t('form.workflow.forms.override.toolsTitle')}
					</Text>
					{toolIds.length ? (
						<div className={styles.list}>
							{toolIds.map((toolId, index) => {
								const label = resolveNodeLabel(
									toolId,
									t('form.workflow.forms.override.itemFallback')
								);
								return (
									<span key={`${label}-${index}`} className={styles.chip}>
										{label}
									</span>
								);
							})}
						</div>
					) : (
						<div className={styles.empty}>
							<Text size='xs' c='dimmed'>
								{t('form.workflow.forms.override.toolsEmpty')}
							</Text>
						</div>
					)}
				</div>
				<div>
					<Text className={styles.sectionTitle}>
						{t('form.workflow.forms.override.knowledgeTitle')}
					</Text>
					{knowledgeBase.length ? (
						<div className={styles.list}>
							{knowledgeBase.map((kbId, index) => {
								const label = resolveNodeLabel(
									kbId,
									t('form.workflow.forms.override.itemFallback')
								);
								return (
									<span key={`${label}-${index}`} className={styles.chip}>
										{label}
									</span>
								);
							})}
						</div>
					) : (
						<div className={styles.empty}>
							<Text size='xs' c='dimmed'>
								{t('form.workflow.forms.override.knowledgeEmpty')}
							</Text>
						</div>
					)}
				</div>
			</Stack>
		</WorkflowNodeForm>
	);
};

export default OverrideAgentForm;
