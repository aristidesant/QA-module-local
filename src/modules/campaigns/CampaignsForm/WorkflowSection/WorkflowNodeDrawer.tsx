import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import AppDrawer from '~/components/AppDrawer';
import { WORKFLOW_NODE_TYPES } from './nodeTypes';
import {
	AgentForm,
	AgentTransferForm,
	PhoneNumberForm,
	StartEndForm,
	ToolNodeForm,
} from './forms';
import { useWorkflowNodeEditor } from './WorkflowNodeEditorContext';

interface WorkflowNodeDrawerProps {
	nodeId: string;
}

const WorkflowNodeDrawer = ({ nodeId }: WorkflowNodeDrawerProps) => {
	const { t } = useTranslation('campaigns');
	const {
		workflow,
		onWorkflowChange,
		campaignAgentConfig,
		closeNodeDrawer,
		isNodeDrawerOpen,
	} = useWorkflowNodeEditor();
	const opened = isNodeDrawerOpen(nodeId);
	const selectedNode = workflow?.nodes?.[nodeId];

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
			(selectedNode.uiMeta?.variant === 'transfer' || !!selectedNode.agentId);

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
			title={t('form.settingsDrawer.title')}
			keepMounted
			size='lg'
			transitionProps={{
				transition: 'slide-left',
				duration: 250,
				timingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
			}}
		>
			{opened ? drawerContent : null}
		</AppDrawer>
	);
};

export default WorkflowNodeDrawer;
