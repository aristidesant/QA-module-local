import type { ListQueryParams } from './shared';

export type QuestionAnswerType = 'CHOICE' | 'TEXT';

export interface QuestionErrorTypeListQueryParams extends ListQueryParams {
	code?: string;
	isActive?: boolean;
}

export interface QuestionOption {
	label: string;
	score: number;
}

export interface FormQuestionErrorType {
	id: number;
	clientId?: number;
	code: string;
	label: string;
	description?: string | null;
	isActive: boolean;
	createdAt?: string;
	updatedAt?: string;
	deletedAt?: string | null;
}

export interface CreateFormQuestionErrorTypePayload {
	code: string;
	label: string;
	description?: string;
	isActive?: boolean;
}

export type UpdateFormQuestionErrorTypePayload =
	Partial<CreateFormQuestionErrorTypePayload>;

export interface QaForm {
	id: number;
	clientId?: number;
	name: string;
	description?: string | null;
	category?: string | null;
	isActive: boolean;
	createdAt?: string;
	updatedAt?: string;
}

export interface FormGroup {
	id: number;
	clientId?: number;
	formId: number;
	name: string;
	description?: string | null;
	sortOrder: number;
	createdAt?: string;
	updatedAt?: string;
}

export interface FormQuestion {
	id: number;
	clientId?: number;
	formId: number;
	groupId: number;
	text: string;
	description?: string | null;
	answerType: QuestionAnswerType;
	options?: QuestionOption[] | null;
	errorTypeId?: number | null;
	errorType?: FormQuestionErrorType | null;
	weight: number;
	sortOrder: number;
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateFormPayload {
	name: string;
	description?: string;
	category?: string;
	isActive?: boolean;
}

export type UpdateFormPayload = Partial<CreateFormPayload>;

export interface CreateFormGroupPayload {
	name: string;
	description?: string;
	sortOrder?: number;
}

export type UpdateFormGroupPayload = Partial<CreateFormGroupPayload>;

export interface CreateFormQuestionPayload {
	groupId: number;
	text: string;
	description?: string;
	answerType: QuestionAnswerType;
	options?: QuestionOption[];
	errorTypeId?: number | null;
	sortOrder?: number;
}

export type UpdateFormQuestionPayload = Partial<CreateFormQuestionPayload>;

export interface FormTemplateQuestion {
	text: string;
	description?: string;
	answerType: QuestionAnswerType;
	options?: QuestionOption[];
	errorTypeId?: number | null;
	sortOrder?: number;
}

export interface FormTemplateGroup {
	name: string;
	description?: string;
	sortOrder?: number;
	questions: FormTemplateQuestion[];
}

export interface FormTemplate {
	name: string;
	description?: string;
	category?: string;
	isActive?: boolean;
	groups: FormTemplateGroup[];
}

export interface ImportFormResponse {
	form: QaForm;
	groups: Array<FormGroup & { questions: FormQuestion[] }>;
}
