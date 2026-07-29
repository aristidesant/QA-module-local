import React, { useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
	Badge,
	Button,
	Checkbox,
	Group,
	Select,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { IconFileText } from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';
import EmptyState from '~/components/EmptyState';
import BaseTable from '~/components/BaseTable';
import type { BaseTableColumnDef } from '~/components/BaseTable';
import type { DemoResultCall } from '../../mockData';

const SCORE_THRESHOLDS = { good: 80, fair: 60 };

const scoreColor = (score: number | null) => {
	if (score === null) return 'gray';
	if (score >= SCORE_THRESHOLDS.good) return 'green';
	if (score >= SCORE_THRESHOLDS.fair) return 'yellow';
	return 'red';
};

interface DemoResultsPanelProps {
	campaignId: string;
	results: DemoResultCall[];
}

const DemoResultsPanel: React.FC<DemoResultsPanelProps> = ({
	campaignId,
	results,
}) => {
	const navigate = useNavigate();
	const columns = useMemo<BaseTableColumnDef<DemoResultCall>[]>(
		() => [
			{
				accessorKey: 'fileName',
				header: 'Filename',
				cell: ({ row }) => (
					<Text size='sm' fw={600}>
						{row.original.fileName}
					</Text>
				),
			},
			{
				accessorKey: 'date',
				header: 'Date',
				cell: ({ row }) => (
					<Text size='sm' c='dimmed'>
						{row.original.date}
					</Text>
				),
			},
			{
				accessorKey: 'score',
				header: 'Score',
				cell: ({ row }) => (
					<Badge color={scoreColor(row.original.score)} variant='light' size='sm'>
						{row.original.score === null ? 'N/A' : `${row.original.score}%`}
					</Badge>
				),
				size: 100,
			},
			{
				accessorKey: 'status',
				header: 'Status',
				cell: ({ row }) => (
					<Badge
						color={row.original.status === 'completed' ? 'green' : 'gray'}
						variant='light'
						size='sm'
					>
						{row.original.status === 'completed' ? 'Completed' : 'Pending'}
					</Badge>
				),
				size: 120,
			},
			{
				accessorKey: 'disputeRequested',
				header: 'Dispute Requested',
				cell: ({ row }) => (
					<Badge
						color={row.original.disputeRequested ? 'blue' : 'gray'}
						variant={row.original.disputeRequested ? 'filled' : 'light'}
						size='sm'
					>
						{row.original.disputeRequested ? 'Yes' : 'No'}
					</Badge>
				),
				size: 160,
			},
			{
				accessorKey: 'disputed',
				header: 'Disputed',
				cell: ({ row }) => (
					<Badge
						color={row.original.disputed ? 'red' : 'gray'}
						variant={row.original.disputed ? 'filled' : 'light'}
						size='sm'
					>
						{row.original.disputed ? 'Yes' : 'No'}
					</Badge>
				),
				size: 120,
			},
		],
		[]
	);

	const passedCount = results.filter((r) => r.passed).length;
	const failedCount = results.length - passedCount;
	const disputedCount = results.filter((r) => r.disputed).length;

	return (
		<Stack gap='md'>
			<SectionCard title='Filters'>
				<Stack gap='md'>
					<SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing='md'>
						<Select
							label='QA Form'
							placeholder='All forms'
							data={[]}
							disabled
						/>
						<Select
							label='QA Form Result'
							data={['All', 'Passed', 'Failed']}
							defaultValue='All'
							disabled
						/>
						<TextInput label='Date from' type='date' disabled />
						<TextInput label='Date to' type='date' disabled />
						<TextInput label='Score Min' placeholder='0' disabled />
						<TextInput label='Score Max' placeholder='100' disabled />
						<Select
							label='Dispute Requested'
							data={['All', 'Yes', 'No']}
							defaultValue='All'
							disabled
						/>
						<Checkbox label='Auto Failed' mt='xl' disabled />
					</SimpleGrid>

					<Group justify='flex-end'>
						<Button color='green' leftSection={<IconFileText size={16} />}>
							Generate Report
						</Button>
					</Group>
				</Stack>
			</SectionCard>

			<SectionCard>
				<Stack gap='md'>
					<Group justify='space-between' wrap='wrap'>
						<Text size='sm' c='dimmed'>
							Showing 1–{results.length} of {results.length} results
						</Text>
						<Group gap='md'>
							<Text size='sm' c='dimmed'>
								<Text component='span' fw={700} c='inherit'>
									Passed:
								</Text>{' '}
								{passedCount}
							</Text>
							<Text size='sm' c='dimmed'>
								<Text component='span' fw={700} c='inherit'>
									Failed:
								</Text>{' '}
								{failedCount}
							</Text>
							<Text size='sm' c='dimmed'>
								<Text component='span' fw={700} c='inherit'>
									Disputed:
								</Text>{' '}
								{disputedCount}
							</Text>
						</Group>
					</Group>

					{results.length === 0 ? (
						<EmptyState message='No results yet for this campaign.' />
					) : (
						<BaseTable
							data={results}
							columns={columns}
							getRowId={(r) => r.id}
							onRowClick={(r) =>
								navigate(`/role-preview/qa-campaigns/${campaignId}/result/${r.id}`)
							}
							density='compact'
							filterMode='client'
						/>
					)}
				</Stack>
			</SectionCard>
		</Stack>
	);
};

export default DemoResultsPanel;
