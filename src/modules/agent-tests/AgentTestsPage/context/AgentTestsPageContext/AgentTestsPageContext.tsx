import React, {
	createContext,
	useContext,
	useState,
	useMemo,
	useCallback,
	useEffect,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import agentTestsApi from '~/api/agentTestsApi';
import type {
	AgentTest,
	AgentTestChatMessage,
	RunAgentTestsResponse,
} from '~/models/AgentTestModel';
import {
	useCreateAgentTest,
	useDeleteAgentTest,
	useRunAgentTests,
	useUpdateAgentTest,
	useAgentTest,
	useTestRunStatus,
} from '~/queries/agentTestsQueries';
import type {
	AgentTestFormValues,
	ConversationRole,
	DynamicVariable,
} from '../../types';
import { DEFAULT_FORM_VALUES } from '../../types';
import {
	sanitizeDynamicVariables,
	serializeExamples,
	normalizeDynamicVariables,
	extractStudioMetadata,
	createEmptyChatHistoryMessage,
	normalizeChatHistoryForEditor,
	reindexChatHistoryTime,
	toConversationTurnsFromChatHistory,
	toExamples,
	trimNonEmpty,
	getAxiosFriendlyError,
} from '../../utils/agentTestStudioUtils';

interface AgentTestsPageContextType {
	// Pagination & Search
	page: number;
	setPage: (page: number) => void;
	limit: number;
	setLimit: (limit: number) => void;
	search: string;
	setSearch: (search: string) => void;
	agentId: string | null;
	setAgentId: (agentId: string | null) => void;

	// Tests data
	tests: AgentTest[];
	testsTotal: number;
	testsIsLoading: boolean;
	testsIsError: boolean;
	testsRefetch: () => void;

	// Modal States
	isModalOpen: boolean;
	setIsModalOpen: (open: boolean) => void;
	editingTest: AgentTest | null;
	setEditingTest: (test: AgentTest | null) => void;
	editingTestLoading: boolean;
	editingTestLoadingId: string | null;
	isModalTransitioning: boolean;

	// Selection & Run Results
	selectedTestIds: string[];
	setSelectedTestIds: (ids: string[]) => void;
	lastRunResult: RunAgentTestsResponse | null;
	setLastRunResult: (result: RunAgentTestsResponse | null) => void;
	selectedAgentForRun: string | null;
	setSelectedAgentForRun: (agentId: string | null) => void;
	isAgentSelectOpen: boolean;
	setIsAgentSelectOpen: (open: boolean) => void;
	agentSelectSource: 'studio' | 'table' | null;
	setAgentSelectSource: (source: 'studio' | 'table' | null) => void;
	pendingRunTests: string[] | null;
	setPendingRunTests: (tests: string[] | null) => void;
	openAgentSelectFromStudio: (testIds: string[]) => void;

	// Test Status Modal
	isTestStatusModalOpen: boolean;
	setIsTestStatusModalOpen: (open: boolean) => void;
	testStatusSuiteId: string | null;
	setTestStatusSuiteId: (suiteId: string | null) => void;
	testStatusAgentId: string | null;
	setTestStatusAgentId: (agentId: string | null) => void;
	testStatusData: RunAgentTestsResponse | null;
	testStatusRunTestIds: string[];
	closeTestStatusModal: () => void;

	// Form State
	form: ReturnType<typeof useForm<AgentTestFormValues>>;
	showSuccessExamples: boolean;
	setShowSuccessExamples: (show: boolean) => void;
	showFailureExamples: boolean;
	setShowFailureExamples: (show: boolean) => void;

	// Derived State
	chatHistoryPreview: AgentTestChatMessage[];
	dynamicVariablePreview: DynamicVariable[];

	// Queries & Mutations
	createAgentTest: ReturnType<typeof useCreateAgentTest>;
	updateAgentTest: ReturnType<typeof useUpdateAgentTest>;
	deleteAgentTest: ReturnType<typeof useDeleteAgentTest>;
	runAgentTests: ReturnType<typeof useRunAgentTests>;

	// Actions
	clearFormAndState: () => void;
	openCreateModal: () => void;
	openEditModal: (test: AgentTest) => void;
	openEditModalWithReload: (testId: string) => void;
	openEditFromStatus: (testId: string) => Promise<void>;
	closeModal: () => void;
	addSuccessExample: () => void;
	addFailureExample: () => void;
	addDynamicVariable: () => void;
	addConversationTurn: (index: number, role: ConversationRole) => void;
	removeConversationTurn: (index: number) => void;
	updateConversationTurnRole: (index: number, role: ConversationRole) => void;
	updateConversationTurnMessage: (index: number, message: string) => void;
	handleSubmit: (values: AgentTestFormValues) => Promise<void>;
	handleDelete: (test: AgentTest) => void;
	runTests: (testIds: string[], currentAgentId: string) => Promise<void>;
	runningTestIds: string[];
	handleRunSelected: (tests: AgentTest[]) => void;
	toggleRowSelection: (testId: string, checked: boolean) => void;
	toggleAllCurrentPage: (tests: AgentTest[], checked: boolean) => void;

	// Selection helpers
	allCurrentPageSelected: (tests: AgentTest[]) => boolean;
	someCurrentPageSelected: (tests: AgentTest[]) => boolean;

	// Clear filters action
	clearFilters: () => void;
}

const AgentTestsPageContext = createContext<AgentTestsPageContextType | null>(
	null
);

interface AgentTestsPageProviderProps {
	children: React.ReactNode;
}

export const AgentTestsPageProvider: React.FC<AgentTestsPageProviderProps> = ({
	children,
}) => {
	const { t } = useTranslation('agent-tests');
	const { t: tCommon } = useTranslation('common');
	const queryClient = useQueryClient();

	// Pagination & Search
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [search, setSearch] = useState('');
	const [agentId, setAgentId] = useState<string | null>(null);

	// Modal States
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingTest, setEditingTest] = useState<AgentTest | null>(null);
	const [editingTestLoading, setEditingTestLoading] = useState(false);
	const [editingTestLoadingId, setEditingTestLoadingId] = useState<
		string | null
	>(null);
	const [isModalTransitioning, setIsModalTransitioning] = useState(false);
	const [editingTestId, setEditingTestId] = useState<string | null>(null);

	// Selection & Run
	const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
	const [lastRunResult, setLastRunResult] =
		useState<RunAgentTestsResponse | null>(null);
	const [isAgentSelectOpen, setIsAgentSelectOpen] = useState(false);
	const [agentSelectSource, setAgentSelectSource] = useState<
		'studio' | 'table' | null
	>(null);
	const [selectedAgentForRun, setSelectedAgentForRun] = useState<string | null>(
		null
	);
	const [pendingRunTests, setPendingRunTests] = useState<string[] | null>(null);
	const [runningTestIds, setRunningTestIds] = useState<string[]>([]);

	// Test Status Modal
	const [isTestStatusModalOpen, setIsTestStatusModalOpen] = useState(false);
	const [testStatusSuiteId, setTestStatusSuiteId] = useState<string | null>(
		null
	);
	const [testStatusAgentId, setTestStatusAgentId] = useState<string | null>(
		null
	);
	const [testStatusRunTestIds, setTestStatusRunTestIds] = useState<string[]>(
		[]
	);

	// Form State
	const form = useForm<AgentTestFormValues>({
		initialValues: DEFAULT_FORM_VALUES,
		validate: {
			name: (value) =>
				value.trim().length === 0 ? t('form.validation.nameRequired') : null,
			successCondition: (value) =>
				value.trim().length === 0
					? t('form.validation.successConditionRequired')
					: null,
			dynamicVariables: (value) => {
				const rows = sanitizeDynamicVariables(value ?? []);
				const keys = rows.map((item) => item.key.toLowerCase());
				const uniqueCount = new Set(keys).size;
				if (keys.length !== uniqueCount) {
					return t('form.validation.duplicateDynamicVariable');
				}
				return null;
			},
		},
	});

	const [showSuccessExamples, setShowSuccessExamples] = useState(false);
	const [showFailureExamples, setShowFailureExamples] = useState(false);

	// Queries & Mutations
	const createAgentTest = useCreateAgentTest();
	const updateAgentTest = useUpdateAgentTest();
	const deleteAgentTest = useDeleteAgentTest();
	const runAgentTests = useRunAgentTests();
	const editingTestQuery = useAgentTest(
		editingTestId ?? '',
		Boolean(editingTestId)
	);
	const testStatusQuery = useTestRunStatus(testStatusSuiteId);

	// Derived State - Test Status Data
	const testStatusData = testStatusQuery.data ?? null;

	// Derived State
	const chatHistoryPreview = useMemo(
		() => normalizeChatHistoryForEditor(form.values.chatHistory ?? []),
		[form.values.chatHistory]
	);

	const dynamicVariablePreview = useMemo(
		() => sanitizeDynamicVariables(form.values.dynamicVariables),
		[form.values.dynamicVariables]
	);

	// Actions
	const clearFormAndState = useCallback(() => {
		setEditingTest(null);
		setEditingTestLoading(false);
		setEditingTestId(null);
		setEditingTestLoadingId(null);
		setShowSuccessExamples(false);
		setShowFailureExamples(false);
		form.setValues(DEFAULT_FORM_VALUES);
		form.clearErrors();
	}, [form]);

	const openCreateModal = useCallback(() => {
		clearFormAndState();
		setIsModalOpen(true);
	}, [clearFormAndState]);

	const openEditModal = useCallback(
		(test: AgentTest) => {
			setEditingTest(test);

			const { metadata } = extractStudioMetadata(test.notes);
			const fallbackConversation = [
				{ role: 'user' as const, message: test.prompt || '' },
				{ role: 'agent' as const, message: test.expectedResponse || '' },
			].filter((turn) => turn.message.length > 0);

			const metadataConversation = (metadata?.conversation ?? []).map(
				(turn, index) => ({
					...createEmptyChatHistoryMessage(turn.role, index),
					message: turn.message,
				})
			);

			const fallbackChatHistory = fallbackConversation.map((turn, index) => ({
				...createEmptyChatHistoryMessage(turn.role, index),
				message: turn.message,
			}));

			const initialChatHistory = test.chatHistory?.length
				? normalizeChatHistoryForEditor(test.chatHistory)
				: metadataConversation.length
					? normalizeChatHistoryForEditor(metadataConversation)
					: normalizeChatHistoryForEditor(fallbackChatHistory);
			const successCondition =
				test.successCondition ?? test.expectedResponse ?? test.prompt ?? '';

			form.setValues({
				name: test.name ?? '',
				successCondition,
				testType:
					test.type === 'tool'
						? 'toolInvocation'
						: (metadata?.testType ?? 'nextReply'),
				successExamples: test.successExamples?.length
					? serializeExamples(test.successExamples)
					: (metadata?.successExamples ?? []),
				failureExamples: test.failureExamples?.length
					? serializeExamples(test.failureExamples)
					: (metadata?.failureExamples ?? []),
				dynamicVariables: test.dynamicVariables
					? normalizeDynamicVariables(test.dynamicVariables)
					: (metadata?.dynamicVariables ?? []),
				chatHistory: reindexChatHistoryTime(initialChatHistory),
			});
			setShowSuccessExamples(
				(test.successExamples?.length ?? 0) > 0 ||
					(metadata?.successExamples?.length ?? 0) > 0
			);
			setShowFailureExamples(
				(test.failureExamples?.length ?? 0) > 0 ||
					(metadata?.failureExamples?.length ?? 0) > 0
			);

			form.clearErrors();
			setIsModalOpen(true);
		},
		[form]
	);

	const openEditModalWithReload = useCallback((testId: string) => {
		setEditingTestLoading(true);
		setEditingTestId(testId);
		setEditingTestLoadingId(testId);
	}, []);

	// Handle reload query success
	useEffect(() => {
		if (editingTestQuery.data && editingTestLoading) {
			setEditingTestLoading(false);
			setEditingTestId(null);
			setEditingTestLoadingId(null);
			openEditModal(editingTestQuery.data);
		}
	}, [editingTestQuery.data, editingTestLoading, openEditModal]);

	useEffect(() => {
		if (editingTestQuery.isError && editingTestLoading) {
			setEditingTestLoading(false);
			setEditingTestId(null);
			setEditingTestLoadingId(null);
		}
	}, [editingTestLoading, editingTestQuery.isError]);

	const closeModal = useCallback(() => {
		setIsModalOpen(false);
		clearFormAndState();
	}, [clearFormAndState]);

	const addSuccessExample = useCallback(() => {
		if (form.values.successExamples.length === 0) {
			form.setFieldValue('successExamples', ['']);
		}
		setShowSuccessExamples(true);
	}, [form]);

	const addFailureExample = useCallback(() => {
		if (form.values.failureExamples.length === 0) {
			form.setFieldValue('failureExamples', ['']);
		}
		setShowFailureExamples(true);
	}, [form]);

	const addDynamicVariable = useCallback(() => {
		form.setFieldValue('dynamicVariables', [
			...form.values.dynamicVariables,
			{ key: '', value: '' },
		]);
	}, [form]);

	const addConversationTurn = useCallback(
		(index: number, role: ConversationRole) => {
			const nextConversation = normalizeChatHistoryForEditor(
				form.values.chatHistory ?? []
			);
			nextConversation.splice(
				index + 1,
				0,
				createEmptyChatHistoryMessage(role)
			);
			form.setFieldValue(
				'chatHistory',
				reindexChatHistoryTime(nextConversation)
			);
		},
		[form]
	);

	const removeConversationTurn = useCallback(
		(index: number) => {
			const nextConversation = normalizeChatHistoryForEditor(
				form.values.chatHistory ?? []
			).filter((_turn, turnIndex) => turnIndex !== index);
			form.setFieldValue(
				'chatHistory',
				reindexChatHistoryTime(nextConversation)
			);
		},
		[form]
	);

	const updateConversationTurnRole = useCallback(
		(index: number, role: ConversationRole) => {
			const nextConversation = normalizeChatHistoryForEditor(
				form.values.chatHistory ?? []
			);
			if (!nextConversation[index]) {
				return;
			}

			nextConversation[index] = {
				...nextConversation[index],
				role,
			};

			form.setFieldValue(
				'chatHistory',
				reindexChatHistoryTime(nextConversation)
			);
		},
		[form]
	);

	const updateConversationTurnMessage = useCallback(
		(index: number, message: string) => {
			const nextConversation = normalizeChatHistoryForEditor(
				form.values.chatHistory ?? []
			);
			if (!nextConversation[index]) {
				return;
			}

			nextConversation[index] = {
				...nextConversation[index],
				message,
			};

			form.setFieldValue(
				'chatHistory',
				reindexChatHistoryTime(nextConversation)
			);
		},
		[form]
	);

	const handleSubmit = useCallback(
		async (values: AgentTestFormValues) => {
			const fullChatHistory = reindexChatHistoryTime(
				normalizeChatHistoryForEditor(values.chatHistory ?? [])
			);
			const chatHistory = fullChatHistory.filter(
				(item) => item.message.trim().length > 0
			);
			const parsedConversation =
				toConversationTurnsFromChatHistory(chatHistory);
			const successExamples = toExamples(values.successExamples, 'success');
			const failureExamples = toExamples(values.failureExamples, 'failure');
			const dynamicVariablesRows = sanitizeDynamicVariables(
				values.dynamicVariables
			);

			const metadata = {
				__studio: true as const,
				testType: values.testType,
				successExamples: trimNonEmpty(values.successExamples),
				failureExamples: trimNonEmpty(values.failureExamples),
				dynamicVariables: dynamicVariablesRows,
				conversation: parsedConversation,
			};

			const testAgentId = editingTest?.agentId ?? '';

			const payload = {
				name: values.name.trim(),
				agentId: testAgentId,
				type:
					values.testType === 'toolInvocation'
						? ('tool' as const)
						: ('llm' as const),
				chatHistory,
				successCondition: values.successCondition.trim(),
				successExamples,
				failureExamples,
				dynamicVariables: dynamicVariablesRows.reduce<Record<string, string>>(
					(acc, item) => {
						acc[item.key] = item.value;
						return acc;
					},
					{}
				),
				prompt:
					parsedConversation.find((item) => item.role === 'user')?.message ||
					'',
				expectedResponse:
					values.successCondition.trim() ||
					parsedConversation
						.slice()
						.reverse()
						.find((item) => item.role === 'agent')?.message ||
					'',
				notes: JSON.stringify(metadata),
			};

			const hasUserTurn = parsedConversation.some(
				(item) => item.role === 'user'
			);

			if (!payload.chatHistory.length || !hasUserTurn) {
				notifications.show({
					title: tCommon('status.error'),
					message: t('form.validation.promptAndExpectedFromConversation'),
					color: 'red',
				});
				return;
			}

			try {
				if (editingTest?.id) {
					await updateAgentTest.mutateAsync({
						id: editingTest.id,
						...payload,
					});
					notifications.show({
						title: tCommon('status.success'),
						message: t('notifications.updated'),
						color: 'green',
					});
				} else {
					await createAgentTest.mutateAsync(payload);
					notifications.show({
						title: tCommon('status.success'),
						message: t('notifications.created'),
						color: 'green',
					});
				}

				closeModal();
			} catch (error) {
				notifications.show({
					title: tCommon('status.error'),
					message: getAxiosFriendlyError(error, t('notifications.saveError')),
					color: 'red',
				});
			}
		},
		[editingTest, createAgentTest, updateAgentTest, closeModal, t, tCommon]
	);

	const handleDelete = useCallback(
		(test: AgentTest) => {
			modals.openConfirmModal({
				title: t('delete.title'),
				centered: true,
				labels: {
					confirm: tCommon('actions.delete'),
					cancel: tCommon('actions.cancel'),
				},
				confirmProps: { color: 'red' },
				children: <div>{t('delete.description', { name: test.name })}</div>,
				onConfirm: async () => {
					try {
						await deleteAgentTest.mutateAsync(test.id);
						setSelectedTestIds((current) =>
							current.filter((id) => id !== test.id)
						);
						notifications.show({
							title: tCommon('status.success'),
							message: t('notifications.deleted'),
							color: 'green',
						});
					} catch (error) {
						notifications.show({
							title: tCommon('status.error'),
							message: getAxiosFriendlyError(
								error,
								t('notifications.deleteError')
							),
							color: 'red',
						});
					}
				},
			});
		},
		[deleteAgentTest, t, tCommon]
	);

	const runTests = useCallback(
		async (testIds: string[], currentAgentId: string) => {
			if (testIds.length === 0) {
				notifications.show({
					title: tCommon('status.error'),
					message: t('run.noSelection'),
					color: 'red',
				});
				return;
			}

			if (!currentAgentId) {
				setPendingRunTests(testIds);
				setAgentSelectSource('table');
				setIsAgentSelectOpen(true);
				return;
			}

			try {
				setRunningTestIds(testIds);
				const response = await runAgentTests.mutateAsync({
					agentId: currentAgentId,
					data: {
						tests: testIds.map((testId) => ({ testId })),
					},
				});

				setLastRunResult(response);

				// Open test status modal for polling
				setIsModalOpen(false);
				setTestStatusSuiteId(response.testInvocationId || response.jobId);
				setTestStatusAgentId(currentAgentId);
				setTestStatusRunTestIds(testIds);
				setIsTestStatusModalOpen(true);

				notifications.show({
					title: tCommon('status.success'),
					message:
						response.status === 'STARTED'
							? t('notifications.runStarted')
							: t('notifications.runCompleted'),
					color: 'green',
				});
			} catch (error) {
				notifications.show({
					title: tCommon('status.error'),
					message: getAxiosFriendlyError(error, t('notifications.runError')),
					color: 'red',
				});
			} finally {
				setRunningTestIds([]);
			}
		},
		[runAgentTests, t, tCommon]
	);

	const handleRunSelected = useCallback(
		(tests: AgentTest[]) => {
			if (tests.length === 0) {
				notifications.show({
					title: tCommon('status.error'),
					message: t('run.noSelection'),
					color: 'red',
				});
				return;
			}

			const uniqueAgentIds = Array.from(
				new Set(tests.map((test) => test.agentId).filter(Boolean))
			);

			if (uniqueAgentIds.length === 0) {
				setPendingRunTests(tests.map((test) => test.testId || test.id));
				setAgentSelectSource('table');
				setIsAgentSelectOpen(true);
				return;
			}

			if (uniqueAgentIds.length > 1) {
				notifications.show({
					title: tCommon('status.error'),
					message: t('run.mixedAgentError'),
					color: 'red',
				});
				return;
			}

			const selectedAgentId = uniqueAgentIds[0];
			if (!selectedAgentId) {
				notifications.show({
					title: tCommon('status.error'),
					message: t('run.missingAgentError'),
					color: 'red',
				});
				return;
			}

			runTests(
				tests.map((test) => test.testId || test.id),
				selectedAgentId
			);
		},
		[t, tCommon, runTests]
	);

	const toggleRowSelection = useCallback((testId: string, checked: boolean) => {
		setSelectedTestIds((current) => {
			if (checked) {
				return current.includes(testId) ? current : [...current, testId];
			}
			return current.filter((id) => id !== testId);
		});
	}, []);

	const toggleAllCurrentPage = useCallback(
		(tests: AgentTest[], checked: boolean) => {
			if (checked) {
				setSelectedTestIds((current) => {
					const next = new Set(current);
					tests.forEach((test) => next.add(test.id));
					return Array.from(next);
				});
				return;
			}

			setSelectedTestIds((current) =>
				current.filter((id) => !tests.some((test) => test.id === id))
			);
		},
		[]
	);

	const allCurrentPageSelected = useCallback(
		(tests: AgentTest[]) =>
			tests.length > 0 &&
			tests.every((test) => selectedTestIds.includes(test.id)),
		[selectedTestIds]
	);

	const someCurrentPageSelected = useCallback(
		(tests: AgentTest[]) =>
			!allCurrentPageSelected(tests) &&
			tests.some((test) => selectedTestIds.includes(test.id)),
		[allCurrentPageSelected, selectedTestIds]
	);

	const clearFilters = useCallback(() => {
		setSearch('');
		setAgentId(null);
		setPage(1);
		setSelectedTestIds([]);
	}, []);

	const openAgentSelectFromStudio = useCallback((testIds: string[]) => {
		setIsModalTransitioning(true);
		setPendingRunTests(testIds);
		setAgentSelectSource('studio');
		setIsModalOpen(false);
		setIsAgentSelectOpen(true);

		window.setTimeout(() => {
			setIsModalTransitioning(false);
		}, 180);
	}, []);

	const closeTestStatusModal = useCallback(() => {
		setIsTestStatusModalOpen(false);
		setTestStatusSuiteId(null);
		setTestStatusAgentId(null);
		setTestStatusRunTestIds([]);
	}, []);

	const openEditFromStatus = useCallback(
		async (testId: string) => {
			if (!testId || isModalTransitioning) {
				return;
			}

			setIsModalTransitioning(true);
			try {
				const test = await queryClient.fetchQuery({
					queryKey: ['agent-test', testId],
					queryFn: async () => {
						const api = agentTestsApi();
						return api.getAgentTestById(testId);
					},
				});

				openEditModal(test);
				closeTestStatusModal();
			} catch (error) {
				notifications.show({
					title: tCommon('status.error'),
					message: getAxiosFriendlyError(error, t('notifications.saveError')),
					color: 'red',
				});
			} finally {
				setIsModalTransitioning(false);
			}
		},
		[
			closeTestStatusModal,
			isModalTransitioning,
			openEditModal,
			queryClient,
			t,
			tCommon,
		]
	);

	const value: AgentTestsPageContextType = {
		page,
		setPage,
		limit,
		setLimit,
		search,
		setSearch,
		agentId,
		setAgentId,
		tests: [],
		testsTotal: 0,
		testsIsLoading: false,
		testsIsError: false,
		testsRefetch: () => {},
		isModalOpen,
		setIsModalOpen,
		editingTest,
		setEditingTest,
		editingTestLoading,
		editingTestLoadingId,
		isModalTransitioning,
		selectedTestIds,
		setSelectedTestIds,
		lastRunResult,
		setLastRunResult,
		selectedAgentForRun,
		setSelectedAgentForRun,
		isAgentSelectOpen,
		setIsAgentSelectOpen,
		agentSelectSource,
		setAgentSelectSource,
		pendingRunTests,
		setPendingRunTests,
		openAgentSelectFromStudio,
		isTestStatusModalOpen,
		setIsTestStatusModalOpen,
		testStatusSuiteId,
		setTestStatusSuiteId,
		testStatusAgentId,
		setTestStatusAgentId,
		testStatusData,
		testStatusRunTestIds,
		closeTestStatusModal,
		form,
		showSuccessExamples,
		setShowSuccessExamples,
		showFailureExamples,
		setShowFailureExamples,
		chatHistoryPreview,
		dynamicVariablePreview,
		createAgentTest,
		updateAgentTest,
		deleteAgentTest,
		runAgentTests,
		clearFormAndState,
		openCreateModal,
		openEditModal,
		openEditModalWithReload,
		openEditFromStatus,
		closeModal,
		addSuccessExample,
		addFailureExample,
		addDynamicVariable,
		addConversationTurn,
		removeConversationTurn,
		updateConversationTurnRole,
		updateConversationTurnMessage,
		handleSubmit,
		handleDelete,
		runTests,
		runningTestIds,
		handleRunSelected,
		toggleRowSelection,
		toggleAllCurrentPage,
		allCurrentPageSelected,
		someCurrentPageSelected,
		clearFilters,
	};

	return (
		<AgentTestsPageContext.Provider value={value}>
			{children}
		</AgentTestsPageContext.Provider>
	);
};

export const useAgentTestsPage = (): AgentTestsPageContextType => {
	const context = useContext(AgentTestsPageContext);
	if (!context) {
		throw new Error(
			'useAgentTestsPage must be used within AgentTestsPageProvider'
		);
	}
	return context;
};
