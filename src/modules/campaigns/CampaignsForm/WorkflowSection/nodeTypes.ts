import type { NodeProps, NodeTypes } from '@xyflow/react';
import type { ComponentType } from 'react';

export const WORKFLOW_NODE_TYPES = {
	START: 'start',
	END: 'end',
	TOOL: 'tool',
	OVERRIDE_AGENT: 'override_agent',
	PHONE_NUMBER: 'phone_number',
	STANDALONE_AGENT: 'standalone_agent',
	GROUP: 'group',
} as const;

export type WorkflowNodeType =
	(typeof WORKFLOW_NODE_TYPES)[keyof typeof WORKFLOW_NODE_TYPES];

export interface NodeTypeConfig {
	type: WorkflowNodeType;
	label: string;
	hasAddButton: boolean;
	color: string;
	icon?: string;
}

export const NODE_TYPE_CONFIG: Record<WorkflowNodeType, NodeTypeConfig> = {
	[WORKFLOW_NODE_TYPES.START]: {
		type: WORKFLOW_NODE_TYPES.START,
		label: 'Start',
		hasAddButton: true,
		color: 'green',
		icon: 'flag',
	},
	[WORKFLOW_NODE_TYPES.END]: {
		type: WORKFLOW_NODE_TYPES.END,
		label: 'End',
		hasAddButton: false,
		color: 'red',
		icon: 'stop',
	},
	[WORKFLOW_NODE_TYPES.TOOL]: {
		type: WORKFLOW_NODE_TYPES.TOOL,
		label: 'Tool',
		hasAddButton: true,
		color: 'blue',
		icon: 'tool',
	},
	[WORKFLOW_NODE_TYPES.OVERRIDE_AGENT]: {
		type: WORKFLOW_NODE_TYPES.OVERRIDE_AGENT,
		label: 'Override',
		hasAddButton: true,
		color: 'orange',
		icon: 'user',
	},
	[WORKFLOW_NODE_TYPES.PHONE_NUMBER]: {
		type: WORKFLOW_NODE_TYPES.PHONE_NUMBER,
		label: 'Phone',
		hasAddButton: true,
		color: 'purple',
		icon: 'phone',
	},
	[WORKFLOW_NODE_TYPES.STANDALONE_AGENT]: {
		type: WORKFLOW_NODE_TYPES.STANDALONE_AGENT,
		label: 'Subagent',
		hasAddButton: true,
		color: 'cyan',
		icon: 'agent',
	},
	[WORKFLOW_NODE_TYPES.GROUP]: {
		type: WORKFLOW_NODE_TYPES.GROUP,
		label: 'Group',
		hasAddButton: false,
		color: 'gray',
		icon: 'group',
	},
};

// Helper to create node types map for React Flow
export const createNodeTypes = (
	components: Record<WorkflowNodeType, ComponentType<NodeProps>>
): NodeTypes => {
	return components as unknown as NodeTypes;
};
