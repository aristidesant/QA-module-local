import axios from 'axios';
import type { UserModel } from '~/models/UserModels';
import { DEFAULT_API_URL } from './config';

export type AuthRequest = {
	username: string;
	password: string;
	loginType?: 'USER_PASS' | 'LDAP';
};

export type SignUpRequest = {
	username: string;
	email: string;
	password: string;
	firstName?: string;
	lastName?: string;
};

/** Client option returned when user has access to multiple clients */
export interface ClientSelectOption {
	clientId: number;
	clientName: string;
	clientIdentifier: string;
	roles: string[];
}

export interface MFALoginResponse {
	message: string;
	accessToken: any;
	refreshToken?: string;
	userId: number;
	loginType: string;
	otpEnabled: boolean;
	needToChangePassword?: boolean;
	user?: UserModel;
	/** True if user has access to multiple clients and must select one */
	requiresClientSelection?: boolean;
	/** Available clients when requiresClientSelection is true */
	availableClients?: ClientSelectOption[];
	/** Pre-auth token for client selection (valid for 10 minutes) */
	preAuthToken?: string;
}

export interface RefreshTokenResponse {
	accessToken: string;
	refreshToken: string;
}

/** Request payload for selecting a client */
export interface SelectClientRequest {
	preAuthToken: string;
	clientId: number;
	otp?: string;
}

/** Response from select-client endpoint */
export interface SelectClientResponse {
	message: string;
	accessToken?: string;
	otpRequired?: boolean;
	userId?: number;
}

export interface OTPVerifyRequest {
	userId: number;
	otp: string;
}

export interface ImpersonateClientRequest {
	targetClientId: number;
}

export interface UserInfo {
	sub: string;
	userId: number;
	clientId: number;
	email: string;
	username: string;
	roles: string[];
	permissions: string[];
	originalClientId: number | null;
	impersonatedAt: string | null;
	employeeId: number | null;
	mfaEnabled: boolean;
}

export interface TargetClient {
	id: number;
	name: string;
}

export interface ImpersonateClientResponse {
	accessToken: string;
	user: UserInfo;
	targetClient: TargetClient;
	roles: string[];
	permissions: string[];
}

export interface EndImpersonationResponse {
	accessToken: string;
	message: string;
	user: UserInfo;
	originalClientId: number;
}

// export type AuthSuccessResponse = {
// 	accessToken: string;
// };

export type AuthErrorResponse = {
	message: string;
	statusCode: number;
};

export async function authenticate(
	credentials: AuthRequest,
	apiUrl: string = DEFAULT_API_URL
): Promise<MFALoginResponse> {
	const response = await axios.post<MFALoginResponse>(
		`${apiUrl}/auth/login`,
		credentials
	);
	return response.data;
}

export async function signUp(
	credentials: SignUpRequest,
	apiUrl: string = DEFAULT_API_URL
): Promise<{ message: string; userId: number }> {
	const response = await axios.post<{ message: string; userId: number }>(
		`${apiUrl}/auth/sign-up`,
		credentials
	);
	return response.data;
}

export async function verifyOTP(
	payload: OTPVerifyRequest
): Promise<{ accessToken: string }> {
	const response = await axios.post<{ accessToken: string }>(
		`${DEFAULT_API_URL}/auth/verify-otp`,
		payload
	);
	return response.data;
}

export async function selectClient(
	payload: SelectClientRequest,
	apiUrl: string = DEFAULT_API_URL
): Promise<SelectClientResponse> {
	const response = await axios.post<SelectClientResponse>(
		`${apiUrl}/auth/select-client`,
		payload
	);
	return response.data;
}

export async function impersonateClient(
	payload: ImpersonateClientRequest,
	apiUrl: string = DEFAULT_API_URL
): Promise<ImpersonateClientResponse> {
	const response = await axios.post<ImpersonateClientResponse>(
		`${apiUrl}/auth/impersonate-client`,
		payload
	);
	return response.data;
}

export async function endImpersonation(
	apiUrl: string = DEFAULT_API_URL
): Promise<EndImpersonationResponse> {
	const response = await axios.post<EndImpersonationResponse>(
		`${apiUrl}/auth/end-impersonation`
	);
	return response.data;
}

/** Response from GET /auth/available-clients */
export interface AvailableClientsResponse {
	availableClients: ClientSelectOption[];
}

/** Request payload for POST /auth/change-client */
export interface ChangeClientRequest {
	clientId: number;
	otp?: string;
}

/** Response from POST /auth/change-client */
export interface ChangeClientResponse {
	message: string;
	accessToken: string | null;
	otpRequired?: boolean;
	userId?: number;
}

export async function getAvailableClients(
	apiUrl: string = DEFAULT_API_URL
): Promise<AvailableClientsResponse> {
	const response = await axios.get<AvailableClientsResponse>(
		`${apiUrl}/auth/available-clients`
	);
	return response.data;
}

export async function changeClient(
	payload: ChangeClientRequest,
	apiUrl: string = DEFAULT_API_URL
): Promise<ChangeClientResponse> {
	const response = await axios.post<ChangeClientResponse>(
		`${apiUrl}/auth/change-client`,
		payload
	);
	return response.data;
}

// Password Change
export interface ChangePasswordPayload {
	currentPassword: string;
	newPassword: string;
}

export async function changePassword(
	payload: ChangePasswordPayload,
	apiUrl: string = DEFAULT_API_URL
): Promise<{ message: string }> {
	const response = await axios.post<{ message: string }>(
		`${apiUrl}/auth/change-password`,
		payload
	);
	return response.data;
}

// MFA Management
export interface EnableMFAResponse {
	qrCodeUrl: string;
	secret: string;
}

export interface VerifyMFAPayload {
	code: string;
}

export async function enableMFA(
	payload: { password: string },
	apiUrl: string = DEFAULT_API_URL
): Promise<EnableMFAResponse> {
	const response = await axios.post<EnableMFAResponse>(
		`${apiUrl}/auth/mfa/enable`,
		payload
	);
	return response.data;
}

export async function verifyAndEnableMFA(
	payload: VerifyMFAPayload,
	apiUrl: string = DEFAULT_API_URL
): Promise<{ message: string }> {
	const response = await axios.post<{ message: string }>(
		`${apiUrl}/auth/mfa/verify`,
		payload
	);
	return response.data;
}

export async function disableMFA(
	payload: { password: string },
	apiUrl: string = DEFAULT_API_URL
): Promise<{ message: string }> {
	const response = await axios.post<{ message: string }>(
		`${apiUrl}/auth/mfa/disable`,
		payload
	);
	return response.data;
}

export async function refreshAccessToken(
	refreshToken: string,
	apiUrl: string = DEFAULT_API_URL
): Promise<RefreshTokenResponse> {
	const response = await axios.post<RefreshTokenResponse>(
		`${apiUrl}/auth/refresh`,
		{ refreshToken }
	);
	return response.data;
}
