import type {
	CreateFormGroupPayload,
	CreateFormPayload,
	CreateFormQuestionPayload,
	FormGroup,
	FormQuestion,
	FormTemplate,
	ImportFormResponse,
	ListQueryParams,
	PaginatedResponse,
	QaForm,
	UpdateFormGroupPayload,
	UpdateFormPayload,
	UpdateFormQuestionPayload,
} from '~/models/qa';
import { qaHttpClient } from '~/api/qa/qaConfig';

function toListParams(params?: ListQueryParams) {
	return {
		pagination: params?.pagination,
		limit: params?.limit,
		offset: params?.offset,
	};
}

export async function getForms(params?: ListQueryParams) {
	const response = await qaHttpClient.get<PaginatedResponse<QaForm>>('/forms', {
		params: toListParams(params),
	});

	return response.data;
}

export async function getFormTemplate() {
	const response = await qaHttpClient.get<FormTemplate>('/forms/template');

	return response.data;
}

export async function importFormTemplate(payload: FormTemplate) {
	const response = await qaHttpClient.post<ImportFormResponse>(
		'/forms/import',
		payload
	);

	return response.data;
}

export async function getForm(formId: number) {
	const response = await qaHttpClient.get<QaForm>(`/forms/${formId}`);

	return response.data;
}

export async function createForm(payload: CreateFormPayload) {
	const response = await qaHttpClient.post<QaForm>('/forms', payload);

	return response.data;
}

export async function updateForm(formId: number, payload: UpdateFormPayload) {
	const response = await qaHttpClient.patch<QaForm>(
		`/forms/${formId}`,
		payload
	);

	return response.data;
}

export async function deleteForm(formId: number) {
	const response = await qaHttpClient.delete<{ message: string }>(
		`/forms/${formId}`
	);

	return response.data;
}

export async function getFormGroups(formId: number, params?: ListQueryParams) {
	const response = await qaHttpClient.get<PaginatedResponse<FormGroup>>(
		`/forms/${formId}/groups`,
		{
			params: toListParams(params),
		}
	);

	return response.data;
}

export async function createFormGroup(
	formId: number,
	payload: CreateFormGroupPayload
) {
	const response = await qaHttpClient.post<FormGroup>(
		`/forms/${formId}/groups`,
		payload
	);

	return response.data;
}

export async function updateFormGroup(
	formId: number,
	groupId: number,
	payload: UpdateFormGroupPayload
) {
	const response = await qaHttpClient.patch<FormGroup>(
		`/forms/${formId}/groups/${groupId}`,
		payload
	);

	return response.data;
}

export async function deleteFormGroup(formId: number, groupId: number) {
	const response = await qaHttpClient.delete<{ message: string }>(
		`/forms/${formId}/groups/${groupId}`
	);

	return response.data;
}

export async function getFormQuestions(
	formId: number,
	params?: ListQueryParams
) {
	const response = await qaHttpClient.get<PaginatedResponse<FormQuestion>>(
		`/forms/${formId}/questions`,
		{
			params: toListParams(params),
		}
	);

	return response.data;
}

export async function createFormQuestion(
	formId: number,
	payload: CreateFormQuestionPayload
) {
	const response = await qaHttpClient.post<FormQuestion>(
		`/forms/${formId}/questions`,
		payload
	);

	return response.data;
}

export async function updateFormQuestion(
	formId: number,
	questionId: number,
	payload: UpdateFormQuestionPayload
) {
	const response = await qaHttpClient.patch<FormQuestion>(
		`/forms/${formId}/questions/${questionId}`,
		payload
	);

	return response.data;
}

export async function deleteFormQuestion(formId: number, questionId: number) {
	const response = await qaHttpClient.delete<{ message: string }>(
		`/forms/${formId}/questions/${questionId}`
	);

	return response.data;
}
