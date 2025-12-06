import axios from 'axios';
import type {
	Campaign,
	PaginatedResponse,
	SchedulerSummary,
} from '~/models/CampaignsModel';
import type { CampaignRequirements } from '~/models/CampaignRequirementsModel';
import type { CampaignLiveMetric } from '~/models/CampaignLiveMetricModel';
import { DEFAULT_API_URL } from './config';

// import { getAuthorizationHeader } from "../utils/tokenUtils";

export interface HourConfig {
	hour: string;
	hourOrder: number;
	capacity: number;
	isActive: boolean;
}

export interface DayConfig {
	dayOfWeek:
		| 'monday'
		| 'tuesday'
		| 'wednesday'
		| 'thursday'
		| 'friday'
		| 'saturday'
		| 'sunday';
	dayOrder?: number;
	isActive: boolean;
	dailyCallLimit: number;
	dayCapacity?: number;
	startHour?: string; // Format: 'HH:mm'
	endHour?: string; // Format: 'HH:mm'
	hourConfigs: HourConfig[];
}

export interface CreateCampaignScheduleDTO {
	name: string;
	description: string;
	humanEquivalent: number;
	dayConfigs: DayConfig[];
}

export interface CreateCampaignWithAgentDTO {
	campaign: {
		name: string;
		description: string;
		budget?: number;
		spent?: number;
		type: 'OUTBOUND' | 'INBOUND';
		campaignExecutionType?: 'TIME_BASED' | 'CONTACT_BASED';
		status?: string;
		promptId?: number;
		objectiveId?: number;
		defaultMaxWaves?: number;
	};
	agent: {
		conversationConfig?: {
			agent?: {
				prompt?: {
					prompt?: string;
				};
				outboundPhoneNumberId?: number;
				inboundPhoneNumberId?: number;
			};
			[key: string]: any;
		};
		platformSettings?: Record<string, any>;
		name: string;
		type: 'INBOUND' | 'OUTBOUND';
		voiceId: string;
	};
}

/**
 * Generic Campaigns API client (uses global axios interceptors for auth)
 */
const campaignsApi = (_authHeader: Record<string, string> = {}) => {
	return {
		// CREATE campaign
		createCampaign: async (campaign: Partial<Campaign>) => {
			const response = await axios.post(
				`${DEFAULT_API_URL}/campaigns`,
				campaign
			);
			return response.data;
		},

		// FIND ALL campaigns
		findAllCampaigns: async (
			params?: Record<string, any>,
			extraHeaders?: Record<string, string>
		) => {
			const response = await axios.get<Campaign[]>(
				`${DEFAULT_API_URL}/campaigns`,
				{
					params,
					...(extraHeaders ? { headers: extraHeaders } : {}),
					timeout: 5000,
				}
			);
			return response.data;
		},

		// FIND ALL campaigns with pagination
		findAllCampaignsPaginated: async (
			params?: Record<string, any>,
			extraHeaders?: Record<string, string>
		) => {
			const response = await axios.get<PaginatedResponse<Campaign>>(
				`${DEFAULT_API_URL}/campaigns/paginated`,
				{
					params,
					...(extraHeaders ? { headers: extraHeaders } : {}),
					timeout: 5000,
				}
			);
			return response.data;
		},

		// FIND ONE campaign
		findCampaign: async (campaignId: string) => {
			const response = await axios.get<Campaign>(
				`${DEFAULT_API_URL}/campaigns/${campaignId}`
			);
			return response.data;
		},

		findCampaignsTimeEnd: async (campaignId: string) => {
			const response = await axios.get<{ timeEnd: string }>(
				`${DEFAULT_API_URL}/campaigns/timeEnd/${campaignId}`
			);
			return response.data;
		},

		findCampaignScheduleSummary: async (campaignId: string) => {
			const response = await axios.get<SchedulerSummary[]>(
				`${DEFAULT_API_URL}/campaigns/${campaignId}/schedules/day-configs/summary`
			);
			return response.data;
		},

		createCampaignSchedule: async (
			campaignId: string,
			data: CreateCampaignScheduleDTO
		) => {
			const response = await axios.post(
				`${DEFAULT_API_URL}/campaigns/${campaignId}/schedules`,
				data
			);
			return response.data;
		},

		getCampaignRequirements: async (campaignId: string) => {
			const response = await axios.get<CampaignRequirements>(
				`${DEFAULT_API_URL}/campaigns/${campaignId}/requirements`
			);
			return response.data;
		},

		getLiveMetrics: async (
			campaignId: string,
			range: '5m' | '15m' | '1h' | 'today'
		) => {
			const response = await axios.get<CampaignLiveMetric>(
				`${DEFAULT_API_URL}/campaigns/${campaignId}/live-metrics`,
				{
					params: { range },
				}
			);
			return response.data;
		},

		// UPDATE campaign (PATCH)
		updateCampaign: async (campaignId: string, data: Partial<Campaign>) => {
			if (data.agentConfig?.conversationConfig?.agent?.prompt?.prompt) {
				delete (data.agentConfig.conversationConfig.agent.prompt as any).prompt;
			}

			const response = await axios.patch<Campaign>(
				`${DEFAULT_API_URL}/campaigns/${campaignId}`,
				data
			);
			return response.data;
		},
		// UPDATE campaign (PATCH)
		updateCampaignLight: async (
			campaignId: string,
			data: Partial<Campaign>
		) => {
			if (data.agentConfig?.conversationConfig?.agent?.prompt?.prompt) {
				delete (data.agentConfig.conversationConfig.agent.prompt as any).prompt;
			}

			const response = await axios.patch<Campaign>(
				`${DEFAULT_API_URL}/campaigns/${campaignId}/details`,
				data
			);
			return response.data;
		},

		startOutboundCampaign: async (
			campaignId: number,
			contactGroupId: number
		) => {
			const response = await axios.post(`${DEFAULT_API_URL}/outbound/start`, {
				campaignId,
				contactGroupId,
			});
			return response.data;
		},

		pauseOutboundCampaign: async (
			campaignId: number,
			contactGroupId: number
		) => {
			const response = await axios.patch(`${DEFAULT_API_URL}/outbound/pause`, {
				campaignId,
				contactGroupId,
			});
			return response.data;
		},
		resumeOutboundCampaign: async (
			campaignId: number,
			contactGroupId: number
		) => {
			const response = await axios.patch(`${DEFAULT_API_URL}/outbound/resume`, {
				campaignId,
				contactGroupId,
			});
			return response.data;
		},

		// DELETE campaign
		deleteCampaign: async (campaignId: string) => {
			const response = await axios.delete(
				`${DEFAULT_API_URL}/campaigns/${campaignId}`
			);
			return response.data;
		},

		// CLONE campaign
		cloneCampaign: async (
			campaignId: string,
			data: {
				name: string;
				description: string;
				agentsToDuplicate: Array<{ agentId: string; newName: string }>;
			}
		) => {
			const response = await axios.post(
				`${DEFAULT_API_URL}/campaigns/${campaignId}/clone`,
				data
			);
			return response.data;
		},

		// ASSIGN objective to campaign
		assignObjectiveToCampaign: async (
			campaignId: string | number,
			objectiveId: number
		) => {
			const response = await axios.patch<Campaign>(
				`${DEFAULT_API_URL}/campaigns/${campaignId}/assign-objective`,
				{ objectiveId }
			);
			return response.data;
		},

		// CREATE campaign with agent
		createCampaignWithAgent: async (data: CreateCampaignWithAgentDTO) => {
			const response = await axios.post<Campaign>(
				`${DEFAULT_API_URL}/campaigns/with-agent`,
				data
			);
			return response.data;
		},
	};
};

export default campaignsApi;
