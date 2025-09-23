import axios from 'axios';
import { DEFAULT_API_URL } from './config';

export type AuthRequest = {
	username: string;
	password: string;
	loginType?: 'USER_PASS' | 'LDAP';
};

export interface MFALoginResponse {
	message: string;
	accessToken: any;
	userId: number;
	loginType: string;
	otpEnabled: boolean;
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

export async function verifyOTP(
	payload: OTPVerifyRequest
): Promise<{ accessToken: string }> {
	const response = await axios.post<{ accessToken: string }>(
		`${DEFAULT_API_URL}/auth/verify-otp`,
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
