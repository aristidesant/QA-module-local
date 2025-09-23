export interface ClientModel {
	id: number;
	identifier: string;
	name: string;
	description?: string;
	email?: string;
	phone?: string;
	address?: string;
	rnc?: string;
	userId?: number | null;
	countryId?: number | null;
	createdAt: string | Date;
	updatedAt: string | Date;
	deletedAt: string | Date | null;
}

export interface CreateClientRequest {
	name: string;
	description?: string;
	email?: string;
	phone?: string;
	address?: string;
	rnc?: string;
	userId?: number | null;
	countryId?: number | null;
	apiKey?: string;
}

export interface UpdateClientRequest {
	name?: string;
	description?: string;
	email?: string;
	phone?: string;
	address?: string;
	rnc?: string;
	userId?: number | null;
	countryId?: number | null;
}
