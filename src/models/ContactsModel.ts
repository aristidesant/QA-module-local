export interface Contact {
	id: number;
	firstName: string;
	lastName: string;
	identifier: string;
	identifierType: 'PERSONAL_ID' | string;
	birthDate: string; // ISO date string: YYYY-MM-DD
	address: string;
	phone: string;
	clientId: number;
	userId: number;
	createdAt: string; // ISO datetime string
	updatedAt: string; // ISO datetime string
	contactGroupId: number;
	emails: string[] | null;
	phones: string[];
	phoneNumbers: { phoneNumber: string }[];
	status: 'ACTIVE' | 'INACTIVE' | string;
}

export enum ContactStatus {
	DO_NOT_RESPOND = 'DO_NOT_RESPOND',
	CONTACTED = 'CONTACTED',
	VOICE_MAIL = 'VOICE_MAIL',
	ON_CALL = 'ON_CALL',
	INICATIVE = 'INICATIVE', // Added per requirement (note: spelled as provided)
	DECEASED = 'DECEASED',
	INACTIVE = 'INACTIVE',
	ACTIVE = 'ACTIVE',
}
