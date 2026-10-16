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
