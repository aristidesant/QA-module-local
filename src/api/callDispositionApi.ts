import axios from 'axios';
import type {
	CallDispositionFilters,
	CallDispositionModel,
} from '../models/CallDispositionModel';
import { DEFAULT_API_URL } from './config';

const serializeQueryParams = (params?: object) => {
	if (!params) return undefined;

	return Object.fromEntries(
		Object.entries(params as Record<string, unknown>).flatMap(
			([key, value]) => {
				if (value === undefined || value === null || value === '') {
					return [];
				}

				return [[key, typeof value === 'boolean' ? String(value) : value]];
			}
		)
	);
};

/**
 * Call Disposition API client
 * Note: Authorization is set by a global Axios interceptor.
 */
const callDispositionApi = (_authHeader?: Record<string, string>) => {
	return {
		// CREATE call disposition
		createCallDisposition: async (data: Partial<CallDispositionModel>) => {
			const response = await axios.post(
				`${DEFAULT_API_URL}/call-dispositions`,
				data
			);
			return response.data;
		},

		// FIND ALL call dispositions (by conversationId)
		findAllCallDispositions: async (params: { conversationId: string }) => {
			const response = await axios.get<CallDispositionModel>(
				`${DEFAULT_API_URL}/call-dispositions/details`,
				{
					params,
					timeout: 5000,
				}
			);
			return response.data;
		},

		// FIND call disposition by conversationId
		findCallDispositionByConversationId: async (conversationId: number) => {
			const response = await axios.get<CallDispositionModel>(
				`${DEFAULT_API_URL}/call-dispositions/conversation/${conversationId}`
			);
			return response.data;
		},

		// FIND ONE call disposition
		findCallDisposition: async (id: string) => {
			const response = await axios.get<CallDispositionModel>(
				`${DEFAULT_API_URL}/call-dispositions/${id}`
			);
			return response.data;
		},

		// UPDATE call disposition (PATCH)
		updateCallDisposition: async (
			id: string,
			data: Partial<CallDispositionModel>
		) => {
			const response = await axios.patch(
				`${DEFAULT_API_URL}/call-dispositions/${id}`,
				data
			);
			return response.data;
		},

		// DELETE call disposition
		deleteCallDisposition: async (id: string) => {
			const response = await axios.delete(
				`${DEFAULT_API_URL}/call-dispositions/${id}`
			);
			return response.data;
		},

		// GET call disposition report
		getCallDispositionReport: async (params: CallDispositionFilters) => {
			const response = await axios.get(
				`${DEFAULT_API_URL}/call-dispositions/report`,
				{
					params: serializeQueryParams(params),
				}
			);
			return response.data;
		},
		getCallDispositionReportParents: async (params: {
			campaignId?: number;
			dispositionName?: string;
		}) => {
			const { dispositionName, ...otherParams } = params;
			const response = await axios.get(
				`${DEFAULT_API_URL}/call-dispositions/report/disposition${params?.dispositionName ? `/${params?.dispositionName}` : ''}`,
				{
					params: otherParams,
				}
			);
			return response.data;
		},

		// WITH AI: generate or refresh a disposition using AI for a conversation
		withAi: async (conversationId: number) => {
			const response = await axios.post(
				`${DEFAULT_API_URL}/call-dispositions/with-ai`,
				{ conversationId }
			);
			return response.data;
		},
	};
};

export default callDispositionApi;
