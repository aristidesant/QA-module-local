import React from 'react';
import { IconUsersGroup, IconSearch, IconX } from '@tabler/icons-react';
import AgentCreate from '../AgentCreate';
import {
	Stack,
	Text,
	Avatar,
	Paper,
	Transition,
	Button,
	Pagination,
	Center,
	TextInput,
	Loader,
	Group,
	ActionIcon,
	Chip,
	Modal,
	Select,
} from '@mantine/core';
import {
	useDisclosure,
	useMediaQuery,
	useDebouncedValue,
} from '@mantine/hooks';
import classes from './AgentList.module.css';
import type AgentListObject from '~/models/AgentListObject';
import AgentSimpleDetails from '../AgentSimpleDetails/AgentSimpleDetails';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { useGetAllAgents, useDeleteAgent } from '~/queries/agentQueries';
import { useAgentStore } from '~/stores/agentStore';
import BaseTable from '~/components/BaseTable/BaseTable';
import { useAgentColumns } from './useAgentColumns';
import { OutboundCallForm } from '~/components/OutboundCallForm';
import { modals } from '@mantine/modals';
import AgentQuickEdit from '../AgentQuickEdit';
import DuplicateAgentModal from './DuplicateAgentModal';

interface AgentFilters {
	name: string;
	type: 'all' | 'INBOUND' | 'OUTBOUND';
}

const INITIAL_FILTERS: AgentFilters = {
	name: '',
	type: 'all',
};

const AgentList: React.FC = () => {
	const [opened, { open, close }] = useDisclosure(false);
	const { setSelectedAgent, selectedAgent } = useAgentStore();
	const isMobile = useMediaQuery('(max-width: 1200px)');

	// Test call modal state
	const [testCallModalOpened, setTestCallModalOpened] = React.useState(false);
	const [selectedAgentForCall, setSelectedAgentForCall] =
		React.useState<AgentListObject | null>(null);

	// Duplicate modal state
	const [duplicateModalOpened, setDuplicateModalOpened] = React.useState(false);
	const [selectedAgentForDuplicate, setSelectedAgentForDuplicate] =
		React.useState<AgentListObject | null>(null);

	const [page, setPage] = React.useState(1);
	const [pageSize, setPageSize] = React.useState(10);
	const [filters, setFilters] = React.useState<AgentFilters>(INITIAL_FILTERS);
	// Debounce the name filter to reduce API calls

	// Debounce the name filter to reduce API calls
	const [debouncedName] = useDebouncedValue(filters.name, 500);

	const {
		data: agents,
		isLoading,
		isFetching,
		isError,
		error,
		refetch: reloadAgents,
	} = useGetAllAgents({
		page,
		limit: pageSize,
		...(debouncedName ? { name: debouncedName } : {}),
		...(filters.type !== 'all' ? { agentType: filters.type } : {}),
	});

	const deleteMutation = useDeleteAgent();

	// Reset to first page when filters or page size change
	React.useEffect(() => {
		setPage(1);
		setSelectedAgent(null);
	}, [debouncedName, filters.type, pageSize, setSelectedAgent]);

	// Clear selection when changing pages
	React.useEffect(() => {
		setSelectedAgent(null);
	}, [page, setSelectedAgent]);

	const handleAgentClick = (agent: AgentListObject) => {
		setSelectedAgent(agent);
	};

	const handleEdit = (agent: AgentListObject) => {
		modals.open({
			title: 'Edit Agent',
			modalId: 'edit-agent-modal',
			size: 'lg',
			children: (
				<AgentQuickEdit
					onUpdate={() => {
						modals.close('edit-agent-modal');
						reloadAgents();
						setSelectedAgent(null);
					}}
					agent={agent}
				/>
			),
		});
	};

	const handleTestCall = (agent: AgentListObject) => {
		setSelectedAgentForCall(agent);
		setTestCallModalOpened(true);
	};

	const handleTestCallSuccess = () => {
		setTestCallModalOpened(false);
		setSelectedAgentForCall(null);
	};

	const handleTestCallClose = () => {
		setTestCallModalOpened(false);
		setSelectedAgentForCall(null);
	};

	const handleDuplicate = (agent: AgentListObject) => {
		setSelectedAgentForDuplicate(agent);
		setDuplicateModalOpened(true);
	};

	const handleDuplicateSuccess = () => {
		setDuplicateModalOpened(false);
		setSelectedAgentForDuplicate(null);
		// The mutation will invalidate queries, so the list will refresh
	};

	const handleDuplicateClose = () => {
		setDuplicateModalOpened(false);
		setSelectedAgentForDuplicate(null);
	};

	const handleDelete = (agent: AgentListObject) => {
		modals.openConfirmModal({
			title: 'Delete Agent',
			children: `Are you sure you want to delete "${agent.name}"? This action cannot be undone.`,
			labels: { confirm: 'Delete', cancel: 'Cancel' },
			confirmProps: { color: 'red' },
			onConfirm: () => deleteMutation.mutate(agent.id),
		});
	};

	const columns = useAgentColumns({
		onEdit: handleEdit,
		onTestCall: handleTestCall,
		onDuplicate: handleDuplicate,
		onDelete: handleDelete,
		isDeleting: deleteMutation.isPending,
	});

	const handleFilterChange = (key: keyof AgentFilters, value: string) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
	};

	const handleClearFilters = () => {
		setFilters(INITIAL_FILTERS);
	};

	const hasActiveFilters =
		debouncedName !== INITIAL_FILTERS.name ||
		filters.type !== INITIAL_FILTERS.type;

	const hasAgents = (agents?.total || 0) > 0;
	const hasMultiplePages = (agents?.totalPages || 1) > 1;

	return (
		<ContentContainer
			title='Agent Directory'
			description='Manage and monitor all your AI agents in one place.'
			onBackClick={() => setSelectedAgent(null)}
			rightSection={
				<Transition
					mounted={!!selectedAgent}
					transition={isMobile ? 'slide-up' : 'slide-left'}
					duration={200}
					timingFunction='cubic-bezier(0.4, 0, 0.2, 1)'
				>
					{(styles) => (
						<div style={styles}>
							{selectedAgent && <AgentSimpleDetails agent={selectedAgent} />}
						</div>
					)}
				</Transition>
			}
			titleRight={
				<Button onClick={open} size='sm'>
					New agent
				</Button>
			}
		>
			<Stack gap='lg'>
				<AgentCreate opened={opened} onClose={close} />

				{/* Filters */}
				<Paper className={classes.filtersWrapper}>
					<Group gap='md' wrap='nowrap' className={classes.filtersContainer}>
						<TextInput
							placeholder='Search agents...'
							leftSection={<IconSearch size={16} />}
							value={filters.name}
							onChange={(e) =>
								handleFilterChange('name', e.currentTarget.value)
							}
							className={classes.searchInput}
						/>
						<Chip.Group
							value={filters.type}
							onChange={(value) => {
								if (typeof value === 'string') {
									handleFilterChange('type', value);
								}
							}}
						>
							<Group gap='xs' wrap='nowrap' className={classes.typeFilters}>
								<Chip
									value='all'
									variant='light'
									size='sm'
									className={classes.typeChip}
								>
									All
								</Chip>
								<Chip
									value='INBOUND'
									variant='light'
									color='teal'
									size='sm'
									className={classes.typeChip}
								>
									Inbound
								</Chip>
								<Chip
									value='OUTBOUND'
									variant='light'
									color='blue'
									size='sm'
									className={classes.typeChip}
								>
									Outbound
								</Chip>
							</Group>
						</Chip.Group>
						<Select
							placeholder='Page size'
							data={['10', '20', '50', '100']}
							value={pageSize.toString()}
							onChange={(value) => {
								if (value) {
									setPageSize(parseInt(value));
								}
							}}
							size='sm'
							w={120}
							allowDeselect={false}
						/>
						<ActionIcon
							variant='subtle'
							size='lg'
							onClick={handleClearFilters}
							className={classes.clearButton}
							style={{ opacity: hasActiveFilters ? 1 : 0.3 }}
							disabled={!hasActiveFilters}
							title='Clear filters'
						>
							<IconX size={18} />
						</ActionIcon>
					</Group>
				</Paper>

				{/* Loading State */}
				{isLoading && (
					<Center p='xl'>
						<Loader size='md' />
					</Center>
				)}

				{/* Error State */}
				{isError && (
					<Paper className={classes.emptyState}>
						<Stack align='center' gap='xs'>
							<Text size='lg' fw={600} c='dimmed'>
								Failed to load agents
							</Text>
							<Text size='sm' c='red'>
								{(error as any)?.message || 'Please try again.'}
							</Text>
						</Stack>
					</Paper>
				)}

				{/* Agents Table */}
				{!isLoading && !isError && hasAgents && (
					<BaseTable<AgentListObject>
						data={agents?.data || []}
						columns={columns}
						isLoading={deleteMutation.isPending || isFetching}
						selectedKey={`${selectedAgent?.id}`}
						onRowClick={handleAgentClick}
						density={'default'}
					/>
				)}

				{/* Pagination */}
				{hasAgents && hasMultiplePages && (
					<Center mt='md'>
						<Pagination
							total={agents?.totalPages || 1}
							value={page}
							onChange={setPage}
							withEdges
							size='sm'
						/>
					</Center>
				)}

				{/* Empty State */}
				{!isLoading && !isError && !hasAgents && (
					<Paper className={classes.emptyState}>
						<Stack align='center' gap='md'>
							<div className={classes.avatarContainer}>
								<Avatar size={80} radius='xl' color='blue'>
									<IconUsersGroup size={40} stroke={1.5} />
								</Avatar>
							</div>
							<Text size='lg' fw={600} c='dimmed'>
								{hasActiveFilters ? 'No agents found' : 'No Agents Yet'}
							</Text>
							<Text size='sm' c='dimmed' ta='center' maw={400}>
								{hasActiveFilters
									? "Try adjusting your filters to find what you're looking for"
									: 'Create your first agent to start building amazing conversations and automations'}
							</Text>
						</Stack>
					</Paper>
				)}
			</Stack>

			{/* Test Call Modal */}
			<Modal
				opened={testCallModalOpened}
				onClose={handleTestCallClose}
				title='Test Agent Call'
				size='md'
				centered
			>
				{selectedAgentForCall && (
					<OutboundCallForm
						agent={selectedAgentForCall}
						onSuccess={handleTestCallSuccess}
						onClose={handleTestCallClose}
					/>
				)}
			</Modal>

			{/* Duplicate Agent Modal */}
			<DuplicateAgentModal
				opened={duplicateModalOpened}
				onClose={handleDuplicateClose}
				onSuccess={handleDuplicateSuccess}
				originalName={selectedAgentForDuplicate?.name || ''}
				agentId={selectedAgentForDuplicate?.id || ''}
			/>
		</ContentContainer>
	);
};

export default AgentList;
