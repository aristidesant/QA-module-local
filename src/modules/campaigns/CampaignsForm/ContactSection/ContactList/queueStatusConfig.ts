/**
 * Queue status configuration with color mappings
 */

import type { TFunction } from 'i18next';

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
	description: string;
	color: string;
}

export const QUEUE_STATUS_TRANSLATION_NAMESPACE = 'campaign.contact-list';

export const QUEUE_STATUS_CONFIG: Record<QueueStatus, QueueStatusConfig> = {
	PENDING: {
		label: 'status.pending',
		description: 'status.pendingDesc',
		color: 'gray',
	},
	RUNNING: {
		label: 'status.running',
		description: 'status.runningDesc',
		color: 'blue',
	},
	WAITING: {
		label: 'status.waiting',
		description: 'status.waitingDesc',
		color: 'orange',
	},
	PAUSED: {
		label: 'status.paused',
		description: 'status.pausedDesc',
		color: 'yellow',
	},
	FAILED: {
		label: 'status.failed',
		description: 'status.failedDesc',
		color: 'red',
	},
	EXECUTED: {
		label: 'status.executed',
		description: 'status.executedDesc',
		color: 'grape',
	},
	COMPLETED: {
		label: 'status.complete',
		description: 'status.completeDesc',
		color: 'green',
	},
	UNKNOWN: {
		label: 'status.unknown',
		description: 'status.unknownDesc',
		color: 'gray',
	},
};

export const getQueueStatusConfig = (
	status?: string | null
): QueueStatusConfig => {
	const normalizedStatus = status?.toUpperCase() as QueueStatus | undefined;
	const config = normalizedStatus
		? QUEUE_STATUS_CONFIG[normalizedStatus]
		: undefined;
	return config || QUEUE_STATUS_CONFIG.UNKNOWN;
};

export const getTranslatedQueueStatus = (
	t: TFunction,
	status?: string | null
) => {
	const config = getQueueStatusConfig(status);

	return {
		...config,
		label: t(config.label, {
			ns: QUEUE_STATUS_TRANSLATION_NAMESPACE,
		}),
		description: t(config.description, {
			ns: QUEUE_STATUS_TRANSLATION_NAMESPACE,
		}),
	};
};
