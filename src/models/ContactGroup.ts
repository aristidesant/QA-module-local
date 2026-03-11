import { Scheduler } from './SchedulerModel';

export type ContactGroupQueueStatus =
	| 'PENDING'
	| 'RUNNING'
	| 'WAITING'
	| 'PAUSED'
	| 'FAILED'
	| 'EXECUTED'
	| 'COMPLETED';

/**
 * Represents a contact group in the system
 */
export default interface ContactGroup {
	id: number;
	name: string;
	description?: string;
	campaignId: number;
	createdAt: string;
	scheduleId: number;
	schedule?: Scheduler;
	queueStatus: ContactGroupQueueStatus;
	isActive: boolean;
	currentWave?: number;
	maxWaves?: number;
	waveExecutionDelaySeconds?: number | null;
	nextWaveScheduledAt?: string | null;
	lastWaveStartedAt?: string | null;
	lastWaveCompletedAt?: string | null;
	contactCount: number;
	expirationDate: string;
	maxCallsPerContact: number;
	maxCallsPerList: number;
	humanEquivalent: number;
}
