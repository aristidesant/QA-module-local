export interface UserModel {
	id: number;
	email: string;
	username: string;
	status: string;
	clientId: number;
	createdAt: string | Date;
	updatedAt: string | Date;
	deletedAt: string | Date | null;
	mfaEnabled?: boolean;
}

export interface ImpersonatedClient {
	sub: number;
	email: string;
	username: string;
	clientId: number;
	roles: any[];
	permissions: any[];
	originalClientId: number;
	impersonatedAt: string;
	iat: number;
	exp: number;
}
