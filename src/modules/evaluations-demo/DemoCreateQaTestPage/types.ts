export type ErrorSeverity = 'Business Critical' | 'Client Critical' | 'Compliance Critical';
export type AnswerType = 'yesNo' | 'yesNoNA';

export interface EvaluationItem {
	id: string;
	name: string;
	description: string;
	severity: ErrorSeverity;
	answerType: AnswerType;
	yesPoints: number;
	noPoints: number;
	naPoints: number;
	autoFail: boolean;
	triggerAnswer: 'Yes' | 'No';
	generalAutoFail: boolean;
}

export interface EvaluationGroup {
	id: string;
	name: string;
	description: string;
	items: EvaluationItem[];
}

export interface QaTestDetails {
	name: string;
	qaType: string;
	description: string;
}

export type CriteriaMode = 'template' | 'scratch' | null;
