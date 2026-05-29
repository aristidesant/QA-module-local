export interface WorkflowNodeData {
	type: string;
	position: { x: number; y: number };
	label?: string;
	updates?: Array<{
		type: 'dynamic_variable';
		variable_name: string;
		expression: {
			type: string;
			[key: string]: unknown;
		};
	}>;
	uiMeta?: {
		variant?: 'transfer' | 'subagent';
		createdByUi?: boolean;
	};
	agent_id?: string;
	[key: string]: unknown;
}
