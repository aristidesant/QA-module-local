import { useMutation, useQuery } from '@tanstack/react-query';

import {
	createForm,
	createFormGroup,
	createFormQuestion,
	deleteForm,
	deleteFormGroup,
	deleteFormQuestion,
	getForm,
	getFormGroups,
	getFormQuestions,
	getFormTemplate,
	getForms,
	importFormTemplate,
	updateForm,
	updateFormGroup,
	updateFormQuestion,
} from '~/api/qa/formsApi';
import type {
	CreateFormGroupPayload,
	CreateFormPayload,
	CreateFormQuestionPayload,
	FormTemplate,
	ListQueryParams,
	UpdateFormGroupPayload,
	UpdateFormPayload,
	UpdateFormQuestionPayload,
} from '~/models/qa';

export const formsQueryKey = ['qa', 'forms'] as const;

export const formsListQueryKey = (params?: ListQueryParams) =>
	['qa', 'forms', 'list', params ?? {}] as const;

export const formQueryKey = (formId: number) =>
	['qa', 'forms', formId] as const;

export const formGroupsQueryKey = (formId: number, params?: ListQueryParams) =>
	['qa', 'forms', formId, 'groups', params ?? {}] as const;

export const formQuestionsQueryKey = (
	formId: number,
	params?: ListQueryParams
) => ['qa', 'forms', formId, 'questions', params ?? {}] as const;

export const formTemplateQueryKey = ['qa', 'forms', 'template'] as const;

export function useFormsQuery(params?: ListQueryParams) {
	return useQuery({
		queryKey: formsListQueryKey(params),
		queryFn: () => getForms(params),
	});
}

export function useFormTemplateQuery(enabled = false) {
	return useQuery({
		enabled,
		queryKey: formTemplateQueryKey,
		queryFn: getFormTemplate,
	});
}

export function useFormQuery(formId: number) {
	return useQuery({
		enabled: Number.isFinite(formId),
		queryKey: formQueryKey(formId),
		queryFn: () => getForm(formId),
	});
}

export function useFormGroupsQuery(formId: number, params?: ListQueryParams) {
	return useQuery({
		enabled: Number.isFinite(formId),
		queryKey: formGroupsQueryKey(formId, params),
		queryFn: () => getFormGroups(formId, params),
	});
}

export function useFormQuestionsQuery(
	formId: number,
	params?: ListQueryParams
) {
	return useQuery({
		enabled: Number.isFinite(formId),
		queryKey: formQuestionsQueryKey(formId, params),
		queryFn: () => getFormQuestions(formId, params),
	});
}

export function useCreateFormMutation() {
	return useMutation({
		mutationFn: (payload: CreateFormPayload) => createForm(payload),
	});
}

export function useUpdateFormMutation(formId: number) {
	return useMutation({
		mutationFn: (payload: UpdateFormPayload) => updateForm(formId, payload),
	});
}

export function useDeleteFormMutation() {
	return useMutation({
		mutationFn: (formId: number) => deleteForm(formId),
	});
}

export function useImportFormTemplateMutation() {
	return useMutation({
		mutationFn: (payload: FormTemplate) => importFormTemplate(payload),
	});
}

export function useCreateFormGroupMutation(formId: number) {
	return useMutation({
		mutationFn: (payload: CreateFormGroupPayload) =>
			createFormGroup(formId, payload),
	});
}

export function useUpdateFormGroupMutation(formId: number) {
	return useMutation({
		mutationFn: ({
			groupId,
			payload,
		}: {
			groupId: number;
			payload: UpdateFormGroupPayload;
		}) => updateFormGroup(formId, groupId, payload),
	});
}

export function useDeleteFormGroupMutation(formId: number) {
	return useMutation({
		mutationFn: (groupId: number) => deleteFormGroup(formId, groupId),
	});
}

export function useCreateFormQuestionMutation(formId: number) {
	return useMutation({
		mutationFn: (payload: CreateFormQuestionPayload) =>
			createFormQuestion(formId, payload),
	});
}

export function useUpdateFormQuestionMutation(formId: number) {
	return useMutation({
		mutationFn: ({
			questionId,
			payload,
		}: {
			questionId: number;
			payload: UpdateFormQuestionPayload;
		}) => updateFormQuestion(formId, questionId, payload),
	});
}

export function useDeleteFormQuestionMutation(formId: number) {
	return useMutation({
		mutationFn: (questionId: number) => deleteFormQuestion(formId, questionId),
	});
}
