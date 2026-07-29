import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
	Anchor,
	Breadcrumbs,
	Button,
	Flex,
	Group,
	Select,
	TextInput,
} from '@mantine/core';
import {
	IconPlayerPause,
	IconPlayerPlay,
	IconPlus,
	IconSearch,
} from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import BaseTable from '~/components/BaseTable';
import PaginationControls from '~/components/PaginationControls';
import { DEMO_CAMPAIGNS } from '../mockData';
import DemoStatRow from '../components/DemoStatRow';
import { useDemoCampaignColumns } from './useDemoCampaignColumns';

const PAGE_SIZE = 10;

const DemoCampaignsListPage: React.FC = () => {
	const navigate = useNavigate();
	const columns = useDemoCampaignColumns();
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState<string | null>(null);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(PAGE_SIZE);

	const filtered = useMemo(() => {
		return DEMO_CAMPAIGNS.filter((campaign) => {
			const matchesSearch = campaign.name
				.toLowerCase()
				.includes(search.toLowerCase());
			const matchesStatus = !statusFilter || campaign.status === statusFilter;
			return matchesSearch && matchesStatus;
		});
	}, [search, statusFilter]);

	useEffect(() => {
		setPage(1);
	}, [search, statusFilter]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
	const paginated = useMemo(
		() => filtered.slice((page - 1) * pageSize, page * pageSize),
		[filtered, page, pageSize]
	);

	const stats = useMemo(() => {
		const active = DEMO_CAMPAIGNS.filter((c) => c.status === 'active').length;
		const pending = DEMO_CAMPAIGNS.filter((c) => c.status === 'pending').length;
		const paused = DEMO_CAMPAIGNS.filter((c) => c.status === 'paused').length;
		return [
			{ key: 'active', title: 'Campaigns Active', value: active },
			{ key: 'pending', title: 'Campaigns Pending', value: pending },
			{ key: 'paused', title: 'Campaigns Paused', value: paused },
		];
	}, []);

	return (
		<ContentContainer
			contentWidth='full'
			title={
				<Breadcrumbs>
					<Anchor href='/' size='sm'>
						Dashboard
					</Anchor>
					<Anchor component='span' size='sm' fw={600}>
						Campaign
					</Anchor>
				</Breadcrumbs>
			}
			description='Manage and evaluate call campaigns'
			titleRight={
				<Button
					color='green'
					leftSection={<IconPlus size={16} />}
					onClick={() => navigate('/evaluations-demo/new')}
				>
					New external campaign
				</Button>
			}
		>
			<Flex direction='column' gap='md'>
				<DemoStatRow stats={stats} />

				<Group gap='xs'>
					<Button variant='default' leftSection={<IconPlayerPause size={16} />}>
						Pause All Active
					</Button>
					<Button variant='default' leftSection={<IconPlayerPlay size={16} />}>
						Resume All Pending
					</Button>
					<Button variant='default' leftSection={<IconPlayerPlay size={16} />}>
						Resume All Paused
					</Button>
				</Group>

				<Flex gap='sm' wrap='wrap'>
					<TextInput
						placeholder='Search by name or description...'
						leftSection={<IconSearch size={16} />}
						value={search}
						onChange={(e) => setSearch(e.currentTarget.value)}
{/* inline-style-allow: */}
						style={{ flex: 1, minWidth: 220 }}
					/>
					<Select
						placeholder='Filter by status...'
						data={['active', 'pending', 'paused']}
						value={statusFilter}
						onChange={setStatusFilter}
						clearable
						w={200}
					/>
				</Flex>

				<BaseTable
					data={paginated}
					columns={columns}
					onRowClick={(campaign) => navigate(`/evaluations-demo/${campaign.id}`)}
					density='compact'
					filterMode='client'
					emptyMessage='No campaigns found'
				/>

				<PaginationControls
					currentPage={page}
					totalPages={totalPages}
					itemsPerPage={pageSize}
					totalItems={filtered.length}
					onPageChange={setPage}
					onItemsPerPageChange={(value) => {
						setPageSize(Number(value ?? PAGE_SIZE));
						setPage(1);
					}}
					itemLabel='campaigns'
				/>
			</Flex>
		</ContentContainer>
	);
};

export default DemoCampaignsListPage;
