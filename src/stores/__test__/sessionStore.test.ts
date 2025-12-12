import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useSessionStore } from '../sessionStore';
import type { UserModel } from '~/models/UserModels';
import type { TargetClient } from '~/api/authApi';

describe('useSessionStore', () => {
	beforeEach(() => {
		act(() => {
			useSessionStore.getState().clearUser();
			useSessionStore.getState().setToken(null);
		});
		try {
			window.sessionStorage.clear();
		} catch {}
	});

	it('should have initial state', () => {
		const state = useSessionStore.getState();
		expect(state.user).toBeNull();
		expect(state.token).toBeNull();
		expect(state.targetClient).toBeNull();
	});

	it('should set token', () => {
		act(() => {
			useSessionStore.getState().setToken('token-123');
		});
		expect(useSessionStore.getState().token).toBe('token-123');
		expect(window.sessionStorage.getItem('accessToken')).toBe('token-123');
	});

	it('should set user', () => {
		const mockUser = { id: 1, name: 'User' } as unknown as UserModel;
		act(() => {
			useSessionStore.getState().setUser(mockUser);
		});
		expect(useSessionStore.getState().user).toEqual(mockUser);
	});

	it('should set target client', () => {
		const mockClient = { id: 1 } as TargetClient;
		act(() => {
			useSessionStore.getState().setTargetClient(mockClient);
		});
		expect(useSessionStore.getState().targetClient).toEqual(mockClient);
	});

	it('should clear user', () => {
		act(() => {
			useSessionStore.getState().setUser({ id: 1 } as UserModel);
			useSessionStore.getState().setTargetClient({ id: 1 } as TargetClient);
		});
		act(() => {
			useSessionStore.getState().clearUser();
		});
		const state = useSessionStore.getState();
		expect(state.user).toBeNull();
		expect(state.targetClient).toBeNull();
	});

	it('should clear token', () => {
		act(() => {
			useSessionStore.getState().setToken('token-123');
			useSessionStore.getState().setToken(null);
		});
		expect(useSessionStore.getState().token).toBeNull();
		expect(window.sessionStorage.getItem('accessToken')).toBeNull();
	});
});
