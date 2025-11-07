import { create } from 'zustand';
import type { Campaign } from '~/models/CampaignsModel';

interface CampaignWizardState {
	activeStep: number;
	campaignName: string;
	description: string;
	campaignType: 'INBOUND' | 'OUTBOUND';
	phoneNumberId: number | null;
	objectiveId: number | null;
	createdCampaign: Campaign | null;
	isSubmitting: boolean;

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
	setCreatedCampaign: (campaign: Campaign | null) => void;
	setIsSubmitting: (isSubmitting: boolean) => void;
	setAgentBehaviorId: (id: string | number | null) => void;
	setLanguage: (language: string) => void;
	setFirstMessage: (message: string) => void;
	setAgentPrompt: (prompt: string) => void;
	setKnowledgeBaseIds: (ids: number[]) => void;
	reset: () => void;
}

const initialState = {
	activeStep: 0,
	campaignName: '',
	description: '',
	campaignType: 'OUTBOUND' as const,
	phoneNumberId: null,
	objectiveId: null,
	createdCampaign: null,
	isSubmitting: false,
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
	setCreatedCampaign: (campaign) => set({ createdCampaign: campaign }),
	setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
	setAgentBehaviorId: (id) => set({ agentBehaviorId: id }),
	setLanguage: (language) => set({ language }),
	setFirstMessage: (message) => set({ firstMessage: message }),
	setAgentPrompt: (prompt) => set({ agentPrompt: prompt }),
	setKnowledgeBaseIds: (ids) => set({ knowledgeBaseIds: ids }),
	reset: () => set(initialState),
}));
