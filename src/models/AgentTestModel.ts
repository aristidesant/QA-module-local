export type AgentTestPrimitive = string | number | boolean;

export type AgentTestChatMessageRole = 'user' | 'agent';

export type AgentTestChatMessage = {
	role: AgentTestChatMessageRole;
	agentMetadata?: {
		agentId?: string | null;
		branchId?: string | null;
		workflowNodeId?: string | null;
	} | null;
	message: string;
	multivoiceMessage?: string | null;
	toolCalls?: unknown[];
	toolResults?: unknown[];
	feedback?: unknown | null;
	llmOverride?: unknown | null;
	timeInCallSecs?: number;
	conversationTurnMetrics?: unknown | null;
	ragRetrievalInfo?: unknown | null;
	llmUsage?: unknown | null;
	interrupted?: boolean;
	originalMessage?: string | null;
	sourceMedium?: string | null;
};

export type AgentTestExample = {
	response: string;
	type: 'success' | 'failure';
};

export type AgentTestType = 'llm' | 'tool';

export type AgentTestConfig = {
	id: string;
	name: string;
	type: AgentTestType;
	chatHistory: AgentTestChatMessage[];
	failureExamples: AgentTestExample[];
	successExamples: AgentTestExample[];
	dynamicVariables: Record<string, AgentTestPrimitive>;
	successCondition: string;
};

export type AgentTestToolCallParameterEval =
	| { type: 'anything' }
	| { type: 'exact'; expectedValue: string }
	| { type: 'llm'; description: string }
	| { type: 'regex'; pattern: string };

export type AgentTestToolCallParameter = {
	path: string;
	eval: AgentTestToolCallParameterEval;
};

export type AgentTestToolCallParameters = {
	parameters?: AgentTestToolCallParameter[];
	verifyAbsence?: boolean;
	checkAnyToolMatches?: boolean;
};

export type AgentTest = {
	id: string;
	name: string;
	testId?: string;
	identifier?: string;
	clientId?: string | number;
	campaignId?: string | number | null;
	testConfig?: AgentTestConfig;
	agentId?: string;
	type?: AgentTestType;
	chatHistory?: AgentTestChatMessage[];
	successCondition?: string;
	successExamples?: AgentTestExample[];
	failureExamples?: AgentTestExample[];
	dynamicVariables?: Record<string, AgentTestPrimitive>;
	toolCallParameters?: AgentTestToolCallParameters;
	checkAnyToolMatches?: boolean;
	accessInfo?: {
		isCreator?: boolean;
		creatorName?: string;
		creatorEmail?: string;
		role?: string;
	};
	createdAtUnixSecs?: number;
	lastUpdatedAtUnixSecs?: number;

	// Legacy compatibility fields
	prompt?: string;
	expectedResponse?: string;
	assertions?: { type: string; value: string }[] | string[];
	notes?: string;
	createdAt?: string;
	updatedAt?: string;
};

export type AgentTestListParams = {
	page?: number;
	limit?: number;
	pageSize?: number;
	cursor?: string;
	search?: string;
	agentId?: string;
};

export type AgentTestListResponse = {
	items: AgentTest[];
	total: number;
	page: number;
	limit: number;
	nextCursor?: string;
	hasMore?: boolean;
};

export type CreateAgentTestDto = {
	name: string;
	agentId?: string;
	type?: AgentTestType;
	chatHistory: AgentTestChatMessage[];
	successCondition: string;
	successExamples: AgentTestExample[];
	failureExamples: AgentTestExample[];
	dynamicVariables?: Record<string, AgentTestPrimitive>;
	toolCallParameters?: AgentTestToolCallParameters;
	checkAnyToolMatches?: boolean;

	// Optional legacy payload for backward-compatible backend adapters
	prompt?: string;
	expectedResponse?: string;
	assertions?: { type: string; value: string }[];
	notes?: string;
};

export type UpdateAgentTestDto = Partial<CreateAgentTestDto> & {
	id: string;
};

export type AgentTestRunConfig = {
	voiceId?: string;
	temperature?: number;
	attempts?: number;
};

export type RunAgentTestsDto = {
	tests: Array<{
		testId: string;
		workflowNodeId?: string;
	}>;
	branchId?: string;
	runConfig?: AgentTestRunConfig;
};

export type AgentTestRunStatus = 'STARTED' | 'COMPLETED' | 'FAILED';

export type AgentTestRunItemResult = {
	testId: string;
	status: 'PASSED' | 'FAILED' | string;
	expected?: string;
	actual?: string;
	testName?: string;
	chatHistory?: AgentTestChatMessage[];
	rationale?: string;
};

export type RunAgentTestsResponse = {
	jobId: string;
	status: AgentTestRunStatus | string;
	agentId?: string;
	startedAt?: string;
	testInvocationId?: string;
	summary?: {
		total: number;
		passed: number;
		failed: number;
	};
	results?: AgentTestRunItemResult[];
};

export type DeleteAgentTestResponse = {
	success: boolean;
	message: string;
};
