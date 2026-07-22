import type {
	CreateFormQuestionErrorTypePayload,
	FormQuestionErrorType,
	PaginatedResponse,
	QuestionErrorTypeListQueryParams,
	UpdateFormQuestionErrorTypePayload,
} from '~/models/qa';
import { qaHttpClient } from '~/api/qa/qaConfig';

export async function getQuestionErrorTypes(
	params?: QuestionErrorTypeListQueryParams
) {
	const response = await qaHttpClient.get<
		PaginatedResponse<FormQuestionErrorType>
	>('/question-error-types', { params });

	return response.data;
}

export async function getQuestionErrorType(errorTypeId: number) {
	const response = await qaHttpClient.get<FormQuestionErrorType>(
		`/question-error-types/${errorTypeId}`
	);

	return response.data;
}

export async function createQuestionErrorType(
	payload: CreateFormQuestionErrorTypePayload
) {
	const response = await qaHttpClient.post<FormQuestionErrorType>(
		'/question-error-types',
		payload
	);

	return response.data;
}

export async function updateQuestionErrorType(
	errorTypeId: number,
	payload: UpdateFormQuestionErrorTypePayload
) {
	const response = await qaHttpClient.patch<FormQuestionErrorType>(
		`/question-error-types/${errorTypeId}`,
		payload
	);

	return response.data;
}

export async function deleteQuestionErrorType(errorTypeId: number) {
	const response = await qaHttpClient.delete<{ message: string }>(
		`/question-error-types/${errorTypeId}`
	);

	return response.data;
}
