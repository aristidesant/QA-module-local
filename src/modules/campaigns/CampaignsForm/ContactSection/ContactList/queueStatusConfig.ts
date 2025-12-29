/**
 * Queue status configuration with color mappings
 */

export type QueueStatus =
	| 'PENDING'
	| 'RUNNING'
	| 'PAUSED'
	| 'FAILED'
	| 'EXECUTED'
	| 'COMPLETED';

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
};

export const getQueueStatusConfig = (status: string): QueueStatusConfig => {
	const config = QUEUE_STATUS_CONFIG[status as QueueStatus];
	return config || QUEUE_STATUS_CONFIG.PENDING;
};
