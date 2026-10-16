# QA Forms: primary forms per modality + isolated form builder page (mockup)

## Context

The QA "Forms" section (`/qa/forms`, `/qa/forms/:formId`) is today a thin CRUD wired to the real qa-backend: a list with a create modal, and a "builder" that edits sections and questions through modals, saving every change immediately through React Query (`src/modules/qa/forms/FormsListPage`, `src/modules/qa/forms/FormBuilderPage`). The backend has no notion of evaluation modality, auto-fail, campaign-type tagging, or drag & drop ordering, so the product flow stakeholders need to see cannot be demonstrated there.

Decisions made with the user (2026-10-15):

- **Mockup backed by a Zustand store** (`formsStore`) with mock data, like Coaching, Rankings and Triggers. The real API files (`src/api/qa/formsApi.ts`, `src/queries/qa/formsQueries.ts`, `src/models/qa/forms.ts`) stay untouched and unused; `/qa/forms/error-types` stays as it is.
- **The new pages replace the current ones at the same routes** (`qa.forms`, `qa.forms.detail`); `src/routes.tsx` does not change.
- **The forms list page hosts the "Primary forms" card**: one selector for the primary COPC form and one for the primary Standard form, each with a "Create new form…" entry. Below it, a single table of all forms with a Modality column.
- **Modality is chosen at creation** (Standard or COPC) and never changes; it decides which fields the question editor shows.
- **The builder is an isolated full page**, not a modal: outline on the left (form details, sections, questions; drag & drop to reorder sections, reorder questions and move questions between sections), editor on the right, preview drawer, sticky Cancel/Save footer.
- **Question options per modality** (from the user's screenshots):
  - Common: question text, evaluator guidance (context the AI uses to answer), active, not applicable, requires agent identity, auto-fail (none / fail this section / fail the whole evaluation).
  - Standard only: answer type (multiple choice with a score per option, or open answer).
  - COPC only: fixed Yes/No answer with a favorable answer, error type (ECN, ENC, ECC, ECUF) required, campaign type.

Mode: mockup. Mantine v9, CSS modules, light and dark via Mantine variables, `var(--surface-card)` / `var(--surface-border)` and `light-dark()`; no inline styles. Shared primitives `SectionCard`, `AppDrawer`, `BaseTable`. No tests. No dev server. Do not commit unless asked. Prettier only on touched files. Code and comments in English; UI copy in both `en` and `es`.

Plan copy convention: Task 0 copies this file to `docs/superpowers/plans/2026-10-15-qa-forms-primary-and-builder-page.md`.

---

## Verified facts (do not re-explore)

- `@hello-pangea/dnd` 18.0.1 is in `package.json`. Usage pattern: `src/modules/agent-details/WorkflowSection/forms/NodeEdgesTab/NodeEdgesTab.tsx` lines 116-138 (`handleDragEnd` with splice) and 190-279 (`DragDropContext` → `Droppable` → `Draggable`, grip handle gets `dragHandleProps`, `snapshot.isDragging` switches a class, `provided.placeholder` at the end).
- `ContentContainer` (`src/components/ContentContainer/ContentContainer.tsx`): props `title`, `titleRight`, `description`, `showBackButton`, `onBackClick`, `contentWidth: 'centered' | 'full'`.
- `SectionCard` (`src/components/SectionCard`): `icon`, `title`, `description`, `headerActions`, `footer`, `padding`, `className`, `children`.
- `AppDrawer` (`src/components/AppDrawer/AppDrawer.tsx`): Mantine `DrawerProps` minus `title`, plus `title`, `description`, `icon`, `iconColor`, `headerActions`.
- `BaseTable` (`src/components/BaseTable`): `columns: BaseTableColumnDef<T>[]`, `data`, `getRowId`, `isLoading`.
- `EmptyState` (`src/components/EmptyState`): `icon`, `message`, `description`, `action`.
- `notifySuccess(message)`, `notifyWarning(message)`, `notifyError(error)` in `src/modules/qa/utils/notifications.ts`.
- `getActiveStatusColor(isActive)` in `src/modules/qa/constants/badgeColors.ts` → `'green' | 'gray'`.
- Sticky footer recipe: `src/modules/qa/coaching/components/CoachingRuleForm.module.css` (`.stickyActions`). Discard guard: `CoachingRuleForm.tsx` lines 321-332 (`modals.openConfirmModal`).
- Store pattern: `src/stores/qa/triggerRulesStore.ts` (plain `create<State>((set, get) => ({...}))`, seeded from mock data, exported selectors).
- Namespace mapping already exists: `src/modules/qa/qaNamespaces.ts` lines 143-145 map `qa.forms`, `qa.forms.error-types`, `qa.forms.detail` → `qa.forms`. Sidebar label `sidebar.items.qaForms` in `common.json` stays.
- `ErrorTypesPage` (untouched) uses these `qa.forms` keys and they must survive: `errorTypes.*`, `actions.delete`, `actions.cancel`, `actions.edit`, `actions.save`, `pagination.pageSize`. Strategy: **keep both locale files as they are and add/overwrite keys** (Task 2); never delete keys.
- `src/modules/qa/components/ErrorTypeSelect` becomes unused after the old `QuestionFormModal` is deleted; leave it in place.
- Nothing outside the two replaced folders links to `/qa/forms/:id` with a numeric id (mock ids are strings like `frm-001`).

---

## Direction

```
/qa/forms  (FormsListPage)
├─ ContentContainer full · title "Forms" · titleRight: [Error types] [Create form]
├─ PrimaryFormsCard (SectionCard, IconStar) ── Select "Primary COPC form" · Select "Primary Standard form"
│                                              each: forms of that modality + "Create new form…" sentinel
└─ SectionCard ── search + count · BaseTable: Form · Modality · Category · Sections · Questions · Status · Updated · Actions(edit, duplicate, delete)
   CreateFormModal: Name* · Modality (SegmentedControl Standard | COPC) · Category · Description → navigate to builder

/qa/forms/:formId  (FormBuilderPage)  — isolated page
├─ ContentContainer full · back → list (discard guard) · title = draft.name · titleRight: [Modality badge] [Status badge] [Preview]
├─ div.layout (grid 320px 1fr; one column < 62em)
│  ├─ aside.outline (sticky)  BuilderOutline
│  │   ├─ row "Form details"                          (selection {kind:'form'})
│  │   ├─ header "Sections"  [+ Add section]
│  │   └─ DragDropContext
│  │       └─ Droppable type SECTION
│  │           └─ Draggable section row: grip · name · n questions · [+ question]   (selection {kind:'section'})
│  │               └─ Droppable type QUESTION (per section)
│  │                   └─ Draggable question row: grip · 1.2 · text · badges       (selection {kind:'question'})
│  └─ section.editor
│      ├─ FormDetailsEditor   (name, category, description, active)
│      ├─ SectionEditor       (name, guidance, Add question, Delete section)
│      ├─ QuestionEditor      (common fields → StandardFields | CopcFields, Delete question)
│      └─ EmptyState "Select an item in the outline"
├─ div.stickyActions  [Cancel] [Save]  (Save disabled when not dirty)
└─ PreviewDrawer (AppDrawer right, lg) — read-only render of the DRAFT
```

The builder edits a **local draft** (copy of the store form). Save validates and writes the whole draft to the store; Cancel/back asks to discard when dirty.

---

## Implementation plan

Execute in order; `npm run typecheck` after each task. Do not run the dev server.

### Task 0 — Plan copy

Copy this file to `docs/superpowers/plans/2026-10-15-qa-forms-primary-and-builder-page.md`.

### Task 1 — Foundation: types, constants, mock data, helpers, store

**1a. `src/modules/qa/forms/types.ts`** (new):

```ts
export type FormModality = 'STANDARD' | 'COPC';
export type AutoFailScope = 'NONE' | 'SECTION' | 'EVALUATION';
export type StandardAnswerType = 'MULTIPLE_CHOICE' | 'OPEN';
export type CopcErrorCode = 'ECN' | 'ENC' | 'ECC' | 'ECUF';
export type CopcCampaignType =
	| 'ALL'
	| 'SALES'
	| 'SUPPORT'
	| 'RETENTION'
	| 'COLLECTIONS'
	| 'ACTIVATION';
export type YesNo = 'YES' | 'NO';

export interface BuilderOption {
	id: string;
	label: string;
	score: number;
}

interface BuilderQuestionBase {
	id: string;
	text: string;
	/** Context the AI takes into account to answer this question. */
	guidance: string;
	isActive: boolean;
	notApplicable: boolean;
	requiresAgentIdentity: boolean;
	autoFail: AutoFailScope;
}

export interface StandardQuestion extends BuilderQuestionBase {
	modality: 'STANDARD';
	answerType: StandardAnswerType;
	/** Kept when answerType is OPEN so switching back restores them; ignored by validation then. */
	options: BuilderOption[];
}

export interface CopcQuestion extends BuilderQuestionBase {
	modality: 'COPC';
	favorableAnswer: YesNo;
	/** null only on a freshly added question; required to save. */
	errorCode: CopcErrorCode | null;
	campaignType: CopcCampaignType;
}

export type BuilderQuestion = StandardQuestion | CopcQuestion;

export interface BuilderSection {
	id: string;
	name: string;
	/** Shown to evaluators and the AI at the top of the section. */
	guidance: string;
	questions: BuilderQuestion[];
}

export interface BuilderForm {
	id: string;
	name: string;
	description: string;
	category: string;
	modality: FormModality;
	isActive: boolean;
	sections: BuilderSection[];
	createdAt: string;
	updatedAt: string;
}

export type PrimaryFormIds = Record<FormModality, string | null>;

export type BuilderSelection =
	| { kind: 'form' }
	| { kind: 'section'; id: string }
	| { kind: 'question'; id: string }
	| null;

export interface CreateFormValues {
	name: string;
	modality: FormModality;
	category: string;
	description: string;
}
```

Design note: questions are a discriminated union on `modality` (same value as the form's) so `QuestionEditor` narrows without optional-field guards and a COPC question can never carry options. Order is array position; there is no `sortOrder` field.

**1b. `src/modules/qa/forms/constants.ts`** (new):

```ts
import type {
	AutoFailScope,
	CopcCampaignType,
	CopcErrorCode,
	FormModality,
	StandardAnswerType,
} from './types';

export const FORM_MODALITIES: FormModality[] = ['STANDARD', 'COPC'];
export const MODALITY_COLORS: Record<FormModality, string> = {
	STANDARD: 'blue',
	COPC: 'violet',
};
export const COPC_ERROR_CODES: CopcErrorCode[] = ['ECN', 'ENC', 'ECC', 'ECUF'];
export const COPC_CAMPAIGN_TYPES: CopcCampaignType[] = [
	'ALL',
	'SALES',
	'SUPPORT',
	'RETENTION',
	'COLLECTIONS',
	'ACTIVATION',
];
export const AUTO_FAIL_SCOPES: AutoFailScope[] = [
	'NONE',
	'SECTION',
	'EVALUATION',
];
export const STANDARD_ANSWER_TYPES: StandardAnswerType[] = [
	'MULTIPLE_CHOICE',
	'OPEN',
];
/** Select value that opens the create dialog from the primary-form pickers. */
export const CREATE_FORM_SENTINEL = '__create__';
export const FORMS_LIST_PATH = '/qa/forms';
export const formBuilderPath = (formId: string) => `/qa/forms/${formId}`;
```

**1c. `src/modules/qa/forms/helpers.ts`** (new). Pure functions, no React:

```ts
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
		questions: s.questions.map((q) =>
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
```

**1d. `src/modules/qa/forms/mockData.ts`** (new). Three forms. Use literal ids (`frm-001`…, `sec-001`…, `q-001`…, `opt-001`…) so the counter in helpers (starting at 101) never collides. Helper inside the file to keep it short:

```ts
import type {
	BuilderForm,
	BuilderOption,
	CopcQuestion,
	PrimaryFormIds,
	StandardQuestion,
} from './types';

export const FORMS_NOW_ISO = '2026-10-14T09:00:00Z';

let optionSeq = 0;
const opt = (label: string, score: number): BuilderOption => ({
	id: `opt-${String(++optionSeq).padStart(3, '0')}`,
	label,
	score,
});

type CopcInput = Pick<CopcQuestion, 'id' | 'text' | 'errorCode'> &
	Partial<Omit<CopcQuestion, 'id' | 'text' | 'errorCode' | 'modality'>>;
const copc = (q: CopcInput): CopcQuestion => ({
	modality: 'COPC',
	guidance: '',
	isActive: true,
	notApplicable: false,
	requiresAgentIdentity: false,
	autoFail: 'NONE',
	favorableAnswer: 'YES',
	campaignType: 'ALL',
	...q,
});

type StdInput = Pick<StandardQuestion, 'id' | 'text'> &
	Partial<Omit<StandardQuestion, 'id' | 'text' | 'modality'>>;
const std = (q: StdInput): StandardQuestion => ({
	modality: 'STANDARD',
	guidance: '',
	isActive: true,
	notApplicable: false,
	requiresAgentIdentity: false,
	autoFail: 'NONE',
	answerType: 'MULTIPLE_CHOICE',
	options: [opt('Yes', 10), opt('No', 0)],
	...q,
});

export const MOCK_FORMS: BuilderForm[] = [
	{
		id: 'frm-001',
		name: 'COPC Sales Calls',
		description:
			'Critical and non-critical error checklist for outbound and inbound sales conversations.',
		category: 'Sales',
		modality: 'COPC',
		isActive: true,
		createdAt: '2026-09-02T10:00:00Z',
		updatedAt: '2026-10-12T15:20:00Z',
		sections: [
			{
				id: 'sec-001',
				name: 'Opening and identity',
				guidance:
					'First 60 seconds of the call. Confirm who is speaking before scoring anything else.',
				questions: [
					copc({
						id: 'q-001',
						text: 'Agent states their name and the company name',
						errorCode: 'ENC',
						requiresAgentIdentity: true,
						guidance:
							'Accept any clear self-introduction. A company name alone is not enough.',
					}),
					copc({
						id: 'q-002',
						text: 'Agent verifies the customer identity before discussing the account',
						errorCode: 'ECC',
						campaignType: 'SALES',
						autoFail: 'EVALUATION',
						guidance:
							'Look for at least two identity checks (full name plus document, phone or address).',
					}),
					copc({
						id: 'q-003',
						text: 'Agent explains the purpose of the call',
						errorCode: 'ENC',
						campaignType: 'SALES',
					}),
				],
			},
			{
				id: 'sec-002',
				name: 'Offer and compliance',
				guidance: 'Everything said about price, terms and the product itself.',
				questions: [
					copc({
						id: 'q-004',
						text: 'Agent reads the mandatory disclosure before the offer',
						errorCode: 'ECC',
						campaignType: 'SALES',
						autoFail: 'SECTION',
						guidance:
							'The disclosure must be read in full; a paraphrase counts as missing.',
					}),
					copc({
						id: 'q-005',
						text: 'Agent quotes the correct price and billing cycle',
						errorCode: 'ECN',
						campaignType: 'SALES',
					}),
					copc({
						id: 'q-006',
						text: 'Agent pressures the customer or makes a misleading claim',
						errorCode: 'ECUF',
						favorableAnswer: 'NO',
						guidance:
							'Answer Yes when the agent misrepresents the product, invents a deadline or ignores a clear refusal.',
					}),
				],
			},
			{
				id: 'sec-003',
				name: 'Closing',
				guidance: '',
				questions: [
					copc({
						id: 'q-007',
						text: 'Agent summarises the order and next steps',
						errorCode: 'ENC',
					}),
					copc({
						id: 'q-008',
						text: 'Agent thanks the customer and closes politely',
						errorCode: 'ENC',
						notApplicable: true,
					}),
				],
			},
		],
	},
	{
		id: 'frm-002',
		name: 'Standard Support Quality',
		description:
			'Weighted scorecard for support interactions with coaching notes.',
		category: 'Support',
		modality: 'STANDARD',
		isActive: true,
		createdAt: '2026-08-20T09:30:00Z',
		updatedAt: '2026-10-13T11:05:00Z',
		sections: [
			{
				id: 'sec-004',
				name: 'Greeting',
				guidance: 'How the agent opens the conversation.',
				questions: [
					std({
						id: 'q-009',
						text: 'Did the agent greet the customer professionally?',
						options: [opt('Yes', 10), opt('Partially', 5), opt('No', 0)],
					}),
					std({
						id: 'q-010',
						text: 'Did the agent confirm the reason for contact?',
						options: [opt('Yes', 5), opt('No', 0)],
					}),
				],
			},
			{
				id: 'sec-005',
				name: 'Resolution',
				guidance:
					'Did the customer leave with the problem solved or a clear path to it?',
				questions: [
					std({
						id: 'q-011',
						text: 'Was the issue resolved on this contact?',
						options: [
							opt('Resolved', 20),
							opt('Escalated', 10),
							opt('Unresolved', 0),
						],
						autoFail: 'SECTION',
						guidance:
							'Escalated counts only when a ticket number was given to the customer.',
					}),
					std({
						id: 'q-012',
						text: 'Describe any troubleshooting steps the agent skipped',
						answerType: 'OPEN',
						options: [],
					}),
					std({
						id: 'q-013',
						text: 'Did the agent set clear next steps?',
						options: [opt('Yes', 10), opt('No', 0)],
					}),
				],
			},
			{
				id: 'sec-006',
				name: 'Soft skills',
				guidance: '',
				questions: [
					std({
						id: 'q-014',
						text: 'Tone and empathy throughout the call',
						options: [opt('Excellent', 10), opt('Adequate', 5), opt('Poor', 0)],
					}),
					std({
						id: 'q-015',
						text: 'Coaching notes for the agent',
						answerType: 'OPEN',
						options: [],
						isActive: false,
					}),
				],
			},
		],
	},
	{
		id: 'frm-003',
		name: 'Retention Playbook (draft)',
		description: 'Save-attempt checklist, still being written.',
		category: 'Retention',
		modality: 'STANDARD',
		isActive: false,
		createdAt: '2026-10-08T16:00:00Z',
		updatedAt: '2026-10-08T16:40:00Z',
		sections: [
			{
				id: 'sec-007',
				name: 'Save attempt',
				guidance: '',
				questions: [
					std({
						id: 'q-016',
						text: 'Did the agent acknowledge the cancellation reason?',
						options: [opt('Yes', 10), opt('No', 0)],
					}),
					std({
						id: 'q-017',
						text: 'Did the agent present a retention offer?',
						options: [opt('Yes', 10), opt('No', 0)],
					}),
				],
			},
		],
	},
];

export const MOCK_PRIMARY_FORM_IDS: PrimaryFormIds = {
	COPC: 'frm-001',
	STANDARD: 'frm-002',
};
```

**1e. `src/stores/qa/formsStore.ts`** (new), same shape as `triggerRulesStore.ts`:

```ts
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
```

`npm run typecheck` (the old pages still compile; nothing imports the new files yet).

### Task 2 — Locale keys (`src/locales/{en,es}/qa.forms.json`)

Keep every existing key. Add or overwrite the keys below (merge into the existing top-level groups; create the groups that do not exist). Validate both files with `node -e "JSON.parse(require('fs').readFileSync('src/locales/en/qa.forms.json','utf8'))"` and the same for `es`. Both files LF, tab-indented like the current ones.

**en** additions:

```json
{
	"actions": {
		"addQuestion": "Add question",
		"addSection": "Add section",
		"backToForms": "Back to forms",
		"duplicate": "Duplicate",
		"preview": "Preview",
		"deleteQuestion": "Delete question",
		"deleteSection": "Delete section"
	},
	"builder": {
		"description": "Build the sections and questions evaluators and the AI will score.",
		"title": "Form builder",
		"outline": "Outline",
		"outlineHint": "Drag to reorder sections and questions.",
		"formDetails": "Form details",
		"sections": "Sections",
		"noSections": "No sections yet. Add one to start building this form.",
		"noQuestions": "Drop or add a question here.",
		"selectPrompt": "Select an item in the outline",
		"selectPromptDescription": "Pick the form details, a section or a question to edit it here.",
		"notFound": "This form no longer exists.",
		"maxScore": "Max score {{score}}",
		"questionNumber": "{{section}}.{{question}}",
		"discard": {
			"title": "Discard changes?",
			"message": "You have unsaved changes in this form. Leaving now will lose them.",
			"confirm": "Discard"
		},
		"validation": {
			"fixFields": "Fix the highlighted fields before saving.",
			"nameRequired": "Name is required",
			"sectionNameRequired": "Section name is required",
			"questionRequired": "Question text is required",
			"optionsRequired": "Add at least one option with a label",
			"errorTypeRequired": "Select an error type"
		}
	},
	"create": {
		"modality": "Modality",
		"modalityHint": "The modality decides which fields each question has and cannot be changed later.",
		"submit": "Create form",
		"title": "Create form"
	},
	"details": {
		"title": "Form details",
		"description": "Name, category, availability and the description evaluators see."
	},
	"modality": {
		"label": "Modality",
		"standard": "Standard",
		"copc": "COPC",
		"standardHint": "Weighted questions: multiple choice with a score per option, or open answers.",
		"copcHint": "Yes/No questions classified by COPC error type."
	},
	"notifications": {
		"formDuplicated": "Form duplicated.",
		"primaryUpdated": "Primary form updated."
	},
	"preview": {
		"title": "Preview",
		"description": "How evaluators will see this form. Inactive questions are hidden.",
		"na": "N/A",
		"favorable": "Favorable answer: {{answer}}",
		"empty": "Add sections and questions to preview this form."
	},
	"primary": {
		"title": "Primary forms",
		"description": "The form each modality uses by default when a campaign does not pick one.",
		"copc": "Primary COPC form",
		"standard": "Primary Standard form",
		"createNew": "Create new form…",
		"none": "No primary form",
		"noneHint": "No {{modality}} forms yet."
	},
	"question": {
		"title": "Question",
		"text": "Question",
		"textPlaceholder": "What should the evaluator check?",
		"guidance": "Evaluator guidance",
		"guidanceHelp": "Context the AI takes into account to answer this question.",
		"active": "Active",
		"activeHelp": "Inactive criteria are left out of new evaluations.",
		"notApplicable": "Not applicable",
		"notApplicableHelp": "Shown as N/A in new evaluations and excluded from the YES + NO total. Existing evaluations keep the value they were created with.",
		"requiresIdentity": "Requires agent identity",
		"requiresIdentityHelp": "Turn on for criteria that depend on knowing who the agent is. If the AI cannot confirm the agent, it skips this criterion and sends the evaluation to QA review. Only applies to new evaluations.",
		"autoFail": "Auto-fail",
		"autoFailHelp": "What an unfavorable answer invalidates.",
		"autoFailOptions": {
			"NONE": "No auto-fail",
			"SECTION": "Fail this section",
			"EVALUATION": "Fail the whole evaluation"
		},
		"answerType": "Answer type",
		"answerTypes": {
			"MULTIPLE_CHOICE": "Multiple choice",
			"OPEN": "Open answer"
		},
		"options": "Options and scores",
		"optionLabel": "Option",
		"optionScore": "Score",
		"addOption": "Add option",
		"derivedWeight": "Weight {{weight}}",
		"openAnswerHint": "Open answers are not scored. The evaluator writes a free-text note.",
		"favorableAnswer": "Favorable answer",
		"favorableAnswerHelp": "Which answer means the criterion was met.",
		"yes": "Yes",
		"no": "No",
		"errorType": "Error type",
		"errorTypePlaceholder": "Select an error type",
		"errorCodes": {
			"ECN": "ECN — Critical business error",
			"ENC": "ENC — Non-critical error",
			"ECC": "ECC — Critical compliance error",
			"ECUF": "ECUF — Critical end-user error"
		},
		"campaignType": "Campaign type",
		"campaignTypeHelp": "Evaluations score the questions tagged with the campaign's type or with All.",
		"campaignTypes": {
			"ALL": "All",
			"SALES": "Sales",
			"SUPPORT": "Support",
			"RETENTION": "Retention",
			"COLLECTIONS": "Collections",
			"ACTIVATION": "Activation"
		},
		"badges": {
			"inactive": "Inactive",
			"autoFail": "Auto-fail",
			"na": "N/A",
			"open": "Open"
		}
	},
	"section": {
		"title": "Section",
		"name": "Section name",
		"namePlaceholder": "Opening and identity",
		"guidance": "Section guidance",
		"guidanceHelp": "Shown to evaluators and the AI before the questions of this section.",
		"questionCount_one": "{{count}} question",
		"questionCount_other": "{{count}} questions",
		"deleteConfirm": "Delete \"{{name}}\" and its {{count}} questions?",
		"deleteConfirmEmpty": "Delete \"{{name}}\"?"
	},
	"table": {
		"modality": "Modality",
		"sections": "Sections",
		"questions": "Questions",
		"updatedAt": "Updated",
		"primary": "Primary"
	}
}
```

**es** additions (same keys):

```json
{
	"actions": {
		"addQuestion": "Agregar pregunta",
		"addSection": "Agregar sección",
		"backToForms": "Volver a formularios",
		"duplicate": "Duplicar",
		"preview": "Vista previa",
		"deleteQuestion": "Eliminar pregunta",
		"deleteSection": "Eliminar sección"
	},
	"builder": {
		"description": "Construye las secciones y preguntas que los evaluadores y la IA van a calificar.",
		"title": "Editor de formulario",
		"outline": "Estructura",
		"outlineHint": "Arrastra para reordenar secciones y preguntas.",
		"formDetails": "Datos del formulario",
		"sections": "Secciones",
		"noSections": "Aún no hay secciones. Agrega una para empezar a construir este formulario.",
		"noQuestions": "Suelta o agrega una pregunta aquí.",
		"selectPrompt": "Selecciona un elemento de la estructura",
		"selectPromptDescription": "Elige los datos del formulario, una sección o una pregunta para editarla aquí.",
		"notFound": "Este formulario ya no existe.",
		"maxScore": "Puntaje máximo {{score}}",
		"questionNumber": "{{section}}.{{question}}",
		"discard": {
			"title": "¿Descartar cambios?",
			"message": "Tienes cambios sin guardar en este formulario. Si sales ahora se perderán.",
			"confirm": "Descartar"
		},
		"validation": {
			"fixFields": "Corrige los campos marcados antes de guardar.",
			"nameRequired": "El nombre es obligatorio",
			"sectionNameRequired": "El nombre de la sección es obligatorio",
			"questionRequired": "El texto de la pregunta es obligatorio",
			"optionsRequired": "Agrega al menos una opción con etiqueta",
			"errorTypeRequired": "Selecciona un tipo de error"
		}
	},
	"create": {
		"modality": "Modalidad",
		"modalityHint": "La modalidad define qué campos tiene cada pregunta y no se puede cambiar después.",
		"submit": "Crear formulario",
		"title": "Crear formulario"
	},
	"details": {
		"title": "Datos del formulario",
		"description": "Nombre, categoría, disponibilidad y la descripción que ven los evaluadores."
	},
	"modality": {
		"label": "Modalidad",
		"standard": "Estándar",
		"copc": "COPC",
		"standardHint": "Preguntas con peso: opción múltiple con puntaje por opción, o respuesta abierta.",
		"copcHint": "Preguntas Sí/No clasificadas por tipo de error COPC."
	},
	"notifications": {
		"formDuplicated": "Formulario duplicado.",
		"primaryUpdated": "Formulario principal actualizado."
	},
	"preview": {
		"title": "Vista previa",
		"description": "Así verán este formulario los evaluadores. Las preguntas inactivas no se muestran.",
		"na": "N/A",
		"favorable": "Respuesta favorable: {{answer}}",
		"empty": "Agrega secciones y preguntas para previsualizar este formulario."
	},
	"primary": {
		"title": "Formularios principales",
		"description": "El formulario que usa cada modalidad por defecto cuando una campaña no elige uno.",
		"copc": "Formulario principal COPC",
		"standard": "Formulario principal Estándar",
		"createNew": "Crear nuevo formulario…",
		"none": "Sin formulario principal",
		"noneHint": "Aún no hay formularios {{modality}}."
	},
	"question": {
		"title": "Pregunta",
		"text": "Pregunta",
		"textPlaceholder": "¿Qué debe verificar el evaluador?",
		"guidance": "Guía para el evaluador",
		"guidanceHelp": "Contexto que la IA tiene en cuenta para responder esta pregunta.",
		"active": "Activa",
		"activeHelp": "Los criterios inactivos quedan fuera de las nuevas evaluaciones.",
		"notApplicable": "No aplica",
		"notApplicableHelp": "Se mostrará como N/A en nuevas evaluaciones y quedará fuera del total SÍ + NO. Las evaluaciones existentes conservan el valor con el que se crearon.",
		"requiresIdentity": "Requiere identidad del agente",
		"requiresIdentityHelp": "Actívalo en criterios que dependen de saber quién es el agente. Si la IA no puede confirmar al agente, omite este criterio y envía la evaluación a revisión de QA. Solo aplica a evaluaciones nuevas.",
		"autoFail": "Fallo automático",
		"autoFailHelp": "Qué invalida una respuesta desfavorable.",
		"autoFailOptions": {
			"NONE": "Sin fallo automático",
			"SECTION": "Reprobar esta sección",
			"EVALUATION": "Reprobar toda la evaluación"
		},
		"answerType": "Tipo de respuesta",
		"answerTypes": {
			"MULTIPLE_CHOICE": "Opción múltiple",
			"OPEN": "Respuesta abierta"
		},
		"options": "Opciones y puntajes",
		"optionLabel": "Opción",
		"optionScore": "Puntaje",
		"addOption": "Agregar opción",
		"derivedWeight": "Peso {{weight}}",
		"openAnswerHint": "Las respuestas abiertas no puntúan. El evaluador escribe una nota de texto libre.",
		"favorableAnswer": "Respuesta favorable",
		"favorableAnswerHelp": "Qué respuesta representa cumplimiento para este criterio.",
		"yes": "Sí",
		"no": "No",
		"errorType": "Tipo de error",
		"errorTypePlaceholder": "Selecciona un tipo de error",
		"errorCodes": {
			"ECN": "ECN — Error crítico de negocio",
			"ENC": "ENC — Error no crítico",
			"ECC": "ECC — Error crítico de cumplimiento",
			"ECUF": "ECUF — Error crítico de usuario final"
		},
		"campaignType": "Tipo de campaña",
		"campaignTypeHelp": "Las evaluaciones califican las preguntas etiquetadas con el tipo de la campaña o con Todos.",
		"campaignTypes": {
			"ALL": "Todos",
			"SALES": "Ventas",
			"SUPPORT": "Soporte",
			"RETENTION": "Retención",
			"COLLECTIONS": "Cobranzas",
			"ACTIVATION": "Activación"
		},
		"badges": {
			"inactive": "Inactiva",
			"autoFail": "Fallo automático",
			"na": "N/A",
			"open": "Abierta"
		}
	},
	"section": {
		"title": "Sección",
		"name": "Nombre de la sección",
		"namePlaceholder": "Apertura e identificación",
		"guidance": "Guía de la sección",
		"guidanceHelp": "Se muestra a los evaluadores y a la IA antes de las preguntas de esta sección.",
		"questionCount_one": "{{count}} pregunta",
		"questionCount_other": "{{count}} preguntas",
		"deleteConfirm": "¿Eliminar \"{{name}}\" y sus {{count}} preguntas?",
		"deleteConfirmEmpty": "¿Eliminar \"{{name}}\"?"
	},
	"table": {
		"modality": "Modalidad",
		"sections": "Secciones",
		"questions": "Preguntas",
		"updatedAt": "Actualizado",
		"primary": "Principal"
	}
}
```

Existing keys that the new pages reuse unchanged: `title`, `description`, `actions.{create,cancel,delete,edit,save}`, `search.{placeholder,count}`, `states.{deleteConfirm,emptyDescription,emptyTitle}`, `status.{active,inactive}`, `table.{actions,category,name,noCategory,noDescription,status}`, `fields.{name,namePlaceholder,category,categoryPlaceholder,description,descriptionPlaceholder,active}`, `notifications.{formCreated,formDeleted,formUpdated}`, `questions.deleteConfirm`, `questions.deleteTitle`, `groups.deleteTitle`, `errorTypes.actions.manage`.

### Task 3 — Forms list page (replace `src/modules/qa/forms/FormsListPage/`)

Delete: `FormsListPage.helpers.ts`, `FormsListPage.types.ts`, `components/ImportTemplateModal/` (whole folder). Keep `FormsListPage.module.css` (add `.primaryGrid` below), `index.ts`.

**3a. `components/PrimaryFormsCard/PrimaryFormsCard.tsx`** (+ `index.ts`):

Props: `{ forms: BuilderForm[]; primaryFormIds: PrimaryFormIds; onChange: (modality: FormModality, formId: string | null) => void; onCreateNew: (modality: FormModality) => void }`.

Renders `SectionCard icon={IconStar} title={t('primary.title')} description={t('primary.description')}` containing a `SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'` with one `Select` per modality in the order COPC, STANDARD:

| Prop           | Value                                                                                                                                                                                          |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`        | `t('primary.copc')` / `t('primary.standard')`                                                                                                                                                  |
| `description`  | `t('modality.copcHint')` / `t('modality.standardHint')`                                                                                                                                        |
| `data`         | `[...formsOfModality.map(f => ({ value: f.id, label: f.name + (f.isActive ? '' : ` (${t('status.inactive')})`) })), { value: CREATE_FORM_SENTINEL, label: t('primary.createNew') }]`           |
| `value`        | `primaryFormIds[modality]`                                                                                                                                                                     |
| `placeholder`  | `t('primary.none')`                                                                                                                                                                            |
| `clearable`    | `true`                                                                                                                                                                                         |
| `leftSection`  | `<Badge size='xs' color={MODALITY_COLORS[modality]} variant='light'>{t(`modality.${modality.toLowerCase()}`)}</Badge>` — fine to omit if it crowds; keep `leftSectionWidth` consistent if used |
| `onChange`     | `v === CREATE_FORM_SENTINEL ? onCreateNew(modality) : onChange(modality, v)` (the sentinel never becomes the value because the parent state does not change)                                   |
| `renderOption` | render the sentinel row with `IconPlus` 14px + the label in the primary colour (`c='var(--mantine-primary-color-filled)'`); other rows plain                                                   |

When a modality has no forms, `data` is only the sentinel and `description` becomes `t('primary.noneHint', { modality: t(...) })`.

**3b. `components/CreateFormModal/CreateFormModal.tsx`** (rewrite in place):

Props: `{ opened: boolean; initialModality: FormModality; onClose: () => void; onSubmit: (values: CreateFormValues) => void }`.

Owns its `useForm<CreateFormValues>` (`initialValues: { name: '', modality: initialModality, category: '', description: '' }`, `validate.name` → `t('validation.nameRequired')`). Reset the form with `form.setValues({...initialValues, modality: initialModality})` in a `useEffect` on `[opened, initialModality]` so the picker's modality is honoured. Mantine `Modal size='md' title={t('create.title')} centered`. Fields in order: `TextInput name` (required asterisk, `data-autofocus`), `SegmentedControl` for `modality` (`data` = `[{ value: 'STANDARD', label: t('modality.standard') }, { value: 'COPC', label: t('modality.copc') }]`, `fullWidth`) with `Text size='xs' c='dimmed'` `t('create.modalityHint')` under it and the per-modality hint (`modality.standardHint` / `modality.copcHint`) switching with the value, `TextInput category` (`placeholder` `fields.categoryPlaceholder`), `Textarea description` (`autosize minRows={3}`, placeholder `fields.descriptionPlaceholder`). Footer `Group justify='flex-end'`: subtle Cancel, primary submit `t('create.submit')` with `IconPlus`.

**3c. `FormsListPage.tsx`** (rewrite):

- State: `forms = useFormsStore(selectForms)`, `primaryFormIds = useFormsStore(selectPrimaryFormIds)`, `search`, `createOpen`, `createModality: FormModality` (default `'STANDARD'`).
- Derived `filteredForms` = search over `name`, `description`, `category` (same code as today, no pagination; drop `useListPageState`, `PaginationControls`, template download/import, all React Query imports).
- Header: `ContentContainer contentWidth='full' title={t('title')} description={t('description')} titleRight={<> [Error types light button → RouterLink '/qa/forms/error-types', IconTags] [Create form primary button, IconPlus → setCreateModality('STANDARD'); setCreateOpen(true)] </>}`.
- Body `Stack gap='md'`: `PrimaryFormsCard` then the table `SectionCard` (toolbar with search + `t('search.count', { count: filteredForms.length })`).
- `onChange` of the primary card → `useFormsStore.getState().setPrimaryForm(modality, id)`; `notifySuccess(t('notifications.primaryUpdated'))`. `onCreateNew(modality)` → `setCreateModality(modality); setCreateOpen(true)`.
- Create submit → `const form = createEmptyForm(values); useFormsStore.getState().addForm(form); notifySuccess(t('notifications.formCreated')); setCreateOpen(false); navigate(formBuilderPath(form.id))`.
- Columns (`BaseTableColumnDef<BuilderForm>[]`, all `enableSorting: false`):

| id          | header            | cell                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`      | `table.name`      | `Stack gap={2}`: `Text fw={700} size='sm'` name (+ `IconStar` 14px `c='yellow'` with `Tooltip` `table.primary` when `primaryFormIds[form.modality] === form.id`), `Text c='dimmed' size='xs'` description or `table.noDescription`                                                                                                                                                                                                                                                      |
| `modality`  | `table.modality`  | `Badge color={MODALITY_COLORS[form.modality]} variant='light'` `t(`modality.${form.modality.toLowerCase()}`)`                                                                                                                                                                                                                                                                                                                                                                           |
| `category`  | `table.category`  | `Badge color='blue' variant='outline'` category or `table.noCategory`                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `sections`  | `table.sections`  | `Text size='sm'` `form.sections.length`                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `questions` | `table.questions` | `Text size='sm'` `countQuestions(form)`                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `status`    | `table.status`    | `Badge color={getActiveStatusColor(form.isActive)} variant='light'`                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `updatedAt` | `table.updatedAt` | `Text size='sm' c='dimmed'` `new Date(form.updatedAt).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' })`                                                                                                                                                                                                                                                                                                                                           |
| `actions`   | `table.actions`   | `Group gap='xs' justify='flex-end' wrap='nowrap'`: edit `ActionIcon variant='light' component={RouterLink} to={formBuilderPath(form.id)}` `IconEdit`; duplicate `ActionIcon variant='subtle'` `IconCopy` → `duplicateForm(form.id, t('duplicateSuffix'))` then `notifySuccess(t('notifications.formDuplicated'))`; delete `ActionIcon color='red' variant='subtle'` `IconTrash` → `modals.openConfirmModal` with `states.deleteConfirm` then `deleteForm` + `notifications.formDeleted` |

Add `"duplicateSuffix": "(copy)"` / `"(copia)"` at the top level of both locale files (add to Task 2 lists).

- Empty state when `filteredForms.length === 0`: `EmptyState icon={<IconFileDescription size={32} />} message={t('states.emptyTitle')} description={t('states.emptyDescription')} action={Create button}`.
- `BaseTable getRowId={(f) => f.id}`.

`npm run typecheck` — expect errors only inside `FormBuilderPage/` (old files still import the deleted `FormsListPage` helpers? They do not; the old builder imports its own helpers. If the old `FormBuilderPage` still compiles, fine.)

### Task 4 — Builder page shell, draft hook, outline (no DnD yet), editors

Delete inside `src/modules/qa/forms/FormBuilderPage/`: `FormBuilderPage.constants.ts`, `FormBuilderPage.helpers.ts`, `FormBuilderPage.types.ts`, `components/FormMetadataCard/`, `components/GroupFormModal/`, `components/GroupPanel/`, `components/QuestionFormModal/`. Keep `index.ts`. Rewrite `FormBuilderPage.tsx` and `FormBuilderPage.module.css`.

**4a. `useFormDraft.ts`** (new hook in `FormBuilderPage/`):

```ts
export function useFormDraft(formId: string | undefined) {
	const stored = useFormsStore(
		useCallback(
			(s: FormsState) => s.forms.find((f) => f.id === formId) ?? null,
			[formId]
		)
	);
	const [draft, setDraft] = useState<BuilderForm | null>(null);
	const [selection, setSelection] = useState<BuilderSelection>(null);

	useEffect(() => {
		if (stored && draft === null) {
			setDraft(structuredClone(stored));
			setSelection({ kind: 'form' });
		}
	}, [stored, draft]);

	const isDirty = useMemo(
		() => formSignature(draft) !== formSignature(stored),
		[draft, stored]
	);
	const patch = (fn: (f: BuilderForm) => BuilderForm) =>
		setDraft((d) => (d ? fn(d) : d));

	return {
		stored,
		draft,
		selection,
		setSelection,
		isDirty,
		updateDetails: (
			p: Partial<
				Pick<BuilderForm, 'name' | 'category' | 'description' | 'isActive'>
			>
		) => patch((f) => ({ ...f, ...p })),
		addSection: () => {
			const s = createEmptySection();
			patch((f) => ({ ...f, sections: [...f.sections, s] }));
			setSelection({ kind: 'section', id: s.id });
		},
		updateSection: (
			id: string,
			p: Partial<Pick<BuilderSection, 'name' | 'guidance'>>
		) =>
			patch((f) => ({
				...f,
				sections: f.sections.map((s) => (s.id === id ? { ...s, ...p } : s)),
			})),
		deleteSection: (id: string) => {
			/* see below */
		},
		addQuestion: (sectionId: string) => {
			/* createEmptyQuestion(draft.modality), append to that section, select it */
		},
		updateQuestion: (id: string, p: Partial<BuilderQuestion>) =>
			patch((f) => ({
				...f,
				sections: f.sections.map((s) => ({
					...s,
					questions: s.questions.map((q) =>
						q.id === id ? ({ ...q, ...p } as BuilderQuestion) : q
					),
				})),
			})),
		deleteQuestion: (id: string) => {
			/* see below */
		},
		reorderSections: (from: number, to: number) =>
			patch((f) => reorderSections(f, from, to)),
		moveQuestion: (args: MoveQuestionArgs) =>
			patch((f) => moveQuestion(f, args)),
		resetDraft: () => setDraft(stored ? structuredClone(stored) : null),
	};
}
```

Selection rules on delete:

- `deleteSection(id)`: remove it; if the selection is that section or a question inside it, select the previous section (`index - 1`), else the next one, else `{ kind: 'form' }`.
- `deleteQuestion(id)`: remove it; if selected, select its parent section.

**4b. `FormBuilderPage.tsx`**:

- `const { formId } = useParams()`; `useFormDraft(formId)`; `const [previewOpen, setPreviewOpen] = useState(false)`.
- Not found (`stored === null`): `ContentContainer showBackButton onBackClick → navigate(FORMS_LIST_PATH)` with `EmptyState message={t('builder.notFound')} action={Button t('actions.backToForms')}`.
- While `draft === null` render nothing inside the container (one render tick).
- `selected` = `useMemo`: `selection.kind === 'form'` → `{ kind: 'form' }`; `'section'` → `findSection(draft, id)`; `'question'` → `findQuestion(draft, id)`; fall back to `null` when the id no longer exists.
- `handleLeave`: if `isDirty` → `modals.openConfirmModal({ title: t('builder.discard.title'), centered: true, children: <Text size='sm'>{t('builder.discard.message')}</Text>, labels: { confirm: t('builder.discard.confirm'), cancel: t('actions.cancel') }, confirmProps: { color: 'red' }, onConfirm: () => navigate(FORMS_LIST_PATH) })`; else `navigate(FORMS_LIST_PATH)`.
- `handleSave`: `const error = validateDraft(draft)`; if error → `setSelection(error.selection)`; `notifyWarning(t('builder.validation.fixFields'))`; store the error in `const [draftError, setDraftError] = useState<DraftError | null>(null)` so the editor can show `t(`builder.validation.${error.key}`)` on the right field; return. Else `useFormsStore.getState().updateForm(draft)`; `setDraftError(null)`; `notifySuccess(t('notifications.formUpdated'))`; stay on the page (the draft now equals the store so `isDirty` becomes false; `updatedAt` is excluded by `formSignature`). Clear `draftError` on any draft change (`useEffect` on `draft`).
- Header: `ContentContainer contentWidth='full' showBackButton onBackClick={handleLeave} title={draft.name || t('builder.title')} description={t('builder.description')} titleRight={<Group gap='xs'> <Badge color={MODALITY_COLORS[draft.modality]} variant='light'>…</Badge> <Badge color={getActiveStatusColor(draft.isActive)} variant='light'>…</Badge> {draft.modality === 'STANDARD' && <Badge variant='outline' color='gray'>{t('builder.maxScore', { score: getFormMaxScore(draft) })}</Badge>} <Button variant='light' size='sm' leftSection={<IconEye size={16} />} onClick={() => setPreviewOpen(true)}>{t('actions.preview')}</Button> </Group>}`.
- Body:

```tsx
<div className={styles.layout}>
	<aside className={styles.outline}>
		<BuilderOutline … />
	</aside>
	<section className={styles.editor}>
		{selected?.kind === 'form' && <FormDetailsEditor form={draft} error={…} onChange={updateDetails} />}
		{selected?.kind === 'section' && <SectionEditor … />}
		{selected?.kind === 'question' && <QuestionEditor … />}
		{!selected && <EmptyState icon={<IconListCheck size={32} />} message={t('builder.selectPrompt')} description={t('builder.selectPromptDescription')} />}
	</section>
</div>
<Box className={styles.stickyActions}>
	<Group justify='flex-end' gap='xs'>
		<Button variant='subtle' onClick={handleLeave}>{t('actions.cancel')}</Button>
		<Button leftSection={<IconDeviceFloppy size={16} />} disabled={!isDirty} onClick={handleSave}>{t('actions.save')}</Button>
	</Group>
</Box>
<PreviewDrawer opened={previewOpen} onClose={() => setPreviewOpen(false)} form={draft} />
```

**4c. `FormBuilderPage.module.css`** (rewrite):

```css
.layout {
	display: grid;
	grid-template-columns: 320px minmax(0, 1fr);
	gap: var(--mantine-spacing-md);
	align-items: start;
}

.outline {
	position: sticky;
	top: var(--mantine-spacing-md);
	max-height: calc(100vh - 180px);
	overflow-y: auto;
}

.editor {
	min-width: 0;
}

/* Keeps Cancel / Save in view while the long form scrolls. Same recipe as CoachingRuleForm. */
.stickyActions {
	position: sticky;
	bottom: var(--mantine-spacing-xs);
	margin-top: var(--mantine-spacing-md);
	padding: var(--mantine-spacing-sm) var(--mantine-spacing-md);
	background: var(--surface-card);
	border: 1px solid var(--surface-border);
	border-radius: var(--mantine-radius-lg);
	box-shadow: var(--mantine-shadow-sm);
	z-index: 10;
}

@media (max-width: 62em) {
	.layout {
		grid-template-columns: 1fr;
	}
	.outline {
		position: static;
		max-height: none;
	}
}

@media (max-width: 48em) {
	.stickyActions {
		bottom: 0;
		padding: var(--mantine-spacing-sm);
	}
}
```

**4d. `components/BuilderOutline/BuilderOutline.tsx`** (+ `.module.css`, `index.ts`). In this task render the static list; Task 5 adds DnD.

Props: `{ draft: BuilderForm; selection: BuilderSelection; onSelect: (s: BuilderSelection) => void; onAddSection: () => void; onAddQuestion: (sectionId: string) => void; onReorderSections: (from: number, to: number) => void; onMoveQuestion: (args: MoveQuestionArgs) => void }`.

Structure: `SectionCard padding='sm' icon={IconListTree} title={t('builder.outline')} description={t('builder.outlineHint')} headerActions={<Button size='xs' variant='light' leftSection={<IconPlus size={14} />} onClick={onAddSection}>{t('actions.addSection')}</Button>}`:

1. Row `.item .formRow` (`IconFileDescription` 16 + `t('builder.formDetails')` + dimmed `draft.name`), `.selected` when `selection?.kind === 'form'`, `onClick → onSelect({ kind: 'form' })`.
2. `Text size='xs' fw={700} c='dimmed' tt='uppercase'` `t('builder.sections')`.
3. When no sections: `Text size='sm' c='dimmed'` `t('builder.noSections')`.
4. Per section (index `si`): `div.sectionRow` (`.selected` when selected): grip (`IconGripVertical` 16, class `.grip`), `Text size='sm' fw={600}` `section.name || t('section.namePlaceholder')` (italic + dimmed when empty), `Badge size='xs' variant='light' color='gray'` `t('section.questionCount', { count })`, `ActionIcon size='sm' variant='subtle'` `IconPlus` with `Tooltip t('actions.addQuestion')` → `onAddQuestion(section.id)` (`e.stopPropagation()`). Click on the row → `onSelect({ kind: 'section', id })`.
   Under it `div.questionList`: per question (index `qi`) `div.questionRow` (`.selected`, `.inactive` when `!q.isActive`): grip, `Text size='xs' c='dimmed' className={styles.number}` `t('builder.questionNumber', { section: si + 1, question: qi + 1 })`, `Text size='sm' lineClamp={2}` `q.text || t('question.textPlaceholder')` (dimmed italic when empty), trailing badges (`size='xs'`): `IconAlertTriangle` 14 `c='red'` with tooltip `question.badges.autoFail` when `autoFail !== 'NONE'`; `Badge color='gray'` `question.badges.na` when `notApplicable`; COPC: `Badge color='violet' variant='outline'` `q.errorCode` when set; Standard open: `Badge color='gray' variant='outline'` `question.badges.open`. Empty section → `Text size='xs' c='dimmed' className={styles.dropHint}` `t('builder.noQuestions')`.

`BuilderOutline.module.css`:

```css
.item,
.sectionRow,
.questionRow {
	display: flex;
	align-items: center;
	gap: var(--mantine-spacing-xs);
	padding: 6px var(--mantine-spacing-xs);
	border-radius: var(--mantine-radius-md);
	border: 1px solid transparent;
	cursor: pointer;
	background: var(--surface-card);
}

.item:hover,
.sectionRow:hover,
.questionRow:hover {
	background: light-dark(
		var(--mantine-color-gray-0),
		var(--mantine-color-dark-6)
	);
}

.selected {
	border-color: var(--mantine-primary-color-filled);
	background: light-dark(
		var(--mantine-primary-color-0),
		var(--mantine-color-dark-5)
	);
}

.sectionRow {
	margin-top: var(--mantine-spacing-xs);
}

.questionList {
	margin-left: var(--mantine-spacing-lg);
	padding-left: var(--mantine-spacing-xs);
	border-left: 2px solid var(--surface-border);
	display: flex;
	flex-direction: column;
	gap: 2px;
	min-height: 28px;
}

.questionRow {
	padding-block: 4px;
}

.inactive {
	opacity: 0.55;
}

.grip {
	color: var(--mantine-color-dimmed);
	cursor: grab;
	display: flex;
	flex-shrink: 0;
}

.grip:active {
	cursor: grabbing;
}

.number {
	flex-shrink: 0;
	min-width: 28px;
}

.dragging {
	box-shadow: var(--mantine-shadow-md);
	background: light-dark(
		var(--mantine-color-white),
		var(--mantine-color-dark-6)
	);
}

.dropHint {
	padding: 4px var(--mantine-spacing-xs);
}

.dropActive {
	background: light-dark(
		var(--mantine-primary-color-0),
		var(--mantine-color-dark-5)
	);
	border-radius: var(--mantine-radius-md);
}
```

**4e. `components/FormDetailsEditor/FormDetailsEditor.tsx`** (+ `index.ts`):

Props `{ form: BuilderForm; error: DraftError | null; onChange: (p: Partial<Pick<BuilderForm, 'name' | 'category' | 'description' | 'isActive'>>) => void }`.
`SectionCard icon={IconFileDescription} title={t('details.title')} description={t('details.description')}`, `Stack gap='sm'`: `TextInput` name (required, `error={error?.key === 'nameRequired' ? t('builder.validation.nameRequired') : undefined}`, `maw={480}`), `TextInput` category (`placeholder` `fields.categoryPlaceholder`, `maw={320}`), `Textarea` description (`autosize minRows={3}`), `Switch` `label={t('fields.active')}` checked `isActive`. A read-only `Group`: `Text size='sm' c='dimmed'` `t('modality.label')` + modality badge + hint text (`modality.standardHint` / `copcHint`) so stakeholders see it cannot change.

**4f. `components/SectionEditor/SectionEditor.tsx`** (+ `index.ts`):

Props `{ section: BuilderSection; index: number; error: DraftError | null; onChange: (p: Partial<Pick<BuilderSection, 'name' | 'guidance'>>) => void; onAddQuestion: () => void; onDelete: () => void }`.
`SectionCard icon={IconListCheck} title={`${index + 1}. ${t('section.title')}`} headerActions={<Button size='xs' color='red' variant='subtle' leftSection={<IconTrash size={14} />} onClick={onDelete}>{t('actions.deleteSection')}</Button>}`. Fields: `TextInput` name (required; error when `error?.key === 'sectionNameRequired' && error.selection.id === section.id`), `Textarea` guidance (`description={t('section.guidanceHelp')}`, autosize 3 rows). Footer: `Group justify='space-between'`: `Text size='sm' c='dimmed'` `t('section.questionCount', { count })` and `Button size='sm' variant='light' leftSection={<IconPlus size={16} />} onClick={onAddQuestion}>{t('actions.addQuestion')}`.

Delete confirm lives in the page: `modals.openConfirmModal` with `groups.deleteTitle` and `section.deleteConfirm` (`{ name, count }`) or `section.deleteConfirmEmpty` when no questions; confirm label `actions.delete`, `confirmProps color red`.

**4g. `components/QuestionEditor/QuestionEditor.tsx`** (+ `.module.css`, `index.ts`) and **`components/OptionsEditor/OptionsEditor.tsx`** (+ `index.ts`):

`QuestionEditor` props `{ question: BuilderQuestion; sectionName: string; number: string; error: DraftError | null; onChange: (p: Partial<BuilderQuestion>) => void; onDelete: () => void }`.

`SectionCard icon={IconHelpCircle} title={`${number} · ${t('question.title')}`} description={sectionName} headerActions={delete button like SectionEditor with t('actions.deleteQuestion')}`. Body `Stack gap='md'`:

| Field                   | Control                                                                                                                                                                                                                | Notes                                                     |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Question                | `Textarea` `label={t('question.text')}` required, `autosize minRows={2}`, `placeholder question.textPlaceholder`, `data-autofocus`                                                                                     | error when `error.key === 'questionRequired'` for this id |
| Evaluator guidance      | `Textarea` `label={t('question.guidance')}` `description={t('question.guidanceHelp')}` autosize 3 rows                                                                                                                 |                                                           |
| Modality block          | `question.modality === 'STANDARD' ? <StandardFields/> : <CopcFields/>`                                                                                                                                                 | inner components in the same file                         |
| `Divider`               |                                                                                                                                                                                                                        |                                                           |
| Active                  | `Switch` `label={t('question.active')}` `description={t('question.activeHelp')}`                                                                                                                                       |                                                           |
| Not applicable          | `Switch` `label={t('question.notApplicable')}` `description={t('question.notApplicableHelp')}`                                                                                                                         |                                                           |
| Requires agent identity | `Switch` `label={t('question.requiresIdentity')}` `description={t('question.requiresIdentityHelp')}`                                                                                                                   |                                                           |
| Auto-fail               | `Select` `label={t('question.autoFail')}` `description={t('question.autoFailHelp')}` `allowDeselect={false}` `data={AUTO_FAIL_SCOPES.map(v => ({ value: v, label: t(`question.autoFailOptions.${v}`) }))}` `maw={320}` |                                                           |

`StandardFields` (`question: StandardQuestion`):

- `Select` `label={t('question.answerType')}` `allowDeselect={false}` `data={STANDARD_ANSWER_TYPES.map(…)}` `maw={320}` → `onChange({ answerType })`.
- When `MULTIPLE_CHOICE`: `Group justify='space-between'` with `Text fw={700} size='sm'` `t('question.options')` and `Badge color='blue' variant='light'` `t('question.derivedWeight', { weight: getQuestionWeight(question) })`; then `<OptionsEditor options={question.options} error={…optionsRequired for this id} onChange={(options) => onChange({ options })} />`.
- When `OPEN`: `Text size='sm' c='dimmed'` `t('question.openAnswerHint')`.

`CopcFields` (`question: CopcQuestion`):

- `Radio.Group` `label={t('question.favorableAnswer')}` `description={t('question.favorableAnswerHelp')}` value `favorableAnswer` → `Group mt='xs'`: `Radio value='YES' label={t('question.yes')}`, `Radio value='NO' label={t('question.no')}`.
- `Select` `label={t('question.errorType')}` required `placeholder={t('question.errorTypePlaceholder')}` `data={COPC_ERROR_CODES.map(c => ({ value: c, label: t(`question.errorCodes.${c}`) }))}` `value={question.errorCode}` → `onChange({ errorCode })`; error when `error.key === 'errorTypeRequired'` for this id. `maw={420}`.
- `Select` `label={t('question.campaignType')}` `description={t('question.campaignTypeHelp')}` `allowDeselect={false}` `data={COPC_CAMPAIGN_TYPES.map(…)}` `maw={320}`.
- Put the two selects in a `SimpleGrid cols={{ base: 1, sm: 2 }}`.

`OptionsEditor` props `{ options: BuilderOption[]; error?: string; onChange: (options: BuilderOption[]) => void }`: `Stack gap='xs'`; per option a `Group gap='xs' wrap='nowrap' align='flex-end'`: `TextInput` `label={t('question.optionLabel')}` (flex 1, `className={styles.grow}`) value label; `NumberInput` `label={t('question.optionScore')}` `min={0}` `w={110}` value score (`typeof v === 'number' ? v : 0`); `ActionIcon color='red' variant='subtle' disabled={options.length === 1}` `IconTrash` → remove. Below: `Button size='xs' variant='light' leftSection={<IconPlus size={14} />}` `t('question.addOption')` → append `createEmptyOption()`. Show `error` as `Text size='xs' c='red'` under the list. Changes are emitted as a new array (immutable).

`QuestionEditor.module.css`: `.grow { flex: 1; min-width: 0; }` (used by OptionsEditor too; or give OptionsEditor its own module with the same rule).

**4h. `components/PreviewDrawer/PreviewDrawer.tsx`** (+ `index.ts`):

Props `{ opened: boolean; onClose: () => void; form: BuilderForm }`. `AppDrawer position='right' size='lg' opened onClose icon={<IconEye size={18} />} title={form.name || t('preview.title')} description={t('preview.description')} headerActions={modality badge}`. Body `Stack gap='md'`: for each section (index `si`) a `SectionCard padding='md' title={`${si + 1}. ${section.name}`} description={section.guidance || undefined}`; inside, active questions only, each as `Stack gap={4}` with `Group gap='xs'`: `Text size='sm' fw={600}` `${si + 1}.${qi + 1} ${q.text}`, `Badge size='xs' color='gray'` `preview.na`when`notApplicable`, `IconAlertTriangle`14 red when auto-fail; then the control, all`disabled`:

- Standard multiple choice → `Radio.Group`: one `Radio` per option, label `${o.label} (${o.score})`.
- Standard open → `Textarea minRows={2} placeholder={t('question.answerTypes.OPEN')}`.
- COPC → `Radio.Group` with `YES`/`NO` radios; `Text size='xs' c='dimmed'` `t('preview.favorable', { answer: t(`question.${q.favorableAnswer.toLowerCase()}`) })`; `Group gap={4}`: `Badge size='xs' color='violet' variant='light'` `q.errorCode ?? '—'`, `Badge size='xs' color='gray' variant='outline'` `t(`question.campaignTypes.${q.campaignType}`)`.
- Guidance, when present: `Text size='xs' c='dimmed' fs='italic'`.
  When the form has no sections: `EmptyState message={t('preview.empty')}`.

`npm run typecheck`.

### Task 5 — Drag & drop in the outline

In `BuilderOutline.tsx`, import `{ DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd'` (pattern: `NodeEdgesTab.tsx` 190-279).

- Wrap the sections block in `<DragDropContext onDragEnd={handleDragEnd}>`.
- `<Droppable droppableId='sections' type='SECTION'>` → `div ref={provided.innerRef} {...provided.droppableProps}`; each section `<Draggable draggableId={`section:${section.id}`} index={si}>` → the `.sectionRow` wrapper div gets `ref={p.innerRef} {...p.draggableProps}`, the grip gets `{...p.dragHandleProps}`, class `.dragging` when `snapshot.isDragging`. The question list stays inside the same Draggable so a section drags with its questions. `{provided.placeholder}` after the map.
- Inside each section: `<Droppable droppableId={`section:${section.id}`} type='QUESTION'>` → the `.questionList` div (add `.dropActive` when `snapshot.isDraggingOver`); each question `<Draggable draggableId={`question:${q.id}`} index={qi}>` with the same ref/props/handle pattern; `{provided.placeholder}`; keep the `.dropHint` text when empty so there is a drop target.
- `handleDragEnd`:

```ts
const stripPrefix = (id: string) => id.slice(id.indexOf(':') + 1);
const handleDragEnd = (result: DropResult) => {
	const { source, destination, type } = result;
	if (!destination) return;
	if (type === 'SECTION') {
		if (source.index === destination.index) return;
		onReorderSections(source.index, destination.index);
		return;
	}
	const fromSectionId = stripPrefix(source.droppableId);
	const toSectionId = stripPrefix(destination.droppableId);
	if (fromSectionId === toSectionId && source.index === destination.index)
		return;
	onMoveQuestion({
		fromSectionId,
		toSectionId,
		fromIndex: source.index,
		toIndex: destination.index,
	});
};
```

- Row `onClick` selection must not fire on drag: hello-pangea suppresses click after a drag, so no extra guard is needed. Keep `onClick` on the row, not on the grip.

`npm run typecheck`.

### Task 6 — Clean-up and checks

- `grep -rn "formsQueries\|FormsListPage.helpers\|QuestionFormModal\|GroupPanel\|FormMetadataCard\|ImportTemplateModal" src/modules/qa/forms` → only `ErrorTypesPage` may still reference nothing of these; expect no results.
- `grep -rn "getQuestionWeight" src` → only the new `helpers.ts` and `QuestionEditor.tsx` / `PreviewDrawer.tsx` if used.
- `npm run typecheck` clean for the touched files (pre-existing errors in `src/views/Campaigns/pages/CampaignCreate.tsx`, `CampaignDetail.tsx`, `ConversationAspects.tsx` are unrelated and expected).
- `npx prettier --write` on every touched file only.
- Both themes: every new colour comes from Mantine variables, `var(--surface-*)` or `light-dark()`; no inline styles (the only exception already documented is the `ContentContainer` sentinel).

---

## Behaviour summary (for the demo script)

| Where      | Action                                        | Result                                                                                  |
| ---------- | --------------------------------------------- | --------------------------------------------------------------------------------------- |
| Forms list | Change "Primary COPC form"                    | Store updates, success toast, star icon moves to that row                               |
| Forms list | Pick "Create new form…" in a primary selector | Create modal opens with that modality preselected                                       |
| Forms list | Create form                                   | Form added to the store, navigate to the builder, outline shows "Form details" selected |
| Forms list | Duplicate                                     | New inactive copy "(copy)" at the top of the table                                      |
| Forms list | Delete                                        | Confirm, row removed, primary pointer cleared if it pointed there                       |
| Builder    | Click any outline row                         | Right pane swaps editor; selection highlighted                                          |
| Builder    | Add section / Add question                    | Item appended and selected; Save becomes enabled                                        |
| Builder    | Drag a section                                | Sections reorder; numbering updates                                                     |
| Builder    | Drag a question inside or across sections     | Question moves; numbering updates                                                       |
| Builder    | Switch Standard answer type to Open           | Options hidden, weight badge gone, hint shown; switching back restores options          |
| Builder    | COPC question without error type → Save       | Warning toast, that question selected, error under Error type                           |
| Builder    | Save (valid)                                  | Store updated, toast, Save disabled again, list shows new Updated date                  |
| Builder    | Cancel / back with changes                    | Discard dialog; Discard returns to the list, Cancel stays                               |
| Builder    | Preview                                       | Drawer with the draft rendered read-only, inactive questions hidden                     |

---

## Verification

No dev server and no tests in this session (DESIGN_ROLE.md). Verify with:

1. `npm run typecheck` after each task; final run shows only the three pre-existing `src/views/Campaigns` errors.
2. `node -e` JSON parse of both `qa.forms.json` files.
3. Grep checks in Task 6.
4. Visual check is done by the user in their own dev server: `/qa/forms` and `/qa/forms/frm-001` (COPC) and `/qa/forms/frm-002` (Standard), in light and dark mode.

## Out of scope (not built)

- Backend persistence; the real `formsApi`/`formsQueries` stay unused. `NewEvaluationModal` keeps using the real API form list.
- `useBlocker` for browser back / sidebar navigation (the discard guard covers the page's own Cancel and back button only).
- Import/export template buttons (removed from the mock list page).
- Linking a campaign to a form; "primary" is global per modality.
