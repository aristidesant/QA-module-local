import { useCallback, type Dispatch, type SetStateAction } from 'react';
import type { Node } from '@xyflow/react';
import { WORKFLOW_NODE_TYPES } from '../../nodeTypes';

/**
 * Default node dimensions when measured sizes are unavailable.
 */
const DEFAULT_WIDTH = 200;
const DEFAULT_HEIGHT = 80;

interface CollisionOptions {
	/** Maximum iterations for convergence. */
	maxIterations: number;
	/** Minimum overlap (px) to trigger a push-apart. */
	overlapThreshold: number;
	/** Extra margin (px) around each node bounding box. */
	margin: number;
}

const DEFAULT_OPTIONS: CollisionOptions = {
	maxIterations: 10,
	overlapThreshold: 0.5,
	margin: 15,
};

interface Box {
	x: number;
	y: number;
	width: number;
	height: number;
	moved: boolean;
	node: Node;
}

/**
 * Build bounding boxes from nodes, expanding each by `margin` on every side.
 */
const getBoxesFromNodes = (nodes: Node[], margin: number): Box[] =>
	nodes.map((node) => {
		const width =
			(node.measured?.width ?? node.width ?? DEFAULT_WIDTH) + margin * 2;
		const height =
			(node.measured?.height ?? node.height ?? DEFAULT_HEIGHT) + margin * 2;
		return {
			x: node.position.x - margin,
			y: node.position.y - margin,
			width,
			height,
			moved: false,
			node,
		};
	});

/**
 * Naive O(n²) collision resolution – check every pair, push apart along
 * the axis of smallest overlap.  Runs until convergence or maxIterations.
 */
const resolveBoxes = (
	boxes: Box[],
	{ maxIterations, overlapThreshold }: Omit<CollisionOptions, 'margin'>
): void => {
	for (let iter = 0; iter < maxIterations; iter++) {
		let moved = false;

		for (let i = 0; i < boxes.length; i++) {
			for (let j = i + 1; j < boxes.length; j++) {
				const A = boxes[i];
				const B = boxes[j];

				const centerAX = A.x + A.width * 0.5;
				const centerAY = A.y + A.height * 0.5;
				const centerBX = B.x + B.width * 0.5;
				const centerBY = B.y + B.height * 0.5;

				const dx = centerAX - centerBX;
				const dy = centerAY - centerBY;

				const px = (A.width + B.width) * 0.5 - Math.abs(dx);
				const py = (A.height + B.height) * 0.5 - Math.abs(dy);

				if (px > overlapThreshold && py > overlapThreshold) {
					moved = true;
					A.moved = true;
					B.moved = true;

					if (px < py) {
						const sx = dx > 0 ? 1 : -1;
						const moveAmount = (px / 2) * sx;
						A.x += moveAmount;
						B.x -= moveAmount;
					} else {
						const sy = dy > 0 ? 1 : -1;
						const moveAmount = (py / 2) * sy;
						A.y += moveAmount;
						B.y -= moveAmount;
					}
				}
			}
		}

		if (!moved) break;
	}
};

/**
 * Clamp group-child boxes so they stay within their parent bounds after
 * collision resolution.
 */
const clampChildrenToGroup = (
	childBoxes: Box[],
	groupNode: Node,
	margin: number
): void => {
	const PADDING = 40;
	const LABEL_OFFSET = 32;

	const groupWidth =
		typeof groupNode.style?.width === 'number'
			? groupNode.style.width
			: (groupNode.measured?.width ?? 400);
	const groupHeight =
		typeof groupNode.style?.height === 'number'
			? groupNode.style.height
			: (groupNode.measured?.height ?? 300);

	for (const box of childBoxes) {
		const nodeWidth = box.width - margin * 2;
		const nodeHeight = box.height - margin * 2;

		// Positions are group-relative (x/y already relative to group origin)
		const nodeX = box.x + margin;
		const nodeY = box.y + margin;

		const clampedX = Math.max(
			PADDING,
			Math.min(nodeX, groupWidth - nodeWidth - PADDING)
		);
		const clampedY = Math.max(
			LABEL_OFFSET + PADDING,
			Math.min(nodeY, groupHeight - nodeHeight - PADDING)
		);

		if (clampedX !== nodeX || clampedY !== nodeY) {
			box.x = clampedX - margin;
			box.y = clampedY - margin;
			box.moved = true;
		}
	}
};

/**
 * Resolve node overlaps for all top-level (non-grouped) nodes and,
 * independently, for the children inside each group.
 */
export const resolveCollisions = (
	nodes: Node[],
	options: Partial<CollisionOptions> = {}
): Node[] => {
	const opts = { ...DEFAULT_OPTIONS, ...options };
	const { margin, maxIterations, overlapThreshold } = opts;

	// ── Partition nodes by role ──
	const topLevelNodes: Node[] = [];
	const groupNodes: Node[] = [];
	const childrenByGroup = new Map<string, Node[]>();

	for (const node of nodes) {
		if (node.type === WORKFLOW_NODE_TYPES.GROUP) {
			groupNodes.push(node);
			if (!childrenByGroup.has(node.id)) {
				childrenByGroup.set(node.id, []);
			}
		} else if (node.parentId) {
			const siblings = childrenByGroup.get(node.parentId) ?? [];
			siblings.push(node);
			childrenByGroup.set(node.parentId, siblings);
		} else {
			topLevelNodes.push(node);
		}
	}

	// ── Resolve top-level nodes + group nodes together ──
	const topLevel = [...topLevelNodes, ...groupNodes];
	const topLevelBoxes = getBoxesFromNodes(topLevel, margin);
	resolveBoxes(topLevelBoxes, { maxIterations, overlapThreshold });

	// Build a map of moved top-level/group nodes
	const movedMap = new Map<string, { x: number; y: number }>();
	for (const box of topLevelBoxes) {
		if (box.moved) {
			movedMap.set(box.node.id, {
				x: box.x + margin,
				y: box.y + margin,
			});
		}
	}

	// ── Resolve children within each group independently ──
	for (const group of groupNodes) {
		const children = childrenByGroup.get(group.id);
		if (!children || children.length < 2) continue;

		const childBoxes = getBoxesFromNodes(children, margin);
		resolveBoxes(childBoxes, { maxIterations, overlapThreshold });
		clampChildrenToGroup(childBoxes, group, margin);

		for (const box of childBoxes) {
			if (box.moved) {
				movedMap.set(box.node.id, {
					x: box.x + margin,
					y: box.y + margin,
				});
			}
		}
	}

	// ── No collisions resolved ──
	if (movedMap.size === 0) return nodes;

	// ── Apply resolved positions ──
	return nodes.map((node) => {
		const newPos = movedMap.get(node.id);
		if (!newPos) return node;

		return {
			...node,
			position: newPos,
		};
	});
};

interface UseNodeCollisionsOptions {
	setNodes: Dispatch<SetStateAction<Node[]>>;
	options?: Partial<CollisionOptions>;
}

/**
 * React hook that exposes a stable `resolveNodeCollisions` callback.
 * Call it from `onNodeDragStop` (or after programmatic node additions)
 * to push overlapping nodes apart.
 */
const useNodeCollisions = ({ setNodes, options }: UseNodeCollisionsOptions) => {
	const resolveNodeCollisions = useCallback(() => {
		setNodes((currentNodes) => resolveCollisions(currentNodes, options));
	}, [setNodes, options]);

	return { resolveNodeCollisions };
};

export default useNodeCollisions;
