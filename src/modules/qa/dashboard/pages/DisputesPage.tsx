import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
	Stack,
	Title,
	Text,
	Select,
	Input,
	Group,
	Button,
	ActionIcon,
	Badge,
} from '@mantine/core';
import { IconSearch, IconFilter } from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import BaseTable from '~/components/BaseTable/BaseTable';
import { DisputesStats } from '../components';

interface Dispute {
	id: number;
	agentName: string;
	type: 'qa' | 'sentiment' | 'compliance';
	status: 'open' | 'approved' | 'rejected';
	createdDate: string;
	supervisorName: string;
	campaignName: string;
}

const DisputesPage: React.FC = () => {
	const navigate = useNavigate();
	const [searchTerm, setSearchTerm] = useState('');
	const [typeFilter, setTypeFilter] = useState<string | null>(null);
	const [statusFilter, setStatusFilter] = useState<string | null>(null);
	const [supervisorFilter, setSupervisorFilter] = useState<string | null>(null);

	const allDisputes: Dispute[] = [
		// Open disputes (40%)
		{
			id: 101,
			agentName: 'Sarah Johnson',
			type: 'qa',
			status: 'open',
			createdDate: 'Today',
			supervisorName: 'David Martinez',
			campaignName: 'Q3 Customer Service',
		},
		{
			id: 102,
			agentName: 'Mike Chen',
			type: 'sentiment',
			status: 'open',
			createdDate: 'Yesterday',
			supervisorName: 'Lisa Wong',
			campaignName: 'Sales Training',
		},
		{
			id: 103,
			agentName: 'Emily Watson',
			type: 'compliance',
			status: 'open',
			createdDate: '2 days ago',
			supervisorName: 'David Martinez',
			campaignName: 'Q3 Customer Service',
		},
		{
			id: 104,
			agentName: 'James Wilson',
			type: 'qa',
			status: 'open',
			createdDate: '3 days ago',
			supervisorName: 'Robert Khan',
			campaignName: 'Q4 Compliance',
		},
		{
			id: 105,
			agentName: 'Sarah Johnson',
			type: 'sentiment',
			status: 'open',
			createdDate: '4 days ago',
			supervisorName: 'David Martinez',
			campaignName: 'Tech Support',
		},
		{
			id: 106,
			agentName: 'Jennifer Lee',
			type: 'compliance',
			status: 'open',
			createdDate: '5 days ago',
			supervisorName: 'Lisa Wong',
			campaignName: 'Q4 Compliance',
		},
		{
			id: 107,
			agentName: 'Marcus Rodriguez',
			type: 'qa',
			status: 'open',
			createdDate: '6 days ago',
			supervisorName: 'Robert Khan',
			campaignName: 'Tech Support',
		},
		{
			id: 108,
			agentName: 'Angela Thompson',
			type: 'sentiment',
			status: 'open',
			createdDate: '1 week ago',
			supervisorName: 'David Martinez',
			campaignName: 'Sales Training',
		},
		{
			id: 109,
			agentName: 'David Park',
			type: 'qa',
			status: 'open',
			createdDate: '8 days ago',
			supervisorName: 'Lisa Wong',
			campaignName: 'Q3 Customer Service',
		},
		{
			id: 110,
			agentName: 'Michelle Brown',
			type: 'compliance',
			status: 'open',
			createdDate: '9 days ago',
			supervisorName: 'Robert Khan',
			campaignName: 'Q4 Compliance',
		},
		// Approved disputes (35%)
		{
			id: 111,
			agentName: 'Lisa Chen',
			type: 'qa',
			status: 'approved',
			createdDate: '10 days ago',
			supervisorName: 'David Martinez',
			campaignName: 'Sales Training',
		},
		{
			id: 112,
			agentName: 'Thomas Anderson',
			type: 'sentiment',
			status: 'approved',
			createdDate: '11 days ago',
			supervisorName: 'Lisa Wong',
			campaignName: 'Tech Support',
		},
		{
			id: 113,
			agentName: 'Kevin Hayes',
			type: 'compliance',
			status: 'approved',
			createdDate: '12 days ago',
			supervisorName: 'Robert Khan',
			campaignName: 'Q3 Customer Service',
		},
		{
			id: 114,
			agentName: 'Jessica Turner',
			type: 'qa',
			status: 'approved',
			createdDate: '13 days ago',
			supervisorName: 'David Martinez',
			campaignName: 'Q4 Compliance',
		},
		{
			id: 115,
			agentName: 'Amanda White',
			type: 'sentiment',
			status: 'approved',
			createdDate: '14 days ago',
			supervisorName: 'Lisa Wong',
			campaignName: 'Sales Training',
		},
		{
			id: 116,
			agentName: 'Brandon Scott',
			type: 'compliance',
			status: 'approved',
			createdDate: '15 days ago',
			supervisorName: 'Robert Khan',
			campaignName: 'Tech Support',
		},
		{
			id: 117,
			agentName: 'Rachel Greene',
			type: 'qa',
			status: 'approved',
			createdDate: '16 days ago',
			supervisorName: 'David Martinez',
			campaignName: 'Q3 Customer Service',
		},
		{
			id: 118,
			agentName: 'Steven Murphy',
			type: 'sentiment',
			status: 'approved',
			createdDate: '17 days ago',
			supervisorName: 'Lisa Wong',
			campaignName: 'Q4 Compliance',
		},
		{
			id: 119,
			agentName: 'Patricia Allen',
			type: 'compliance',
			status: 'approved',
			createdDate: '18 days ago',
			supervisorName: 'Robert Khan',
			campaignName: 'Sales Training',
		},
		// Rejected disputes (25%)
		{
			id: 120,
			agentName: 'Christopher Davis',
			type: 'qa',
			status: 'rejected',
			createdDate: '19 days ago',
			supervisorName: 'David Martinez',
			campaignName: 'Tech Support',
		},
		{
			id: 121,
			agentName: 'Nicole Taylor',
			type: 'sentiment',
			status: 'rejected',
			createdDate: '20 days ago',
			supervisorName: 'Lisa Wong',
			campaignName: 'Q3 Customer Service',
		},
		{
			id: 122,
			agentName: 'Daniel Jackson',
			type: 'compliance',
			status: 'rejected',
			createdDate: '21 days ago',
			supervisorName: 'Robert Khan',
			campaignName: 'Q4 Compliance',
		},
		{
			id: 123,
			agentName: 'Susan Clark',
			type: 'qa',
			status: 'rejected',
			createdDate: '22 days ago',
			supervisorName: 'David Martinez',
			campaignName: 'Sales Training',
		},
		{
			id: 124,
			agentName: 'Gregory Martin',
			type: 'sentiment',
			status: 'rejected',
			createdDate: '23 days ago',
			supervisorName: 'Lisa Wong',
			campaignName: 'Tech Support',
		},
		{
			id: 125,
			agentName: 'Linda Lewis',
			type: 'compliance',
			status: 'rejected',
			createdDate: '24 days ago',
			supervisorName: 'Robert Khan',
			campaignName: 'Q3 Customer Service',
		},
	];

	const filteredDisputes = allDisputes.filter((dispute) => {
		const matchesSearch =
			dispute.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			dispute.id.toString().includes(searchTerm);

		const matchesType = !typeFilter || dispute.type === typeFilter;
		const matchesStatus = !statusFilter || dispute.status === statusFilter;
		const matchesSupervisor =
			!supervisorFilter || dispute.supervisorName === supervisorFilter;

		return matchesSearch && matchesType && matchesStatus && matchesSupervisor;
	});

	const stats = {
		open: filteredDisputes.filter((d) => d.status === 'open').length,
		approved: filteredDisputes.filter((d) => d.status === 'approved').length,
		rejected: filteredDisputes.filter((d) => d.status === 'rejected').length,
	};

	const statusColor = {
		open: 'yellow',
		approved: 'green',
		rejected: 'red',
	};

	const typeLabel = {
		qa: 'QA Score',
		sentiment: 'Sentiment',
		compliance: 'Compliance',
	};

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<div>
					<Title order={1}>Disputes</Title>
					<Text c='dimmed' mt='xs'>
						Manage and review evaluation disputes
					</Text>
				</div>

				<DisputesStats
					open={stats.open}
					approved={stats.approved}
					rejected={stats.rejected}
				/>

				<SectionCard title='Filters' description='Advanced dispute filtering'>
					<Stack gap='md'>
						<Group grow>
							<Input
								placeholder='Search by agent name or dispute ID...'
								leftSection={<IconSearch size={14} />}
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.currentTarget.value)}
							/>
							<ActionIcon color='blue' size='lg' radius='md'>
								<IconFilter size={18} />
							</ActionIcon>
						</Group>

						<Group grow>
							<Select
								label='Type'
								placeholder='All types'
								data={[
									{ value: 'qa', label: 'QA Score' },
									{ value: 'sentiment', label: 'Sentiment' },
									{ value: 'compliance', label: 'Compliance' },
								]}
								value={typeFilter}
								onChange={setTypeFilter}
								clearable
							/>
							<Select
								label='Status'
								placeholder='All statuses'
								data={[
									{ value: 'open', label: 'Open' },
									{ value: 'approved', label: 'Approved' },
									{ value: 'rejected', label: 'Rejected' },
								]}
								value={statusFilter}
								onChange={setStatusFilter}
								clearable
							/>
							<Select
								label='Supervisor'
								placeholder='All supervisors'
								data={[
									{
										value: 'David Martinez',
										label: 'David Martinez',
									},
									{ value: 'Lisa Wong', label: 'Lisa Wong' },
									{
										value: 'James Wilson',
										label: 'James Wilson',
									},
								]}
								value={supervisorFilter}
								onChange={setSupervisorFilter}
								clearable
							/>
						</Group>

						<Group justify='flex-end'>
							<Button
								variant='default'
								onClick={() => {
									setSearchTerm('');
									setTypeFilter(null);
									setStatusFilter(null);
									setSupervisorFilter(null);
								}}
							>
								Reset Filters
							</Button>
						</Group>
					</Stack>
				</SectionCard>

				<SectionCard
					title='Disputes List'
					description={`Showing ${filteredDisputes.length} dispute${filteredDisputes.length !== 1 ? 's' : ''}`}
				>
					<BaseTable
						columns={[
							{
								id: 'id',
								header: 'Dispute ID',
								cell: ({ row }) => `#${row.original.id}`,
							},
							{
								id: 'agentName',
								header: 'Agent',
								cell: ({ row }) => row.original.agentName,
							},
							{
								id: 'type',
								header: 'Type',
								cell: ({ row }) => (
									<Badge size='sm' variant='light'>
										{typeLabel[row.original.type as keyof typeof typeLabel]}
									</Badge>
								),
							},
							{
								id: 'supervisorName',
								header: 'Supervisor',
								cell: ({ row }) => row.original.supervisorName,
							},
							{
								id: 'campaign',
								header: 'Campaign',
								cell: ({ row }) => row.original.campaignName,
							},
							{
								id: 'status',
								header: 'Status',
								cell: ({ row }) => (
									<Badge
										color={
											statusColor[
												row.original.status as keyof typeof statusColor
											]
										}
										variant='light'
									>
										{row.original.status}
									</Badge>
								),
							},
							{
								id: 'date',
								header: 'Created',
								cell: ({ row }) => row.original.createdDate,
							},
						]}
						data={filteredDisputes}
						onRowClick={(dispute: Dispute) => {
							navigate(`/qa/disputes/${dispute.id}`);
						}}
					/>
				</SectionCard>
			</Stack>
		</ContentContainer>
	);
};

export default DisputesPage;
