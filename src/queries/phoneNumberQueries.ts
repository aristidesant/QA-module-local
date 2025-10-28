import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
	getPhoneNumbers,
	getSimplePhoneNumberList,
	type PhoneNumberListParams,
	type PhoneNumberListResponse,
	type SimplePhoneNumberListParams,
	type SimplePhoneNumber,
} from '~/api/phoneNumberApi';

export const phoneNumberKeys = {
	all: ['phoneNumbers'] as const,
	lists: () => [...phoneNumberKeys.all, 'list'] as const,
	list: (params?: PhoneNumberListParams) =>
		[...phoneNumberKeys.lists(), params] as const,
	simple: () => [...phoneNumberKeys.all, 'simple'] as const,
	simpleList: (params?: SimplePhoneNumberListParams) =>
		[...phoneNumberKeys.simple(), params] as const,
};

/**
 * Hook to fetch phone numbers with pagination, filtering and sorting
 */
export const usePhoneNumbers = (
	params?: PhoneNumberListParams,
	options?: Omit<
		UseQueryOptions<PhoneNumberListResponse, Error>,
		'queryKey' | 'queryFn'
	>
) => {
	return useQuery<PhoneNumberListResponse, Error>({
		queryKey: phoneNumberKeys.list(params),
		queryFn: () => getPhoneNumbers(params),
		...options,
	});
};

/**
 * Hook to fetch a simple list of phone numbers filtered by type
 */
export const useSimplePhoneNumberList = (
	params?: SimplePhoneNumberListParams,
	options?: Omit<
		UseQueryOptions<SimplePhoneNumber[], Error>,
		'queryKey' | 'queryFn'
	>
) => {
	return useQuery<SimplePhoneNumber[], Error>({
		queryKey: phoneNumberKeys.simpleList(params),
		queryFn: () => getSimplePhoneNumberList(params),
		...options,
	});
};
