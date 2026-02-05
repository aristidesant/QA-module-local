import { Position } from '@xyflow/react';

export interface HandlePositions {
	sourcePosition: Position;
	targetPosition: Position;
}

export interface Point {
	x: number;
	y: number;
}

/**
 * Calculate optimal handle positions based on relative positions of two nodes.
 * Uses a 45-degree threshold to determine horizontal vs vertical orientation.
 *
 * @param sourceNode - The node that is the source of the connection
 * @param targetNode - The node that is the target of the connection
 * @returns Object with sourcePosition and targetPosition (Position enum values)
 */
export function calculateHandlePositionsFromPoints(
	sourcePoint: Point,
	targetPoint: Point
): HandlePositions {
	const deltaX = targetPoint.x - sourcePoint.x;
	const deltaY = targetPoint.y - sourcePoint.y;

	// Calculate absolute values for comparison
	const absDeltaX = Math.abs(deltaX);
	const absDeltaY = Math.abs(deltaY);

	// Use 45-degree threshold (when |deltaX| > |deltaY|, use horizontal layout)
	if (absDeltaX > absDeltaY) {
		// Horizontal connection: source uses Right, target uses Left (or vice versa)
		return {
			sourcePosition: deltaX > 0 ? Position.Right : Position.Left,
			targetPosition: deltaX > 0 ? Position.Left : Position.Right,
		};
	} else {
		// Vertical connection: source uses Bottom, target uses Top (or vice versa)
		return {
			sourcePosition: deltaY > 0 ? Position.Bottom : Position.Top,
			targetPosition: deltaY > 0 ? Position.Top : Position.Bottom,
		};
	}
}

/**
 * Get the opposite position for a handle.
 * Used to determine the corresponding handle position on the connected node.
 *
 * @param position - The current position
 * @returns The opposite position
 */
export function getOppositePosition(position: Position): Position {
	switch (position) {
		case Position.Top:
			return Position.Bottom;
		case Position.Bottom:
			return Position.Top;
		case Position.Left:
			return Position.Right;
		case Position.Right:
			return Position.Left;
		default:
			return Position.Bottom;
	}
}
