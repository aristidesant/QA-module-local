import { Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { AgentWorkflow, ToolNode } from '~/models/AgentWorkflowModel';
import WorkflowNodeForm from '../WorkflowNodeForm';
import { resolveNodeLabel } from '../nodeFormUtils';
import styles from './ToolNodeForm.module.css';

interface ToolNodeFormProps {
	nodeId: string;
	workflow?: AgentWorkflow;
}

const ToolNodeForm = ({ nodeId, workflow }: ToolNodeFormProps) => {
	const { t } = useTranslation('campaigns');
	const node = workflow?.nodes[nodeId] as ToolNode | undefined;

	if (!node) {
		return (
			<WorkflowNodeForm
				title={t('form.workflow.forms.tool.title')}
				description={t('form.workflow.forms.tool.missingNode')}
			>
				<Text size='sm' c='dimmed'>
					{t('form.workflow.forms.tool.missingNodeHint')}
				</Text>
			</WorkflowNodeForm>
		);
	}

	return (
		<WorkflowNodeForm
			title={t('form.workflow.forms.tool.title')}
			description={t('form.workflow.forms.tool.description')}
		>
			<Stack gap='xs'>
				{node.tools?.length ? (
					<div className={styles.list}>
						{node.tools.map((tool, index) => {
							const toolLabel = resolveNodeLabel(
								tool,
								t('form.workflow.forms.tool.unknown')
							);
							return (
								<div
									key={`${toolLabel || 'tool'}-${index}`}
									className={styles.toolItem}
								>
									<Text size='sm'>{toolLabel}</Text>
								</div>
							);
						})}
					</div>
				) : (
					<div className={styles.empty}>
						<Text size='xs' c='dimmed'>
							{t('form.workflow.forms.tool.empty')}
						</Text>
					</div>
				)}
			</Stack>
		</WorkflowNodeForm>
	);
};

export default ToolNodeForm;
