import axios from 'axios';
import type { ConversationsModel } from '~/models/ConversationsModels';
import { DEFAULT_API_URL } from './config';
import { PaginatedResponse } from '~/models/CampaignsModel';

export type StartDemoParams = {
	agentId: string;
	phoneNumber: string;
	campaignId?: number;
	dynamicVariables?: {
		customerName: string;
		customerId: string;
	};
};

export type Conversation = {
	id: string;
	// Add other conversation fields as needed
	[key: string]: unknown;
};

export type UpdateConversationParams = {
	// Add fields that can be updated in a conversation
	[key: string]: unknown;
};

export type PostCallDataParams = {
	// Add fields for post-call data
	[key: string]: unknown;
};

/**
 * Generic Conversations API client (uses global axios interceptors for auth)
 */
const conversationsApi = (_authHeader: Record<string, string> = {}) => {
	return {
		// Create a new conversation
		createConversation: async (data: Record<string, unknown>) => {
			const response = await axios.post<Conversation>(
				`${DEFAULT_API_URL}/conversations`,
				data
			);
			return response.data;
		},

		getConversations: async (
			campaignId?: string | number,
			contactGroupId?: string | number,
			params?: {
				limit?: number;
				offset?: number;
				search?: string;
				contactName?: string;
				contactPhoneNumber?: string;
				dispositionName?: string;
				status?: string;
				sortBy?: string;
				sortOrder?: 'asc' | 'desc';
			}
		) => {
			const response = await axios.get<PaginatedResponse<ConversationsModel>>(
				`${DEFAULT_API_URL}/conversations`,
				{
					params: {
						...params,
						...(campaignId ? { campaignId } : {}),
						...(contactGroupId ? { contactGroupId } : {}),
					},
				}
			);
			return response.data;
		},

		// Start a new conversation
		startConversation: async (data: Record<string, unknown>) => {
			const response = await axios.post<Conversation>(
				`${DEFAULT_API_URL}/conversations/start`,
				data
			);
			return response.data;
		},

		// Start demo conversation
		startDemoConversation: async (params: StartDemoParams) => {
			const response = await axios.post<Conversation>(
				`${DEFAULT_API_URL}/conversations/start-demo`,
				params
			);
			return response.data;
		},

		// Webhook to receive post-call data
		postCallData: async (data: PostCallDataParams) => {
			const response = await axios.post<void>(
				`${DEFAULT_API_URL}/conversations/webhook/post-call-data`,
				data
			);
			return response.data;
		},

		// Get conversation by ID
		getConversationById: async (id: string) => {
			const response = await axios.get<ConversationsModel>(
				`${DEFAULT_API_URL}/conversations/${id}`
			);
			return response.data;
		},

		// Update a conversation
		updateConversation: async (id: string, data: UpdateConversationParams) => {
			const response = await axios.patch<Conversation>(
				`${DEFAULT_API_URL}/conversations/${id}`,
				data
			);
			return response.data;
		},

		// Delete a conversation
		deleteConversation: async (id: string) => {
			const response = await axios.delete<void>(
				`${DEFAULT_API_URL}/conversations/${id}`
			);
			return response.data;
		},

		// Export conversations as CSV file
		exportConversationsCsv: async (params: {
			startDate: string; // ISO string e.g., 2025-08-01T00:00:00Z
			endDate: string; // ISO string e.g., 2025-08-13T23:59:59Z
			// NOTE: Backend expects the misspelled key "campaingType" per API docs screenshot
			campaingType: 'inbound' | 'outbound';
		}) => {
			const response = await axios.get<Blob>(
				`${DEFAULT_API_URL}/conversations/export/csv`,
				{
					params,
					responseType: 'blob',
				}
			);

			// Try to extract filename from Content-Disposition; fall back to default
			const contentDisposition = response.headers?.['content-disposition'] as
				| string
				| undefined;
			let filename = 'conversations.csv';
			if (contentDisposition) {
				const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(
					contentDisposition
				);
				const raw = decodeURIComponent(match?.[1] || match?.[2] || '');
				if (raw) filename = raw;
			}

			return { blob: response.data, filename };
		},

		// Export conversation audio file
		exportConversationAudio: async (id: string | number) => {
			const response = await axios.get<Blob>(
				`${DEFAULT_API_URL}/conversations/export/${id}/audio`,
				{
					responseType: 'blob',
				}
			);

			// Try to extract filename from Content-Disposition; fall back to default
			const contentDisposition = response.headers?.['content-disposition'] as
				| string
				| undefined;
			let filename = `conversation-${id}-audio.mp3`;
			if (contentDisposition) {
				const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(
					contentDisposition
				);
				const raw = decodeURIComponent(match?.[1] || match?.[2] || '');
				if (raw) filename = raw;
			}

			return { blob: response.data, filename };
		},

		// Export a single conversation as PDF
		exportConversationPdf: async (id: string | number) => {
			const response = await axios.get<Blob>(
				`${DEFAULT_API_URL}/conversations/${id}/export?format=PDF`,
				{
					responseType: 'blob',
				}
			);

			// Try to extract filename from Content-Disposition; fall back to default
			const contentDisposition = response.headers?.['content-disposition'] as
				| string
				| undefined;
			let filename = `conversation-${id}.pdf`;
			if (contentDisposition) {
				const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(
					contentDisposition
				);
				const raw = decodeURIComponent(match?.[1] || match?.[2] || '');
				if (raw) filename = raw;
			}

			return { blob: response.data, filename };
		},

		// Fail and pause a conversation
		failAndPauseConversation: async (id: string) => {
			const response = await axios.post<void>(
				`${DEFAULT_API_URL}/conversations/${id}/fail-and-pause`
			);
			return response.data;
		},

		// Fetch and process a conversation
		fetchAndProcessConversation: async (id: string) => {
			const response = await axios.post<void>(
				`${DEFAULT_API_URL}/conversations/${id}/fetch-and-process`
			);
			return response.data;
		},
	};
};
export default conversationsApi;
