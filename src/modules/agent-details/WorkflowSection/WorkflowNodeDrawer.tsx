import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
	IconFlag,
	IconPlayerStop,
	IconTool,
	IconUser,
	IconPencil,
	IconPhone,
	IconRobot,
} from '@tabler/icons-react';
import type { TablerIcon } from '@tabler/icons-react';
import AppDrawer from '~/components/AppDrawer';
import { WORKFLOW_NODE_TYPES } from './nodeTypes';
import type { WorkflowNodeType } from './nodeTypes';
import {
	AgentForm,
	AgentTransferForm,
	PhoneNumberForm,
	UpdateStateForm,
	StartEndForm,
	ToolNodeForm,
} from './forms';
import { useWorkflowNodeEditor } from './WorkflowNodeEditorContext';
import { isStandaloneAgentTransferNode } from './utils/standaloneAgentNode';
import styles from './WorkflowNodeDrawer.module.css';

interface WorkflowNodeDrawerProps {
	nodeId: string;
}

const NODE_DRAWER_CONFIG: Record<
	WorkflowNodeType,
	{ titleKey: string; icon: TablerIcon; iconColor: string }
> = {
	[WORKFLOW_NODE_TYPES.START]: {
		titleKey: 'form.workflow.forms.startEnd.title',
		icon: IconFlag,
		iconColor: 'green',
	},
	[WORKFLOW_NODE_TYPES.END]: {
		titleKey: 'form.workflow.forms.startEnd.title',
		icon: IconPlayerStop,
		iconColor: 'red',
	},
	[WORKFLOW_NODE_TYPES.TOOL]: {
		titleKey: 'form.workflow.forms.tool.title',
		icon: IconTool,
		iconColor: 'blue',
	},
	[WORKFLOW_NODE_TYPES.OVERRIDE_AGENT]: {
		titleKey: 'form.workflow.forms.agent.title',
		icon: IconUser,
		iconColor: 'orange',
	},
	[WORKFLOW_NODE_TYPES.UPDATE_STATE]: {
		titleKey: 'form.workflow.forms.updateState.title',
		icon: IconPencil,
		iconColor: 'teal',
	},
	[WORKFLOW_NODE_TYPES.PHONE_NUMBER]: {
		titleKey: 'form.workflow.forms.phone.title',
		icon: IconPhone,
		iconColor: 'violet',
	},
	[WORKFLOW_NODE_TYPES.STANDALONE_AGENT]: {
		titleKey: 'form.workflow.forms.agent.title',
		icon: IconRobot,
		iconColor: 'cyan',
	},
	[WORKFLOW_NODE_TYPES.GROUP]: {
		titleKey: 'form.workflow.forms.startEnd.title',
		icon: IconUser,
		iconColor: 'gray',
	},
};

const WorkflowNodeDrawer = ({ nodeId }: WorkflowNodeDrawerProps) => {
	const { t } = useTranslation([
		'campaign.form.workflow',
		'campaign.form.shared',
		'campaign.form.agents',
		'common',
	]);
	const {
		workflow,
		onWorkflowChange,
		campaignAgentConfig,
		closeNodeDrawer,
		isNodeDrawerOpen,
	} = useWorkflowNodeEditor();
	const opened = isNodeDrawerOpen(nodeId);
	const selectedNode = workflow?.nodes?.[nodeId];

	const drawerConfig = useMemo(() => {
		if (!selectedNode) return null;

		const isTransferNode =
			selectedNode.type === WORKFLOW_NODE_TYPES.STANDALONE_AGENT &&
			isStandaloneAgentTransferNode(selectedNode);

		const config = NODE_DRAWER_CONFIG[selectedNode.type as WorkflowNodeType];
		if (!config) return null;

		const titleKey = isTransferNode
			? 'form.workflow.forms.transfer.title'
			: config.titleKey;

		return {
			title: t(titleKey),
			icon: config.icon,
			iconColor: config.iconColor,
		};
	}, [selectedNode, t]);

	const drawerContent = useMemo(() => {
		if (!selectedNode) {
			return null;
		}

		const commonProps = {
			nodeId,
			workflow,
			onWorkflowChange,
			campaignAgentConfig,
		};
		const isTransferNode =
			selectedNode.type === WORKFLOW_NODE_TYPES.STANDALONE_AGENT &&
			isStandaloneAgentTransferNode(selectedNode);

		switch (selectedNode.type) {
			case WORKFLOW_NODE_TYPES.STANDALONE_AGENT:
				return isTransferNode ? (
					<AgentTransferForm {...commonProps} />
				) : (
					<AgentForm {...commonProps} />
				);
			case WORKFLOW_NODE_TYPES.OVERRIDE_AGENT:
				return <AgentForm {...commonProps} />;
			case WORKFLOW_NODE_TYPES.PHONE_NUMBER:
				return <PhoneNumberForm {...commonProps} />;
			case WORKFLOW_NODE_TYPES.TOOL:
				return <ToolNodeForm {...commonProps} />;
			case WORKFLOW_NODE_TYPES.UPDATE_STATE:
				return <UpdateStateForm {...commonProps} />;
			case WORKFLOW_NODE_TYPES.START:
			case WORKFLOW_NODE_TYPES.END:
				return <StartEndForm nodeId={nodeId} workflow={workflow} />;
			default:
				return null;
		}
	}, [campaignAgentConfig, nodeId, onWorkflowChange, selectedNode, workflow]);

	return (
		<AppDrawer
			opened={opened}
			onClose={closeNodeDrawer}
			title={drawerConfig?.title}
			icon={drawerConfig ? <drawerConfig.icon size={16} /> : undefined}
			keepMounted
			size='lg'
			zIndex={340}
			transitionProps={{
				transition: 'slide-left',
				duration: 250,
				timingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
			}}
		>
			<div className={styles.surface}>{opened ? drawerContent : null}</div>
		</AppDrawer>
	);
};

export default WorkflowNodeDrawer;
