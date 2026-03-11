export interface WorkflowNodeData {
	type: string;
	position: { x: number; y: number };
	label?: string;
	uiMeta?: {
		variant?: 'transfer' | 'subagent';
		createdByUi?: boolean;
	};
	agentId?: string;
	[key: string]: unknown;
}
