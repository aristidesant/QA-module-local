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
	forwardCondition?: WorkflowEdge['forwardCondition'];
	backwardCondition?: WorkflowEdge['backwardCondition'];
	sourceNodeType?: string;
}
