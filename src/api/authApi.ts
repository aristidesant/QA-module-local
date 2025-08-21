import axios from "axios";
import { DEFAULT_API_URL } from "./config";

export type AuthRequest = {
	username: string;
	password: string;
	loginType?: "USER_PASS" | "LDAP";
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
