import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useCampaignsStore } from '../campaignsStore';
import type { Campaign } from '~/models/CampaignsModel';

describe('useCampaignsStore', () => {
	beforeEach(() => {
		act(() => {
			useCampaignsStore.setState({
				editCampaign: false,
				selectedCampaign: null,
				selectedTab: 'agent',
				rightComponent: null,
				contactsVersion: 0,
				selectedVoiceId: undefined,
			});
		});
	});

	it('should have initial state', () => {
		const state = useCampaignsStore.getState();
		expect(state.editCampaign).toBe(false);
		expect(state.selectedCampaign).toBeNull();
		expect(state.selectedTab).toBe('agent');
		expect(state.rightComponent).toBeNull();
		expect(state.contactsVersion).toBe(0);
		expect(state.selectedVoiceId).toBeUndefined();
	});

	it('should set edit campaign', () => {
		act(() => {
			useCampaignsStore.getState().setEditCampaign(true);
		});
		expect(useCampaignsStore.getState().editCampaign).toBe(true);
	});

	it('should select campaign and set tab to agents', () => {
		const mockCampaign = { id: 1, name: 'Test Campaign' } as Campaign;
		act(() => {
			useCampaignsStore.getState().selectCampaign(mockCampaign);
		});
		expect(useCampaignsStore.getState().selectedCampaign).toEqual(mockCampaign);
		expect(useCampaignsStore.getState().selectedTab).toBe('agents');
	});

	it('should set selected tab', () => {
		act(() => {
			useCampaignsStore.getState().setSelectedTab('settings');
		});
		expect(useCampaignsStore.getState().selectedTab).toBe('settings');
	});

	it('should set right component', () => {
		const mockComponent = 'Right Component';
		act(() => {
			useCampaignsStore.getState().setRightComponent(mockComponent);
		});
		expect(useCampaignsStore.getState().rightComponent).toBe(mockComponent);
	});

	it('should invalidate contacts', () => {
		const initialVersion = useCampaignsStore.getState().contactsVersion;
		act(() => {
			useCampaignsStore.getState().invalidateContacts();
		});
		expect(useCampaignsStore.getState().contactsVersion).toBe(
			initialVersion + 1
		);
	});

	it('should set selected voice id', () => {
		act(() => {
			useCampaignsStore.getState().setSelectedVoiceId('voice-123');
		});
		expect(useCampaignsStore.getState().selectedVoiceId).toBe('voice-123');
	});

	it('should reset view', () => {
		// Set some state first
		act(() => {
			useCampaignsStore.setState({
				selectedCampaign: { id: 1 } as Campaign,
				rightComponent: 'Something',
				selectedTab: 'settings',
				editCampaign: true,
				selectedVoiceId: 'voice-123',
			});
		});

		act(() => {
			useCampaignsStore.getState().resetView();
		});

		const state = useCampaignsStore.getState();
		expect(state.selectedCampaign).toBeNull();
		expect(state.rightComponent).toBeNull();
		expect(state.selectedTab).toBe('agents');
		expect(state.editCampaign).toBe(false);
		expect(state.selectedVoiceId).toBeUndefined();
	});
});
