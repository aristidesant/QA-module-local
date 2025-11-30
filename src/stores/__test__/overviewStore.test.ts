import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useOverviewStore } from '../overviewStore';

describe('useOverviewStore', () => {
	beforeEach(() => {
		act(() => {
			useOverviewStore.setState({
				totalCalls: 424456,
				effectiveContact: 23.1,
				noEffectiveContact: 52.5,
				noContact: 24.4,
			});
		});
	});

	it('should have initial state', () => {
		const state = useOverviewStore.getState();
		expect(state.totalCalls).toBe(424456);
		expect(state.effectiveContact).toBe(23.1);
	});

	it('should set call stats', () => {
		const newStats = {
			totalCalls: 100,
			effectiveContact: 10,
			noEffectiveContact: 20,
			noContact: 70,
		};
		act(() => {
			useOverviewStore.getState().setCallStats(newStats);
		});
		const state = useOverviewStore.getState();
		expect(state.totalCalls).toBe(100);
		expect(state.effectiveContact).toBe(10);
		expect(state.noEffectiveContact).toBe(20);
		expect(state.noContact).toBe(70);
	});
});
