export interface PhoneNumber {
	id: number;
	identifier: string;
	label: string;
	status: 'Active' | 'Inactive';
	description: string;
	provider: 'twilio' | 'sip_trunk';
	type: 'INBOUND' | 'OUTBOUND' | 'HYBRID';
	phoneNumber: string;
	clientId: number;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}
