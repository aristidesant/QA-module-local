import { useMutation, useQuery } from '@tanstack/react-query';

import {
	createQuestionErrorType,
	deleteQuestionErrorType,
	getQuestionErrorType,
	getQuestionErrorTypes,
	updateQuestionErrorType,
} from '~/api/qa/questionErrorTypesApi';
import type {
	CreateFormQuestionErrorTypePayload,
	QuestionErrorTypeListQueryParams,
	UpdateFormQuestionErrorTypePayload,
} from '~/models/qa';
import { formsQueryKey } from '~/queries/qa/formsQueries';
import { queryClient } from '~/queries/queryClient';

export const questionErrorTypesQueryKey = [
	'qa',
	'question-error-types',
] as const;

export const questionErrorTypesListQueryKey = (
	params?: QuestionErrorTypeListQueryParams
) => ['qa', 'question-error-types', 'list', params ?? {}] as const;

export const questionErrorTypeQueryKey = (errorTypeId: number) =>
	['qa', 'question-error-types', errorTypeId] as const;

export function useQuestionErrorTypesQuery(
	params?: QuestionErrorTypeListQueryParams
) {
	return useQuery({
		queryKey: questionErrorTypesListQueryKey(params),
		queryFn: () => getQuestionErrorTypes(params),
	});
}

export function useQuestionErrorTypeQuery(errorTypeId: number) {
	return useQuery({
		enabled: Number.isFinite(errorTypeId),
		queryKey: questionErrorTypeQueryKey(errorTypeId),
		queryFn: () => getQuestionErrorType(errorTypeId),
	});
}

async function invalidateQuestionErrorTypeConsumers() {
	await Promise.all([
		queryClient.invalidateQueries({ queryKey: questionErrorTypesQueryKey }),
		queryClient.invalidateQueries({ queryKey: formsQueryKey }),
	]);
}

export function useCreateQuestionErrorTypeMutation() {
	return useMutation({
		mutationFn: (payload: CreateFormQuestionErrorTypePayload) =>
			createQuestionErrorType(payload),
		onSuccess: invalidateQuestionErrorTypeConsumers,
	});
}

export function useUpdateQuestionErrorTypeMutation(errorTypeId: number) {
	return useMutation({
		mutationFn: (payload: UpdateFormQuestionErrorTypePayload) =>
			updateQuestionErrorType(errorTypeId, payload),
		onSuccess: async () => {
			await Promise.all([
				invalidateQuestionErrorTypeConsumers(),
				queryClient.invalidateQueries({
					queryKey: questionErrorTypeQueryKey(errorTypeId),
				}),
			]);
		},
	});
}

export function useDeleteQuestionErrorTypeMutation() {
	return useMutation({
		mutationFn: (errorTypeId: number) => deleteQuestionErrorType(errorTypeId),
		onSuccess: invalidateQuestionErrorTypeConsumers,
	});
}
