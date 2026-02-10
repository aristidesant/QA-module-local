import { Alert, Button, TextInput } from '@mantine/core';
import { IconFlask, IconInfoCircle } from '@tabler/icons-react';
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
	const {
		page,
		limit,
		setPage,
		setLimit,
		search,
		setSearch,
		openCreateModal,
		editingTestLoadingId,
		runningTestIds,
		createAgentTest,
		updateAgentTest,
		deleteAgentTest,
		runAgentTests,
	} = useAgentTestsPage();

	const columns = useAgentTestsColumns({
		canUpdate,
		canDelete,
		canRun,
		agentOptions,
		editingTestLoadingId,
		runningTestIds,
	});

	const isAnyMutationPending =
		createAgentTest.isPending ||
		updateAgentTest.isPending ||
		deleteAgentTest.isPending ||
		runAgentTests.isPending;

	const totalPages = Math.max(1, Math.ceil(total / limit));

	return (
		<SectionCard padding='md' contentSpacing='xs'>
			<Alert
				variant='light'
				color='gray'
				icon={<IconInfoCircle size={16} />}
				radius='md'
			>
				{t('table.infoBanner')}
			</Alert>
			<TextInput
				placeholder={t('table.searchPlaceholder')}
				value={search}
				onChange={(event) => {
					setSearch(event.currentTarget.value);
					setPage(1);
				}}
				size='sm'
			/>
			{isError ? (
				<EmptyState
					icon={<IconFlask size={42} />}
					message={t('state.errorTitle')}
					description={t('state.errorDescription')}
					action={
						<Button
							size='xs'
							variant='light'
							onClick={onRefetch}
							loading={isLoading}
							disabled={isLoading}
						>
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
							<Button
								size='xs'
								onClick={openCreateModal}
								loading={isAnyMutationPending}
								disabled={isAnyMutationPending}
							>
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
