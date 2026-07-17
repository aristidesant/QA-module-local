import type { QuestionFormValues } from './FormBuilderPage.types';

/** Derives a question's weight from its highest-scoring option (0 for TEXT). */
export function getQuestionWeight(values: QuestionFormValues) {
	if (values.answerType === 'TEXT') {
		return 0;
	}

	return values.options.reduce(
		(max, option) => Math.max(max, Number(option.score || 0)),
		0
	);
}
