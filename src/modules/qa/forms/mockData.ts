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

/** Categories the user has saved; the create dialog only lets them pick from these (plus any already on a form). */
export const MOCK_FORM_CATEGORIES: string[] = [
	'Sales',
	'Support',
	'Retention',
	'Cobros',
	'Localización',
];

export const MOCK_PRIMARY_FORM_IDS: PrimaryFormIds = {
	COPC: 'frm-001',
	STANDARD: 'frm-002',
};
