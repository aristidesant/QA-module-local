import { ActionIcon, Group, Modal, Text } from '@mantine/core';
import { IconArrowsMinimize, IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import WorkflowClipboardActions from '../WorkflowClipboardActions';
import WorkflowCanvas from '../WorkflowCanvas';
import WorkflowNodeLegend from '../WorkflowNodeLegend';
import type { AgentWorkflow } from '~/models/AgentWorkflowModel';
import type { NodeStyles } from '~/models/CampaignsModel';
import styles from './WorkflowEditorFullscreen.module.css';

interface WorkflowEditorFullscreenProps {
	opened: boolean;
	onClose: () => void;
	workflow?: AgentWorkflow;
	onWorkflowChange: (workflow: AgentWorkflow) => void;
	preventSubagentLoops: boolean;
	allowDefaultInit: boolean;
	onNodeSelect?: (nodeId: string | null) => void;
	nodeStyles?: NodeStyles;
}

const WorkflowEditorFullscreen = ({
	opened,
	onClose,
	workflow,
	onWorkflowChange,
	preventSubagentLoops,
	allowDefaultInit,
	onNodeSelect,
	nodeStyles,
}: WorkflowEditorFullscreenProps) => {
	const { t } = useTranslation([
		'campaign.form.workflow',
		'campaign.form.agents',
		'common',
	]);

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			fullScreen
			withCloseButton={false}
			padding='md'
			classNames={{
				content: styles.modalContent,
				body: styles.modalBody,
			}}
			zIndex={320}
		>
			<div className={styles.shell}>
				<div className={styles.header}>
					<div className={styles.headerMain}>
						<Text size='xs' fw={700} tt='uppercase' className={styles.eyebrow}>
							{t('form.workflow.fullscreen.eyebrow')}
						</Text>
						<Text size='lg' fw={600} className={styles.title}>
							{t('form.workflow.fullscreen.title')}
						</Text>
						<Text size='sm' className={styles.description}>
							{t('form.workflow.fullscreen.description')}
						</Text>
					</div>
					<div className={styles.headerActions}>
						<WorkflowClipboardActions
							workflow={workflow}
							onWorkflowChange={onWorkflowChange}
							fallbackPreventSubagentLoops={preventSubagentLoops}
							buttonSize='sm'
						/>
						<Group gap='xs' wrap='nowrap'>
							<ActionIcon
								size='md'
								variant='light'
								color='gray'
								radius='sm'
								title={t('form.workflow.fullscreen.exit')}
								onClick={onClose}
							>
								<IconArrowsMinimize size={16} />
							</ActionIcon>
							<ActionIcon
								size='md'
								variant='light'
								color='gray'
								radius='sm'
								title={t('common:actions.close', { defaultValue: 'Close' })}
								onClick={onClose}
							>
								<IconX size={16} />
							</ActionIcon>
						</Group>
					</div>
				</div>
				{nodeStyles &&
					Object.keys(nodeStyles).some(
						(k) => nodeStyles[k]?.backgroundColor || nodeStyles[k]?.iconName
					) && (
						<div className={styles.legendBar}>
							<WorkflowNodeLegend nodeStyles={nodeStyles} />
						</div>
					)}
				<div className={styles.canvasArea}>
					<WorkflowCanvas
						workflow={workflow}
						onWorkflowChange={onWorkflowChange}
						preventSubagentLoops={preventSubagentLoops}
						allowDefaultInit={allowDefaultInit}
						onNodeSelect={onNodeSelect}
						layoutMode='fullscreen'
					/>
				</div>
			</div>
		</Modal>
	);
};

export default WorkflowEditorFullscreen;
