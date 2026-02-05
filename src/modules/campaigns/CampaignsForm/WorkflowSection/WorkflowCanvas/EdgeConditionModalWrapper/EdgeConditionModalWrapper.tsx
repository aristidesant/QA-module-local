import { EdgeConditionModal } from '../../forms/EdgeConditionModal';
import type { AgentWorkflow, WorkflowEdge } from '~/models/AgentWorkflowModel';

interface EdgeConditionModalWrapperProps {
	workflow?: AgentWorkflow;
	selectedEdgeId: string | null;
	modalOpened: boolean;
	onClose: () => void;
	onSave: (
		edgeId: string,
		forwardCondition?: WorkflowEdge['forwardCondition'],
		backwardCondition?: WorkflowEdge['backwardCondition']
	) => void;
}

const EdgeConditionModalWrapper = ({
	workflow,
	selectedEdgeId,
	modalOpened,
	onClose,
	onSave,
}: EdgeConditionModalWrapperProps) => {
	const selectedEdge =
		selectedEdgeId && workflow?.edges[selectedEdgeId]
			? workflow.edges[selectedEdgeId]
			: undefined;

	const sourceNode = selectedEdge
		? workflow?.nodes[selectedEdge.source]
		: undefined;
	const targetNode = selectedEdge
		? workflow?.nodes[selectedEdge.target]
		: undefined;
	const sourceNodeType = sourceNode?.type;
	const targetNodeType = targetNode?.type;

	const sourceLabel = sourceNode
		? sourceNode.label || sourceNode.type
		: 'Unknown';
	const targetLabel = targetNode
		? targetNode.label || targetNode.type
		: 'Unknown';

	return (
		<EdgeConditionModal
			key={`${selectedEdgeId ?? 'edge-condition'}-${
				modalOpened ? 'open' : 'closed'
			}`}
			opened={modalOpened}
			edgeId={selectedEdgeId ?? undefined}
			edge={selectedEdge}
			sourceLabel={sourceLabel}
			targetLabel={targetLabel}
			sourceNodeType={sourceNodeType}
			targetNodeType={targetNodeType}
			onClose={onClose}
			onSave={onSave}
		/>
	);
};

export default EdgeConditionModalWrapper;
