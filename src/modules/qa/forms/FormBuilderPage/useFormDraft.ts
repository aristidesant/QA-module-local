import { useCallback, useMemo, useState } from 'react';

import {
	createEmptyQuestion,
	createEmptySection,
	findQuestion,
	formSignature,
	moveQuestion,
	reorderSections,
	type DraftError,
	type MoveQuestionArgs,
} from '~/modules/qa/forms/helpers';
import type {
	BuilderForm,
	BuilderQuestion,
	BuilderSection,
	BuilderSelection,
} from '~/modules/qa/forms/types';
import { useFormsStore, type FormsState } from '~/stores/qa/formsStore';

type FormDetailsPatch = Partial<
	Pick<BuilderForm, 'name' | 'category' | 'description' | 'isActive'>
>;
type SectionPatch = Partial<Pick<BuilderSection, 'name' | 'guidance'>>;

/**
 * Local working copy of a form for the builder page. The store is only read to
 * seed the draft and to tell whether the draft differs; Save writes it back.
 * Mount this under a `key={formId}` so a different form starts a fresh draft.
 */
export function useFormDraft(formId: string | undefined) {
	const stored = useFormsStore(
		useCallback(
			(s: FormsState) => s.forms.find((f) => f.id === formId) ?? null,
			[formId]
		)
	);
	const [draft, setDraft] = useState<BuilderForm | null>(() =>
		stored ? structuredClone(stored) : null
	);
	const [selection, setSelection] = useState<BuilderSelection>(() =>
		stored ? { kind: 'form' } : null
	);
	const [draftError, setDraftError] = useState<DraftError | null>(null);

	const isDirty = useMemo(
		() => formSignature(draft) !== formSignature(stored),
		[draft, stored]
	);

	/** Every edit goes through here so a stale validation error never lingers. */
	const patch = (fn: (form: BuilderForm) => BuilderForm) => {
		setDraft((current) => (current ? fn(current) : current));
		setDraftError(null);
	};

	const updateDetails = (changes: FormDetailsPatch) =>
		patch((f) => ({ ...f, ...changes }));

	const addSection = () => {
		const section = createEmptySection();
		patch((f) => ({ ...f, sections: [...f.sections, section] }));
		setSelection({ kind: 'section', id: section.id });
	};

	const updateSection = (id: string, changes: SectionPatch) =>
		patch((f) => ({
			...f,
			sections: f.sections.map((s) => (s.id === id ? { ...s, ...changes } : s)),
		}));

	const deleteSection = (id: string) => {
		if (!draft) return;
		const index = draft.sections.findIndex((s) => s.id === id);
		const selectedInside =
			selection?.kind === 'section'
				? selection.id === id
				: selection?.kind === 'question'
					? findQuestion(draft, selection.id)?.section.id === id
					: false;
		const remaining = draft.sections.filter((s) => s.id !== id);
		patch((f) => ({ ...f, sections: f.sections.filter((s) => s.id !== id) }));
		if (selectedInside) {
			const next = remaining[index - 1] ?? remaining[index];
			setSelection(next ? { kind: 'section', id: next.id } : { kind: 'form' });
		}
	};

	const addQuestion = (sectionId: string) => {
		if (!draft) return;
		const question = createEmptyQuestion(draft.modality);
		patch((f) => ({
			...f,
			sections: f.sections.map((s) =>
				s.id === sectionId ? { ...s, questions: [...s.questions, question] } : s
			),
		}));
		setSelection({ kind: 'question', id: question.id });
	};

	const updateQuestion = (id: string, changes: Partial<BuilderQuestion>) =>
		patch((f) => ({
			...f,
			sections: f.sections.map((s) => ({
				...s,
				questions: s.questions.map((q) =>
					q.id === id ? ({ ...q, ...changes } as BuilderQuestion) : q
				),
			})),
		}));

	const deleteQuestion = (id: string) => {
		if (!draft) return;
		const parent = findQuestion(draft, id)?.section;
		patch((f) => ({
			...f,
			sections: f.sections.map((s) => ({
				...s,
				questions: s.questions.filter((q) => q.id !== id),
			})),
		}));
		if (selection?.kind === 'question' && selection.id === id) {
			setSelection(
				parent ? { kind: 'section', id: parent.id } : { kind: 'form' }
			);
		}
	};

	return {
		stored,
		draft,
		selection,
		setSelection,
		draftError,
		setDraftError,
		isDirty,
		updateDetails,
		addSection,
		updateSection,
		deleteSection,
		addQuestion,
		updateQuestion,
		deleteQuestion,
		reorderSections: (from: number, to: number) =>
			patch((f) => reorderSections(f, from, to)),
		moveQuestion: (args: MoveQuestionArgs) =>
			patch((f) => moveQuestion(f, args)),
	};
}
