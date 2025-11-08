import { Scheduler } from './SchedulerModel';

/**
 * Represents a contact group in the system
 */
export default interface ContactGroup {
	id: number;
	name: string;
	description: string;
	campaignId: number;
	createdAt: string;
	scheduleId: number;
	schedule?: Scheduler;
	queueStatus: string;
	isActive: boolean;
	contactCount: number;
	expirationDate: string;
	maxCallsPerContact: number;
	maxCallsPerList: number;
	humanEquivalent: number;
}
