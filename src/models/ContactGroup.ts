import { Scheduler } from './SchedulerModel';

export type ContactGroupQueueStatus =
	| 'PENDING'
	| 'RUNNING'
	| 'WAITING'
	| 'PAUSED'
	| 'FAILED'
	| 'EXECUTED'
	| 'COMPLETED';

export interface CampaignContactList {
	id: number;
	name: string;
	createAt: string;
}

export interface CampaignContactListsParams {
	isActive?: boolean | 0 | 1 | 'true' | 'false' | '1' | '0';
}

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
