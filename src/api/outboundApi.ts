import axios from 'axios';
import { DEFAULT_API_URL } from './config';
import type { PaginatedResponse } from '~/models/CampaignsModel';
import type {
	OutboundCallTask,
	OutboundTaskSortFieldsResponse,
	ReorderTasksPayload,
	ReorderTasksResult,
	BulkTaskActionPayload,
	BulkTaskActionResult,
	QueueProgressResponse,
} from '~/models/ContactsModel';

export interface CleanOutboundQueuePayload {
	campaignId: number;
	contactGroupId: number;
}

export interface GetOutboundCallTasksParams {
	contactGroupId?: number;
	campaignId?: number;
	status?: string;
	waveNumber?: number;
	limit?: number;
	offset?: number;
	sortBy?: string;
	sortOrder?: 'ASC' | 'DESC';
}

const outboundApi = (_authHeader: Record<string, string> = {}) => {
	return {
		cleanOutboundQueue: async ({
			campaignId,
			contactGroupId,
		}: CleanOutboundQueuePayload) => {
			const response = await axios.delete(
				`${DEFAULT_API_URL}/outbound/queue/clean`,
				{
					data: { campaignId, contactGroupId },
				}
			);
			return response.data;
		},

		getOutboundCallTasks: async (
			params: GetOutboundCallTasksParams
		): Promise<PaginatedResponse<OutboundCallTask>> => {
			const response = await axios.get(
				`${DEFAULT_API_URL}/outbound-call-tasks`,
				{ params }
			);
			const raw = response.data;
			// Handle both paginated { data, total } and raw array responses
			if (Array.isArray(raw)) {
				return {
					data: raw,
					total: raw.length,
					limit: params.limit ?? 50,
					offset: params.offset ?? 0,
				};
			}
			return raw;
		},

		getSortFields: async (
			campaignId: number,
			contactGroupId?: number
		): Promise<OutboundTaskSortFieldsResponse> => {
			const response = await axios.get(
				`${DEFAULT_API_URL}/outbound-call-tasks/sort-fields`,
				{ params: { campaignId, contactGroupId } }
			);
			return response.data;
		},

		getQueueProgress: async (
			contactGroupId: number,
			campaignId: number
		): Promise<QueueProgressResponse> => {
			const response = await axios.get(
				`${DEFAULT_API_URL}/outbound-call-tasks/queue-progress`,
				{ params: { contactGroupId, campaignId } }
			);
			return response.data;
		},

		reorderTasks: async (
			payload: ReorderTasksPayload
		): Promise<ReorderTasksResult> => {
			const response = await axios.post(
				`${DEFAULT_API_URL}/outbound-call-tasks/reorder`,
				payload
			);
			return response.data;
		},

		pauseTask: async (
			id: number,
			reason: string
		): Promise<OutboundCallTask> => {
			const response = await axios.patch(
				`${DEFAULT_API_URL}/outbound-call-tasks/${id}/pause`,
				{ reason }
			);
			return response.data;
		},

		resumeTask: async (id: number): Promise<OutboundCallTask> => {
			const response = await axios.patch(
				`${DEFAULT_API_URL}/outbound-call-tasks/${id}/resume`
			);
			return response.data;
		},

		cancelTask: async (id: number): Promise<OutboundCallTask> => {
			const response = await axios.patch(
				`${DEFAULT_API_URL}/outbound-call-tasks/${id}/cancel`
			);
			return response.data;
		},

		retryTask: async (
			id: number,
			scheduledAt?: string
		): Promise<OutboundCallTask> => {
			const response = await axios.patch(
				`${DEFAULT_API_URL}/outbound-call-tasks/${id}/retry`,
				{ scheduledAt }
			);
			return response.data;
		},

		bulkAction: async (
			payload: BulkTaskActionPayload
		): Promise<BulkTaskActionResult> => {
			const response = await axios.post(
				`${DEFAULT_API_URL}/outbound-call-tasks/bulk-action`,
				payload
			);
			return response.data;
		},
	};
};

export default outboundApi;
