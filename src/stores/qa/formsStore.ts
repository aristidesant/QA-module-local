import { create } from 'zustand';
import type {
	BuilderForm,
	FormModality,
	PrimaryFormIds,
} from '~/modules/qa/forms/types';
import { duplicateForm, nowIso } from '~/modules/qa/forms/helpers';
import { MOCK_FORMS, MOCK_PRIMARY_FORM_IDS } from '~/modules/qa/forms/mockData';

export interface FormsState {
	forms: BuilderForm[];
	primaryFormIds: PrimaryFormIds;
	addForm: (form: BuilderForm) => void;
	/** Whole-form replace; stamps updatedAt. */
	updateForm: (form: BuilderForm) => void;
	/** Also clears a primary pointer that targets the deleted form. */
	deleteForm: (formId: string) => void;
	duplicateForm: (formId: string, copySuffix: string) => BuilderForm | null;
	setPrimaryForm: (modality: FormModality, formId: string | null) => void;
}

export const useFormsStore = create<FormsState>((set, get) => ({
	forms: MOCK_FORMS,
	primaryFormIds: MOCK_PRIMARY_FORM_IDS,
	addForm: (form) => set((s) => ({ forms: [form, ...s.forms] })),
	updateForm: (form) =>
		set((s) => ({
			forms: s.forms.map((f) =>
				f.id === form.id ? { ...form, updatedAt: nowIso() } : f
			),
		})),
	deleteForm: (formId) =>
		set((s) => ({
			forms: s.forms.filter((f) => f.id !== formId),
			primaryFormIds: {
				STANDARD:
					s.primaryFormIds.STANDARD === formId
						? null
						: s.primaryFormIds.STANDARD,
				COPC: s.primaryFormIds.COPC === formId ? null : s.primaryFormIds.COPC,
			},
		})),
	duplicateForm: (formId, copySuffix) => {
		const source = get().forms.find((f) => f.id === formId);
		if (!source) return null;
		const copy = duplicateForm(source, copySuffix);
		set((s) => ({ forms: [copy, ...s.forms] }));
		return copy;
	},
	setPrimaryForm: (modality, formId) =>
		set((s) => ({
			primaryFormIds: { ...s.primaryFormIds, [modality]: formId },
		})),
}));

/** Raw slices — derive with useMemo (Zustand v5 selector warning). */
export const selectForms = (s: FormsState) => s.forms;
export const selectPrimaryFormIds = (s: FormsState) => s.primaryFormIds;
