import { createFormContext } from '@mantine/form';
import { createContext, useContext } from 'react';
import type AgentListObject from '~/models/AgentListObject';
import type {
	CampaignAgent,
	CampaignAgentWorkflowUi,
} from '~/models/CampaignAgentModel';
import type { Campaign } from '~/models/CampaignsModel';
import type { AgentConfigModel } from '~/models/AgentListObject';

export const [CampaignFormProvider, useCampaignFormContext, useCampaignForm] =
	createFormContext<Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>>();

// Context for campaign ID (needed for components that need to fetch related data)
export const CampaignIdContext = createContext<number | undefined>(undefined);

export interface SelectedAgentDraft {
	campaignAgentId: number;
	agentId: string;
	config: Partial<AgentConfigModel>;
	workflowUi: CampaignAgentWorkflowUi | null;
	agentType: CampaignAgent['agentType'];
	isPrincipal: boolean;
}

export interface CampaignAgentEditorContextValue {
	selectedCampaignAgentId: number | null;
	setSelectedCampaignAgentId: (campaignAgentId: number | null) => void;
	selectedCampaignAgent?: CampaignAgent | null;
	selectedAgent?: AgentListObject | null;
	selectedAgentDraft?: SelectedAgentDraft | null;
	setSelectedAgentDraft: (draft: SelectedAgentDraft | null) => void;
	updateSelectedAgentDraft: (draft: Partial<SelectedAgentDraft>) => void;
}

export const CampaignAgentEditorContext =
	createContext<CampaignAgentEditorContextValue | null>(null);

export const useCampaignId = () => {
	const campaignId = useContext(CampaignIdContext);
	return campaignId;
};

export const useCampaignAgentEditor = () => {
	const context = useContext(CampaignAgentEditorContext);

	if (!context) {
		throw new Error(
			'useCampaignAgentEditor must be used within a CampaignAgentEditorContext'
		);
	}

	return context;
};
