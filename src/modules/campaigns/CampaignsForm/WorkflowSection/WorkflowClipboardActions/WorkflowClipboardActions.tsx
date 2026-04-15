import { useState } from 'react';
import { Button, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconClipboard, IconCopy } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { AgentWorkflow } from '~/models/AgentWorkflowModel';
import type { NodeGroups, NodeStyles } from '~/models/CampaignsModel';
import WorkflowImportModal from '../WorkflowImportModal';
import type { WorkflowImportReplacePayload } from '../WorkflowImportModal/WorkflowImportModal';
import WorkflowCopyModal from '../WorkflowCopyModal';
import styles from './WorkflowClipboardActions.module.css';

interface WorkflowClipboardActionsProps {
	workflow?: AgentWorkflow;
	onWorkflowChange: (workflow: AgentWorkflow) => void;
	fallbackPreventSubagentLoops: boolean;
	buttonSize?: 'xs' | 'sm' | 'md';
	nodeStyles?: NodeStyles;
	nodeGroups?: NodeGroups;
	onNodeStylesChange?: (nodeStyles: NodeStyles) => void;
	onNodeGroupsChange?: (nodeGroups: NodeGroups) => void;
}

const WorkflowClipboardActions = ({
	workflow,
	onWorkflowChange,
	fallbackPreventSubagentLoops,
	buttonSize = 'xs',
	nodeStyles,
	nodeGroups,
	onNodeStylesChange,
	onNodeGroupsChange,
}: WorkflowClipboardActionsProps) => {
	const { t } = useTranslation(['campaign.form.workflow', 'common']);
	const [isImportModalOpen, setIsImportModalOpen] = useState(false);
	const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
	const [autoReadClipboardRequestKey, setAutoReadClipboardRequestKey] =
		useState(0);

	const handleReplaceWorkflow = (payload: WorkflowImportReplacePayload) => {
		onWorkflowChange(payload.workflow);

		if (payload.nodeStyles && onNodeStylesChange) {
			onNodeStylesChange(payload.nodeStyles);
		}

		if (payload.nodeGroups && onNodeGroupsChange) {
			onNodeGroupsChange(payload.nodeGroups);
		}

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
					onClick={() => setIsCopyModalOpen(true)}
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
			{workflow && (
				<WorkflowCopyModal
					opened={isCopyModalOpen}
					onClose={() => setIsCopyModalOpen(false)}
					workflow={workflow}
					nodeStyles={nodeStyles}
					nodeGroups={nodeGroups}
				/>
			)}
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
