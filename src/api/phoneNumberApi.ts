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
