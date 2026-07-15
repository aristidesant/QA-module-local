import type { DispositionNode } from '~/models/DispositionNodeModel';
import { findNodeById } from '~/utils/dragDropUtils';

export type TreeSelectionState = 'checked' | 'indeterminate' | 'unchecked';

export function getActiveChildren(node: DispositionNode): DispositionNode[] {
	return (node.children ?? []).filter((child) => child.isActive !== false);
}

export function getActiveLeafIds(node: DispositionNode): number[] {
	const children = getActiveChildren(node);
	if (children.length === 0) {
		return node.children?.length ? [] : [node.id];
	}
	return children.flatMap(getActiveLeafIds);
}

export function getAllActiveLeafIds(nodes: DispositionNode[]): number[] {
	return nodes
		.filter((node) => node.isActive !== false)
		.flatMap(getActiveLeafIds);
}

export function getSelectedLeafIds(
	catalogNodes: DispositionNode[],
	flowNodes: DispositionNode[]
): Set<number> {
	return new Set(
		getAllActiveLeafIds(catalogNodes).filter((id) =>
			Boolean(findNodeById(flowNodes, id))
		)
	);
}

export function getTreeSelectionState(
	node: DispositionNode,
	selectedLeafIds: Set<number>
): TreeSelectionState {
	const leafIds = getActiveLeafIds(node);
	const selectedCount = leafIds.filter((id) => selectedLeafIds.has(id)).length;

	if (selectedCount === 0) return 'unchecked';
	if (selectedCount === leafIds.length) return 'checked';
	return 'indeterminate';
}

function preserveBehaviorFlags(
	catalogNode: DispositionNode,
	flowNode: DispositionNode | null
): DispositionNode {
	if (!flowNode) return catalogNode;

	return {
		...catalogNode,
		doNotCall:
			flowNode.doNotCall ?? flowNode.do_not_call ?? catalogNode.doNotCall,
		do_not_call: flowNode.do_not_call ?? catalogNode.do_not_call,
		requiresReschedule:
			flowNode.requiresReschedule ?? catalogNode.requiresReschedule,
		isInvalidatesNumber:
			flowNode.isInvalidatesNumber ?? catalogNode.isInvalidatesNumber,
		isAbandoned: flowNode.isAbandoned ?? catalogNode.isAbandoned,
		isFinal: flowNode.isFinal ?? catalogNode.isFinal,
		isVoiceMail: flowNode.isVoiceMail ?? catalogNode.isVoiceMail,
		is_voice_mail: flowNode.is_voice_mail ?? catalogNode.is_voice_mail,
	};
}

export function rebuildFlowSelection(
	catalogNodes: DispositionNode[],
	selectedLeafIds: Set<number>,
	currentFlowNodes: DispositionNode[]
): DispositionNode[] {
	const rebuildNode = (
		catalogNode: DispositionNode
	): DispositionNode | null => {
		if (catalogNode.isActive === false) return null;

		const activeChildren = getActiveChildren(catalogNode);
		const currentFlowNode = findNodeById(currentFlowNodes, catalogNode.id);
		const baseNode = preserveBehaviorFlags(catalogNode, currentFlowNode);

		if (activeChildren.length === 0) {
			return selectedLeafIds.has(catalogNode.id)
				? { ...baseNode, children: [] }
				: null;
		}

		const selectedChildren = activeChildren
			.map(rebuildNode)
			.filter((child): child is DispositionNode => Boolean(child));

		if (selectedChildren.length === 0) return null;
		return { ...baseNode, children: selectedChildren };
	};

	return catalogNodes
		.filter((node) => node.isActive !== false)
		.map(rebuildNode)
		.filter((node): node is DispositionNode => Boolean(node));
}
