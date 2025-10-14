import axios from 'axios';
import type {
	DoNotCallListParams,
	DoNotCallListResponse,
	DoNotCallCreateRequest,
	DoNotCallUpdateRequest,
	DoNotCallCheckResponse,
	DoNotCallCleanExpiredResponse,
	DoNotCallModel,
} from '~/models/DoNotCallModel';
import { DEFAULT_API_URL } from './config';

export const doNotCallApi = {
	/**
	 * Get all DNC entries with optional filters
	 */
	getAll: async (
		params?: DoNotCallListParams
	): Promise<DoNotCallListResponse> => {
		const response = await axios.get<DoNotCallListResponse>(
			`${DEFAULT_API_URL}/do-not-call`,
			{ params }
		);
		return response.data;
	},

	/**
	 * Get a specific DNC entry by ID
	 */
	getById: async (id: number): Promise<DoNotCallModel> => {
		const response = await axios.get<DoNotCallModel>(
			`${DEFAULT_API_URL}/do-not-call/${id}`
		);
		return response.data;
	},

	/**
	 * Check if a phone number is in the DNC list
	 */
	check: async (phoneNumber: string): Promise<DoNotCallCheckResponse> => {
		const response = await axios.get<DoNotCallCheckResponse>(
			`${DEFAULT_API_URL}/do-not-call/check/${encodeURIComponent(phoneNumber)}`
		);
		return response.data;
	},

	/**
	 * Create a new DNC entry
	 */
	create: async (data: DoNotCallCreateRequest): Promise<DoNotCallModel> => {
		const response = await axios.post<DoNotCallModel>(
			`${DEFAULT_API_URL}/do-not-call`,
			data
		);
		return response.data;
	},

	/**
	 * Update an existing DNC entry
	 */
	update: async (
		id: number,
		data: DoNotCallUpdateRequest
	): Promise<DoNotCallModel> => {
		const response = await axios.patch<DoNotCallModel>(
			`${DEFAULT_API_URL}/do-not-call/${id}`,
			data
		);
		return response.data;
	},

	/**
	 * Soft delete a DNC entry
	 */
	delete: async (id: number): Promise<void> => {
		await axios.delete(`${DEFAULT_API_URL}/do-not-call/${id}`);
	},

	/**
	 * Clean all expired DNC entries for the current client
	 */
	cleanExpired: async (): Promise<DoNotCallCleanExpiredResponse> => {
		const response = await axios.post<DoNotCallCleanExpiredResponse>(
			`${DEFAULT_API_URL}/do-not-call/clean-expired`
		);
		return response.data;
	},
};
