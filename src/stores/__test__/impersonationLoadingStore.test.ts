import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useImpersonationLoadingStore } from '../impersonationLoadingStore';

describe('useImpersonationLoadingStore', () => {
	beforeEach(() => {
		act(() => {
			useImpersonationLoadingStore.setState({
				isLoading: false,
				message: 'Processing...',
			});
		});
	});

	it('should have initial state', () => {
		const state = useImpersonationLoadingStore.getState();
		expect(state.isLoading).toBe(false);
		expect(state.message).toBe('Processing...');
	});

	it('should set loading with default message', () => {
		act(() => {
			useImpersonationLoadingStore.getState().setLoading(true);
		});
		const state = useImpersonationLoadingStore.getState();
		expect(state.isLoading).toBe(true);
		expect(state.message).toBe('Processing...');
	});

	it('should set loading with custom message', () => {
		act(() => {
			useImpersonationLoadingStore.getState().setLoading(true, 'Loading...');
		});
		const state = useImpersonationLoadingStore.getState();
		expect(state.isLoading).toBe(true);
		expect(state.message).toBe('Loading...');
	});
});
