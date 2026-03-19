import axios from 'axios';
import type {
	Campaign,
	PaginatedResponse,
	SchedulerSummary,
} from '~/models/CampaignsModel';
import type { AgentWorkflow } from '~/models/AgentWorkflowModel';
import type { AgentWorkflowApi } from '~/models/AgentWorkflowApiModel';
import type { CampaignRequirements } from '~/models/CampaignRequirementsModel';
import type { CampaignLiveMetric } from '~/models/CampaignLiveMetricModel';
import { ScheduleType, ScheduleDirection } from '~/models/SchedulerModel';
import { DEFAULT_API_URL } from './config';

export type ToggleCampaignAction = 'activate' | 'inactive';

export interface ToggleCampaignStatusResponse {
	campaign: Campaign;
	message: string;
}

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

export type ConversationAgentConfig = {
	prompt?: {
		prompt?: string;
	};
	outboundPhoneNumberId?: number;
	inboundPhoneNumberId?: number;
	[key: string]: unknown;
};

export type ConversationConfigPayload = {
	agent?: ConversationAgentConfig;
	[key: string]: unknown;
};

export interface CreateCampaignScheduleDTO {
	name: string;
	description: string;
	humanEquivalent: number;
	scheduleType?: ScheduleType;
	direction?: ScheduleDirection;
	dayConfigs?: DayConfig[];
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
		defaultWaveExecutionDelaySeconds?: number;
	};
	agent: {
		conversationConfig?: ConversationConfigPayload;
		platformSettings?: Record<string, unknown>;
		name: string;
		type: 'INBOUND' | 'OUTBOUND';
		voiceId: string;
	};
}

export interface SetDraftDto {
	isDraft: boolean;
	draftStep: number;
}

export interface ResumeOutboundCampaignPayload {
	campaignId: number;
	contactGroupId: number;
	ignoreWaveDelay?: boolean;
}

type AgentConfigPayload = {
	conversationConfig?: {
		agent?: {
			prompt?: Record<string, unknown> | string;
		};
	};
	workflow?: AgentWorkflow | AgentWorkflowApi | Record<string, unknown>;
};

const getWorkflowCounts = (workflow?: AgentConfigPayload['workflow']) => {
	const normalizedWorkflow = workflow as
		| {
				nodes?: Record<string, unknown>;
				edges?: Record<string, unknown>;
		  }
		| undefined;

	return {
		nodes: normalizedWorkflow?.nodes
			? Object.keys(normalizedWorkflow.nodes).length
			: 0,
		edges: normalizedWorkflow?.edges
			? Object.keys(normalizedWorkflow.edges).length
			: 0,
	};
};

const removePromptText = (agentConfig?: AgentConfigPayload) => {
	const agentConversation = agentConfig?.conversationConfig?.agent;

	if (
		agentConversation &&
		agentConversation.prompt &&
		typeof agentConversation.prompt === 'object'
	) {
		const { prompt: _rawPrompt, ...restPrompt } =
			agentConversation.prompt as Record<string, unknown>;
		agentConversation.prompt = restPrompt;
	}
};

const stripWorkflowUiMeta = (agentConfig?: AgentConfigPayload) => {
	const workflow = agentConfig?.workflow as
		| { nodes?: Record<string, Record<string, unknown>> }
		| undefined;
	if (!workflow?.nodes) return;
	Object.values(workflow.nodes).forEach((node) => {
		if (!node || typeof node !== 'object') return;
		if ('uiMeta' in node) {
			delete node.uiMeta;
		}
	});
};

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
			params?: Record<string, unknown>,
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
			params?: Record<string, unknown>,
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

			const workflowCounts = getWorkflowCounts(
				response.data?.agentConfig?.workflow as AgentConfigPayload['workflow']
			);
			void workflowCounts;

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
			stripWorkflowUiMeta(data.agentConfig);

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
			removePromptText(data.agentConfig);
			stripWorkflowUiMeta(data.agentConfig);

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
		resumeOutboundCampaign: async ({
			campaignId,
			contactGroupId,
			ignoreWaveDelay,
		}: ResumeOutboundCampaignPayload) => {
			const response = await axios.patch(`${DEFAULT_API_URL}/outbound/resume`, {
				campaignId,
				contactGroupId,
				...(ignoreWaveDelay ? { ignoreWaveDelay } : {}),
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

		// SET campaign draft status
		setDraft: async (campaignId: string, data: SetDraftDto) => {
			const response = await axios.patch<Campaign>(
				`${DEFAULT_API_URL}/campaigns/${campaignId}/draft`,
				data
			);
			return response.data;
		},

		// SYNC campaign by agent
		syncByAgent: async (agentId: string) => {
			const response = await axios.post<Campaign>(
				`${DEFAULT_API_URL}/campaigns/sync-by-agent/${agentId}`
			);
			return response.data;
		},

		// TOGGLE campaign status (activate/inactive)
		toggleCampaignStatus: async (
			campaignId: number,
			action: ToggleCampaignAction
		) => {
			const response = await axios.patch<ToggleCampaignStatusResponse>(
				`${DEFAULT_API_URL}/campaigns/${campaignId}/toggle-status`,
				{ action }
			);
			return response.data;
		},
	};
};

export default campaignsApi;
