import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
	Anchor,
	Breadcrumbs,
	Flex,
	Progress,
	Select,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { IconDownload, IconSearch } from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import EmptyState from '~/components/EmptyState';
import BaseTable from '~/components/BaseTable';
import { getDemoCampaign, getDemoEvaluation } from '../mockData';
import DemoStatRow from '../components/DemoStatRow';
import { useDemoCallColumns } from './useDemoCallColumns';

const DemoEvaluationDetailPage: React.FC = () => {
	const { campaignId, evaluationId } = useParams<{
		campaignId: string;
		evaluationId: string;
	}>();
	const navigate = useNavigate();
	const columns = useDemoCallColumns();

	const campaign = getDemoCampaign(campaignId);
	const evaluation = getDemoEvaluation(campaignId, evaluationId);

	const [search, setSearch] = useState('');
	const [sort, setSort] = useState<string | null>('newest');
	const [scoreFilter, setScoreFilter] = useState<string | null>('all');

	const filteredCalls = useMemo(() => {
		if (!evaluation) return [];
		let calls = evaluation.calls.filter(
			(call) =>
				call.fileName.toLowerCase().includes(search.toLowerCase()) ||
				call.agentName.toLowerCase().includes(search.toLowerCase())
		);

		if (scoreFilter === 'pass') calls = calls.filter((c) => c.pass === 'pass');
		if (scoreFilter === 'fail') calls = calls.filter((c) => c.pass === 'fail');

		calls = [...calls].sort((a, b) => {
			const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
			return sort === 'oldest' ? diff : -diff;
		});

		return calls;
	}, [evaluation, search, sort, scoreFilter]);

	if (!campaign || !evaluation) {
		return (
			<ContentContainer
				contentWidth='full'
				title='Evaluation not found'
				showBackButton
				onBackClick={() => navigate('/role-preview/qa-campaigns')}
			>
				<EmptyState message='This evaluation does not exist in the demo data.' />
			</ContentContainer>
		);
	}

	const stats = [
		{
			key: 'totalCalls',
			title: 'Total Calls',
			value: evaluation.stats.totalCalls,
			subtitle: 'In this contact list',
		},
		{
			key: 'callsAnalyzed',
			title: 'Calls Analyzed',
			value: evaluation.stats.callsAnalyzed,
			subtitle: `of ${evaluation.stats.totalCalls}`,
		},
		{
			key: 'averageScore',
			title: 'Average Score',
			value: evaluation.stats.averageScore,
			subtitle: (
				<Progress value={evaluation.stats.averageScore} size='sm' color='green' />
			),
		},
		{
			key: 'passRate',
			title: 'Pass Rate',
			value: `${evaluation.stats.passRate}%`,
			subtitle: 'Calls scoring ≥80%',
		},
	];

	return (
		<ContentContainer
			contentWidth='full'
			title={
				<Breadcrumbs>
					<Anchor onClick={() => navigate('/role-preview/qa-campaigns')} size='sm'>
						Campaigns
					</Anchor>
					<Anchor
						onClick={() => navigate(`/role-preview/qa-campaigns/${campaign.id}`)}
						size='sm'
					>
						{campaign.groupLabel}
					</Anchor>
					<Anchor component='span' size='sm' fw={600}>
						{evaluation.title}
					</Anchor>
				</Breadcrumbs>
			}
			description={`Evaluation results for ${campaign.groupLabel}`}
			titleRight={
				<Flex gap='sm' align='center'>
					<TextInput type='date' size='sm' />
					<Text size='sm' c='dimmed'>
						to
					</Text>
					<TextInput type='date' size='sm' />
					<Anchor size='sm' style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
						<IconDownload size={14} />
						Export
					</Anchor>
				</Flex>
			}
		>
			<Stack gap='md'>
				<DemoStatRow stats={stats} />

				<div>
					<Text fw={600}>Evaluations</Text>
					<Text size='sm' c='dimmed'>
						Individual call evaluations for this contact list
					</Text>
				</div>

				<Flex gap='sm' wrap='wrap' align='center'>
					<TextInput
						placeholder='Search by filename or agent...'
						leftSection={<IconSearch size={16} />}
						value={search}
						onChange={(e) => setSearch(e.currentTarget.value)}
						style={{ flex: 1, minWidth: 220 }}
					/>
					<Select
						data={[
							{ value: 'newest', label: 'Newest First' },
							{ value: 'oldest', label: 'Oldest First' },
						]}
						value={sort}
						onChange={setSort}
						w={160}
					/>
					<Select
						data={[
							{ value: 'all', label: 'All Scores' },
							{ value: 'pass', label: 'Pass (≥80)' },
							{ value: 'fail', label: 'Fail (<80)' },
						]}
						value={scoreFilter}
						onChange={setScoreFilter}
						w={160}
					/>
					<Select
						data={['10 per page', '25 per page', '50 per page']}
						defaultValue='10 per page'
						w={160}
					/>
				</Flex>

				<Text size='xs' c='dimmed'>
					Showing {filteredCalls.length} of {evaluation.calls.length} calls
				</Text>

				<BaseTable
					data={filteredCalls}
					columns={columns}
					onRowClick={(call) =>
						navigate(`/role-preview/qa-campaigns/${campaign.id}/${evaluation.id}/${call.id}`)
					}
					density='compact'
					filterMode='client'
					enablePagination
					showPaginationControls
					emptyMessage='No calls found'
				/>
			</Stack>
		</ContentContainer>
	);
};

export default DemoEvaluationDetailPage;
