import { useMemo } from 'react';
import { Stack } from '@mantine/core';
import { IconFlask } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import usePermissions from '~/hooks/usePermissions';
import { useGetAllAgents } from '~/queries/agentQueries';
import { useAgentTests } from '~/queries/agentTestsQueries';
import {
	AgentTestsPageProvider,
	useAgentTestsPage,
} from './context/AgentTestsPageContext';
import AgentTestsHeaderActions from './components/AgentTestsHeaderActions';
import AgentTestsTableSection from './components/AgentTestsTableSection';
import AgentSelectModal from './components/AgentSelectModal';
import AgentTestStudioModal from './components/AgentTestStudioModal';
import { TestStatusModal } from './components/TestStatusModal';

const AgentTestsPageContent = () => {
	const { t } = useTranslation('agent-tests');
	const { canAccessModule, canPerformAction } = usePermissions();
	const { page, limit, search } = useAgentTestsPage();

	// Get context values for test status modal
	const {
		isTestStatusModalOpen,
		closeTestStatusModal,
		testStatusJobId,
		testStatusData,
		testStatusRunTestIds,
		testStatusAgentId,
		runAgentTests,
		runTests,
	} = useAgentTestsPage();

	const canRead = canAccessModule(ModuleEnum.CAMPAIGNS);
	const canCreate = canPerformAction(
		ModuleEnum.CAMPAIGNS,
		PermissionEnum.CREATE
	);
	const canUpdate = canPerformAction(
		ModuleEnum.CAMPAIGNS,
		PermissionEnum.UPDATE
	);
	const canDelete = canPerformAction(
		ModuleEnum.CAMPAIGNS,
		PermissionEnum.DELETE
	);
	const canRun = canPerformAction(ModuleEnum.CAMPAIGNS, PermissionEnum.UPDATE);

	const agentsQuery = useGetAllAgents({
		page: 1,
		limit: 200,
		sortBy: 'name',
		sortOrder: 'ASC',
	});

	const testsQuery = useAgentTests({
		page,
		limit,
		search: search || undefined,
	});

	const agentOptions = useMemo(
		() =>
			(agentsQuery.data?.data ?? []).map((agent) => ({
				value: agent.id,
				label: agent.name,
			})),
		[agentsQuery.data?.data]
	);

	// Get test name for modal title - from first test in the run
	const testName = useMemo(() => {
		if (testStatusRunTestIds.length === 0) return '';
		const firstTest = testsQuery.data?.items.find(
			(t) => t.id === testStatusRunTestIds[0]
		);
		if (!firstTest) return testStatusRunTestIds[0];

		// Return only the test name, without the prompt
		return firstTest.name;
	}, [testStatusRunTestIds, testsQuery.data?.items]);

	const handleRetryFailed = () => {
		if (!testStatusAgentId || !testStatusData?.results) return;

		const failedTestIds = testStatusData.results
			.filter((r) => r.status === 'FAILED')
			.map((r) => r.testId);

		if (failedTestIds.length > 0) {
			runTests(failedTestIds, testStatusAgentId);
		}
	};

	const handleRetryAll = () => {
		if (!testStatusAgentId) return;
		runTests(testStatusRunTestIds, testStatusAgentId);
	};

	if (!canRead) {
		return null;
	}

	return (
		<>
			<ContentContainer
				title={t('page.title')}
				description={t('page.description')}
				titleIcon={<IconFlask size={20} />}
				titleRight={
					<AgentTestsHeaderActions
						canCreate={canCreate}
						onRefetch={() => testsQuery.refetch()}
					/>
				}
			>
				<Stack gap='xs'>
					<AgentTestsTableSection
						tests={testsQuery.data?.items ?? []}
						total={testsQuery.data?.total ?? 0}
						isLoading={testsQuery.isLoading}
						isError={testsQuery.isError}
						canCreate={canCreate}
						canUpdate={canUpdate}
						canDelete={canDelete}
						canRun={canRun}
						agentOptions={agentOptions}
						onRefetch={() => testsQuery.refetch()}
					/>
				</Stack>
			</ContentContainer>
			<AgentSelectModal
				agentOptions={agentOptions}
				isLoadingAgents={agentsQuery.isLoading}
			/>
			<AgentTestStudioModal />
			<TestStatusModal
				isOpen={isTestStatusModalOpen}
				onClose={closeTestStatusModal}
				testStatusData={testStatusData}
				testList={testsQuery.data?.items ?? []}
				isLoading={testStatusJobId !== null && testStatusData === null}
				testName={testName}
				onRetryFailed={handleRetryFailed}
				onRetryAll={handleRetryAll}
				isRetrying={runAgentTests.isPending}
			/>
		</>
	);
};

const AgentTestsPage = () => {
	return (
		<AgentTestsPageProvider>
			<AgentTestsPageContent />
		</AgentTestsPageProvider>
	);
};

export default AgentTestsPage;
