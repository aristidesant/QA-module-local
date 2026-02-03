import type { AgentWorkflow } from '~/models/AgentWorkflowModel';

/**
 * Warning level for an edge
 */
export type EdgeWarningLevel = 'error' | 'warning' | 'none';

/**
 * Validation result for workflow edge conditions
 */
export interface EdgeConditionValidationResult {
	isValid: boolean;
	invalidEdges: Array<{
		edgeId: string;
		sourceNodeId: string;
		targetNodeId: string;
		reason: string;
	}>;
	errorMessage?: string;
}

/**
 * Validates that all edges in the workflow have at least one condition
 * (forward or backward). This prevents the backend error:
 * "An edge must have at least one condition (forward or backward)."
 *
 * @param workflow - The workflow to validate
 * @returns Validation result with details about any invalid edges
 */
export const validateWorkflowEdgeConditions = (
	workflow: AgentWorkflow | undefined
): EdgeConditionValidationResult => {
	if (!workflow) {
		return {
			isValid: false,
			invalidEdges: [],
			errorMessage: 'No workflow provided',
		};
	}

	const invalidEdges = Object.entries(workflow.edges)
		.filter(([, edge]) => {
			// If the edge originates from a START node, skip validation for it
			const sourceNode = workflow.nodes[edge.source];
			if (sourceNode && sourceNode.type === 'start') return false;

			// An edge must have at least one condition (forward or backward)
			const hasForwardCondition = edge.forwardCondition !== undefined;
			const hasBackwardCondition = edge.backwardCondition !== undefined;
			return !hasForwardCondition && !hasBackwardCondition;
		})
		.map(([edgeId, edge]) => ({
			edgeId,
			sourceNodeId: edge.source,
			targetNodeId: edge.target,
			reason: 'Edge must have at least one condition (forward or backward)',
		}));

	if (invalidEdges.length > 0) {
		return {
			isValid: false,
			invalidEdges,
			errorMessage: `${invalidEdges.length} edge(s) have no conditions configured`,
		};
	}

	return {
		isValid: true,
		invalidEdges: [],
	};
};

/**
 * Validates the entire workflow before submission.
 * Can be extended to include other validation rules.
 *
 * @param workflow - The workflow to validate
 * @returns Validation result
 */
export const validateWorkflow = (
	workflow: AgentWorkflow | undefined
): EdgeConditionValidationResult => {
	return validateWorkflowEdgeConditions(workflow);
};

/**
 * Checks if a specific edge has at least one condition
 *
 * @param edgeId - The edge ID
 * @param workflow - The workflow containing the edge
 * @returns true if edge has at least one condition
 */
export const hasEdgeCondition = (
	edgeId: string,
	workflow: AgentWorkflow | undefined
): boolean => {
	if (!workflow) return false;
	const edge = workflow.edges[edgeId];
	if (!edge) return false;
	return (
		edge.forwardCondition !== undefined || edge.backwardCondition !== undefined
	);
};

/**
 * Determines the warning level for an edge
 * - 'error': Edge has no conditions at all (both forward and backward are undefined)
 * - 'warning': Edge has conditions but they might need configuration
 * - 'none': Edge is properly configured
 *
 * @param edgeId - The edge ID to check
 * @param workflow - The workflow containing the edge
 * @returns The warning level for the edge
 */
export const getEdgeWarningLevel = (
	edgeId: string,
	workflow: AgentWorkflow | undefined
): EdgeWarningLevel => {
	if (!workflow) return 'none';

	const edge = workflow.edges[edgeId];
	if (!edge) return 'none';

	// If edge source is a START node, never warn about it
	const sourceNode = workflow.nodes[edge.source];
	if (sourceNode && sourceNode.type === 'start') return 'none';

	// Check if edge has ANY condition
	const hasForwardCondition = edge.forwardCondition !== undefined;
	const hasBackwardCondition = edge.backwardCondition !== undefined;

	// ERROR: No conditions at all
	if (!hasForwardCondition && !hasBackwardCondition) {
		return 'error';
	}

	// NONE: Has proper condition configuration
	return 'none';
};
