import axios from 'axios';
import type {
	CampaignAgent,
	CampaignAgentTransferTarget,
	CreateCampaignAgentFromTemplatePayload,
	CreateSubagentTemplateFromAgentPayload,
	UpdateCampaignAgentConfigPayload,
} from '../models/CampaignAgentModel';
import type { SubagentTemplate } from '~/models/SubagentTemplateModel';
import { DEFAULT_API_URL } from './config';

/**
 * Generic Campaign Agents API client
 * Note: Authorization handled by global Axios interceptor.
 */
const campaignAgentsApi = (_authHeader?: Record<string, string>) => {
	return {
		// ASSIGN agent to campaign
		assignAgentToCampaign: async (
			campaignId: number,
			agentId: string,
			isPrincipal?: boolean
		): Promise<CampaignAgent> => {
			const { data } = await axios.post<CampaignAgent>(
				`${DEFAULT_API_URL}/campaigns/${campaignId}/agents`,
				{ agentId, campaignId, isPrincipal }
			);
			return data;
		},

		// GET all agents for a campaign
		getCampaignAgents: async (campaignId: number): Promise<CampaignAgent[]> => {
			const { data } = await axios.get<CampaignAgent[]>(
				`${DEFAULT_API_URL}/campaigns/${campaignId}/agents`
			);
			return data;
		},

		// GET a single agent by ID
		getCampaignAgentById: async (
			campaignId: number,
			id: number
		): Promise<CampaignAgent> => {
			const { data } = await axios.get<CampaignAgent>(
				`${DEFAULT_API_URL}/campaigns/${campaignId}/agents/${id}`
			);
			return data;
		},

		// UPDATE agent in campaign
		updateCampaignAgent: async (
			campaignId: number,
			id: number,
			updateData: Partial<
				Omit<CampaignAgent, 'id' | 'createdAt' | 'updatedAt' | 'campaignId'>
			>
		): Promise<CampaignAgent> => {
			const { data } = await axios.patch<CampaignAgent>(
				`${DEFAULT_API_URL}/campaigns/${campaignId}/agents/${id}`,
				updateData
			);
			return data;
		},

		updateCampaignAgentConfig: async (
			campaignId: number,
			id: number,
			updateData: UpdateCampaignAgentConfigPayload
		): Promise<CampaignAgent> => {
			const { data } = await axios.patch<CampaignAgent>(
				`${DEFAULT_API_URL}/campaigns/${campaignId}/agents/${id}/config`,
				updateData
			);
			return data;
		},

		getTransferTargets: async (
			campaignId: number,
			currentAgentId?: string
		): Promise<CampaignAgentTransferTarget[]> => {
			const { data } = await axios.get<CampaignAgentTransferTarget[]>(
				`${DEFAULT_API_URL}/campaigns/${campaignId}/agents/transfer-targets`,
				{ params: { currentAgentId } }
			);
			return data;
		},

		createFromTemplate: async (
			campaignId: number,
			payload: CreateCampaignAgentFromTemplatePayload
		): Promise<CampaignAgent> => {
			const { data } = await axios.post<CampaignAgent>(
				`${DEFAULT_API_URL}/campaigns/${campaignId}/agents/from-template`,
				payload
			);
			return data;
		},

		saveAsTemplate: async (
			campaignId: number,
			id: number,
			payload: CreateSubagentTemplateFromAgentPayload
		): Promise<SubagentTemplate> => {
			const { data } = await axios.post<SubagentTemplate>(
				`${DEFAULT_API_URL}/campaigns/${campaignId}/agents/${id}/template`,
				payload
			);
			return data;
		},

		// REMOVE agent from campaign
		removeAgentFromCampaign: async (
			campaignId: number,
			id: number
		): Promise<void> => {
			await axios.delete(
				`${DEFAULT_API_URL}/campaigns/${campaignId}/agents/${id}`
			);
		},
	};
};

export default campaignAgentsApi;
