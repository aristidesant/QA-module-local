import axios from 'axios';
import { DEFAULT_API_URL } from './config';
import type {
	AgentTest,
	AgentTestChatMessage,
	AgentTestConfig,
	AgentTestExample,
	AgentTestListParams,
	AgentTestListResponse,
	CreateAgentTestDto,
	DeleteAgentTestResponse,
	RunAgentTestsDto,
	RunAgentTestsResponse,
	UpdateAgentTestDto,
} from '~/models/AgentTestModel';

type UnknownRecord = Record<string, unknown>;

const normalizeIdLike = (
	value: unknown
): string | number | null | undefined => {
	if (value === null) return null;
	if (typeof value === 'string' || typeof value === 'number') {
		return value;
	}
	return undefined;
};

const normalizeChatHistory = (value: unknown): AgentTestChatMessage[] => {
	if (!Array.isArray(value)) return [];

	return value
		.map((item) => {
			if (!item || typeof item !== 'object') return null;
			const row = item as UnknownRecord;
			const agentMetadataRaw =
				((row.agentMetadata ?? row.agent_metadata) as UnknownRecord | null) ??
				null;
			const role: AgentTestChatMessage['role'] =
				String(row.role ?? 'user').toLowerCase() === 'agent' ? 'agent' : 'user';
			const message = String(row.message ?? '').trim();
			if (!message) return null;
			const timeInCallSecsRaw = row.timeInCallSecs ?? row.time_in_call_secs;

			return {
				role,
				agentMetadata:
					agentMetadataRaw && typeof agentMetadataRaw === 'object'
						? {
								agentId:
									(agentMetadataRaw.agentId ?? agentMetadataRaw.agent_id)
										? String(
												agentMetadataRaw.agentId ?? agentMetadataRaw.agent_id
											)
										: null,
								branchId:
									(agentMetadataRaw.branchId ?? agentMetadataRaw.branch_id)
										? String(
												agentMetadataRaw.branchId ?? agentMetadataRaw.branch_id
											)
										: null,
								workflowNodeId:
									(agentMetadataRaw.workflowNodeId ??
									agentMetadataRaw.workflow_node_id)
										? String(
												agentMetadataRaw.workflowNodeId ??
													agentMetadataRaw.workflow_node_id
											)
										: null,
							}
						: null,
				message,
				multivoiceMessage:
					typeof (row.multivoiceMessage ?? row.multivoice_message) === 'string'
						? String(row.multivoiceMessage ?? row.multivoice_message)
						: null,
				toolCalls: Array.isArray(row.toolCalls ?? row.tool_calls)
					? ((row.toolCalls ?? row.tool_calls) as unknown[])
					: [],
				toolResults: Array.isArray(row.toolResults ?? row.tool_results)
					? ((row.toolResults ?? row.tool_results) as unknown[])
					: [],
				feedback: row.feedback ?? null,
				llmOverride: row.llmOverride ?? row.llm_override ?? null,
				timeInCallSecs:
					typeof timeInCallSecsRaw === 'number' ? timeInCallSecsRaw : undefined,
				conversationTurnMetrics:
					row.conversationTurnMetrics ?? row.conversation_turn_metrics ?? null,
				ragRetrievalInfo:
					row.ragRetrievalInfo ?? row.rag_retrieval_info ?? null,
				llmUsage: row.llmUsage ?? row.llm_usage ?? null,
				interrupted:
					typeof row.interrupted === 'boolean' ? row.interrupted : false,
				originalMessage:
					typeof (row.originalMessage ?? row.original_message) === 'string'
						? String(row.originalMessage ?? row.original_message)
						: null,
				sourceMedium:
					typeof (row.sourceMedium ?? row.source_medium) === 'string'
						? String(row.sourceMedium ?? row.source_medium)
						: null,
			} as AgentTestChatMessage;
		})
		.filter((item): item is AgentTestChatMessage => item !== null);
};

const normalizeExamples = (
	value: unknown,
	type: AgentTestExample['type']
): AgentTestExample[] => {
	if (!Array.isArray(value)) return [];

	return value
		.map((item) => {
			if (!item || typeof item !== 'object') return null;
			const row = item as UnknownRecord;
			const response = String(row.response ?? '').trim();
			if (!response) return null;
			return {
				response,
				type,
			};
		})
		.filter((item): item is AgentTestExample => Boolean(item));
};

const normalizeTestConfig = (value: unknown): AgentTestConfig | undefined => {
	if (!value || typeof value !== 'object') {
		return undefined;
	}

	const row = value as UnknownRecord;
	const expectedResponse = String(
		row.expectedResponse ?? row.success_condition ?? ''
	).trim();

	return {
		id: String(row.id ?? ''),
		name: String(row.name ?? ''),
		type: row.type === 'tool' ? 'tool' : 'llm',
		chatHistory: normalizeChatHistory(row.chatHistory ?? row.chat_history),
		successCondition: String(
			row.successCondition ?? row.success_condition ?? expectedResponse
		).trim(),
		successExamples: normalizeExamples(
			row.successExamples ?? row.success_examples,
			'success'
		),
		failureExamples: normalizeExamples(
			row.failureExamples ?? row.failure_examples,
			'failure'
		),
		dynamicVariables: (row.dynamicVariables ??
			row.dynamic_variables ??
			{}) as Record<string, string | number | boolean>,
	};
};

const normalizeSingleTest = (raw: unknown): AgentTest => {
	const row = (raw ?? {}) as UnknownRecord;
	const accessInfoRaw =
		((row.accessInfo ?? row.access_info) as UnknownRecord | null) ?? null;
	const prompt = String(row.prompt ?? '').trim();
	const expectedResponse = String(
		row.expectedResponse ?? row.success_condition ?? ''
	).trim();
	const testConfig = normalizeTestConfig(row.testConfig ?? row.test_config);
	const sourceRow = (
		testConfig ? (row.testConfig ?? row.test_config) : row
	) as UnknownRecord;
	const createdAtUnixSecsRaw =
		row.createdAtUnixSecs ?? row.created_at_unix_secs;
	const lastUpdatedAtUnixSecsRaw =
		row.lastUpdatedAtUnixSecs ?? row.last_updated_at_unix_secs;

	return {
		id: String(row.id ?? ''),
		name: String(row.name ?? ''),
		testId:
			(row.testId ?? row.test_id)
				? String(row.testId ?? row.test_id)
				: undefined,
		identifier:
			typeof row.identifier === 'string' ? String(row.identifier) : undefined,
		clientId: normalizeIdLike(row.clientId ?? row.client_id) ?? undefined,
		campaignId: normalizeIdLike(row.campaignId ?? row.campaign_id) ?? null,
		testConfig,
		agentId:
			(row.agentId ?? row.agent_id)
				? String(row.agentId ?? row.agent_id)
				: undefined,
		type: sourceRow.type === 'tool' ? 'tool' : 'llm',
		chatHistory: normalizeChatHistory(
			sourceRow.chatHistory ?? sourceRow.chat_history
		),
		successCondition: String(
			sourceRow.successCondition ??
				sourceRow.success_condition ??
				expectedResponse
		).trim(),
		successExamples: normalizeExamples(
			sourceRow.successExamples ?? sourceRow.success_examples,
			'success'
		),
		failureExamples: normalizeExamples(
			sourceRow.failureExamples ?? sourceRow.failure_examples,
			'failure'
		),
		dynamicVariables: (sourceRow.dynamicVariables ??
			sourceRow.dynamic_variables ??
			{}) as Record<string, string | number | boolean>,
		checkAnyToolMatches:
			typeof row.checkAnyToolMatches === 'boolean'
				? row.checkAnyToolMatches
				: typeof row.check_any_tool_matches === 'boolean'
					? (row.check_any_tool_matches as boolean)
					: undefined,
		toolCallParameters: (row.toolCallParameters ??
			row.tool_call_parameters) as AgentTest['toolCallParameters'],
		accessInfo:
			accessInfoRaw && typeof accessInfoRaw === 'object'
				? {
						isCreator:
							typeof accessInfoRaw.isCreator === 'boolean'
								? accessInfoRaw.isCreator
								: typeof accessInfoRaw.is_creator === 'boolean'
									? (accessInfoRaw.is_creator as boolean)
									: undefined,
						creatorName:
							typeof (
								accessInfoRaw.creatorName ?? accessInfoRaw.creator_name
							) === 'string'
								? String(
										accessInfoRaw.creatorName ?? accessInfoRaw.creator_name
									)
								: undefined,
						creatorEmail:
							typeof (
								accessInfoRaw.creatorEmail ?? accessInfoRaw.creator_email
							) === 'string'
								? String(
										accessInfoRaw.creatorEmail ?? accessInfoRaw.creator_email
									)
								: undefined,
						role:
							typeof accessInfoRaw.role === 'string'
								? accessInfoRaw.role
								: undefined,
					}
				: undefined,
		createdAtUnixSecs:
			typeof createdAtUnixSecsRaw === 'number'
				? createdAtUnixSecsRaw
				: undefined,
		lastUpdatedAtUnixSecs:
			typeof lastUpdatedAtUnixSecsRaw === 'number'
				? lastUpdatedAtUnixSecsRaw
				: undefined,

		// legacy compatibility
		prompt,
		expectedResponse,
		assertions: row.assertions as AgentTest['assertions'],
		notes: typeof row.notes === 'string' ? row.notes : undefined,
		createdAt:
			typeof (row.createdAt ?? row.created_at) === 'string'
				? String(row.createdAt ?? row.created_at)
				: undefined,
		updatedAt:
			typeof (row.updatedAt ?? row.updated_at) === 'string'
				? String(row.updatedAt ?? row.updated_at)
				: undefined,
	};
};

const toCreatePayload = (data: CreateAgentTestDto) => {
	const payload = {
		name: data.name,
		testConfig: {
			type: data.type ?? 'llm',
			chatHistory: data.chatHistory.map((item, index) => ({
				role: item.role,
				agentMetadata: item.agentMetadata
					? {
							agentId: item.agentMetadata.agentId ?? null,
							branchId: item.agentMetadata.branchId ?? null,
							workflowNodeId: item.agentMetadata.workflowNodeId ?? null,
						}
					: null,
				message: item.message,
				multivoiceMessage: item.multivoiceMessage ?? null,
				toolCalls: item.toolCalls ?? [],
				toolResults: item.toolResults ?? [],
				feedback: item.feedback ?? null,
				llmOverride: item.llmOverride ?? null,
				timeInCallSecs: item.timeInCallSecs ?? index,
				conversationTurnMetrics: item.conversationTurnMetrics ?? null,
				ragRetrievalInfo: item.ragRetrievalInfo ?? null,
				llmUsage: item.llmUsage ?? null,
				interrupted: item.interrupted ?? false,
				originalMessage: item.originalMessage ?? null,
				sourceMedium: item.sourceMedium ?? null,
			})),
			successCondition: data.successCondition,
			successExamples: data.successExamples,
			failureExamples: data.failureExamples,
			dynamicVariables: data.dynamicVariables ?? {},
		},
		toolCallParameters: data.toolCallParameters,
		checkAnyToolMatches: data.checkAnyToolMatches,
		notes: data.notes,
	};

	return payload;
};

const normalizeListResponse = (
	raw: unknown,
	params?: AgentTestListParams
): AgentTestListResponse => {
	const row = (raw ?? {}) as UnknownRecord;
	const list = Array.isArray(row.items)
		? row.items
		: Array.isArray(row.tests)
			? row.tests
			: [];

	return {
		items: list.map(normalizeSingleTest),
		total:
			typeof row.total === 'number'
				? row.total
				: Array.isArray(list)
					? list.length
					: 0,
		page: params?.page ?? 1,
		limit: params?.limit ?? params?.pageSize ?? 30,
		nextCursor:
			typeof row.next_cursor === 'string' ? row.next_cursor : undefined,
		hasMore: typeof row.has_more === 'boolean' ? row.has_more : false,
	};
};

const normalizeRunResponse = (raw: unknown): RunAgentTestsResponse => {
	const row = (raw ?? {}) as UnknownRecord;
	const testRuns = Array.isArray(row.testRuns ?? row.test_runs)
		? ((row.testRuns ?? row.test_runs) as unknown[])
		: [];
	const statusList = testRuns.map((item) =>
		String((item as UnknownRecord).status ?? '').toLowerCase()
	);
	const hasPending = statusList.some((status) => status === 'pending');
	const passed = statusList.filter((status) => status === 'passed').length;
	const failed = statusList.filter((status) => status === 'failed').length;

	return {
		jobId: String(row.jobId ?? row.id ?? row.testInvocationId ?? ''),
		testInvocationId: String(row.testInvocationId ?? row.id ?? ''),
		status: hasPending ? 'STARTED' : 'COMPLETED',
		agentId:
			(row.agentId ?? row.agent_id)
				? String(row.agentId ?? row.agent_id)
				: undefined,
		summary: testRuns.length
			? {
					total: testRuns.length,
					passed,
					failed,
				}
			: undefined,
		results: testRuns.map((item) => {
			const run = item as UnknownRecord;
			const runStatus = String(run.status ?? '').toLowerCase();
			const conditionResult =
				((run.conditionResult ??
					run.condition_result) as UnknownRecord | null) ?? null;
			const conditionRationale =
				((conditionResult?.rationale as UnknownRecord | null)?.summary as
					| string
					| undefined) ?? undefined;
			const conditionState = String(
				conditionResult?.result ?? ''
			).toLowerCase();
			const testInfo = (run.testInfo ?? run.test_info) as
				| UnknownRecord
				| undefined;
			const runChatHistory = normalizeChatHistory(
				testInfo?.chatHistory ?? testInfo?.chat_history
			);
			const agentResponses = Array.isArray(
				run.agentResponses ?? run.agent_responses
			)
				? ((run.agentResponses ?? run.agent_responses) as unknown[])
				: [];
			const lastAgentMessage = agentResponses
				.slice()
				.reverse()
				.find((response) => {
					if (!response || typeof response !== 'object') return false;
					const responseRow = response as UnknownRecord;
					return (
						String(responseRow.role ?? '').toLowerCase() === 'agent' &&
						typeof responseRow.message === 'string' &&
						responseRow.message.trim().length > 0
					);
				});
			const expectedResponse =
				typeof testInfo?.successCondition === 'string'
					? testInfo.successCondition
					: typeof testInfo?.success_condition === 'string'
						? String(testInfo.success_condition)
						: undefined;
			const actualResponse =
				lastAgentMessage && typeof lastAgentMessage === 'object'
					? String((lastAgentMessage as UnknownRecord).message)
					: undefined;

			return {
				testId: String(run.test_id ?? run.testId ?? ''),
				testName:
					typeof (run.testName ?? run.test_name) === 'string'
						? String(run.testName ?? run.test_name)
						: undefined,
				status:
					runStatus === 'passed'
						? 'PASSED'
						: runStatus === 'failed'
							? 'FAILED'
							: runStatus === 'pending'
								? 'PENDING'
								: conditionState === 'success'
									? 'PASSED'
									: conditionState === 'failure'
										? 'FAILED'
										: String(run.status ?? ''),
				expected: expectedResponse,
				actual: actualResponse,
				chatHistory: runChatHistory,
				rationale: conditionRationale,
			};
		}),
	};
};

const agentTestsApi = () => {
	return {
		listAgentTests: async (params?: AgentTestListParams) => {
			const response = await axios.get(`${DEFAULT_API_URL}/agent-test`, {
				params,
			});
			return normalizeListResponse(response.data, params);
		},

		getAgentTestById: async (testId: string) => {
			const response = await axios.get(
				`${DEFAULT_API_URL}/agent-test/${testId}`
			);
			return normalizeSingleTest(response.data);
		},

		createAgentTest: async (data: CreateAgentTestDto) => {
			const response = await axios.post(
				`${DEFAULT_API_URL}/agent-test`,
				toCreatePayload(data)
			);
			return normalizeSingleTest(response.data);
		},

		updateAgentTest: async (testId: string, data: UpdateAgentTestDto) => {
			const response = await axios.patch(
				`${DEFAULT_API_URL}/agent-test/${testId}`,
				{
					id: data.id,
					...toCreatePayload(data as CreateAgentTestDto),
				}
			);
			return normalizeSingleTest(response.data);
		},

		deleteAgentTest: async (testId: string) => {
			const response = await axios.delete<DeleteAgentTestResponse>(
				`${DEFAULT_API_URL}/agent-test/${testId}`
			);
			return response.data;
		},

		runAgentTests: async (agentId: string, data: RunAgentTestsDto) => {
			const response = await axios.post(
				`${DEFAULT_API_URL}/agent-test/run/${agentId}`,
				{
					tests: data.tests.map((item) => ({
						testId: item.testId,
						workflowNodeId: item.workflowNodeId,
					})),
					branchId: data.branchId,
					runConfig: data.runConfig,
				}
			);

			return normalizeRunResponse(response.data);
		},

		getTestRunStatus: async (jobId: string) => {
			const response = await axios.get(
				`${DEFAULT_API_URL}/agent-test/test-invocations/${jobId}`
			);
			return normalizeRunResponse(response.data);
		},
	};
};

export default agentTestsApi;
