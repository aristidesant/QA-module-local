import {
	useQuery,
	useMutation,
	useQueryClient,
	type UseQueryOptions,
} from '@tanstack/react-query';
import {
	getPhoneNumbers,
	getSimplePhoneNumberList,
	type PhoneNumberListParams,
	type PhoneNumberListResponse,
	type SimplePhoneNumberListParams,
	type SimplePhoneNumber,
	deletePhoneNumber,
	bulkDeletePhoneNumbers,
	createTwilioPhoneNumber,
	createSipTrunkPhoneNumber,
	updateTwilioPhoneNumber,
	updateSipTrunkPhoneNumber,
	type TwilioPhoneNumberParams,
	type SipTrunkPhoneNumberParams,
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

/**
 * Hook to delete a phone number
 */
export const useDeletePhoneNumber = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => deletePhoneNumber(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: phoneNumberKeys.all });
		},
	});
};

/**
 * Hook to create a Twilio phone number
 */
export const useCreateTwilioPhoneNumber = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (params: TwilioPhoneNumberParams) =>
			createTwilioPhoneNumber(params),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: phoneNumberKeys.all });
		},
	});
};

/**
 * Hook to create a SIP trunk phone number
 */
export const useCreateSipTrunkPhoneNumber = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (params: SipTrunkPhoneNumberParams) =>
			createSipTrunkPhoneNumber(params),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: phoneNumberKeys.all });
		},
	});
};

/**
 * Hook to update a Twilio phone number
 */
export const useUpdateTwilioPhoneNumber = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			params,
		}: {
			id: number;
			params: TwilioPhoneNumberParams;
		}) => updateTwilioPhoneNumber(id, params),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: phoneNumberKeys.all });
		},
	});
};

/**
 * Hook to update a SIP trunk phone number
 */
export const useUpdateSipTrunkPhoneNumber = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			params,
		}: {
			id: number;
			params: SipTrunkPhoneNumberParams;
		}) => updateSipTrunkPhoneNumber(id, params),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: phoneNumberKeys.all });
		},
	});
};

/**
 * Hook to bulk delete phone numbers
 */
export const useBulkDeletePhoneNumbers = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (ids: number[]) => bulkDeletePhoneNumbers(ids),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: phoneNumberKeys.all });
		},
	});
};
