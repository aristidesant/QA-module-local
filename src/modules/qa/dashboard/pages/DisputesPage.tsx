import React, { useState } from 'react';
import {
	Stack,
	Title,
	Text,
	SimpleGrid,
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
	status: 'pending' | 'approved' | 'rejected';
	createdDate: string;
	supervisorName: string;
	campaignName: string;
}

const DisputesPage: React.FC = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const [typeFilter, setTypeFilter] = useState<string | null>(null);
	const [statusFilter, setStatusFilter] = useState<string | null>(null);
	const [supervisorFilter, setSupervisorFilter] = useState<string | null>(null);

	const allDisputes: Dispute[] = [
		{
			id: 101,
			agentName: 'Sarah Johnson',
			type: 'qa',
			status: 'pending',
			createdDate: 'Today',
			supervisorName: 'David Martinez',
			campaignName: 'Q3 Customer Service',
		},
		{
			id: 102,
			agentName: 'Mike Chen',
			type: 'sentiment',
			status: 'pending',
			createdDate: 'Yesterday',
			supervisorName: 'Lisa Wong',
			campaignName: 'Sales Training',
		},
		{
			id: 103,
			agentName: 'Emily Watson',
			type: 'compliance',
			status: 'approved',
			createdDate: '2 days ago',
			supervisorName: 'David Martinez',
			campaignName: 'Q3 Customer Service',
		},
		{
			id: 104,
			agentName: 'James Wilson',
			type: 'qa',
			status: 'rejected',
			createdDate: '3 days ago',
			supervisorName: 'James Wilson',
			campaignName: 'Sales Training',
		},
		{
			id: 105,
			agentName: 'Sarah Johnson',
			type: 'sentiment',
			status: 'pending',
			createdDate: '4 days ago',
			supervisorName: 'David Martinez',
			campaignName: 'Q3 Customer Service',
		},
	];

	const filteredDisputes = allDisputes.filter(dispute => {
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
		pending: filteredDisputes.filter(d => d.status === 'pending').length,
		approved: filteredDisputes.filter(d => d.status === 'approved').length,
		rejected: filteredDisputes.filter(d => d.status === 'rejected').length,
	};

	const statusColor = {
		pending: 'yellow',
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
					pending={stats.pending}
					approved={stats.approved}
					rejected={stats.rejected}
				/>

				<SectionCard
					title='Filters'
					description='Advanced dispute filtering'
				>
					<Stack gap='md'>
						<Group grow>
							<Input
								placeholder='Search by agent name or dispute ID...'
								leftSection={<IconSearch size={14} />}
								value={searchTerm}
								onChange={e => setSearchTerm(e.currentTarget.value)}
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
									{ value: 'pending', label: 'Pending' },
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
								key: 'id',
								title: 'Dispute ID',
								render: d => `#${d.id}`,
							},
							{
								key: 'agentName',
								title: 'Agent',
								render: d => d.agentName,
							},
							{
								key: 'type',
								title: 'Type',
								render: d => (
									<Badge size='sm' variant='light'>
										{typeLabel[d.type as keyof typeof typeLabel]}
									</Badge>
								),
							},
							{
								key: 'supervisorName',
								title: 'Supervisor',
								render: d => d.supervisorName,
							},
							{
								key: 'campaign',
								title: 'Campaign',
								render: d => d.campaignName,
							},
							{
								key: 'status',
								title: 'Status',
								render: d => (
									<Badge
										color={
											statusColor[
												d.status as keyof typeof statusColor
											]
										}
										variant='dot'
									>
										{d.status}
									</Badge>
								),
							},
							{
								key: 'date',
								title: 'Created',
								render: d => d.createdDate,
							},
						]}
						data={filteredDisputes}
						onRowClick={(dispute: Dispute) => {
							console.log('Viewing dispute:', dispute.id);
						}}
					/>
				</SectionCard>
			</Stack>
		</ContentContainer>
	);
};

export default DisputesPage;
