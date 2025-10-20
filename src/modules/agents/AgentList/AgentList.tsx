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
import { SortingState } from '@tanstack/react-table';
import classes from './AgentList.module.css';
import type AgentListObject from '~/models/AgentListObject';
import AgentSimpleDetails from '../AgentSimpleDetails/AgentSimpleDetails';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import FilterContainer from '~/components/FilterContainer/FilterContainer';
import { useGetAllAgents, useDeleteAgent } from '~/queries/agentQueries';
import { useAgentStore } from '~/stores/agentStore';
import BaseTable, { type FilterMode } from '~/components/BaseTable/BaseTable';
import { useAgentColumns } from './useAgentColumns';
import { OutboundCallForm } from '~/components/OutboundCallForm';
import { modals } from '@mantine/modals';
import AgentQuickEdit from '../AgentQuickEdit';
import DuplicateAgentModal from './DuplicateAgentModal';

interface AgentFilters {
	name: string;
	type: 'all' | 'INBOUND' | 'OUTBOUND';
	sortBy: 'name' | 'createdAt' | 'updatedAt';
	sortOrder: 'ASC' | 'DESC';
}

const INITIAL_FILTERS: AgentFilters = {
	name: '',
	type: 'all',
	sortBy: 'createdAt',
	sortOrder: 'DESC',
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

	// Filter mode: 'client' or 'server'
	// - 'server': API handles filtering, sorting, and pagination
	// - 'client': Fetch all data, apply filters/sorting/pagination in browser
	const filterMode: FilterMode = 'server';

	// Debounce the name filter to reduce API calls (only for server-side)
	const [debouncedName] = useDebouncedValue(filters.name, 500);

	// Fetch all agents for client-side filtering, or paginated for server-side
	// - Server mode: API handles filtering, sorting, and pagination
	// - Client mode: Fetch all data, apply filters/sorting/pagination in browser
	const {
		data: agents,
		isLoading,
		isFetching,
		isError,
		error,
		refetch: reloadAgents,
	} = useGetAllAgents({
		page: filterMode === 'server' ? page : 1,
		limit: filterMode === 'server' ? pageSize : 1000, // Fetch all for client-side
		...(filterMode === 'server' && debouncedName
			? { name: debouncedName }
			: {}),
		...(filterMode === 'server' && filters.type !== 'all'
			? { agentType: filters.type }
			: {}),
		sortBy: filterMode === 'server' ? filters.sortBy : 'createdAt',
		sortOrder: filterMode === 'server' ? filters.sortOrder : 'DESC',
	});

	const deleteMutation = useDeleteAgent();

	// Client-side filtering and sorting
	const filteredAndSortedAgents = React.useMemo(() => {
		if (filterMode === 'server' || !agents?.data) {
			return agents?.data || [];
		}

		let filtered = [...agents.data];

		// Apply name filter
		if (filters.name) {
			const searchLower = filters.name.toLowerCase();
			filtered = filtered.filter((agent) =>
				agent.name.toLowerCase().includes(searchLower)
			);
		}

		// Apply type filter
		if (filters.type !== 'all') {
			filtered = filtered.filter((agent) => agent.type === filters.type);
		}

		// Apply sorting
		filtered.sort((a, b) => {
			let aValue: any;
			let bValue: any;

			switch (filters.sortBy) {
				case 'name':
					aValue = a.name.toLowerCase();
					bValue = b.name.toLowerCase();
					break;
				case 'createdAt':
					aValue = new Date(a.createdAt).getTime();
					bValue = new Date(b.createdAt).getTime();
					break;
				case 'updatedAt':
					aValue = new Date(a.updatedAt).getTime();
					bValue = new Date(b.updatedAt).getTime();
					break;
				default:
					return 0;
			}

			if (filters.sortOrder === 'ASC') {
				return aValue > bValue ? 1 : -1;
			}
			return aValue < bValue ? 1 : -1;
		});

		return filtered;
	}, [filterMode, agents?.data, filters]);

	// Client-side pagination
	const paginatedAgents = React.useMemo(() => {
		if (filterMode === 'server') {
			return filteredAndSortedAgents;
		}

		const startIndex = (page - 1) * pageSize;
		const endIndex = startIndex + pageSize;
		return filteredAndSortedAgents.slice(startIndex, endIndex);
	}, [filterMode, filteredAndSortedAgents, page, pageSize]);

	// Calculate pagination info for client-side mode
	const totalItems =
		filterMode === 'server'
			? agents?.total || 0
			: filteredAndSortedAgents.length;

	const totalPages =
		filterMode === 'server'
			? agents?.totalPages || 1
			: Math.ceil(filteredAndSortedAgents.length / pageSize);

	// Reset to first page when filters or page size change
	React.useEffect(() => {
		setPage(1);
		setSelectedAgent(null);
	}, [
		filters.name,
		filters.type,
		filters.sortBy,
		filters.sortOrder,
		pageSize,
		filterMode,
		setSelectedAgent,
	]);

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

	const handleSortingChange = (sorting: SortingState) => {
		console.log('Sorting changed:', sorting); // TODO: Remove
		const sort = sorting[0];
		const newFilters = {
			...filters,
			sortBy: sort
				? (sort.id as 'name' | 'createdAt' | 'updatedAt')
				: 'createdAt',
			sortOrder: sort
				? sort.desc
					? ('DESC' as const)
					: ('ASC' as const)
				: ('DESC' as const),
		};
		setFilters(newFilters);
		console.log('Filter configuration:', newFilters); // TODO: Remove
	};

	const handleClearFilters = () => {
		setFilters(INITIAL_FILTERS);
	};

	const hasActiveFilters =
		filters.name !== INITIAL_FILTERS.name ||
		filters.type !== INITIAL_FILTERS.type ||
		filters.sortBy !== INITIAL_FILTERS.sortBy ||
		filters.sortOrder !== INITIAL_FILTERS.sortOrder;

	const hasAgents = totalItems > 0;
	const hasMultiplePages = totalPages > 1;

	function handleFilterChange(key: string, value: string): void {
		setFilters((prev) => ({
			...prev,
			[key]: value,
		}));
	}

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
				<FilterContainer>
					<Group gap='md' wrap='wrap'>
						{/* Search */}
						<TextInput
							placeholder='Search agents...'
							leftSection={<IconSearch size={16} />}
							value={filters.name}
							onChange={(e) =>
								handleFilterChange('name', e.currentTarget.value)
							}
							className={classes.searchInput}
						/>

						{/* Agent Type Filter */}
						<div className={classes.filterGroup}>
							<Chip.Group
								value={filters.type}
								onChange={(value) => {
									if (typeof value === 'string') {
										handleFilterChange('type', value);
									}
								}}
							>
								<Group gap='xs' wrap='nowrap'>
									<Chip value='all' variant='light' size='sm'>
										All
									</Chip>
									<Chip value='INBOUND' variant='light' color='teal' size='sm'>
										Inbound
									</Chip>
									<Chip value='OUTBOUND' variant='light' color='blue' size='sm'>
										Outbound
									</Chip>
								</Group>
							</Chip.Group>
						</div>

						{/* Clear Filters */}
						<div className={classes.filterGroup}>
							<ActionIcon
								variant='light'
								size='lg'
								color='gray'
								onClick={handleClearFilters}
								disabled={!hasActiveFilters}
								title='Clear filters'
								className={classes.clearButton}
							>
								<IconX size={18} />
							</ActionIcon>
						</div>
					</Group>
				</FilterContainer>

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
					<>
						<BaseTable<AgentListObject>
							data={paginatedAgents}
							columns={columns}
							isLoading={deleteMutation.isPending || isFetching}
							selectedKey={`${selectedAgent?.id}`}
							onRowClick={handleAgentClick}
							filterMode={filterMode}
							density={'default'}
							initialSort={[
								{ id: filters.sortBy, desc: filters.sortOrder === 'DESC' },
							]}
							onSortingChange={handleSortingChange}
						/>
					</>
				)}

				{/* Pagination */}
				{hasAgents && hasMultiplePages && (
					<Center mt='md'>
						<Group gap='md' align='center'>
							{/* Results Info */}
							<Group justify='space-between' align='center' mb='xs'>
								<Text size='sm' c='dimmed'>
									Showing {agents?.data?.length || 0} of {totalItems} agents
									{hasActiveFilters && ' (filtered)'}
								</Text>
							</Group>
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
								w={80}
								allowDeselect={false}
							/>
							<Pagination
								total={totalPages}
								value={page}
								onChange={setPage}
								withEdges
								size='sm'
							/>
						</Group>
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
