/**
 * Queue status configuration with color mappings
 */

export type QueueStatus =
	| 'PENDING'
	| 'RUNNING'
	| 'WAITING'
	| 'PAUSED'
	| 'FAILED'
	| 'EXECUTED'
	| 'COMPLETED'
	| 'UNKNOWN';

export interface QueueStatusConfig {
	label: string;
	color: string;
}

export const QUEUE_STATUS_CONFIG: Record<QueueStatus, QueueStatusConfig> = {
	PENDING: {
		label: 'status.pending',
		color: 'gray',
	},
	RUNNING: {
		label: 'status.running',
		color: 'blue',
	},
	WAITING: {
		label: 'status.waiting',
		color: 'orange',
	},
	PAUSED: {
		label: 'status.paused',
		color: 'yellow',
	},
	FAILED: {
		label: 'status.failed',
		color: 'red',
	},
	EXECUTED: {
		label: 'status.executed',
		color: 'grape',
	},
	COMPLETED: {
		label: 'status.complete',
		color: 'green',
	},
	UNKNOWN: {
		label: 'status.unknown',
		color: 'gray',
	},
};

export const getQueueStatusConfig = (status: string): QueueStatusConfig => {
	const normalizedStatus = status?.toUpperCase() as QueueStatus | undefined;
	const config = normalizedStatus
		? QUEUE_STATUS_CONFIG[normalizedStatus]
		: undefined;
	return config || QUEUE_STATUS_CONFIG.UNKNOWN;
};
