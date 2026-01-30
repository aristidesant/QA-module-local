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
	supportsInbound?: boolean;
	supportsOutbound?: boolean;
	// Twilio specific
	sid?: string;
	token?: string;
	regionConfig?: {
		regionId?: 'us1' | 'ie1' | 'au1';
		token?: string;
		edgeLocation?:
			| 'ashburn'
			| 'dublin'
			| 'frankfurt'
			| 'sao-paulo'
			| 'singapore'
			| 'sydney'
			| 'tokyo'
			| 'umatilla'
			| 'roaming';
	};
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
	inboundTrunkConfig?: {
		allowedAddresses?: string[];
		allowedNumbers?: string[];
		mediaEncryption?: 'disabled' | 'allowed' | 'required';
		credentials?: {
			username?: string;
			password?: string;
		};
	};
	outboundTrunkConfig?: {
		address?: string;
		transport?: 'auto' | 'udp' | 'tcp' | 'tls';
		mediaEncryption?: 'disabled' | 'allowed' | 'required';
		headers?: Record<string, string> | null;
		credentials?: {
			username?: string;
			password?: string;
		};
	};
}
