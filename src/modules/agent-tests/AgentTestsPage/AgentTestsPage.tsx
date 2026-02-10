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
import AgentTestsFiltersCard from './components/AgentTestsFiltersCard';
import AgentTestsTableSection from './components/AgentTestsTableSection';
import AgentSelectModal from './components/AgentSelectModal';
import AgentTestStudioModal from './components/AgentTestStudioModal';

const AgentTestsPageContent = () => {
	const { t } = useTranslation('agent-tests');
	const { canAccessModule, canPerformAction } = usePermissions();
	const { page, limit, search, agentId } = useAgentTestsPage();

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
		agentId: agentId || undefined,
	});

	const agentOptions = useMemo(
		() =>
			(agentsQuery.data?.data ?? []).map((agent) => ({
				value: agent.id,
				label: agent.name,
			})),
		[agentsQuery.data?.data]
	);

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
						canRun={canRun}
						tests={testsQuery.data?.items ?? []}
						onRefetch={() => testsQuery.refetch()}
					/>
				}
			>
				<Stack gap='xs'>
					<AgentTestsFiltersCard
						agentOptions={agentOptions}
						isLoadingAgents={agentsQuery.isLoading}
					/>
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
