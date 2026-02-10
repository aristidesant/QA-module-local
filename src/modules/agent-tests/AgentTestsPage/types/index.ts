import type { AgentTestChatMessage } from '~/models/AgentTestModel';

export type StudioTestType = 'nextReply' | 'toolInvocation';
export type ConversationRole = 'agent' | 'user';

export type ConversationTurn = {
	role: ConversationRole;
	message: string;
};

export type DynamicVariable = {
	key: string;
	value: string;
};

export type AgentTestStudioMetadata = {
	__studio: true;
	testType: StudioTestType;
	successExamples: string[];
	failureExamples: string[];
	dynamicVariables: DynamicVariable[];
	conversation: ConversationTurn[];
	internalNotes?: string;
};

export type AgentTestFormValues = {
	name: string;
	successCondition: string;
	testType: StudioTestType;
	successExamples: string[];
	failureExamples: string[];
	dynamicVariables: DynamicVariable[];
	chatHistory: AgentTestChatMessage[];
};

export const DEFAULT_FORM_VALUES: AgentTestFormValues = {
	name: '',
	successCondition: '',
	testType: 'nextReply',
	successExamples: [],
	failureExamples: [],
	dynamicVariables: [],
	chatHistory: [],
};
