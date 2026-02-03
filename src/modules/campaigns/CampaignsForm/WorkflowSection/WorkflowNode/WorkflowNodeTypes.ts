import type { WorkflowNodeType } from '../nodeTypes';

export interface WorkflowNodeData {
	type: string;
	position: { x: number; y: number };
	label?: string;
	uiMeta?: {
		variant?: 'transfer' | 'subagent';
		createdByUi?: boolean;
	};
	agentId?: string;
	onAddNode?: (
		parentNodeId: string,
		parentPosition: { x: number; y: number }
	) => void;
	onAddNodeWithType?: (
		parentNodeId: string,
		parentPosition: { x: number; y: number },
		nodeType: WorkflowNodeType
	) => void;
	onAddNodeWithVariant?: (
		parentNodeId: string,
		parentPosition: { x: number; y: number },
		payload: {
			type: WorkflowNodeType;
			variant?: 'transfer' | 'subagent';
		}
	) => void;
	onDeleteNode?: (nodeId: string) => void;
	onCopyNode?: (nodeId: string) => void;
	showActions?: boolean;
	allowMultipleEdges?: boolean;
	[key: string]: unknown;
}
