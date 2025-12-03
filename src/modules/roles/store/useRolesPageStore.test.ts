import useRolesPageStore from './useRolesPageStore';
import { describe, it, expect, afterEach } from 'vitest';

describe('useRolesPageStore', () => {
	afterEach(() => {
		// Reset store state
		useRolesPageStore.setState({ rightComponent: null });
	});

	it('sets and clears rightComponent', () => {
		const comp = '<div />';
		useRolesPageStore.getState().setRightComponent(comp as any);
		expect(useRolesPageStore.getState().rightComponent).toBe(comp);

		useRolesPageStore.getState().clearRightComponent();
		expect(useRolesPageStore.getState().rightComponent).toBeNull();
	});
});

export {};
