import { useState } from 'react';
import { Button, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconClipboard, IconCopy } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { AgentWorkflow } from '~/models/AgentWorkflowModel';
import WorkflowImportModal from '../WorkflowImportModal';
import { serializeWorkflowForClipboard } from '../utils/workflowClipboard';
import styles from './WorkflowClipboardActions.module.css';

interface WorkflowClipboardActionsProps {
	workflow?: AgentWorkflow;
	onWorkflowChange: (workflow: AgentWorkflow) => void;
	fallbackPreventSubagentLoops: boolean;
	buttonSize?: 'xs' | 'sm' | 'md';
}

const WorkflowClipboardActions = ({
	workflow,
	onWorkflowChange,
	fallbackPreventSubagentLoops,
	buttonSize = 'xs',
}: WorkflowClipboardActionsProps) => {
	const { t } = useTranslation(['campaign.form.workflow', 'common']);
	const [isImportModalOpen, setIsImportModalOpen] = useState(false);
	const [autoReadClipboardRequestKey, setAutoReadClipboardRequestKey] =
		useState(0);

	const handleCopyWorkflow = async () => {
		if (!workflow) {
			return;
		}

		try {
			await navigator.clipboard.writeText(
				serializeWorkflowForClipboard(workflow)
			);
			notifications.show({
				color: 'teal',
				title: t('form.workflow.clipboard.notifications.copySuccessTitle'),
				message: t('form.workflow.clipboard.notifications.copySuccessMessage'),
			});
		} catch {
			notifications.show({
				color: 'red',
				title: t('form.workflow.clipboard.notifications.copyErrorTitle'),
				message: t('form.workflow.clipboard.notifications.copyErrorMessage'),
			});
		}
	};

	const handleReplaceWorkflow = (nextWorkflow: AgentWorkflow) => {
		onWorkflowChange(nextWorkflow);
		setIsImportModalOpen(false);
		notifications.show({
			color: 'teal',
			title: t('form.workflow.clipboard.notifications.importSuccessTitle'),
			message: t('form.workflow.clipboard.notifications.importSuccessMessage'),
		});
	};

	return (
		<>
			<Group gap='xs' className={styles.actions}>
				<Button
					size={buttonSize}
					variant='default'
					leftSection={<IconCopy size={14} />}
					onClick={handleCopyWorkflow}
					disabled={!workflow}
					className={styles.button}
				>
					{t('form.workflow.clipboard.actions.copy')}
				</Button>
				<Button
					size={buttonSize}
					variant='default'
					leftSection={<IconClipboard size={14} />}
					onClick={() => {
						setAutoReadClipboardRequestKey((current) => current + 1);
						setIsImportModalOpen(true);
					}}
					className={styles.button}
				>
					{t('form.workflow.clipboard.actions.paste')}
				</Button>
			</Group>
			<WorkflowImportModal
				opened={isImportModalOpen}
				onClose={() => setIsImportModalOpen(false)}
				onReplace={handleReplaceWorkflow}
				fallbackPreventSubagentLoops={fallbackPreventSubagentLoops}
				autoReadClipboardRequestKey={autoReadClipboardRequestKey}
			/>
		</>
	);
};

export default WorkflowClipboardActions;
