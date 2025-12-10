export interface ClientConfig {
	id: number;
	name: string;
	description: string;
	value: string;
	type: string;
	clientId: number | null;
	userId: number;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

export interface ClientConfigResponse {
	configs: ClientConfig[];
	total: number;
	limit: number;
	offset: number;
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
