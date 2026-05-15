import axios from 'axios';
import { DEFAULT_API_URL } from './config';
import type {
	AgentBehavior,
	AgentBehaviorCampaign,
	AgentBehaviorDeleteCheckResponse,
	AgentBehaviorReplaceRequest,
	AgentBehaviorReplaceJob,
	AgentBehaviorProcessPendingResponse,
	AgentBehaviorContinuityCleanupRequest,
} from '~/models/AgentBehavior';

export interface GetAgentBehaviorsParams {
	name?: string;
	createdFrom?: string;
	createdTo?: string;
	updatedFrom?: string;
	updatedTo?: string;
	limit?: number;
	offset?: number;
}

export interface AgentBehaviorsResponse {
	data: AgentBehavior[];
	total: number;
}

export const getAgentBehaviors = async (
	params?: GetAgentBehaviorsParams
): Promise<AgentBehaviorsResponse> => {
	const response = await axios.get<AgentBehaviorsResponse>(
		`${DEFAULT_API_URL}/agent-behaviors`,
		{ params }
	);
	return response.data;
};

export const getAgentBehaviorById = async (
	id: string
): Promise<AgentBehavior> => {
	const response = await axios.get<AgentBehavior>(
		`${DEFAULT_API_URL}/agent-behaviors/${id}`
	);
	return response.data;
};

export const createAgentBehavior = async (data: {
	name: string;
	params: any;
}): Promise<AgentBehavior> => {
	const response = await axios.post<AgentBehavior>(
		`${DEFAULT_API_URL}/agent-behaviors`,
		data
	);
	return response.data;
};

export const updateAgentBehavior = async (
	id: string,
	data: { name?: string; params?: any }
): Promise<AgentBehavior> => {
	const response = await axios.patch<AgentBehavior>(
		`${DEFAULT_API_URL}/agent-behaviors/${id}`,
		data
	);
	return response.data;
};

export const checkDeleteAgentBehavior = async (
	id: string
): Promise<AgentBehaviorDeleteCheckResponse> => {
	const response = await axios.get<AgentBehaviorDeleteCheckResponse>(
		`${DEFAULT_API_URL}/agent-behaviors/${id}/delete-check`
	);
	return response.data;
};

export const deleteAgentBehavior = async (id: string): Promise<void> => {
	await axios.delete(`${DEFAULT_API_URL}/agent-behaviors/${id}`);
};

export const getCampaignsForBehavior = async (
	configId: string
): Promise<AgentBehaviorCampaign[]> => {
	const response = await axios.get<AgentBehaviorCampaign[]>(
		`${DEFAULT_API_URL}/agent-behaviors/${configId}/campaigns`
	);
	// Return data directly if it is an array
	return response.data;
};

export const replaceAgentBehavior = async (
	data: AgentBehaviorReplaceRequest
): Promise<AgentBehaviorReplaceJob> => {
	const response = await axios.post<AgentBehaviorReplaceJob>(
		`${DEFAULT_API_URL}/agent-behaviors/replace`,
		data
	);
	return response.data;
};

export const getReplaceJob = async (
	jobId: string
): Promise<AgentBehaviorReplaceJob> => {
	const response = await axios.get<AgentBehaviorReplaceJob>(
		`${DEFAULT_API_URL}/agent-behaviors/replace/${jobId}`
	);
	return response.data;
};

export const processReplaceJob = async (
	jobId: string
): Promise<AgentBehaviorReplaceJob> => {
	const response = await axios.post<AgentBehaviorReplaceJob>(
		`${DEFAULT_API_URL}/agent-behaviors/replace/${jobId}/process`
	);
	return response.data;
};

export const processPendingReplaceJobs =
	async (): Promise<AgentBehaviorProcessPendingResponse> => {
		const response = await axios.post<AgentBehaviorProcessPendingResponse>(
			`${DEFAULT_API_URL}/agent-behaviors/replace/process-pending`
		);
		return response.data;
	};

export const cleanupContinuity = async (
	jobId: string,
	data: AgentBehaviorContinuityCleanupRequest
): Promise<any> => {
	const response = await axios.post(
		`${DEFAULT_API_URL}/agent-behaviors/replace/${jobId}/continuity-cleanup`,
		data
	);
	return response.data;
};
