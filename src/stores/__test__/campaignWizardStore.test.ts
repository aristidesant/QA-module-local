import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from '@testing-library/react';
import { useCampaignWizardStore } from '../campaignWizardStore';
import { useCampaignsStore } from '../campaignsStore';
import type { Campaign } from '~/models/CampaignsModel';

describe('useCampaignWizardStore', () => {
	beforeEach(() => {
		act(() => {
			useCampaignWizardStore.getState().reset();
		});
		vi.clearAllMocks();
	});

	it('should have initial state', () => {
		const state = useCampaignWizardStore.getState();
		expect(state.activeStep).toBe(0);
		expect(state.campaignName).toBe('');
		expect(state.description).toBe('');
		expect(state.campaignType).toBe('OUTBOUND');
		expect(state.phoneNumberId).toBeNull();
		expect(state.objectiveId).toBeNull();
		expect(state.createdCampaign).toBeNull();
		expect(state.isSubmitting).toBe(false);
		expect(state.isResumingDraft).toBe(false);
		expect(state.agentBehaviorId).toBeNull();
		expect(state.language).toBe('es');
		expect(state.firstMessage).toBe('');
		expect(state.agentPrompt).toBe('');
		expect(state.knowledgeBaseIds).toEqual([]);
	});

	it('should set active step', () => {
		act(() => {
			useCampaignWizardStore.getState().setActiveStep(2);
		});
		expect(useCampaignWizardStore.getState().activeStep).toBe(2);
	});

	it('should go to next step', () => {
		act(() => {
			useCampaignWizardStore.getState().nextStep();
		});
		expect(useCampaignWizardStore.getState().activeStep).toBe(1);
	});

	it('should go to prev step', () => {
		act(() => {
			useCampaignWizardStore.getState().setActiveStep(1);
		});
		act(() => {
			useCampaignWizardStore.getState().prevStep();
		});
		expect(useCampaignWizardStore.getState().activeStep).toBe(0);
	});

	it('should not go below step 0', () => {
		act(() => {
			useCampaignWizardStore.getState().prevStep();
		});
		expect(useCampaignWizardStore.getState().activeStep).toBe(0);
	});

	it('should set campaign name', () => {
		act(() => {
			useCampaignWizardStore.getState().setCampaignName('New Campaign');
		});
		expect(useCampaignWizardStore.getState().campaignName).toBe('New Campaign');
	});

	it('should set description', () => {
		act(() => {
			useCampaignWizardStore.getState().setDescription('Desc');
		});
		expect(useCampaignWizardStore.getState().description).toBe('Desc');
	});

	it('should set campaign type and reset phone number', () => {
		act(() => {
			useCampaignWizardStore.getState().setPhoneNumberId(123);
			useCampaignWizardStore.getState().setCampaignType('INBOUND');
		});
		expect(useCampaignWizardStore.getState().campaignType).toBe('INBOUND');
		expect(useCampaignWizardStore.getState().phoneNumberId).toBeNull();
	});

	it('should set phone number id', () => {
		act(() => {
			useCampaignWizardStore.getState().setPhoneNumberId(123);
		});
		expect(useCampaignWizardStore.getState().phoneNumberId).toBe(123);
	});

	it('should set objective id', () => {
		act(() => {
			useCampaignWizardStore.getState().setObjectiveId(456);
		});
		expect(useCampaignWizardStore.getState().objectiveId).toBe(456);
	});

	it('should set created campaign and sync with campaigns store', () => {
		const mockCampaign = { id: 1, name: 'Created Campaign' } as Campaign;
		const selectCampaignSpy = vi.spyOn(
			useCampaignsStore.getState(),
			'selectCampaign'
		);

		act(() => {
			useCampaignWizardStore.getState().setCreatedCampaign(mockCampaign);
		});

		expect(useCampaignWizardStore.getState().createdCampaign).toEqual(
			mockCampaign
		);
		expect(selectCampaignSpy).toHaveBeenCalledWith(mockCampaign);
	});

	it('should set is submitting', () => {
		act(() => {
			useCampaignWizardStore.getState().setIsSubmitting(true);
		});
		expect(useCampaignWizardStore.getState().isSubmitting).toBe(true);
	});

	it('should set agent behavior id', () => {
		act(() => {
			useCampaignWizardStore.getState().setAgentBehaviorId('behavior-1');
		});
		expect(useCampaignWizardStore.getState().agentBehaviorId).toBe(
			'behavior-1'
		);
	});

	it('should set language', () => {
		act(() => {
			useCampaignWizardStore.getState().setLanguage('en');
		});
		expect(useCampaignWizardStore.getState().language).toBe('en');
	});

	it('should set first message', () => {
		act(() => {
			useCampaignWizardStore.getState().setFirstMessage('Hello');
		});
		expect(useCampaignWizardStore.getState().firstMessage).toBe('Hello');
	});

	it('should set agent prompt', () => {
		act(() => {
			useCampaignWizardStore.getState().setAgentPrompt('Prompt');
		});
		expect(useCampaignWizardStore.getState().agentPrompt).toBe('Prompt');
	});

	it('should set knowledge base ids', () => {
		act(() => {
			useCampaignWizardStore.getState().setKnowledgeBaseIds([1, 2]);
		});
		expect(useCampaignWizardStore.getState().knowledgeBaseIds).toEqual([1, 2]);
	});

	it('should reset state', () => {
		act(() => {
			useCampaignWizardStore.getState().setCampaignName('Changed');
			useCampaignWizardStore.getState().reset();
		});
		expect(useCampaignWizardStore.getState().campaignName).toBe('');
	});

	it('should set isResumingDraft', () => {
		act(() => {
			useCampaignWizardStore.getState().setIsResumingDraft(true);
		});
		expect(useCampaignWizardStore.getState().isResumingDraft).toBe(true);
	});

	it('should initialize from draft campaign', () => {
		const draftCampaign = {
			id: 123,
			name: 'Draft Campaign',
			description: 'Draft description',
			type: 'INBOUND' as const,
			objectiveId: 456,
			defaultMaxWaves: 5,
			isDraft: true,
			draftStep: 2,
		} as Campaign;

		const selectCampaignSpy = vi.spyOn(
			useCampaignsStore.getState(),
			'selectCampaign'
		);

		act(() => {
			useCampaignWizardStore.getState().initializeFromDraft(draftCampaign);
		});

		const state = useCampaignWizardStore.getState();
		expect(state.createdCampaign).toEqual(draftCampaign);
		expect(state.campaignName).toBe('Draft Campaign');
		expect(state.description).toBe('Draft description');
		expect(state.campaignType).toBe('INBOUND');
		expect(state.objectiveId).toBe(456);
		expect(state.defaultMaxWaves).toBe(5);
		expect(state.activeStep).toBe(2);
		expect(state.isResumingDraft).toBe(true);
		expect(selectCampaignSpy).toHaveBeenCalledWith(draftCampaign);
	});

	it('should use default draftStep of 0 when not provided', () => {
		const draftCampaign = {
			id: 123,
			name: 'Draft Campaign',
			description: 'Draft description',
			type: 'OUTBOUND' as const,
			isDraft: true,
		} as Campaign;

		act(() => {
			useCampaignWizardStore.getState().initializeFromDraft(draftCampaign);
		});

		expect(useCampaignWizardStore.getState().activeStep).toBe(0);
	});

	it('should reset isResumingDraft on reset', () => {
		act(() => {
			useCampaignWizardStore.getState().setIsResumingDraft(true);
			useCampaignWizardStore.getState().reset();
		});
		expect(useCampaignWizardStore.getState().isResumingDraft).toBe(false);
	});
});
