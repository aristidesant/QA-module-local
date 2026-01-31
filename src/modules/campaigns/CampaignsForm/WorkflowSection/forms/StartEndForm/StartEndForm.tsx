import { Badge, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { AgentWorkflow } from '~/models/AgentWorkflowModel';
import WorkflowNodeForm from '../WorkflowNodeForm';
import styles from './StartEndForm.module.css';

interface StartEndFormProps {
	nodeId: string;
	workflow?: AgentWorkflow;
}

const StartEndForm = ({ nodeId, workflow }: StartEndFormProps) => {
	const { t } = useTranslation('campaigns');
	const node = workflow?.nodes[nodeId];

	if (!node) {
		return (
			<WorkflowNodeForm
				title={t('form.workflow.forms.startEnd.title')}
				description={t('form.workflow.forms.startEnd.missingNode')}
			>
				<Text size='sm' c='dimmed'>
					{t('form.workflow.forms.startEnd.missingNodeHint')}
				</Text>
			</WorkflowNodeForm>
		);
	}

	return (
		<WorkflowNodeForm
			title={t('form.workflow.forms.startEnd.title')}
			description={t('form.workflow.forms.startEnd.description')}
		>
			<Stack gap='xs'>
				<div className={styles.metaRow}>
					<Text size='xs' className={styles.metaLabel}>
						{t('form.workflow.forms.startEnd.type')}
					</Text>
					<Badge size='sm' variant='light'>
						{t(`form.workflow.nodes.${node.type}`)}
					</Badge>
				</div>
				<div className={styles.metaRow}>
					<Text size='xs' className={styles.metaLabel}>
						{t('form.workflow.forms.startEnd.label')}
					</Text>
					<Text size='sm' fw={500}>
						{node.label || t('form.workflow.forms.startEnd.labelPlaceholder')}
					</Text>
				</div>
			</Stack>
		</WorkflowNodeForm>
	);
};

export default StartEndForm;
