export interface Contact {
	id: number;
	firstName: string;
	lastName: string;
	identifier: string;
	identifierType: "PERSONAL_ID" | string;
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
	status: "ACTIVE" | "INACTIVE" | string;
}
