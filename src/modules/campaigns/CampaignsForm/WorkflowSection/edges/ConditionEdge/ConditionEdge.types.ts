import type { WorkflowEdge } from '~/models/AgentWorkflowModel';

export type WarningLevel = 'error' | 'warning' | 'none';

export interface StructuredConditionEdgeLabel {
	forwardLabel: string;
	backwardLabel: string;
}

export type ConditionEdgeLabel = string | StructuredConditionEdgeLabel | null;

export interface ConditionEdgeData {
	label?: ConditionEdgeLabel;
	warningLevel?: WarningLevel;
	forward_condition?: WorkflowEdge['forward_condition'];
	backward_condition?: WorkflowEdge['backward_condition'];
	sourceNodeType?: string;
}

export interface ContextMenuPosition {
	x: number;
	y: number;
}
