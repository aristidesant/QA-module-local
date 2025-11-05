/**
 * Represents a contact group in the system
 */
export default interface ContactGroup {
	id: number;
	name: string;
	description: string;
	campaignId: number;
	scheduleId: number;
	queueStatus: string;
	isActive: boolean;
	contactCount: number;
	expirationDate: string;
	maxCallsPerContact: number;
	maxCallsPerList: number;
	humanEquivalent: number;
}
