import axios from 'axios';
import type {
	ContactFileSummary,
	ProcessContactGroupFileRequest,
	ProcessContactGroupFileResponse,
	AppendContactGroupFileRequest,
	AppendContactGroupFileResponse,
} from '~/models/ContactFileSummary';
import { DEFAULT_API_URL } from './config';

/**
 * Contact Group Files API client
 * Note: Authorization handled by global Axios interceptor.
 */
const contactGroupFilesApi = (_authHeader?: Record<string, string>) => {
	return {
		/**
		 * Uploads a contact group file
		 * @param file - The CSV file to upload
		 * @param campaignId - The campaign ID to associate with the file
		 * @returns The uploaded file information
		 */
		uploadContactGroupFile: async (file: File, campaignId: number) => {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('campaignId', campaignId.toString());

			const response = await axios.post<ContactFileSummary>(
				`${DEFAULT_API_URL}/contact-group-files/upload`,
				formData
			);
			return response.data;
		},

		/**
		 * Processes a contact group file with the provided field mappings
		 * @param data - The processing configuration including field mappings
		 * @returns The processing result with status and statistics
		 */
		processContactGroupFile: async (
			data: ProcessContactGroupFileRequest
		): Promise<ProcessContactGroupFileResponse> => {
			const response = await axios.post<ProcessContactGroupFileResponse>(
				`${DEFAULT_API_URL}/contact-group-files/process`,
				data
			);
			return response.data;
		},

		/**
		 * Appends contacts from a previously uploaded contact group file into an existing contact group
		 * @param contactGroupId - The target contact group identifier
		 * @param data - The request payload with file and schema IDs
		 * @returns Processing summary
		 */
		appendToContactGroup: async (
			contactGroupId: number,
			data: AppendContactGroupFileRequest
		): Promise<AppendContactGroupFileResponse> => {
			const response = await axios.post<AppendContactGroupFileResponse>(
				`${DEFAULT_API_URL}/contact-group-files/contact-groups/${contactGroupId}/append`,
				data
			);
			return response.data;
		},

		/**
		 * Retrieves the most recent contact group file for a specific contact group
		 * @param contactGroupId - Contact group identifier
		 * @returns Contact file summary
		 */
		getLatestContactGroupFile: async (
			contactGroupId: number
		): Promise<ContactFileSummary> => {
			const response = await axios.get<ContactFileSummary>(
				`${DEFAULT_API_URL}/contact-group-files/contact-group/${contactGroupId}`
			);
			return response.data;
		},

		/**
		 * Exports the original contact group file (CSV) using stored field mapping and original column order.
		 * @param contactGroupId - The contact group identifier
		 * @returns A string (e.g. presigned URL or CSV content reference)
		 */
		exportContactGroupFileOriginal: async (contactGroupId: number) => {
			const response = await axios.get<string>(
				`${DEFAULT_API_URL}/contact-group-files/${contactGroupId}/export`
			);
			return response.data;
		},
	};
};

export default contactGroupFilesApi;
