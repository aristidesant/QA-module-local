import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useImpersonationState } from './useImpersonationState';
import { useSessionStore } from '~/stores/sessionStore';

// Mock the sessionStore
vi.mock('~/stores/sessionStore', () => ({
	useSessionStore: vi.fn(),
}));

// Mock jwt-decode
vi.mock('jwt-decode', () => ({
	jwtDecode: vi.fn(),
}));

import { jwtDecode } from 'jwt-decode';

describe('useImpersonationState', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	describe('when targetClient is present in store', () => {
		it('should return isImpersonating as true', () => {
			vi.mocked(useSessionStore).mockReturnValue({
				token: 'some-token',
				targetClient: { id: 123, name: 'Target Client' },
			});

			const { result } = renderHook(() => useImpersonationState());

			expect(result.current.isImpersonating).toBe(true);
		});

		it('should return currentClientId from targetClient', () => {
			vi.mocked(useSessionStore).mockReturnValue({
				token: 'some-token',
				targetClient: { id: 456, name: 'Target Client' },
			});

			const { result } = renderHook(() => useImpersonationState());

			expect(result.current.currentClientId).toBe(456);
		});

		it('should return originalClientId as null', () => {
			vi.mocked(useSessionStore).mockReturnValue({
				token: 'some-token',
				targetClient: { id: 123, name: 'Target Client' },
			});

			const { result } = renderHook(() => useImpersonationState());

			expect(result.current.originalClientId).toBe(null);
		});
	});

	describe('when no token is present', () => {
		it('should return isImpersonating as false', () => {
			vi.mocked(useSessionStore).mockReturnValue({
				token: null,
				targetClient: null,
			});

			const { result } = renderHook(() => useImpersonationState());

			expect(result.current.isImpersonating).toBe(false);
		});

		it('should return null for both clientIds', () => {
			vi.mocked(useSessionStore).mockReturnValue({
				token: null,
				targetClient: null,
			});

			const { result } = renderHook(() => useImpersonationState());

			expect(result.current.originalClientId).toBe(null);
			expect(result.current.currentClientId).toBe(null);
		});
	});

	describe('when token is present but no targetClient (fallback to token decoding)', () => {
		it('should return isImpersonating as true when impersonatedAt is present', () => {
			vi.mocked(useSessionStore).mockReturnValue({
				token: 'valid-token',
				targetClient: null,
			});

			vi.mocked(jwtDecode).mockReturnValue({
				sub: 1,
				email: 'test@example.com',
				username: 'testuser',
				clientId: 200,
				roles: [],
				permissions: [],
				originalClientId: 100,
				impersonatedAt: '2024-01-01T00:00:00Z',
				iat: 1704067200,
				exp: 1704153600,
			});

			const { result } = renderHook(() => useImpersonationState());

			expect(result.current.isImpersonating).toBe(true);
		});

		it('should return isImpersonating as false when impersonatedAt is not present', () => {
			vi.mocked(useSessionStore).mockReturnValue({
				token: 'valid-token',
				targetClient: null,
			});

			vi.mocked(jwtDecode).mockReturnValue({
				sub: 1,
				email: 'test@example.com',
				username: 'testuser',
				clientId: 100,
				roles: [],
				permissions: [],
				iat: 1704067200,
				exp: 1704153600,
			});

			const { result } = renderHook(() => useImpersonationState());

			expect(result.current.isImpersonating).toBe(false);
		});

		it('should return originalClientId from decoded token', () => {
			vi.mocked(useSessionStore).mockReturnValue({
				token: 'valid-token',
				targetClient: null,
			});

			vi.mocked(jwtDecode).mockReturnValue({
				sub: 1,
				email: 'test@example.com',
				username: 'testuser',
				clientId: 200,
				roles: [],
				permissions: [],
				originalClientId: 100,
				impersonatedAt: '2024-01-01T00:00:00Z',
				iat: 1704067200,
				exp: 1704153600,
			});

			const { result } = renderHook(() => useImpersonationState());

			expect(result.current.originalClientId).toBe(100);
		});

		it('should return currentClientId from decoded token', () => {
			vi.mocked(useSessionStore).mockReturnValue({
				token: 'valid-token',
				targetClient: null,
			});

			vi.mocked(jwtDecode).mockReturnValue({
				sub: 1,
				email: 'test@example.com',
				username: 'testuser',
				clientId: 200,
				roles: [],
				permissions: [],
				originalClientId: 100,
				impersonatedAt: '2024-01-01T00:00:00Z',
				iat: 1704067200,
				exp: 1704153600,
			});

			const { result } = renderHook(() => useImpersonationState());

			expect(result.current.currentClientId).toBe(200);
		});

		it('should return null for originalClientId when not present in token', () => {
			vi.mocked(useSessionStore).mockReturnValue({
				token: 'valid-token',
				targetClient: null,
			});

			vi.mocked(jwtDecode).mockReturnValue({
				sub: 1,
				email: 'test@example.com',
				username: 'testuser',
				clientId: 100,
				roles: [],
				permissions: [],
				iat: 1704067200,
				exp: 1704153600,
			});

			const { result } = renderHook(() => useImpersonationState());

			expect(result.current.originalClientId).toBe(null);
		});

		it('should return null for currentClientId when not present in token', () => {
			vi.mocked(useSessionStore).mockReturnValue({
				token: 'valid-token',
				targetClient: null,
			});

			vi.mocked(jwtDecode).mockReturnValue({
				sub: 1,
				email: 'test@example.com',
				username: 'testuser',
				roles: [],
				permissions: [],
				iat: 1704067200,
				exp: 1704153600,
			});

			const { result } = renderHook(() => useImpersonationState());

			expect(result.current.currentClientId).toBe(null);
		});
	});

	describe('when token decoding fails', () => {
		it('should return default non-impersonating state', () => {
			vi.mocked(useSessionStore).mockReturnValue({
				token: 'invalid-token',
				targetClient: null,
			});

			vi.mocked(jwtDecode).mockImplementation(() => {
				throw new Error('Invalid token');
			});

			const { result } = renderHook(() => useImpersonationState());

			expect(result.current.isImpersonating).toBe(false);
			expect(result.current.originalClientId).toBe(null);
			expect(result.current.currentClientId).toBe(null);
		});
	});
});
