import { create } from 'zustand';
import type { Campaign } from '~/models/CampaignsModel';
import { useCampaignsStore } from './campaignsStore';

interface CampaignWizardState {
	activeStep: number;
	campaignName: string;
	description: string;
	campaignType: 'INBOUND' | 'OUTBOUND';
	phoneNumberId: number | null;
	objectiveId: number | null;
	defaultMaxWaves: number;
	defaultWaveExecutionDelaySeconds: number;
	createdCampaign: Campaign | null;
	isSubmitting: boolean;
	isResumingDraft: boolean; // Flag to indicate resuming a draft campaign
	hasOutcomeFlow: boolean; // Flag to indicate if outcome flow has been created/imported

	// Step 2 - Agent Configuration
	agentBehaviorId: string | number | null;
	language: string;
	firstMessage: string;
	agentPrompt: string;
	knowledgeBaseIds: number[];

	// Actions
	setActiveStep: (step: number) => void;
	nextStep: () => void;
	prevStep: () => void;
	setCampaignName: (name: string) => void;
	setDescription: (description: string) => void;
	setCampaignType: (type: 'INBOUND' | 'OUTBOUND') => void;
	setPhoneNumberId: (id: number | null) => void;
	setObjectiveId: (id: number | null) => void;
	setDefaultMaxWaves: (waves: number) => void;
	setDefaultWaveExecutionDelaySeconds: (seconds: number) => void;
	setCreatedCampaign: (campaign: Campaign | null) => void;
	setIsSubmitting: (isSubmitting: boolean) => void;
	setAgentBehaviorId: (id: string | number | null) => void;
	setLanguage: (language: string) => void;
	setFirstMessage: (message: string) => void;
	setAgentPrompt: (prompt: string) => void;
	setKnowledgeBaseIds: (ids: number[]) => void;
	setIsResumingDraft: (isResumingDraft: boolean) => void;
	setHasOutcomeFlow: (hasOutcomeFlow: boolean) => void;
	initializeFromDraft: (campaign: Campaign) => void;
	reset: () => void;
}

const initialState = {
	activeStep: 0,
	campaignName: '',
	description: '',
	campaignType: 'OUTBOUND' as const,
	phoneNumberId: null,
	objectiveId: null,
	defaultMaxWaves: 3,
	defaultWaveExecutionDelaySeconds: 0,
	createdCampaign: null,
	isSubmitting: false,
	isResumingDraft: false,
	hasOutcomeFlow: false,
	agentBehaviorId: null,
	language: 'es',
	firstMessage: '',
	agentPrompt: '',
	knowledgeBaseIds: [],
};

export const useCampaignWizardStore = create<CampaignWizardState>((set) => ({
	...initialState,

	setActiveStep: (step) => set({ activeStep: step }),
	nextStep: () => set((state) => ({ activeStep: state.activeStep + 1 })),
	prevStep: () =>
		set((state) => ({ activeStep: Math.max(0, state.activeStep - 1) })),
	setCampaignName: (name) => set({ campaignName: name }),
	setDescription: (description) => set({ description }),
	setCampaignType: (type) => set({ campaignType: type, phoneNumberId: null }),
	setPhoneNumberId: (id) => set({ phoneNumberId: id }),
	setObjectiveId: (id) => set({ objectiveId: id }),
	setDefaultMaxWaves: (waves) => set({ defaultMaxWaves: waves }),
	setDefaultWaveExecutionDelaySeconds: (seconds) =>
		set({ defaultWaveExecutionDelaySeconds: seconds }),
	setCreatedCampaign: (campaign) => {
		set({ createdCampaign: campaign });
		// Sync with campaigns store so AddScheduler has access to campaign ID
		if (campaign) {
			useCampaignsStore.getState().selectCampaign(campaign);
		}
	},
	setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
	setAgentBehaviorId: (id) => set({ agentBehaviorId: id }),
	setLanguage: (language) => set({ language }),
	setFirstMessage: (message) => set({ firstMessage: message }),
	setAgentPrompt: (prompt) => set({ agentPrompt: prompt }),
	setKnowledgeBaseIds: (ids) => set({ knowledgeBaseIds: ids }),
	setIsResumingDraft: (isResumingDraft) => set({ isResumingDraft }),
	setHasOutcomeFlow: (hasOutcomeFlow) => set({ hasOutcomeFlow }),
	initializeFromDraft: (campaign) => {
		set({
			createdCampaign: campaign,
			campaignName: campaign.name,
			description: campaign.description,
			campaignType: campaign.type,
			objectiveId: campaign.objectiveId ?? null,
			defaultMaxWaves: campaign.defaultMaxWaves ?? 3,
			defaultWaveExecutionDelaySeconds:
				campaign.defaultWaveExecutionDelaySeconds ?? 0,
			activeStep: campaign.draftStep ?? 0,
			isResumingDraft: true,
		});
		// Sync with campaigns store
		useCampaignsStore.getState().selectCampaign(campaign);
	},
	reset: () => set(initialState),
}));
