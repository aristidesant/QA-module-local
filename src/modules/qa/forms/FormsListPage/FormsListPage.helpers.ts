import type { FormTemplate } from '~/models/qa';

export function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isFormTemplate(value: unknown): value is FormTemplate {
	return (
		isRecord(value) &&
		typeof value.name === 'string' &&
		Array.isArray(value.groups) &&
		value.groups.every(
			(group) =>
				isRecord(group) &&
				typeof group.name === 'string' &&
				Array.isArray(group.questions) &&
				group.questions.every(
					(question) =>
						isRecord(question) &&
						typeof question.text === 'string' &&
						(question.answerType === 'CHOICE' || question.answerType === 'TEXT')
				)
		)
	);
}

export function getInvalidErrorTypeAssignment(
	template: FormTemplate,
	activeErrorTypeIds: Set<number>
) {
	for (const group of template.groups) {
		for (const question of group.questions) {
			const errorTypeId = question.errorTypeId;

			if (errorTypeId === undefined || errorTypeId === null) continue;

			if (
				!Number.isInteger(errorTypeId) ||
				errorTypeId <= 0 ||
				!activeErrorTypeIds.has(errorTypeId)
			) {
				return {
					errorTypeId,
					groupName: group.name,
					questionText: question.text,
				};
			}
		}
	}

	return null;
}
