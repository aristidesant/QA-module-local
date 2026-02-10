import { Button } from '@mantine/core';
import { IconFlask } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import BaseTable from '~/components/BaseTable';
import EmptyState from '~/components/EmptyState';
import PaginationControls from '~/components/PaginationControls';
import SectionCard from '~/components/SectionCard/SectionCard';
import type { AgentTest } from '~/models/AgentTestModel';
import { useAgentTestsColumns } from '../../hooks/useAgentTestsColumns';
import { useAgentTestsPage } from '../../context/AgentTestsPageContext';

interface AgentTestsTableSectionProps {
	tests: AgentTest[];
	total: number;
	isLoading: boolean;
	isError: boolean;
	canCreate: boolean;
	canUpdate: boolean;
	canDelete: boolean;
	canRun: boolean;
	agentOptions: Array<{ value: string; label: string }>;
	onRefetch: () => void;
}

const AgentTestsTableSection = ({
	tests,
	total,
	isLoading,
	isError,
	canCreate,
	canUpdate,
	canDelete,
	canRun,
	agentOptions,
	onRefetch,
}: AgentTestsTableSectionProps) => {
	const { t } = useTranslation('agent-tests');
	const { page, limit, setPage, setLimit, selectedTestIds, openCreateModal } =
		useAgentTestsPage();

	const columns = useAgentTestsColumns({
		canUpdate,
		canDelete,
		canRun,
		agentOptions,
		tests,
	});

	const totalPages = Math.max(1, Math.ceil(total / limit));

	return (
		<SectionCard
			title={t('table.title')}
			description={t('table.description', {
				total,
				selected: selectedTestIds.length,
			})}
			padding='md'
		>
			{isError ? (
				<EmptyState
					icon={<IconFlask size={42} />}
					message={t('state.errorTitle')}
					description={t('state.errorDescription')}
					action={
						<Button size='xs' variant='light' onClick={onRefetch}>
							{t('actions.retry')}
						</Button>
					}
				/>
			) : tests.length === 0 && !isLoading ? (
				<EmptyState
					icon={<IconFlask size={42} />}
					message={t('state.emptyTitle')}
					description={t('state.emptyDescription')}
					action={
						canCreate ? (
							<Button size='xs' onClick={openCreateModal}>
								{t('actions.create')}
							</Button>
						) : undefined
					}
				/>
			) : (
				<>
					<BaseTable<AgentTest>
						data={tests}
						columns={columns}
						isLoading={isLoading}
						emptyMessage={t('state.emptyTitle')}
						density='compact'
					/>
					<PaginationControls
						currentPage={page}
						totalPages={totalPages}
						itemsPerPage={limit}
						totalItems={total}
						onPageChange={setPage}
						onItemsPerPageChange={(value) => {
							if (!value) return;
							setLimit(parseInt(value, 10));
							setPage(1);
						}}
						itemLabel={t('pagination.itemsLabel')}
						isLoading={isLoading}
						searchTerm=''
					/>
				</>
			)}
		</SectionCard>
	);
};

export default AgentTestsTableSection;
