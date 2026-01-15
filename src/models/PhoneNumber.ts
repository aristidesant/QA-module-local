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
	// Twilio specific
	sid?: string;
	token?: string;
	// SIP Trunk specific
	terminationUri?: string;
	address?: string;
	transport?: 'auto' | 'udp' | 'tcp' | 'tls' | 'sctp';
	mediaEncryption?: 'disabled' | 'sdes' | 'dtls' | 'allowed' | 'required';
	inboundMediaEncryption?:
		| 'disabled'
		| 'sdes'
		| 'dtls'
		| 'allowed'
		| 'required';
	credentials?: {
		username?: string;
		password?: string;
	};
}
