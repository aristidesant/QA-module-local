export interface WorkflowContextMenuProps {
	x: number;
	y: number;
	nodeId?: string;
	edgeId?: string;
	onClose: () => void;
	onStyleClick?: (nodeId: string, nodeLabel: string) => void;
}
