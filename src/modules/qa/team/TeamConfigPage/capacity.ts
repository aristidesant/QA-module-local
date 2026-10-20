import { DEFAULT_TEAM_TARGET_SIZE } from '../constants';

export type CapacityState = 'under' | 'at' | 'over';

export interface Capacity {
	count: number;
	target: number;
	/** 0..100, capped so the bar never overflows. */
	percent: number;
	state: CapacityState;
	/** Agents over the target (state 'over') or open seats (state 'under'); 0 when at target. */
	diff: number;
	/** Mantine color for the bar and the count. */
	color: string;
}

export function teamCapacity(count: number, targetSize?: number): Capacity {
	const target = targetSize ?? DEFAULT_TEAM_TARGET_SIZE;
	const state: CapacityState =
		count > target ? 'over' : count === target ? 'at' : 'under';
	return {
		count,
		target,
		percent: Math.min(100, Math.round((count / Math.max(1, target)) * 100)),
		state,
		diff: Math.abs(count - target),
		color: state === 'over' ? 'amber' : state === 'at' ? 'green' : 'blue',
	};
}
