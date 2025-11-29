import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import {
	authenticate,
	signUp,
	verifyOTP,
	impersonateClient,
	endImpersonation,
	changePassword,
	enableMFA,
	verifyAndEnableMFA,
	disableMFA,
} from '../authApi';
import {
	resetAxiosMocks,
	createMockResponse,
	createMockAxiosError,
} from './setup';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('authApi', () => {
	beforeEach(() => {
		resetAxiosMocks();
	});

	describe('authenticate', () => {
		it('should authenticate user with credentials', async () => {
			const credentials = {
				username: 'testuser',
				password: 'password123',
				loginType: 'USER_PASS' as const,
			};
			const mockResponse = {
				message: 'Login successful',
				accessToken: 'mock-token',
				userId: 1,
				loginType: 'USER_PASS',
				otpEnabled: false,
			};
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await authenticate(credentials);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/auth/login`,
				credentials
			);
			expect(result).toEqual(mockResponse);
		});

		it('should authenticate with custom API URL', async () => {
			const credentials = { username: 'testuser', password: 'password123' };
			const customApiUrl = 'http://custom-api.example.com';
			const mockResponse = {
				message: 'Login successful',
				accessToken: 'mock-token',
				userId: 1,
				loginType: 'USER_PASS',
				otpEnabled: false,
			};
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			await authenticate(credentials, customApiUrl);

			expect(axios.post).toHaveBeenCalledWith(
				`${customApiUrl}/auth/login`,
				credentials
			);
		});

		it('should throw error on invalid credentials', async () => {
			const credentials = { username: 'testuser', password: 'wrongpassword' };
			const error = createMockAxiosError('Invalid credentials', 401);
			(axios.post as Mock).mockRejectedValue(error);

			await expect(authenticate(credentials)).rejects.toThrow(
				'Invalid credentials'
			);
		});
	});

	describe('signUp', () => {
		it('should register a new user', async () => {
			const signUpData = {
				username: 'newuser',
				email: 'newuser@example.com',
				password: 'password123',
				firstName: 'John',
				lastName: 'Doe',
			};
			const mockResponse = { message: 'User created', userId: 123 };
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await signUp(signUpData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/auth/sign-up`,
				signUpData
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error if username already exists', async () => {
			const signUpData = {
				username: 'existinguser',
				email: 'user@example.com',
				password: 'password123',
			};
			const error = createMockAxiosError('Username already exists', 409);
			(axios.post as Mock).mockRejectedValue(error);

			await expect(signUp(signUpData)).rejects.toThrow(
				'Username already exists'
			);
		});
	});

	describe('verifyOTP', () => {
		it('should verify OTP and return access token', async () => {
			const payload = { userId: 1, otp: '123456' };
			const mockResponse = { accessToken: 'verified-token' };
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await verifyOTP(payload);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/auth/verify-otp`,
				payload
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error on invalid OTP', async () => {
			const payload = { userId: 1, otp: 'wrong-otp' };
			const error = createMockAxiosError('Invalid OTP', 400);
			(axios.post as Mock).mockRejectedValue(error);

			await expect(verifyOTP(payload)).rejects.toThrow('Invalid OTP');
		});
	});

	describe('impersonateClient', () => {
		it('should impersonate a client successfully', async () => {
			const payload = { targetClientId: 10 };
			const mockResponse = {
				accessToken: 'impersonated-token',
				user: {
					sub: '123',
					userId: 1,
					clientId: 10,
					email: 'user@example.com',
					username: 'testuser',
					roles: ['ADMIN'],
					permissions: ['READ'],
					originalClientId: 1,
					impersonatedAt: '2025-01-01T00:00:00Z',
					employeeId: null,
					mfaEnabled: false,
				},
				targetClient: { id: 10, name: 'Target Client' },
				roles: ['ADMIN'],
				permissions: ['READ'],
			};
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await impersonateClient(payload);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/auth/impersonate-client`,
				payload
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('endImpersonation', () => {
		it('should end impersonation successfully', async () => {
			const mockResponse = {
				accessToken: 'original-token',
				message: 'Impersonation ended',
				user: {
					sub: '123',
					userId: 1,
					clientId: 1,
					email: 'user@example.com',
					username: 'testuser',
					roles: ['ADMIN'],
					permissions: ['READ'],
					originalClientId: null,
					impersonatedAt: null,
					employeeId: null,
					mfaEnabled: false,
				},
				originalClientId: 1,
			};
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await endImpersonation();

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/auth/end-impersonation`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('changePassword', () => {
		it('should change password successfully', async () => {
			const payload = {
				currentPassword: 'oldpassword',
				newPassword: 'newpassword123',
			};
			const mockResponse = { message: 'Password changed successfully' };
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await changePassword(payload);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/auth/change-password`,
				payload
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error on incorrect current password', async () => {
			const payload = {
				currentPassword: 'wrongpassword',
				newPassword: 'newpassword123',
			};
			const error = createMockAxiosError('Current password is incorrect', 400);
			(axios.post as Mock).mockRejectedValue(error);

			await expect(changePassword(payload)).rejects.toThrow(
				'Current password is incorrect'
			);
		});
	});

	describe('MFA Management', () => {
		describe('enableMFA', () => {
			it('should enable MFA and return QR code', async () => {
				const payload = { password: 'password123' };
				const mockResponse = {
					qrCodeUrl: 'data:image/png;base64,...',
					secret: 'ABCD1234SECRET',
				};
				(axios.post as Mock).mockResolvedValue(
					createMockResponse(mockResponse)
				);

				const result = await enableMFA(payload);

				expect(axios.post).toHaveBeenCalledWith(
					`${TEST_API_URL}/auth/mfa/enable`,
					payload
				);
				expect(result).toEqual(mockResponse);
			});
		});

		describe('verifyAndEnableMFA', () => {
			it('should verify and enable MFA', async () => {
				const payload = { code: '123456' };
				const mockResponse = { message: 'MFA enabled successfully' };
				(axios.post as Mock).mockResolvedValue(
					createMockResponse(mockResponse)
				);

				const result = await verifyAndEnableMFA(payload);

				expect(axios.post).toHaveBeenCalledWith(
					`${TEST_API_URL}/auth/mfa/verify`,
					payload
				);
				expect(result).toEqual(mockResponse);
			});

			it('should throw error on invalid verification code', async () => {
				const payload = { code: 'invalid' };
				const error = createMockAxiosError('Invalid verification code', 400);
				(axios.post as Mock).mockRejectedValue(error);

				await expect(verifyAndEnableMFA(payload)).rejects.toThrow(
					'Invalid verification code'
				);
			});
		});

		describe('disableMFA', () => {
			it('should disable MFA', async () => {
				const payload = { password: 'password123' };
				const mockResponse = { message: 'MFA disabled successfully' };
				(axios.post as Mock).mockResolvedValue(
					createMockResponse(mockResponse)
				);

				const result = await disableMFA(payload);

				expect(axios.post).toHaveBeenCalledWith(
					`${TEST_API_URL}/auth/mfa/disable`,
					payload
				);
				expect(result).toEqual(mockResponse);
			});
		});
	});
});
