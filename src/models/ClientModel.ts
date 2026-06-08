export interface ClientModel {
	id: number;
	identifier: string;
	name: string;
	alias?: string | null;
	description?: string;
	email?: string;
	phone?: string;
	address?: string;
	rnc?: string;
	userId?: number | null;
	countryId?: number | null;
	website?: string | null;
	pocUserId?: number | null;
	invoiceTemplateFileId?: number | null;
	createdAt: string | Date;
	updatedAt: string | Date;
	deletedAt: string | Date | null;
}

export interface CreateClientRequest {
	name: string;
	alias?: string;
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
	alias?: string;
	description?: string;
	email?: string;
	phone?: string;
	address?: string;
	rnc?: string;
	userId?: number | null;
	countryId?: number | null;
	website?: string | null;
	pocUserId?: number | null;
	invoiceTemplateFileId?: number | null;
}
