import type { QuestionAnswerType, QuestionOption } from '~/models/qa';

export interface QuestionFormValues {
	groupId: string;
	text: string;
	description: string;
	answerType: QuestionAnswerType;
	options: QuestionOption[];
	errorTypeId: string | null;
	sortOrder: number;
}
