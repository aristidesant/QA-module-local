import axios from 'axios';
import type { PhoneNumber } from '../models/PhoneNumber';
import { DEFAULT_API_URL } from './config';

export interface PhoneNumberListParams {
	label?: string;
	status?: 'Active' | 'Inactive';
	provider?: 'twilio' | 'sip_trunk';
	type?: 'INBOUND' | 'OUTBOUND' | 'HYBRID';
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: 'ASC' | 'DESC';
}

export interface PhoneNumberListResponse {
	data: PhoneNumber[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface SimplePhoneNumberListParams {
	type?: 'INBOUND' | 'OUTBOUND' | 'HYBRID';
}

export interface SimplePhoneNumber {
	id: number;
	phoneNumber: string;
	label: string;
}

export interface LinkPhoneNumberParams {
	agentId: string;
	phoneNumberId: number;
}

export interface SipTrunkPhoneNumberParams {
	phoneNumber: string;
	label: string;
	terminationUri: string;
	type?: 'INBOUND' | 'OUTBOUND' | 'HYBRID';
	address?: string;
	transport?: 'auto' | 'udp' | 'tcp' | 'tls';
	mediaEncryption?: 'disabled' | 'allowed' | 'required';
	inboundMediaEncryption?: 'disabled' | 'allowed' | 'required';
	headers?: Record<string, string> | null;
	credentials?: {
		username?: string;
		password?: string;
	} | null;
	clientId: number;
	agentId?: string;
}

/**
 * Retrieves all phone numbers with optional filters, pagination and sorting
 */
export const getPhoneNumbers = async (
	params?: PhoneNumberListParams,
	apiUrl: string = DEFAULT_API_URL
): Promise<PhoneNumberListResponse> => {
	const response = await axios.get<PhoneNumberListResponse>(
		`${apiUrl}/phone-numbers`,
		{
			params,
		}
	);
	return response.data;
};

/**
 * Retrieves a simple list of phone numbers filtered by type
 */
export const getSimplePhoneNumberList = async (
	params?: SimplePhoneNumberListParams,
	apiUrl: string = DEFAULT_API_URL
): Promise<SimplePhoneNumber[]> => {
	const response = await axios.get<SimplePhoneNumber[]>(
		`${apiUrl}/phone-numbers/simple/list`,
		{
			params,
		}
	);
	return response.data;
};

/**
 * Links an inbound phone number to an agent
 */
export const linkInboundPhoneNumber = async (
	params: LinkPhoneNumberParams,
	apiUrl: string = DEFAULT_API_URL
): Promise<void> => {
	await axios.post(`${apiUrl}/phone-numbers/link-inbound`, params);
};

/**
 * Links an outbound phone number to an agent
 */
export const linkOutboundPhoneNumber = async (
	params: LinkPhoneNumberParams,
	apiUrl: string = DEFAULT_API_URL
): Promise<void> => {
	await axios.post(`${apiUrl}/phone-numbers/link-outbound`, params);
};

/**
 * Creates a new SIP trunk phone number entry
 */
export const createSipTrunkPhoneNumber = async (
	params: SipTrunkPhoneNumberParams,
	apiUrl: string = DEFAULT_API_URL
): Promise<void> => {
	await axios.post(`${apiUrl}/phone-numbers/sip-trunk`, params);
};

export interface TwilioPhoneNumberParams {
	phoneNumber: string;
	label: string;
	sid: string;
	token: string;
	provider?: 'twilio';
	type?: 'INBOUND' | 'OUTBOUND' | 'HYBRID';
	clientId: number;
}

/**
 * Creates a new Twilio phone number entry
 */
export const createTwilioPhoneNumber = async (
	params: TwilioPhoneNumberParams,
	apiUrl: string = DEFAULT_API_URL
): Promise<void> => {
	await axios.post(`${apiUrl}/phone-numbers/twilio`, params);
};

/**
 * Unlinks an inbound phone number from an agent
 */
export const unlinkInboundPhoneNumber = async (
	agentId: string,
	apiUrl: string = DEFAULT_API_URL
): Promise<void> => {
	await axios.post(`${apiUrl}/phone-numbers/unlink-inbound`, { agentId });
};

/**
 * Unlinks an outbound phone number from an agent
 */
export const unlinkOutboundPhoneNumber = async (
	agentId: string,
	apiUrl: string = DEFAULT_API_URL
): Promise<void> => {
	await axios.post(`${apiUrl}/phone-numbers/unlink-outbound`, { agentId });
};

/**
 * Updates a SIP trunk phone number entry
 */
export const updateSipTrunkPhoneNumber = async (
	id: number,
	params: SipTrunkPhoneNumberParams,
	apiUrl: string = DEFAULT_API_URL
): Promise<void> => {
	await axios.patch(`${apiUrl}/phone-numbers/${id}/sip-trunk`, params);
};

/**
 * Updates a Twilio phone number entry
 */
export const updateTwilioPhoneNumber = async (
	id: number,
	params: TwilioPhoneNumberParams,
	apiUrl: string = DEFAULT_API_URL
): Promise<void> => {
	await axios.patch(`${apiUrl}/phone-numbers/${id}/twilio`, params);
};

/**
 * Deletes a phone number (soft delete)
 */
export const deletePhoneNumber = async (
	id: number,
	apiUrl: string = DEFAULT_API_URL
): Promise<void> => {
	await axios.delete(`${apiUrl}/phone-numbers/${id}`);
};
