import type { QuestionOption } from '~/models/qa';

export const DEFAULT_QUESTION_OPTIONS: QuestionOption[] = [
	{ label: 'Excelente', score: 10 },
	{ label: 'Regular', score: 5 },
	{ label: 'Malo', score: 0 },
];
