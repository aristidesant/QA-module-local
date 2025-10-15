export interface ClientConfig {
	id: number;
	name: string;
	description: string;
	value: string;
	type: string;
	clientId: number;
	userId: number;
	createdAt: string;
	updatedAt: string;
}

export interface CreateClientConfig {
	name: string;
	description: string;
	value: string;
	type: string;
}

export interface UpdateClientConfig {
	description: string;
	value: string;
	type: string;
}

export interface ContactColumnMapping {
	name: string;
	label: string;
}
