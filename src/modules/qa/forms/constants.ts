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
export const FORMS_LIST_PATH = '/qa/forms';
export const formBuilderPath = (formId: string) => `/qa/forms/${formId}`;
