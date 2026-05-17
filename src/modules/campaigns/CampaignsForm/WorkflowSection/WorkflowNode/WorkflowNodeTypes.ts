export interface WorkflowNodeData {
	type: string;
	position: { x: number; y: number };
	label?: string;
	updates?: Array<{
		type: 'dynamic_variable';
		variableName: string;
		expression: {
			type: string;
			[key: string]: unknown;
		};
	}>;
	uiMeta?: {
		variant?: 'transfer' | 'subagent';
		createdByUi?: boolean;
	};
	agentId?: string;
	[key: string]: unknown;
}
