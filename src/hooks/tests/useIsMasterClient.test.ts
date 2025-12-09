import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MASTER_CLIENT_ID } from '~/constants/client';
import { useSessionStore } from '~/stores/sessionStore';
import { useIsMasterClient } from '../useIsMasterClient';

vi.mock('~/stores/sessionStore', () => ({
	useSessionStore: vi.fn(),
}));

describe('useIsMasterClient', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns true when the user belongs to the master client', () => {
		vi.mocked(useSessionStore).mockReturnValue({
			user: { clientId: MASTER_CLIENT_ID },
		});

		const { result } = renderHook(() => useIsMasterClient());

		expect(result.current).toBe(true);
	});

	it('returns false when the user belongs to a different client', () => {
		vi.mocked(useSessionStore).mockReturnValue({
			user: { clientId: MASTER_CLIENT_ID + 1 },
		});

		const { result } = renderHook(() => useIsMasterClient());

		expect(result.current).toBe(false);
	});

	it('returns false when no user is present', () => {
		vi.mocked(useSessionStore).mockReturnValue({
			user: null,
		});

		const { result } = renderHook(() => useIsMasterClient());

		expect(result.current).toBe(false);
	});
});
