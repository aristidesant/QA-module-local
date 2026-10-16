import type {
	BuilderForm,
	BuilderOption,
	BuilderQuestion,
	BuilderSection,
	BuilderSelection,
	CreateFormValues,
	FormModality,
	StandardQuestion,
} from './types';

let counter = 100;
const nextId = (prefix: string) =>
	`${prefix}-${String(++counter).padStart(3, '0')}`;
export const nextFormId = () => nextId('frm');
export const nextSectionId = () => nextId('sec');
export const nextQuestionId = () => nextId('q');
export const nextOptionId = () => nextId('opt');

export const nowIso = () => new Date().toISOString();

export const createEmptyOption = (label = '', score = 0): BuilderOption => ({
	id: nextOptionId(),
	label,
	score,
});

export const defaultOptions = (): BuilderOption[] => [
	createEmptyOption('Excellent', 10),
	createEmptyOption('Fair', 5),
	createEmptyOption('Poor', 0),
];

export const createEmptyQuestion = (
	modality: FormModality
): BuilderQuestion => {
	const base = {
		id: nextQuestionId(),
		text: '',
		guidance: '',
		isActive: true,
		notApplicable: false,
		requiresAgentIdentity: false,
		autoFail: 'NONE' as const,
	};
	return modality === 'COPC'
		? {
				...base,
				modality: 'COPC',
				favorableAnswer: 'YES',
				errorCode: null,
				campaignType: 'ALL',
			}
		: {
				...base,
				modality: 'STANDARD',
				answerType: 'MULTIPLE_CHOICE',
				options: defaultOptions(),
			};
};

export const createEmptySection = (): BuilderSection => ({
	id: nextSectionId(),
	name: '',
	guidance: '',
	questions: [],
});

export const createEmptyForm = (values: CreateFormValues): BuilderForm => {
	const at = nowIso();
	return {
		id: nextFormId(),
		name: values.name.trim(),
		description: values.description.trim(),
		category: values.category.trim(),
		modality: values.modality,
		isActive: true,
		sections: [],
		createdAt: at,
		updatedAt: at,
	};
};

/** Deep copy with fresh ids for the form, its sections, questions and options. */
export const duplicateForm = (
	source: BuilderForm,
	copySuffix: string
): BuilderForm => ({
	...source,
	id: nextFormId(),
	name: `${source.name} ${copySuffix}`,
	isActive: false,
	createdAt: nowIso(),
	updatedAt: nowIso(),
	sections: source.sections.map((s) => ({
		...s,
		id: nextSectionId(),
		questions: s.questions.map(
			(q): BuilderQuestion =>
				q.modality === 'STANDARD'
					? {
							...q,
							id: nextQuestionId(),
							options: q.options.map((o) => ({ ...o, id: nextOptionId() })),
						}
					: { ...q, id: nextQuestionId() }
		),
	})),
});

export const countQuestions = (form: BuilderForm) =>
	form.sections.reduce((n, s) => n + s.questions.length, 0);

/** Highest option score; 0 for open answers. */
export const getQuestionWeight = (q: StandardQuestion) =>
	q.answerType === 'OPEN' ? 0 : Math.max(0, ...q.options.map((o) => o.score));

/** Max total a Standard form can score: sum of active, applicable question weights. */
export const getFormMaxScore = (form: BuilderForm) =>
	form.sections
		.flatMap((s) => s.questions)
		.filter(
			(q): q is StandardQuestion =>
				q.modality === 'STANDARD' && q.isActive && !q.notApplicable
		)
		.reduce((n, q) => n + getQuestionWeight(q), 0);

export const findSection = (form: BuilderForm, sectionId: string) =>
	form.sections.find((s) => s.id === sectionId) ?? null;

export const findQuestion = (form: BuilderForm, questionId: string) => {
	for (const section of form.sections) {
		const question = section.questions.find((q) => q.id === questionId);
		if (question) return { section, question };
	}
	return null;
};

const move = <T>(list: T[], from: number, to: number): T[] => {
	const next = [...list];
	const [item] = next.splice(from, 1);
	next.splice(to, 0, item);
	return next;
};

export const reorderSections = (
	form: BuilderForm,
	from: number,
	to: number
): BuilderForm => ({
	...form,
	sections: move(form.sections, from, to),
});

export interface MoveQuestionArgs {
	fromSectionId: string;
	toSectionId: string;
	fromIndex: number;
	toIndex: number;
}

export const moveQuestion = (
	form: BuilderForm,
	a: MoveQuestionArgs
): BuilderForm => {
	if (a.fromSectionId === a.toSectionId) {
		return {
			...form,
			sections: form.sections.map((s) =>
				s.id === a.fromSectionId
					? { ...s, questions: move(s.questions, a.fromIndex, a.toIndex) }
					: s
			),
		};
	}
	const source = findSection(form, a.fromSectionId);
	const moved = source?.questions[a.fromIndex];
	if (!moved) return form;
	return {
		...form,
		sections: form.sections.map((s) => {
			if (s.id === a.fromSectionId)
				return {
					...s,
					questions: s.questions.filter((_, i) => i !== a.fromIndex),
				};
			if (s.id === a.toSectionId) {
				const questions = [...s.questions];
				questions.splice(a.toIndex, 0, moved);
				return { ...s, questions };
			}
			return s;
		}),
	};
};

/** Serialises without the volatile timestamp so a saved draft compares equal to the store. */
export const formSignature = (form: BuilderForm | null) =>
	form ? JSON.stringify({ ...form, updatedAt: '' }) : '';

export type DraftErrorKey =
	| 'nameRequired'
	| 'sectionNameRequired'
	| 'questionRequired'
	| 'optionsRequired'
	| 'errorTypeRequired';

export interface DraftError {
	key: DraftErrorKey;
	selection: BuilderSelection;
}

/** First problem found, in outline order, or null when the draft can be saved. */
export const validateDraft = (form: BuilderForm): DraftError | null => {
	if (!form.name.trim())
		return { key: 'nameRequired', selection: { kind: 'form' } };
	for (const section of form.sections) {
		if (!section.name.trim())
			return {
				key: 'sectionNameRequired',
				selection: { kind: 'section', id: section.id },
			};
		for (const q of section.questions) {
			const selection: BuilderSelection = { kind: 'question', id: q.id };
			if (!q.text.trim()) return { key: 'questionRequired', selection };
			if (q.modality === 'STANDARD' && q.answerType === 'MULTIPLE_CHOICE') {
				if (!q.options.length || q.options.some((o) => !o.label.trim()))
					return { key: 'optionsRequired', selection };
			}
			if (q.modality === 'COPC' && !q.errorCode)
				return { key: 'errorTypeRequired', selection };
		}
	}
	return null;
};

/** Id of the section or question an error points at, or null for form-level errors. */
export const errorTargetId = (error: DraftError | null) =>
	error?.selection && error.selection.kind !== 'form'
		? error.selection.id
		: null;
