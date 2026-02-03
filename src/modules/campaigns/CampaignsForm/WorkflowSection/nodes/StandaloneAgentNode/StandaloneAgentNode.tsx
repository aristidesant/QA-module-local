import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { StandaloneAgentNode as StandaloneAgentNodeModel } from '~/models/AgentWorkflowModel';
import AgentTransferNode from '../AgentTransferNode';
import SubagentNode from '../SubagentNode';

const StandaloneAgentNodeComponent = (props: NodeProps) => {
	const nodeData = props.data as unknown as StandaloneAgentNodeModel;
	const isTransfer =
		nodeData.uiMeta?.variant === 'transfer' || !!nodeData.agentId;

	return isTransfer ? (
		<AgentTransferNode {...props} />
	) : (
		<SubagentNode {...props} />
	);
};

export default memo(StandaloneAgentNodeComponent);
