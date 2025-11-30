import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useCampaignContactListStore } from '../campaignContactListStore';

describe('useCampaignContactListStore', () => {
	beforeEach(() => {
		act(() => {
			useCampaignContactListStore.setState({
				rightComponent: null,
			});
		});
	});

	it('should have initial state', () => {
		const state = useCampaignContactListStore.getState();
		expect(state.rightComponent).toBeNull();
	});

	it('should set right component', () => {
		const mockComponent = 'Test Component';
		act(() => {
			useCampaignContactListStore.getState().setRightComponent(mockComponent);
		});
		expect(useCampaignContactListStore.getState().rightComponent).toBe(
			mockComponent
		);
	});
});
