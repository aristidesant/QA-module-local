import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { usePasswordResetStore } from '../passwordResetStore';

describe('usePasswordResetStore', () => {
	beforeEach(() => {
		act(() => {
			usePasswordResetStore.getState().clearPendingCredentials();
		});
	});

	it('should have initial state', () => {
		const state = usePasswordResetStore.getState();
		expect(state.pendingUsername).toBeNull();
		expect(state.pendingLoginType).toBe('USER_PASS');
	});

	it('should set pending credentials', () => {
		act(() => {
			usePasswordResetStore.getState().setPendingCredentials('user', 'LDAP');
		});
		const state = usePasswordResetStore.getState();
		expect(state.pendingUsername).toBe('user');
		expect(state.pendingLoginType).toBe('LDAP');
	});

	it('should clear pending credentials', () => {
		act(() => {
			usePasswordResetStore.getState().setPendingCredentials('user', 'LDAP');
		});
		act(() => {
			usePasswordResetStore.getState().clearPendingCredentials();
		});
		const state = usePasswordResetStore.getState();
		expect(state.pendingUsername).toBeNull();
		expect(state.pendingLoginType).toBe('USER_PASS');
	});
});
