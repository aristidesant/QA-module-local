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
		label: 'Pending',
		color: 'gray',
	},
	RUNNING: {
		label: 'Running',
		color: 'blue',
	},
	PAUSED: {
		label: 'Paused',
		color: 'yellow',
	},
	FAILED: {
		label: 'Failed',
		color: 'red',
	},
	EXECUTED: {
		label: 'Executed',
		color: 'grape',
	},
	COMPLETED: {
		label: 'Completed',
		color: 'green',
	},
};

export const getQueueStatusConfig = (status: string): QueueStatusConfig => {
	const config = QUEUE_STATUS_CONFIG[status as QueueStatus];
	return config || QUEUE_STATUS_CONFIG.PENDING;
};
