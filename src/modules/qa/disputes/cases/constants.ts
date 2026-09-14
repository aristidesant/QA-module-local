import type { DisputeStatus } from '~/models/qa/disputeCases';

export const STATUS_COLOR: Record<DisputeStatus, string> = {
	open: 'blue',
	accepted: 'green',
	rejected: 'red',
};

export const TEAMS = ['Team 1', 'Team 2', 'Team 3'];

/** Minimum characters before the agent can submit, and before a reject is allowed. */
export const MIN_AGENT_COMMENT = 20;
export const MIN_MANAGER_COMMENT = 10;
